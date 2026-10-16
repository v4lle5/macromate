from __future__ import annotations

import unittest

from tools.macromate_client import _payload, parser, service_url


class AgentClientTests(unittest.TestCase):
    def test_agent_add_keeps_omitted_macros_unknown_and_explicit_zero_known(self) -> None:
        args = parser().parse_args(["add", "--name", "Synthetic agent entry", "--meal-type", "lunch", "--calories", "350"])
        service, payload = _payload(args)
        self.assertEqual(service, "log_meal")
        for key in ("protein", "carbs", "fat"):
            self.assertNotIn(key, payload, "Agents must not turn missing nutrition into zero")
        args = parser().parse_args(["add", "--name", "Synthetic agent entry", "--meal-type", "lunch", "--calories", "350", "--protein", "0"])
        _, explicit = _payload(args)
        self.assertEqual(explicit["protein"], 0)
        self.assertNotIn("carbs", explicit)
        self.assertNotIn("fat", explicit)

    def test_service_url_uses_authenticated_home_assistant_service_endpoint(self) -> None:
        self.assertEqual(
            service_url("http://homeassistant.local:8123/", "list_meals", response=True,
                        trusted_lan_http=True),
            "http://homeassistant.local:8123/api/services/macromate/list_meals?return_response",
        )

    def test_non_response_service_has_no_response_query(self) -> None:
        self.assertEqual(
            service_url("https://ha.example", "delete_meal", response=False),
            "https://ha.example/api/services/macromate/delete_meal",
        )


if __name__ == "__main__":
    unittest.main()
