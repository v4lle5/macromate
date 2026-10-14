"""Timezone helpers with explicit DST behavior."""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo


def localize_wall_time(value: datetime, timezone_name: str) -> datetime:
    """Attach a zone to an unambiguous, existent local wall time.

    Offset-aware values are returned unchanged. Naive values during a DST gap or
    fold are rejected instead of silently becoming a different instant.
    """
    if value.tzinfo is not None:
        return value
    zone = ZoneInfo(timezone_name)
    valid: list[datetime] = []
    for fold in (0, 1):
        candidate = value.replace(tzinfo=zone, fold=fold)
        roundtrip = candidate.astimezone(timezone.utc).astimezone(zone).replace(tzinfo=None)
        if roundtrip == value:
            valid.append(candidate)
    if not valid:
        raise ValueError("nonexistent local datetime during DST transition")
    offsets = {candidate.utcoffset() for candidate in valid}
    if len(offsets) > 1:
        raise ValueError("ambiguous local datetime during DST transition; include an offset")
    return valid[0]
