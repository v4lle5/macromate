"""Restricted credentials exercised on the real pinned HA HTTP server."""
import json
from pathlib import Path
import unittest
import test_unified_http as native


class AgentCredentialsTests(unittest.IsolatedAsyncioTestCase):
    headers = native.NativeHTTPTests.headers
    asyncTearDown = native.NativeHTTPTests.asyncTearDown

    async def asyncSetUp(self):
        await native.NativeHTTPTests.asyncSetUp(self)
        # Production async_setup must register these; never install a test hook.
        self.agents = self.hass.data['macromate']['agent_credentials']

    async def test_native_mint_create_readback_revoke(self):
        async with self.client.post(self.origin + '/api/macromate/agent/credentials',
                                    headers=self.headers(), json={'label': 'Synthetic'}) as r:
            self.assertEqual(r.status, 200, await r.text())
            credential = await r.json()
        headers = {'Authorization': 'Bearer ' + credential['token']}
        async with self.client.post(self.origin + '/api/macromate/agent/action/recipes_add',
                                    headers=headers, json={'name': 'Scoped oats', 'request_id': 'create-1'}) as r:
            self.assertEqual(r.status, 200, await r.text())
            recipe = (await r.json())['recipe']
        async with self.client.post(self.origin + '/api/macromate/agent/action/recipes_get',
                                    headers=headers, json={'recipe_id': recipe['id']}) as r:
            self.assertEqual(r.status, 200)
            self.assertEqual((await r.json())['recipe'], recipe)
        stored = json.loads((Path(self.tmp.name) / '.storage' / 'macromate.meals').read_text())
        self.assertEqual(stored['data']['kitchen']['recipes'][recipe['id']]['name'], 'Scoped oats')
        secret_store = Path(self.tmp.name) / '.storage' / 'macromate.agent_credentials'
        self.assertEqual(secret_store.stat().st_mode & 0o777, 0o600)
        for stored_file in (Path(self.tmp.name) / '.storage').iterdir():
            if stored_file.is_file():
                self.assertNotIn(credential['token'], stored_file.read_text())
        raw = secret_store.read_text()
        self.assertNotIn(credential['token'], raw)
        async with self.client.delete(self.origin + '/api/macromate/agent/credentials/' + credential['id'],
                                      headers=self.headers()) as r:
            self.assertEqual(r.status, 200)
        async with self.client.post(self.origin + '/api/macromate/agent/action/recipes_add',
                                    headers=headers, json={'name': 'Scoped oats', 'request_id': 'create-1'}) as r:
            self.assertEqual(r.status, 401)

    async def mint(self, **payload):
        async with self.client.post(self.origin + '/api/macromate/agent/credentials', headers=self.headers(),
                                    json={'label': 'Synthetic', **payload}) as r:
            self.assertEqual(r.status, 200, await r.text())
            return await r.json()

    async def action(self, credential, action, payload, status=200):
        async with self.client.post(self.origin + '/api/macromate/agent/action/' + action,
                                    headers={'Authorization': 'Bearer ' + credential['token']}, json=payload) as r:
            self.assertEqual(r.status, status, await r.text())
            return await r.json() if status == 200 else None

    async def test_all_forbidden_actions_private_objects_and_direct_ha_rejected(self):
        from custom_components.macromate.agent_api import ACTION_SCOPES
        from custom_components.macromate.platform_api import ACTIONS
        credential = await self.mint()
        before = self.coord._state()
        for action in (set(ACTIONS) - set(ACTION_SCOPES) - {'describe'}) | {'sql', 'file', 'shell', 'call_service', 'config', 'user_update', 'unknown'}:
            self.agents.rate.clear()  # Matrix sweep is not the independent rate-limit probe.
            await self.action(credential, action, {}, 403)
        for action in ('recipes_delete', 'meal_plan_remove', 'delete_meal'):
            await self.action(credential, action, {}, 403)
        self.assertEqual(self.coord._state(), before)
        headers = {'Authorization': 'Bearer ' + credential['token']}
        for method, path in [('GET', '/api/states'), ('GET', '/api/config'), ('GET', '/api/macromate/backup'),
                             ('POST', '/api/macromate/restore'), ('POST', '/api/services/macromate/recipes_add?return_response'),
                             ('POST', '/api/services/homeassistant/restart'), ('GET', '/api/macromate/agent/credentials'),
                             ('POST', '/api/macromate/agent/credentials')]:
            async with self.client.request(method, self.origin + path, headers=headers, json={}) as r:
                self.assertEqual(r.status, 401, path)
        async with self.client.ws_connect(self.origin + '/api/websocket') as ws:
            self.assertEqual((await ws.receive_json())['type'], 'auth_required')
            await ws.send_json({'type': 'auth', 'access_token': credential['token']})
            self.assertEqual((await ws.receive_json())['type'], 'auth_invalid')
        # Another actor's private shopping records are outside the matrix entirely.
        from custom_components.macromate.platform_support import Actor
        from historical_shopping_fixture import historical_shopping
        private = await historical_shopping(self.coord, 'shopping_lists_create', {'name': 'Private other'}, Actor(self.other.id))
        await self.action(credential, 'shopping_lists_get', {'list_id': private['list']['id']}, 403)

    async def test_scope_discovery_escalation_strict_json_caps_rate_and_no_leak(self):
        credential = await self.mint(scopes=['recipes.read'])
        described = await self.action(credential, 'describe', {})
        self.assertEqual(set(described['actions']), {'recipes_get', 'recipes_get_all', 'recipes_search', 'tags_get_all'})
        await self.action(credential, 'recipes_add', {'name': 'No'}, 403)
        await self.action(credential, 'recipes_get_all', {'actor': {'is_admin': True}}, 400)
        await self.action(credential, 'recipes_get_all', {'unknown': 1}, 400)
        headers = {'Authorization': 'Bearer ' + credential['token'], 'Content-Type': 'application/json'}
        for raw, status in [(b'{"query":"a","query":"b"}', 400), (b'{"query":NaN}', 400),
                            (b'{"query":"' + b'x' * (256 * 1024) + b'"}', 413), (b'[1]', 400)]:
            async with self.client.post(self.origin + '/api/macromate/agent/action/recipes_search', headers=headers, data=raw) as r:
                self.assertEqual(r.status, status)
                self.assertNotIn(credential['token'], await r.text())
        self.agents.rate[credential['id']] = (__import__('time').monotonic(), 60)
        await self.action(credential, 'describe', {}, 429)
        async with self.client.get(self.origin + '/api/macromate/agent/credentials', headers=self.headers()) as r:
            text = await r.text()
            self.assertNotIn(credential['token'], text)
            self.assertNotIn('verifier', text)
            self.assertNotIn('salt', text)
        async with self.client.post(self.origin + '/api/macromate/agent/credentials', headers=self.headers(1), json={'label': 'No'}) as r:
            self.assertEqual(r.status, 403)
        async with self.client.post(self.origin + '/api/macromate/agent/credentials', headers=self.headers(), json={'label': 'No', 'scopes': ['admin']}) as r:
            self.assertEqual(r.status, 400)

    async def test_scoped_discovery_matches_mutation_boundary(self):
        from custom_components.macromate.platform_api import ACTIONS
        credential = await self.mint(scopes=['recipes.read', 'recipes.create', 'recipes.update'])
        described = await self.action(credential, 'describe', {})
        self.assertEqual(described['authentication'], 'macromate_scoped_bearer')
        for action, descriptor in described['actions'].items():
            self.assertNotIn('admin_only', descriptor)
            self.assertTrue(set(descriptor['required_scopes']) <= set(credential['scopes']))
            self.assertEqual('request_id' in descriptor['schema']['required'], not descriptor['read_only'])
        schema = described['actions']['recipes_add']['schema']
        self.assertIs(schema['properties']['download_image']['const'], False)
        self.assertNotIn('request_id', ACTIONS['recipes_add']['schema']['required'])
        self.assertNotIn('const', ACTIONS['recipes_add']['schema']['properties']['download_image'])
        await self.action(credential, 'recipes_add', {'name': 'No ID'}, 400)
        await self.action(credential, 'recipes_add', {'name': 'No network', 'download_image': True, 'request_id': 'net'}, 400)
        payload = {'name': 'Metric oats', 'ingredients': [{'name': 'Oats', 'amount': '60', 'unit': 'g'}], 'download_image': False, 'request_id': 'Breakfast: 2026-10-21'}
        created = await self.action(credential, 'recipes_add', payload)
        self.assertEqual(await self.action(credential, 'recipes_add', payload), created)
        self.assertEqual(await self.action(credential, 'recipes_get', {'recipe_id': created['recipe']['id']}), created)

    async def test_plan_diary_updates_replay_and_optional_delete(self):
        credential = await self.mint()
        recipe = (await self.action(credential, 'recipes_add', {'name': 'Oats', 'servings': 1, 'declared_nutrition': {'calories': 100}, 'nutrition_basis': 'per_serving', 'request_id': 'r'}))['recipe']
        rid = recipe['id']
        replay = await self.action(credential, 'recipes_add', {'name': 'Oats', 'servings': 1, 'declared_nutrition': {'calories': 100}, 'nutrition_basis': 'per_serving', 'request_id': 'r'})
        self.assertEqual(replay['recipe'], recipe)
        await self.action(credential, 'recipes_add', {'name': 'Conflict', 'request_id': 'r'}, 400)
        await self.action(credential, 'recipes_update', {'recipe_id': rid, 'notes': 'Scoped update', 'request_id': 'u'})
        self.assertEqual((await self.action(credential, 'recipes_get', {'recipe_id': rid}))['recipe']['notes'], 'Scoped update')
        plan = (await self.action(credential, 'meal_plan_add', {'recipe_id': rid, 'date': '2026-10-14', 'meal_type': 'lunch', 'request_id': 'p'}))['entry']
        await self.action(credential, 'meal_plan_update', {'entry_id': plan['id'], 'date': '2026-10-15', 'request_id': 'pu'})
        self.assertEqual((await self.action(credential, 'meal_plan_get', {'entry_id': plan['id']}))['entry']['date'], '2026-10-15')
        meal = await self.action(credential, 'log_meal', {'name': 'Quick', 'meal_type': 'lunch', 'calories': 200, 'date': '2026-10-14', 'request_id': 'd'})
        await self.action(credential, 'update_meal', {'entry_id': meal['entry_id'], 'name': 'Edited', 'request_id': 'du'})
        diary = await self.action(credential, 'diary', {'date': '2026-10-14'})
        self.assertEqual(next(e for e in diary['entries'] if e['entry_id'] == meal['entry_id'])['name'], 'Edited')
        await self.action(credential, 'recipe_log', {'recipe_id': rid, 'servings': 1, 'meal_type': 'dinner', 'date': '2026-10-14', 'request_id': 'rl'})
        delete = await self.mint(scopes=['recipes.delete'])
        await self.action(delete, 'recipes_delete', {'recipe_id': rid, 'request_id': 'x'}, 403)
        delete = await self.mint(scopes=['recipes.delete', 'mealplan.delete', 'diary.delete'])
        await self.action(delete, 'delete_meal', {'entry_id': meal['entry_id'], 'request_id': 'dm'})
        await self.action(delete, 'meal_plan_remove', {'entry_id': plan['id'], 'request_id': 'pm'})
        await self.action(delete, 'recipes_delete', {'recipe_id': rid, 'request_id': 'rm'})
        self.assertNotIn(rid, self.coord.kitchen['recipes'])
        self.assertNotIn(plan['id'], self.coord.kitchen['meal_plan'])
        self.assertNotIn(meal['entry_id'], [e.id for e in self.coord.log.entries])

    async def test_expiry_wrong_token_admin_role_and_restart_revocation(self):
        from custom_components.macromate.agent_auth import AgentCredentials
        credential = await self.mint(expires_at=int(__import__('time').time()) + 100)
        loaded = AgentCredentials(self.hass)
        await loaded.async_load()
        async with loaded.lock:
            self.assertEqual((await loaded.authenticate(credential['token']))['id'], credential['id'])
        wrong = {**credential, 'token': credential['token'][:-1] + ('A' if credential['token'][-1] != 'A' else 'B')}
        await self.action(wrong, 'describe', {}, 401)
        self.agents.rows[credential['id']]['expires_at'] = 1
        await self.action(credential, 'describe', {}, 401)
        self.agents.rows[credential['id']]['expires_at'] = None
        # HA forbids deactivating its owner; a delegated non-owner admin can
        # legitimately lose privileges. Rebind only this synthetic fixture.
        from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER
        issuer = await self.hass.auth.async_create_user('Delegating admin', group_ids=[GROUP_ID_ADMIN])
        self.agents.rows[credential['id']]['user_id'] = issuer.id
        await self.hass.auth.async_update_user(issuer, is_active=False)
        await self.action(credential, 'describe', {}, 401)
        await self.hass.auth.async_update_user(issuer, is_active=True)
        await self.hass.auth.async_update_user(issuer, group_ids=[GROUP_ID_USER])
        await self.action(credential, 'describe', {}, 401)
        await self.hass.auth.async_update_user(issuer, group_ids=[GROUP_ID_ADMIN])
        async with self.client.delete(self.origin + '/api/macromate/agent/credentials/' + credential['id'], headers=self.headers()) as r:
            self.assertEqual(r.status, 200)
        await loaded.async_load()
        with self.assertRaises(PermissionError):
            await loaded.authenticate(credential['token'])

    async def test_scoped_client_native_transport_and_protected_mint_output(self):
        import asyncio
        from tools.macromate_scoped_client import call_action, mint_to_file, read_secret
        admin_file = Path(self.tmp.name) / 'admin.secret'
        admin_file.write_text(self.tokens[0][1])
        admin_file.chmod(0o600)
        output = Path(self.tmp.name) / 'agent.secret'
        metadata = await asyncio.to_thread(mint_to_file, self.origin, admin_file, output, {'label': 'Local SDK'}, trusted_lan_http=True)
        self.assertNotIn('token', metadata)
        self.assertEqual(output.stat().st_mode & 0o777, 0o600)
        token = read_secret(output)
        result = await asyncio.to_thread(call_action, self.origin, token, 'recipes_add', {'name': 'SDK oats', 'request_id': 'sdk-1'}, trusted_lan_http=True)
        readback = await asyncio.to_thread(call_action, self.origin, token, 'recipes_get', {'recipe_id': result['recipe']['id']}, trusted_lan_http=True)
        self.assertEqual(result, readback)
        with self.assertRaises(ValueError):
            await asyncio.to_thread(call_action, self.origin, token, '../config', {}, trusted_lan_http=True)
        with self.assertRaises(RuntimeError):
            await asyncio.to_thread(call_action, self.origin, token, 'platform_backup', {}, trusted_lan_http=True)
        output.chmod(0o644)
        with self.assertRaises(ValueError):
            read_secret(output)

    async def test_remaining_allowlisted_operations_and_natural_rate_limit(self):
        from custom_components.macromate.agent_api import ACTION_SCOPES
        from custom_components.macromate.agent_auth import ALL_SCOPES
        self.assertFalse(any('shopping' in key for key in ACTION_SCOPES))
        self.assertFalse(any('shopping' in key for key in ALL_SCOPES))
        credential = await self.mint()
        recipe = (await self.action(credential, 'recipes_add', {'name': 'Matrix oats', 'servings': 1, 'declared_nutrition': {'calories': 100}, 'nutrition_basis': 'per_serving', 'request_id': 'r'}))['recipe']
        await self.action(credential, 'recipes_set_favourite', {'recipe_id': recipe['id'], 'is_favourite': True, 'request_id': 'f'})
        self.assertTrue((await self.action(credential, 'recipes_get', {'recipe_id': recipe['id']}))['recipe']['is_favourite'])
        for action in ('recipes_get_all', 'recipes_search', 'tags_get_all'):
            await self.action(credential, action, {})
        meal = await self.action(credential, 'log_meal', {'name': 'Copy source', 'calories': 123, 'meal_type': 'lunch', 'date': '2026-10-14', 'request_id': 'd'})
        copied = await self.action(credential, 'copy_meal', {'entry_id': meal['entry_id'], 'date': '2026-10-15', 'request_id': 'copy'})
        self.assertNotEqual(copied['entry_id'], meal['entry_id'])
        logged = await self.action(credential, 'recipe_log', {'recipe_id': recipe['id'], 'servings': 1, 'meal_type': 'dinner', 'date': '2026-10-14', 'request_id': 'rl'})
        await self.action(credential, 'recipe_entry_update', {'entry_id': logged['entry_id'], 'servings': 2, 'request_id': 're'})
        diary = await self.action(credential, 'diary', {'date': '2026-10-14'})
        self.assertEqual(next(e for e in diary['entries'] if e['entry_id'] == logged['entry_id'])['calories'], 200)
        await self.action(credential, 'recipes_add', {'name': 'Missing ID'}, 400)
        await self.action(credential, 'recipes_add', {'name': 'Network', 'download_image': True, 'request_id': 'net'}, 400)
        await self.action(credential, 'recipes_update', {'recipe_id': recipe['id'], 'owner_id': 'other', 'request_id': 'acl'}, 400)
        for bad in ('actor', 'is_admin', 'trusted_internal', 'scopes', 'user_id', 'allowed_users'):
            await self.action(credential, 'recipes_get', {'recipe_id': recipe['id'], bad: True}, 400)
        # A fresh token proves the actual 60-request counter, not only injection.
        limited = await self.mint(scopes=['recipes.read'])
        for _ in range(60):
            await self.action(limited, 'describe', {})
        await self.action(limited, 'describe', {}, 429)
        before = set(self.hass.services.async_services()['macromate'])
        from custom_components.macromate.agent_api import async_register_agent_views
        self.assertIs(await async_register_agent_views(self.hass), self.agents)
        self.assertEqual(set(self.hass.services.async_services()['macromate']), before)

    async def test_failed_and_cancelled_credential_saves_are_joined_before_revoke(self):
        import asyncio
        from unittest.mock import patch
        from custom_components.macromate.agent_auth import AgentCredentials
        credential = await self.mint()
        original = self.agents.store.async_save
        with patch.object(self.agents.store, 'async_save', side_effect=OSError('synthetic failure')):
            async with self.client.delete(self.origin + '/api/macromate/agent/credentials/' + credential['id'], headers=self.headers()) as r:
                self.assertEqual(r.status, 503)
        await self.action(credential, 'describe', {})  # failed revoke did not publish
        started, release = asyncio.Event(), asyncio.Event()
        async def delayed(data):
            started.set()
            await release.wait()
            await original(data)
        async def revoke():
            async with self.agents.lock:
                return await self.agents.revoke(credential['id'])
        with patch.object(self.agents.store, 'async_save', delayed):
            task = asyncio.create_task(revoke())
            try:
                await asyncio.wait_for(started.wait(), 2)
                task.cancel()
                await asyncio.sleep(0)
                task.cancel()
                self.assertTrue(self.agents.lock.locked())
                self.assertFalse(task.done())
            finally:
                release.set()
            with self.assertRaises(asyncio.CancelledError):
                await task
        await self.action(credential, 'describe', {}, 401)
        loaded = AgentCredentials(self.hass)
        await loaded.async_load()
        with self.assertRaises(PermissionError):
            await loaded.authenticate(credential['token'])

    async def test_expiry_rechecked_after_body_before_command(self):
        import asyncio
        from unittest.mock import patch
        from custom_components.macromate import agent_api
        credential = await self.mint()
        original = agent_api.body
        async def expire_after_body(request):
            result = await original(request)
            self.agents.rows[credential['id']]['expires_at'] = 1
            return result
        before = self.coord._state()
        with patch.object(agent_api, 'body', expire_after_body):
            await self.action(credential, 'recipes_add', {'name': 'Expired', 'request_id': 'expired'}, 401)
        self.assertEqual(self.coord._state(), before)



class AgentRegistrationTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.boundary.ServiceBoundaryTests.asyncSetUp
    asyncTearDown = native.boundary.ServiceBoundaryTests.asyncTearDown

    async def test_concurrent_registration_is_singleton_and_does_not_mint(self):
        import asyncio
        from types import SimpleNamespace
        from unittest.mock import patch
        from custom_components.macromate.agent_api import async_register_agent_views
        from custom_components.macromate.agent_auth import AgentCredentials
        views = []
        self.hass.http = SimpleNamespace(register_view=views.append)
        users = [(user.id, set(user.refresh_tokens)) for user in await self.hass.auth.async_get_users()]
        services = self.hass.services.async_services()
        original = AgentCredentials.async_load
        async def yielding_load(credentials):
            await asyncio.sleep(0.01)
            await original(credentials)
        with patch.object(AgentCredentials, 'async_load', yielding_load):
            first, second = await asyncio.gather(async_register_agent_views(self.hass), async_register_agent_views(self.hass))
        self.assertIs(first, second)
        self.assertEqual(len(views), 3)
        self.assertEqual(first.rows, {})
        self.assertFalse((Path(self.tmp.name) / '.storage/macromate.agent_credentials').exists())
        self.assertEqual(self.hass.services.async_services(), services)
        self.assertEqual([(user.id, set(user.refresh_tokens)) for user in await self.hass.auth.async_get_users()], users)


if __name__ == '__main__':
    import unittest
    unittest.main()
