"""Pure helper tests; optional libraries are skipped, never impersonated."""
from __future__ import annotations

import asyncio
import base64
import importlib.util
import io
import json
from pathlib import Path
import unittest
from typing import Any
from unittest.mock import patch
import zipfile

network: Any = None
PATH = Path(__file__).parents[1] / "custom_components/macromate/kitchen_network.py"
if PATH.exists():
    spec = importlib.util.spec_from_file_location("kitchen_network_test_target", PATH)
    assert spec is not None and spec.loader is not None
    network = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(network)
else:
    network = None


def optional(name):
    return importlib.util.find_spec(name) is not None


class IngredientTests(unittest.TestCase):
    def test_exact_fractions_units_notes_and_headings(self):
        self.assertTrue(callable(getattr(network, "parse_ingredient", None)))
        for text, amount, exact, unit, name in [
            ("1½ tablespoons of butter, melted", "1 1/2", "3/2", "Tbsp", "butter"),
            ("⅓ cup flour", "1/3", "1/3", "cup", "flour"),
            ("0,25 litres milk", "0.25", "1/4", "L", "milk"),
            ("200g of the sugar", "200", "200", "g", "sugar"),
            ("1 1/4 fluid ounces water", "1 1/4", "5/4", "fl oz", "water"),
        ]:
            row = network.parse_ingredient(text)
            self.assertEqual((row["amount"], row["amount_fraction"], row["unit"], row["name"]),
                             (amount, exact, unit, name))
            self.assertEqual(row["raw"], text)
        self.assertEqual(network.parse_ingredient("1½ tablespoons of butter, melted")["notes"], "melted")
        self.assertTrue(network.parse_ingredient("FOR THE SAUCE:")["is_heading"])
        self.assertEqual(network.parse_ingredient("garlic")["name"], "garlic")
        self.assertEqual(network.parse_ingredient("2-3 cloves garlic")["amount_range"], ["2", "3"])
        self.assertIsNone(network.parse_ingredient("1/0 cup flour")["amount_fraction"])
        self.assertIsNone(network.parse_ingredient("salt to taste")["amount"])


class NutritionTests(unittest.TestCase):
    def test_declared_values_units_zero_unknown_and_basis(self):
        self.assertTrue(callable(getattr(network, "parse_nutrition", None)))
        raw = {"calories": "418.4 kJ", "proteinContent": "1200 mg",
               "fatContent": 0, "sodiumContent": "1 g", "iron": "3 mg",
               "carbohydrateContent": "< 2 g", "fiberContent": "unknown"}
        parsed = network.parse_nutrition(raw, basis="per_recipe")
        self.assertEqual(parsed["nutrition"], {"calories": 100.0, "protein": 1.2,
                                               "fat": 0.0, "sodium": 1000.0})
        self.assertEqual(parsed["nutrition_raw"], raw)
        self.assertEqual(parsed["nutrition_basis"], "per_recipe")
        self.assertEqual(network.parse_nutrition({"calories": "50 kcal"})["nutrition_basis"], "unknown")
        self.assertEqual(network.parse_nutrition({"calories": "50 kcal", "servingSize": "1 slice"})["nutrition_basis"], "per_serving")
        self.assertEqual(network.parse_nutrition({"calories": "NaN", "fat": -1})["nutrition"], {})
        with self.assertRaises(ValueError):
            network.parse_nutrition({}, basis="guessed")


def recipe_page(node):
    return '<html><head><script type="application/ld+json">' + json.dumps(node) + '</script></head></html>'


