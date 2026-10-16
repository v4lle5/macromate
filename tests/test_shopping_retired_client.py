"""Public clients must refuse retired shopping locally, without network I/O."""
import unittest
from unittest.mock import patch
from tools import macromate_client as client, macromate_transfer as transfer

class RetiredClientTests(unittest.TestCase):
    def test_retired_actions_have_no_service_url(self):
        for action in ('shopping_lists_create', 'shopping_items_get', 'shopping_set_country',
                       'recipe_to_shopping', 'plan_to_shopping'):
            with self.subTest(action=action), self.assertRaises(ValueError):
                client.service_url('https://example.invalid', action, response=True)

    def test_legacy_shopping_upload_is_rejected_before_network(self):
        with patch.object(transfer, '_request') as request:
            with self.assertRaises(ValueError):
                transfer.import_legacy('https://example.invalid', 'synthetic',
                    source='shopping_list_manager', stores={}, country='DE',
                    preserve_permissions=False, confirm=True, request_id='legacy')
            request.assert_not_called()
