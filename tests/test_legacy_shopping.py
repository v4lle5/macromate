"""Pure vertical legacy Store adapters; upstream is inspected as data, never imported."""
from copy import deepcopy
import importlib
import importlib.util
import unittest

from custom_components.macromate.platform_support import Actor, empty_kitchen
from custom_components.macromate.shopping import shopping_command, REGION_RECORD
from custom_components.macromate.platform_support import validate_payload

NOW = '2026-10-15T10:00:00Z'
ADMIN = Actor('admin', is_admin=True)
PREFIX = 'shopping_list_manager.'


def root():
    return {'schema': 3, 'entries': [], 'ledger': [], 'foods': {},
            'favorites': {}, 'daily_goals': {}, 'kitchen': empty_kitchen()}


def migrate(state, stores, images=None, actor=ADMIN, **kwargs):
    module = importlib.import_module('custom_components.macromate.legacy_shopping')
    return module.import_legacy_shopping(state, stores, images or {}, actor, NOW,
                                         country=kwargs.pop('country', 'NZ'), **kwargs)


class LegacyShoppingTests(unittest.TestCase):
    def assert_current_root(self, state):
        if importlib.util.find_spec('homeassistant') is not None:
            from custom_components.macromate.coordinator import MealTrackerCoordinator
            validator = MealTrackerCoordinator.__new__(MealTrackerCoordinator)
            self.assertEqual(validator._validate_restore(state), state)

    def test_large_valid_source_collection_uses_explicit_import_budget(self):
        import json
        from custom_components.macromate.platform_support import validate_json
        from custom_components.macromate.storage_budget import MAX_DATA_BYTES

        # Each real legacy card obeys the current 4096-character notes bound;
        # the complete source, not any one record, exceeds generic action JSON.
        notes = '\U0001f34e' * 4096
        cards = {f'card-{index:03d}': {'id': f'card-{index:03d}', 'name': 'Literal Card',
                 'number': f'000{index:04d}', 'notes': notes} for index in range(600)}
        stores = {PREFIX + 'loyalty_cards': cards}
        original = deepcopy(stores)
        source_bytes = len(json.dumps(stores, ensure_ascii=False).encode('utf-8'))
        self.assertGreater(source_bytes, 8 * 1024 * 1024)
        self.assertLess(source_bytes, MAX_DATA_BYTES)
        with self.assertRaisesRegex(ValueError, 'JSON payload is too large'):
            validate_json(stores)  # The global generic-action cap stays unchanged.
        state = root()
        result = migrate(state, stores)
        self.assertEqual(result['loyalty_card_ids'], list(cards))
        self.assertEqual(result['imported']['loyalty_cards'], len(cards))
        for cid, source in cards.items():
            row = state['kitchen']['loyalty_cards'][cid]
            self.assertEqual(row['id'], source['id'])
            self.assertEqual(row['notes'], notes)
            self.assertEqual(row['number'], source['number'])
            self.assertEqual((row['owner_id'], row['allowed_users']), ('admin', []))
        self.assertEqual(stores, original)
        self.assert_current_root(state)

    @unittest.skipUnless(importlib.util.find_spec('PIL'), 'Optional Pillow dependency unavailable')
    def test_eight_mib_image_base64_passes_bounded_import_and_real_normalization(self):
        import base64
        import io
        import json
        from PIL import Image, PngImagePlugin
        from custom_components.macromate.kitchen_network import MAX_IMAGE_BYTES
        from custom_components.macromate.private_media import media_bytes
        from custom_components.macromate.storage_budget import MAX_DATA_BYTES

        image = Image.new('RGB', (3, 2), 'blue')
        metadata = PngImagePlugin.PngInfo()
        metadata.add_text('legacy-metadata', '')
        baseline = io.BytesIO()
        image.save(baseline, format='PNG', pnginfo=metadata)
        # A genuinely decodable PNG exactly at the existing raw-image cap.
        # Normalization must strip this supplied textual metadata, not retain it.
        metadata = PngImagePlugin.PngInfo()
        metadata.add_text('legacy-metadata', 'x' * (MAX_IMAGE_BYTES - len(baseline.getvalue())))
        stream = io.BytesIO()
        image.save(stream, format='PNG', pnginfo=metadata)
        raw = stream.getvalue()
        self.assertEqual(len(raw), MAX_IMAGE_BYTES)
        url = '/local/images/shopping_list_manager/exact-bound.png'
        images = {url: base64.b64encode(raw).decode('ascii')}
        encoded_bytes = len(json.dumps(images, ensure_ascii=False).encode('utf-8'))
        self.assertGreater(encoded_bytes, 8 * 1024 * 1024)
        self.assertLess(encoded_bytes, MAX_DATA_BYTES)
        stores = {PREFIX + 'products': {'P': {'id': 'P', 'name': 'Image',
                  'category_id': 'other', 'image_url': url}}}
        original_stores, original_images = deepcopy(stores), deepcopy(images)
        state = root()
        result = migrate(state, stores, images)
        mid = result['media_ids'][0]
        normalized = media_bytes(state['kitchen'], mid, ADMIN)
        self.assertLess(len(normalized), MAX_IMAGE_BYTES)
        with Image.open(io.BytesIO(normalized)) as decoded:
            self.assertEqual((decoded.format, decoded.size), ('WEBP', (3, 2)))
            self.assertEqual(decoded.getpixel((0, 0)), (0, 0, 255))
            self.assertNotIn('legacy-metadata', decoded.info)
        self.assertEqual(state['kitchen']['media'][mid]['owner_id'], 'admin')
        with self.assertRaises(PermissionError):
            media_bytes(state['kitchen'], mid, Actor('stranger'))
        self.assertEqual(stores, original_stores)
        self.assertEqual(images, original_images)
        self.assert_current_root(state)

        # Keep the real decoder's independent raw-byte limit; widening the
        # import envelope must not permit even one excess supplied image byte.
        oversized = {url: base64.b64encode(raw + b'x').decode('ascii')}
        untouched = root()
        before, original = deepcopy(untouched), deepcopy(oversized)
        with self.assertRaisesRegex(ValueError, 'Decoded data exceeds limit'):
            migrate(untouched, stores, oversized)
        self.assertEqual(untouched, before)
        self.assertEqual(stores, original_stores)
        self.assertEqual(oversized, original)

    def test_source_and_image_json_keep_explicit_finite_byte_bounds_atomically(self):
        import json
        from custom_components.macromate.storage_budget import MAX_DATA_BYTES

        for field in ('stores', 'images'):
            with self.subTest(field=field):
                # The JSON gate must reject before record validation or decoding,
                # not merely rely on a later schema/unused-image error.
                oversized = {'padding': ''}
                overhead = len(json.dumps(oversized, ensure_ascii=False).encode('utf-8'))
                oversized['padding'] = 'x' * (MAX_DATA_BYTES + 1 - overhead)
                self.assertEqual(len(json.dumps(oversized).encode('utf-8')), MAX_DATA_BYTES + 1)
                stores, images = (oversized, {}) if field == 'stores' else ({}, oversized)
                state = root()
                before = deepcopy(state)
                source_before, images_before = deepcopy(stores), deepcopy(images)
                with self.assertRaisesRegex(ValueError, 'JSON payload is too large'):
                    migrate(state, stores, images)
                self.assertEqual(state, before)
                self.assertEqual(stores, source_before)
                self.assertEqual(images, images_before)

    def test_pinned_c55e90d_v2_envelopes_match_all_supported_raw_stores(self):
        # Actual pin: storage.py:47-52 uses STORAGE_VERSION for all six Stores;
        # const.py:7 sets it to 2, including categories/cards/custom_regions.
        data = {
            PREFIX + 'lists': {'L': {'id': 'L', 'name': '  Literal List  ', 'item_order': ['I']}},
            PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Item', 'category_id': 'C'}]},
            PREFIX + 'products': {'P': {'id': 'P', 'name': 'Product', 'category_id': 'C'}},
            PREFIX + 'categories': [{'id': 'C', 'name': 'Category', 'system': False}],
            PREFIX + 'loyalty_cards': {'card': {'id': 'card', 'name': 'Card', 'number': '0001'}},
            PREFIX + 'custom_regions': {'regions': {'XQ': '  Legacy Region / Home  '}},
        }
        wrapped = {key: {'version': 2, 'minor_version': 1, 'key': key, 'data': value}
                   for key, value in data.items()}
        original_data, original_wrapped = deepcopy(data), deepcopy(wrapped)
        expected, state = root(), root()
        expected_result = migrate(expected, data, country='GB')
        self.assertEqual(migrate(state, wrapped, country='GB'), expected_result)
        self.assertEqual(state, expected)
        self.assertEqual(state['kitchen']['regions']['XQ']['name'], '  Legacy Region / Home  ')
        self.assertEqual(data, original_data)
        self.assertEqual(wrapped, original_wrapped)
        self.assert_current_root(state)

        # Do not broaden to unsupported historical core or auxiliary v1 Stores.
        for key in wrapped:
            envelope = wrapped[key]
            invalid: list[dict] = [dict(envelope, **{field: value}) for field, value in (
                ('version', 1), ('version', 3), ('version', True), ('version', 2.0),
                ('minor_version', 0), ('minor_version', 2), ('minor_version', True),
                ('key', PREFIX + 'wrong'), ('key', True), ('data', None))]
            invalid.extend({k: v for k, v in envelope.items() if k != field} for field in envelope)
            invalid.append({**envelope, 'extra': {}})
            for payload in invalid:
                with self.subTest(key=key, fields=list(payload)):
                    bad = {**wrapped, key: payload}
                    before, source_before = root(), deepcopy(bad)
                    untouched = deepcopy(before)
                    with self.assertRaises(ValueError):
                        migrate(untouched, bad, country='GB')
                    self.assertEqual(untouched, before)
                    self.assertEqual(bad, source_before)

    def test_region_string_wrapper_becomes_literal_private_typed_record(self):
        state = root()
        stores = {PREFIX + 'custom_regions': {'regions': {'XY': 'Literal  Région '}}}
        original = deepcopy(stores)
        result = migrate(state, stores)
        row = state['kitchen']['regions']['XY']
        validate_payload(row, REGION_RECORD)
        self.assertEqual(row, {'id': 'XY', 'code': 'XY', 'name': 'Literal  Région ',
                              'currency_symbol': None, 'currency': None, 'language': None,
                              'owner_id': 'admin', 'allowed_users': []})
        self.assertEqual(result['source'], 'shopping_list_manager')
        self.assertEqual(result['region_codes'], ['XY'])
        self.assertEqual(result['imported']['regions'], 1)
        self.assertEqual(result['permission_policy']['mode'], 'reset_private')
        self.assertEqual(stores, original)
        self.assertEqual(shopping_command(state['kitchen'], 'shopping_regions_get',
                         {'code': 'XY'}, ADMIN, NOW)['region'], row)

    def test_actual_keyed_stores_preserve_ids_values_order_and_current_roundtrip(self):
        state = root()
        stores = {
            PREFIX + 'lists': {'list 01': {'id': 'list 01', 'name': 'Weekly',
                'owner_id': 'old-owner', 'allowed_users': ['member'], 'active': True,
                'item_order': ['item-02', 'item-01'], 'category_order': ['custom-cat', 'other']}},
            PREFIX + 'items': {'list 01': [
                {'id': 'item-01', 'list_id': 'list 01', 'name': 'Flour', 'category_id': 'custom-cat',
                 'product_id': 'custom-product', 'quantity': .25, 'unit': 'kg', 'barcode': '0000123'},
                {'id': 'item-02', 'list_id': 'list 01', 'name': 'Water', 'category_id': 'other',
                 'quantity': 2, 'unit': 'L', 'price': 0, 'estimated_total': 0}]},
            PREFIX + 'products': {'custom-product': {'id': 'custom-product', 'name': 'Flour',
                'category_id': 'custom-cat', 'custom': True, 'source': 'user', 'barcode': '0000123',
                'nutrition': None, 'default_unit': 'kg', 'default_quantity': .25}},
            PREFIX + 'categories': [{'id': 'custom-cat', 'name': 'Custom', 'icon': 'mdi:cart',
                                    'color': '#123456', 'sort_order': 14, 'system': False}],
            PREFIX + 'loyalty_cards': {'card-01': {'id': 'card-01', 'name': 'Card',
                'number': '0000001', 'barcode': '0000001', 'owner_id': 'old-owner', 'allowed_users': ['member']}},
        }
        before = deepcopy(stores)
        result = migrate(state, stores)
        k = state['kitchen']
        self.assertEqual(result['list_ids'], ['list 01'])
        self.assertEqual(result['item_ids'], ['item-01', 'item-02'])
        self.assertEqual(k['shopping_lists']['list 01']['item_order'], ['item-02', 'item-01'])
        self.assertEqual(k['shopping_lists']['list 01']['category_order'], ['custom-cat', 'other'])
        self.assertEqual(k['active_lists'], {'admin': 'list 01'})
        self.assertEqual(k['shopping_lists']['list 01']['owner_id'], 'admin')
        self.assertEqual(k['shopping_lists']['list 01']['allowed_users'], [])
        self.assertEqual(k['shopping_items']['item-01']['barcode'], '0000123')
        self.assertEqual(k['shopping_items']['item-01']['quantity'], .25)
        self.assertIsNone(k['shopping_items']['item-01']['price'])
        self.assertIsNone(k['products']['custom-product']['nutrition'])
        self.assertEqual(k['loyalty_cards']['card-01']['number'], '0000001')
        export = shopping_command(k, 'shopping_export_data', {}, ADMIN, NOW)
        fresh = empty_kitchen()
        shopping_command(fresh, 'shopping_import_data', {'data': export}, ADMIN, NOW)
        self.assertEqual(shopping_command(fresh, 'shopping_items_get', {'list_id': 'list 01'}, ADMIN, NOW)['items'],
                         shopping_command(k, 'shopping_items_get', {'list_id': 'list 01'}, ADMIN, NOW)['items'])
        updated = shopping_command(k, 'shopping_items_increment', {'item_id': 'item-01', 'amount': .5}, ADMIN, NOW)
        self.assertEqual(updated['item']['quantity'], .75)
        self.assertEqual(stores, before)
        self.assert_current_root(state)

    @unittest.skipUnless(importlib.util.find_spec('PIL'), 'Optional Pillow dependency unavailable')
    def test_supplied_both_local_prefixes_become_private_media_with_parent_acl(self):
        import base64
        import io
        from PIL import Image
        from custom_components.macromate.private_media import media_bytes
        stream = io.BytesIO()
        Image.new('RGB', (3, 2), 'blue').save(stream, format='PNG')
        encoded = base64.b64encode(stream.getvalue()).decode('ascii')
        for prefix in ('/local/images/shopping_list_manager/', '/local/shopping_list_manager/images/'):
            with self.subTest(prefix=prefix):
                url = prefix + 'Crème_brûlée - literal.png'
                state = root()
                stores = {PREFIX + 'lists': {'L': {'id': 'L', 'name': 'Shared',
                          'owner_id': 'owner', 'allowed_users': ['member'], 'item_order': ['I']}},
                          PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Image item',
                                                   'category_id': 'other', 'image_url': url}]}}
                result = migrate(state, stores, {url: encoded}, preserve_permissions=True)
                reference = result['image_map'][url]
                self.assertTrue(reference.startswith('/api/macromate/media/'))
                mid = result['media_ids'][0]
                media = state['kitchen']['media'][mid]
                self.assertEqual(media['owner_id'], 'owner')
                self.assertEqual(media['allowed_users'], ['member'])
                self.assertEqual(media['content_type'], 'image/webp')
                self.assertEqual(state['kitchen']['shopping_items']['I']['image_url'], reference)
                self.assertEqual(media_bytes(state['kitchen'], mid, Actor('member')),
                                 base64.b64decode(media['data']))
                with self.assertRaises(PermissionError):
                    media_bytes(state['kitchen'], mid, Actor('stranger'))
                self.assertEqual(stores[PREFIX + 'items']['L'][0]['image_url'], url)
                self.assert_current_root(state)

    def test_real_catalog_store_qualifies_only_exact_source_ids_into_personal_overrides(self):
        from custom_components.macromate import shopping
        total = 0
        for country in shopping.COUNTRIES:
            trusted = shopping._catalog(country)
            unchanged = deepcopy(trusted)
            products = {}
            for pid, base in trusted.items():
                value = {key: deepcopy(val) for key, val in base.items() if key != 'region'}
                value['id'] = pid.split(':', 1)[1]
                products[value['id']] = value
            first = next(iter(products))
            products[first]['name'] = 'Literal catalog customization'
            products[first]['price'] = 0
            categories = shopping._categories(empty_kitchen(), country, ADMIN)
            state = root()
            result = migrate(state, {PREFIX + 'products': products,
                                     PREFIX + 'categories': categories}, country=country,
                             preserve_permissions=True)
            self.assertEqual(result['id_map'], {pid: country + ':' + pid for pid in products})
            self.assertEqual(result['product_ids'], list(trusted))
            self.assertEqual(state['kitchen']['products']['admin|' + country + ':' + first]['price'], 0)
            self.assertEqual(state['kitchen']['products']['admin|' + country + ':' + first]['name'],
                             'Literal catalog customization')
            self.assertTrue(all(row['owner_id'] == 'admin' and row['allowed_users'] == []
                                for row in state['kitchen']['products'].values()))
            self.assertEqual(state['kitchen']['categories'], {})
            self.assertEqual(trusted, unchanged)
            exported = shopping_command(state['kitchen'], 'shopping_export_data', {}, ADMIN, NOW)
            fresh = empty_kitchen()
            shopping_command(fresh, 'shopping_import_data', {'data': exported}, ADMIN, NOW)
            self.assertEqual(fresh['products'], state['kitchen']['products'])
            self.assert_current_root(state)
            total += len(trusted)
        self.assertEqual(total, 922)

    def test_literal_store_ids_named_data_key_version_are_not_envelope_repaired(self):
        state = root()
        values = {key: {'id': key, 'name': 'Literal ' + key} for key in ('data', 'key', 'version', 'minor_version')}
        result = migrate(state, {PREFIX + 'lists': values})
        self.assertEqual(result['list_ids'], list(values))
        key = PREFIX + 'lists'
        wrapped = {key: {'version': 2, 'minor_version': 1, 'key': key, 'data': values}}
        fresh = root()
        self.assertEqual(migrate(fresh, wrapped)['list_ids'], list(values))
        self.assertEqual(state, fresh)

    def test_child_acl_cannot_grant_access_independently_of_shared_parent(self):
        state = root()
        stores = {PREFIX + 'lists': {'L': {'id': 'L', 'name': 'Private', 'owner_id': 'owner', 'item_order': ['I']}},
                  PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Child',
                                           'owner_id': None, 'allowed_users': ['stranger']}]}}
        before = deepcopy(state)
        with self.assertRaises(ValueError):
            migrate(state, stores, preserve_permissions=True)
        self.assertEqual(state, before)

    def test_legacy_references_cannot_attach_existing_private_custom_records(self):
        state = root()
        state['kitchen']['products']['secret-product'] = {'id': 'secret-product', 'name': 'Hidden',
                'category_id': 'other', 'source': 'user', 'owner_id': 'stranger', 'allowed_users': []}
        stores = {PREFIX + 'lists': {'L': {'id': 'L', 'name': 'Imported'}},
                  PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Child',
                                           'product_id': 'secret-product'}]}}
        before = deepcopy(state)
        with self.assertRaises(ValueError):
            migrate(state, stores)
        self.assertEqual(state, before)

    def test_typed_region_envelope_acl_policy_is_explicit_and_admin_only(self):
        key = PREFIX + 'custom_regions'
        values = {'regions': {'XY': {'name': '  Exact name ', 'currency_symbol': '¤', 'language': 'de'},
                              'XZ': {'name': 'Private', 'owner_id': 'literal-owner', 'allowed_users': ['member']}}}
        stores = {key: {'version': 2, 'minor_version': 1, 'key': key, 'data': values}}
        for preserve in (False, True):
            state = root()
            result = migrate(state, stores, preserve_permissions=preserve)
            self.assertEqual(result['region_codes'], ['XY', 'XZ'])
            self.assertEqual(state['kitchen']['regions']['XY']['name'], '  Exact name ')
            self.assertEqual(state['kitchen']['regions']['XY']['owner_id'], None if preserve else 'admin')
            self.assertEqual(state['kitchen']['regions']['XZ']['owner_id'], 'literal-owner' if preserve else 'admin')
            self.assertEqual(state['kitchen']['regions']['XZ']['allowed_users'], ['member'] if preserve else [])
        with self.assertRaises(PermissionError):
            migrate(root(), stores, actor=Actor('member'), preserve_permissions=True)
        for flag in (1, None, 'true', []):
            with self.subTest(flag=flag), self.assertRaises(ValueError):
                migrate(root(), stores, preserve_permissions=flag)

    def test_bad_source_shapes_envelopes_and_literal_ids_fail_atomically(self):
        key = PREFIX + 'lists'
        envelope = {'version': 2, 'minor_version': 1, 'key': key, 'data': {'L': {'id': 'L', 'name': 'List'}}}
        cases = [
            {key: None}, {key: []}, {PREFIX + 'items': []}, {PREFIX + 'products': []},
            {PREFIX + 'categories': {}}, {PREFIX + 'loyalty_cards': []},
            {PREFIX + 'custom_regions': {'XY': 'Missing wrapper'}},
            {key: {'L': {'id': 'different', 'name': 'Mismatch'}}},
            {key: {'L': {'id': 'L', 'name': 'List', 'actor': {'is_admin': True}}}},
            {'lists': {}}, {'shopping_list_manager.regions': {}},
        ]
        for field, value in [('version', 1), ('version', True), ('version', 3),
                             ('minor_version', 2), ('minor_version', True), ('key', PREFIX + 'products')]:
            cases.append({key: {**envelope, field: value}})
        for field in envelope:
            cases.append({key: {k: v for k, v in envelope.items() if k != field}})
        for invalid in ('', '  ', 'bad\nID', 'reserved|id'):
            cases.append({key: {invalid: {'id': invalid, 'name': 'Bad ID'}}})
        for code in ('xy', 'XY/..', 'NZ', 'XY123456789'):
            cases.append({PREFIX + 'custom_regions': {'regions': {code: 'Name'}}})
        for payload in cases:
            with self.subTest(payload=payload):
                state = root()
                before, original = deepcopy(state), deepcopy(payload)
                with self.assertRaises(ValueError):
                    migrate(state, payload)
                self.assertEqual(state, before)
                self.assertEqual(payload, original)

    def test_collisions_reject_instead_of_overwrite_or_name_deduplication(self):
        stores = {PREFIX + 'lists': {'A': {'id': 'A', 'name': 'Same'}, 'B': {'id': 'B', 'name': 'Same'}}}
        state = root()
        self.assertEqual(migrate(state, stores)['list_ids'], ['A', 'B'])
        before = deepcopy(state)
        with self.assertRaises(ValueError):
            migrate(state, stores)
        self.assertEqual(state, before)
        for country in ('nz', '', '../NZ', None):
            with self.subTest(country=country), self.assertRaises(ValueError):
                migrate(root(), {}, country=country)

    @unittest.skipUnless(importlib.util.find_spec('PIL'), 'Optional Pillow dependency unavailable')
    def test_local_media_missing_bad_ambiguous_and_collision_reject_without_source_io(self):
        import base64
        import io
        from PIL import Image
        from unittest.mock import patch
        stream = io.BytesIO()
        Image.new('RGB', (2, 2), 'red').save(stream, format='PNG')
        encoded = base64.b64encode(stream.getvalue()).decode('ascii')
        prefix = '/local/images/shopping_list_manager/'
        def stores(url):
            return {PREFIX + 'products': {'P': {'id': 'P', 'name': 'Image', 'category_id': 'other', 'image_url': url}}}
        url = prefix + 'safe.png'
        for invalid in ('../secret', '%2e%2e%2fsecret', 'a/b.png', 'a\\b.png', 'a.png?x=1', 'a.png#fragment', ''):
            reference = prefix + invalid
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                migrate(root(), stores(reference), {reference: encoded})
        for reference in ('file:///config/secret', '//host/path', '/config/secret',
                          'https://host.invalid' + url, '/api/macromate/media/guessed',
                          '/local/unknown.png'):
            with self.subTest(reference=reference), self.assertRaises(ValueError):
                migrate(root(), stores(reference), {reference: encoded})
        for images in ({}, {url: 'not base64!'}, {url: base64.b64encode(b'not an image').decode()},
                       {url: encoded, prefix + 'extra.png': encoded}):
            state = root()
            with self.subTest(images=list(images)), self.assertRaises(ValueError):
                migrate(state, stores(url), images)
            self.assertEqual(state, root())
        state = root()
        result = migrate(state, stores(url), {url: encoded})
        collision = root()
        collision['kitchen']['media'] = deepcopy(state['kitchen']['media'])
        before = deepcopy(collision)
        with self.assertRaises(ValueError):
            migrate(collision, stores(url), {url: encoded})
        self.assertEqual(collision, before)
        self.assertEqual(len(result['media_ids']), 1)
        remote = 'https://example.invalid/literal%20photo.png?keep=1'
        with patch('urllib.request.urlopen', side_effect=AssertionError('No remote fetch')):
            state = root()
            self.assertEqual(migrate(state, stores(remote))['media_ids'], [])
        self.assertEqual(state['kitchen']['products']['P']['image_url'], remote)

    def test_catalog_identity_mapping_closes_item_reference_without_bare_id_guess(self):
        stores = {PREFIX + 'products': {'prod_milk_trim': {'id': 'prod_milk_trim', 'name': 'Changed literal name',
                  'category_id': 'dairy', 'source': 'catalog'}},
                  PREFIX + 'lists': {'L': {'id': 'L', 'name': 'List'}},
                  PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Milk', 'product_id': 'prod_milk_trim'}]}}
        state = root()
        migrate(state, stores)
        self.assertEqual(state['kitchen']['shopping_items']['I']['product_id'], 'NZ:prod_milk_trim')
        del stores[PREFIX + 'products']
        with self.assertRaises(ValueError):
            migrate(root(), stores)
        for pid, source in [('NZ:prod_milk_trim', 'user'), ('made-up', 'catalog'), ('owner|id', 'user')]:
            with self.subTest(pid=pid), self.assertRaises(ValueError):
                migrate(root(), {PREFIX + 'products': {pid: {'id': pid, 'name': 'Milk',
                        'category_id': 'dairy', 'source': source}}})

    def test_current_complete_root_validator_accepts_migration(self):
        if importlib.util.find_spec('homeassistant') is None:
            self.skipTest('Pinned HA interpreter required only for existing full-root validator')
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        state = root()
        migrate(state, {PREFIX + 'lists': {'L': {'id': 'L', 'name': 'List'}},
                        PREFIX + 'items': {'L': [{'id': 'I', 'list_id': 'L', 'name': 'Literal item'}]},
                        PREFIX + 'custom_regions': {'regions': {'XY': 'Exact region'}}})
        validator = MealTrackerCoordinator.__new__(MealTrackerCoordinator)
        self.assertEqual(validator._validate_restore(state), state)

    def test_imported_legacy_usage_is_visible_to_current_crud_without_changing_source(self):
        stores = {PREFIX + 'products': {'P': {'id': 'P', 'name': 'Product', 'category_id': 'other',
                    'user_frequency': 7, 'last_used': NOW}}}
        state = root()
        migrate(state, stores)
        product = shopping_command(state['kitchen'], 'shopping_products_get', {'product_id': 'P'}, ADMIN, NOW)['product']
        self.assertEqual(product['user_frequency'], 7)
        self.assertEqual(product['last_used'], NOW)
        self.assertEqual(state['kitchen']['preferences']['admin']['shopping_usage']['P'],
                         {'user_frequency': 7, 'last_used': NOW})

    @unittest.skipUnless(importlib.util.find_spec('PIL'), 'Optional Pillow dependency unavailable')
    def test_product_loyalty_images_share_one_asset_with_explicit_reset_or_source_acl(self):
        import base64
        import io
        from PIL import Image
        from custom_components.macromate.private_media import media_bytes
        stream = io.BytesIO()
        Image.new('RGB', (2, 2), 'green').save(stream, format='PNG')
        url = '/local/shopping_list_manager/images/shared.png'
        images = {url: base64.b64encode(stream.getvalue()).decode('ascii')}
        stores = {PREFIX + 'products': {'P': {'id': 'P', 'name': 'Product', 'category_id': 'other',
                    'owner_id': 'product-owner', 'allowed_users': ['product-member'], 'image_url': url}},
                  PREFIX + 'loyalty_cards': {'C': {'id': 'C', 'name': 'Card', 'number': '0001',
                    'owner_id': 'card-owner', 'allowed_users': ['card-member'], 'logo': url}}}
        for preserve in (False, True):
            state = root()
            result = migrate(state, stores, images, preserve_permissions=preserve)
            self.assertEqual(len(result['media_ids']), 1)
            mid = result['media_ids'][0]
            media = state['kitchen']['media'][mid]
            self.assertEqual(media['owner_id'], 'admin')
            self.assertEqual(media['allowed_users'],
                             ['card-member', 'card-owner', 'product-member', 'product-owner'] if preserve else [])
            self.assertEqual(state['kitchen']['products']['P']['image_url'], state['kitchen']['loyalty_cards']['C']['logo'])
            if preserve:
                self.assertTrue(media_bytes(state['kitchen'], mid, Actor('card-member')))
                self.assertTrue(media_bytes(state['kitchen'], mid, Actor('product-member')))
            else:
                with self.assertRaises(PermissionError):
                    media_bytes(state['kitchen'], mid, Actor('product-member'))
            with self.assertRaises(PermissionError):
                media_bytes(state['kitchen'], mid, Actor('stranger'))
            self.assert_current_root(state)
        # Only the explicit preservation choice accepts the pinned public default.
        del stores[PREFIX + 'products']['P']['owner_id']
        del stores[PREFIX + 'products']['P']['allowed_users']
        state = root()
        result = migrate(state, stores, images, preserve_permissions=True)
        self.assertIsNone(state['kitchen']['media'][result['media_ids'][0]]['owner_id'])
        self.assertTrue(media_bytes(state['kitchen'], result['media_ids'][0], Actor('stranger')))

    def test_pinned_upstream_empty_or_partial_item_order_is_explicitly_completed(self):
        # Pinned add_item appends to the items Store, not ShoppingList.item_order.
        for source_order in ([], ['second']):
            state = root()
            stores = {PREFIX + 'lists': {'L': {'id': 'L', 'name': 'List', 'item_order': source_order}},
                      PREFIX + 'items': {'L': [{'id': 'first', 'list_id': 'L', 'name': 'First'},
                                               {'id': 'second', 'list_id': 'L', 'name': 'Second'}]}}
            result = migrate(state, stores)
            expected = source_order + [iid for iid in ('first', 'second') if iid not in source_order]
            self.assertEqual(state['kitchen']['shopping_lists']['L']['item_order'], expected)
            self.assertEqual(result['order_map']['L'], {'source_item_order': source_order, 'item_order': expected,
                             'policy': 'legacy_order_then_items_store_order'})
            self.assert_current_root(state)


if __name__ == '__main__':
    unittest.main()
