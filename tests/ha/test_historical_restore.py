"""Historical snapshots validated through authenticated HTTP and real HA Store."""
from copy import deepcopy
from pathlib import Path
import unittest
from typing import Any
from unittest.mock import patch

import test_restore_integrity as integrity
import test_unified_http as native


class HistoricalRestoreTests(unittest.IsolatedAsyncioTestCase):
    client: Any
    coord: Any
    hass: Any
    origin: str
    owner: Any
    other: Any
    tmp: Any
    tokens: list[tuple[Any, str]]

    # Reuse lifecycle/helpers, not the fixture class (no inherited test collection).
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers
    api = integrity.RestoreIntegrityTests.api
    backup = integrity.RestoreIntegrityTests.backup
    restore = integrity.RestoreIntegrityTests.restore
    durable = integrity.RestoreIntegrityTests.durable

    async def assert_rejected_without_write(self, candidate):
        before = await self.backup()
        path = Path(self.tmp.name) / '.storage' / 'macromate.meals'
        disk = path.read_bytes()
        self.rejection_id = getattr(self, 'rejection_id', 0) + 1
        with patch.object(self.coord._store, 'async_save', wraps=self.coord._store.async_save) as save:
            await self.restore(candidate, 'historical-invalid-' + str(self.rejection_id), status=400)
            save.assert_not_called()
        self.assertEqual(await self.backup(), before)
        self.assertEqual(path.read_bytes(), disk)
        self.assertEqual(self.durable(), before)

    async def seed_food(self, calories=123):
        food = (await self.api('save_food', {'food': {
            'name': 'Captured food', 'base_unit': 'g', 'producer': 'Captured producer',
            'nutrients_per_100': {'calories': calories, 'protein': 0, 'fat': None},
            'servings': [{'serving_id': 'large bowl', 'label': 'Large bowl', 'amount': 50}],
            'barcodes': ['4006381333931'],
        }, 'request_id': 'historical-food'}))['food']
        entry = await self.api('log_food', {
            'food_id': food['food_id'], 'amount': 50, 'meal_type': 'lunch',
            'date': '2026-10-14', 'request_id': 'historical-food-entry',
        })
        return food, entry['entry_id']

    async def seed_recipe(self, basis='per_serving', calories=200):
        recipe = (await self.api('recipes_add', {
            'name': 'Captured recipe', 'servings': 2, 'servings_text': '2 bowls',
            'ingredients': [{'name': 'Oats', 'amount': '50', 'unit': 'g', 'raw': '50 g oats'}],
            'instructions': ['Stir'], 'tags': ['captured'], 'notes': None,
            'declared_nutrition': {'calories': calories, 'protein': 0, 'fat': None},
            'nutrition_basis': basis,
            'nutrition': {'calories': '200 kcal', 'unknown_label': None},
            'nutrition_provenance': {'source': 'captured declaration'},
            'metadata': {'opaque': [None, 0, 'captured']},
            'provenance': {'origin': None}, 'import_metadata': {'source_id': 'original-id'},
            'request_id': 'historical-recipe',
        }))['recipe']
        entry = await self.api('recipe_log', {
            'recipe_id': recipe['id'], 'servings': 1, 'meal_type': 'dinner',
            'date': '2026-10-14', 'request_id': 'historical-recipe-entry',
        })
        return recipe, entry['entry_id']

    async def test_invalid_recipe_declaration_rejected_before_store_write(self):
        await self.seed_recipe()
        candidate = await self.backup()
        candidate['entries'][0]['recipe_snapshot']['declared_nutrition']['calories'] = -1
        await self.assert_rejected_without_write(candidate)

    async def test_complete_recipe_snapshot_fields_required_and_typed(self):
        recipe, _ = await self.seed_recipe()
        backup = await self.backup()
        snapshot = backup['entries'][0]['recipe_snapshot']
        self.assertEqual(snapshot, recipe)
        for field in snapshot:
            with self.subTest(missing=field):
                candidate = deepcopy(backup)
                del candidate['entries'][0]['recipe_snapshot'][field]
                await self.assert_rejected_without_write(candidate)
            with self.subTest(invalid_type=field):
                candidate = deepcopy(backup)
                candidate['entries'][0]['recipe_snapshot'][field] = (
                    [] if isinstance(snapshot[field], dict) or field in (
                        'nutrition_raw', 'provenance', 'metadata', 'import_metadata',
                        'nutrition_provenance', 'nutrition', 'declared_nutrition',
                    ) else {'invalid': True}
                )
                await self.assert_rejected_without_write(candidate)
        candidate = deepcopy(backup)
        candidate['entries'][0]['recipe_snapshot']['unknown_field'] = None
        await self.assert_rejected_without_write(candidate)

    async def assert_restored_exact(self, backup, request_id):
        self.assertTrue((await self.restore(backup, request_id))['restored'])
        readback = await self.backup()
        expected = deepcopy(backup)
        expected['schema'] = 3
        if 'kitchen' not in expected:
            from custom_components.macromate.platform_support import empty_kitchen
            expected['kitchen'] = empty_kitchen()
        for field in expected:
            if field != 'ledger':
                self.assertEqual(readback[field], expected[field], field)
        self.assertEqual(readback['ledger'][:-1], backup['ledger'])
        self.assertEqual(readback['ledger'][-1]['request_id'], self.owner.id + ':' + request_id)
        self.assertEqual(self.durable(), readback)
        return readback

    async def test_deleted_food_full_snapshot_zero_unknown_and_legacy_roundtrip(self):
        food, entry_id = await self.seed_food()
        await self.api('food_delete', {'food_id': food['food_id']})
        backup = await self.backup()
        snapshot = backup['entries'][0]['food_snapshot']
        self.assertEqual(snapshot, food)
        self.assertNotIn(food['food_id'], backup['foods'])
        self.assertEqual(snapshot['nutrients']['protein'], 0)
        self.assertNotIn('fat', snapshot['nutrients'])
        for schema in (3, 1, 2):
            with self.subTest(schema=schema):
                candidate = deepcopy(backup)
                candidate['schema'] = schema
                if schema != 3:
                    candidate.pop('kitchen')
                await self.assert_restored_exact(candidate, 'deleted-food-schema-' + str(schema))
                updated = (await self.api('update_food_entry', {
                    'entry_id': entry_id, 'serving_id': 'large bowl', 'quantity': 2,
                }))['entry']
                self.assertEqual(updated['food_snapshot'], snapshot)
                self.assertEqual(updated['amount'], 100)
                self.assertEqual(updated['nutrients'], {'calories': 123, 'protein': 0})
                self.assertNotIn('fat', updated['nutrients'])
                await self.assert_native_entry_exact(updated)

    async def assert_deleted_recipe_roundtrip(self, basis):
        recipe, entry_id = await self.seed_recipe(basis)
        await self.api('recipes_delete', {'recipe_id': recipe['id']})
        backup = await self.backup()
        snapshot = backup['entries'][0]['recipe_snapshot']
        self.assertEqual(snapshot, recipe)
        self.assertNotIn(recipe['id'], backup['kitchen']['recipes'])
        await self.assert_restored_exact(backup, 'deleted-recipe-restore')
        updated = (await self.api('recipe_entry_update', {'entry_id': entry_id, 'servings': 2}))['entry']
        self.assertEqual(updated['recipe_snapshot'], snapshot)
        self.assertEqual(updated['recipe_id'], recipe['id'])
        self.assertEqual(updated['recipe_servings'], 2)
        self.assertEqual(updated['nutrients'], {'calories': 200 if basis == 'per_recipe' else 400, 'protein': 0})
        self.assertIsNone(updated['recipe_snapshot']['declared_nutrition']['fat'])
        self.assertNotIn('fat', updated['nutrients'])
        await self.assert_native_entry_exact(updated)

    async def test_deleted_recipe_per_serving_full_snapshot_zero_unknown_roundtrip(self):
        await self.assert_deleted_recipe_roundtrip('per_serving')

    async def test_deleted_recipe_per_recipe_full_snapshot_zero_unknown_roundtrip(self):
        await self.assert_deleted_recipe_roundtrip('per_recipe')

    async def test_live_source_changes_do_not_rewrite_captured_snapshots(self):
        food, food_entry = await self.seed_food()
        recipe, recipe_entry = await self.seed_recipe()
        await self.api('save_food', {'food': {
            'food_id': food['food_id'], 'name': 'Changed food', 'base_unit': 'ml',
            'nutrients_per_100': {'calories': 999, 'fat': 20},
        }})
        await self.api('recipes_update', {
            'recipe_id': recipe['id'], 'name': 'Changed recipe',
            'declared_nutrition': {'calories': 999, 'fat': 20},
        })
        await self.assert_restored_exact(await self.backup(), 'changed-live-source')
        updated_food = (await self.api('update_food_entry', {'entry_id': food_entry, 'amount': 100}))['entry']
        updated_recipe = (await self.api('recipe_entry_update', {'entry_id': recipe_entry, 'servings': 2}))['entry']
        self.assertEqual(updated_food['food_snapshot'], food)
        self.assertEqual(updated_food['nutrients'], {'calories': 123, 'protein': 0})
        self.assertEqual(updated_recipe['recipe_snapshot'], recipe)
        self.assertEqual(updated_recipe['nutrients'], {'calories': 400, 'protein': 0})
        await self.assert_native_entry_exact(updated_food)
        await self.assert_native_entry_exact(updated_recipe)

    async def test_complete_food_snapshot_fields_required_and_typed(self):
        food, _ = await self.seed_food()
        backup = await self.backup()
        snapshot = backup['entries'][0]['food_snapshot']
        self.assertEqual(snapshot, food)
        for field in snapshot:
            with self.subTest(missing=field):
                candidate = deepcopy(backup)
                del candidate['entries'][0]['food_snapshot'][field]
                await self.assert_rejected_without_write(candidate)
            with self.subTest(invalid_type=field):
                candidate = deepcopy(backup)
                candidate['entries'][0]['food_snapshot'][field] = (
                    [] if field in ('nutrients', 'nutrients_per_100', 'nutrient_units', 'favorite') else {'invalid': True}
                )
                await self.assert_rejected_without_write(candidate)
        candidate = deepcopy(backup)
        candidate['entries'][0]['food_snapshot']['unknown_field'] = None
        await self.assert_rejected_without_write(candidate)

    async def test_food_snapshot_identity_portion_and_nested_models_fail_closed(self):
        await self.seed_food()
        backup = await self.backup()
        cases = [
            (['food_snapshot', 'food_id'], 'local:different'),
            (['food_snapshot', 'base_unit'], 'ml'),
            (['food_snapshot', 'source'], 'unsupported'),
            (['food_snapshot', 'producer'], False),
            (['food_snapshot', 'barcodes'], ['bad-barcode']),
            (['food_snapshot', 'servings', 0, 'amount'], True),
            (['food_snapshot', 'servings', 0, 'label'], []),
            (['food_snapshot', 'servings', 0, 'extra'], 'ignored-by-constructor'),
            (['food_snapshot', 'nutrients', 'calories'], True),
            (['food_snapshot', 'nutrients_per_100', 'calories'], -1),
            (['serving_id'], 'missing-serving'),
            (['quantity'], 1),
            (['food_snapshot'], None),
            (['food_id'], None),
        ]
        for path, value in cases:
            with self.subTest(path=path):
                candidate = deepcopy(backup)
                target = candidate['entries'][0]
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
                await self.assert_rejected_without_write(candidate)
        # A named portion must resolve using the captured serving definition.
        candidate = deepcopy(backup)
        candidate['entries'][0].update(serving_id='large bowl', quantity=2)
        await self.assert_rejected_without_write(candidate)
        # Removing declarations must not turn an unknown into a known zero.
        for value in (None, 'absent'):
            with self.subTest(calories=value):
                candidate = deepcopy(backup)
                snapshot = candidate['entries'][0]['food_snapshot']
                for key in ('nutrients', 'nutrients_per_100'):
                    if value is None:
                        snapshot[key]['calories'] = None
                    else:
                        del snapshot[key]['calories']
                snapshot['missing_nutrients'].insert(0, 'calories')
                await self.assert_rejected_without_write(candidate)
        # Finite per-base/per-100 values can still overflow the saved portion.
        candidate = deepcopy(backup)
        row = candidate['entries'][0]
        row['amount'] = 100000
        row['food_snapshot']['nutrients']['calories'] = 1e304
        row['food_snapshot']['nutrients_per_100']['calories'] = 1e306
        await self.assert_rejected_without_write(candidate)

    async def assert_native_entry_exact(self, entry):
        expected = deepcopy(entry)
        expected['id'] = expected.pop('entry_id')
        backup = await self.backup()
        self.assertEqual(next(row for row in backup['entries'] if row['id'] == expected['id']), expected)
        diary = await self.api('diary', {'date': '2026-10-14'})
        self.assertEqual(next(row for row in diary['entries'] if row['entry_id'] == entry['entry_id']), entry)
        self.assertEqual(self.durable(), backup)

    async def test_zero_calories_remain_known_for_deleted_food_and_recipe(self):
        food, food_entry = await self.seed_food(calories=0)
        recipe, recipe_entry = await self.seed_recipe(calories=0)
        await self.api('food_delete', {'food_id': food['food_id']})
        await self.api('recipes_delete', {'recipe_id': recipe['id']})
        await self.assert_restored_exact(await self.backup(), 'zero-calories')
        for action, payload, snapshot_key, snapshot in (
            ('update_food_entry', {'entry_id': food_entry, 'amount': 100}, 'food_snapshot', food),
            ('recipe_entry_update', {'entry_id': recipe_entry, 'servings': 2}, 'recipe_snapshot', recipe),
        ):
            updated = (await self.api(action, payload))['entry']
            self.assertEqual(updated[snapshot_key], snapshot)
            self.assertEqual(updated['nutrients'], {'calories': 0, 'protein': 0})
            self.assertNotIn('fat', updated['nutrients'])
            await self.assert_native_entry_exact(updated)

    async def test_recipe_snapshot_domain_boundaries_fail_before_store_write(self):
        await self.seed_recipe()
        backup = await self.backup()
        cases = [
            (['id'], 'different-recipe'),
            (['created_at'], '2026-10-14T12:00:00'),
            (['updated_at'], 'invalid-timestamp'),
            (['name'], '   '),
            (['servings'], False),
            (['servings'], 0),
            (['servings'], 10001),
            (['declared_nutrition', 'calories'], None),
            (['declared_nutrition', 'calories'], True),
            (['declared_nutrition', 'calories'], '200'),
            (['declared_nutrition', 'calories'], 1000001),
            (['declared_nutrition', 'protein'], -1),
            (['declared_nutrition', 'unknown_nutrient'], 1),
            (['nutrition_basis'], 'unknown'),
            (['ingredients', 0, 'name'], None),
            (['ingredients', 0, 'amount_range'], ['50']),
            (['instructions'], [False]),
            (['is_favourite'], 1),
        ]
        for path, value in cases:
            with self.subTest(path=path, value=value):
                candidate = deepcopy(backup)
                target = candidate['entries'][0]['recipe_snapshot']
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
                await self.assert_rejected_without_write(candidate)
        for yield_value in (None, 0):
            with self.subTest(per_recipe_yield=yield_value):
                candidate = deepcopy(backup)
                candidate['entries'][0]['recipe_snapshot'].update(nutrition_basis='per_recipe', servings=yield_value)
                await self.assert_rejected_without_write(candidate)
        candidate = deepcopy(backup)
        candidate['entries'][0]['recipe_servings'] = 100000
        await self.assert_rejected_without_write(candidate)

    async def test_nonfinite_snapshot_nutrients_rejected_without_store_write(self):
        await self.seed_food()
        await self.seed_recipe()
        backup = await self.backup()
        for snapshot_key, nutrients_key in (
            ('food_snapshot', 'nutrients'), ('food_snapshot', 'nutrients_per_100'),
            ('recipe_snapshot', 'declared_nutrition'),
        ):
            for value in (float('nan'), float('inf'), -float('inf')):
                with self.subTest(snapshot=snapshot_key, nutrients=nutrients_key, value=value):
                    candidate = deepcopy(backup)
                    row = next(row for row in candidate['entries'] if snapshot_key in row)
                    row[snapshot_key][nutrients_key]['calories'] = value
                    await self.assert_rejected_without_write(candidate)

    async def test_invalid_food_base_unit_rejected_before_store_write(self):
        await self.seed_food()
        candidate = await self.backup()
        candidate['entries'][0]['food_snapshot']['base_unit'] = 'invalid'
        await self.assert_rejected_without_write(candidate)
