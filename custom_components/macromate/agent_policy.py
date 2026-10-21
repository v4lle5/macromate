"""Pure scoped discovery policy; native command descriptors stay unchanged."""

from __future__ import annotations

from copy import deepcopy

ACTION_SCOPES = {
    "profiles_list": {"diary.read"},
    "nutrition_report": {"diary.read"},
    "recipes_get": {"recipes.read"},
    "recipes_get_all": {"recipes.read"},
    "recipes_search": {"recipes.read"},
    "tags_get_all": {"recipes.read"},
    "recipes_add": {"recipes.create"},
    "recipes_update": {"recipes.update", "recipes.read"},
    "recipes_set_favourite": {"recipes.update", "recipes.read"},
    # Native deletion cascades to plan entries, so both opt-ins are mandatory.
    "recipes_delete": {"recipes.delete", "mealplan.delete"},
    "meal_plan_get": {"mealplan.read"},
    "meal_plan_add": {"mealplan.create", "recipes.read"},
    "meal_plan_update": {"mealplan.update", "mealplan.read", "recipes.read"},
    "meal_plan_remove": {"mealplan.delete"},
    "diary": {"diary.read"},
    "log_meal": {"diary.create"},
    "copy_meal": {"diary.create", "diary.read"},
    "update_meal": {"diary.update", "diary.read"},
    "recipe_log": {"diary.create", "recipes.read"},
    "recipe_entry_update": {"diary.update", "diary.read", "recipes.read"},
    "delete_meal": {"diary.delete"},
}


def scoped_descriptors(scopes, actions):
    """Describe only requests the independent scoped HTTP boundary can accept."""
    result = {}
    scopes = set(scopes)
    for action, required in ACTION_SCOPES.items():
        if not required <= scopes:
            continue
        descriptor = deepcopy(actions[action])
        # The issuing administrator is resolved by the server, never supplied
        # by this client. Discovery describes the scoped credential's grants.
        descriptor.pop("admin_only", None)
        descriptor["required_scopes"] = sorted(required)
        schema = descriptor["schema"]
        if not descriptor["read_only"]:
            if "request_id" not in schema["required"]:
                schema["required"].append("request_id")
            # The boundary hashes/namespaces the ID before native validation;
            # expose its actual input contract, not the native ID character set.
            schema["properties"]["request_id"] = {
                "type": "string",
                "minLength": 1,
                "maxLength": 128,
                # Explicit Python str.strip whitespace keeps JSON Schema's
                # ECMAScript regex semantics consistent with the HTTP check.
                "pattern": (
                    r"^[^\x00-\x1f]*"
                    r"[^ \x00-\x1f\u0085\u00a0\u1680\u2000-\u200a"
                    r"\u2028\u2029\u202f\u205f\u3000]"
                    r"[^\x00-\x1f]*(?![\s\S])"
                ),
                "description": "Stable ID for this mutation; retain it on uncertain outcomes.",
            }
        if "download_image" in schema["properties"]:
            schema["properties"]["download_image"] = {"type": "boolean", "const": False}
        result[action] = descriptor
    return result