@unittest.skipUnless(optional("bs4") and optional("recipe_scrapers"), "optional recipe libraries unavailable")
class WebParsingTests(unittest.TestCase):
    def test_real_scraper_graph_metadata_and_missing_nutrients(self):
        self.assertTrue(callable(getattr(network, "parse_recipe_html", None)))
        node = {"@type": ["Thing", "Recipe"], "name": "Soup", "recipeIngredient": ["⅓ cup beans"],
                "recipeInstructions": [{"@type": "HowToSection", "name": "Finish", "itemListElement": [
                    {"@type": "HowToStep", "text": "<b>Stir</b> gently"}]}],
                "recipeYield": "4 servings", "prepTime": "PT1H30M", "cookTime": "PT30S",
                "recipeCuisine": ["Italian", "French"], "recipeCategory": ["Dinner", "Soup"],
                "recipeCourse": ["Main"], "recipeCollection": ["Family"], "keywords": "warm, cheap",
                "image": [{"@type": "ImageObject", "url": "/one.png"}, "/two.png"],
                "aggregateRating": {"ratingValue": "4.5", "ratingCount": 8},
                "nutrition": {"calories": "200 kcal", "proteinContent": "5 g", "servingSize": "1 bowl"},
                "author": {"name": "Cook"}, "notes": "No guesses", "customField": {"kept": True}}
        html = recipe_page({"@graph": [{"@type": "WebPage"}, node]})
        with patch("socket.socket.connect", side_effect=AssertionError("parser performed network")):
            row = network.parse_recipe_html(html, "https://www.allrecipes.com/recipe/1/soup/")
        self.assertEqual(row["name"], "Soup")
        self.assertEqual(row["ingredients"][0]["amount_fraction"], "1/3")
        self.assertEqual(row["instructions"], ["Stir gently"])
        self.assertEqual(row["prep_time"], 90)
        self.assertEqual(row["cook_time"], 0.5)
        self.assertEqual(row["categories"], ["Dinner", "Soup"])
        self.assertEqual(row["cuisines"], ["Italian", "French"])
        self.assertEqual(row["photos"], ["https://www.allrecipes.com/one.png", "https://www.allrecipes.com/two.png"])
        self.assertEqual(row["rating"], 4.5)
        self.assertEqual(row["nutrition_basis"], "per_serving")
        self.assertNotIn("fat", row["nutrition"])
        self.assertEqual(row["import_metadata"]["customField"], {"kept": True})
        self.assertIn("json-ld", row["provenance"]["parsers"])
        self.assertEqual(row["instruction_groups"][0]["name"], "Finish")
        # The pinned library does not recognize this multi-type graph; our
        # fallback does. A conventional schema must actually use the library.
        node["@type"] = "Recipe"
        node["@context"] = "https://schema.org"
        standard = network.parse_recipe_html(recipe_page(node), "https://www.allrecipes.com/recipe/1/soup/")
        self.assertIn("recipe-scrapers", standard["provenance"]["parsers"])


    def test_no_nutrient_inference_from_scraper_inequalities(self):
        node = {"@context": "https://schema.org", "@type": "Recipe", "name": "Declared",
                "recipeIngredient": ["1 cup rice"], "recipeInstructions": ["Cook"],
                "nutrition": {"calories": "< 50 kcal", "carbohydrateContent": "< 2 g"}}
        row = network.parse_recipe_html(recipe_page(node), "https://example.com/recipe")
        self.assertEqual(row["nutrition"], {})
        self.assertEqual(row["nutrition_raw"], node["nutrition"])

    def test_preserves_real_site_ingredient_groups(self):
        node = {"@context": "https://schema.org", "@type": "Recipe", "name": "Layered",
                "recipeIngredient": ["1 cup rice", "2 tablespoons oil"], "recipeInstructions": ["Cook"]}
        html = recipe_page(node) + '<h3 class="ingredients-list__heading">Base</h3><li class="ingredients-list__item">1 cup rice</li><h3 class="ingredients-list__heading">Sauce</h3><li class="ingredients-list__item">2 tablespoons oil</li>'
        row = network.parse_recipe_html(html, "https://www.bbcgoodfood.com/recipes/layered")
        self.assertEqual([group["name"] for group in row.get("ingredient_groups", [])], ["Base", "Sauce"])
        self.assertEqual(row["ingredient_groups"][1]["ingredients"][0]["unit"], "Tbsp")
        self.assertEqual(row.get("metadata", {}).get("ingredient_groups"), row["ingredient_groups"])

    def test_library_receives_only_offline_guarded_html(self):
        import recipe_scrapers
        node = {"@context": "https://schema.org", "@type": "Recipe", "name": "Offline",
                "recipeIngredient": ["1 cup rice"], "recipeInstructions": ["Cook"]}
        with patch("recipe_scrapers.scrape_html", wraps=recipe_scrapers.scrape_html) as scrape, \
             patch("socket.socket.connect", side_effect=AssertionError("secondary parser network")):
            row = network.parse_recipe_html(recipe_page(node), "https://example.com/recipe")
        self.assertEqual(row["name"], "Offline")
        self.assertEqual(scrape.call_args.kwargs["online"], False)
        self.assertEqual(scrape.call_args.kwargs["supported_only"], False)
        self.assertEqual(scrape.call_args.kwargs.get("best_image"), False)

    def test_extreme_numeric_strings_fail_closed(self):
        node = {"@type": "Recipe", "name": "Extreme", "recipeYield": "9" * 500,
                "prepTime": "PT" + "9" * 500 + "M"}
        with self.assertRaises(ValueError):
            network.parse_recipe_html(recipe_page(node), "https://example.com/recipe")
        self.assertEqual(network.parse_nutrition({"calories": "9" * 500})["nutrition"], {})

    def test_microdata_library_without_jsonld(self):
        html = '<div itemscope itemtype="https://schema.org/Recipe"><h1 itemprop="name">Microdata tea</h1><span itemprop="recipeYield">2 servings</span><span itemprop="recipeIngredient">1 cup water</span><div itemprop="recipeInstructions">Boil water</div></div>'
        row = network.parse_recipe_html(html, "https://example.com/tea")
        self.assertEqual(row["name"], "Microdata tea")
        self.assertEqual(row["ingredients"][0]["unit"], "cup")
        self.assertEqual(row["provenance"]["parsers"], ["recipe-scrapers"])

    def test_rejects_nonfinite_and_deep_metadata(self):
        for data in ['{"@type":"Recipe","name":"Bad","extra":1e999}',
                     '{"@type":"Recipe","name":"Bad","extra":' + '[' * 40 + '0' + ']' * 40 + '}']:
            with self.assertRaises(ValueError):
                network.parse_recipe_html('<script type="application/ld+json">' + data + '</script>', "https://example.com/recipe")


