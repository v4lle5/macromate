"""Executable pure recipe, planner and timer contracts."""

from __future__ import annotations

import importlib
import importlib.util
import json
import unittest
from copy import deepcopy

from custom_components.macromate.platform_support import Actor, empty_kitchen

NOW = "2026-10-14T12:00:00+00:00"
ADMIN = Actor("admin", is_admin=True)
MEMBER = Actor("member")


def kitchen():
    return empty_kitchen()


class RecipeTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(
            importlib.util.find_spec("custom_components.macromate.recipes"),
            "pure recipe domain is missing",
        )
        self.domain = importlib.import_module("custom_components.macromate.recipes")
        self.state = kitchen()

    def call(self, action, payload=None, *, actor=ADMIN, now=NOW):
        return self.domain.recipe_command(self.state, action, payload or {}, actor, now)

    def test_create_and_read_preserve_complete_recipe_metadata(self):
        data = {
            "name": "Soup",
            "ingredients": [
                {"name": "Base", "is_heading": True},
                {"name": "Milk", "amount": "1/2", "unit": "cup", "notes": "cold"},
            ],
            "instructions": ["Stir", "Simmer"],
            "tags": ["easy"],
            "courses": ["Dinner"],
            "categories": ["Vegetarian"],
            "collections": ["Winter"],
            "source_url": "https://example.org/soup",
            "description": "Family soup",
            "image_url": "media:main",
            "photos": ["media:extra"],
            "cuisine": "French",
            "category": "Soup",
            "prep_time": 5,
            "cook_time": 20,
            "total_time": 25,
            "servings": 2.5,
            "servings_text": "2 bowls",
            "nutrition": {"calories": "123 kcal"},
            "declared_nutrition": {"calories": 123, "protein": None},
            "nutrition_basis": "per_serving",
            "nutrition_provenance": {"source": "label"},
            "rating": 5,
            "notes": "Keep chilled",
            "is_favourite": True,
            "metadata": {"original": {"author": "Ada"}},
            "request_id": "create-1",
        }
        original = deepcopy(data)
        recipe = self.call("recipes_add", data)["recipe"]
        for key, value in data.items():
            if key != "request_id":
                self.assertEqual(recipe[key], value, key)
        self.assertTrue(recipe["id"])
        self.assertEqual(recipe["created_at"], NOW)
        self.assertEqual(recipe["updated_at"], NOW)
        self.assertNotIn("request_id", recipe)
        self.assertEqual(self.call("recipes_get", {"recipe_id": recipe["id"]})["recipe"], recipe)
        self.assertEqual(self.call("recipes_get_all")["recipes"], [recipe])
        recipe["ingredients"][1]["name"] = "Changed"
        self.assertEqual(self.state["recipes"][recipe["id"]]["ingredients"][1]["name"], "Milk")
        self.assertEqual(data, original)
        json.dumps(self.state, allow_nan=False)

    def test_recipe_schemas_and_runtime_reject_malformed_fields_atomically(self):
        invalid = {
            "name": [None, "", " "],
            "ingredients": [
                [{}],
                [{"name": "x", "amount": True}],
                [{"name": "x", "is_heading": 1}],
                [{"name": "x", "unknown": 1}],
            ],
            "instructions": [[3]],
            "tags": [[None]],
            "courses": ["Dinner"],
            "categories": [[False]],
            "collections": [[{}]],
            "source_url": [3],
            "description": [{}],
            "image_url": [False],
            "photos": [[None]],
            "cuisine": [4],
            "category": [[]],
            "prep_time": [-1, True, "5"],
            "cook_time": [-1],
            "total_time": [float("inf")],
            "servings": [0, -1, True],
            "servings_text": [3],
            "nutrition": [[], {"calories": float("nan")}],
            "declared_nutrition": [
                {"calories": -1},
                {"protein": "20 g"},
                {"fat": True},
                {"calories": float("inf")},
                {"made_up": 1},
            ],
            "nutrition_basis": ["per_100g"],
            "nutrition_provenance": [[], {"bad": object()}],
            "rating": [0, 6, "high", True],
            "notes": [3],
            "is_favourite": [1],
            "metadata": [[], {"a": float("nan")}],
            "request_id": ["", 4],
            "owner_id": ["attacker"],
            "actor": [{}],
            "download_image": ["yes"],
        }
        for field, values in invalid.items():
            for value in values:
                with self.subTest(field=field, value=value):
                    before = deepcopy(self.state)
                    with self.assertRaises(ValueError):
                        self.call("recipes_add", {"name": "Valid", field: value})
                    self.assertEqual(self.state, before)
        descriptor = self.domain.RECIPE_ACTIONS["recipes_add"]
        self.assertFalse(descriptor["schema"]["additionalProperties"])
        self.assertEqual(descriptor["schema"]["required"], ["name"])
        self.assertIn("declared_nutrition", descriptor["schema"]["properties"])
        self.assertIn("request_id", descriptor["schema"]["properties"])
        with self.assertRaises(ValueError):
            self.call("recipes_add", {})
        with self.assertRaises(ValueError):
            self.call("recipes_add", {"name": "x" * 301})
        with self.assertRaises(ValueError):
            self.call("recipes_get_all", {"unexpected": True})

    def test_unknown_nutrition_defaults_are_not_zero_and_null_is_preserved(self):
        recipe = self.call("recipes_add", {"name": "Unknown"})["recipe"]
        self.assertEqual(recipe["nutrition_basis"], "unknown")
        self.assertIsNone(recipe["nutrition"])
        self.assertIsNone(recipe["declared_nutrition"])
        self.assertIsNone(recipe["servings"])
        self.assertEqual(recipe["photos"], [])
        zero = self.call(
            "recipes_add",
            {
                "name": "Zero",
                "declared_nutrition": {"calories": 0},
                "nutrition_basis": "per_recipe",
            },
        )["recipe"]
        self.assertEqual(zero["declared_nutrition"], {"calories": 0})

    def test_authorization_is_explicit_admin_only_even_for_reads_and_missing_targets(self):
        for action in self.domain.RECIPE_ACTIONS:
            with self.subTest(action=action):
                before = deepcopy(self.state)
                with self.assertRaises(PermissionError):
                    self.call(action, actor=MEMBER)
                self.assertEqual(self.state, before)
                with self.assertRaises(PermissionError):
                    self.domain.recipe_authorize(self.state, action, {}, MEMBER, allow_missing=True)
        with self.assertRaises(KeyError):
            self.domain.recipe_authorize(self.state, "recipes_get", {"recipe_id": "missing"}, ADMIN)
        self.domain.recipe_authorize(
            self.state, "recipes_get", {"recipe_id": "missing"}, ADMIN, allow_missing=True
        )
        internal = Actor(None, trusted_internal=True)
        self.assertEqual(self.call("recipes_get_all", actor=internal), {"recipes": []})

    def test_recipe_update_favourite_rating_search_taxonomy_and_delete(self):
        first = self.call(
            "recipes_add",
            {
                "name": "Milk Soup",
                "tags": ["warm", "easy"],
                "courses": ["Dinner"],
                "categories": ["French"],
                "collections": ["Winter"],
                "notes": "old",
                "nutrition": {"calories": "unknown"},
            },
        )["recipe"]
        other = self.call("recipes_add", {"name": "Apple", "tags": ["easy"]})["recipe"]
        later = "2026-10-14T13:00:00+00:00"
        updated = self.call(
            "recipes_update",
            {
                "recipe_id": first["id"],
                "rating": 4,
                "notes": None,
                "declared_nutrition": {"calories": 0},
            },
            now=later,
        )["recipe"]
        self.assertEqual(updated["created_at"], NOW)
        self.assertEqual(updated["updated_at"], later)
        self.assertEqual(updated["nutrition"], first["nutrition"])
        self.assertIsNone(updated["notes"])
        for action in ("recipes_set_favourite", "recipes_toggle_favourite"):
            for _ in range(2):
                result = self.call(action, {"recipe_id": first["id"], "is_favourite": True})
                self.assertTrue(result["recipe"]["is_favourite"])
        result = self.call(
            "recipes_search",
            {
                "query": "MILK",
                "is_favourite": True,
                "tags": ["warm"],
                "courses": ["Dinner"],
                "categories": ["French"],
                "collections": ["Winter"],
                "min_rating": 4,
                "limit": 1,
                "offset": 0,
            },
        )
        self.assertEqual([r["id"] for r in result["recipes"]], [first["id"]])
        self.assertEqual(result["total"], 1)
        self.assertEqual(
            self.call("recipes_get_all", {"sort": "name", "order": "asc"})["recipes"][0]["id"],
            other["id"],
        )
        taxonomy = self.call("tags_get_all")
        self.assertEqual(
            taxonomy,
            {
                "tags": ["easy", "warm"],
                "courses": ["Dinner"],
                "categories": ["French"],
                "collections": ["Winter"],
            },
        )
        toggled = self.call("recipes_toggle_favourite", {"recipe_id": first["id"]})["recipe"]
        self.assertFalse(toggled["is_favourite"])
        deleted = self.call("recipes_delete", {"recipe_id": first["id"]})
        self.assertEqual(deleted["id"], first["id"])
        self.assertTrue(deleted["deleted"])
        self.assertEqual(list(self.state["recipes"]), [other["id"]])
        with self.assertRaises(KeyError):
            self.call("recipes_get", {"recipe_id": first["id"]})
        with self.assertRaises(ValueError):
            self.call("recipes_update", {"recipe_id": other["id"], "id": "overwrite"})
        with self.assertRaises(ValueError):
            self.call("recipes_update", {"recipe_id": other["id"], "rating": 9})

    def test_planning_true_crud_keeps_identity_and_enriches_reads(self):
        recipe = self.call("recipes_add", {"name": "Soup", "image_url": "media:soup"})["recipe"]
        entry = self.call(
            "meal_plan_add",
            {
                "recipe_id": recipe["id"],
                "date": "2026-10-14",
                "meal_type": "dessert",
                "servings": 2.5,
                "notes": "Guests",
            },
        )["entry"]
        later = "2026-10-15T13:00:00+00:00"
        changed = self.call(
            "meal_plan_update",
            {
                "entry_id": entry["id"],
                "date": "2026-10-15",
                "meal_type": "lunch",
                "servings": 1,
                "notes": None,
            },
            now=later,
        )["entry"]
        self.assertEqual(changed["id"], entry["id"])
        self.assertEqual(changed["created_at"], NOW)
        self.assertEqual(changed["updated_at"], later)
        self.assertEqual(changed["recipe_id"], recipe["id"])
        self.assertEqual(changed["date"], "2026-10-15")
        self.assertIsNone(changed["notes"])
        read = self.call("meal_plan_get", {"entry_id": entry["id"]})["entry"]
        self.assertEqual(read["recipe_name"], "Soup")
        self.assertEqual(read["recipe_image"], "media:soup")
        self.assertEqual(
            self.call("meal_plan_get", {"week_start": "2026-10-12"})["entries"], [read]
        )
        self.assertEqual(
            self.call("meal_plan_remove", {"entry_id": entry["id"]})["id"], entry["id"]
        )
        self.assertEqual(self.call("meal_plan_get")["entries"], [])

    def test_planning_dates_week_boundaries_confirmation_and_cascade(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        for day in ("2026-10-11", "2026-10-12", "2026-10-18", "2026-10-19"):
            self.call(
                "meal_plan_add", {"recipe_id": recipe["id"], "date": day, "meal_type": "dinner"}
            )
        before = deepcopy(self.state)
        for bad in ("", "20261012", "2026-02-30", "2026-10-12T00:00:00", "2026-1-2", None):
            with self.subTest(date=bad):
                with self.assertRaises(ValueError):
                    self.call("meal_plan_get", {"week_start": bad})
                with self.assertRaises(ValueError):
                    self.call("meal_plan_clear", {"week_start": bad, "confirm": True})
                with self.assertRaises(ValueError):
                    self.call(
                        "meal_plan_add",
                        {"recipe_id": recipe["id"], "date": bad, "meal_type": "dinner"},
                    )
                self.assertEqual(self.state, before)
        for payload in (
            {},
            {"week_start": "2026-10-12"},
            {"week_start": "2026-10-12", "confirm": False},
        ):
            with self.assertRaises(ValueError):
                self.call("meal_plan_clear", payload)
        cleared = self.call("meal_plan_clear", {"week_start": "2026-10-12", "confirm": True})
        self.assertEqual(cleared["cleared"], 2)
        self.assertEqual(
            sorted(e["date"] for e in self.state["meal_plan"].values()),
            ["2026-10-11", "2026-10-19"],
        )
        self.state["diary"] = {"historic": {"recipe_id": recipe["id"]}}
        self.call("recipes_delete", {"recipe_id": recipe["id"]})
        self.assertEqual(self.state["meal_plan"], {})
        self.assertEqual(self.state["diary"], {"historic": {"recipe_id": recipe["id"]}})

    def test_timer_presets_complete_crud_and_existing_timer_detachment(self):
        preset = self.call("timer_presets_add", {"name": "Egg", "seconds": 180})["preset"]
        self.assertEqual(
            self.call("timer_presets_get", {"preset_id": preset["id"]})["preset"], preset
        )
        changed = self.call(
            "timer_presets_update", {"preset_id": preset["id"], "name": "Soft egg", "seconds": 240}
        )["preset"]
        self.assertEqual(changed["id"], preset["id"])
        self.assertEqual(changed["seconds"], 240)
        self.assertEqual(self.call("timer_presets_get")["presets"], [changed])
        timer = self.call(
            "global_timers_add", {"label": "Egg", "duration": 240, "preset_id": preset["id"]}
        )["timer"]
        self.call("timer_presets_delete", {"preset_id": preset["id"]})
        self.assertEqual(self.call("timer_presets_get")["presets"], [])
        self.assertIsNone(self.state["timers"][timer["id"]]["preset_id"])
        self.assertEqual(self.state["timers"][timer["id"]]["duration"], 240)
        for action, payload in (
            ("timer_presets_add", {"name": "x", "seconds": 0}),
            ("timer_presets_update", {"preset_id": "missing", "seconds": True}),
        ):
            with self.assertRaises(ValueError):
                self.call(action, payload)

    def test_global_timer_pause_resume_add_time_expiry_and_delete(self):
        from datetime import datetime

        epoch = datetime.fromisoformat(NOW).timestamp()
        timer = self.call(
            "global_timers_add", {"label": "Soup", "duration": 120, "start_time": epoch}
        )["timer"]
        self.assertTrue(timer["running"])
        self.assertIsNone(timer["paused_remaining"])
        paused = self.call(
            "global_timers_update",
            {"timer_id": timer["id"], "running": False},
            now="2026-10-14T12:00:30+00:00",
        )["timer"]
        self.assertEqual(paused["paused_remaining"], 90)
        resumed = self.call(
            "global_timers_update",
            {"timer_id": timer["id"], "running": True},
            now="2026-10-14T12:01:00+00:00",
        )["timer"]
        self.assertEqual(resumed["start_time"], epoch + 30)
        self.assertIsNone(resumed["paused_remaining"])
        extended = self.call(
            "global_timers_update",
            {"timer_id": timer["id"], "duration": 180, "label": "Soup pot"},
            now="2026-10-14T12:01:30+00:00",
        )["timer"]
        self.assertEqual(extended["duration"], 180)
        read = self.call(
            "global_timers_get", {"timer_id": timer["id"]}, now="2026-10-14T12:01:30+00:00"
        )["timer"]
        self.assertEqual(read["remaining"], 120)
        self.assertEqual(read["label"], "Soup pot")
        before = deepcopy(self.state)
        expired = self.call("global_timers_get", now="2026-10-14T12:04:00+00:00")["timers"][0]
        self.assertEqual(expired["remaining"], 0)
        self.assertTrue(expired["expired"])
        self.assertEqual(self.state, before, "read must not persist ticks or alarms")
        result = self.call("global_timers_delete", {"timer_id": timer["id"]})
        self.assertEqual(result, {"id": timer["id"], "deleted": True})
        self.assertEqual(self.call("global_timers_get"), {"timers": []})

    def test_network_descriptors_are_discoverable_but_never_fake_results(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        cases = {
            "recipes_scrape": {"url": "https://example.org/soup", "enabled": True},
            "recipes_download_image": {
                "recipe_id": recipe["id"],
                "image_url": "https://example.org/soup.webp",
                "enabled": True,
            },
            "recipes_upload_image": {"recipe_id": recipe["id"], "image_data": "AAAA"},
            "recipe_keeper_import": {"html_content": "<html>Recipe</html>"},
        }
        for action, payload in cases.items():
            with self.subTest(action=action):
                self.assertTrue(self.domain.RECIPE_ACTIONS[action]["network"])
                self.domain.recipe_authorize(self.state, action, payload, ADMIN)
                before = deepcopy(self.state)
                with self.assertRaisesRegex(ValueError, "parent preprocessing"):
                    self.call(action, payload)
                self.assertEqual(self.state, before)
        with self.assertRaisesRegex(ValueError, "parent preprocessing"):
            self.call(
                "recipes_add",
                {"name": "Soup", "download_image": True, "image_url": "https://example.org/a.webp"},
            )
        self.assertEqual(len(self.state["recipes"]), 1)

    def test_info_and_export_preserve_upstream_shapes_and_complete_kitchen(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        plan = self.call(
            "meal_plan_add", {"recipe_id": recipe["id"], "date": "2026-10-14", "meal_type": "snack"}
        )["entry"]
        timer = self.call("global_timers_add", {"label": "Soup", "duration": 20})["timer"]
        self.state["shopping_lists"] = {"list-1": {"id": "list-1"}}
        info = self.call("platform_info")
        self.assertEqual(info["schema_version"], 3)
        self.assertEqual(info["recipe_count"], 1)
        exported = self.call("platform_backup")
        self.assertEqual(exported["version"], 1)
        self.assertEqual(exported["recipes"], [recipe])
        self.assertEqual(exported["meal_plans"], [plan])
        self.assertEqual(exported["timers"], [timer])
        self.assertEqual(exported["kitchen"], self.state)
        exported["kitchen"]["recipes"].clear()
        self.assertEqual(self.state["recipes"], {recipe["id"]: recipe})
        json.dumps(exported, allow_nan=False)

    def test_preprocessed_import_metadata_and_fractional_declarations_are_lossless(self):
        data = {
            "name": "Imported soup",
            "ingredients": [
                {
                    "name": "Milk",
                    "amount": "1/2",
                    "unit": "cup",
                    "notes": None,
                    "raw": "½ cup milk",
                    "amount_fraction": "1/2",
                    "amount_range": ["1/2", "3/4"],
                }
            ],
            "instructions": ["Stir"],
            "instruction_groups": [{"name": "Sauce", "instructions": ["Stir"]}],
            "cuisines": ["French", "Italian"],
            "prep_time": 2.5,
            "cook_time": 5.0,
            "rating": 4.2,
            "nutrition": {"calories": 123.5, "carbohydrates": 10, "sodium": 15},
            "nutrition_raw": {"calories": "123.5 kcal", "sodium": "15 mg", "unknown": "trace"},
            "nutrition_basis": "unknown",
            "provenance": {"source": "web", "parsers": ["json-ld"]},
            "import_metadata": {"author": {"name": "Ada"}, "aggregateRating": "4.2"},
        }
        recipe = self.call("recipes_add", data)["recipe"]
        for key, value in data.items():
            self.assertEqual(recipe[key], value, key)
        self.assertEqual(recipe["nutrition_basis"], "unknown")
        self.assertEqual(recipe["ingredients"][0]["unit"], "cup")
        self.call("recipes_update", {"recipe_id": recipe["id"], "notes": "Kept"})
        stored = self.call("recipes_get", {"recipe_id": recipe["id"]})["recipe"]
        self.assertEqual(stored["import_metadata"], data["import_metadata"])
        self.assertEqual(stored["nutrition_raw"], data["nutrition_raw"])

    def test_expired_timer_extension_and_paused_extension_preserve_remaining(self):
        timer = self.call("global_timers_add", {"label": "Egg", "duration": 60})["timer"]
        later = "2026-10-14T12:02:00+00:00"
        self.call("global_timers_update", {"timer_id": timer["id"], "duration": 90}, now=later)
        read = self.call("global_timers_get", {"timer_id": timer["id"]}, now=later)["timer"]
        self.assertEqual(read["remaining"], 30, "expired extension adds only the added time")
        self.call("global_timers_update", {"timer_id": timer["id"], "running": False}, now=later)
        self.call("global_timers_update", {"timer_id": timer["id"], "duration": 120}, now=later)
        read = self.call(
            "global_timers_get", {"timer_id": timer["id"]}, now="2026-10-14T13:00:00+00:00"
        )["timer"]
        self.assertEqual(read["remaining"], 60)
        self.assertFalse(read["running"])

    def test_ambiguous_plan_read_and_empty_updates_are_rejected(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        plan = self.call(
            "meal_plan_add", {"recipe_id": recipe["id"], "date": "2026-10-14", "meal_type": "lunch"}
        )["entry"]
        timer = self.call("global_timers_add", {"label": "Soup", "duration": 60})["timer"]
        preset = self.call("timer_presets_add", {"name": "Soup", "seconds": 60})["preset"]
        cases = [
            ("meal_plan_get", {"entry_id": plan["id"], "week_start": "2026-10-12"}),
            ("recipes_update", {"recipe_id": recipe["id"]}),
            ("meal_plan_update", {"entry_id": plan["id"]}),
            ("global_timers_update", {"timer_id": timer["id"]}),
            ("timer_presets_update", {"preset_id": preset["id"]}),
        ]
        before = deepcopy(self.state)
        for action, payload in cases:
            with self.subTest(action=action):
                with self.assertRaises(ValueError):
                    self.call(
                        action,
                        {
                            **payload,
                            **({"request_id": "noop"} if action.endswith("update") else {}),
                        },
                    )
                self.assertEqual(self.state, before)

    def test_known_nutrition_numbers_are_finite_nonnegative_while_raw_text_is_retained(self):
        for value in (-1, True, float("inf")):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    self.call("recipes_add", {"name": "Bad", "nutrition": {"calories": value}})
        recipe = self.call(
            "recipes_add",
            {
                "name": "Label",
                "nutrition": {
                    "calories": "unknown",
                    "carbohydrates": 20,
                    "cholesterol": "10 mg",
                    "vendor_extra": {"declared": "trace"},
                },
            },
        )["recipe"]
        self.assertEqual(recipe["nutrition"]["calories"], "unknown")
        self.assertEqual(recipe["nutrition"]["vendor_extra"], {"declared": "trace"})
        self.assertIsNone(recipe["declared_nutrition"])

    def test_explicit_favourite_set_is_idempotent_including_timestamp(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        for action in ("recipes_set_favourite", "recipes_toggle_favourite"):
            first = self.call(action, {"recipe_id": recipe["id"], "is_favourite": True})
            second = self.call(
                action,
                {"recipe_id": recipe["id"], "is_favourite": True},
                now="2026-10-15T12:00:00+00:00",
            )
            self.assertEqual(first, second)

    def test_final_week_range_rejects_overflow_as_validation_error(self):
        with self.assertRaises(ValueError):
            self.call("meal_plan_clear", {"week_start": "9999-12-30", "confirm": True})
        self.assertEqual(self.state["meal_plan"], {})

    def test_complete_canonical_action_registry_and_strict_descriptors(self):
        expected = set(
            "recipes_get_all recipes_get recipes_add recipes_update recipes_delete "
            "recipes_toggle_favourite recipes_set_favourite recipes_search recipes_scrape "
            "recipes_upload_image recipes_download_image tags_get_all meal_plan_get meal_plan_add "
            "meal_plan_update meal_plan_remove meal_plan_clear global_timers_get global_timers_add "
            "global_timers_update global_timers_delete timer_presets_get timer_presets_add "
            "timer_presets_update timer_presets_delete recipe_keeper_import "
            "platform_info platform_backup".split()
        )
        self.assertEqual(set(self.domain.RECIPE_ACTIONS), expected)
        for action, descriptor in self.domain.RECIPE_ACTIONS.items():
            with self.subTest(action=action):
                self.assertIsInstance(descriptor["description"], str)
                self.assertIs(type(descriptor["read_only"]), bool)
                self.assertIs(descriptor["admin_only"], True)
                schema = descriptor["schema"]
                self.assertEqual(schema["type"], "object")
                self.assertIs(schema["additionalProperties"], False)
                self.assertIsInstance(schema["required"], list)
                self.assertTrue(set(schema["required"]).issubset(schema["properties"]))
                self.assertEqual("request_id" in schema["properties"], not descriptor["read_only"])
                with self.assertRaises(ValueError):
                    self.call(action, {"unknown_field": "ignored?"})
                for field in (
                    "actor",
                    "user_id",
                    "owner_id",
                    "is_admin",
                    "trusted_internal",
                    "allowed_users",
                ):
                    with self.assertRaises(ValueError):
                        self.call(action, {field: "admin"})
        with self.assertRaises(ValueError):
            self.call("subscribe")

    def test_all_recipe_stored_fields_support_updates_and_enforce_types(self):
        recipe = self.call("recipes_add", {"name": "Original"})["recipe"]
        fields = self.domain.RECIPE_ACTIONS["recipes_update"]["schema"]["properties"]
        for key, schema in fields.items():
            if key in ("recipe_id", "request_id"):
                continue
            with self.subTest(field=key):
                kind = schema["type"]
                kind = kind[0] if isinstance(kind, list) else kind
                if kind == "string":
                    value = schema.get("enum", ["Updated"])[0]
                elif kind == "number":
                    value = max(1, schema.get("minimum", 0))
                elif kind == "boolean":
                    value = True
                elif kind == "array":
                    value = []
                elif kind == "object":
                    value = {}
                else:
                    self.fail(f"Unhandled recipe schema {kind}")
                changed = self.call("recipes_update", {"recipe_id": recipe["id"], key: value})[
                    "recipe"
                ]
                self.assertEqual(changed[key], value)
                before = deepcopy(self.state)
                with self.assertRaises(ValueError):
                    self.call(
                        "recipes_update",
                        {"recipe_id": recipe["id"], key: [] if kind != "array" else {}},
                    )
                self.assertEqual(self.state, before)
        for field in self.domain._NUTRIENT_NAMES:
            recipe = self.call(
                "recipes_update", {"recipe_id": recipe["id"], "declared_nutrition": {field: 0}}
            )["recipe"]
            self.assertEqual(recipe["declared_nutrition"], {field: 0})
            with self.assertRaises(ValueError):
                self.call(
                    "recipes_update", {"recipe_id": recipe["id"], "declared_nutrition": {field: -1}}
                )

    def test_plan_and_timer_malformed_fields_never_publish_partial_mutations(self):
        recipe = self.call("recipes_add", {"name": "Soup"})["recipe"]
        plan = self.call(
            "meal_plan_add", {"recipe_id": recipe["id"], "date": "2026-10-14", "meal_type": "lunch"}
        )["entry"]
        timer = self.call("global_timers_add", {"label": "Soup", "duration": 60})["timer"]
        cases = [
            ("meal_plan_update", {"entry_id": plan["id"], "date": "2026-02-29"}, ValueError),
            ("meal_plan_update", {"entry_id": plan["id"], "meal_type": "brunch"}, ValueError),
            ("meal_plan_update", {"entry_id": plan["id"], "servings": 0}, ValueError),
            ("meal_plan_update", {"entry_id": plan["id"], "notes": 4}, ValueError),
            ("meal_plan_update", {"entry_id": plan["id"], "recipe_id": "missing"}, KeyError),
            ("global_timers_update", {"timer_id": timer["id"], "duration": 0}, ValueError),
            (
                "global_timers_update",
                {"timer_id": timer["id"], "start_time": float("nan")},
                ValueError,
            ),
            ("global_timers_update", {"timer_id": timer["id"], "running": 1}, ValueError),
            ("global_timers_update", {"timer_id": timer["id"], "paused_remaining": 30}, ValueError),
            (
                "global_timers_update",
                {"timer_id": timer["id"], "running": False, "paused_remaining": 61},
                ValueError,
            ),
            ("global_timers_update", {"timer_id": timer["id"], "preset_id": "missing"}, KeyError),
            ("global_timers_update", {"timer_id": timer["id"], "label": " "}, ValueError),
        ]
        before = deepcopy(self.state)
        for action, payload, error in cases:
            with self.subTest(action=action, payload=payload):
                with self.assertRaises(error):
                    self.call(action, payload)
                self.assertEqual(self.state, before)

    def test_clock_json_and_nested_collection_limits(self):
        for now in (None, "bad", "2026-10-14T12:00:00", "1960-01-01T00:00:00Z", "x" * 65):
            with self.subTest(now=now):
                with self.assertRaises(ValueError):
                    self.call("recipes_add", {"name": "x"}, now=now)
        nested = {}
        for _ in range(15):
            nested = {"child": nested}
        cases = [
            {"name": "x", "metadata": nested},
            {"name": "x", "tags": ["x"] * 201},
            {"name": "x", "ingredients": [{"name": "x"}] * 1001},
            {"name": "x", "metadata": {str(i): i for i in range(201)}},
            {"name": "x", "metadata": {1: "bad"}},
            {"name": "x", "ingredients": [{"name": "x", "amount_range": ["1"]}]},
            {"name": "x", "metadata": {"huge": 10**500}},
        ]
        for payload in cases:
            with self.subTest(payload=str(payload)[:60]):
                with self.assertRaises(ValueError):
                    self.call("recipes_add", payload)
        with self.assertRaises(ValueError):
            self.domain.recipe_command(self.state, "recipes_get_all", [], ADMIN, NOW)
        self.assertEqual(self.state["recipes"], {})

    def test_identifiers_are_literal_and_reject_control_characters(self):
        for request_id in ("req\n", "req\r", " req", "req/1", "req\x00"):
            with self.subTest(request_id=request_id):
                with self.assertRaises(ValueError):
                    self.call("recipes_add", {"name": "x", "request_id": request_id})
        recipe = self.call("recipes_add", {"name": "x", "request_id": "REQ-Case:1"})["recipe"]
        with self.assertRaises(ValueError):
            self.call("recipes_get", {"recipe_id": recipe["id"] + "\n"})
