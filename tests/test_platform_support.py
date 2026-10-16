"""Pure authentication identity and payload contracts for the unified platform."""
import unittest

from custom_components.macromate import platform_support as support


class PlatformSupportTests(unittest.TestCase):
    def test_explicit_route_budget_does_not_raise_default_command_limit(self):
        import json

        payload = {"stores": {"data": ["x" * 50000 for _ in range(180)]}}
        schema = {"type": "object", "properties": {"stores": {"type": "object"}}, "additionalProperties": False}
        with self.assertRaisesRegex(ValueError, "too large"):
            support.validate_payload(payload, schema)
        encoded_size = len(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        try:
            copied = support.validate_payload(payload, schema, max_bytes=encoded_size)
        except TypeError as error:
            self.fail("Explicit finite route budget is not supported: " + str(error))
        self.assertEqual(copied, payload)
        with self.assertRaisesRegex(ValueError, "too large"):
            support.validate_payload(payload, schema, max_bytes=encoded_size - 1)
        copied["stores"]["data"][0] = "changed"
        self.assertEqual(payload["stores"]["data"][0], "x" * 50000)

    def test_actual_recipe_not_constraints_reject_conflicting_selectors_and_whitespace(self):
        from custom_components.macromate.recipes import RECIPE_ACTIONS
        schema = RECIPE_ACTIONS["meal_plan_get"]["schema"]
        for valid in ({}, {"entry_id": "plan:001"}, {"week_start": "2026-10-12"}):
            self.assertEqual(support.validate_payload(valid, schema), valid)
        for invalid in ({"entry_id": "plan:001", "week_start": "2026-10-12"}, {"entry_id": " plan:001"}, {"entry_id": "plan: 001"}):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                support.validate_payload(invalid, schema)
        with self.assertRaises(ValueError):
            support.validate_payload({}, {"not": True})
        self.assertEqual(support.validate_payload({}, {"not": False}), {})

    def test_schema_confirmation_combinations_and_unique_ids_are_enforced(self):
        schema = {"type": "object", "properties": {"confirm": {"type": "boolean", "const": True},
                  "ids": {"type": "array", "uniqueItems": True, "items": {"type": "string"}},
                  "value": {"anyOf": [{"type": "string", "minLength": 1}, {"type": "integer", "minimum": 0}]},
                  "amount": {"type": "number", "exclusiveMinimum": 0}}, "required": ["confirm"]}
        valid = {"confirm": True, "ids": ["a", "b"], "value": 0, "amount": 0.5}
        self.assertEqual(support.validate_payload(valid, schema), valid)
        for bad in ({**valid, "confirm": False}, {**valid, "confirm": 1}, {**valid, "ids": ["a", "a"]},
                    {**valid, "value": []}, {**valid, "value": ""}, {**valid, "amount": 0}):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                support.validate_payload(bad, schema)

    def test_schema_validation_rejects_unknown_fields_and_never_coerces_values(self):
        schema = {"type": "object", "additionalProperties": False, "required": ["id", "quantity", "date"],
                  "properties": {"id": {"type": "string", "minLength": 1}, "quantity": {"type": "number", "minimum": 0},
                                 "date": {"type": "string", "format": "date"}, "notes": {"type": ["string", "null"]},
                                 "items": {"type": "array", "maxItems": 2, "items": {"type": "integer"}}}}
        original = {"id": "NZ:001", "quantity": 1.5, "date": "2026-10-14", "notes": None, "items": [0, 2]}
        self.assertEqual(support.validate_payload(original, schema), original)
        for bad in ({**original, "actor_id": "admin"}, {**original, "quantity": True}, {**original, "quantity": "1.5"},
                    {**original, "date": "20261014"}, {**original, "items": [1, 2, 3]}, {**original, "items": [True]},
                    {key: value for key, value in original.items() if key != "id"}):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                support.validate_payload(bad, schema)
        self.assertEqual(support.validate_payload({"mode": "merge"}, {"type": "object", "properties": {"mode": {"enum": ["merge", "replace"]}}}), {"mode": "merge"})
        with self.assertRaises(ValueError):
            support.validate_payload({"mode": "delete"}, {"type": "object", "properties": {"mode": {"enum": ["merge", "replace"]}}})

    def test_bounded_json_and_primitives_preserve_literals_and_reject_bad_values(self):
        self.assertEqual(support.identifier("NZ:001"), "NZ:001")
        self.assertEqual(support.text("  ingredient  "), "  ingredient  ")
        self.assertEqual(support.number(1.5), 1.5)
        for value in (True, "1", float("nan"), float("inf"), -1):
            with self.subTest(value=str(value)), self.assertRaises(ValueError):
                support.number(value)
        with self.assertRaises(ValueError):
            support.text("abcd", max_length=3)
        with self.assertRaises(ValueError):
            support.identifier(" ")
        original = {"value": None, "nested": [{"amount": 0}]}
        clone = support.validate_json(original)
        self.assertEqual(clone, original)
        clone["nested"][0]["amount"] = 2
        self.assertEqual(original["nested"][0]["amount"], 0)
        with self.assertRaises(ValueError):
            support.validate_json({"bad": float("nan")})
        with self.assertRaises(ValueError):
            support.validate_json({"text": "abcdef"}, max_bytes=5)
        expected = {"recipes", "meal_plan", "timers", "timer_presets", "shopping_lists", "shopping_items", "products", "categories", "loyalty_cards", "regions", "active_lists", "preferences", "media"}
        self.assertEqual(set(support.empty_kitchen()), expected)
        self.assertTrue(all(value == {} for value in support.empty_kitchen().values()))

    def test_actor_access_cannot_turn_shared_membership_into_ownership(self):
        owner = support.Actor("owner")
        member = support.Actor("member")
        stranger = support.Actor("stranger")
        record = {"owner_id": "owner", "allowed_users": ["member"]}
        self.assertTrue(support.can_access(record, owner))
        self.assertTrue(support.can_access(record, member))
        self.assertFalse(support.can_access(record, stranger))
        self.assertFalse(support.can_access(record, support.Actor(None)))
        self.assertFalse(support.can_access({}, member), "missing ownership is not public access")
        self.assertTrue(support.can_access({"owner_id": None, "allowed_users": []}, member))
        self.assertTrue(support.can_access(record, support.Actor("admin", is_admin=True)))
        self.assertTrue(support.can_access(record, support.Actor(None, trusted_internal=True)))
        support.require_access(record, owner, owner_only=True)
        with self.assertRaises(PermissionError):
            support.require_access(record, member, owner_only=True)
        with self.assertRaises(PermissionError):
            support.require_admin(member)
        self.assertEqual(owner.owner_id, "owner")
        self.assertEqual(support.Actor(None, trusted_internal=True).owner_id, "internal")
        with self.assertRaises((ValueError, TypeError)):
            support.Actor("member", is_admin="true")


if __name__ == "__main__":
    unittest.main()