KEEPER = '''<div class="recipe-details"><h2 class="recipe-name">Cake</h2>
<div class="recipe-description">Soft cake<script>throw Error('never execute')</script></div>
<div class="recipe-serving-size">6 slices</div><meta itemprop="prepTime" content="PT10M">
<div class="recipe-cook-time">1 hour 30 mins</div>
<meta itemprop="recipeCourse" content="Dessert"><meta itemprop="recipeCategory" content="Baking">
<meta itemprop="recipeCollection" content="Family"><div class="recipe-cuisine">British</div>
<a class="recipe-source" href="https://example.com/cake">Original</a>
<div class="recipe-ingredients"><p><strong>FOR THE CAKE:</strong></p><p>1½ cups flour, sifted</p><p>200 grammes butter</p></div>
<div itemprop="recipeDirections"><p>Step 1: Mix.</p><p>2. Bake.</p></div>
<div class="recipe-notes">Keep this note. Calories: 200 kcal\nProtein: 3 g</div>
<div class="recipe-nutrition"><p>Calories: 210 kcal</p><p>Protein: 5 g</p><p>Iron: 2 mg</p><p>Per serving</p></div>
<div class="recipe-rating">4</div><img class="recipe-photo" src="images/a.png"><img class="recipe-photo" src="images/b.png"></div>'''


