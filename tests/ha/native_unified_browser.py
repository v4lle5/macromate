"""Native combined-card and shipped-client acceptance on disposable Home Assistant.

Run from any directory with HA_PYTHON's interpreter, NODE, PLAYWRIGHT_DIR (the
node_modules directory containing playwright), and EVIDENCE_DIR configured:
    "$HA_PYTHON" tests/ha/native_unified_browser.py
FRONTEND_DEPS may alternatively name Playwright's dependency installation root.
CHROMIUM defaults to /usr/bin/chromium. Requires Home Assistant 2026.10.1.
Only ephemeral loopback listeners and copied integration files are used. All
records/users are synthetic. Auth travels in memory, protected subprocess env,
and stdin, never command arguments, fixtures or evidence. No live HA is used.
The bridge implements real HA HTTP/WS, not fixture responses or fake successes.
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import importlib.metadata
import io
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import traceback

REPO = Path(__file__).resolve().parents[2]
HTML = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic MacroMate native acceptance</title><link rel="icon" href="data:,"><style>body{margin:0;font:14px system-ui;background:#faf8f5}aside{padding:8px;text-align:center;color:#555}main{height:calc(100vh - 40px)}macromate-card{height:100%}</style><body><aside>SYNTHETIC isolated HA — not live HA or a household diary</aside><main></main><script type="module">
import '/macromate-assets/macromate-card.js';
window.wire=[];window.received=[];window.mediaRequests=[];window.dropped=[];
window.connectBackend=async cfg=>{
 if(window.closeBackend){document.querySelector('macromate-card')?.remove();await window.closeBackend();}
 let credential=cfg.token;cfg.token='';const ws=new WebSocket(location.origin.replace('http','ws')+'/api/websocket');
 let counter=0;const pending=new Map(),subscriptions=new Map();
 function send(payload){return new Promise((done,fail)=>{const id=++counter;pending.set(id,{done,fail,payload});window.wire.push(structuredClone(payload));ws.send(JSON.stringify({id,...payload}));});}
 const ready=new Promise((resolve,reject)=>{
 ws.onerror=()=>reject(new Error('Native transport failed'));
 ws.onmessage=event=>{const msg=JSON.parse(event.data);
 if(msg.type==='auth_required')ws.send(JSON.stringify({type:'auth',access_token:credential}));
 else if(msg.type==='auth_invalid')reject(new Error('Native auth failed'));
 else if(msg.type==='auth_ok'){
 window.nativeSend=send;
 window.hass={user:cfg.user,language:'en',locale:{language:'en'},config:{time_zone:'Europe/Berlin'},states:{},callWS:send,
 fetchWithAuth:async(path,options={})=>{window.mediaRequests.push(path);return fetch(path,{...options,headers:{...options.headers,Authorization:'Bearer '+credential}});},
 connection:{subscribeMessage:async(callback,message)=>{const id=counter+1;subscriptions.set(id,callback);try{await send(message);}catch(e){subscriptions.delete(id);throw e;}return ()=>{subscriptions.delete(id);return send({type:'unsubscribe_events',subscription:id});};}}};
 const card=document.createElement('macromate-card');window.card=card;card.setConfig({type:'custom:macromate-card'});card.hass=window.hass;document.querySelector('main').append(card);resolve(true);
 }else if(msg.type==='event'){window.received.push(structuredClone(msg));subscriptions.get(msg.id)?.(msg.event);}
 else if(msg.type==='result'){window.received.push(structuredClone(msg));const p=pending.get(msg.id);if(p){pending.delete(msg.id);if(msg.success&&window.dropNextAction&&window.dropNextAction===p.payload.action){window.dropNextAction=null;window.dropped.push({request:p.payload,result:msg.result});p.fail(new Error('Deliberately lost genuine result after native acceptance'));}else msg.success?p.done(msg.result):p.fail(msg.error);}}
 };
 });
 window.closeBackend=()=>new Promise(resolve=>{credential='';if(ws.readyState===WebSocket.CLOSED)return resolve();ws.addEventListener('close',resolve,{once:true});ws.close();});
 return ready;
};
window.ready=true;
</script></body></html>'''


async def main():
    import aiohttp
    from PIL import Image
    from homeassistant import auth, loader
    from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER, GROUP_ID_READ_ONLY
    from homeassistant.bootstrap import async_load_base_functionality
    from homeassistant.config_entries import ConfigEntries
    from homeassistant.core import HomeAssistant
    from homeassistant.setup import async_setup_component
    from homeassistant.components.http import StaticPathConfig
    from homeassistant.components.http.server import HomeAssistantHTTP
    from homeassistant.util import dt as dt_util

    evidence_root = Path(os.environ['EVIDENCE_DIR']).resolve()
    evidence_root.mkdir(parents=True, exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix='native-unified-', dir=evidence_root))
    run.chmod(0o700)
    config = run / 'config'
    config.mkdir(mode=0o700)
    shutil.copytree(REPO / 'custom_components', config / 'custom_components',
                    ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    sys.path.insert(0, str(config))
    sys.dont_write_bytecode = True
    report = {'scope': 'Synthetic isolated HA native HTTP/WS; packaged combined card and shipped CLI',
              'ha': importlib.metadata.version('homeassistant'), 'run': str(run),
              'live_ha': False, 'lovelace_editor': False, 'physical_devices': False, 'failures': []}
    assert report['ha'] == '2026.10.1', report['ha']
    client_path = REPO / 'tools/macromate_client.py'
    client_hash = hashlib.sha256(client_path.read_bytes()).hexdigest()
    report['client_sha256'] = client_hash
    hass = HomeAssistant(str(config))
    hass.config.skip_pip = True
    hass.config.time_zone = 'Europe/Berlin'
    dt_util.set_default_time_zone(dt_util.get_time_zone('Europe/Berlin'))
    hass.config_entries = ConfigEntries(hass, {})
    loader.async_setup(hass)
    await hass.config_entries.async_initialize()
    assert await async_load_base_functionality(hass)
    hass.auth = await auth.auth_manager_from_config(hass, [], [])
    users = [await hass.auth.async_create_user(name, group_ids=[group], local_only=True)
             for name, group in [('Synthetic owner', GROUP_ID_ADMIN),
                                 ('Synthetic member', GROUP_ID_USER),
                                 ('Synthetic reader', GROUP_ID_READ_ONLY)]]
    assert users[0].is_admin and not users[1].is_admin and not users[2].is_admin
    tokens = []
    for user in users:
        refresh = await hass.auth.async_create_refresh_token(user, client_id='http://127.0.0.1/native-acceptance')
        tokens.append(hass.auth.async_create_access_token(refresh, remote_ip='127.0.0.1'))
    server = HomeAssistantHTTP(hass, None, None, None, ['127.0.0.1'], 0, [], 'modern')
    hass.http = server
    proc = None
    url = None
    captured = []
    snapshots = []
    client = None
    coord = None
    try:
        await server.async_bind()
        await server.async_initialize(cors_origins=[], use_x_forwarded_for=False,
                                      login_threshold=-1, is_ban_enabled=False, use_x_frame_options=True)
        # Initialize native transports on our already-bound ephemeral server.
        # async_setup_component('api') would set up its http dependency again,
        # replacing hass.http and binding HA's default production port.
        from homeassistant.components import api, websocket_api
        hass.config.components.add('http')
        assert await websocket_api.async_setup(hass, {})
        hass.config.components.add('websocket_api')
        assert await api.async_setup(hass, {})
        hass.config.components.add('api')
        assert await async_setup_component(hass, 'macromate', {})
        assert hass.http is server
        fixture = run / 'native-card.html'
        fixture.write_text(HTML)
        await server.async_register_static_paths([StaticPathConfig('/native-card/', str(fixture), False)])
        profile = {'formula_sex': 'male', 'birthday': '1990-01-01', 'height_cm': 180,
                   'weight_kg': 80, 'target_weight_kg': 80, 'goal': 'maintain',
                   'weekly_pace_kg': 0, 'activity_level': 'low', 'macro_plan': 'balanced',
                   'enable_food_database': False}
        flow = await hass.config_entries.flow.async_init('macromate', context={'source': 'user'}, data=profile)
        assert flow['type'] == 'create_entry', flow['type']
        await hass.async_block_till_done()
        entry = flow['result']
        assert entry.state.value == 'loaded'
        coord = entry.runtime_data
        await hass.async_start()
        await server.start()
        sockets = server._server.sockets
        assert all(s.getsockname()[0] == '127.0.0.1' for s in sockets)
        port = sockets[0].getsockname()[1]
        url = f'http://127.0.0.1:{port}'
        report['loopback_only'] = True
        report['entry_loaded'] = True
        report['sensor_count'] = len(hass.states.async_all('sensor'))
        assert report['sensor_count'] > 5
        client = aiohttp.ClientSession()

        def store(label):
            raw = json.loads((config / '.storage/macromate.meals').read_text())
            assert raw['version'] == 1 and raw['data']['schema'] == 3
            assert raw['data'] == coord._state(), 'Independent native Store must equal committed model'
            snapshots.append({'label': label, 'store': raw})
            return raw['data']

        async def cli(action, payload=None, actor=0, expected_code=0):
            # No token arguments or secret output. Actual shipped script, real native HTTP.
            env = {k: v for k, v in os.environ.items() if k not in ('HA_TOKEN', 'HA_URL', 'PYTHONPATH')}
            env.update(HA_URL=url, HA_TOKEN=tokens[actor])
            args = [sys.executable, str(client_path), '--trusted-lan-http']
            args += ['describe'] if action == 'describe' else ['call', action]
            child = await asyncio.create_subprocess_exec(*args, env=env, stdin=asyncio.subprocess.PIPE,
                                                        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            stdout, stderr = await asyncio.wait_for(child.communicate(json.dumps(payload or {}).encode()), 35)
            assert all(token.encode() not in stdout + stderr for token in tokens), 'Credential output forbidden'
            result = json.loads(stdout) if child.returncode == 0 else None
            captured.append({'transport': 'shipped-client-native-http', 'actor': actor, 'action': action,
                             'payload': payload or {}, 'exit_code': child.returncode, 'result': result,
                             'stderr': stderr.decode()})
            assert child.returncode == expected_code, (action, child.returncode, stderr.decode())
            if child.returncode == 0 and not discovery['actions'].get(action, {}).get('read_only', True):
                store('cli:' + action)
            return result

        discovery = {'actions': {}}
        discovery = await cli('describe')
        registered = hass.services.async_services()['macromate']
        assert set(discovery['actions']) <= set(registered)
        assert set(discovery['legacy_services']) <= set(registered)
        report['registered_canonical_actions'] = len(discovery['actions'])
        report['registered_legacy_aliases'] = list(discovery['legacy_services'])
        # Verify installable asset bytes via actual HA static registration.
        assets = []
        frontend = config / 'custom_components/macromate/frontend'
        for path in sorted(frontend.rglob('*')):
            if not path.is_file():
                continue
            relative = path.relative_to(frontend).as_posix()
            async with client.get(url + '/macromate-assets/' + relative) as response:
                raw = await response.read()
                assert response.status == 200 and raw == path.read_bytes(), relative
                assets.append({'path': relative, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
        report['assets'] = assets

        try:
            recipe_payload = {'name': 'CLI synthetic oats', 'servings': 2,
                              'ingredients': [{'name': 'Oats', 'amount': '40', 'unit': 'g'}],
                              'declared_nutrition': {'calories': 200, 'protein': 0},
                              'nutrition_basis': 'per_serving', 'request_id': 'cli-recipe-create'}
            recipe = (await cli('recipes_add', recipe_payload))['recipe']
            rid = recipe['id']
            assert rid != recipe_payload['request_id']
            assert (await cli('recipes_add', recipe_payload))['recipe']['id'] == rid
            await cli('recipes_update', {'recipe_id': rid, 'notes': 'Exact CLI edit', 'request_id': 'cli-recipe-edit'})
            assert (await cli('recipes_get', {'recipe_id': rid}))['recipe']['notes'] == 'Exact CLI edit'
            assert store('cli-recipe-read')['kitchen']['recipes'][rid]['notes'] == 'Exact CLI edit'
            plan = (await cli('meal_plan_add', {'recipe_id': rid, 'date': '2026-10-14', 'meal_type': 'lunch',
                                              'servings': 1, 'request_id': 'cli-plan-create'}))['entry']
            pid = plan['id']
            await cli('meal_plan_update', {'entry_id': pid, 'servings': 2, 'request_id': 'cli-plan-edit'})
            assert (await cli('meal_plan_get', {'entry_id': pid}))['entry']['servings'] == 2
            lid = (await cli('shopping_lists_create', {'name': 'CLI groceries', 'private': True,
                                                      'request_id': 'cli-list-create'}))['list']['id']
            await cli('shopping_lists_update', {'list_id': lid, 'name': 'CLI exact groceries', 'request_id': 'cli-list-edit'})
            assert (await cli('shopping_lists_get', {'list_id': lid}))['list']['name'] == 'CLI exact groceries'
            iid = (await cli('shopping_items_add', {'list_id': lid, 'name': 'Apple', 'quantity': 2,
                                                  'price': 1, 'request_id': 'cli-item-create'}))['item']['id']
            await cli('shopping_items_update', {'item_id': iid, 'quantity': 3, 'price': None, 'request_id': 'cli-item-edit'})
            exact = (await cli('shopping_items_get_one', {'item_id': iid}))['item']
            assert exact['quantity'] == 3 and exact['price'] is None
            transferred = await cli('recipe_to_shopping', {'recipe_id': rid, 'list_id': lid,
                                                         'ingredient_indexes': [0], 'request_id': 'cli-recipe-shopping'})
            assert store('cli-cross-shopping')['kitchen']['shopping_items'][transferred['item_ids'][0]]['quantity'] == 40
            planned = await cli('plan_to_shopping', {'week_start': '2026-10-12', 'list_id': lid,
                                                    'request_id': 'cli-plan-shopping'})
            assert planned['plan_entry_ids'] == [pid]
            assert store('cli-plan-not-diary')['entries'] == []
            logged = await cli('recipe_log', {'recipe_id': rid, 'servings': 1, 'date': '2026-10-14',
                                             'meal_type': 'lunch', 'request_id': 'cli-recipe-log'})
            eid = logged['entry_id']
            await cli('recipe_entry_update', {'entry_id': eid, 'servings': 2, 'request_id': 'cli-recipe-scale'})
            exact = next(e for e in (await cli('diary', {'date': '2026-10-14'}))['entries'] if e['entry_id'] == eid)
            assert exact['calories'] == 400 and 'carbs' not in exact['nutrients']
            plain = await cli('log_meal', {'name': 'CLI omission', 'calories': 10, 'protein': 0,
                                         'meal_type': 'snack', 'date': '2026-10-14', 'request_id': 'cli-diary-create'})
            await cli('update_meal', {'entry_id': plain['entry_id'], 'calories': 20, 'request_id': 'cli-diary-edit'})
            persisted = next(e for e in store('cli-diary-edit')['entries'] if e['id'] == plain['entry_id'])
            assert persisted['calories'] == 20 and persisted['nutrients']['protein'] == 0 and 'fat' not in persisted['nutrients']
            await cli('delete_meal', {'entry_id': plain['entry_id'], 'request_id': 'cli-diary-delete'})
            await cli('meal_plan_remove', {'entry_id': pid, 'request_id': 'cli-plan-delete'})
            assert not (await cli('meal_plan_get', {'week_start': '2026-10-12'}))['entries']
            await cli('recipes_delete', {'recipe_id': rid, 'request_id': 'cli-recipe-delete'})
            assert not (await cli('recipes_get_all', {}))['recipes']
            assert next(e for e in store('cli-snapshot-after-delete')['entries'] if e['id'] == eid)['recipe_snapshot']['id'] == rid
            await cli('delete_meal', {'entry_id': eid, 'request_id': 'cli-recipe-diary-delete'})
            await cli('shopping_items_delete', {'item_id': iid, 'request_id': 'cli-item-delete'})
            assert iid not in store('cli-item-deleted')['kitchen']['shopping_items']
            await cli('shopping_lists_delete', {'list_id': lid, 'confirm': True, 'request_id': 'cli-list-delete'})
            assert not (await cli('shopping_lists_get_all', {}))['lists']
            assert store('cli-cycle-clean')['entries'] == []
            report['shipped_client_crud_cross_domain'] = True
        except Exception as error:
            report['failures'].append({'phase': 'shipped-client', 'error': str(error), 'trace': traceback.format_exc()})

        # Native private photo fixture; bytes are generated locally, never fetched remotely.
        private = (await cli('recipes_add', {'name': 'Synthetic private photo', 'request_id': 'media-recipe'}))['recipe']
        image = io.BytesIO()
        Image.new('RGB', (4, 4), 'blue').save(image, format='PNG')
        uploaded = await cli('recipes_upload_image', {'recipe_id': private['id'],
                              'image_data': base64.b64encode(image.getvalue()).decode(), 'request_id': 'private-photo'})
        route = uploaded['image_url']
        media_status = []
        for actor, expected in ((None, 401), (1, 404), (2, 404), (0, 200)):
            headers = {} if actor is None else {'Authorization': 'Bearer ' + tokens[actor]}
            async with client.get(url + route, headers=headers) as response:
                assert response.status == expected
                if expected == 200:
                    assert response.headers['Cache-Control'] == 'no-store'
                    assert Image.open(io.BytesIO(await response.read())).format == 'WEBP'
                media_status.append({'actor': actor, 'status': response.status})
        report['private_media'] = media_status
        shared = (await cli('shopping_lists_create', {'name': 'Synthetic shared groceries', 'private': True,
                                                    'request_id': 'shared-list'}))['list']
        await cli('shopping_lists_update_members', {'list_id': shared['id'], 'allowed_users': [users[1].id],
                                                   'request_id': 'shared-members'})
        await cli('shopping_items_add', {'list_id': shared['id'], 'name': 'Synthetic member apple',
                                        'request_id': 'member-item'}, actor=1)
        # Backend denial through actual native transport, not UI permissions alone.
        async with client.ws_connect(url + '/api/websocket') as ws:
            assert (await ws.receive_json())['type'] == 'auth_required'
            await ws.send_json({'type': 'auth', 'access_token': tokens[1]})
            assert (await ws.receive_json())['type'] == 'auth_ok'
            denied = []
            for index, action in enumerate(('diary', 'recipes_get_all', 'meal_plan_get', 'platform_backup'), 1):
                await ws.send_json({'id': index, 'type': 'macromate/command', 'action': action, 'payload': {}})
                result = await ws.receive_json()
                assert not result['success'] and result['error']['code'] == 'unauthorized', result
                denied.append({'action': action, 'response': result})
            report['member_native_denials'] = denied
        async with client.get(url + '/api/macromate/backup', headers={'Authorization': 'Bearer ' + tokens[1]}) as response:
            assert response.status == 403
            report['member_backup_http_status'] = response.status

        proc = await asyncio.create_subprocess_exec(os.environ.get('NODE', 'node'),
            str(REPO / 'tests/frontend/macromate-unified-native.mjs'), stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        cfg = {'url': url, 'accounts': [{'token': token, 'user': {'id': user.id, 'is_admin': user.is_admin}}
                                      for token, user in zip(tokens, users)],
               'output': str(run), 'private_recipe_id': private['id'], 'shared_list_id': shared['id']}
        proc.stdin.write((json.dumps(cfg) + '\n').encode())
        await proc.stdin.drain()
        cfg = None
        while True:
            line = await asyncio.wait_for(proc.stdout.readline(), 100)
            if not line:
                raise AssertionError('Browser exited without completion report')
            message = json.loads(line)
            if message.get('op') == 'done':
                report['browser'] = message['report']
                break
            if message['op'] == 'store':
                result = store(message['label'])
            elif message['op'] == 'cli':
                result = await cli(message['action'], message.get('payload', {}), message.get('actor', 0))
            elif message['op'] == 'backup':
                async with client.get(url + '/api/macromate/backup', headers={'Authorization': 'Bearer ' + tokens[0]}) as response:
                    assert response.status == 200
                    result = await response.json()
                    assert result['data'] == store('native-http-backup')
                    report['native_http_backup'] = {'status': response.status, 'data_equal_store': True}
            elif message['op'] == 'restore_roundtrip':
                before = store('before-native-http-restore')
                restore_payload = {'data': before, 'confirm': True, 'request_id': 'native-http-restore'}
                results = []
                restore_error = None
                for attempt in range(2):
                    async with client.post(url + '/api/macromate/restore',
                        headers={'Authorization': 'Bearer ' + tokens[0]}, json=restore_payload) as response:
                        if response.status != 200:
                            restore_error = {'status': response.status, 'attempt': attempt,
                                             'body': await response.text()}
                            try:
                                coord._validate_restore(before)
                            except Exception as error:
                                restore_error['independent_validation_error'] = str(error)
                            assert store('after-failed-native-http-restore') == before
                            restore_error['store_unchanged'] = True
                            # Diagnostic only, NOT an alternate successful restore:
                            # shared child items inherit ACLs from their parent list.
                            from copy import deepcopy
                            without_items = deepcopy(before)
                            without_items['kitchen']['shopping_items'] = {}
                            for row in without_items['kitchen']['shopping_lists'].values():
                                row['item_order'] = []
                            try:
                                coord._validate_restore(without_items)
                            except Exception as error:
                                restore_error['without_child_items_validation_error'] = str(error)
                            else:
                                restore_error['without_child_items_validates'] = True
                            (run / 'restore-failure.json').write_text(json.dumps(restore_error, indent=2))
                            break
                        results.append(await response.json())
                if restore_error:
                    result = restore_error
                else:
                    assert results[0] == results[1] and results[0]['restored']
                    after = store('after-native-http-restore')
                    # Restore adds its own replay ledger row; domain content stays exact.
                    for section in ('entries', 'foods', 'favorites', 'daily_goals', 'kitchen'):
                        assert after[section] == before[section], section
                    result = {'status': 200, 'stable_same_id_retry': True,
                              'domain_sections_equal': ['entries', 'foods', 'favorites', 'daily_goals', 'kitchen']}
                report['native_http_restore'] = result
            else:
                raise AssertionError('Unknown browser control request')
            proc.stdin.write((json.dumps({'result': result}) + '\n').encode())
            await proc.stdin.drain()
        proc.stdin.close()
        stderr = await proc.stderr.read()
        assert all(token.encode() not in stderr for token in tokens)
        (run / 'browser.stderr.log').write_bytes(stderr)
        assert await asyncio.wait_for(proc.wait(), 15) == 0
        if not report['browser']['ok']:
            report['failures'].append({'phase': 'browser', 'failures': report['browser']['failures']})
        assert hashlib.sha256(client_path.read_bytes()).hexdigest() == client_hash, 'Client changed while acceptance ran'
        report['client_stable_during_run'] = True
    except Exception as error:
        report['failures'].append({'phase': 'native-harness', 'error': str(error), 'trace': traceback.format_exc()})
    finally:
        if proc and proc.returncode is None:
            proc.kill()
            await proc.wait()
        if client:
            await client.close()
        for user in await hass.auth.async_get_users():
            for refresh in list(user.refresh_tokens.values()):
                hass.auth.async_remove_refresh_token(refresh)
        report['remaining_refresh_tokens'] = sum(len(user.refresh_tokens) for user in await hass.auth.async_get_users())
        assert report['remaining_refresh_tokens'] == 0
        await hass.auth._store._store.async_save(hass.auth._store._data_to_save())
        auth_file = config / '.storage/auth'
        report['persisted_refresh_tokens'] = len(json.loads(auth_file.read_text())['data']['refresh_tokens'])
        assert report['persisted_refresh_tokens'] == 0
        tokens.clear()
        await server.stop()
        await hass.async_stop(force=True)
        await hass.async_block_till_done()
        if url:
            try:
                _, writer = await asyncio.open_connection('127.0.0.1', int(url.rsplit(':', 1)[1]))
            except ConnectionRefusedError:
                report['connection_refused_after_stop'] = True
            else:
                writer.close()
                await writer.wait_closed()
                raise AssertionError('Disposable listener still reachable')
        (run / 'client-captured.json').write_text(json.dumps(captured, indent=2))
        (run / 'store-readbacks.json').write_text(json.dumps(snapshots, indent=2))
        report['ok'] = not report['failures']
        (run / 'report.json').write_text(json.dumps(report, indent=2))
        print(json.dumps({'ok': report['ok'], 'report': str(run / 'report.json'),
                          'failures': report['failures'], 'cleanup': {
                              key: report.get(key) for key in ('remaining_refresh_tokens',
                                      'persisted_refresh_tokens', 'connection_refused_after_stop')}}))
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
