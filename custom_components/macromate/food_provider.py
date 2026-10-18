"""Read-only Open Food Facts mapping; no HA imports or proprietary content.

Official schemas: https://openfoodfacts.github.io/openfoodfacts-server/api/
Product reads use v3.6 (nutrition.aggregated_set introduced in v3.5). Submitted
text search uses the documented legacy CGI; v2 search is NOT a full-text API.
See docs/api/ref/schemas/product_nutrition_v3.yaml and product_nutrition.yaml
in https://github.com/openfoodfacts/openfoodfacts-server.

`value`/legacy `_100g` fields are already normalized to grams for mass, even
when contributor `unit`/`_unit` says mg/ug. Convert those grams into the domain
NUTRIENT_UNITS. Missing values remain absent. Images are neither fetched nor
retained. OFF data is community supplied and is not guaranteed accurate.

Cached/exported records retain source_url and ODbL-1.0 / DbCL-1.0. Callers MUST
show ATTRIBUTION with online and locally cached OFF results. Database reuse is
subject to ODbL attribution/share-alike; individual contents are DbCL licensed.
"""

from __future__ import annotations

import asyncio
import math
import re
import time
from collections import OrderedDict, deque
from collections.abc import Mapping
from types import MappingProxyType
from typing import Any

from .foods import NUTRIENT_UNITS, FoodProduct, _number, validate_barcode

ORIGIN = "https://world.openfoodfacts.org"
ATTRIBUTION = MappingProxyType(
    {
        "name": "Open Food Facts",
        "url": ORIGIN,
        "text": (
            "Food data: Open Food Facts contributors — ODbL 1.0 (database), DbCL 1.0 (contents)."
        ),
        "database_license": "ODbL-1.0",
        "contents_license": "DbCL-1.0",
        "database_license_url": "https://opendatacommons.org/licenses/odbl/1.0/",
        "contents_license_url": "https://opendatacommons.org/licenses/dbcl/1.0/",
    }
)

# Canonical domain name -> OFF nutrient name. OFF mass values are grams.
OFF_NUTRIENTS = {
    key: key.replace("_", "-") for key in NUTRIENT_UNITS if key not in ("alcohol", "water")
}
OFF_NUTRIENTS.update(
    {
        "calories": "energy-kcal",
        "protein": "proteins",
        "carbs": "carbohydrates",
        "sugar": "sugars",
        "added_sugar": "added-sugars",
        "vitamin_b11": "folates",
        "vitamin_b3": "vitamin-pp",
        "vitamin_b5": "pantothenic-acid",
        "vitamin_b7": "vitamin-b7",
    }
)


def _off_number(value: Any) -> float:
    # Numeric strings occur in legacy records; never parse qualifiers or units.
    if isinstance(value, str):
        if not re.fullmatch(r"[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?", value, flags=re.ASCII):
            raise ValueError("invalid provider nutrient")
        value = float(value)
    return _number("provider nutrient", value)


def _canonical_value(canonical: str, value: Any) -> float:
    factor = {"mg": 1000, "ug": 1_000_000}.get(NUTRIENT_UNITS[canonical], 1)
    return _number("provider nutrient", _off_number(value) * factor)


def _v3_nutrition(value: Mapping[str, Any]) -> tuple[str, dict[str, float]]:
    data = value["nutrition"]["aggregated_set"]
    if (
        not isinstance(data, Mapping)
        or data.get("preparation") != "as_sold"
        or data.get("per") not in ("100g", "100ml")
    ):
        raise ValueError("unsupported provider nutrition basis")
    raw = data["nutrients"]
    if not isinstance(raw, Mapping):
        raise ValueError("invalid provider nutrients")
    base_unit = "ml" if data["per"] == "100ml" else "g"

    def declared(off_name: str) -> Any:
        entry = raw.get(off_name)
        if entry is None:
            return None
        if not isinstance(entry, Mapping):
            raise ValueError("invalid provider nutrient")
        if entry.get("modifier") or entry.get("source") == "estimate":
            return None
        # unit describes input, not value; normalized value always g for mass.
        allowed = (
            (None, "kcal", "kJ", "kj")
            if off_name.startswith("energy-")
            else (None, "g", "mg", "ug", "µg", "μg", "mcg", "kg")
        )
        if entry.get("unit") not in allowed:
            return None
        return entry.get("value")  # explicitly NOT value_computed

    nutrients = {}
    for canonical, off_name in OFF_NUTRIENTS.items():
        number = declared(off_name)
        if number is not None:
            nutrients[canonical] = _canonical_value(canonical, number)
    if "calories" not in nutrients:
        kj = declared("energy-kj")
        if kj is not None:
            nutrients["calories"] = _off_number(kj) / 4.184
    return base_unit, nutrients


