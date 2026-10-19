"""Private diary command model, shared by WebSocket and HA actions."""

from __future__ import annotations

import math
from contextvars import ContextVar
from dataclasses import asdict
from datetime import date, datetime, time
from uuid import uuid4
from zoneinfo import ZoneInfo

import voluptuous as vol
from homeassistant.util import dt as dt_util

from .food_provider import (
    ATTRIBUTION,
    OpenFoodFactsProvider,
    ProviderConsentRequired,
    ProviderRateLimited,
    ProviderUnavailable,
)
from .foods import NUTRIENT_UNITS, FoodProduct, validate_barcode
from .models import MEAL_TYPES, NUTRIENTS, MealEntry
from .platform_support import Actor, require_nutrition

COMMAND_ACTOR: ContextVar[Actor | None] = ContextVar("macromate_diary_actor", default=None)


_TEXT = vol.All(str, vol.Length(min=1, max=300))
_ID = vol.All(str, vol.Length(min=1, max=128))


def _number(value):
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or not 0 <= value <= 100000
    ):
        raise vol.Invalid("number must be finite and within 0..100000")
    return float(value)


def _day(value):
    if not isinstance(value, str):
        raise ValueError("date must be YYYY-MM-DD")
    parsed = date.fromisoformat(value)
    if parsed.isoformat() != value:
        raise ValueError("date must be YYYY-MM-DD")
    return parsed


