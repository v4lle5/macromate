"""Constants for MacroMate."""

DOMAIN = "macromate"
PLATFORMS = ["sensor"]
STORE_KEY = f"{DOMAIN}.meals"
STORE_VERSION = 1
EVENT_UPDATED = f"{DOMAIN}_updated"

CONF_WEIGHT_ENTITY = "weight_entity"
CONF_ACTIVE_CALORIES_ENTITY = "active_calories_entity"
CONF_BMR_ENTITY = "bmr_entity"
CONF_KCAL_PER_KG = "kcal_per_kg"
CONF_CALORIE_ADJUSTMENT = "calorie_adjustment"
CONF_PROTEIN_PER_KG = "protein_per_kg"
CONF_FAT_PER_KG = "fat_per_kg"

DEFAULT_KCAL_PER_KG = 22.0
DEFAULT_CALORIE_ADJUSTMENT = 0.0
DEFAULT_PROTEIN_PER_KG = 1.6
DEFAULT_FAT_PER_KG = 0.8