def _legacy_nutrition(value: Mapping[str, Any]) -> tuple[str, dict[str, float]]:
    # Legacy CGI lacks an explicit 100ml basis. Do not silently equate ml and g:
    # skip known volume products until fetched through the v3.6 barcode API.
    if value.get("nutrition_data_per", "100g") not in ("100g", "serving"):
        raise ValueError("unsupported provider nutrition basis")
    if value.get("product_quantity_unit") in ("ml", "cl", "l") or value.get(
        "serving_quantity_unit"
    ) in ("ml", "cl", "l"):
        raise ValueError("legacy volume basis is ambiguous")
    raw = value.get("nutriments", {})
    if not isinstance(raw, Mapping):
        raise ValueError("invalid provider nutrients")
    if value.get("no_nutrition_data") == "on":
        return "g", {}
    nutrients = {}
    for canonical, off_name in OFF_NUTRIENTS.items():
        number = raw.get(off_name + "_100g")
        if number is not None and not raw.get(off_name + "_modifier"):
            if raw.get(off_name + "_unit") in ("iu", "IU", "%", "% dv", "dv"):
                continue
            nutrients[canonical] = _canonical_value(canonical, number)
    if (
        "calories" not in nutrients
        and raw.get("energy-kj_100g") is not None
        and not raw.get("energy-kj_modifier")
    ):
        nutrients["calories"] = _off_number(raw["energy-kj_100g"]) / 4.184
    return "g", nutrients


def _servings(value: Mapping[str, Any], base_unit: str) -> list[dict[str, Any]]:
    label = value.get("serving_size")
    if not isinstance(label, str) or len(label) > 300:
        return []
    # Accept an exact measure or a human label ending in one exact measure.
    # Reject negative/qualified/comma/alternative/multiplicative quantities.
    measure = r"([0-9]+(?:\.[0-9]+)?)\s*(g|ml)"
    match = re.fullmatch(measure, label.strip(), flags=re.ASCII)
    if match is None:
        match = re.fullmatch(r"[^()<>~]*\(\s*" + measure + r"\s*\)", label.strip(), flags=re.ASCII)
    if match is None or match[2] != base_unit:
        return []
    quantity, unit = match.groups()
    try:
        amount = _off_number(quantity)
        if amount <= 0 or value.get("serving_quantity_unit", unit) != unit:
            return []
        if "serving_quantity" in value and not math.isclose(
            _off_number(value["serving_quantity"]), amount, rel_tol=1e-9
        ):
            return []
    except ValueError:
        return []
    return [{"serving_id": "off-serving", "label": label, "amount": amount}]


def map_open_food_facts_product(
    value: Mapping[str, Any], *, expected_barcode: str | None = None
) -> FoodProduct:
    """Validate OFF product JSON and map declared, as-sold nutrition only.

    Unknown nutrient names are ignored for forward compatibility. Invalid known
    numbers reject the product. Qualifiers, estimates, IU/daily-values and only
    computed values are unknown, not fabricated exact totals.
    """
    try:
        if not isinstance(value, Mapping):
            raise ValueError("invalid product")
        code = validate_barcode(value["code"])
        if expected_barcode is not None and code != validate_barcode(expected_barcode):
            raise ValueError("provider returned a different barcode")
        base_unit, nutrients = (
            _v3_nutrition(value) if "nutrition" in value else _legacy_nutrition(value)
        )
        return FoodProduct.from_dict(
            {
                "food_id": "off:" + code,
                "name": value["product_name"],
                "producer": value.get("brands") or None,
                "base_unit": base_unit,
                "nutrients_per_100": nutrients,
                "barcodes": [code],
                "servings": _servings(value, base_unit),
                "source": "open_food_facts",
                "source_url": ORIGIN + "/product/" + code,
                "license": "ODbL-1.0 / DbCL-1.0",
            }
        )
    except (ValueError, KeyError, TypeError, OverflowError):
        raise ValueError("invalid or unsupported Open Food Facts product") from None