class DiaryCommands:
    def today(self):
        return dt_util.utcnow().astimezone(ZoneInfo(self.hass.config.time_zone)).date()

    def _entry_time(self, payload):
        if "eaten_at" in payload:
            parsed = dt_util.parse_datetime(payload["eaten_at"])
            if parsed is None or parsed.tzinfo is None:
                raise ValueError("eaten_at must be an ISO timestamp with timezone")
            if "date" in payload and parsed.astimezone(
                ZoneInfo(self.hass.config.time_zone)
            ).date() != _day(payload["date"]):
                raise ValueError("date conflicts with eaten_at")
            return parsed
        if "date" in payload:
            return datetime.combine(
                _day(payload["date"]), time(12), ZoneInfo(self.hass.config.time_zone)
            )
        return dt_util.utcnow()

    def _food(self, food_id, state=None):
        foods = self.foods if state is None else state["foods"]
        value = {
            **foods[food_id],
            "favorite": (self.favorites if state is None else state["favorites"]).get(food_id),
        }
        return FoodProduct.from_dict(value)

    def _online_provider(self):
        if self.settings.get("enable_food_database") is not True:
            raise PermissionError("online food database consent required")
        provider = getattr(self, "_provider", None)
        if provider is None:
            from homeassistant.helpers.aiohttp_client import async_get_clientsession

            shared = self.hass.data.setdefault("macromate_provider", {})
            provider = shared.get("provider")
            if provider is None:
                provider = shared["provider"] = OpenFoodFactsProvider(
                    async_get_clientsession(self.hass), enabled=True
                )
            self._provider = provider
        provider.set_enabled(True)
        return provider

    async def _cache_foods(self, foods):
        def apply_cache(state):
            for food in foods:
                state["foods"][food.food_id] = food.to_dict()
            return {"cached": [food.food_id for food in foods]}

        await self._transact("cache_foods", {}, None, apply_cache)

    async def _online_foods(self, value, *, barcode=False):
        """Keep local search usable when the optional provider cannot answer."""
        if self.settings.get("enable_food_database") is not True:
            return [], ["provider_consent_required"]
        try:
            provider = self._online_provider()
            if barcode:
                food = await provider.async_lookup_barcode(value)
                return [food] if food is not None else [], []
            return await provider.async_search(value, submitted=True), []
        except ProviderConsentRequired:
            return [], ["provider_consent_required"]
        except ProviderRateLimited:
            return [], ["provider_rate_limited"]
        except (ProviderUnavailable, TimeoutError):
            return [], ["provider_unavailable"]

    @staticmethod
    def _entry_result(item):
        return {"entry_id": item.id, "entry": item.to_service_dict()}

    @staticmethod
    def _totals(entries):
        totals = {key: 0.0 for key in NUTRIENTS}
        missing = set()
        for item in entries:
            nutrition = (
                item.nutrients
                if item.nutrients is not None
                else {key: getattr(item, key) for key in NUTRIENTS}
            )
            for key, number in nutrition.items():
                totals[key] = totals.get(key, 0.0) + number
            missing.update(set(NUTRIENT_UNITS) - set(nutrition))
        return {key: round(number, 4) for key, number in totals.items()}, sorted(missing)

    def diary_data(self, requested=None):
        day = self.today() if requested is None else _day(requested)
        summary = self.log.summary_for_date(day, self.hass.config.time_zone)
        totals, missing = self._totals(summary.entries)
        meals = {}
        for meal in MEAL_TYPES:
            entries = [item for item in summary.entries if item.meal_type == meal]
            meal_totals, meal_missing = self._totals(entries)
            meals[meal] = {
                "entries": [item.to_service_dict() for item in entries],
                "totals": meal_totals,
                "nutrition_missing": meal_missing,
            }
        current = self.recommendation() if day == self.today() else None
        recommendation = (
            (asdict(current) if current is not None else None)
            if day == self.today()
            else self.daily_goals.get(day.isoformat())
        )
        if recommendation is not None:
            recommendation = dict(recommendation)
            if "fallback_reasons" in recommendation:
                recommendation["fallback_reasons"] = list(recommendation["fallback_reasons"])
            recommendation["calorie_balance"] = (
                recommendation["calorie_target"] - totals["calories"]
            )
        return {
            "date": day.isoformat(),
            "today": self.today().isoformat(),
            "entries": [item.to_service_dict() for item in summary.entries],
            "totals": totals,
            "meals": meals,
            "recommendation": recommendation,
            "goal_status": (
                recommendation.get("goal_status", "active")
                if recommendation
                else ("profile_required" if day == self.today() else "historical_goal_unknown")
            ),
            "nutrition_missing": missing,
            "nutrient_units": dict(NUTRIENT_UNITS),
            "enable_food_database": self.settings.get("enable_food_database", False),
        }

    async def async_command(self, action, payload, *, actor: Actor | None = None):
        token = COMMAND_ACTOR.set(
            actor if actor is not None else Actor(None, trusted_internal=True)
        )
        try:
            return await self._diary_command(action, payload, actor=actor)
        finally:
            COMMAND_ACTOR.reset(token)

    async def _diary_command(self, action, payload, *, actor: Actor | None = None):
        # Native transports supply their server-derived identity. Existing
        # in-process automation calls retain their previous trusted execution.
        actor = actor if actor is not None else Actor(None, trusted_internal=True)
        require_nutrition(actor)
        schemas = {
            "diary": {vol.Optional("date"): str},
            "log_meal": {
                vol.Required("name"): vol.All(str, vol.Length(min=1, max=120)),
                vol.Required("meal_type"): vol.In(MEAL_TYPES),
                vol.Required("calories"): _number,
                vol.Optional("protein"): _number,
                vol.Optional("carbs"): _number,
                vol.Optional("fat"): _number,
                vol.Optional("eaten_at"): str,
                vol.Optional("date"): str,
                vol.Optional("request_id"): _ID,
            },
            "update_meal": {
                vol.Required("entry_id"): _ID,
                vol.Optional("name"): vol.All(str, vol.Length(min=1, max=120)),
                vol.Optional("meal_type"): vol.In(MEAL_TYPES),
                vol.Optional("calories"): _number,
                vol.Optional("protein"): vol.Any(None, _number),
                vol.Optional("carbs"): vol.Any(None, _number),
                vol.Optional("fat"): vol.Any(None, _number),
                vol.Optional("eaten_at"): str,
                vol.Optional("request_id"): _ID,
            },
            "delete_meal": {
                vol.Required("entry_id"): _ID,
                vol.Optional("request_id"): _ID,
            },
            "copy_meal": {
                vol.Required("entry_id"): _ID,
                vol.Required("date"): str,
                vol.Optional("meal_type"): vol.In(MEAL_TYPES),
                vol.Optional("request_id"): _ID,
            },
            "clear_day": {
                vol.Required("date"): str,
                vol.Required("confirm"): True,
                vol.Optional("request_id"): _ID,
            },
            "food": {vol.Required("food_id"): _ID},
            "search_foods": {
                vol.Optional("query", default=""): vol.All(str, vol.Length(max=200)),
                vol.Optional("filter", default="all"): vol.In(
                    ("all", "favorites", "recent", "custom")
                ),
                vol.Optional("online", default=False): bool,
            },
            "barcode": {
                vol.Required("barcode"): str,
                vol.Optional("online", default=False): bool,
            },
            "favorite": {
                vol.Required("food_id"): _ID,
                vol.Required("enabled"): bool,
                vol.Optional("amount"): _number,
                vol.Optional("serving_id"): _TEXT,
                vol.Optional("quantity"): _number,
                vol.Optional("request_id"): _ID,
            },
            "save_food": {vol.Required("food"): dict, vol.Optional("request_id"): _ID},
            "log_food": {
                vol.Required("food_id"): _ID,
                vol.Optional("amount"): _number,
                vol.Optional("serving_id"): _TEXT,
                vol.Optional("quantity"): _number,
                vol.Required("meal_type"): vol.In(MEAL_TYPES),
                vol.Optional("eaten_at"): str,
                vol.Optional("date"): str,
                vol.Optional("request_id"): _ID,
            },
            "update_food_entry": {
                vol.Required("entry_id"): _ID,
                vol.Optional("amount"): _number,
                vol.Optional("serving_id"): _TEXT,
                vol.Optional("quantity"): _number,
                vol.Optional("meal_type"): vol.In(MEAL_TYPES),
                vol.Optional("request_id"): _ID,
            },
        }
        if action not in schemas:
            raise ValueError("unknown MacroMate action")
        try:
            values = vol.Schema(schemas[action])(payload)
        except vol.Invalid as err:
            raise ValueError("invalid action fields") from err
        if action == "diary":
            return self.diary_data(values.get("date"))
        if action == "food":
            return {"food": self._food(values["food_id"]).to_dict()}
        if action in ("search_foods", "barcode"):
            source = "local"
            warnings = []
            if action == "barcode":
                barcode = validate_barcode(values["barcode"])
                foods = [
                    self._food(fid)
                    for fid, food in self.foods.items()
                    if barcode in food.get("barcodes", [])
                ]
                if not foods and values["online"]:
                    foods, warnings = await self._online_foods(barcode, barcode=True)
                    if foods:
                        await self._cache_foods(foods)
                    if not warnings:
                        source = "Open Food Facts"
            else:
                query = values["query"].casefold()
                words = query.split()
                foods = [self._food(fid) for fid in self.foods]
                foods = [
                    food
                    for food in foods
                    if all(
                        word
                        in " ".join((food.name, food.producer or "", *food.barcodes)).casefold()
                        for word in words
                    )
                ]
                selected = values["filter"]
                if selected == "favorites":
                    foods = [food for food in foods if food.is_favorite]
                elif selected == "custom":
                    foods = [food for food in foods if food.is_custom]
                elif selected == "recent":
                    order = dict.fromkeys(
                        item.food_id for item in reversed(self.log.entries) if item.food_id
                    )
                    foods = sorted(
                        (food for food in foods if food.food_id in order),
                        key=lambda food: list(order).index(food.food_id),
                    )
                if values["online"] and selected == "all" and values["query"]:
                    remote, warnings = await self._online_foods(values["query"])
                    if remote:
                        await self._cache_foods(remote)
                    merged = {food.food_id: food for food in foods}
                    for food in remote:
                        merged[food.food_id] = self._food(food.food_id)
                    foods = list(merged.values())
                    if not warnings:
                        source = "local + Open Food Facts"
            has_more = len(foods) > 100
            foods = foods[:100]
            attribution = (
                dict(ATTRIBUTION)
                if any(food.source == "open_food_facts" for food in foods)
                else None
            )
            return {
                "foods": [food.to_dict() for food in foods],
                "source": source,
                "has_more": has_more,
                "warnings": warnings,
                "attribution": attribution["text"] if attribution else None,
                "attribution_details": attribution,
            }
        request_id = values.pop("request_id", None)
        if action == "log_meal":

            def apply_quick(state):
                item = MealEntry(
                    id=uuid4().hex,
                    name=values["name"].strip(),
                    meal_type=values["meal_type"],
                    **{key: values.get(key, 0) for key in NUTRIENTS},
                    eaten_at=self._entry_time(values),
                    nutrients={key: values[key] for key in NUTRIENTS if key in values},
                )
                state["entries"].append(item.to_dict())
                return self._entry_result(item)

            return await self._transact(action, values, request_id, apply_quick)
        if action == "update_meal":
            changes = {key: value for key, value in values.items() if key != "entry_id"}
            if not changes:
                raise ValueError("at least one changed field is required")
            if "eaten_at" in changes:
                changes["eaten_at"] = self._entry_time(changes).isoformat()
            item = await self.async_update(values["entry_id"], changes, request_id)
            return self._entry_result(item)
        if action == "delete_meal":
            await self.async_remove(values["entry_id"], request_id)
            return {"deleted_entry_id": values["entry_id"]}
        if action == "clear_day":
            _day(values["date"])
            removed = await self.async_clear_date(values["date"], request_id)
            return {"removed": removed}
        if action == "copy_meal":

            def apply_copy(state):
                original = next(
                    (row for row in state["entries"] if row["id"] == values["entry_id"]),
                    None,
                )
                if original is None:
                    raise KeyError(values["entry_id"])
                copy = MealEntry.from_dict(
                    {
                        **original,
                        "id": uuid4().hex,
                        "eaten_at": self._entry_time({"date": values["date"]}).isoformat(),
                        "meal_type": values.get("meal_type", original["meal_type"]),
                    }
                )
                state["entries"].append(copy.to_dict())
                return self._entry_result(copy)

            return await self._transact(action, values, request_id, apply_copy)
        if action == "favorite":

            def apply(state):
                food = self._food(values["food_id"], state).with_favorite(
                    values["enabled"],
                    values.get("amount"),
                    serving_id=values.get("serving_id"),
                    quantity=values.get("quantity"),
                )
                if food.favorite is None:
                    state["favorites"].pop(food.food_id, None)
                else:
                    state["favorites"][food.food_id] = dict(food.favorite)
                return {"food": food.to_dict()}

            return await self._transact(action, values, request_id, apply)
        if action == "save_food":

            def apply(state):
                raw = values["food"]
                permitted = {
                    "food_id",
                    "name",
                    "producer",
                    "base_unit",
                    "nutrients_per_100",
                    "servings",
                    "barcodes",
                }
                if set(raw) - permitted:
                    raise ValueError("custom food contains unsupported fields")
                if raw.get("food_id") is not None and (
                    raw["food_id"] not in state["foods"]
                    or state["foods"][raw["food_id"]]["source"] != "local"
                ):
                    raise ValueError(
                        "only existing local foods may be edited; create a separate local copy"
                    )
                product = FoodProduct.from_dict({**raw, "source": "local"})
                wire = product.to_dict()
                state["foods"][product.food_id] = wire
                # A changed serving must not corrupt an existing favorite template.
                state["favorites"].pop(product.food_id, None)
                return {"food": wire}

            return await self._transact(action, values, request_id, apply)
        if action == "log_food":

            def apply(state):
                food = self._food(values["food_id"], state)
                amount = food.portion_amount(
                    values.get("amount"),
                    serving_id=values.get("serving_id"),
                    quantity=values.get("quantity"),
                )
                nutrition = food.scaled(amount)
                if "calories" not in nutrition:
                    raise ValueError(
                        "food has no declared calories; complete a local food before logging"
                    )
                item = MealEntry(
                    id=uuid4().hex,
                    name=food.name,
                    meal_type=values["meal_type"],
                    **{key: nutrition.get(key, 0) for key in NUTRIENTS},
                    eaten_at=self._entry_time(values),
                    food_id=food.food_id,
                    amount=amount,
                    base_unit=food.base_unit,
                    serving_id=values.get("serving_id"),
                    quantity=values.get("quantity"),
                    nutrients=nutrition,
                    food_snapshot=food.to_dict(),
                )
                state["entries"].append(item.to_dict())
                return self._entry_result(item)

            return await self._transact(action, values, request_id, apply)
        if action == "update_food_entry":

            def apply(state):
                original = next(
                    (row for row in state["entries"] if row["id"] == values["entry_id"]),
                    None,
                )
                if original is None:
                    raise KeyError(values["entry_id"])
                if not original.get("food_snapshot"):
                    raise ValueError("entry is not a food entry")
                food = FoodProduct.from_dict(original["food_snapshot"])
                has_portion = any(key in values for key in ("amount", "serving_id", "quantity"))
                amount = (
                    food.portion_amount(
                        values.get("amount"),
                        serving_id=values.get("serving_id"),
                        quantity=values.get("quantity"),
                    )
                    if has_portion
                    else original["amount"]
                )
                nutrition = food.scaled(amount)
                replacement = MealEntry.from_dict(
                    {
                        **original,
                        **{key: nutrition.get(key, 0) for key in NUTRIENTS},
                        "nutrients": nutrition,
                        "amount": amount,
                        "serving_id": (
                            values.get("serving_id") if has_portion else original.get("serving_id")
                        ),
                        "quantity": (
                            values.get("quantity") if has_portion else original.get("quantity")
                        ),
                        "meal_type": values.get("meal_type", original["meal_type"]),
                    }
                )
                state["entries"] = [
                    replacement.to_dict() if row["id"] == replacement.id else row
                    for row in state["entries"]
                ]
                return self._entry_result(replacement)

            return await self._transact(action, values, request_id, apply)
        raise ValueError("unknown MacroMate action")
