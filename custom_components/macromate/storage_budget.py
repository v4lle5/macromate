"""Finite root budget with a narrowly classified restore-receipt reserve.

Accounting uses the same UTF-8 JSON spelling as platform_support.validate_json
(ensure_ascii=False and default separators). Ordinary data, INCLUDING ordinary
operation history, always shares the original 64 MiB budget. Only canonical,
small administrative restore receipts are removed from the charged projection;
they remain in the very same root, atomic Store and backup.
"""

from __future__ import annotations

import json
import re
from typing import Any

from .platform_support import validate_json

MAX_DATA_BYTES = 64 * 1024 * 1024
MAX_RESTORE_RECEIPT_BYTES = 4 * 1024
MAX_RESTORE_RECEIPTS = 1000  # Existing OperationLedger FIFO retention, not extra entries.
MAX_RESTORE_METADATA_BYTES = 4 * 1024 * 1024
MAX_STORAGE_BYTES = MAX_DATA_BYTES + MAX_RESTORE_METADATA_BYTES
MAX_TRANSFER_BYTES = MAX_STORAGE_BYTES + 8192

# A scoped ID is at most 128 actor characters + ':' + 128 request characters.
# In ensure_ascii=False JSON each Unicode scalar occupies at most six UTF-8
# bytes (escaped C0 controls); lone surrogates fail validate_json. The fixed
# record syntax includes two quotes around the ID. Thus replacing the empty
# ID by 257 worst-case characters is a conservative per-record upper bound.
_RECEIPT_SKELETON = {
    "request_id": "",
    "operation": "platform_restore",
    "payload_hash": "0" * 64,
    "result": {"__result": {"restored": True, "schema_version": 3}, "__access": []},
}
MAX_CANONICAL_RECEIPT_BYTES = (
    len(json.dumps(_RECEIPT_SKELETON, ensure_ascii=False).encode("utf-8")) + 257 * 6
)
# Removing a receipt removes at most its record bytes + the ', ' delimiter.
# Empty/full-ledger boundary removes two fewer delimiter bytes, never more.
assert MAX_CANONICAL_RECEIPT_BYTES <= MAX_RESTORE_RECEIPT_BYTES
assert MAX_RESTORE_RECEIPTS * (MAX_RESTORE_RECEIPT_BYTES + 2) <= MAX_RESTORE_METADATA_BYTES


def _scoped_id(value: Any) -> bool:
    if not isinstance(value, str) or not 3 <= len(value) <= 257:
        return False
    # IDs may themselves contain colons; accept only a possible bounded split.
    return any(
        1 <= index <= 128
        and 1 <= len(value) - index - 1 <= 128
        and value[:index].strip()
        and value[index + 1 :].strip()
        and not any(ord(char) < 32 for char in value[index + 1 :])
        for index, char in enumerate(value)
        if char == ":"
    )


def _is_restore_receipt(row: Any) -> bool:
    """Recognize exact bounded metadata, never operation-name-only exemptions."""
    if not isinstance(row, dict) or set(row) != set(_RECEIPT_SKELETON):
        return False
    if row["operation"] != "platform_restore" or not _scoped_id(row["request_id"]):
        return False
    digest = row["payload_hash"]
    if not isinstance(digest, str) or re.fullmatch(r"[0-9a-f]{64}", digest) is None:
        return False
    result = row["result"]
    if not isinstance(result, dict) or set(result) != {"__result", "__access"}:
        return False
    public = result["__result"]
    if (
        not isinstance(public, dict)
        or set(public) != {"restored", "schema_version"}
        or public["restored"] is not True
        or type(public["schema_version"]) is not int
        or public["schema_version"] != 3
        or result["__access"] != []
    ):
        return False
    return (
        len(json.dumps(row, ensure_ascii=False, allow_nan=False).encode("utf-8"))
        <= MAX_RESTORE_RECEIPT_BYTES
    )


def validate_storage_root(value: Any) -> dict[str, Any]:
    """Return defensive root JSON after total, charged and receipt-count checks.

    Root nesting stays 32, independently of any transfer envelope. This is the
    budget/JSON gate; callers still perform complete domain-schema validation.
    Unrecognized restore-like rows are ordinary charged data, not free metadata.
    Reject over-retention input rather than silently trimming imported history.
    """
    root = validate_json(value, max_bytes=MAX_STORAGE_BYTES)
    if not isinstance(root, dict):
        raise ValueError("storage root must be a JSON object")
    ledger = root.get("ledger", [])
    if not isinstance(ledger, list) or len(ledger) > MAX_RESTORE_RECEIPTS:
        raise ValueError("storage operation ledger exceeds retention limit")
    charged_ledger = [row for row in ledger if not _is_restore_receipt(row)]
    charged = {**root, "ledger": charged_ledger} if "ledger" in root else root
    if (
        len(json.dumps(charged, ensure_ascii=False, allow_nan=False).encode("utf-8"))
        > MAX_DATA_BYTES
    ):
        raise ValueError("storage charged dataset exceeds the byte limit")
    return root
