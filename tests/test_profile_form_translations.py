"""Public profile-form copy contracts, without a Home Assistant dependency."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "macromate"


class ProfileFormTranslationTests(unittest.TestCase):
    def test_setup_and_options_do_not_ask_about_the_food_provider(self):
        for filename in ("strings.json", "translations/en.json", "translations/de.json"):
            content = json.loads((ROOT / filename).read_text())
            for section, step in (("config", "user"), ("options", "init")):
                with self.subTest(filename=filename, section=section):
                    form = json.dumps(content[section]["step"][step])
                    self.assertNotIn("enable_food_database", form)
                    self.assertNotIn("Open Food Facts", form)

    def test_birthday_format_hint_in_setup_and_options_in_both_languages(self):
        for filename, format_hint in (("strings.json", "DD.MM.YYYY"),
                                      ("translations/en.json", "DD.MM.YYYY"),
                                      ("translations/de.json", "TT.MM.JJJJ")):
            content = json.loads((ROOT / filename).read_text())
            for section, step in (("config", "user"), ("options", "init")):
                with self.subTest(filename=filename, section=section):
                    form = content[section]["step"][step]
                    self.assertIn(format_hint, form["data"]["birthday"])
                    hint = form["data_description"]["birthday"]
                    self.assertIn(format_hint, hint)
                    self.assertIn("1990-07-23", hint)
                    self.assertIn("18", hint)
                    self.assertIn("120", hint)

    def test_german_sex_labels_are_short_without_changing_selector_values(self):
        content = json.loads((ROOT / "translations/de.json").read_text())
        for section, step in (("config", "user"), ("options", "init")):
            form = content[section]["step"][step]
            self.assertEqual(form["data"]["formula_sex"], "Geschlecht")
            self.assertEqual(form["data_description"]["formula_sex"],
                             "Wird zur Schätzung des Kalorienbedarfs verwendet.")
        self.assertEqual(content["selector"]["formula_sex"]["options"],
                         {"male": "Männlich", "female": "Weiblich"})

    def test_english_translation_matches_source(self):
        source = json.loads((ROOT / "strings.json").read_text())
        english = json.loads((ROOT / "translations/en.json").read_text())
        for key in ("config", "options", "selector"):
            self.assertEqual(source[key], english[key])
