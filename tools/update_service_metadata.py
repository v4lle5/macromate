"""Synchronize native action fields and translations from the command registry."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from custom_components.macromate import SERVICE_ACTIONS  # noqa: E402
from custom_components.macromate.platform_api import ACTIONS  # noqa: E402

COMPONENT = ROOT / "custom_components" / "macromate"


def main():
    services = yaml.safe_load((COMPONENT / "services.yaml").read_text())
    translations = {
        name: json.loads((COMPONENT / name).read_text())
        for name in ("strings.json", "translations/en.json", "translations/de.json")
    }
    for name, action in {**SERVICE_ACTIONS, **{key: key for key in ACTIONS}}.items():
        descriptor = ACTIONS[action]
        schema = descriptor["schema"]
        service = services.setdefault(
            name,
            {
                "name": name.replace("_", " ").capitalize(),
                "description": descriptor["description"],
                "fields": {},
            },
        )
        for field, rule in schema["properties"].items():
            kind = rule.get("type")
            selector = {"object": {}} if kind in ("object", "array") else {"text": {}}
            if kind == "boolean":
                selector = {"boolean": {}}
            elif kind in ("integer", "number"):
                selector = {"number": {"mode": "box"}}
            elif "enum" in rule and all(isinstance(value, str) for value in rule["enum"]):
                selector = {"select": {"options": rule["enum"]}}
            service["fields"].setdefault(
                field,
                {
                    "name": field.replace("_", " ").capitalize(),
                    "description": "See the command schema returned by macromate.describe.",
                    "selector": selector,
                },
            )
            service["fields"][field]["required"] = field in schema.get("required", [])
            for filename, document in translations.items():
                localized = document["services"].setdefault(
                    name,
                    {"name": service["name"], "description": service["description"], "fields": {}},
                )
                localized.setdefault("fields", {}).setdefault(
                    field, {key: service["fields"][field][key] for key in ("name", "description")}
                )
                if field == "profile_id":
                    localized["fields"][field] = {
                        "name": "Ernährungsprofil"
                        if filename.endswith("de.json")
                        else "Nutrition profile",
                        "description": (
                            "Profil-ID aus profiles_list. Ohne ID gilt das bisherige "
                            "Administrator-Tagebuch."
                        )
                        if filename.endswith("de.json")
                        else (
                            "Profile ID from profiles_list. Omit for the existing "
                            "administrator diary."
                        ),
                    }
        # Read actions with no fields still need translated service metadata.
        for document in translations.values():
            document["services"].setdefault(
                name, {"name": service["name"], "description": service["description"], "fields": {}}
            )
    (COMPONENT / "services.yaml").write_text(
        yaml.safe_dump(services, sort_keys=False, allow_unicode=True, width=100)
    )
    for filename, document in translations.items():
        (COMPONENT / filename).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
