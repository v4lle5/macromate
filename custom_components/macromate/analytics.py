"""Bounded calendar reports over captured nutrition and dated goals."""

from calendar import monthrange
from datetime import date, timedelta

from .models import NUTRIENTS
from .platform_support import validate_payload


def nutrition_report(coord, payload):
    from .platform_api import ACTIONS

    values = validate_payload(payload, ACTIONS["nutrition_report"]["schema"])
    selected = date.fromisoformat(values.get("date", coord.today().isoformat()))
    period = values.get("period", "week")
    if period == "week":
        start = selected - timedelta(days=selected.weekday())
        count = 7
    else:
        start = selected.replace(day=1)
        count = monthrange(selected.year, selected.month)[1]
    if (date.max - start).days < count - 1:
        raise ValueError("report range exceeds the supported calendar")
    days = []
    totals = {key: 0.0 for key in NUTRIENTS}
    incomplete = {key: 0 for key in NUTRIENTS}
    logged_days = 0
    for offset in range(count):
        day = start + timedelta(days=offset)
        diary = coord.diary_data(day.isoformat())
        logged = bool(diary["entries"])
        logged_days += logged
        for key in NUTRIENTS:
            totals[key] += diary["totals"][key]
            incomplete[key] += key in diary["nutrition_missing"]
        recommendation = diary["recommendation"]
        days.append(
            {
                "date": day.isoformat(),
                "entry_count": len(diary["entries"]),
                "totals": diary["totals"],
                "nutrition_missing": diary["nutrition_missing"],
                "calorie_target": recommendation["calorie_target"] if recommendation else None,
                "weight_kg": recommendation.get("weight_kg") if recommendation else None,
                "future": day > coord.today(),
            }
        )
    totals = {key: round(value, 4) for key, value in totals.items()}
    return {
        "period": period,
        "start": start.isoformat(),
        "end": days[-1]["date"],
        "days": days,
        "logged_days": logged_days,
        "totals_known": totals,
        "incomplete_days": incomplete,
        "average_per_logged_day": {
            key: round(value / logged_days, 1) if logged_days else None
            for key, value in totals.items()
        },
        "missing_log_policy": (
            "Days without entries are not included in averages; unrecorded intake is unknown."
        ),
    }
