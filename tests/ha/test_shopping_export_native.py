"""Retired shopping survives private full backup, not actor shopping transfers."""
from copy import deepcopy
import json
from pathlib import Path
import unittest
import test_unified_http as native
from historical_shopping_fixture import historical_dataset

class HistoricalShoppingPreservationTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def test_historical_records_survive_mutation_reload_backup_restore(self):
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        from custom_components.macromate.platform_support import Actor
        kitchen = historical_dataset(self.owner.id)
        # Persist old records as an upgrade fixture, not through retired routes.
        state = self.coord._state()
        state['kitchen'] = deepcopy(kitchen)
        await self.coord._store.async_save(state)
        await self.coord.async_load()
        self.assertEqual(self.coord.kitchen, kitchen)
        await self.coord.async_command('recipes_add', {'name': 'Still works'}, actor=Actor(self.owner.id, is_admin=True))
        for bucket in kitchen:
            if bucket != 'recipes':
                self.assertEqual(self.coord.kitchen[bucket], kitchen[bucket], bucket)
        async with self.client.get(self.origin + '/api/macromate/backup', headers=self.headers()) as response:
            self.assertEqual(response.status, 200)
            backup = (await response.json())['data']
        disk = json.loads(Path(self.coord._store.path).read_text())['data']
        self.assertEqual(backup, disk)
        async with self.client.post(self.origin + '/api/macromate/restore', headers=self.headers(),
            json={'data': backup, 'confirm': True, 'request_id': 'preserve-historical'}) as response:
            self.assertEqual(response.status, 200, await response.text())
        self.assertEqual(self.coord.kitchen, backup['kitchen'])
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        self.assertEqual(restarted._state(), self.coord._state())
        # All identities (including the old owner/member) lose callable access.
        for index in (0, 1):
            for action in ('shopping_export_data', 'shopping_import_data', 'shopping_lists_get_all', 'shopping_update_integration_settings'):
                async with self.client.post(self.origin + '/api/services/macromate/' + action,
                    headers=self.headers(index), json={}) as response:
                    self.assertEqual(response.status, 400)
        self.assertEqual(restarted.kitchen, backup['kitchen'])
