"""Native frontend registration without editing YAML/storage Lovelace resources."""
import copy
import os
import tempfile
import unittest

try:
    from homeassistant.core import HomeAssistant
    from homeassistant.components import frontend, lovelace
    from homeassistant.components.lovelace import dashboard, resources
except ImportError:
    HomeAssistant = None


@unittest.skipIf(HomeAssistant is None, 'Requires isolated HA runtime')
class CardResourceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ['TMPDIR'])
        self.hass = HomeAssistant(self.tmp.name)

    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()

    async def test_extra_module_is_idempotent_and_does_not_touch_either_resource_mode(self):
        from custom_components.macromate import _async_card_resource
        events = []
        modules = frontend.UrlManager(lambda *event: events.append(event), ['/existing.js'])
        self.hass.data[frontend.DATA_EXTRA_MODULE_URL] = modules
        original = [{'id': 'existing', 'url': '/existing.js?v=unchanged', 'type': 'module'}]
        yaml_resources = resources.ResourceYAMLCollection(copy.deepcopy(original))
        storage_resources = resources.ResourceStorageCollection(self.hass, dashboard.LovelaceStorage(self.hass, None))
        await storage_resources.async_create_item({'url': original[0]['url'], 'res_type': 'module'})
        for mode, collection in [('yaml', yaml_resources), ('storage', storage_resources)]:
            self.hass.data[lovelace.LOVELACE_DATA] = lovelace.LovelaceData(mode, {}, collection, {})
            before = copy.deepcopy(collection.async_items())
            await _async_card_resource(self.hass)
            current_urls = modules.urls
            await _async_card_resource(self.hass)
            self.assertIs(modules.urls, current_urls, 'Repeated entry setup must not publish duplicate events')
            self.assertEqual(collection.async_items(), before)
        import json
        from pathlib import Path

        expected = json.loads((Path(__file__).parents[1] / 'frontend' / 'delivery-manifest.json').read_text())['entry']
        self.assertEqual(events, [('added', expected)])
        self.assertEqual(len(modules.urls), 2)

    async def test_headless_runtime_is_not_forced_to_load_a_frontend(self):
        from custom_components.macromate import _async_card_resource
        await _async_card_resource(self.hass)
        self.assertNotIn(frontend.DATA_EXTRA_MODULE_URL, self.hass.data)
