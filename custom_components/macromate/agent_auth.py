"""Integration-local opaque credentials. Never registered with HA authentication."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import re
import secrets
import time
from copy import deepcopy

from .storage import DurableStore

DEFAULT_SCOPES = frozenset(
    f"{domain}.{verb}"
    for domain in ("recipes", "mealplan", "diary")
    for verb in ("read", "create", "update")
)
ALL_SCOPES = DEFAULT_SCOPES | {"recipes.delete", "mealplan.delete", "diary.delete"}
TOKEN_PATTERN = re.compile(r"^mm1\.([0-9a-f]{32})\.([A-Za-z0-9_-]{43})$")
MAX_CREDENTIALS = 100


async def settle(task):
    """Join durable writes even when their HTTP caller disconnects/cancels."""
    cancelled = False
    while not task.done():
        try:
            await asyncio.shield(task)
        except asyncio.CancelledError:
            cancelled = True
    result = task.result()
    if cancelled:
        raise asyncio.CancelledError
    return result


class AgentCredentials:
    """One lock orders authorization, command completion, mint and revocation."""

    def __init__(self, hass):
        self.hass = hass
        self.store = DurableStore(
            hass, 1, "macromate.agent_credentials", private=True, atomic_writes=True
        )
        self.lock = asyncio.Lock()
        self.rows = {}
        self.rate = {}

    async def async_load(self):
        data = await self.store.async_load()
        if data is None:
            return
        if (
            not isinstance(data, dict)
            or set(data) != {"credentials"}
            or not isinstance(data["credentials"], dict)
        ):
            raise ValueError("Invalid agent credential Store")
        if len(data["credentials"]) > MAX_CREDENTIALS:
            raise ValueError("Invalid agent credential Store")
        for key, row in data["credentials"].items():
            if not re.fullmatch("[0-9a-f]{32}", key) or not isinstance(row, dict):
                raise ValueError("Invalid agent credential Store")
            if set(row) != {
                "id",
                "user_id",
                "label",
                "scopes",
                "salt",
                "verifier",
                "created_at",
                "expires_at",
                "revoked",
            }:
                raise ValueError("Invalid agent credential Store")
            if row["id"] != key or not isinstance(row["user_id"], str) or not row["user_id"]:
                raise ValueError("Invalid agent credential Store")
            if not isinstance(row["scopes"], list) or any(
                not isinstance(s, str) or s not in ALL_SCOPES for s in row["scopes"]
            ):
                raise ValueError("Invalid agent credential Store")
            if (
                not isinstance(row["label"], str)
                or len(row["label"]) > 100
                or type(row["revoked"]) is not bool
            ):
                raise ValueError("Invalid agent credential Store")
            if not isinstance(row["salt"], str) or not re.fullmatch("[0-9a-f]{64}", row["salt"]):
                raise ValueError("Invalid agent credential Store")
            if not isinstance(row["verifier"], str) or not re.fullmatch(
                "[0-9a-f]{64}", row["verifier"]
            ):
                raise ValueError("Invalid agent credential Store")
            if type(row["created_at"]) is not int or (
                row["expires_at"] is not None and type(row["expires_at"]) is not int
            ):
                raise ValueError("Invalid agent credential Store")
        self.rows = deepcopy(data["credentials"])

    async def _save(self, rows):
        async def commit():
            await self.store.async_save({"credentials": rows})
            self.rows = rows

        await settle(asyncio.create_task(commit()))

    @staticmethod
    def metadata(row):
        return {
            key: deepcopy(row[key])
            for key in ("id", "user_id", "label", "scopes", "created_at", "expires_at", "revoked")
        }

    async def mint(self, user_id, payload):
        if not isinstance(payload, dict) or set(payload) - {"label", "scopes", "expires_at"}:
            raise ValueError("Invalid credential request")
        label = payload.get("label")
        scopes = payload.get("scopes", sorted(DEFAULT_SCOPES))
        expires = payload.get("expires_at")
        if (
            not isinstance(label, str)
            or not 1 <= len(label.strip()) <= 100
            or any(ord(c) < 32 for c in label)
        ):
            raise ValueError("Invalid label")
        if (
            not isinstance(scopes, list)
            or not scopes
            or any(not isinstance(s, str) or s not in ALL_SCOPES for s in scopes)
            or len(set(scopes)) != len(scopes)
        ):
            raise ValueError("Invalid scopes")
        if expires is not None and (
            type(expires) is not int or not time.time() < expires <= time.time() + 366 * 86400
        ):
            raise ValueError("Invalid expiry")
        if len(self.rows) >= MAX_CREDENTIALS:
            raise ValueError("Credential limit reached")
        key = secrets.token_hex(16)
        token = f"mm1.{key}.{secrets.token_urlsafe(32)}"
        salt = secrets.token_hex(32)
        row = dict(
            id=key,
            user_id=user_id,
            label=label,
            scopes=sorted(scopes),
            salt=salt,
            verifier=hmac.new(bytes.fromhex(salt), token.encode(), hashlib.sha256).hexdigest(),
            created_at=int(time.time()),
            expires_at=expires,
            revoked=False,
        )
        rows = deepcopy(self.rows)
        rows[key] = row
        await self._save(rows)
        return {**self.metadata(row), "token": token}

    async def revoke(self, key):
        if key not in self.rows:
            raise KeyError(key)
        rows = deepcopy(self.rows)
        rows[key]["revoked"] = True
        await self._save(rows)
        self.rate.pop(key, None)
        return self.metadata(rows[key])

    async def async_remove(self):
        """Finish admitted commands, then erase durable and in-memory delegation."""
        async with self.lock:

            async def remove():
                await self.store.async_remove()
                self.rows.clear()
                self.rate.clear()

            await settle(asyncio.create_task(remove()))

    async def authenticate(self, token):
        match = TOKEN_PATTERN.fullmatch(token)
        row = self.rows.get(match[1]) if match else None
        # Equal-length cryptographic verifier comparison; invalid IDs still do HMAC.
        salt = row["salt"] if row else "0" * 64
        candidate = hmac.new(bytes.fromhex(salt), token.encode(), hashlib.sha256).hexdigest()
        verified = hmac.compare_digest(candidate, row["verifier"] if row else "0" * 64)
        if (
            not verified
            or row is None
            or row["revoked"]
            or row["expires_at"] is not None
            and row["expires_at"] <= time.time()
        ):
            raise PermissionError("Invalid credential")
        user = await self.hass.auth.async_get_user(row["user_id"])
        # Existing recipe/plan/diary are explicitly global administrator domains.
        # Delegation expires immediately when its issuing admin loses that role.
        if user is None or not user.is_active or not user.is_admin or user.system_generated:
            raise PermissionError("Invalid credential")
        return row

    def charge(self, key):
        now = time.monotonic()
        start, count = self.rate.get(key, (now, 0))
        if now - start >= 60:
            start, count = now, 0
        if count >= 60:
            raise OverflowError("Rate limit")
        self.rate[key] = (start, count + 1)
