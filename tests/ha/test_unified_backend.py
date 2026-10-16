"""Unified vertical slices using real HA runtime and synthetic isolated data."""

import unittest
import test_coordinator_transactions as transactions
from custom_components.macromate.platform_support import Actor


class UnifiedBackendTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = transactions.CoordinatorTransactions.asyncSetUp
    asyncTearDown = transactions.CoordinatorTransactions.asyncTearDown

    async def api(self, action, payload=None, actor=None):
        return await self.coord.async_command(
            action, payload or {}, actor=actor or Actor("owner", is_admin=True)
        )

    async def test_restore_rejects_invalid_goals_and_coerced_entry_identifiers(self):
        from copy import deepcopy

        original = self.coord._state()
        fixtures = []
        bad = deepcopy(original)
        bad["daily_goals"]["2026-10-14"] = True
        fixtures.append(bad)
        bad = deepcopy(original)
        bad["entries"] = [
            {
                "id": 123,
                "name": "Must not coerce",
                "meal_type": "lunch",
                "eaten_at": "2026-10-14T12:00:00+00:00",
                "calories": 100,
                "protein": 0,
                "carbs": 0,
                "fat": 0,
            }
        ]
        fixtures.append(bad)
        bad = deepcopy(fixtures[-1])
        bad["entries"][0]["id"] = "valid"
        bad["entries"][0]["calories"] = True
        fixtures.append(bad)
        bad = deepcopy(fixtures[-1])
        bad["entries"][0]["calories"] = 100
        bad["entries"][0]["nutrients"] = {"calories": True}
        fixtures.append(bad)
        for index, data in enumerate(fixtures):
            with self.subTest(index=index), self.assertRaises(ValueError):
                await self.api(
                    "platform_restore",
                    {
                        "data": data,
                        "confirm": True,
                        "request_id": "invalid-root-" + str(index),
                    },
                )
            self.assertEqual(self.coord._state(), original)

    async def test_shutdown_or_read_only_store_never_reports_a_deferred_commit(self):
        from unittest.mock import patch
        from homeassistant.core import CoreState
        from custom_components.macromate.coordinator import MealTrackerCoordinator

        for mode in ("stopping", "read_only"):
            native = MealTrackerCoordinator(self.hass, self.coord.settings)
            before = native._state()
            with (
                patch.object(
                    self.hass,
                    "state",
                    CoreState.stopping if mode == "stopping" else self.hass.state,
                ),
                patch.object(native._store, "_read_only", mode == "read_only"),
            ):
                with self.subTest(mode=mode), self.assertRaises(OSError):
                    await native.async_command(
                        "recipes_add",
                        {"name": "No deferred commit", "request_id": mode},
                        actor=Actor("owner", is_admin=True),
                    )
            self.assertEqual(native._state(), before)

    async def test_real_atomic_store_write_failure_never_publishes_staged_records(self):
        from pathlib import Path
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        from custom_components.macromate.const import EVENT_UPDATED

        native = MealTrackerCoordinator(self.hass, self.coord.settings)
        # A directory at the destination causes a real atomic rename/write error.
        Path(native._store.path).mkdir(parents=True, exist_ok=True)
        before = native._state()
        events = []
        cancel = self.hass.bus.async_listen(
            EVENT_UPDATED, lambda event: events.append(event.data)
        )
        with self.assertRaises(OSError):
            await native.async_command(
                "recipes_add",
                {"name": "Must not publish", "request_id": "real-failed-write"},
                actor=Actor("owner", is_admin=True),
            )
        await self.hass.async_block_till_done()
        self.assertEqual(native._state(), before)
        self.assertEqual(events, [])
        cancel()

    async def test_packaged_catalog_and_manifest_reads_run_in_ha_executor(self):
        import threading
        from pathlib import Path
        from unittest.mock import patch
        from custom_components.macromate import shopping

        event_thread = threading.get_ident()
        observed = []
        original = Path.read_text

        def read(path, *args, **kwargs):
            if path.name == "manifest.json" or path.name.startswith(
                "products_catalog_"
            ):
                observed.append(threading.get_ident())
            return original(path, *args, **kwargs)

        shopping._catalog.cache_clear()
        with patch.object(Path, "read_text", read):
            await self.api("shopping_products_get_all", {"country": "NZ"})
            await self.api("shopping_get_integration_settings")
        self.assertTrue(observed)
        self.assertTrue(all(thread != event_thread for thread in observed))

    async def test_unknown_root_sections_and_nonrecord_kitchen_values_never_save(self):
        before = self.coord._state()
        for case in ("root", "recipe"):

            def corrupt(state):
                if case == "root":
                    state["unknown_section"] = {"discarded": True}
                else:
                    state["kitchen"]["recipes"]["invalid-record"] = False
                return {}

            with self.subTest(case=case), self.assertRaises(ValueError):
                await self.coord._transact("invalid-staged-" + case, {}, None, corrupt)
            self.assertEqual(self.coord._state(), before)
            self.assertIsNone(self.store.value)

    async def test_empty_plan_selection_still_requires_a_real_accessible_list(self):
        with self.assertRaises(ValueError):
            await self.api(
                "plan_to_shopping",
                {
                    "week_start": "2026-10-12",
                    "list_id": "missing",
                    "request_id": "empty-week",
                },
            )
        self.assertEqual(self.coord.ledger.to_list(), [])

    async def test_media_cannot_be_laundered_through_a_shared_item_reference(self):
        import base64, io
        from PIL import Image

        recipe = (await self.api("recipes_add", {"name": "Private photo"}))["recipe"]
        pixels = io.BytesIO()
        Image.new("RGB", (2, 2)).save(pixels, format="PNG")
        photo = await self.api(
            "recipes_upload_image",
            {
                "recipe_id": recipe["id"],
                "image_data": base64.b64encode(pixels.getvalue()).decode(),
            },
        )
        member = Actor("member")
        lid = (
            await self.api("shopping_lists_create", {"name": "Member list"}, member)
        )["list"]["id"]
        before = self.coord._state()
        with self.assertRaises(PermissionError):
            await self.api(
                "shopping_items_add",
                {"list_id": lid, "name": "Forged", "image_url": photo["image_url"]},
                member,
            )
        self.assertEqual(self.coord._state(), before)

    async def test_remote_preprocessors_require_consent_and_block_private_destinations(
        self,
    ):
        before = self.coord._state()
        for action, payload in (
            ("recipes_scrape", {"url": "https://127.0.0.1/private", "enabled": True}),
            (
                "recipes_download_image",
                {
                    "recipe_id": "missing",
                    "image_url": "https://127.0.0.1/private",
                    "enabled": True,
                },
            ),
            (
                "shopping_products_download_image",
                {
                    "image_url": "https://127.0.0.1/private",
                    "product_name": "Denied",
                    "allow_remote": True,
                },
            ),
            ("shopping_openfoodfacts_fetch", {"query": "oats", "allow_remote": True}),
        ):
            with (
                self.subTest(action=action),
                self.assertRaises((ValueError, KeyError, PermissionError)),
            ):
                await self.api(action, payload)
        self.assertEqual(self.coord._state(), before)

    async def test_selected_ingredients_never_infer_unknown_recipe_yield_or_dimensions(
        self,
    ):
        lid = (await self.api("shopping_lists_create", {"name": "No guesses"}))["list"][
            "id"
        ]
        recipe = (
            await self.api(
                "recipes_add",
                {
                    "name": "Unknown yield",
                    "ingredients": [
                        {"name": "Water", "amount": "1/2", "unit": "cup"},
                        {"name": "Water", "amount": "1-2", "unit": "g"},
                    ],
                },
            )
        )["recipe"]
        before = self.coord._state()
        with self.assertRaises(ValueError):
            await self.api(
                "recipe_to_shopping",
                {"recipe_id": recipe["id"], "list_id": lid, "servings": 2},
            )
        self.assertEqual(self.coord._state(), before)
        result = await self.api(
            "recipe_to_shopping", {"recipe_id": recipe["id"], "list_id": lid}
        )
        self.assertEqual(len(result["item_ids"]), 2)
        items = (await self.api("shopping_items_get", {"list_id": lid}))["items"]
        self.assertEqual((items[0]["quantity"], items[0]["unit"]), (0.5, "cup"))
        self.assertEqual(items[1]["unit"], "units")
        self.assertIn("1-2", items[1]["note"])

    async def test_keeper_declared_numeric_nutrition_can_log_without_losing_raw_text(
        self,
    ):
        html = '<div class="recipe-details"><h2 class="recipe-name">Declared soup</h2><div class="recipe-serving-size">2 servings</div><div class="recipe-nutrition">Calories: 200 kcal\nProtein: 5 g\nPer serving</div></div>'
        imported = await self.api(
            "recipe_keeper_import",
            {"html_content": html, "request_id": "keeper-nutrition"},
        )
        rid = imported["recipe_ids"][0]
        recipe = (await self.api("recipes_get", {"recipe_id": rid}))["recipe"]
        self.assertEqual(recipe["declared_nutrition"], {"calories": 200, "protein": 5})
        self.assertIn("nutrition_raw", recipe)
        logged = await self.api(
            "recipe_log", {"recipe_id": rid, "servings": 2, "meal_type": "lunch"}
        )
        self.assertEqual(logged["entry"]["calories"], 400)

    async def test_new_diary_replays_are_scoped_to_server_actor(self):
        payload = {
            "name": "Private",
            "meal_type": "lunch",
            "calories": 100,
            "request_id": "same-request",
        }
        first = await self.api("log_meal", payload)
        second = await self.api(
            "log_meal", payload, Actor("second-admin", is_admin=True)
        )
        self.assertNotEqual(first["entry_id"], second["entry_id"])
        self.assertEqual(await self.api("log_meal", payload), first)

    async def test_deleted_item_replay_rechecks_parent_acl_and_actor_identity(self):
        member = Actor("member")
        lid = (await self.api("shopping_lists_create", {"name": "Shared"}))["list"][
            "id"
        ]
        await self.api(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": ["member"]},
        )
        item = (
            await self.api(
                "shopping_items_add", {"list_id": lid, "name": "One"}, member
            )
        )["item"]
        payload = {"item_id": item["id"], "request_id": "delete"}
        deleted = await self.api("shopping_items_delete", payload, member)
        self.assertEqual(
            await self.api("shopping_items_delete", payload, member), deleted
        )
        await self.api(
            "shopping_lists_update_members", {"list_id": lid, "allowed_users": []}
        )
        with self.assertRaises(PermissionError):
            await self.api("shopping_items_delete", payload, member)
        # Guessing another actor's ID is not a replay; a missing target fails.
        with self.assertRaises(ValueError):
            await self.api("shopping_items_delete", payload, Actor("other"))
        await self.api("shopping_lists_delete", {"list_id": lid, "confirm": True})
        self.assertEqual(
            await self.api("shopping_items_delete", payload, member), deleted
        )

    async def test_restore_invalid_media_fails_before_durable_save(self):
        data = self.coord._state()
        data["kitchen"]["media"]["invalid-media"] = {
            "content_type": "image/webp",
            "data": "bm90YW5pbWFnZQ==",
            "owner_id": "owner",
            "allowed_users": [],
        }
        before = self.coord._state()
        with self.assertRaises(ValueError):
            await self.api(
                "platform_restore",
                {"data": data, "confirm": True, "request_id": "invalid-media"},
            )
        self.assertEqual(self.coord._state(), before)

    async def test_real_keeper_archive_and_private_media_are_atomic(self):
        import base64, io, zipfile
        from PIL import Image
        from custom_components.macromate.private_media import media_bytes

        html = '<div class="recipe-details"><h2 class="recipe-name">Cake</h2><div class="recipe-serving-size">2 servings</div><div class="recipe-ingredients"><p>200 g oats</p></div><div class="recipe-nutrition">Calories: 200 kcal Per serving</div><img class="recipe-photo" src="images/cake.png"></div>'
        picture = io.BytesIO()
        Image.new("RGB", (4, 4), "red").save(picture, format="PNG")
        archive = io.BytesIO()
        with zipfile.ZipFile(archive, "w") as z:
            z.writestr("recipes.html", html)
            z.writestr("images/cake.png", picture.getvalue())
        payload = {
            "base64_data": base64.b64encode(archive.getvalue()).decode(),
            "request_id": "archive",
        }
        result = await self.api("recipe_keeper_import", payload)
        self.assertEqual(result["imported"], 1)
        self.assertEqual(result["failed"], 0)
        recipe = (
            await self.api("recipes_get", {"recipe_id": result["recipe_ids"][0]})
        )["recipe"]
        self.assertIn("provenance", recipe)
        mid = recipe["image_url"].rsplit("/", 1)[-1]
        data = media_bytes(self.coord.kitchen, mid, Actor("owner", is_admin=True))
        self.assertEqual(Image.open(io.BytesIO(data)).format, "WEBP")
        with self.assertRaises(PermissionError):
            media_bytes(self.coord.kitchen, mid, Actor("other"))
        self.assertEqual(await self.api("recipe_keeper_import", payload), result)
        upload = {
            "recipe_id": recipe["id"],
            "image_data": base64.b64encode(picture.getvalue()).decode(),
            "request_id": "upload",
        }
        self.store.fail = True
        before = self.coord._state()
        with self.assertRaises(OSError):
            await self.api("recipes_upload_image", upload)
        self.assertEqual(self.coord._state(), before)
        self.store.fail = False
        uploaded = await self.api("recipes_upload_image", upload)
        self.assertTrue(uploaded["image_url"].startswith("/api/macromate/media/"))
        self.assertEqual(uploaded['local_url'],uploaded['image_url'])
        self.assertNotIn("data", uploaded)

    async def test_preferences_backup_restore_validate_before_save(self):
        member = Actor("member")
        await self.api(
            "preferences_update",
            {"preferences": {"language": "de"}, "request_id": "prefs"},
            member,
        )
        self.assertEqual(
            (await self.api("preferences_get", actor=member))["preferences"][
                "language"
            ],
            "de",
        )
        self.assertEqual((await self.api("preferences_get"))["preferences"], {})
        rid = (await self.api("recipes_add", {"name": "Restore me"}))["recipe"]["id"]
        backup = await self.api("platform_backup")
        self.assertEqual(backup["data"], self.coord._state())
        await self.api("recipes_delete", {"recipe_id": rid})
        result = await self.api(
            "platform_restore",
            {"data": backup["data"], "confirm": True, "request_id": "restore"},
        )
        self.assertTrue(result["restored"])
        self.assertIn(rid, self.coord.kitchen["recipes"])
        before = self.coord._state()
        from copy import deepcopy

        bad = deepcopy(backup["data"])
        bad["kitchen"]["recipes"][rid]["name"] = []
        with self.assertRaises(ValueError):
            await self.api(
                "platform_restore",
                {"data": bad, "confirm": True, "request_id": "badrestore"},
            )
        self.assertEqual(self.coord._state(), before)

    async def test_atomic_recipe_shopping_exact_matches_and_week_range(self):
        lid = (await self.api("shopping_lists_create", {"name": "Week"}))["list"]["id"]
        product = (await self.api("shopping_products_get_all", {"country": "NZ"}))[
            "products"
        ][0]
        recipe = (
            await self.api(
                "recipes_add",
                {
                    "name": "Selected",
                    "servings": 2,
                    "ingredients": [
                        {"name": "Heading", "is_heading": True},
                        {"name": "Original flour", "amount": "500", "unit": "g"},
                        {"name": "Original flour", "amount": "1", "unit": "kg"},
                        {"name": "Ambiguous", "amount": "1-2", "unit": "cups"},
                    ],
                },
            )
        )["recipe"]
        payload = {
            "recipe_id": recipe["id"],
            "list_id": lid,
            "servings": 2,
            "ingredient_indexes": [1, 2],
            "ingredient_matches": [
                {"ingredient_index": 1, "product_id": product["id"]},
                {"ingredient_index": 2, "product_id": product["id"]},
            ],
            "request_id": "selection",
        }
        result = await self.api("recipe_to_shopping", payload)
        self.assertEqual(len(set(result["item_ids"])), 1)
        item = (
            await self.api("shopping_items_get_one", {"item_id": result["item_ids"][0]})
        )["item"]
        self.assertEqual(item["product_id"], product["id"])
        self.assertEqual(item["name"], product["name"])
        self.assertEqual(item["category_id"], product["category_id"])
        self.assertEqual((item["quantity"], item["unit"]), (1500, "g"))
        self.assertEqual(await self.api("recipe_to_shopping", payload), result)
        before = self.coord._state()
        for matches in (
            [{"ingredient_index": 3, "product_id": product["id"]}],
            [payload["ingredient_matches"][0]] * 2,
        ):
            with self.assertRaises(ValueError):
                await self.api(
                    "recipe_to_shopping",
                    {**payload, "ingredient_matches": matches, "request_id": "invalid"},
                )
        self.assertEqual(self.coord._state(), before)
        for day in ("2026-10-12", "2026-10-19"):
            await self.api(
                "meal_plan_add",
                {
                    "recipe_id": recipe["id"],
                    "date": day,
                    "meal_type": "lunch",
                    "servings": 1,
                },
            )
        plan = await self.api(
            "plan_to_shopping",
            {"week_start": "2026-10-12", "list_id": lid, "request_id": "plan"},
        )
        self.assertEqual(len(plan["plan_entry_ids"]), 1)
        self.assertEqual(len(self.coord.log.entries), 0)

    async def test_recipe_diary_snapshot_scaling_and_food_delete(self):
        recipe = (
            await self.api(
                "recipes_add",
                {
                    "name": "Recipe snapshot",
                    "servings": 4,
                    "declared_nutrition": {"calories": 800, "protein": 40},
                    "nutrition_basis": "per_recipe",
                    "request_id": "recipe",
                },
            )
        )["recipe"]
        logged = await self.api(
            "recipe_log",
            {
                "recipe_id": recipe["id"],
                "servings": 2,
                "meal_type": "lunch",
                "date": "2026-10-14",
                "request_id": "log",
            },
        )
        eid = logged["entry_id"]
        self.assertEqual(logged["entry"]["calories"], 400)
        await self.api(
            "recipes_delete", {"recipe_id": recipe["id"], "request_id": "delete-recipe"}
        )
        updated = await self.api(
            "recipe_entry_update",
            {"entry_id": eid, "servings": 3, "request_id": "scale"},
        )
        self.assertEqual(updated["entry"]["calories"], 600)
        self.assertEqual(
            updated["entry"]["recipe_snapshot"], logged["entry"]["recipe_snapshot"]
        )
        self.assertNotIn("carbs", updated["entry"]["nutrients"])
        with self.assertRaises(ValueError):
            await self.api("update_meal", {"entry_id": eid, "calories": 1})
        food = (
            await self.api(
                "save_food",
                {
                    "food": {
                        "name": "Synthetic food",
                        "base_unit": "g",
                        "nutrients_per_100": {"calories": 100},
                    }
                },
            )
        )["food"]
        entry = await self.api(
            "log_food", {"food_id": food["food_id"], "amount": 50, "meal_type": "lunch"}
        )
        await self.api(
            "food_delete", {"food_id": food["food_id"], "request_id": "delete-food"}
        )
        self.assertNotIn(food["food_id"], self.coord.foods)
        self.assertEqual(
            next(
                e for e in self.coord.log.entries if e.id == entry["entry_id"]
            ).food_snapshot["food_id"],
            food["food_id"],
        )

    async def test_shopping_acl_replay_events_and_failed_save(self):
        member = Actor("member")
        lid = (
            await self.api(
                "shopping_lists_create",
                {"name": "Synthetic private", "request_id": "list"},
            )
        )["list"]["id"]
        await self.api(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": ["member"], "request_id": "members"},
        )
        events = []
        cancel = self.hass.bus.async_listen(
            "macromate_updated", lambda e: events.append(e.data)
        )
        payload = {
            "list_id": lid,
            "name": "Synthetic apple",
            "request_id": "member-add",
        }
        result = await self.api("shopping_items_add", payload, member)
        self.assertNotIn("_event_users", result)
        self.assertNotIn("_event_users", str(self.coord.ledger.to_list()))
        await self.hass.async_block_till_done()
        self.assertTrue(events)
        self.assertEqual(set(events[-1]), {"event", "users", "public"})
        self.assertIn("member", events[-1]["users"])
        await self.api(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": [], "request_id": "revoke"},
        )
        with self.assertRaises(PermissionError):
            await self.api("shopping_items_add", payload, member)
        self.assertIn("member", events[-1]["users"])
        before = self.coord._state()
        self.store.fail = True
        with self.assertRaises(OSError):
            await self.api(
                "shopping_items_add",
                {"list_id": lid, "name": "Failed", "request_id": "fail"},
            )
        self.assertEqual(self.coord._state(), before)
        cancel()

    async def test_discovery_and_recipe_crud_share_atomic_runtime(self):
        discovered = await self.api("describe")
        self.assertIn("recipes_add", discovered["actions"])
        self.assertIn("shopping_items_add", discovered["actions"])
        result = await self.api(
            "recipes_add", {"name": "Synthetic oats", "request_id": "recipe-create"}
        )
        rid = result["recipe"]["id"]
        self.assertEqual(
            await self.api(
                "recipes_add", {"name": "Synthetic oats", "request_id": "recipe-create"}
            ),
            result,
        )
        await self.api(
            "recipes_update",
            {"recipe_id": rid, "notes": "Test note", "request_id": "recipe-edit"},
        )
        self.assertEqual(
            (await self.api("recipes_get", {"recipe_id": rid}))["recipe"]["notes"],
            "Test note",
        )
        deleted = await self.api(
            "recipes_delete", {"recipe_id": rid, "request_id": "recipe-delete"}
        )
        self.assertEqual(
            await self.api(
                "recipes_delete", {"recipe_id": rid, "request_id": "recipe-delete"}
            ),
            deleted,
        )
        self.assertEqual((await self.api("recipes_get_all"))["recipes"], [])
        self.assertEqual(self.store.value["kitchen"], self.coord.kitchen)
