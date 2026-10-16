"""Pure pinned Store-shape conversion tests; not native HA transport evidence.

Representative inert records follow Recipe-Manager 3c6dcba4's models.py,
storage.py and websocket/handlers.py; upstream code is never imported/executed.
"""
from __future__ import annotations

import importlib
import importlib.util
import unittest
from copy import deepcopy

from custom_components.macromate.platform_support import Actor, empty_kitchen
from custom_components.macromate.recipes import _RECIPE_FIELDS, _new_recipe

NOW = "2026-10-15T12:00:00+00:00"
THEN = "2026-03-05T09:10:11Z"
ADMIN = Actor("admin-fixture", is_admin=True)
RECIPES = "recipe_manager.recipes"
PLANS = "recipe_manager.meal_plans"
TIMERS = "recipe_manager.global_timers"
TAGS = "recipe_manager.tags"


def source_recipe(rid="Recipe:Literal_01"):
    # All 25 Recipe model fields, not a fabricated action-response envelope.
    return {
        "id": rid, "name": "Family soup", "ingredients": [
            {"name": "Base", "is_heading": True},
            {"name": "Milk", "amount": "1/2", "unit": "cup", "notes": "cold"},
        ], "instructions": ["Stir", "Simmer"], "tags": ["easy", "family"],
        "courses": ["Dinner"], "categories": ["Vegetarian"], "collections": ["Winter"],
        "source_url": "https://example.invalid/soup", "description": "Family recipe",
        "image_url": None, "cuisine": "French", "category": "Soup", "prep_time": 0,
        "cook_time": 20, "total_time": 20, "servings": 2, "servings_text": "2 bowls",
        "nutrition": {"calories": "120 kcal", "protein": None, "fat": 0, "custom": {"unknown": None}},
        "is_favourite": False, "rating": 5, "notes": "Keep chilled", "photos": [],
        "created_at": THEN, "updated_at": THEN,
    }


def bundle():
    recipe = source_recipe()
    return {
        RECIPES: {recipe["id"]: recipe},
        PLANS: {"Plan:01": {"id": "Plan:01", "recipe_id": recipe["id"],
                            "date": "2026-03-05", "meal_type": "dinner", "servings": 2, "notes": None}},
        TIMERS: {"Timer:01": {"id": "Timer:01", "label": "Simmer", "duration": 1200,
                              "start_time": 1772701200.0, "running": False,
                              "paused_remaining": 0, "preset_id": None}},
    }


def root():
    return {"schema_version": 3, "kitchen": empty_kitchen(), "sentinel": {"unchanged": [1]}}


class LegacyRecipeTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(
            importlib.util.find_spec("custom_components.macromate.legacy_recipes"),
            "missing pinned legacy Recipe-Manager Store converter",
        )
        self.convert = importlib.import_module("custom_components.macromate.legacy_recipes").import_legacy_recipes

    def test_raw_stores_preserve_complete_fields_literal_ids_order_and_references(self):
        state, stores = root(), bundle()
        original = deepcopy(stores)
        result = self.convert(state, stores, {}, ADMIN, NOW)
        self.assertEqual(stores, original)
        self.assertEqual(result["source"], "recipe_manager")
        self.assertIs(result["imported"], True)
        self.assertEqual(result["recipe_ids"], ["Recipe:Literal_01"])
        recipe = state["kitchen"]["recipes"]["Recipe:Literal_01"]
        for key, value in original[RECIPES]["Recipe:Literal_01"].items():
            self.assertEqual(recipe[key], value, key)
        self.assertEqual(set(recipe), set(_RECIPE_FIELDS) | {"id", "created_at", "updated_at"})
        self.assertIsNone(recipe["declared_nutrition"])
        self.assertEqual(recipe["nutrition_basis"], "unknown")
        self.assertEqual(recipe["nutrition_raw"], original[RECIPES]["Recipe:Literal_01"]["nutrition"])
        self.assertEqual(state["kitchen"]["meal_plan"]["Plan:01"]["recipe_id"], recipe["id"])
        for key, value in original[TIMERS]["Timer:01"].items():
            self.assertEqual(state["kitchen"]["timers"]["Timer:01"][key], value)
        self.assertEqual(result["meal_plan_ids"], ["Plan:01"])
        self.assertEqual(result["timer_ids"], ["Timer:01"])
        self.assertEqual(result["media_ids"], [])
        self.assertEqual(state["sentinel"], {"unchanged": [1]})

    def test_store_envelopes_and_legacy_aliases_fill_only_native_defaults(self):
        stores = {RECIPES: {"Old.ID": {"id": "Old.ID", "title": "Old title", "favourite": True}}}
        stores = {key: {"version": 1, "minor_version": 1, "key": key, "data": data}
                  for key, data in stores.items()}
        state = root()
        self.convert(state, stores, {}, ADMIN, NOW)
        recipe = state["kitchen"]["recipes"]["Old.ID"]
        native = _new_recipe({"name": "Old title", "is_favourite": True}, NOW)
        native["id"] = "Old.ID"
        self.assertEqual(recipe, native)

    def test_private_presets_can_be_supplied_in_explicit_timer_transfer_wrapper(self):
        # Presets are browser rm_timer_presets data, NOT another HA Store.
        stores = bundle()
        stores[TIMERS]["Timer:01"]["preset_id"] = "m8zg0"
        timers = stores[TIMERS]
        stores[TIMERS] = {"timers": timers, "timer_presets": [
            {"id": "m8zg0", "name": "Soup", "seconds": 1200},
        ]}
        stores[TAGS] = ["unused standalone tag"]
        state = root()
        state["kitchen"]["preferences"][ADMIN.owner_id] = {"ui": {"language": "en"}}
        result = self.convert(state, stores, {}, ADMIN, NOW, preserve_permissions=True)
        self.assertEqual(result["timer_preset_ids"], ["m8zg0"])
        self.assertEqual(state["kitchen"]["timer_presets"]["m8zg0"], {
            "id": "m8zg0", "name": "Soup", "seconds": 1200,
            "created_at": NOW, "updated_at": NOW,
        })
        prefs = state["kitchen"]["preferences"][ADMIN.owner_id]
        self.assertEqual(prefs["ui"], {"language": "en"})
        self.assertEqual(prefs["legacy_recipe_manager_tags"], ["unused standalone tag"])
        self.assertEqual(result["tag_count"], 1)

    def test_both_old_local_image_prefixes_migrate_supplied_bytes_to_private_media(self):
        import base64
        from custom_components.macromate.private_media import PREFIX, media_bytes
        first = "/local/recipe_manager/images/recipe_original.webp"
        second = "/local/images/recipe_manager/recipe_extra.webp"
        # Valid tiny PNG supplied by caller, never a source filesystem path.
        png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        stores = bundle()
        stores[RECIPES]["Recipe:Literal_01"]["image_url"] = first
        stores[RECIPES]["Recipe:Literal_01"]["photos"] = [second, first, "https://example.invalid/remote.jpg"]
        state = root()
        result = self.convert(state, stores, {first: png, second: png}, ADMIN, NOW, preserve_permissions=True)
        self.assertEqual(set(result["image_map"]), {first, second})
        self.assertEqual(len(result["media_ids"]), 2)
        recipe = state["kitchen"]["recipes"]["Recipe:Literal_01"]
        self.assertEqual(recipe["image_url"], result["image_map"][first])
        self.assertEqual(recipe["photos"], [result["image_map"][second], result["image_map"][first],
                                          "https://example.invalid/remote.jpg"])
        for mid in result["media_ids"]:
            self.assertIn(PREFIX + mid, result["image_map"].values())
            media = state["kitchen"]["media"][mid]
            self.assertEqual(media["owner_id"], ADMIN.owner_id)
            self.assertEqual(media["allowed_users"], [])
            self.assertEqual(media["content_type"], "image/webp")
            self.assertEqual(media_bytes(state["kitchen"], mid, ADMIN), base64.b64decode(media["data"]))
            with self.assertRaises(PermissionError):
                media_bytes(state["kitchen"], mid, Actor("other"))
        self.assertEqual(stores[RECIPES]["Recipe:Literal_01"]["image_url"], first)

    def test_missing_old_local_image_fails_whole_bundle_without_mutating_inputs(self):
        state, stores = root(), bundle()
        stores[RECIPES]["Recipe:Literal_01"]["image_url"] = "/local/images/recipe_manager/missing.webp"
        before, source = deepcopy(state), deepcopy(stores)
        with self.assertRaises(ValueError):
            self.convert(state, stores, {}, ADMIN, NOW)
        self.assertEqual(state, before)
        self.assertEqual(stores, source)

    def assert_rejected(self, stores, *, images=None, state=None, actor=ADMIN, **kwargs):
        state = root() if state is None else state
        images = {} if images is None else images
        before, sources, assets = deepcopy(state), deepcopy(stores), deepcopy(images)
        with self.assertRaises((ValueError, PermissionError)):
            self.convert(state, stores, images, actor, NOW, **kwargs)
        self.assertEqual(state, before)
        self.assertEqual(stores, sources)
        self.assertEqual(images, assets)

    def test_versions_keys_envelopes_and_unrecognized_wrappers_fail_closed(self):
        valid = {"version": 1, "minor_version": 1, "key": RECIPES,
                 "data": {"r": {"id": "r", "name": "Soup"}}}
        for field, values in {"version": [0, 2, True, "1"], "minor_version": [0, 2, True, "1"],
                              "key": [PLANS, "recipe_manager.recipes "]}.items():
            for value in values:
                with self.subTest(field=field, value=value):
                    self.assert_rejected({RECIPES: {**valid, field: value}})
        for missing in valid:
            with self.subTest(missing=missing):
                self.assert_rejected({RECIPES: {k: v for k, v in valid.items() if k != missing}})
        for data in ({**valid, "extra": None}, {"data": valid["data"]}, {"recipes": valid["data"]},
                     [source_recipe()], None):
            with self.subTest(data=data):
                self.assert_rejected({RECIPES: data})
        for key in ("recipes", "recipe_manager.recipes ", "recipe_manager.timer_presets"):
            self.assert_rejected({key: {}})
        # Literal reserved-looking record IDs are not mistaken for envelopes.
        state = root()
        rows = {key: {"id": key, "name": key} for key in ("data", "version", "minor_version", "key")}
        self.convert(state, {RECIPES: rows}, {}, ADMIN, NOW)
        self.assertEqual(list(state["kitchen"]["recipes"]), list(rows))

    def test_alias_conflicts_and_invalid_literal_ids_are_never_repaired(self):
        for patch in ({"title": "different"}, {"favourite": True}, {"favourite": 0},
                      {"title": None}, {"owner_id": None}, {"allowed_users": ["other"]}):
            stores = bundle()
            stores[RECIPES]["Recipe:Literal_01"].update(patch)
            with self.subTest(patch=patch):
                self.assert_rejected(stores)
        for rid in (" Upper", "trailing ", "a/b", "../bad", "a\\b", "a\n", "", "a%2fb"):
            self.assert_rejected({RECIPES: {rid: {"id": rid, "name": "Soup"}}})
        self.assert_rejected({RECIPES: {"literal": {"id": "other", "name": "Soup"}}})
        state = root()
        row = source_recipe()
        row.update(title=row["name"], favourite=False)
        self.convert(state, {RECIPES: {row["id"]: row}}, {}, ADMIN, NOW)
        self.assertIs(state["kitchen"]["recipes"][row["id"]]["is_favourite"], False)

    def test_authorization_and_explicit_permission_flag_are_not_payload_grants(self):
        for actor in (Actor(None), Actor("member")):
            self.assert_rejected(bundle(), actor=actor)
        for flag in (None, 0, 1, "false"):
            self.assert_rejected(bundle(), preserve_permissions=flag)

    def test_collisions_corrupt_records_and_orphan_references_reject_the_whole_bundle(self):
        for store, bucket, key in ((RECIPES, "recipes", "Recipe:Literal_01"),
                                   (PLANS, "meal_plan", "Plan:01"), (TIMERS, "timers", "Timer:01")):
            state = root()
            state["kitchen"][bucket][key] = {"id": key, "untouched": True}
            with self.subTest(bucket=bucket):
                self.assert_rejected(bundle(), state=state)
        patches = [
            (RECIPES, "Recipe:Literal_01", {"name": " "}),
            (RECIPES, "Recipe:Literal_01", {"ingredients": [{"name": "x", "amount": 1}]}),
            (RECIPES, "Recipe:Literal_01", {"nutrition": {"calories": -1}}),
            (RECIPES, "Recipe:Literal_01", {"updated_at": "2026-01-01"}),
            (PLANS, "Plan:01", {"recipe_id": "orphan"}),
            (PLANS, "Plan:01", {"date": "2026-02-30"}),
            (PLANS, "Plan:01", {"servings": True}),
            (TIMERS, "Timer:01", {"preset_id": "orphan"}),
            (TIMERS, "Timer:01", {"paused_remaining": 1201}),
            (TIMERS, "Timer:01", {"running": True}),
            (TIMERS, "Timer:01", {"duration": float("nan")}),
        ]
        for store, key, patch in patches:
            stores = bundle()
            stores[store][key].update(patch)
            with self.subTest(patch=patch):
                self.assert_rejected(stores)
        stores = bundle()
        stores[RECIPES]["bad-later"] = {"id": "bad-later"}
        self.assert_rejected(stores)

    def test_malformed_traversing_or_ambiguous_image_references_are_rejected(self):
        refs = ["/local/images/recipe_manager/../secret.webp", "/local/recipe_manager/images/%2e%2e.webp",
                "/local/images/recipe_manager/a.webp?token=x", "/local/images/recipe_manager/a.webp#x",
                "/local/images/recipe_manager/a/b.webp", "/local/images/recipe_manager/a\\b.webp",
                "/local/other/a.webp", "/etc/passwd", "file:///etc/passwd", "//example.invalid/a.webp",
                "https://user:secret@example.invalid/a.webp", "https://example.invalid:wrong/a.webp",
                "https://example.invalid/a\n.webp", "https://example.invalid/../a.webp",
                "https://example.invalid/%2e%2e/a.webp", "https://example.invalid/%ZZ.webp",
                "https://exa%6dple.invalid/a.webp", "https://example.invalid/a.webp#ambiguous",
                "/api/macromate/media/missing", "/api/macromate/media/a/../b"]
        for ref in refs:
            stores = bundle()
            stores[RECIPES]["Recipe:Literal_01"]["image_url"] = ref
            with self.subTest(ref=ref):
                self.assert_rejected(stores)

    def test_bad_image_data_unused_assets_and_filesystem_paths_are_rejected(self):
        ref = "/local/images/recipe_manager/a.webp"
        for value in ("not base64!", "L2V0Yy9wYXNzd2Q=", "/etc/passwd", "data:image/svg+xml;base64,PHN2Zz4=", None):
            stores = bundle()
            stores[RECIPES]["Recipe:Literal_01"]["image_url"] = ref
            with self.subTest(value=value):
                self.assert_rejected(stores, images={ref: value})
        for images in ({ref: "AA=="}, {"/etc/passwd": "AA=="},
                       {"https://example.invalid/a.webp": "AA=="}, []):
            self.assert_rejected(bundle(), images=images)

    def test_nutrition_raw_unknown_zero_and_explicit_current_declarations_are_not_inferred(self):
        for nutrition in (None, {}, {"calories": 0, "protein": None, "fiber": "unknown", "unrecognized": [0, None]}):
            state = root()
            raw = {"id": "r", "name": "Soup", "nutrition": nutrition}
            self.convert(state, {RECIPES: {"r": raw}}, {}, ADMIN, NOW)
            recipe = state["kitchen"]["recipes"]["r"]
            self.assertEqual(recipe["nutrition"], nutrition)
            self.assertEqual(recipe["nutrition_raw"], nutrition)
            self.assertIsNone(recipe["declared_nutrition"])
            self.assertEqual(recipe["nutrition_basis"], "unknown")
        raw = {"id": "r", "name": "Soup", "nutrition": {"calories": "0 kcal"},
               "declared_nutrition": {"calories": 0, "protein": None}, "nutrition_basis": "per_serving",
               "nutrition_raw": {"literal": "original"}, "nutrition_provenance": {"source": "explicit label"}}
        state = root()
        self.convert(state, {RECIPES: {"r": raw}}, {}, ADMIN, NOW)
        for field, value in raw.items():
            self.assertEqual(state["kitchen"]["recipes"]["r"][field], value)

    def test_native_identity_generation_and_remote_fetch_are_never_called(self):
        from unittest.mock import patch
        stores = bundle()
        stores[RECIPES]["Recipe:Literal_01"]["image_url"] = "https://example.invalid/a%20b.webp?version=1"
        stores[RECIPES]["Another"] = {"id": "Another", "name": "Family soup"}
        state = root()
        with patch("custom_components.macromate.recipes.uuid4", side_effect=AssertionError("new record ID")), \
             patch("socket.create_connection", side_effect=AssertionError("network")), \
             patch("urllib.request.urlopen", side_effect=AssertionError("remote fetch")), \
             patch("pathlib.Path.read_bytes", side_effect=AssertionError("source image filesystem")):
            result = self.convert(state, stores, {}, ADMIN, NOW)
        self.assertEqual(result["recipe_ids"], ["Recipe:Literal_01", "Another"])
        self.assertEqual(len(state["kitchen"]["recipes"]), 2)  # No name merge.
        self.assertEqual(state["kitchen"]["recipes"]["Recipe:Literal_01"]["image_url"],
                         stores[RECIPES]["Recipe:Literal_01"]["image_url"])

    def test_supplied_image_failure_after_valid_image_remains_atomic(self):
        refs = ["/local/images/recipe_manager/first.webp", "/local/recipe_manager/images/second.webp"]
        png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        stores = bundle()
        stores[RECIPES]["Recipe:Literal_01"]["photos"] = refs
        self.assert_rejected(stores, images={refs[0]: png, refs[1]: "invalid!"})

    def test_media_uuid_collision_rejects_instead_of_overwriting(self):
        from unittest.mock import patch
        ref = "/local/images/recipe_manager/a.webp"
        png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        stores = bundle()
        stores[RECIPES]["Recipe:Literal_01"]["image_url"] = ref
        state = root()
        state["kitchen"]["media"]["existing"] = {"untouched": True}
        with patch("custom_components.macromate.legacy_recipes.uuid4", return_value="existing"):
            self.assert_rejected(stores, images={ref: png}, state=state)

    def test_invalid_detached_kitchen_shape_is_rejected_without_partial_mutation(self):
        for kitchen in ({}, {"recipes": {}}, {**empty_kitchen(), "unknown": {}},
                        {**empty_kitchen(), "timers": []}):
            with self.subTest(kitchen=kitchen):
                self.assert_rejected(bundle(), state={"kitchen": kitchen})

    @unittest.skipUnless(importlib.util.find_spec("homeassistant"), "framework-installed restore validator")
    def test_final_restore_validator_accepts_complete_imported_models_and_private_images(self):
        # Calls the real structural validator without a running HA instance.
        # Native authentication, Store persistence and publication are parent tests.
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        ref = "/local/images/recipe_manager/a.webp"
        png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        stores = bundle()
        stores[RECIPES]["Recipe:Literal_01"]["image_url"] = ref
        stores[TIMERS] = {"timers": stores[TIMERS], "timer_presets": [
            {"id": "p", "name": "Preset", "seconds": 60, "created_at": THEN, "updated_at": THEN}]}
        stores[TIMERS]["timers"]["Timer:01"]["preset_id"] = "p"
        stores[TAGS] = ["auxiliary"]
        state = {"schema": 3, "kitchen": empty_kitchen(), "entries": [], "ledger": [],
                 "foods": {}, "favorites": {}, "daily_goals": {}}
        self.convert(state, stores, {ref: png}, ADMIN, NOW)
        coord = MealTrackerCoordinator.__new__(MealTrackerCoordinator)
        self.assertEqual(coord._validate_restore(state), state)

    def test_existing_current_private_image_is_retained_without_acl_changes(self):
        from custom_components.macromate.kitchen_network import normalize_image
        from custom_components.macromate.private_media import PREFIX
        png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        state = root()
        original = {**normalize_image(png), "owner_id": ADMIN.owner_id, "allowed_users": []}
        state["kitchen"]["media"]["current"] = deepcopy(original)
        raw = {"id": "r", "name": "Soup", "image_url": PREFIX + "current", "photos": [PREFIX + "current"]}
        result = self.convert(state, {RECIPES: {"r": raw}}, {}, ADMIN, NOW)
        self.assertEqual(result["media_ids"], [])
        self.assertEqual(result["image_map"], {})
        self.assertEqual(state["kitchen"]["media"]["current"], original)
        self.assertEqual(state["kitchen"]["recipes"]["r"]["photos"], raw["photos"])

    def test_duplicate_preset_and_tag_import_collisions_are_not_overwrites(self):
        preset = {"id": "p", "name": "Soup", "seconds": 60}
        for presets in ([preset, preset], [{**preset, "id": "p/invalid"}], [{**preset, "seconds": True}]):
            self.assert_rejected({TIMERS: {"timers": {}, "timer_presets": presets}})
        state = root()
        state["kitchen"]["timer_presets"]["p"] = deepcopy(preset)
        self.assert_rejected({TIMERS: {"timers": {}, "timer_presets": [preset]}}, state=state)
        state = root()
        state["kitchen"]["preferences"][ADMIN.owner_id] = {"legacy_recipe_manager_tags": []}
        self.assert_rejected({TAGS: ["tag"]}, state=state)
        for tags in (None, {}, [None], [False], [""], "tag"):
            self.assert_rejected({TAGS: tags})


if __name__ == "__main__":
    unittest.main()
