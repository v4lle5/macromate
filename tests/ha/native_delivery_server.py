"""Disposable native HA static server for warm-browser delivery regressions.

This is not an authenticated application/backend or lifecycle test. It uses the
same HA HomeAssistantHTTP/StaticPathConfig implementation as MacroMate's asset
registration, with its normal public static-file policy. No production config,
credentials, auth overrides or non-loopback listener is used. Close stdin to stop.
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
import sys
import tempfile


async def main():
    from homeassistant import auth, loader
    from homeassistant.bootstrap import async_load_base_functionality
    from homeassistant.config_entries import ConfigEntries
    from homeassistant.core import HomeAssistant
    from homeassistant.components.http import StaticPathConfig
    from homeassistant.components.http.server import HomeAssistantHTTP

    frontend = Path(sys.argv[1]).resolve(strict=True)
    with tempfile.TemporaryDirectory(prefix='macromate-delivery-ha-') as config:
        hass = HomeAssistant(config)
        hass.config.skip_pip = True
        hass.config_entries = ConfigEntries(hass, {})
        loader.async_setup(hass)
        await hass.config_entries.async_initialize()
        assert await async_load_base_functionality(hass)
        hass.auth = await auth.auth_manager_from_config(hass, [], [])
        server = HomeAssistantHTTP(hass, None, None, None, ['127.0.0.1'], 0, [], 'modern')
        hass.http = server
        try:
            await server.async_bind()
            await server.async_initialize(cors_origins=[], use_x_forwarded_for=False,
                                          login_threshold=-1, is_ban_enabled=False,
                                          use_x_frame_options=True)
            fixture = Path(config) / 'delivery.html'
            fixture.write_text('<!doctype html><link rel="icon" href="data:,"><body></body>')
            await server.async_register_static_paths([
                StaticPathConfig('/macromate-assets', str(frontend), False),
                StaticPathConfig('/native-delivery/', str(fixture), False),
            ])
            await server.start()
            sockets = server._server.sockets
            assert all(sock.getsockname()[0] == '127.0.0.1' for sock in sockets)
            print(json.dumps({'url': f'http://127.0.0.1:{sockets[0].getsockname()[1]}'}), flush=True)
            await asyncio.to_thread(sys.stdin.buffer.read)
        finally:
            await server.stop()
            await hass.async_stop(force=True)


if __name__ == '__main__':
    asyncio.run(main())
