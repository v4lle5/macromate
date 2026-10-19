"""Offline BLS 4.0 reference foods, shared independently of private profiles.

Load/decompress once in an executor. Search names before constructing domain
products so a query does not deserialize thousands of nutrient profiles.
"""

from __future__ import annotations

import gzip
import json
import re
import unicodedata
from functools import cache
from pathlib import Path
from types import MappingProxyType

ATTRIBUTION = MappingProxyType(
    {
        "name": "Bundeslebensmittelschlüssel (BLS) 4.0 — Max Rubner-Institut",
        "url": "https://doi.org/10.25826/Data20251217-134202-0",
        "text": (
            "Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS) 4.0 — "
            "CC BY 4.0. Für MacroMate aufbereitet; Nährstoffauswahl und Einheitenumrechnung."
        ),
        "license": "CC-BY-4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
    }
)


def normalize(value: str) -> str:
    """Make umlauts, their keyboard spellings and case equivalent for discovery."""
    value = value.casefold().replace("ae", "ä").replace("oe", "ö").replace("ue", "ü")
    value = "".join(c for c in unicodedata.normalize("NFKD", value) if not unicodedata.combining(c))
    return " ".join(re.findall(r"[a-z0-9]+", value.replace("broccoli", "brokkoli")))


def matches(query: str, text: str, *, exact: bool = False) -> bool:
    """Match all words; accept common plurals without substring matches for 'Ei'."""
    tokens = text.split()
    for word in query.split():
        alternatives = [word]
        for suffix in ("en", "n", "s"):
            if word.endswith(suffix) and len(word) - len(suffix) >= 4:
                alternatives.append(word[: -len(suffix)])
        if not any(
            candidate in tokens if exact or len(candidate) < 3 else candidate in text
            for candidate in alternatives
        ):
            return False
    return True


@cache
def catalogue():
    """Return generated rows and a compact search index; caller uses an executor."""
    with gzip.open(
        Path(__file__).with_name("bls_food_data.json.gz"), "rt", encoding="utf-8"
    ) as handle:
        data = json.load(handle)
    rows = {}
    index = {}
    for code, name, english, nutrients in data["foods"]:
        food_id = f"bls4:{code}"
        rows[food_id] = {
            "food_id": food_id,
            "name": name,
            "base_unit": "g",
            "nutrients_per_100": nutrients,
            "source": "bls",
            "source_url": ATTRIBUTION["url"],
            "license": ATTRIBUTION["license"],
        }
        # Common names supplement the original DE/EN labels without changing them.
        aliases = ""
        for term, synonyms in (
            ("mohre", "karotte karotten"),
            ("karotte", "mohre mohren"),
            ("huhnerei", "ei eier eggs"),
            ("kartoffel", "erdapfel"),
        ):
            if term in normalize(name):
                aliases += " " + synonyms
        index[food_id] = (
            normalize(name + " " + english + aliases) + " " + normalize(name).replace(" ", "")
        )
    return MappingProxyType(rows), MappingProxyType(index)


def search(query: str) -> list[str]:
    """Rank simpler DE names ahead of specific preparations and EN-only matches."""
    rows, index = catalogue()
    query = normalize(query)
    found = [food_id for food_id, text in index.items() if matches(query, text)]
    return sorted(
        found,
        key=lambda food_id: (
            not matches(query, index[food_id], exact=True),
            len(query.split()) > 1 and f" {query} " not in f" {index[food_id]} ",
            "roh" not in normalize(rows[food_id]["name"]).split(),
            len(rows[food_id]["name"]),
            not matches(query, normalize(rows[food_id]["name"])),
            rows[food_id]["name"],
            food_id,
        ),
    )
