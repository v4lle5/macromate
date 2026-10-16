"""Restore integrity through disposable authenticated native HA HTTP."""
from copy import deepcopy
import asyncio
import base64
import io
import json
from pathlib import Path
import unittest
from typing import Any
from PIL import Image
import test_unified_http as native


class RestoreIntegrityTests(unittest.IsolatedAsyncioTestCase):
    client: Any
    coord: Any
    hass: Any
    origin: str
    owner: Any
    other: Any
    tmp: Any
    tokens: list[tuple[Any, str]]

    # Reuse lifecycle only, never inherit/import the fixture's test class.
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def api(self, action, payload=None, index=0):
        async with self.client.post(
            self.origin + '/api/services/macromate/' + action + '?return_response',
            headers=self.headers(index), json=payload or {},
        ) as response:
            self.assertEqual(response.status, 200, await response.text())
            return (await response.json())['service_response']

    async def historical(self, action, payload=None, index=0):
        """Construct/read dormant historical records, never live transport."""
        from historical_shopping_fixture import historical_shopping
        from custom_components.macromate.platform_support import Actor
        user = self.other if index else self.owner
        return await historical_shopping(self.coord, action, payload, Actor(user.id, is_admin=user.is_admin))

    async def backup(self):
        async with self.client.get(self.origin + '/api/macromate/backup', headers=self.headers()) as response:
            self.assertEqual(response.status, 200)
            return (await response.json())['data']

    async def restore(self, data, request_id='restore-integrity', status=200):
        async with self.client.post(
            self.origin + '/api/macromate/restore', headers=self.headers(),
            json={'data': data, 'confirm': True, 'request_id': request_id},
        ) as response:
            self.assertEqual(response.status, status, await response.text())
            return await response.json() if status == 200 else {}

    def durable(self):
        return json.loads((Path(self.tmp.name) / '.storage' / 'macromate.meals').read_text())['data']

    async def assert_rejected_unchanged(self, data, request_id='invalid-restore'):
        live, durable = await self.backup(), self.durable()
        self.invalid_counter = getattr(self, 'invalid_counter', 0) + 1
        await self.restore(data, request_id + '-' + str(self.invalid_counter), status=400)
        self.assertEqual(await self.backup(), live)
        self.assertEqual(self.durable(), durable)

    async def test_malformed_preferences_and_incomplete_timer_fail_before_save(self):
        await self.api('preferences_update', {'preferences': {'language': 'de'}, 'request_id': 'seed'})
        valid = await self.backup()
        corrupt = deepcopy(valid)
        corrupt['kitchen']['preferences'][self.other.id] = {'ui': 'not-an-object'}
        await self.assert_rejected_unchanged(corrupt, 'invalid-ui')
        corrupt = deepcopy(valid)
        corrupt['kitchen']['timers']['timer'] = {'id': 'timer', 'label': 'Synthetic', 'duration': 30}
        await self.assert_rejected_unchanged(corrupt, 'incomplete-timer')

    async def populate(self):
        recipe = (await self.api('recipes_add', {
            'name': 'Synthetic full recipe', 'servings': 2,
            'ingredients': [{'name': 'Oats', 'amount': '40', 'unit': 'g', 'notes': None, 'raw': '40 g oats', 'amount_fraction': None, 'amount_range': ['40', '50'], 'is_heading': None}],
            'instructions': ['Stir'], 'instruction_groups': [{'name': 'Cook', 'instructions': ['Heat']}],
            'tags': ['synthetic'], 'courses': ['Lunch'], 'categories': ['Test'], 'collections': ['Fixture'], 'cuisines': ['Synthetic'],
            'description': None, 'notes': 'Inert note', 'source_url': None, 'image_url': None,
            'cuisine': None, 'category': None, 'servings_text': '2 bowls',
            'prep_time': None, 'cook_time': 5, 'total_time': None, 'rating': None,
            'nutrition': {'calories': 'original 200 kcal', 'unknown_imported_nutrient': None},
            'declared_nutrition': {'calories': 200, 'protein': None}, 'nutrition_basis': 'per_serving',
            'nutrition_provenance': {'source': None}, 'nutrition_raw': {'original': None},
            'provenance': None, 'metadata': {'opaque': [None, 'unmodified']},
            'import_metadata': {'original_media': {'image_url': 'https://example.invalid/inert-original'}},
            'request_id': 'full-recipe',
        }))['recipe']
        await self.api('recipes_add', {'name': 'Synthetic defaults'})
        preset = (await self.api('timer_presets_add', {'name': 'Synthetic preset', 'seconds': 30, 'request_id': 'preset'}))['preset']
        timer = (await self.api('global_timers_add', {'label': 'Synthetic paused timer', 'duration': 30, 'running': False, 'paused_remaining': 15, 'preset_id': preset['id'], 'request_id': 'timer'}))['timer']
        plan = (await self.api('meal_plan_add', {'recipe_id': recipe['id'], 'date': '2026-10-14', 'meal_type': 'lunch', 'request_id': 'plan'}))['entry']
        await self.historical('shopping_regions_create', {'code': 'XY', 'name': 'Synthetic region', 'currency': 'XYZ'})
        category = (await self.historical('shopping_categories_add', {'name': 'Synthetic category', 'request_id': 'category'}))['category']
        product = (await self.historical('shopping_products_add', {'name': 'Synthetic product', 'category_id': category['id'], 'nutrition': None, 'substitution_group': None, 'request_id': 'product'}))['product']
        catalog = (await self.historical('shopping_products_get_all'))['products'][0]
        await self.historical('shopping_products_update', {'product_id': catalog['id'], 'price': None, 'request_id': 'catalog-override'})
        parent = (await self.historical('shopping_lists_create', {'name': 'Synthetic shared list', 'request_id': 'full-list'}))['list']
        await self.historical('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': [self.other.id]})
        await self.historical('shopping_lists_set_active', {'list_id': parent['id']})
        item = (await self.historical('shopping_items_add', {'list_id': parent['id'], 'name': product['name'], 'product_id': product['id'], 'category_id': category['id'], 'quantity': 2, 'price': 3, 'currency': 'NZD', 'request_id': 'full-item'}))['item']
        await self.historical('shopping_items_check', {'item_id': item['id'], 'checked': True})
        card = (await self.historical('shopping_loyalty_add', {'name': 'Synthetic loyalty', 'number': '000123', 'request_id': 'loyalty'}))['card']
        await self.historical('shopping_update_integration_settings', {'enable_price_tracking': False})
        await self.api('preferences_update', {'preferences': {'language': 'de', 'unknown_extension': None}, 'request_id': 'preferences'})
        food = (await self.api('save_food', {'food': {'name': 'Synthetic food', 'base_unit': 'g', 'nutrients_per_100': {'calories': 100, 'protein': None}}, 'request_id': 'food'}))['food']
        await self.api('favorite', {'food_id': food['food_id'], 'enabled': True, 'amount': 50, 'request_id': 'favorite'})
        entry = await self.api('log_food', {'food_id': food['food_id'], 'amount': 50, 'date': '2026-10-14', 'meal_type': 'lunch', 'request_id': 'food-entry'})
        await self.api('recipe_log', {'recipe_id': recipe['id'], 'servings': 1, 'date': '2026-10-14', 'meal_type': 'dinner', 'request_id': 'recipe-entry'})
        stream = io.BytesIO()
        Image.new('RGB', (3, 3), 'blue').save(stream, format='PNG')
        image = await self.api('recipes_upload_image', {'recipe_id': recipe['id'], 'image_data': base64.b64encode(stream.getvalue()).decode(), 'request_id': 'media'})
        # Native HA sensor-driven dated goals, not invented restore data.
        self.coord.settings.update(weight_entity='sensor.synthetic_weight', active_calories_entity='sensor.synthetic_active')
        self.hass.states.async_set('sensor.synthetic_weight', '70', {'unit_of_measurement': 'kg'})
        self.hass.states.async_set('sensor.synthetic_active', '300', {'unit_of_measurement': 'kcal'})
        await self.coord.async_record_goal()
        return {'recipe': recipe['id'], 'plan': plan['id'], 'timer': timer['id'], 'preset': preset['id'], 'list': parent['id'], 'item': item['id'], 'product': product['id'], 'card': card['id'], 'category': category['id'], 'media': image['image_url'], 'food': food['food_id'], 'entry': entry['entry_id']}

    async def test_complete_populated_native_http_backup_restore_exact_readback(self):
        ids = await self.populate()
        backup = await self.backup()
        self.assertTrue(all(backup['kitchen'][bucket] for bucket in backup['kitchen']))
        self.assertTrue(all(backup[bucket] for bucket in ('entries', 'foods', 'favorites', 'daily_goals', 'ledger')))
        self.assertEqual((await self.api('platform_backup'))['data'], backup)
        payload_id = 'populated-restore'
        self.assertTrue((await self.restore(backup, payload_id))['restored'])
        readback = await self.backup()
        for bucket in backup:
            if bucket != 'ledger':
                self.assertEqual(readback[bucket], backup[bucket], bucket)
        self.assertEqual(readback['ledger'][:-1], backup['ledger'])
        self.assertEqual(readback['ledger'][-1]['request_id'], self.owner.id + ':' + payload_id)
        self.assertEqual(self.durable(), readback)
        self.assertEqual((await self.api('recipes_get', {'recipe_id': ids['recipe']}))['recipe'], backup['kitchen']['recipes'][ids['recipe']])
        self.assertEqual((await self.historical('shopping_items_get_one', {'item_id': ids['item']}, index=1))['item'], backup['kitchen']['shopping_items'][ids['item']])
        self.assertEqual((await self.api('meal_plan_get', {'entry_id': ids['plan']}))['entry']['servings'], 1)
        self.assertEqual((await self.api('global_timers_get', {'timer_id': ids['timer']}))['timer']['remaining'], 15)
        self.assertEqual((await self.api('timer_presets_get', {'preset_id': ids['preset']}))['preset'], backup['kitchen']['timer_presets'][ids['preset']])
        self.assertEqual((await self.historical('shopping_products_get', {'product_id': ids['product']}))['product']['name'], 'Synthetic product')
        self.assertEqual((await self.historical('shopping_loyalty_get', {'card_id': ids['card']}))['card'], backup['kitchen']['loyalty_cards'][ids['card']])
        self.assertEqual((await self.historical('shopping_regions_get', {'code': 'XY'}))['region'], backup['kitchen']['regions']['XY'])
        self.assertEqual((await self.api('preferences_get'))['preferences'], backup['kitchen']['preferences'][self.owner.id]['ui'])
        self.assertEqual(len((await self.api('diary', {'date': '2026-10-14'}))['entries']), 2)
        food_readback = (await self.api('food', {'food_id': ids['food']}))['food']
        self.assertEqual(food_readback, {**backup['foods'][ids['food']], 'is_favorite': True, 'favorite': backup['favorites'][ids['food']]})
        async with self.client.get(self.origin + ids['media'], headers=self.headers()) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(Image.open(io.BytesIO(await response.read())).format, 'WEBP')
        # Exact retry neither rewrites Store nor appends another ledger row.
        await self.restore(backup, payload_id)
        self.assertEqual(self.durable(), readback)
        self.assertEqual(await self.backup(), readback)
        from tools.macromate_transfer import download_backup, restore_backup
        sdk_snapshot = await asyncio.to_thread(download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
        self.assertEqual(sdk_snapshot['data'], readback)
        sdk_result = await asyncio.to_thread(restore_backup, self.origin, self.tokens[0][1], backup, request_id=payload_id + '-sdk', confirm=True, trusted_lan_http=True)
        self.assertEqual(sdk_result, {'restored': True, 'schema_version': 3})
        sdk_readback = (await asyncio.to_thread(download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True))['data']
        for field in backup:
            if field != 'ledger':
                self.assertEqual(sdk_readback[field], backup[field])
        self.assertEqual(sdk_readback['ledger'][:-1], backup['ledger'])
        self.assertEqual(self.durable(), sdk_readback)

    async def test_all_recipe_plan_timer_preset_persisted_fields_required_and_typed(self):
        ids = await self.populate()
        backup = await self.backup()
        for bucket, name in (('recipes', 'recipe'), ('meal_plan', 'plan'), ('timers', 'timer'), ('timer_presets', 'preset')):
            row = backup['kitchen'][bucket][ids[name]]
            for field in row:
                with self.subTest(bucket=bucket, missing=field):
                    corrupt = deepcopy(backup)
                    del corrupt['kitchen'][bucket][ids[name]][field]
                    await self.assert_rejected_unchanged(corrupt)
                with self.subTest(bucket=bucket, invalid_type=field):
                    corrupt = deepcopy(backup)
                    object_fields = {'nutrition', 'declared_nutrition', 'nutrition_provenance', 'nutrition_raw', 'metadata', 'provenance', 'import_metadata'}
                    corrupt['kitchen'][bucket][ids[name]][field] = [] if field in object_fields else {'invalid': True}
                    await self.assert_rejected_unchanged(corrupt)
            with self.subTest(bucket=bucket, unknown=True):
                corrupt = deepcopy(backup)
                corrupt['kitchen'][bucket][ids[name]]['unknown_persisted_field'] = True
                await self.assert_rejected_unchanged(corrupt)

    async def test_crossrefs_timer_state_preferences_and_private_media_fail_closed(self):
        ids = await self.populate()
        backup = await self.backup()
        mid = ids['media'].rsplit('/', 1)[1]
        cases = [
            (['kitchen', 'timers', ids['timer'], 'preset_id'], 'missing-preset'),
            (['kitchen', 'timers', ids['timer'], 'running'], True),
            (['kitchen', 'timers', ids['timer'], 'paused_remaining'], 31),
            (['kitchen', 'meal_plan', ids['plan'], 'recipe_id'], 'missing-recipe'),
            (['kitchen', 'preferences', self.owner.id, 'shopping_usage'], []),
            (['kitchen', 'preferences', self.owner.id, 'shopping_usage'], {'arbitrary': {'user_frequency': True, 'last_used': None}}),
            (['kitchen', 'preferences', 'shopping', 'country'], 'MISSING'),
            (['kitchen', 'preferences', 'shopping', 'enable_price_tracking'], 'yes'),
            (['kitchen', 'preferences', 'shopping', 'unknown_setting'], True),
            (['kitchen', 'active_lists', 'outsider'], 'missing-list'),
            (['kitchen', 'shopping_items', ids['item'], 'list_id'], 'missing-list'),
            (['kitchen', 'shopping_items', ids['item'], 'category_id'], 'missing-category'),
            (['kitchen', 'shopping_items', ids['item'], 'estimated_total'], 7),
            (['kitchen', 'shopping_lists', ids['list'], 'category_order'], ['missing-category']),
            (['kitchen', 'products', ids['product'], 'category_id'], 'missing-category'),
            (['kitchen', 'regions', 'XY', 'code'], 'XZ'),
            (['kitchen', 'media', mid, 'unknown_media_field'], True),
            (['kitchen', 'media', mid, 'allowed_users'], [True]),
            (['kitchen', 'media', mid, 'owner_id'], ''),
            (['kitchen', 'media', mid, 'data'], 'not-base64'),
            (['kitchen', 'recipes', ids['recipe'], 'image_url'], '/api/macromate/media/missing'),
            (['kitchen', 'recipes', ids['recipe'], 'image_url'], 'missing-bare-media'),
            (['kitchen', 'recipes', ids['recipe'], 'photos'], ['/api/macromate/media/../invalid']),
        ]
        for path, value in cases:
            with self.subTest(path=path[-2:]):
                corrupt = deepcopy(backup)
                target = corrupt
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
                await self.assert_rejected_unchanged(corrupt)
        for bucket, name, fields in (
            ('shopping_lists', 'list', ('icon', 'item_order', 'category_order', 'ha_todo_entity_id')),
            ('shopping_items', 'item', ('quantity', 'unit', 'category_id', 'checked', 'checked_at', 'estimated_total')),
            ('products', 'product', ('source', 'custom', 'region', 'default_quantity')),
            ('categories', 'category', ('system', 'sort_order', 'region')),
            ('loyalty_cards', 'card', ('barcode_type', 'logo')),
            ('regions', None, ('code',)),
        ):
            for field in fields:
                with self.subTest(bucket=bucket, missing=field):
                    corrupt = deepcopy(backup)
                    del corrupt['kitchen'][bucket][ids[name] if name else 'XY'][field]
                    await self.assert_rejected_unchanged(corrupt)
            with self.subTest(bucket=bucket, unknown=True):
                corrupt = deepcopy(backup)
                corrupt['kitchen'][bucket][ids[name] if name else 'XY']['unknown_field'] = None
                await self.assert_rejected_unchanged(corrupt)

    async def test_maximum_accepted_root_depth_roundtrips_restore_wrapper(self):
        from custom_components.macromate.platform_support import validate_json
        nested = 'synthetic-leaf'
        for _ in range(27):
            nested = [nested]
        # No replay result containing this preference: the persisted root leaf
        # is exactly depth 32, while the transfer's data wrapper adds one.
        await self.api('preferences_update', {'preferences': {'deep': nested}})
        backup = await self.backup()
        validate_json(backup, max_bytes=67108864)
        with self.assertRaisesRegex(ValueError, 'deep'):
            validate_json({'data': backup}, max_bytes=67108864 + 8192)
        self.assertTrue((await self.restore(backup, 'depth-restore'))['restored'])
        self.assertEqual((await self.backup())['kitchen'], backup['kitchen'])
        self.assertEqual(self.durable()['kitchen'], backup['kitchen'])
        corrupt = deepcopy(backup)
        corrupt['kitchen']['preferences'][self.owner.id]['ui']['deep'] = [nested]
        await self.assert_rejected_unchanged(corrupt, 'over-depth')

    async def test_sparse_historical_shopping_import_and_deleted_product_snapshots_roundtrip(self):
        await self.historical('shopping_import_data', {'data': {
            'slm_backup_version': '2.0', 'country': 'NZ',
            'user_products': [{'id': 'import-product', 'name': 'Synthetic imported', 'category_id': 'import-category'}],
            'categories': [{'id': 'import-category', 'name': 'Synthetic import category'}],
            'regions': [{'id': 'XZ', 'code': 'XZ', 'name': 'Synthetic imported region'}],
            'lists': [{'id': 'import-list', 'name': 'Synthetic imported list'}],
            'items': {'import-list': [{'id': 'import-item', 'list_id': 'import-list', 'name': 'Synthetic snapshot', 'product_id': 'import-product'}]},
            'loyalty_cards': [{'id': 'import-card', 'name': 'Synthetic imported card', 'number': '0001'}],
        }, 'request_id': 'sparse-import'})
        await self.historical('shopping_products_delete', {'product_id': 'import-product'})
        backup = await self.backup()
        self.assertTrue((await self.restore(backup, 'imported-restore'))['restored'])
        self.assertEqual((await self.backup())['kitchen'], backup['kitchen'])
        self.assertEqual((await self.historical('shopping_items_get_one', {'item_id': 'import-item'}))['item']['product_id'], 'import-product')

    async def test_legacy_schema_migrations_preserve_sections_and_replay(self):
        payload = {'name': 'Synthetic legacy', 'meal_type': 'lunch', 'calories': 100, 'date': '2026-10-14', 'request_id': 'legacy-entry'}
        accepted = await self.api('log_meal', payload)
        backup = await self.backup()
        for schema in (1, 2):
            with self.subTest(schema=schema):
                legacy = deepcopy(backup)
                legacy['schema'] = schema
                legacy.pop('kitchen')
                await self.restore(legacy, 'schema-' + str(schema))
                readback = await self.backup()
                for field in ('entries', 'foods', 'favorites', 'daily_goals'):
                    self.assertEqual(readback[field], legacy[field])
                self.assertEqual(readback['ledger'][:-1], legacy['ledger'])
                self.assertEqual(readback['schema'], 3)
                self.assertTrue(all(not rows for rows in readback['kitchen'].values()))
                self.assertEqual(await self.api('log_meal', payload), accepted)
        future = deepcopy(backup)
        future['schema'] = 4
        await self.assert_rejected_unchanged(future, 'future-schema')

    async def test_identifiers_and_optional_diary_fields_are_not_silently_repaired(self):
        ids = await self.populate()
        backup = await self.backup()
        for identifier in (' padded ', 'broken/id', 'with space', 'control\u0001'):
            with self.subTest(recipe_identifier=repr(identifier)):
                corrupt = deepcopy(backup)
                row = corrupt['kitchen']['recipes'].pop(ids['recipe'])
                row['id'] = identifier
                corrupt['kitchen']['recipes'][identifier] = row
                # Keep references consistent so no referential mismatch masks
                # malformed identifiers that would otherwise be "repaired".
                corrupt['kitchen']['meal_plan'][ids['plan']]['recipe_id'] = identifier
                await self.assert_rejected_unchanged(corrupt)
        food_index = next(i for i, entry in enumerate(backup['entries']) if entry.get('food_id'))
        for field, value in (('id', 123), ('amount', True), ('quantity', True), ('serving_id', {'invalid': True})):
            with self.subTest(diary_field=field):
                corrupt = deepcopy(backup)
                corrupt['entries'][food_index][field] = value
                await self.assert_rejected_unchanged(corrupt)
        corrupt = deepcopy(backup)
        corrupt['ledger'][0]['payload_hash'] = 'not-a-hash'
        await self.assert_rejected_unchanged(corrupt, 'ledger-corrupt')

    async def test_revoked_members_stale_active_selection_is_inert_not_a_restore_grant(self):
        parent = (await self.historical('shopping_lists_create', {'name': 'Synthetic revocation'}))['list']
        await self.historical('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': [self.other.id]})
        await self.historical('shopping_lists_set_active', {'list_id': parent['id']}, index=1)
        await self.historical('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': []})
        backup = await self.backup()
        await self.restore(backup, 'revoked-selection')
        self.assertEqual((await self.backup())['kitchen'], backup['kitchen'])
        self.assertEqual((await self.historical('shopping_lists_get_all', index=1))['lists'], [])

    async def test_restore_byte_bounds_are_local_and_fail_before_saving(self):
        from custom_components.macromate.platform_api import LIMITS
        self.assertEqual(LIMITS['root_data_budget_bytes'], 67108864)
        self.assertEqual(LIMITS['restore_metadata_reserve_bytes'], 4194304)
        self.assertEqual(LIMITS['root_state_bytes'], 71303168)
        self.assertEqual(LIMITS['restore_http_request_bytes'], 71311360)
        await self.api('preferences_update', {'preferences': {'seed': True}})
        before, durable = await self.backup(), self.durable()
        # Real generic HA requests retain their smaller native cap.
        async with self.client.post(
            self.origin + '/api/services/macromate/platform_restore?return_response',
            headers=self.headers(), data=b' ' * (16777216 + 1),
        ) as response:
            self.assertEqual(response.status, 413)
            await response.read()
        async with self.client.post(
            self.origin + '/api/macromate/restore', headers=self.headers(),
            data=b' ' * (LIMITS['restore_http_request_bytes'] + 1),
        ) as response:
            self.assertEqual(response.status, 413)
            await response.read()
        # Root overflow smaller than the wrapper allowance is still rejected.
        data = deepcopy(before)
        data['kitchen']['preferences']['synthetic-size'] = {'notes': 'x' * 67108864}
        await self.restore(data, 'root-byte-overflow', status=400)
        self.assertEqual(await self.backup(), before)
        self.assertEqual(self.durable(), durable)

    async def test_ordinary_items_roundtrip_with_parent_acl_not_forged_local_acl(self):
        parent = (await self.historical('shopping_lists_create', {'name': 'Synthetic list', 'request_id': 'list'}))['list']
        await self.historical('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': [self.other.id]})
        item = (await self.historical('shopping_items_add', {'list_id': parent['id'], 'name': 'Synthetic oats', 'request_id': 'item'}, index=1))['item']
        self.assertNotIn('owner_id', item)
        self.assertNotIn('allowed_users', item)
        backup = await self.backup()
        self.assertEqual((await self.api('platform_backup'))['data'], backup)
        self.assertTrue((await self.restore(backup))['restored'])
        self.assertEqual((await self.historical('shopping_items_get_one', {'item_id': item['id']}, index=1))['item'], item)
        self.assertEqual(self.durable()['kitchen'], backup['kitchen'])
        self.assertEqual(self.durable()['ledger'][:-1], backup['ledger'])
        await self.historical('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': []})
        async with self.client.post(self.origin + '/api/services/macromate/shopping_items_get_one?return_response', headers=self.headers(1), json={'item_id': item['id']}) as response:
            self.assertEqual(response.status, 400)  # Native HA wraps service authorization failures.
