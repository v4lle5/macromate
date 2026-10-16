"""Security regressions through real HA auth, HTTP and private Store."""
import asyncio
from copy import deepcopy
from pathlib import Path
import unittest
from unittest.mock import patch

from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER
import test_agent_credentials_native as original


class AgentSecurityTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = original.AgentCredentialsTests.asyncSetUp
    asyncTearDown = original.AgentCredentialsTests.asyncTearDown
    headers = original.AgentCredentialsTests.headers
    mint = original.AgentCredentialsTests.mint
    action = original.AgentCredentialsTests.action

    async def issuer(self):
        user = await self.hass.auth.async_create_user('Synthetic security issuer', group_ids=[GROUP_ID_ADMIN])
        refresh = await self.hass.auth.async_create_refresh_token(user, client_id='https://example.invalid/security')
        token = self.hass.auth.async_create_access_token(refresh)
        return user, {'Authorization': 'Bearer ' + token}

    async def invalidate(self, user, change):
        if change == 'demote':
            await self.hass.auth.async_update_user(user, group_ids=[GROUP_ID_USER])
        elif change == 'deactivate':
            await self.hass.auth.async_update_user(user, is_active=False)
        else:
            await self.hass.auth.async_remove_user(user)

    async def credential_request(self, operation, headers, target):
        method = {'mint': 'POST', 'list': 'GET', 'revoke': 'DELETE'}[operation]
        url = self.origin + '/api/macromate/agent/credentials'
        if operation == 'revoke':
            url += '/' + target['id']
        async with self.client.request(method, url, headers=headers,
                                       **({'json': {'label': 'Must not exist'}} if operation == 'mint' else {})) as response:
            text = await response.text()
            # Even a regression must not print a synthetic bearer in CI logs.
            import re
            return response.status, re.sub(r'mm1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}', '[REDACTED]', text)

    async def assert_no_grant(self, rows, disk, user, change, target):
        self.assertEqual(self.agents.rows, rows)
        self.assertEqual((Path(self.tmp.name) / '.storage/macromate.agent_credentials').read_bytes(), disk)
        from custom_components.macromate.agent_auth import AgentCredentials
        loaded = AgentCredentials(self.hass)
        await loaded.async_load()
        self.assertEqual(loaded.rows, rows)
        if change != 'delete':
            await self.hass.auth.async_update_user(user, group_ids=[GROUP_ID_ADMIN], is_active=True)
            self.assertEqual(loaded.rows, rows)  # restoration cannot activate a latent mint
            self.assertFalse(any(row['user_id'] == user.id for row in loaded.rows.values()))
        await self.action(target, 'describe', {})  # another issuer was not revoked

    async def test_admin_revalidated_after_lock_wait(self):
        target = await self.mint()
        for operation in ('mint', 'revoke', 'list'):
            for change in ('demote', 'deactivate', 'delete'):
                with self.subTest(operation=operation, change=change):
                    user, headers = await self.issuer()
                    rows = deepcopy(self.agents.rows)
                    disk = (Path(self.tmp.name) / '.storage/macromate.agent_credentials').read_bytes()
                    await self.agents.lock.acquire()
                    task = asyncio.create_task(self.credential_request(operation, headers, target))
                    try:
                        async with asyncio.timeout(3):
                            while not self.agents.lock._waiters:
                                await asyncio.sleep(0.001)
                        await self.invalidate(user, change)
                    finally:
                        self.agents.lock.release()
                    status, text = await asyncio.wait_for(task, 3)
                    self.assertEqual(status, 403, text)
                    self.assertNotIn(target['id'], text)
                    await self.assert_no_grant(rows, disk, user, change, target)

    async def test_mint_revalidated_after_body_wait(self):
        from custom_components.macromate import agent_api
        target = await self.mint()
        for change in ('demote', 'deactivate', 'delete'):
            with self.subTest(change=change):
                user, headers = await self.issuer()
                rows = deepcopy(self.agents.rows)
                disk = (Path(self.tmp.name) / '.storage/macromate.agent_credentials').read_bytes()
                entered, release = asyncio.Event(), asyncio.Event()
                body = agent_api.body
                async def delayed(request):
                    value = await body(request)
                    entered.set()
                    await release.wait()
                    return value
                with patch.object(agent_api, 'body', delayed):
                    task = asyncio.create_task(self.credential_request('mint', headers, target))
                    try:
                        await asyncio.wait_for(entered.wait(), 3)
                        await self.invalidate(user, change)
                    finally:
                        release.set()
                    status, text = await asyncio.wait_for(task, 3)
                self.assertEqual(status, 403, text)
                await self.assert_no_grant(rows, disk, user, change, target)

    async def test_update_response_and_replay_require_read_scopes(self):
        from custom_components.macromate.platform_support import Actor
        actor = Actor(self.owner.id, is_admin=True)
        recipe = (await self.coord.async_command('recipes_add', {
            'name': 'Security oats', 'notes': 'SYNTHETIC_PRIVATE_NOTE', 'servings': 1,
            'declared_nutrition': {'calories': 10}, 'nutrition_basis': 'per_serving'}, actor=actor))['recipe']
        logged = await self.coord.async_command('recipe_log', {
            'recipe_id': recipe['id'], 'servings': 1, 'meal_type': 'lunch'}, actor=actor)
        plan = (await self.coord.async_command('meal_plan_add', {
            'recipe_id': recipe['id'], 'date': '2026-10-14', 'meal_type': 'lunch', 'notes': 'SYNTHETIC_PLAN_NOTE'}, actor=actor))['entry']
        cases = [
            ('recipes_update', {'recipe_id': recipe['id'], 'name': recipe['name']}, {'recipes.update', 'recipes.read'}, 'recipes.read'),
            ('recipes_set_favourite', {'recipe_id': recipe['id'], 'is_favourite': False}, {'recipes.update', 'recipes.read'}, 'recipes.read'),
            ('meal_plan_update', {'entry_id': plan['id'], 'date': plan['date']}, {'mealplan.update', 'mealplan.read', 'recipes.read'}, 'mealplan.read'),
            ('update_meal', {'entry_id': logged['entry_id'], 'meal_type': 'lunch'}, {'diary.update', 'diary.read'}, 'diary.read'),
            ('recipe_entry_update', {'entry_id': logged['entry_id'], 'meal_type': 'lunch'}, {'diary.update', 'diary.read', 'recipes.read'}, 'diary.read'),
            ('recipe_entry_update', {'entry_id': logged['entry_id'], 'meal_type': 'lunch'}, {'diary.update', 'diary.read', 'recipes.read'}, 'recipes.read'),
        ]
        for index, (action, payload, scopes, missing) in enumerate(cases):
            with self.subTest(action=action, missing=missing):
                credential = await self.mint(scopes=sorted(scopes - {missing}))
                payload = {**payload, 'request_id': 'noop-' + str(index)}
                before = self.coord._state()
                disk = (Path(self.tmp.name) / '.storage/macromate.meals').read_bytes()
                await self.action(credential, action, payload, 403)
                self.assertNotIn(action, (await self.action(credential, 'describe', {}))['actions'])
                self.assertEqual(self.coord._state(), before)
                self.assertEqual((Path(self.tmp.name) / '.storage/macromate.meals').read_bytes(), disk)
                # Seed the exact per-token ledger with an admitted full-scope write,
                # then remove only read authority. Replay must recheck the boundary.
                self.agents.rows[credential['id']]['scopes'] = sorted(scopes)
                accepted = await self.action(credential, action, payload)
                self.assertEqual(await self.action(credential, action, payload), accepted)
                self.agents.rows[credential['id']]['scopes'] = sorted(scopes - {missing})
                before = self.coord._state()
                disk = (Path(self.tmp.name) / '.storage/macromate.meals').read_bytes()
                await self.action(credential, action, payload, 403)
                self.assertEqual(self.coord._state(), before)
                self.assertEqual((Path(self.tmp.name) / '.storage/macromate.meals').read_bytes(), disk)
        # Explicit diary reads authorize recorded snapshots, not live recipe reads.
        reader = await self.mint(scopes=['diary.read'])
        diary = await self.action(reader, 'diary', {})
        self.assertEqual(next(e for e in diary['entries'] if e['entry_id'] == logged['entry_id'])['recipe_snapshot']['notes'], 'SYNTHETIC_PRIVATE_NOTE')
        await self.action(reader, 'recipes_get', {'recipe_id': recipe['id']}, 403)


if __name__ == '__main__':
    unittest.main()
