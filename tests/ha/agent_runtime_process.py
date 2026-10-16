"""Synthetic native HA restart stages; no credential values in output/arguments."""
import asyncio
import json
import os
from pathlib import Path
import sys

from homeassistant import auth, loader
from homeassistant.auth.const import GROUP_ID_ADMIN
from homeassistant.bootstrap import async_load_base_functionality
from homeassistant.config_entries import ConfigEntries
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from unified_runtime_process import PROFILE


async def run(directory, mode):
    path = Path(directory)
    hass = HomeAssistant(directory)
    hass.config.time_zone = 'Europe/Berlin'
    hass.config_entries = ConfigEntries(hass, {})
    loader.async_setup(hass)
    await async_load_base_functionality(hass)
    hass.auth = await auth.auth_manager_from_config(hass, [], [])
    await hass.config_entries.async_initialize()
    # Exercise a real headless setup followed by HTTP becoming available before
    # entry setup. No test calls the agent registration hook.
    assert await async_setup_component(hass, 'macromate', {})
    assert 'agent_credentials' not in hass.data.get('macromate', {})
    await hass.async_block_till_done()
    # Existing config entries can auto-load during headless component setup.
    # Unload so the second setup follows normal HTTP-before-entry ordering.
    for entry in hass.config_entries.async_entries('macromate'):
        if entry.state.value == 'loaded':
            assert await hass.config_entries.async_unload(entry.entry_id)
    from homeassistant.components import api, frontend, websocket_api
    from homeassistant.components.http import HomeAssistantHTTP
    server = HomeAssistantHTTP(hass, None, None, None, ['127.0.0.1'], 0, [], 'modern')
    hass.http = server
    await server.async_bind()
    await server.async_initialize(cors_origins=[], use_x_forwarded_for=False,
                                  login_threshold=-1, is_ban_enabled=False, use_x_frame_options=True)
    hass.config.components.add('http')
    for name, module in [('websocket_api', websocket_api), ('api', api), ('frontend', frontend)]:
        assert await module.async_setup(hass, {})
        hass.config.components.add(name)
    try:
        if mode == 'mint':
            owner = await hass.auth.async_create_user('Synthetic operator', group_ids=[GROUP_ID_ADMIN])
            flow = await hass.config_entries.flow.async_init('macromate', context={'source': 'user'}, data=PROFILE)
            assert flow['type'] == 'create_entry'
        else:
            owner = next(user for user in await hass.auth.async_get_users() if user.is_owner)
        entries = hass.config_entries.async_entries('macromate')
        assert len(entries) == 1
        entry = entries[0]
        if entry.state.value != 'loaded':
            assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state.value == 'loaded'
        assert 'agent_credentials' in hass.data['macromate'], 'Entry lifecycle failed to register scoped endpoints'
        coord = entry.runtime_data
        await server.start()
        origin = 'http://127.0.0.1:' + str(server._server.sockets[0].getsockname()[1])
        refresh = await hass.auth.async_create_refresh_token(owner, client_id='https://example.invalid/synthetic')
        operator = path / 'operator.secret'
        with os.fdopen(os.open(operator, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'w') as stream:
            stream.write(hass.auth.async_create_access_token(refresh))
        secret = path / 'scoped.secret'
        cli_path = Path(__file__).parents[2] / 'tools/macromate_scoped_client.py'

        async def cli(command, *args, operator_only=False, success=True):
            proc = await asyncio.create_subprocess_exec(
                sys.executable, '-B', str(cli_path), '--origin', origin,
                '--secret-file', str(operator if operator_only else secret), '--trusted-lan-http',
                command, *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            stdout, stderr = await asyncio.wait_for(proc.communicate(), 30)
            assert (proc.returncode == 0) == success, 'Scoped CLI failed acceptance (details suppressed)'
            if secret.exists() and secret.stat().st_size:
                token = secret.read_bytes().strip()
                assert token not in stdout and token not in stderr
            if success:
                return json.loads(stdout)
            assert not stdout

        async def action(name, payload, success=True):
            body = path / 'request.json'
            body.write_text(json.dumps(payload))
            return await cli('call', name, '--json-file', str(body), success=success)

        expected_file = path / 'expected.json'
        if mode == 'mint':
            from custom_components.macromate.agent_auth import ALL_SCOPES
            args = [item for scope in sorted(ALL_SCOPES) for item in ('--scope', scope)]
            metadata = await cli('mint', '--label', 'Synthetic restart', '--output-file', str(secret), *args, operator_only=True)
            assert 'token' not in metadata
            assert secret.stat().st_mode & 0o777 == 0o600
            recipe = (await action('recipes_add', {'name': 'Restart oats', 'request_id': 'recipe'}))['recipe']
            plan = (await action('meal_plan_add', {'recipe_id': recipe['id'], 'date': '2026-10-14', 'meal_type': 'lunch', 'request_id': 'plan'}))['entry']
            meal = await action('log_meal', {'name': 'Restart quick', 'calories': 123, 'meal_type': 'lunch', 'date': '2026-10-14', 'request_id': 'diary'})
            expected = {'credential': metadata['id'], 'recipe': recipe['id'], 'plan': plan['id'], 'meal': meal['entry_id']}
            expected_file.write_text(json.dumps(expected))
            assert (await cli('list', operator_only=True))['credentials'][0]['revoked'] is False
        else:
            expected = json.loads(expected_file.read_text())
            if mode == 'reload_revoke':
                recipe = await action('recipes_add', {'name': 'Restart oats', 'request_id': 'recipe'})
                credentials_runtime = hass.data['macromate']['agent_credentials']
                assert await hass.config_entries.async_unload(entry.entry_id)
                from aiohttp import ClientSession
                async with ClientSession() as session:
                    async with session.post(origin + '/api/macromate/agent/action/recipes_get_all',
                                            headers={'Authorization': 'Bearer ' + secret.read_text().strip()}, json={}) as response:
                        assert response.status == 503
                assert await hass.config_entries.async_setup(entry.entry_id)
                assert hass.data['macromate']['agent_credentials'] is credentials_runtime
                coord = entry.runtime_data
                assert recipe['recipe']['id'] == expected['recipe']  # persisted replay
                assert (await action('recipes_get', {'recipe_id': expected['recipe']}))['recipe']['name'] == 'Restart oats'
                assert (await action('meal_plan_get', {'entry_id': expected['plan']}))['entry']['recipe_id'] == expected['recipe']
                assert any(row['entry_id'] == expected['meal'] for row in (await action('diary', {'date': '2026-10-14'}))['entries'])
                await action('recipes_update', {'recipe_id': expected['recipe'], 'notes': 'Restart updated', 'request_id': 'ru'})
                assert (await action('recipes_get', {'recipe_id': expected['recipe']}))['recipe']['notes'] == 'Restart updated'
                await action('meal_plan_update', {'entry_id': expected['plan'], 'date': '2026-10-15', 'request_id': 'pu'})
                assert (await action('meal_plan_get', {'entry_id': expected['plan']}))['entry']['date'] == '2026-10-15'
                await action('update_meal', {'entry_id': expected['meal'], 'name': 'Restart edited', 'request_id': 'du'})
                assert next(row for row in (await action('diary', {'date': '2026-10-14'}))['entries'] if row['entry_id'] == expected['meal'])['name'] == 'Restart edited'
                await action('delete_meal', {'entry_id': expected['meal'], 'request_id': 'dd'})
                await action('meal_plan_remove', {'entry_id': expected['plan'], 'request_id': 'pd'})
                await action('recipes_delete', {'recipe_id': expected['recipe'], 'request_id': 'rd'})
                assert expected['recipe'] not in coord.kitchen['recipes']
                assert expected['plan'] not in coord.kitchen['meal_plan']
                assert not any(row.id == expected['meal'] for row in coord.log.entries)
                assert (await cli('revoke', expected['credential'], operator_only=True))['revoked'] is True
            else:
                assert mode == 'revoked'
                assert (await cli('list', operator_only=True))['credentials'][0]['revoked'] is True
            # Exact status evidence is independent of the CLI's sanitized error.
            from aiohttp import ClientSession
            async with ClientSession() as session:
                for name, payload in [('describe', {}), ('recipes_add', {'name': 'Restart oats', 'request_id': 'recipe'})]:
                    async with session.post(origin + '/api/macromate/agent/action/' + name,
                                            headers={'Authorization': 'Bearer ' + secret.read_text().strip()}, json=payload) as response:
                        assert response.status == 401
            await action('describe', {}, success=False)
        disk = json.loads((path / '.storage/macromate.meals').read_text())['data']
        assert disk == coord._state()
        token = secret.read_text().strip()
        for store in (path / '.storage').iterdir():
            if store.is_file():
                assert token not in store.read_text()
        assert (path / '.storage/macromate.agent_credentials').stat().st_mode & 0o777 == 0o600
        # Explicit persistence of native user/config identity across fresh processes.
        hass.auth.async_remove_refresh_token(refresh)
        await hass.auth._store._store.async_save(hass.auth._store._data_to_save())
        await hass.config_entries._store.async_save(hass.config_entries._data_to_save())
        assert await hass.config_entries.async_unload(entry.entry_id)
        print(json.dumps({'stage': mode, 'pid': os.getpid(), 'entry_loaded': True,
                          'disk_equal': True, 'scoped_file_mode': '0600', 'revoked': mode != 'mint'}))
    finally:
        await server.stop()
        await hass.async_stop(force=True)


if __name__ == '__main__':
    asyncio.run(run(sys.argv[1], sys.argv[2]))
