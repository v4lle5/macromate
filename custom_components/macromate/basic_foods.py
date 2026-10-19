"""Small public reference catalogue; independent of profiles and online consent."""

from types import MappingProxyType

from .basic_food_data import FOODS

BASIC_FOODS = MappingProxyType({row["food_id"]: row for row in FOODS})
ATTRIBUTION = MappingProxyType(
    {
        "name": "USDA FoodData Central",
        "url": "https://fdc.nal.usda.gov/",
        "text": "Reference foods: USDA FoodData Central, SR Legacy April 2018 — CC0 1.0.",
        "license": "CC0-1.0",
        "license_url": "https://creativecommons.org/publicdomain/zero/1.0/",
    }
)


def search_aliases(food_id: str) -> str:
    """Aliases are discovery hints only, never private profile information."""
    return BASIC_FOODS.get(food_id, {}).get("aliases", "")
