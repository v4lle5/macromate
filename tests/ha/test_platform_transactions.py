"""Additive kitchen migration and atomicity against the actual HA coordinator."""
from copy import deepcopy
from test_coordinator_transactions import CoordinatorTransactions
from custom_components.macromate.platform_support import empty_kitchen


class PlatformMigrationTests(CoordinatorTransactions):
    async def test_recipe_nutrition_cannot_be_rewritten_as_a_quick_entry(self):
        from custom_components.macromate.models import MealEntry
        item = MealEntry.from_dict({"id": "synthetic-recipe-entry", "name": "Synthetic recipe", "meal_type": "lunch",
            "calories": 100, "protein": 0, "carbs": 0, "fat": 0, "eaten_at": self.values["eaten_at"].isoformat(),
            "recipe_id": "synthetic-recipe", "recipe_servings": 1, "nutrients": {"calories": 100},
            "recipe_snapshot": {"id": "synthetic-recipe", "nutrition_basis": "per_serving", "declared_nutrition": {"calories": 100}}})
        await self.coord.async_add(item)
        before = self.coord._state()
        with self.assertRaisesRegex(ValueError, "snapshot"):
            await self.coord.async_update(item.id, {"calories": 200}, "invalid-recipe-edit")
        self.assertEqual(self.coord._state(), before)
        copied = await self.coord.async_command("copy_meal", {"entry_id": item.id, "date": "2026-10-15", "request_id": "copy-recipe-snapshot"})
        self.assertEqual(copied["entry"]["recipe_snapshot"], item.recipe_snapshot)
        self.assertEqual(copied["entry"]["recipe_id"], item.recipe_id)

    async def test_explicit_transport_actor_cannot_bypass_private_diary_permissions(self):
        from inspect import signature
        from custom_components.macromate.platform_support import Actor
        self.assertIn("actor", signature(self.coord.async_command).parameters)
        for actor in (Actor("reader"), Actor(None)):
            with self.subTest(actor=actor.user_id), self.assertRaises(PermissionError):
                await self.coord.async_command("diary", {}, actor=actor)
            with self.subTest(write=actor.user_id), self.assertRaises(PermissionError):
                await self.coord.async_command("log_meal", {"name": "Synthetic denied", "meal_type": "lunch", "calories": 100}, actor=actor)
        self.assertEqual(self.coord.log.entries, ())
        result = await self.coord.async_command("diary", {}, actor=Actor("owner", is_admin=True))
        self.assertEqual(result["entries"], [])
        with self.assertRaises(ValueError):
            await self.coord.async_command("diary", {"is_admin": True}, actor=Actor("owner", is_admin=True))

    async def test_current_authorization_is_checked_under_lock_before_replay(self):
        from custom_components.macromate.platform_support import Actor, require_access
        actor = Actor("member")
        def seed(state):
            state["kitchen"]["shopping_lists"]["synthetic-list"] = {"owner_id": "owner", "allowed_users": ["member"]}
            return {"id": "synthetic-list"}
        await self.coord._transact("seed", {}, None, seed)
        def guard(state):
            require_access(state["kitchen"]["shopping_lists"]["synthetic-list"], actor)
        def write(state):
            state["kitchen"]["preferences"]["member"] = {"language": "de"}
            return {"accepted": True}
        await self.coord._transact("scoped-write", {"actor": "member"}, "scoped-request", write, guard=guard)
        def revoke(state):
            state["kitchen"]["shopping_lists"]["synthetic-list"]["allowed_users"] = []
            return {"revoked": True}
        await self.coord._transact("revoke", {}, None, revoke)
        before = self.coord._state()
        with self.assertRaises(PermissionError):
            await self.coord._transact("scoped-write", {"actor": "member"}, "scoped-request", write, guard=guard)
        self.assertEqual(self.coord._state(), before)

    async def test_invalid_staged_kitchen_or_future_schema_never_reaches_store(self):
        before = self.coord._state()
        for case in ("kitchen", "schema"):
            with self.subTest(case=case):
                self.coord._adopt(deepcopy(before))
                self.store.value = deepcopy(before)
                def corrupt(state):
                    if case == "kitchen":
                        state["kitchen"]["recipes"] = []
                    else:
                        state["schema"] = 4
                    return {"id": "synthetic-invalid-state"}
                with self.assertRaises(ValueError):
                    await self.coord._transact("invalid-state", {"case": case}, "invalid-" + case, corrupt)
                self.assertEqual(self.store.value, before)
                self.assertEqual(self.coord._state(), before)

    async def test_schema_two_migration_preserves_every_existing_section_and_retry(self):
        first = await self.coord.async_create(**self.values)
        food = await self.coord.async_command("save_food", {"food": {"name": "Synthetic migration food", "base_unit": "g", "nutrients_per_100": {"calories": 100}}, "request_id": "migration-food"})
        await self.coord.async_command("favorite", {"food_id": food["food"]["food_id"], "enabled": True, "amount": 50, "request_id": "migration-favorite"})
        before = self.coord._state()
        before.pop("kitchen", None)
        before["schema"] = 2
        before["daily_goals"]["2026-10-13"] = {"calorie_target": 2000, "protein": 100, "carbs": 250, "fat": 70}
        self.store.value = deepcopy(before)
        await self.coord.async_load()
        migrated = self.coord._state()
        self.assertEqual(migrated["schema"], 3)
        self.assertEqual(migrated["kitchen"], empty_kitchen())
        for key in ("entries", "foods", "favorites", "daily_goals", "ledger"):
            self.assertEqual(migrated[key], before[key], key)
        self.assertEqual(self.store.value, before, "a read migration must not overwrite the source")
        replay = await self.coord.async_create(**self.values)
        self.assertEqual(replay.id, first.id)
        self.assertEqual(len(self.coord.log.entries), 1)


if __name__ == "__main__":
    import unittest
    unittest.main()