@unittest.skipUnless(optional("bs4"), "optional HTML library unavailable")
class KeeperTests(unittest.TestCase):
    def test_explicit_photo_references_are_not_lost_to_filename_heuristics(self):
        row = network.parse_recipe_keeper('<div class="recipe-details"><h2 class="recipe-name">Photos</h2><img class="recipe-photo" src="iconic-cake.png"><div class="recipe-photo"><img src="logo-shaped-bread.png"></div><img src="site-logo.png"></div>')[0]
        self.assertEqual(row["photos"], ["iconic-cake.png", "logo-shaped-bread.png"])

    def test_repeated_itemprops_and_mixed_photo_wrappers(self):
        html = '<div class="recipe-details"><h2 itemprop="name">Multi</h2><meta itemprop="prepTime" content="bad"><div class="recipe-prep-time">45 minutes</div><span itemprop="recipeIngredient">1 cup rice</span><span itemprop="recipeIngredient">2 cloves garlic</span><img class="recipe-photo" src="a.png"><div class="recipe-photo"><img src="b.png"></div></div>'
        row = network.parse_recipe_keeper(html)[0]
        self.assertEqual(len(row["ingredients"]), 2)
        self.assertEqual(row["photos"], ["a.png", "b.png"])
        self.assertEqual(row["prep_time"], 45)

    def test_saturated_fat_does_not_invent_total_fat_from_notes(self):
        row = network.parse_recipe_keeper('<article><h2 class="recipe-name">Fat</h2><div class="recipe-notes">Saturated fat: 2 g</div></article>')[0]
        self.assertEqual(row["nutrition"], {"saturated_fat": 2})

    def test_hostile_html_bounds_and_no_duplicate_fallback_containers(self):
        for html in ['<div>' * 300 + '<h2 class="recipe-name">Deep</h2>' + '</div>' * 300,
                     KEEPER * (network.MAX_RECIPES + 1),
                     'x' * (network.MAX_HTML_BYTES + 1)]:
            with self.assertRaises(ValueError):
                network.parse_recipe_keeper(html)


    def test_recipe_keeper_classes_itemprops_taxonomy_notes_and_photos(self):
        self.assertTrue(callable(getattr(network, "parse_recipe_keeper", None)))
        with patch("socket.socket.connect", side_effect=AssertionError("HTML network")):
            recipes = network.parse_recipe_keeper(KEEPER)
        self.assertEqual(len(recipes), 1)
        row = recipes[0]
        self.assertEqual(row["name"], "Cake")
        self.assertEqual(row["description"], "Soft cake")
        self.assertEqual(row["source_url"], "https://example.com/cake")
        self.assertEqual((row["servings"], row["prep_time"], row["cook_time"]), (6, 10, 90))
        self.assertEqual(row["instructions"], ["Mix.", "Bake."])
        self.assertTrue(row["ingredients"][0]["is_heading"])
        self.assertEqual(row["ingredients"][1]["amount_fraction"], "3/2")
        self.assertEqual(row["nutrition"], {"calories": 210, "protein": 5})
        self.assertEqual(row["nutrition_basis"], "per_serving")
        self.assertIn("Iron", row["nutrition_raw"])
        self.assertIn("Calories: 200", row["notes"])
        self.assertEqual(row["photos"], ["images/a.png", "images/b.png"])
        self.assertEqual(row["rating"], 4)
        self.assertEqual(row["courses"], ["Dessert"])
        self.assertEqual(row["categories"], ["Baking"])
        self.assertEqual(row["collections"], ["Family"])
        fallback = '<article><h2 class="recipe-name">Tea</h2><div class="recipe-notes">Calories: 0 kcal</div></article>'
        tea = network.parse_recipe_keeper('<section>' + fallback + '</section>')[0]
        self.assertEqual(tea["nutrition"], {"calories": 0})
        self.assertEqual(tea["nutrition_basis"], "unknown")
        self.assertEqual(len(network.parse_recipe_keeper('<section>' + fallback + '</section>')), 1)
        with self.assertRaises(ValueError):
            network.parse_recipe_keeper('<script>document.write("recipe-details")</script>')


def image_bytes(fmt="PNG", size=(8, 6)):
    from PIL import Image
    stream = io.BytesIO()
    Image.new("RGBA", size, (200, 40, 10, 127)).save(stream, format=fmt)
    return stream.getvalue()


