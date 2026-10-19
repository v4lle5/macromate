"""Synthetic OFF-shaped responses exercising documented schemas, offline only."""
from __future__ import annotations
import importlib
import importlib.util
import asyncio
import json
import unittest

MODULE = "custom_components.macromate.food_provider"
CODE = "012345678905"


def provider_module():
    assert importlib.util.find_spec(MODULE) is not None, "OFF provider is not implemented"
    return importlib.import_module(MODULE)


def v3_product(**changes):
    data = {"code": CODE, "product_name": "Synthetic drink", "brands": "Example Co",
            "nutrition": {"aggregated_set": {"preparation": "as_sold", "per": "100ml", "nutrients": {
                "energy-kcal": {"value": 43, "unit": "kcal", "source": "packaging"},
                "proteins": {"value": 1.2, "unit": "g"}, "fat": {"value": 0, "unit": "g"},
                "sodium": {"value": .02, "unit": "mg"},
                "vitamin-d": {"value": .000002, "unit": "µg"},
                "calcium": {"value": .12, "unit": "mg"},
                "new-nutrient": {"value": 99},
            }}}}
    data.update(changes)
    return data


class FakeResponse:
    def __init__(self, payload=None, *, status=200, body=None, headers=None):
        self.status = status
        self.body = body if body is not None else json.dumps(payload).encode()
        self.headers = headers or {"Content-Type": "application/json"}
        self.content = self
        self.closed = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        self.closed = True

    async def iter_chunked(self, size):
        for start in range(0, len(self.body), size):
            yield self.body[start:start + size]


class FakeSession:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


