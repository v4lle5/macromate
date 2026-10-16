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

    async def test_retired_catalog_reads_never_run(self):
        from unittest.mock import patch
        from custom_components.macromate import shopping
        with patch.object(shopping, '_catalog', side_effect=AssertionError('retired catalog executed')):
            for action in ('shopping_products_get_all', 'shopping_get_integration_settings'):
                with self.assertRaises(ValueError):
                    await self.api(action)


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

    async def test_retired_item_cannot_grant_media_access(self):
        before = self.coord._state()
        for actor in (Actor('owner', is_admin=True), Actor('member')):
            with self.assertRaises((ValueError, PermissionError)):
                await self.api('shopping_items_add', {'list_id': 'old-list', 'image_url': '/api/macromate/media/private'}, actor)
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


    async def test_discovery_and_recipe_crud_share_atomic_runtime(self):
        discovered = await self.api("describe")
        self.assertIn("recipes_add", discovered["actions"])
        self.assertNotIn("shopping_items_add", discovered["actions"])
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