@unittest.skipUnless(optional("PIL"), "optional image library unavailable")
class ImageTests(unittest.TestCase):
    def test_hostile_image_formats_animation_pixels_and_byte_limits(self):
        from PIL import Image
        for data in [b'<svg xmlns="http://www.w3.org/2000/svg"><script>bad()</script></svg>',
                     b'not image', image_bytes()[:30]]:
            with self.assertRaises(ValueError):
                network.normalize_image(base64.b64encode(data).decode())
        for value in ["bad%%", "", "data:text/html;base64,PGgxPg==", 123]:
            with self.assertRaises(ValueError):
                network.normalize_image(value)
        animation = io.BytesIO()
        Image.new("RGB", (2, 2), "red").save(animation, format="GIF", save_all=True,
                                            append_images=[Image.new("RGB", (2, 2), "blue")])
        with self.assertRaises(ValueError):
            network.normalize_image(base64.b64encode(animation.getvalue()).decode())
        with patch.object(network, "MAX_IMAGE_PIXELS", 2), self.assertRaises(ValueError):
            network.normalize_image(base64.b64encode(image_bytes()).decode())
        with patch.object(network, "MAX_IMAGE_BYTES", 4), self.assertRaises(ValueError):
            network.normalize_image(base64.b64encode(image_bytes()).decode())
        with patch.object(network, "MAX_WEBP_BYTES", 1), self.assertRaises(ValueError):
            network.normalize_image(base64.b64encode(image_bytes()).decode())

    def test_jpeg_exif_orientation_and_static_formats(self):
        from PIL import Image
        jpeg = io.BytesIO()
        image = Image.new("RGB", (8, 6), "red")
        exif = Image.Exif()
        exif[274] = 6
        exif[315] = "Private author"
        image.save(jpeg, format="JPEG", exif=exif)
        record = network.normalize_image(base64.b64encode(jpeg.getvalue()).decode())
        with Image.open(io.BytesIO(base64.b64decode(record["data"]))) as pixels:
            pixels.load()
            self.assertEqual(pixels.size, (6, 8))
            self.assertEqual(dict(pixels.getexif()), {})
        for fmt in ["BMP", "GIF", "WEBP"]:
            record = network.normalize_image(base64.b64encode(image_bytes(fmt)).decode())
            with Image.open(io.BytesIO(base64.b64decode(record["data"]))) as pixels:
                pixels.load()
                self.assertEqual(pixels.format, "WEBP")

    def test_actual_pixel_decode_reencode_and_metadata_removal(self):
        self.assertTrue(callable(getattr(network, "normalize_image", None)))
        from PIL import Image, PngImagePlugin
        stream = io.BytesIO()
        pnginfo = PngImagePlugin.PngInfo()
        pnginfo.add_text("secret", "strip this")
        Image.new("RGBA", (8, 6), (200, 40, 10, 127)).save(stream, format="PNG", pnginfo=pnginfo)
        encoded = base64.b64encode(stream.getvalue()).decode()
        result = network.normalize_image(encoded)
        self.assertEqual(set(result), {"data", "content_type"})
        self.assertEqual(result["content_type"], "image/webp")
        with Image.open(io.BytesIO(base64.b64decode(result["data"]))) as decoded:
            decoded.load()
            self.assertEqual(decoded.format, "WEBP")
            self.assertEqual(decoded.size, (8, 6))
            self.assertEqual(decoded.getpixel((0, 0)), (200, 40, 10, 127))
            self.assertNotIn("secret", decoded.info)
        self.assertEqual(network.normalize_image("data:image/png;base64," + encoded), result)


def archive_data(members, compression=zipfile.ZIP_DEFLATED):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=compression) as archive:
        for name, payload in members:
            archive.writestr(name, payload)
    return base64.b64encode(stream.getvalue()).decode()


