"""Reloaded card delivery keeps one automatic revision, without editing dashboards."""

import importlib.util
import json
import os
import sys
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import patch

from custom_components.macromate import _async_card_resource

if importlib.util.find_spec("homeassistant") is not None:
    from homeassistant.components import frontend as NATIVE_FRONTEND
    from homeassistant.components import lovelace
    from homeassistant.components.lovelace import dashboard, resources
    from homeassistant.core import HomeAssistant
else:
    NATIVE_FRONTEND = None

ROOT = Path(__file__).resolve().parents[1]
CURRENT = json.loads(
    (ROOT / "custom_components/macromate/frontend/delivery-manifest.json").read_text()
)["entry"]
PREVIOUS = "/macromate-assets/releases/" + "a" * 64 + "/loader.js"


class FixtureUrlManager:
    """Small no-HA fixture; the native subclass below uses HA's actual manager."""

    def __init__(self, on_change, urls):
        self._on_change = on_change
        self.urls = frozenset(urls)

    def add(self, url):
        self.urls = self.urls | {url}
        self._on_change("added", url)

    def remove(self, url):
        self.urls = self.urls - {url}
        self._on_change("removed", url)


class CardResourceTests(unittest.IsolatedAsyncioTestCase):
    native = False

    def setUp(self):
        if self.native:
            self.frontend = NATIVE_FRONTEND
        else:
            self.frontend = ModuleType("homeassistant.components.frontend")
            self.frontend.DATA_EXTRA_MODULE_URL = "frontend_extra_module_url"
            self.frontend.UrlManager = FixtureUrlManager
            self.frontend.add_extra_js_url = lambda hass, url: hass.data[
                self.frontend.DATA_EXTRA_MODULE_URL
            ].add(url)
            self.frontend.remove_extra_js_url = lambda hass, url: hass.data[
                self.frontend.DATA_EXTRA_MODULE_URL
            ].remove(url)
            package = ModuleType("homeassistant")
            components = ModuleType("homeassistant.components")
            package.components = components
            components.frontend = self.frontend
            patched = patch.dict(
                sys.modules,
                {
                    "homeassistant": package,
                    "homeassistant.components": components,
                    "homeassistant.components.frontend": self.frontend,
                },
            )
            patched.start()
            self.addCleanup(patched.stop)

    def runtime(self, urls=None):
        async def executor(function):
            return function()

        # A manually pinned Lovelace URL is a separate user-owned setting, even
        # when its spelling happens to match an old automatic module exactly.
        manual = {
            "storage_resources": [{"url": PREVIOUS, "type": "module"}],
            "yaml_resources": [{"url": "/local/macromate-card.js", "type": "module"}],
        }
        hass = SimpleNamespace(data={"lovelace": deepcopy(manual)}, async_add_executor_job=executor)
        changes = []
        if urls is not None:
            hass.data[self.frontend.DATA_EXTRA_MODULE_URL] = self.frontend.UrlManager(
                lambda operation, url: changes.append((operation, url)), list(urls)
            )
        return hass, changes, manual

    async def test_previous_revision_is_replaced_and_repeat_registration_is_idle(self):
        other = {
            "/hacsfiles/another-card/another-card.js",
            "/local/macromate-card.js",
            "/macromate-assets/macromate-card.js?v=manual",
            PREVIOUS + "?manual=1",
            "https://ha.example" + PREVIOUS,
            "/macromate-assets/releases/not-a-revision/loader.js",
            PREVIOUS.replace("loader.js", "another-module.js"),
        }
        hass, changes, manual = self.runtime(other | {PREVIOUS})
        await _async_card_resource(hass)
        self.assertEqual(hass.data[self.frontend.DATA_EXTRA_MODULE_URL].urls, other | {CURRENT})
        self.assertEqual(changes, [("removed", PREVIOUS), ("added", CURRENT)])
        self.assertEqual(hass.data["lovelace"], manual)
        await _async_card_resource(hass)
        self.assertEqual(changes, [("removed", PREVIOUS), ("added", CURRENT)])
        self.assertEqual(hass.data["lovelace"], manual)

    async def test_existing_current_revision_still_removes_obsolete_registration(self):
        hass, changes, _ = self.runtime({PREVIOUS, CURRENT, "/unrelated.js"})
        await _async_card_resource(hass)
        self.assertEqual(
            hass.data[self.frontend.DATA_EXTRA_MODULE_URL].urls, {CURRENT, "/unrelated.js"}
        )
        self.assertEqual(changes, [("removed", PREVIOUS)])

    async def test_headless_runtime_does_not_create_a_module_manager(self):
        hass, changes, manual = self.runtime()
        await _async_card_resource(hass)
        self.assertEqual(hass.data, {"lovelace": manual})
        self.assertEqual(changes, [])


@unittest.skipUnless(NATIVE_FRONTEND, "Home Assistant frontend not installed")
class NativeCardResourceTests(CardResourceTests):
    """Run the same regression against the installed HA manager and public API."""

    native = True


@unittest.skipUnless(NATIVE_FRONTEND, "Home Assistant frontend not installed")
class NativeLovelaceResourceTests(unittest.IsolatedAsyncioTestCase):
    """Retain the original real YAML/storage resource preservation regression."""

    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"])
        self.hass = HomeAssistant(self.tmp.name)

    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()

    async def test_extra_module_is_idempotent_and_does_not_touch_either_resource_mode(self):
        events = []
        modules = NATIVE_FRONTEND.UrlManager(lambda *event: events.append(event), ["/existing.js"])
        self.hass.data[NATIVE_FRONTEND.DATA_EXTRA_MODULE_URL] = modules
        original = [{"id": "existing", "url": "/existing.js?v=unchanged", "type": "module"}]
        yaml_resources = resources.ResourceYAMLCollection(deepcopy(original))
        storage_resources = resources.ResourceStorageCollection(
            self.hass, dashboard.LovelaceStorage(self.hass, None)
        )
        await storage_resources.async_create_item({"url": original[0]["url"], "res_type": "module"})
        for mode, collection in [("yaml", yaml_resources), ("storage", storage_resources)]:
            self.hass.data[lovelace.LOVELACE_DATA] = lovelace.LovelaceData(mode, {}, collection, {})
            before = deepcopy(collection.async_items())
            await _async_card_resource(self.hass)
            current_urls = modules.urls
            await _async_card_resource(self.hass)
            self.assertIs(
                modules.urls, current_urls, "Repeated entry setup must not publish duplicate events"
            )
            self.assertEqual(collection.async_items(), before)
        self.assertEqual(events, [("added", CURRENT)])
        self.assertEqual(len(modules.urls), 2)

    async def test_headless_runtime_is_not_forced_to_load_a_frontend(self):
        await _async_card_resource(self.hass)
        self.assertNotIn(NATIVE_FRONTEND.DATA_EXTRA_MODULE_URL, self.hass.data)


if __name__ == "__main__":
    unittest.main()
