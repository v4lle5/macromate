"""Shared weight-source eligibility for setup and live recommendations."""

from datetime import date, timedelta

from .profile import bounded_number
from .recommendation import energy_to_kcal, weight_to_kg

# Weight is not daily active energy. Keep up to one week of actual readings.
WEIGHT_MAX_AGE = timedelta(days=7)


def current_weight_kg(state, now):
    """Return a finite kg reading, never a restored, stale or future value."""
    if state is None or state.attributes.get("restored") is True:
        return None
    try:
        age = now - state.last_updated
        if not timedelta(0) <= age <= WEIGHT_MAX_AGE:
            return None
        measured = state.attributes.get("measurement_date", state.attributes.get("date"))
        if measured is not None:
            measured_date = date.fromisoformat(str(measured)[:10])
            if not 0 <= (now.date() - measured_date).days <= WEIGHT_MAX_AGE.days:
                return None
        return bounded_number(
            "weight_kg",
            weight_to_kg(float(state.state), state.attributes.get("unit_of_measurement")),
            30,
            350,
        )
    except (ValueError, TypeError, OverflowError, AttributeError):
        return None


def current_bmr_kcal(state, now):
    """Reject restored, future and old basal-energy readings just like weight."""
    if state is None or state.attributes.get("restored") is True:
        return None
    try:
        if not timedelta(0) <= now - state.last_updated <= WEIGHT_MAX_AGE:
            return None
        measured = state.attributes.get("measurement_date", state.attributes.get("date"))
        if (
            measured is not None
            and not 0 <= (now.date() - date.fromisoformat(str(measured)[:10])).days <= 7
        ):
            return None
        return bounded_number(
            "bmr",
            energy_to_kcal(float(state.state), state.attributes.get("unit_of_measurement")),
            500,
            5000,
        )
    except (ValueError, TypeError, OverflowError, AttributeError):
        return None