@unittest.skipUnless(optional("bs4") and optional("PIL"), "optional import libraries unavailable")
class ArchiveTests(unittest.TestCase):
    def test_in_memory_archive_media_shape_and_relative_references(self):
        self.assertTrue(callable(getattr(network, "parse_recipe_archive", None)))
        encoded = archive_data([("book/recipebook.html", KEEPER),
                                ("book/images/a.png", image_bytes()), ("book/images/b.png", image_bytes())])
        with patch.object(zipfile.ZipFile, "extract", side_effect=AssertionError("extracted")), \
             patch.object(zipfile.ZipFile, "extractall", side_effect=AssertionError("extracted")):
            result = network.parse_recipe_archive(encoded)
        self.assertEqual(set(result), {"recipes", "media"})
        self.assertEqual(result["recipes"][0]["photos"], ["book/images/a.png", "book/images/b.png"])
        self.assertEqual(set(result["media"]), {"book/images/a.png", "book/images/b.png"})
        self.assertEqual(result["media"]["book/images/a.png"]["content_type"], "image/webp")
        from PIL import Image
        with Image.open(io.BytesIO(base64.b64decode(result["media"]["book/images/a.png"]["data"]))) as pixels:
            pixels.load()
            self.assertEqual(pixels.size, (8, 6))

    def test_archive_caps_crc_ambiguity_and_reference_traversal(self):
        encoded = archive_data([("recipebook.html", KEEPER), ("images/a.png", image_bytes()), ("images/b.png", image_bytes())])
        for constant, value in [("MAX_ARCHIVE_MEMBERS", 1), ("MAX_ARCHIVE_MEMBER_BYTES", 10),
                                ("MAX_ARCHIVE_EXPANSION", 10), ("MAX_ARCHIVE_BYTES", 10),
                                ("MAX_HTML_BYTES", 10), ("MAX_RECIPES", 0)]:
            with patch.object(network, constant, value), self.assertRaises(ValueError):
                network.parse_recipe_archive(encoded)
        for ref in ["../evil.png", "/evil.png", "%2e%2e/evil.png"]:
            with self.assertRaises(ValueError):
                network.parse_recipe_archive(archive_data([("recipebook.html", KEEPER.replace("images/a.png", ref))]))
        with self.assertRaises(ValueError):
            network.parse_recipe_archive(archive_data([("recipebook.html", KEEPER.replace("images/a.png", "a.png")),
                                                      ("one/a.png", image_bytes()), ("two/a.png", image_bytes())]))
        stored = archive_data([("recipebook.html", KEEPER)], zipfile.ZIP_STORED)
        data = bytearray(base64.b64decode(stored))
        position = data.index(b'Cake')
        data[position] = ord('X')
        with self.assertRaises(ValueError):
            network.parse_recipe_archive(base64.b64encode(data).decode())
        nul = base64.b64decode(archive_data([("recipebook.html", KEEPER), ("bad_name.txt", "x")])).replace(b"bad_name.txt", b"bad\x00name.txt")
        with self.assertRaises(ValueError):
            network.parse_recipe_archive(base64.b64encode(nul).decode())

    def test_archive_basename_compatibility_and_unmatched_inert_references(self):
        html = KEEPER.replace("images/a.png", "other/a.png").replace("images/b.png", "https://example.com/remote.png")
        result = network.parse_recipe_archive(archive_data([("recipebook.html", html), ("images/a.png", image_bytes()), ("images/extra.png", image_bytes())]))
        self.assertEqual(result["recipes"][0]["image_url"], "images/a.png")
        self.assertEqual(result["recipes"][0]["photos"][1], "https://example.com/remote.png")
        self.assertIn("images/extra.png", result["media"])

    def test_hostile_archive_members_bombs_and_malformed_data(self):
        self.assertTrue(callable(getattr(network, "parse_recipe_archive", None)))
        for name in ["/absolute.html", "../escape.html", "a/../escape.html", "C:/evil.html", "a\\evil.html"]:
            with self.subTest(name=name), self.assertRaises(ValueError):
                network.parse_recipe_archive(archive_data([("recipebook.html", KEEPER), (name, "bad")]))
        import stat
        symlink = zipfile.ZipInfo("link")
        symlink.create_system = 3
        symlink.external_attr = (stat.S_IFLNK | 0o777) << 16
        for members in [[("recipebook.html", KEEPER), (symlink, "recipebook.html")],
                        [("recipebook.html", KEEPER), ("bomb.txt", "0" * 100000)],
                        [("recipebook.html", KEEPER), ("broken.png", b"not pixels")],
                        [("recipebook.html", KEEPER), ("RecipeBook.html", KEEPER)],
                        [("nohtml.txt", "none")]]:
            with self.subTest(members=[str(m[0]) for m in members]), self.assertRaises(ValueError):
                network.parse_recipe_archive(archive_data(members))
        for bad in ["not-base64!!", base64.b64encode(b"not zip").decode(), ""]:
            with self.assertRaises(ValueError):
                network.parse_recipe_archive(bad)


class DestinationTests(unittest.IsolatedAsyncioTestCase):
    async def test_https_destinations_dns_rebinding_and_connect_guard(self):
        self.assertTrue(callable(getattr(network, "validate_remote_url", None)))
        import socket
        self.assertEqual(network.validate_remote_url("https://example.com/a"), "https://example.com/a")
        for url in ["http://example.com", "file:///etc/passwd", "https://user:secret@example.com",
                    "https://localhost", "https://a.localhost", "https://metadata.google.internal",
                    "https://example.com:444", "https://127.0.0.1", "https://10.0.0.1",
                    "https://169.254.169.254", "https://168.63.129.16", "https://[::1]", "https://[::ffff:127.0.0.1]",
                    "https://[64:ff9b::7f00:1]", "https://2130706433", "https://example.com\\@127.0.0.1",
                    "https://example.com\n", "https://%31%32%37.0.0.1"]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                network.validate_remote_url(url)
        resolver = network.SafeResolver()
        loop = asyncio.get_running_loop()
        public = [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("93.184.216.34", 443))]
        private = [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("127.0.0.1", 443))]
        with patch.object(loop, "getaddrinfo", side_effect=[public, private]):
            self.assertEqual((await resolver.resolve("example.com", 443))[0]["host"], "93.184.216.34")
            with self.assertRaises(ValueError):
                await resolver.resolve("example.com", 443)
        with patch.object(loop, "getaddrinfo", return_value=public + private):
            with self.assertRaises(ValueError):
                await resolver.resolve("example.com", 443)
        with patch("socket.socket", side_effect=AssertionError("socket created before validation")):
            with self.assertRaises(ValueError):
                network._socket_factory(private[0])
        sock = network._socket_factory(public[0])
        sock.close()
        await resolver.close()