class ProviderUnavailable(Exception):
    """Sanitized provider failures; callers map to provider_unavailable."""


class ProviderConsentRequired(ProviderUnavailable):
    """Online access is disabled (default); no request was sent."""


class ProviderRateLimited(ProviderUnavailable):
    """Local quota/cooldown blocked a request; no retry is scheduled."""


FIELDS = (
    "code,product_name,brands,nutrition,nutriments,nutrition_data_per,"
    "no_nutrition_data,serving_size,serving_quantity,"
    "serving_quantity_unit,product_quantity_unit"
)
USER_AGENT = "MacroMate/0.4 (https://github.com/v4lle5/macromate)"


class OpenFoodFactsProvider:
    """Caller-owned aiohttp session; fixed HTTPS origin, GET only, no redirects.

    Construct with HA's shared aiohttp client session. Enabling this provider
    consents to sending explicitly requested food search terms/barcodes to OFF,
    not diary/profile data. It never writes products and requires no login.
    Quotas are per instance: 15 product / 10 search requests per rolling minute,
    including failed requests. Share ONE instance; other apps behind the same
    public IP still share OFF's upstream quota. No automatic sleeps or retries.
    Cache: 128 LRU records; product 1h, search/miss 5min. Memory only.
    """

    def __init__(self, session: Any, *, enabled: bool = False, monotonic=time.monotonic):
        self._session = session
        self._clock = monotonic
        self._cache: OrderedDict[tuple, tuple[float, Any]] = OrderedDict()
        self._lock = asyncio.Lock()
        self._requests = {"product": deque(), "search": deque()}
        self._cooldown_until = 0.0
        self.set_enabled(enabled)

    def set_enabled(self, enabled: bool) -> None:
        if not isinstance(enabled, bool):
            raise ValueError("enabled must be boolean")
        self._enabled = enabled
        if not enabled:
            self._cache.clear()

    @property
    def attribution(self) -> dict[str, str]:
        return dict(ATTRIBUTION)

    def _require_consent(self) -> None:
        if not self._enabled:
            raise ProviderConsentRequired("Open Food Facts access is disabled")

    async def _get_json(
        self, path: str, params: Mapping[str, str], *, allow_not_found: bool = False
    ) -> dict[str, Any] | None:
        import asyncio
        import json

        import aiohttp

        def finite_float(text: str) -> float:
            number = float(text)
            if not math.isfinite(number):
                raise ValueError("nonfinite JSON")
            return number

        def invalid_constant(text: str) -> Any:
            raise ValueError("invalid JSON constant")

        try:
            async with asyncio.timeout(10):
                async with self._session.get(
                    ORIGIN + path,
                    params=dict(params),
                    headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
                    allow_redirects=False,
                    timeout=aiohttp.ClientTimeout(total=10, connect=5, sock_read=5),
                ) as response:
                    if response.status == 404 and allow_not_found:
                        return None
                    if response.status == 429:
                        retry_after = response.headers.get("Retry-After", "60")
                        delay = (
                            min(3600, max(60, int(retry_after)))
                            if re.fullmatch(r"[0-9]{1,9}", retry_after)
                            else 3600
                        )
                        self._cooldown_until = self._clock() + delay
                    if response.status != 200:
                        raise ValueError("provider HTTP failure")
                    content_type = (
                        response.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
                    )
                    if content_type != "application/json" and not content_type.endswith("+json"):
                        raise ValueError("provider content type")
                    length = response.headers.get("Content-Length")
                    if length is not None and (
                        not length.isascii() or not length.isdigit() or int(length) > 1_048_576
                    ):
                        raise ValueError("provider response size")
                    body = bytearray()
                    async for chunk in response.content.iter_chunked(16384):
                        if len(body) + len(chunk) > 1_048_576:
                            raise ValueError("provider response size")
                        body.extend(chunk)
                    data = json.loads(
                        body.decode("utf-8"),
                        parse_float=finite_float,
                        parse_constant=invalid_constant,
                    )
                    if not isinstance(data, dict):
                        raise ValueError("provider JSON object required")
                    return data
        except (
            aiohttp.ClientError,
            TimeoutError,
            OSError,
            ValueError,
            UnicodeError,
            RecursionError,
            OverflowError,
        ):
            raise ProviderUnavailable("Open Food Facts request failed") from None

    async def _cached(self, kind: str, key: tuple, load: Any) -> Any:
        async with self._lock:
            self._require_consent()
            cache_key = (kind, *key)
            cached = self._cache.get(cache_key)
            if cached is not None and cached[0] > self._clock():
                self._cache.move_to_end(cache_key)
                return cached[1]
            now = self._clock()
            if now < self._cooldown_until:
                raise ProviderRateLimited("Open Food Facts is temporarily rate limited")
            requests = self._requests[kind]
            while requests and requests[0] <= now - 60:
                requests.popleft()
            if len(requests) >= (15 if kind == "product" else 10):
                raise ProviderRateLimited("Open Food Facts request quota reached")
            requests.append(now)
            result = await load()
            self._require_consent()  # consent can be revoked while awaiting I/O
            ttl = 3600 if kind == "product" and result is not None else 300
            self._cache[cache_key] = (self._clock() + ttl, result)
            self._cache.move_to_end(cache_key)
            while len(self._cache) > 128:
                self._cache.popitem(last=False)
            return result

    async def async_search(
        self, query: str, *, submitted: bool = False, limit: int = 20
    ) -> list[FoodProduct]:
        """Explicitly submitted text only. One page, no paging/retries/hydration.

        Uses legacy CGI, not deprecated v2 structured search. Malformed products
        are skipped; exact unnormalized barcodes are deduplicated. Results may
        contain unknown nutrients. The remote `count` is not an accepted total.
        """
        self._require_consent()
        if submitted is not True:
            raise ValueError("online search must be explicitly submitted")
        if (
            not isinstance(query, str)
            or not query.strip()
            or len(query) > 200
            or any(ord(char) < 32 for char in query)
        ):
            raise ValueError("query must be nonempty text of at most 200 characters")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 20:
            raise ValueError("limit must be an integer from 1 to 20")
        return list(
            await self._cached("search", (query, limit), lambda: self._search(query, limit))
        )

    async def _search(self, query: str, limit: int) -> tuple[FoodProduct, ...]:
        data = await self._get_json(
            "/cgi/search.pl",
            {
                "search_terms": query,
                "action": "process",
                "json": "1",
                "page_size": str(limit),
                "page": "1",
                "fields": FIELDS,
            },
        )
        if data is None or not isinstance(data.get("products"), list):
            raise ProviderUnavailable("Open Food Facts returned invalid search results") from None
        results = {}
        # Bound CPU/memory even if the remote disregards page_size.
        for row in data["products"][:100]:
            try:
                food = map_open_food_facts_product(row)
            except ValueError:
                continue
            results.setdefault(food.food_id, food)
            if len(results) >= limit:
                break
        return tuple(results.values())

    async def async_lookup_barcode(self, barcode: str) -> FoodProduct | None:
        self._require_consent()
        code = validate_barcode(barcode)
        return await self._cached("product", (code,), lambda: self._lookup(code))

    async def _lookup(self, code: str) -> FoodProduct | None:
        data = await self._get_json(
            "/api/v3.6/product/" + code, {"fields": FIELDS}, allow_not_found=True
        )
        if data is None:
            return None
        try:
            if data.get("status") not in ("success", "success_with_warnings"):
                raise ValueError("provider status")
            return map_open_food_facts_product(data["product"], expected_barcode=code)
        except (ValueError, KeyError, TypeError):
            raise ProviderUnavailable("Open Food Facts returned an invalid product") from None
