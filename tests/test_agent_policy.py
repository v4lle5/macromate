"""Pure discovery contracts for the scoped HTTP boundary."""

from copy import deepcopy
import unittest

from custom_components.macromate.agent_policy import ACTION_SCOPES, scoped_descriptors
from custom_components.macromate.recipes import RECIPE_ACTIONS as ACTIONS
from custom_components.macromate.platform_support import validate_payload


class ScopedPolicyTests(unittest.TestCase):
    def test_discovery_requires_all_scopes_without_changing_native_registry(self):
        before = deepcopy(ACTIONS)
        for scopes in (set(), {"recipes.update"}, {"recipes.read"},
                       {"recipes.read", "recipes.create", "recipes.update"},
                       {"recipes.delete"}, {"recipes.delete", "mealplan.delete"}):
            with self.subTest(scopes=scopes):
                described = scoped_descriptors(scopes, ACTIONS)
                self.assertEqual(set(described), {
                    action for action, required in ACTION_SCOPES.items() if required <= scopes
                })
                for action, descriptor in described.items():
                    self.assertNotIn("admin_only", descriptor)
                    self.assertEqual(set(descriptor["required_scopes"]), ACTION_SCOPES[action])
                    self.assertEqual("request_id" in descriptor["schema"]["required"],
                                     not descriptor["read_only"])
        self.assertEqual(ACTIONS, before)
        all_scopes = {"recipes.read", "recipes.create", "recipes.update", "recipes.delete",
                      "mealplan.read", "mealplan.create", "mealplan.update", "mealplan.delete"}
        described = scoped_descriptors(all_scopes, ACTIONS)
        for denied in ("recipes_scrape", "recipe_keeper_import", "recipes_download_image",
                       "platform_restore", "preferences_update"):
            self.assertNotIn(denied, described)

    def test_recipe_schema_accepts_actual_agent_ids_and_blocks_network_download(self):
        schema = scoped_descriptors({"recipes.create"}, ACTIONS)["recipes_add"]["schema"]
        payload = {"name": "Banana oats", "request_id": "Breakfast: 2026-10-21",
                   "ingredients": [{"name": "Oats", "amount": "60", "unit": "g"}],
                   "download_image": False}
        validate_payload(payload, schema)
        validate_payload({**payload, "request_id": "\ufeff"}, schema)
        for request_id in (None, "", "  ", "\u2003", "\u0085", "a\nb", "valid\n", "valid\r\n", "a\x00b", "x" * 129):
            with self.subTest(request_id=request_id), self.assertRaises(ValueError):
                validate_payload({**payload, "request_id": request_id}, schema)
        for invalid in ({"name": "Missing ID"}, {**payload, "download_image": True},
                        {**payload, "actor": {"is_admin": True}}):
            with self.subTest(payload=invalid), self.assertRaises(ValueError):
                validate_payload(invalid, schema)
        # A scoped client must be able to cache/edit its descriptor independently.
        schema["properties"]["name"]["maxLength"] = 1
        self.assertEqual(ACTIONS["recipes_add"]["schema"]["properties"]["name"]["maxLength"], 300)


if __name__ == "__main__":
    unittest.main()