@unittest.skipUnless(optional("aiohttp"), "optional HTTP library unavailable")
class FetchTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        if network is not None and hasattr(network, "_RATE_TIMES"):
            network._RATE_TIMES.clear()

    async def test_consent_and_real_connector_rebinding_blocks_without_socket(self):
        self.assertTrue(callable(getattr(network, "fetch_recipe", None)))
        for enabled in [False, 1, "true", None]:
            with self.assertRaisesRegex(ValueError, "consent"):
                await network.fetch_recipe("https://example.com", enabled=enabled)
        import socket
        loop = asyncio.get_running_loop()
        answers = [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("127.0.0.1", 443))]
        with patch.object(loop, "getaddrinfo", return_value=answers) as dns, \
             patch.object(network, "_socket_factory", side_effect=AssertionError("connected to private host")):
            with self.assertRaises(ValueError):
                await network.fetch_recipe("https://example.com/recipe", enabled=True)
        self.assertEqual(dns.call_count, 1)

    async def test_redirect_policy_cookie_free_client_and_source_fetch(self):
        self.assertTrue(callable(getattr(network, "fetch_recipe", None)))
        import aiohttp
        node = {"@context": "https://schema.org", "@type": "Recipe", "name": "Fetched",
                "recipeIngredient": ["1 cup rice"], "recipeInstructions": ["Boil"]}
        responses = [HTTPResponse(302, {"Location": "/final"}), HTTPResponse(200, {"Content-Type": "text/html"}, recipe_page(node).encode())]
        session = HTTPSession(responses)
        with patch("aiohttp.ClientSession", return_value=session) as make_session:
            row = await network.fetch_recipe("https://example.com/start", enabled=True)
        self.assertEqual(row["name"], "Fetched")
        self.assertEqual(row["source_url"], "https://example.com/final")
        kwargs = make_session.call_args.kwargs
        self.assertFalse(kwargs["trust_env"])
        self.assertFalse(kwargs["auto_decompress"])
        self.assertIsInstance(kwargs["cookie_jar"], aiohttp.DummyCookieJar)
        self.assertIsNone(kwargs.get("auth"))
        self.assertNotIn("Authorization", kwargs.get("headers", {}))
        self.assertEqual(len(session.calls), 2)
        self.assertTrue(all(not call[1]["allow_redirects"] for call in session.calls))
        for location in ["http://example.com", "https://127.0.0.1", "https://u:p@example.com", "https://metadata.google.internal"]:
            session = HTTPSession([HTTPResponse(302, {"Location": location})])
            with patch("aiohttp.ClientSession", return_value=session), self.assertRaises(ValueError):
                await network.fetch_recipe("https://example.com/start", enabled=True)
            self.assertEqual(len(session.calls), 1)

    async def test_rate_concurrency_redirect_status_type_and_timeout_limits(self):
        with patch.object(network, "MAX_REQUESTS_PER_MINUTE", 2):
            network._request_rate()
            network._request_rate()
            with self.assertRaisesRegex(ValueError, "rate"):
                network._request_rate()
        network._RATE_TIMES.clear()
        with patch.object(network, "_IN_FLIGHT", network.MAX_CONCURRENT_REQUESTS):
            with self.assertRaisesRegex(ValueError, "concurrency"):
                await network.fetch_recipe("https://example.com", enabled=True)
        for responses in [[HTTPResponse(302, {"Location": "/again"}) for _ in range(4)],
                          [HTTPResponse(302, {})], [HTTPResponse(403, {})],
                          [HTTPResponse(200, {"Content-Type": "application/javascript"}, b"bad()")]]:
            network._RATE_TIMES.clear()
            with patch("aiohttp.ClientSession", return_value=HTTPSession(responses)), self.assertRaises(ValueError):
                await network.fetch_recipe("https://example.com", enabled=True)
        self.assertEqual(network._IN_FLIGHT, 0)
        class Slow(HTTPResponse):
            async def iter_chunked(self, size):
                await asyncio.sleep(1)
                yield b"too late"
        with patch.object(network, "REQUEST_TIMEOUT", 0.01), \
             patch("aiohttp.ClientSession", return_value=HTTPSession([Slow(200, {"Content-Type": "text/html"})])):
            with self.assertRaisesRegex(ValueError, "timed out"):
                await network.fetch_recipe("https://example.com", enabled=True)
        self.assertEqual(network._IN_FLIGHT, 0)

    async def test_connector_second_resolution_and_literal_private_guard(self):
        import aiohttp
        import socket
        loop = asyncio.get_running_loop()
        public = [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("93.184.216.34", 443))]
        private = [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("10.1.2.3", 443))]
        connector = aiohttp.TCPConnector(resolver=network.SafeResolver(), socket_factory=network._socket_factory,
                                        use_dns_cache=False)
        try:
            with patch.object(loop, "getaddrinfo", side_effect=[public, private]) as dns:
                self.assertEqual((await connector._resolve_host("example.com", 443))[0]["host"], "93.184.216.34")
                with self.assertRaises(ValueError):
                    await connector._resolve_host("example.com", 443)
                self.assertEqual(dns.call_count, 2)
            with patch("socket.socket", side_effect=AssertionError("private connection")):
                with self.assertRaises(ValueError):
                    network._socket_factory(private[0])
        finally:
            await connector.close()

    async def test_bounded_streaming_gzip_deflate_and_expansion_bombs(self):
        import gzip
        import zlib
        payload = b"<html>small payload</html>"
        for encoding, encoded in [("gzip", gzip.compress(payload)), ("deflate", zlib.compress(payload))]:
            result = await network._read_response(HTTPResponse(200, {"Content-Encoding": encoding}, encoded), 1024)
            self.assertEqual(result, payload)
        for headers, body in [({"Content-Encoding": "gzip"}, gzip.compress(b"0" * 100000)),
                              ({"Content-Encoding": "deflate"}, zlib.compress(b"0" * 100000)),
                              ({"Content-Encoding": "gzip"}, b"invalid"),
                              ({"Content-Encoding": "gzip"}, gzip.compress(payload)[:-4]),
                              ({"Content-Encoding": "br"}, b"anything"),
                              ({"Content-Length": "9999"}, b"small"),
                              ({}, b"0" * 1025)]:
            with self.subTest(headers=headers), self.assertRaises(ValueError):
                await network._read_response(HTTPResponse(200, headers, body), 1024)

    async def test_download_image_really_normalizes_pixels(self):
        self.assertTrue(callable(getattr(network, "fetch_image", None)))
        if not optional("PIL"):
            self.skipTest("optional image library unavailable")
        session = HTTPSession([HTTPResponse(200, {"Content-Type": "image/png"}, image_bytes())])
        with patch("aiohttp.ClientSession", return_value=session):
            result = await network.fetch_image("https://example.com/photo.png", enabled=True)
        from PIL import Image
        with Image.open(io.BytesIO(base64.b64decode(result["data"]))) as pixels:
            pixels.load()
            self.assertEqual(pixels.format, "WEBP")
            self.assertEqual(pixels.getpixel((0, 0)), (200, 40, 10, 127))


class HTTPResponse:
    def __init__(self, status, headers, body=b""):
        self.status, self.headers, self.body = status, headers, body
        self.content = self
        self.charset = "utf-8"

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def iter_chunked(self, size):
        for offset in range(0, len(self.body), size):
            yield self.body[offset:offset + size]


class HTTPSession:
    def __init__(self, responses):
        self.responses, self.calls = responses, []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    def get(self, url, **kwargs):
        self.calls.append((str(url), kwargs))
        return self.responses.pop(0)


if __name__ == "__main__":
    unittest.main()
