"""Test-only historical fixture builder. Never register or invoke a shopping API.

The dormant pure decoder/serializer is used to reconstruct records from the old
format; all live accessibility assertions must use the real coordinator instead.
"""
from copy import deepcopy
from custom_components.macromate.platform_support import Actor, utc_timestamp
from custom_components.macromate.shopping import shopping_command

def historical_dataset(owner='historical-owner'):
    """Reconstruct a populated pre-retirement kitchen without an active API."""
    from custom_components.macromate.platform_support import empty_kitchen
    kitchen = empty_kitchen()
    actor = Actor(owner, is_admin=True)
    def old(action, payload):
        return shopping_command(kitchen, action, payload, actor, '2026-10-01T12:00:00+00:00')
    category = old('shopping_categories_add', {'name': 'Historical category'})['category']
    product = old('shopping_products_add', {'name': 'Historical product', 'category_id': category['id']})['product']
    parent = old('shopping_lists_create', {'name': 'Historical list'})['list']
    old('shopping_lists_update_members', {'list_id': parent['id'], 'allowed_users': ['historical-member']})
    old('shopping_items_add', {'list_id': parent['id'], 'name': 'Historical item', 'product_id': product['id'], 'quantity': 2})
    old('shopping_loyalty_add', {'name': 'Historical card', 'number': '000123'})
    old('shopping_lists_set_active', {'list_id': parent['id']})
    # Historical normalized media and inert migration metadata must not be pruned.
    import io, base64
    from PIL import Image
    from custom_components.macromate.kitchen_network import normalize_image
    stream = io.BytesIO()
    Image.new('RGB', (2, 2), 'blue').save(stream, format='PNG')
    image = normalize_image(base64.b64encode(stream.getvalue()).decode())
    kitchen['media']['historical-image'] = {**image, 'owner_id': owner, 'allowed_users': []}
    kitchen['preferences'][owner]['legacy_original'] = {'literal': ['000123', None, '  unchanged  ']}
    return kitchen

async def historical_shopping(coord, action, payload=None, actor=None):
    actor = actor or Actor(None, trusted_internal=True)
    values = deepcopy(payload or {})
    values.pop('request_id', None)
    def stage(state):
        return shopping_command(state['kitchen'], action, values, actor, utc_timestamp())
    return await coord._transact('historical-fixture', {}, None, stage)
