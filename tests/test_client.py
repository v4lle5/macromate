from __future__ import annotations

import unittest

from tools.macromate_client import service_url


class AgentClientTests(unittest.TestCase):
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
