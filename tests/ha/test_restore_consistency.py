"""Captured nutrition is immutable across restore and same-portion edits."""
from copy import deepcopy
from typing import Any
import unittest

import test_historical_restore as historical


class RestoreConsistencyTests(unittest.IsolatedAsyncioTestCase):
    client: Any
    coord: Any
    hass: Any
    origin: str
    owner: Any
    other: Any
    tmp: Any
    tokens: list[tuple[Any, str]]

    asyncSetUp = historical.HistoricalRestoreTests.asyncSetUp
    asyncTearDown = historical.HistoricalRestoreTests.asyncTearDown
    headers = historical.HistoricalRestoreTests.headers
    api = historical.HistoricalRestoreTests.api
    backup = historical.HistoricalRestoreTests.backup
    restore = historical.HistoricalRestoreTests.restore
    durable = historical.HistoricalRestoreTests.durable
    seed_food = historical.HistoricalRestoreTests.seed_food
    seed_recipe = historical.HistoricalRestoreTests.seed_recipe
    assert_rejected_without_write = historical.HistoricalRestoreTests.assert_rejected_without_write
    assert_restored_exact = historical.HistoricalRestoreTests.assert_restored_exact
    assert_native_entry_exact = historical.HistoricalRestoreTests.assert_native_entry_exact

    async def test_food_recorded_nutrition_forgery_rejected_before_store(self):
        food, _ = await self.seed_food()
        await self.api('food_delete', {'food_id': food['food_id']})
        candidate = await self.backup()
        candidate['entries'][0]['calories'] = 999
        candidate['entries'][0]['nutrients']['calories'] = 999
        await self.assert_rejected_without_write(candidate)

    async def test_recipe_recorded_nutrition_forgery_rejected_before_store(self):
        recipe, _ = await self.seed_recipe()
        await self.api('recipes_delete', {'recipe_id': recipe['id']})
        candidate = await self.backup()
        candidate['entries'][0]['calories'] = 999
        candidate['entries'][0]['nutrients']['calories'] = 999
        await self.assert_rejected_without_write(candidate)

    async def test_recipe_changed_snapshot_declaration_rejected_before_store(self):
        await self.seed_recipe()
        candidate = await self.backup()
        candidate['entries'][0]['recipe_snapshot']['declared_nutrition']['calories'] = 300
        await self.assert_rejected_without_write(candidate)

    async def test_food_map_presence_forgery_and_primary_contradictions_rejected(self):
        await self.seed_food()
        backup = await self.backup()
        for schema in (1, 2, 3):
            for field, value in [('nutrients', None), ('nutrients', {}),
                                 ('nutrients', {'calories': 61.5}),
                                 ('nutrients', {'calories': 61.5, 'protein': 0, 'fat': 0}),
                                 ('nutrients', {'calories': 61.5, 'protein': 0, 'invented': 0}),
                                 ('protein', 2), ('fat', 2), ('calories', True)]:
                with self.subTest(schema=schema, field=field, value=value):
                    candidate = deepcopy(backup)
                    candidate['schema'] = schema
                    if schema != 3:
                        candidate.pop('kitchen')
                    candidate['entries'][0][field] = value
                    await self.assert_rejected_without_write(candidate)

    async def test_recipe_map_aliases_unknowns_and_primary_contradictions_rejected(self):
        await self.seed_recipe()
        backup = await self.backup()
        for field, value in [('nutrients', None), ('nutrients', {'calories': 200}),
                             ('nutrients', {'calories': 200, 'protein': 0, 'fat': 0}),
                             ('nutrients', {'calories': 200, 'protein': 0, 'unknown': 0}),
                             ('calories', 201), ('protein', 1), ('fat', 1)]:
            with self.subTest(field=field, value=value):
                candidate = deepcopy(backup)
                candidate['entries'][0][field] = value
                await self.assert_rejected_without_write(candidate)

    async def test_deleted_sources_same_portion_update_preserves_recorded_nutrition(self):
        food, food_id = await self.seed_food()
        recipe, recipe_id = await self.seed_recipe()
        await self.api('food_delete', {'food_id': food['food_id']})
        await self.api('recipes_delete', {'recipe_id': recipe['id']})
        backup = await self.backup()
        await self.assert_restored_exact(backup, 'consistent-deleted-sources')
        for action, payload in [('update_food_entry', {'entry_id': food_id, 'amount': 50}),
                                ('recipe_entry_update', {'entry_id': recipe_id, 'servings': 1})]:
            original = next(row for row in backup['entries'] if row['id'] == payload['entry_id'])
            updated = (await self.api(action, payload))['entry']
            for key in ('nutrients', 'calories', 'protein', 'carbs', 'fat'):
                self.assertEqual(updated[key], original[key])
            await self.assert_native_entry_exact(updated)

    async def test_zero_ml_named_serving_and_extended_units_preserved(self):
        food = (await self.api('save_food', {'food': {'name': 'Captured ml', 'base_unit': 'ml',
            'nutrients_per_100': {'calories': 0, 'protein': 0, 'fat': None,
                                  'sodium': 12.3, 'vitamin_a': 45.6, 'sugar': 0, 'water': 89.1},
            'servings': [{'serving_id': 'cup', 'label': 'Cup', 'amount': 125}]}}))['food']
        entry_id = (await self.api('log_food', {'food_id': food['food_id'], 'serving_id': 'cup',
            'quantity': 2, 'meal_type': 'lunch', 'date': '2026-10-14'}))['entry_id']
        await self.api('food_delete', {'food_id': food['food_id']})
        backup = await self.backup()
        await self.assert_restored_exact(backup, 'zero-extended-ml')
        updated = (await self.api('update_food_entry', {'entry_id': entry_id,
                                  'serving_id': 'cup', 'quantity': 2}))['entry']
        self.assertEqual(updated['nutrients'], backup['entries'][0]['nutrients'])
        self.assertEqual(updated['calories'], 0)
        self.assertNotIn('fat', updated['nutrients'])
        await self.assert_native_entry_exact(updated)

    async def test_native_recipe_aliases_yield_and_rounding_match_same_portion_edit(self):
        for basis in ('per_serving', 'per_recipe'):
            recipe = (await self.api('recipes_add', {'name': 'Captured alias recipe', 'servings': 3,
                'nutrition_basis': basis, 'declared_nutrition': {'calories': 123,
                    'carbohydrates': 6, 'sugar': 2, 'protein': 0, 'fat': None}}))['recipe']
            entry_id = (await self.api('recipe_log', {'recipe_id': recipe['id'], 'servings': .3333333,
                'meal_type': 'dinner', 'date': '2026-10-14'}))['entry_id']
            await self.api('recipes_delete', {'recipe_id': recipe['id']})
            backup = await self.backup()
            await self.assert_restored_exact(backup, 'aliases-' + basis)
            original = next(row for row in backup['entries'] if row['id'] == entry_id)
            self.assertIn('carbs', original['nutrients'])
            self.assertIn('sugars', original['nutrients'])
            updated = (await self.api('recipe_entry_update', {'entry_id': entry_id, 'servings': .3333333}))['entry']
            self.assertEqual(updated['nutrients'], original['nutrients'])
            await self.assert_native_entry_exact(updated)
            for alias, canonical in [('carbohydrates', 'carbs'), ('sugar', 'sugars')]:
                candidate = await self.backup()
                row = next(row for row in candidate['entries'] if row['id'] == entry_id)
                row['nutrients'][alias] = row['nutrients'][canonical]
                await self.assert_rejected_without_write(candidate)
            candidate = await self.backup()
            row = next(row for row in candidate['entries'] if row['id'] == entry_id)
            row['recipe_snapshot']['declared_nutrition']['carbs'] = 7
            await self.assert_rejected_without_write(candidate)

    async def test_tiny_serialization_noise_accepted_but_material_difference_rejected(self):
        await self.seed_food()
        candidate = await self.backup()
        candidate['entries'][0]['calories'] += 1e-10
        candidate['entries'][0]['nutrients']['calories'] -= 1e-10
        await self.assert_restored_exact(candidate, 'roundoff-no-repair')
        candidate = await self.backup()
        candidate['entries'][0]['calories'] += .00001
        candidate['entries'][0]['nutrients']['calories'] += .00001
        await self.assert_rejected_without_write(candidate)

    async def test_pinned_legacy_missing_map_survives_schema_1_2_and_migrated_3(self):
        # Execute the exact pinned model, not a guessed modern creation payload.
        from datetime import datetime, timezone
        pinned = pinned_module('models')
        legacy = pinned.MealEntry(id='pinned-legacy', name='Pinned legacy quick entry', meal_type='lunch',
            calories=123, protein=4, carbs=0, fat=0, eaten_at=datetime(2026, 10, 14, 12, tzinfo=timezone.utc))
        self.assertNotIn('nutrients', legacy.to_dict())
        await self.coord.async_add(legacy)
        backup = await self.backup()
        for schema in (1, 2, 3):
            candidate = deepcopy(backup)
            candidate['schema'] = schema
            if schema != 3:
                candidate.pop('kitchen')
            readback = await self.assert_restored_exact(candidate, 'pinned-missing-map-' + str(schema))
            self.assertNotIn('nutrients', readback['entries'][0])
            diary = await self.api('diary', {'date': '2026-10-14'})
            self.assertNotIn('protein', diary['nutrition_missing'])
            self.assertEqual(diary['totals']['protein'], 4)
            backup = readback

    async def test_pinned_food_creator_writes_complete_map_even_for_unknown_macros(self):
        from datetime import datetime, timezone
        from custom_components.macromate.foods import FoodProduct
        from custom_components.macromate.restore_consistency import validate_history_consistency
        from custom_components.macromate.platform_api import recipe_nutrients
        pinned_models = pinned_module('models')
        runtime = pinned_module('runtime_api')
        runtime.MealEntry = pinned_models.MealEntry
        food = FoodProduct.from_dict({'food_id': 'local:pinned', 'name': 'Pinned food',
            'base_unit': 'g', 'nutrients_per_100': {'calories': 123, 'protein': 0, 'fat': None}})
        class PinnedCreator(runtime.DiaryCommands):
            def _food(self, food_id, state=None):
                return food
            def _entry_time(self, payload):
                return datetime(2026, 10, 14, 12, tzinfo=timezone.utc)
            async def _transact(self, action, values, request_id, apply):
                state = {'entries': []}
                apply(state)
                return state
        created = await PinnedCreator().async_command('log_food',
            {'food_id': food.food_id, 'amount': 50, 'meal_type': 'lunch'})
        self.assertEqual(created['entries'][0]['nutrients'], {'calories': 61.5, 'protein': 0})
        validate_history_consistency(created, recipe_nutrients=recipe_nutrients)
        # A real Store is created for independent byte-level readback.
        await self.api('preferences_update', {'preferences': {'language': 'en'}})
        backup = await self.backup()
        backup['entries'] = created['entries']
        await self.assert_restored_exact(backup, 'pinned-food-creator')
        candidate = await self.backup()
        candidate['entries'][0].pop('nutrients')
        await self.assert_rejected_without_write(candidate)


def pinned_module(name) -> Any:
    """Read/execute only this repository's explicitly required, pinned source."""
    from pathlib import Path
    import subprocess
    import sys
    import types
    source = subprocess.check_output(['git', 'show', 'fbd6b18:custom_components/macromate/' + name + '.py'],
                                     cwd=Path(__file__).resolve().parents[2])
    module_name = 'custom_components.macromate._restore_pinned_' + name
    module = types.ModuleType(module_name)
    sys.modules[module_name] = module
    exec(compile(source, 'fbd6b18:' + name + '.py', 'exec'), module.__dict__)
    return module