@unittest.skipUnless(importlib.util.find_spec("aiohttp"), "HTTP tests require aiohttp (available in the HA runtime)")
class OffHttpTests(unittest.IsolatedAsyncioTestCase):
    async def test_cache_capacity_is_bounded_and_oldest_entry_is_evicted(self):
        module = provider_module()
        now = [0.0]
        codes = []
        for index in range(129):
            prefix = f"{index:011d}"
            check = (-sum(int(char) * (3 if position % 2 == 0 else 1)
                          for position, char in enumerate(reversed(prefix)))) % 10
            codes.append(prefix + str(check))
        responses = [FakeResponse({"status": "success", "product": v3_product(code=code)}) for code in codes]
        responses.append(FakeResponse({"status": "success", "product": v3_product(code=codes[0])}))
        session = FakeSession(*responses)
        client = module.OpenFoodFactsProvider(session, enabled=True, monotonic=lambda: now[0])
        for code in codes:
            now[0] += 5  # less than fifteen requests in each rolling minute
            await client.async_lookup_barcode(code)
        self.assertLessEqual(len(client._cache), 128)
        await client.async_lookup_barcode(codes[0])
        self.assertEqual(len(session.calls), 130)

    async def test_real_aiohttp_transport_against_offline_tls_server(self):
        import os
        import shutil
        import socket
        import ssl
        import tempfile
        import aiohttp
        from aiohttp.abc import AbstractResolver, ResolveResult
        from aiohttp import web
        if shutil.which("openssl") is None:
            self.skipTest("openssl required for the disposable TLS server")
        module = provider_module()
        with tempfile.TemporaryDirectory(prefix="macromate-food-tls-", dir=os.environ.get("TMPDIR")) as directory:
            certificate = os.path.join(directory, "certificate.pem")
            key = os.path.join(directory, "key.pem")
            process = await asyncio.create_subprocess_exec(
                "openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                "-keyout", key, "-out", certificate, "-subj", "/CN=world.openfoodfacts.org",
                "-addext", "subjectAltName=DNS:world.openfoodfacts.org",
                stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
            self.assertEqual(await process.wait(), 0)
            server_ssl = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            server_ssl.load_cert_chain(certificate, key)
            client_ssl = ssl.create_default_context(cafile=certificate)
            calls = []

            async def handler(request):
                calls.append((request.method, request.path, dict(request.query), request.headers.get("User-Agent")))
                if request.path.startswith("/cgi"):
                    return web.json_response({"products": [v3_product()]})
                if request.match_info["code"] == "96385074":
                    return web.Response(status=302, headers={"Location": "https://example.invalid/no-follow"})
                return web.json_response({"status": "success", "product": v3_product()})

            app = web.Application()
            app.router.add_get("/api/v3.6/product/{code}", handler)
            app.router.add_get("/cgi/search.pl", handler)
            runner = web.AppRunner(app)
            await runner.setup()
            site = web.TCPSite(runner, "127.0.0.1", 0, ssl_context=server_ssl)
            await site.start()
            local_port = runner.addresses[0][1]

            class OfflineResolver(AbstractResolver):
                async def resolve(self, host, port=0, family=socket.AF_INET) -> list[ResolveResult]:
                    if host != "world.openfoodfacts.org":
                        raise AssertionError("test attempted external DNS")
                    return [{"hostname": host, "host": "127.0.0.1", "port": local_port,
                             "family": socket.AF_INET, "proto": 0, "flags": 0}]

                async def close(self):
                    pass

            try:
                connector = aiohttp.TCPConnector(resolver=OfflineResolver(), ssl=client_ssl)
                async with aiohttp.ClientSession(connector=connector, trust_env=False) as session:
                    client = module.OpenFoodFactsProvider(session, enabled=True)
                    food = await client.async_lookup_barcode(CODE)
                    self.assertEqual(food.scaled(100)["sodium"], 20)
                    foods = await client.async_search("synthetic & drink", submitted=True)
                    self.assertEqual(foods, [food])
                    with self.assertRaises(module.ProviderUnavailable):
                        await client.async_lookup_barcode("96385074")
                self.assertEqual(len(calls), 3)
                self.assertTrue(all(call[0] == "GET" for call in calls))
                self.assertEqual(calls[1][2]["search_terms"], "synthetic & drink")
                self.assertTrue(all("MacroMate/" in call[3] for call in calls))
            finally:
                await runner.cleanup()

    async def test_rate_limits_and_429_cooldown_block_without_automatic_waits(self):
        module = provider_module()
        self.assertTrue(hasattr(module, "ProviderRateLimited"), "OFF documented quotas missing")
        now = [0.0]
        codes = []
        for index in range(16):
            prefix = f"{index:011d}"
            check = (-sum(int(char) * (3 if position % 2 == 0 else 1)
                          for position, char in enumerate(reversed(prefix)))) % 10
            codes.append(prefix + str(check))
        session = FakeSession(*[FakeResponse({"status": "success", "product": v3_product(code=code)}) for code in codes])
        client = module.OpenFoodFactsProvider(session, enabled=True, monotonic=lambda: now[0])
        for code in codes[:15]:
            await client.async_lookup_barcode(code)
        with self.assertRaises(module.ProviderRateLimited):
            await client.async_lookup_barcode(codes[15])
        self.assertEqual(len(session.calls), 15)
        await client.async_lookup_barcode(codes[0])  # cache does not consume a quota
        now[0] = 60
        await client.async_lookup_barcode(codes[15])
        self.assertEqual(len(session.calls), 16)
        search_session = FakeSession(*[FakeResponse({"products": []}) for _ in range(11)])
        search = module.OpenFoodFactsProvider(search_session, enabled=True, monotonic=lambda: now[0])
        for index in range(10):
            await search.async_search(f"query {index}", submitted=True)
        with self.assertRaises(module.ProviderRateLimited):
            await search.async_search("query 10", submitted=True)
        self.assertEqual(len(search_session.calls), 10)
        now[0] += 60
        await search.async_search("query 10", submitted=True)
        cooldown_session = FakeSession(FakeResponse(status=429, headers={"Retry-After": "120"}),
                                      FakeResponse({"status": "success", "product": v3_product()}))
        cooldown = module.OpenFoodFactsProvider(cooldown_session, enabled=True, monotonic=lambda: now[0])
        with self.assertRaises(module.ProviderRateLimited):
            await cooldown.async_lookup_barcode(CODE)
        cooldown.set_enabled(False)
        cooldown.set_enabled(True)  # toggling consent must not reset quotas/cooldown
        now[0] += 119
        with self.assertRaises(module.ProviderRateLimited):
            await cooldown.async_lookup_barcode(CODE)
        self.assertEqual(len(cooldown_session.calls), 1)
        now[0] += 1
        await cooldown.async_lookup_barcode(CODE)
        self.assertEqual(len(cooldown_session.calls), 2)

    async def test_cache_coalesces_requests_expires_and_does_not_bypass_consent(self):
        module = provider_module()
        now = [0.0]
        session = FakeSession(*[FakeResponse({"status": "success", "product": v3_product()}) for _ in range(3)])
        self.assertIn("monotonic", __import__("inspect").signature(module.OpenFoodFactsProvider).parameters,
                      "deterministic bounded cache clock missing")
        client = module.OpenFoodFactsProvider(session, enabled=True, monotonic=lambda: now[0])
        results = await asyncio.gather(*[client.async_lookup_barcode(CODE) for _ in range(5)])
        self.assertEqual(len(session.calls), 1)
        self.assertTrue(all(food == results[0] for food in results))
        results[0].to_dict()["nutrients"]["calories"] = 99
        self.assertEqual((await client.async_lookup_barcode(CODE)).nutrients["calories"], .43)
        now[0] = 3601
        await client.async_lookup_barcode(CODE)
        self.assertEqual(len(session.calls), 2)
        client.set_enabled(False)
        with self.assertRaises(module.ProviderConsentRequired):
            await client.async_lookup_barcode(CODE)
        client.set_enabled(True)
        await client.async_lookup_barcode(CODE)
        self.assertEqual(len(session.calls), 3)
        search_session = FakeSession(*[FakeResponse({"products": [v3_product()]}) for _ in range(2)])
        search = module.OpenFoodFactsProvider(search_session, enabled=True, monotonic=lambda: now[0])
        first = await search.async_search("Example", submitted=True)
        first.clear()
        self.assertEqual(len(await search.async_search("Example", submitted=True)), 1)
        self.assertEqual(len(search_session.calls), 1)
        now[0] += 301
        await search.async_search("Example", submitted=True)
        self.assertEqual(len(search_session.calls), 2)
        absent_session = FakeSession(FakeResponse(status=404), FakeResponse(status=404))
        absent = module.OpenFoodFactsProvider(absent_session, enabled=True, monotonic=lambda: now[0])
        self.assertIsNone(await absent.async_lookup_barcode(CODE))
        self.assertIsNone(await absent.async_lookup_barcode(CODE))
        self.assertEqual(len(absent_session.calls), 1)
        now[0] += 301
        self.assertIsNone(await absent.async_lookup_barcode(CODE))
        self.assertEqual(len(absent_session.calls), 2)

    async def test_text_search_requires_explicit_submit_and_maps_real_json_rows(self):
        module = provider_module()
        client = module.OpenFoodFactsProvider(FakeSession(), enabled=True)
        self.assertTrue(hasattr(client, "async_search"), "explicit online search missing")
        with self.assertRaises(ValueError):
            await client.async_search("cereal")
        for query in ("", " ", "x" * 201, "a\nb", 123):
            with self.subTest(query=query), self.assertRaises(ValueError):
                await client.async_search(query, submitted=True)
        for limit in (0, 21, True, 1.5):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                await client.async_search("cereal", submitted=True, limit=limit)
        self.assertEqual(client._session.calls, [])
        rows = [v3_product(), v3_product(), {"code": "bad", "product_name": "Invalid"},
                v3_product(code="96385074", product_name="Second synthetic label")]
        session = FakeSession(FakeResponse({"products": rows, "count": 999}))
        client = module.OpenFoodFactsProvider(session, enabled=True)
        results = await client.async_search("Example & cereal", submitted=True, limit=2)
        self.assertEqual([food.food_id for food in results], ["off:" + CODE, "off:96385074"])
        url, kwargs = session.calls[0]
        self.assertEqual(url, "https://world.openfoodfacts.org/cgi/search.pl")
        self.assertEqual(kwargs["params"]["search_terms"], "Example & cereal")
        self.assertEqual(kwargs["params"]["action"], "process")
        self.assertEqual(kwargs["params"]["json"], "1")
        self.assertEqual(kwargs["params"]["page_size"], "2")
        for response in (FakeResponse({"products": {}}), FakeResponse({"products": []}, status=404)):
            with self.assertRaises(module.ProviderUnavailable):
                await module.OpenFoodFactsProvider(FakeSession(response), enabled=True).async_search("test", submitted=True)
        disabled = module.OpenFoodFactsProvider(FakeSession())
        with self.assertRaises(module.ProviderConsentRequired):
            await disabled.async_search("cereal", submitted=True)

    async def test_http_failures_and_bounded_json_are_sanitized_without_retries(self):
        module = provider_module()
        cases = [FakeResponse(status=status, body=b"secret remote body") for status in
                 (301, 302, 303, 307, 308, 401, 403, 429, 500, 503)]
        cases += [FakeResponse(body=body) for body in
                  (b"not-json-secret", b'{"product":', b'{"status":"success","private":NaN}',
                   b'{"private":1e999}', b"[]", b"\xff", b"x" * 1_048_577)]
        cases += [FakeResponse(body=b"{}", headers={"Content-Type": "text/html"}),
                  FakeResponse(body=b"{}", headers={"Content-Type": "application/json", "Content-Length": "9999999"}),
                  FakeResponse({"status": "failure", "product": v3_product()}),
                  FakeResponse({"status": "success", "product": v3_product(code="96385074")}),
                  TimeoutError("secret timeout"), OSError("secret connection error")]
        for response in cases:
            with self.subTest(response=getattr(response, "status", repr(response))):
                session = FakeSession(response)
                client = module.OpenFoodFactsProvider(session, enabled=True)
                with self.assertRaises(module.ProviderUnavailable) as caught:
                    await client.async_lookup_barcode(CODE)
                self.assertNotIn("secret", str(caught.exception))
                self.assertIsNone(caught.exception.__cause__)
                self.assertTrue(caught.exception.__suppress_context__)
                self.assertEqual(len(session.calls), 1)
                if isinstance(response, FakeResponse):
                    self.assertTrue(response.closed)
        absent = module.OpenFoodFactsProvider(FakeSession(FakeResponse(status=404, body=b"not JSON")), enabled=True)
        self.assertIsNone(await absent.async_lookup_barcode(CODE))

    async def test_opt_in_barcode_lookup_uses_fixed_v36_https_read_only_request(self):
        module = provider_module()
        self.assertTrue(hasattr(module, "OpenFoodFactsProvider"), "async OFF client missing")
        session = FakeSession(FakeResponse({"status": "success", "product": v3_product()}))
        client = module.OpenFoodFactsProvider(session)
        with self.assertRaises(module.ProviderConsentRequired):
            await client.async_lookup_barcode(CODE)
        self.assertEqual(session.calls, [])
        client.set_enabled(True)
        food = await client.async_lookup_barcode(CODE)
        self.assertEqual(food.scaled(100)["calories"], 43)
        self.assertEqual(len(session.calls), 1)
        url, kwargs = session.calls[0]
        self.assertEqual(url, "https://world.openfoodfacts.org/api/v3.6/product/" + CODE)
        self.assertFalse(kwargs["allow_redirects"])
        self.assertEqual(kwargs["timeout"].total, 10)
        self.assertIn("MacroMate/", kwargs["headers"]["User-Agent"])
        self.assertIn("https://github.com/v4lle5/macromate", kwargs["headers"]["User-Agent"])
        self.assertNotIn("Authorization", kwargs["headers"])
        self.assertIn("nutrition", kwargs["params"]["fields"].split(","))
        self.assertNotIn("images", kwargs["params"]["fields"])
        self.assertEqual(client.attribution, dict(module.ATTRIBUTION))
        for token in (CODE + " ", "012345678904", 123):
            with self.assertRaises(ValueError):
                await client.async_lookup_barcode(token)
        self.assertEqual(len(session.calls), 1)


class OffMappingTests(unittest.TestCase):
    def test_off_specific_vitamin_names_map_to_domain_keys(self):
        module = provider_module()
        data = v3_product()
        data["nutrition"]["aggregated_set"]["nutrients"].update({
            "vitamin-pp": {"value": .004, "unit": "mg"},
            "pantothenic-acid": {"value": .002, "unit": "mg"},
            "folates": {"value": .00003, "unit": "µg"},
            "biotin": {"value": .000002, "unit": "µg"},
        })
        values = module.map_open_food_facts_product(data).scaled(100)
        self.assertAlmostEqual(values["vitamin_b3"], 4)
        self.assertAlmostEqual(values["vitamin_b5"], 2)
        self.assertAlmostEqual(values["vitamin_b11"], 30)
        self.assertAlmostEqual(values["biotin"], 2)

    def test_ambiguous_or_negative_serving_labels_are_not_exact_portions(self):
        module = provider_module()
        for label in ("-30 ml", "1 cup (-30 ml)", "0,5 ml", "1 bottle (0,5 ml)",
                      "<30 ml", "2 x 30 ml", "30 ml or 60 ml", "~ 30 ml"):
            with self.subTest(label=label):
                self.assertEqual(module.map_open_food_facts_product(v3_product(serving_size=label)).servings, ())

    def test_legacy_search_labels_and_product_specific_servings(self):
        module = provider_module()
        legacy = {"code": CODE, "product_name": "Synthetic cereal", "nutrition_data_per": "serving",
                  "nutriments": {"energy-kcal_100g": 400, "proteins_100g": 10,
                                 "sodium_100g": .01, "sodium_unit": "mg",
                                 "energy-kcal_serving": 120, "fiber_prepared_100g": 9},
                  "serving_size": "1 bowl (30 g)", "serving_quantity": 30, "serving_quantity_unit": "g"}
        food = module.map_open_food_facts_product(legacy)
        self.assertEqual(food.base_unit, "g")
        self.assertEqual(food.scaled(100), {"calories": 400, "protein": 10, "sodium": 10})
        self.assertEqual(food.servings[0].label, "1 bowl (30 g)")
        self.assertEqual(food.portion_amount(serving_id="off-serving", quantity=2), 60)
        liquid = v3_product(serving_size="1 bottle (330 ml)", serving_quantity=330,
                            serving_quantity_unit="ml")
        drink = module.map_open_food_facts_product(liquid)
        self.assertEqual(drink.portion_amount(serving_id="off-serving", quantity=1.5), 495)
        for changes in ({"serving_quantity": 0}, {"serving_quantity": 20},
                        {"serving_quantity_unit": "g"}, {"serving_size": "one bottle"}):
            self.assertEqual(module.map_open_food_facts_product({**liquid, **changes}).servings, ())
        unknown = module.map_open_food_facts_product({**legacy, "no_nutrition_data": "on"})
        self.assertEqual(unknown.nutrients, {})
        for changes in ({"nutriments": []}, {"product_quantity_unit": "ml"},
                        {"nutrition_data_per": "spoon"}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                module.map_open_food_facts_product({**legacy, **changes})

    def test_mapping_rejects_invalid_data_and_omits_qualified_or_computed_values(self):
        module = provider_module()
        for changes in ({"code": "012345678904"}, {"code": 123}, {"product_name": ""},
                        {"nutrition": {"aggregated_set": {"per": "serving", "preparation": "as_sold", "nutrients": {}}}},
                        {"nutrition": {"aggregated_set": {"per": "100g", "preparation": "prepared", "nutrients": {}}}},
                        {"nutrition": {"aggregated_set": []}}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                module.map_open_food_facts_product(v3_product(**changes))
        with self.assertRaises(ValueError):
            module.map_open_food_facts_product(v3_product(), expected_barcode="96385074")
        for bad in (-1, True, float("nan"), float("inf"), "1e999", []):
            data = v3_product()
            data["nutrition"]["aggregated_set"]["nutrients"]["fat"]["value"] = bad
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                module.map_open_food_facts_product(data)
        data = v3_product()
        nutrient_data = data["nutrition"]["aggregated_set"]["nutrients"]
        nutrient_data.update({"fat": {"value_computed": 2},
                              "proteins": {"value": 1, "modifier": "<"},
                              "sodium": {"value": .02, "source": "estimate"},
                              "vitamin-d": {"value": .02, "unit": "iu"},
                              "energy-kcal": {"value_computed": 50},
                              "energy-kj": {"value": 418.4},
                              "sugars": {"value": "5.5"},
                              "iron": {"value": .002}, "fiber": {"value": None}})
        values = module.map_open_food_facts_product(data).scaled(100)
        self.assertAlmostEqual(values["calories"], 100)
        self.assertAlmostEqual(values["iron"], 2)
        self.assertAlmostEqual(values["sugar"], 5.5)
        for missing in ("fat", "protein", "sodium", "fiber", "vitamin_d"):
            self.assertNotIn(missing, values)
        no_energy = v3_product()
        no_energy["nutrition"]["aggregated_set"]["nutrients"].pop("energy-kcal")
        self.assertNotIn("calories", module.map_open_food_facts_product(no_energy).nutrients)

    def test_v36_aggregated_normalized_units_map_without_fabricated_zeros(self):
        module = provider_module()
        food = module.map_open_food_facts_product(v3_product(), expected_barcode=CODE)
        self.assertEqual(food.food_id, "off:" + CODE)
        self.assertEqual(food.base_unit, "ml")
        self.assertEqual(food.producer, "Example Co")
        values = food.scaled(100)
        self.assertEqual(values["calories"], 43)
        self.assertEqual(values["protein"], 1.2)
        self.assertEqual(values["fat"], 0)
        self.assertEqual(values["sodium"], 20)
        self.assertEqual(values["calcium"], 120)
        self.assertAlmostEqual(values["vitamin_d"], 2)
        self.assertNotIn("carbs", values)
        self.assertNotIn("new-nutrient", values)
        wire = food.to_dict()
        self.assertEqual(wire["source"], "open_food_facts")
        self.assertFalse(wire["is_custom"])
        self.assertEqual(wire["source_url"], "https://world.openfoodfacts.org/product/" + CODE)
        self.assertEqual(wire["license"], "ODbL-1.0 / DbCL-1.0")
        self.assertEqual(food.barcodes, (CODE,))
        self.assertEqual(module.ATTRIBUTION["database_license"], "ODbL-1.0")
        self.assertEqual(module.ATTRIBUTION["contents_license"], "DbCL-1.0")
