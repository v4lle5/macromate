"""Named nutrition profiles with explicit ownership and one atomic root Store."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import asdict, replace
from datetime import date
from uuid import uuid4

from .platform_support import can_access, identifier, require_admin, validate_payload
from .profile import normalize_settings

MAX_PROFILES = 32
DATA_KEYS = frozenset({"entries", "ledger", "foods", "favorites", "daily_goals"})
NUTRITION_COMMANDS = frozenset(
    {
        "diary",
        "log_meal",
        "update_meal",
        "delete_meal",
        "clear_day",
        "copy_meal",
        "food",
        "search_foods",
        "barcode",
        "favorite",
        "save_food",
        "log_food",
        "update_food_entry",
        "food_delete",
        "recipe_log",
        "recipe_entry_update",
        "nutrition_report",
    }
)
PROFILE_ACTIONS = frozenset(
    {
        "profiles_list",
        "profiles_get",
        "profiles_users",
        "profiles_create",
        "profiles_update",
        "profiles_delete",
    }
)


def descriptors(descriptor, id_schema):
    fields = {
        "name": {"type": "string", "minLength": 1, "maxLength": 80},
        "owner_id": id_schema,
        "allowed_users": {"type": "array", "maxItems": 16, "uniqueItems": True, "items": id_schema},
        "settings": {"type": "object"},
    }
    return {
        "profiles_list": descriptor(
            "List only accessible nutrition profiles.", read=True, admin=False
        ),
        "profiles_users": descriptor(
            "List active Home Assistant users for administrator-managed profile sharing.", read=True
        ),
        "profiles_get": descriptor(
            "Read an accessible nutrition profile configuration.",
            {"profile_id": id_schema},
            ["profile_id"],
            read=True,
            admin=False,
        ),
        "profiles_create": descriptor(
            "Create a separate nutrition profile without moving the existing diary.",
            fields,
            ["name", "settings", "request_id"],
        ),
        "profiles_update": descriptor(
            "Update a profile; only administrators may change its ownership or sharing.",
            {"profile_id": id_schema, **fields},
            ["profile_id", "request_id"],
            admin=False,
        ),
        "profiles_delete": descriptor(
            "Delete one named profile after explicit confirmation.",
            {"profile_id": id_schema, "confirm": {"const": True}},
            ["profile_id", "confirm", "request_id"],
        ),
    }


def validate_profiles(profiles):
    if not isinstance(profiles, dict) or len(profiles) > MAX_PROFILES:
        raise ValueError("invalid nutrition profile collection")
    from .coordinator import MealTrackerCoordinator

    for key, row in profiles.items():
        identifier(key, "profile_id")
        if (
            key == "default"
            or not isinstance(row, dict)
            or set(row) != {"id", "name", "owner_id", "allowed_users", "settings", "data"}
        ):
            raise ValueError("invalid nutrition profile")
        identifier(row["owner_id"], "owner_id")
        if (
            row["id"] != key
            or not isinstance(row["name"], str)
            or not row["name"].strip()
            or len(row["name"]) > 80
        ):
            raise ValueError("invalid nutrition profile identity")
        if (
            not isinstance(row["allowed_users"], list)
            or len(row["allowed_users"]) > 16
            or any(not isinstance(user, str) for user in row["allowed_users"])
            or len(set(row["allowed_users"])) != len(row["allowed_users"])
        ):
            raise ValueError("invalid nutrition profile sharing")
        for user in row["allowed_users"]:
            identifier(user, "allowed_users")
        if (
            not isinstance(row["settings"], dict)
            or not isinstance(row["data"], dict)
            or set(row["data"]) != DATA_KEYS
        ):
            raise ValueError("invalid nutrition profile data")
        normalize_settings(row["settings"], date.today())
        # The same nutrition decoder validates every partition. No nested profiles.
        MealTrackerCoordinator._decode_state({"schema": 3, **row["data"]})
    return profiles


def metadata(row, *, settings=False):
    keys = ("id", "name", "owner_id", "allowed_users") + (("settings",) if settings else ())
    return {key: deepcopy(row[key]) for key in keys}


def _row(coord, profile_id, actor):
    row = coord.profiles.get(profile_id)
    if row is None or not can_access(row, actor):
        raise KeyError("nutrition profile not found")
    return row


async def profile_command(coord, action, payload, actor):
    from .platform_api import ACTIONS

    values = validate_payload(payload, ACTIONS[action]["schema"])
    if not (actor.user_id or actor.trusted_internal):
        raise PermissionError("authenticated actor required")
    if action == "profiles_users":
        require_admin(actor)
        return {
            "users": [
                {"id": user.id, "name": user.name}
                for user in await coord.hass.auth.async_get_users()
                if user.is_active and not user.system_generated
            ]
        }
    if action == "profiles_list":
        rows = [metadata(row) for row in coord.profiles.values() if can_access(row, actor)]
        if actor.is_admin or actor.trusted_internal:
            rows.insert(
                0, {"id": "default", "name": "Default", "owner_id": None, "allowed_users": []}
            )
        return {"profiles": rows, "can_create": actor.is_admin or actor.trusted_internal}
    if action == "profiles_get":
        return {"profile": metadata(_row(coord, values["profile_id"], actor), settings=True)}
    if action in ("profiles_create", "profiles_delete"):
        require_admin(actor)
    if action == "profiles_update":
        current = _row(coord, values["profile_id"], actor)
        if not (actor.is_admin or actor.trusted_internal or current["owner_id"] == actor.user_id):
            raise PermissionError("profile owner required")
        if "owner_id" in values or "allowed_users" in values:
            require_admin(actor)
    if "settings" in values:
        permitted = {
            "profile_version",
            "profile_complete",
            "formula_sex",
            "birthday",
            "height_cm",
            "weight_kg",
            "target_weight_kg",
            "goal",
            "weekly_pace_kg",
            "activity_level",
            "macro_plan",
            "weight_entity",
            "bmr_entity",
            "active_calories_entity",
            "enable_food_database",
        }
        if set(values["settings"]) - permitted:
            raise ValueError("unknown profile setting")
        from .config_flow import _validated

        values["settings"] = _validated(coord.hass, values["settings"])
        from .coordinator import MealTrackerCoordinator

        recommendation = MealTrackerCoordinator(coord.hass, values["settings"]).recommendation()
        goal = asdict(recommendation) if recommendation is not None else None
        if goal is not None:
            goal["fallback_reasons"] = list(goal["fallback_reasons"])
    else:
        goal = None
    owner = values.get("owner_id", actor.user_id)
    for user_id in set([owner, *values.get("allowed_users", [])]) - {None}:
        user = await coord.hass.auth.async_get_user(user_id)
        if user is None or not user.is_active or user.system_generated:
            raise ValueError("select an active Home Assistant user")

    def apply(state):
        profiles = state.setdefault("profiles", {})
        previous_users = set()
        if action == "profiles_create":
            if len(profiles) >= MAX_PROFILES or not owner:
                raise ValueError("profile capacity or owner invalid")
            key = uuid4().hex
            profiles[key] = {
                "id": key,
                "name": values["name"].strip(),
                "owner_id": owner,
                "allowed_users": values.get("allowed_users", []),
                "settings": values["settings"],
                "data": {
                    "entries": [],
                    "ledger": [],
                    "foods": {},
                    "favorites": {},
                    "daily_goals": {},
                },
            }
        else:
            key = values["profile_id"]
            row = profiles.get(key)
            if row is None or not can_access(row, actor):
                raise KeyError("nutrition profile not found")
            previous_users.update([row["owner_id"], *row["allowed_users"]])
            if action == "profiles_delete":
                del profiles[key]
                return {
                    "deleted_profile_id": key,
                    "_event_users": [row["owner_id"], *row["allowed_users"]],
                }
            if not (actor.is_admin or actor.trusted_internal or row["owner_id"] == actor.user_id):
                raise PermissionError("profile owner required")
            for field in ("name", "owner_id", "allowed_users", "settings"):
                if field in values:
                    row[field] = values[field].strip() if field == "name" else values[field]
        row = profiles[key]
        if goal is not None:
            row["data"]["daily_goals"][coord.today().isoformat()] = goal
        return {
            "profile": metadata(row, settings=True),
            "_event_users": sorted(previous_users | {row["owner_id"], *row["allowed_users"]}),
        }

    def guard(state):
        if action != "profiles_create":
            row = state.get("profiles", {}).get(values["profile_id"])
            if row is None or not can_access(row, actor):
                # Replayed deletion remains valid only for administrators.
                if action == "profiles_delete":
                    require_admin(actor)
                else:
                    raise KeyError("nutrition profile not found")

    return await coord._transact(
        action, values, f"profiles:{actor.owner_id}:{values['request_id']}", apply, guard=guard
    )


def profile_view(parent, profile_id, actor):
    """A disposable view; its writes rebase under the parent's transaction lock."""
    from .coordinator import MealTrackerCoordinator

    class ProfileStore:
        @property
        def _read_only(self):
            return getattr(parent._store, "_read_only", False)

        async def async_save(self, staged):
            root = await parent.hass.async_add_executor_job(parent._state)
            row = root["profiles"][profile_id]
            row["data"] = {key: staged[key] for key in DATA_KEYS}
            await parent.hass.async_add_executor_job(parent._decode_state, root)
            await parent._store.async_save(root)
            parent.profiles = root["profiles"]

    class ProfileCoordinator(MealTrackerCoordinator):
        def rebase(self):
            row = _row(parent, profile_id, actor)
            self.settings = deepcopy(row["settings"])
            self._adopt({"schema": 3, **row["data"]})
            self.kitchen = parent.kitchen

        async def _transact(self, *args, **kwargs):
            async with parent._lock:
                self.rebase()
                result = await super()._transact(*args, **kwargs)
                row = _row(parent, profile_id, actor)
                from .const import EVENT_UPDATED

                parent.hass.bus.async_fire(
                    EVENT_UPDATED,
                    {"event": "refresh", "users": [row["owner_id"], *row["allowed_users"]]},
                )
                return result

    view = ProfileCoordinator(parent.hass, {})
    view._store = ProfileStore()
    view.rebase()
    return view


async def profile_dispatch(coord, action, payload, actor):
    if action not in NUTRITION_COMMANDS:
        raise ValueError("profile_id is supported only for nutrition commands")
    profile_id = identifier(payload["profile_id"], "profile_id")
    if profile_id == "default":
        require_admin(actor)
        return await coord.async_command(
            action,
            {key: value for key, value in payload.items() if key != "profile_id"},
            actor=actor,
        )
    if action == "recipe_log" and not (actor.is_admin or actor.trusted_internal):
        raise PermissionError("recipe library access requires an administrator")
    async with coord._lock:
        view = profile_view(coord, profile_id, actor)
    values = {key: value for key, value in payload.items() if key != "profile_id"}
    delegated = replace(actor, nutrition_profile_id=profile_id)
    if action == "nutrition_report":
        from .analytics import nutrition_report

        result = await coord.hass.async_add_executor_job(nutrition_report, view, values)
    else:
        result = await super(type(view), view).async_command(action, values, actor=delegated)
    _row(coord, profile_id, actor)  # Recheck after provider/network awaits.
    return result
