"""Generate all BLS 4.0 foods from the pinned official archive (stdlib only).

Download https://blsdb.de/assets/uploads/BLS_4_0_2025_DE.zip, then run:
python tools/update_bls_foods.py /path/to/BLS_4_0_2025_DE.zip
No source workbook, spreadsheet library, API key or download is needed at runtime.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import math
import re
import xml.etree.ElementTree as ET
from decimal import Decimal
from pathlib import Path
from zipfile import ZipFile

ARCHIVE_URL = "https://blsdb.de/assets/uploads/BLS_4_0_2025_DE.zip"
ARCHIVE_SHA256 = "12b7a6ba62807ec9b301eb276f897dc85f99b2292311618dec3749a12d984c91"
WORKBOOK_SHA256 = "524bbefe25b691f5cb3de7a9f3e27fa2967aebfeabf217d99414ba7806e78c60"
WORKBOOK = "BLS_4_0_2025_DE/BLS_4_0_Daten_2025_DE.xlsx"
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# Domain field: (original component code, original unit, conversion factor).
# WATER/ALC are intentionally omitted: source g cannot be treated as domain ml.
# RAE / niacin / food folate follow the existing USDA mapping, not RE / NE / DFE.
NUTRIENTS = {
    "calories": ("ENERCC", "kcal", 1),
    "protein": ("PROT625", "g", 1),
    "fat": ("FAT", "g", 1),
    "carbs": ("CHO", "g", 1),
    "fiber": ("FIBT", "g", 1),
    "sugar": ("SUGAR", "g", 1),
    "saturated_fat": ("FASAT", "g", 1),
    "monounsaturated_fat": ("FAMS", "g", 1),
    "polyunsaturated_fat": ("FAPU", "g", 1),
    "cholesterol": ("CHORL", "mg", 1),
    "salt": ("NACL", "g", 1),
    "sodium": ("NA", "mg", 1),
    "vitamin_a": ("VITAA", "µg", 1),
    "vitamin_b1": ("THIA", "mg", 1),
    "vitamin_b2": ("RIBF", "mg", 1),
    "vitamin_b3": ("NIA", "mg", 1),
    "vitamin_b5": ("PANTAC", "mg", 1),
    "vitamin_b6": ("VITB6", "µg", 0.001),
    "vitamin_b7": ("BIOT", "µg", 1),
    "vitamin_b11": ("FOLFD", "µg", 1),
    "vitamin_b12": ("VITB12", "µg", 1),
    "vitamin_c": ("VITC", "mg", 1),
    "vitamin_d": ("VITD", "µg", 1),
    "vitamin_e": ("VITE", "mg", 1),
    "vitamin_k": ("VITK", "µg", 1),
    "calcium": ("CA", "mg", 1),
    "copper": ("CU", "µg", 0.001),
    "fluoride": ("FD", "µg", 0.001),
    "iron": ("FE", "mg", 1),
    "magnesium": ("MG", "mg", 1),
    "manganese": ("MN", "µg", 0.001),
    "phosphorus": ("P", "mg", 1),
    "potassium": ("K", "mg", 1),
    "zinc": ("ZN", "mg", 1),
    "chloride": ("CLD", "mg", 1),
    "chromium": ("CR", "µg", 0.001),
    "molybdenum": ("MO", "µg", 1),
    "iodine": ("ID", "µg", 1),
    "sulfur": ("S", "mg", 1),
}


def workbook_rows(content):
    """Stream ordinary XLSX values using source cell positions, not Excel formulas."""
    with ZipFile(io.BytesIO(content)) as book:
        strings = []
        if "xl/sharedStrings.xml" in book.namelist():
            root = ET.fromstring(book.read("xl/sharedStrings.xml"))
            strings = ["".join(item.itertext()) for item in root]
        with book.open("xl/worksheets/sheet1.xml") as sheet:
            for _, element in ET.iterparse(sheet, events=("end",)):
                if element.tag != NS + "row":
                    continue
                values = [None] * 418
                for cell in element:
                    letters = re.match(r"[A-Z]+", cell.attrib["r"])[0]
                    index = 0
                    for letter in letters:
                        index = index * 26 + ord(letter) - 64
                    value = cell.find(NS + "v")
                    if cell.attrib.get("t") == "inlineStr":
                        value = "".join(cell.find(NS + "is").itertext())
                    elif value is not None and value.text is not None:
                        value = value.text
                        if cell.attrib.get("t") == "s":
                            value = strings[int(value)]
                        elif cell.attrib.get("t") not in ("str", "e"):
                            value = float(value)
                    else:
                        value = None
                    values[index - 1] = value
                yield values
                element.clear()


def nutrient_columns(header):
    """Reject an unexpected release, component code or original unit."""
    if header[:3] != ["BLS Code", "Lebensmittelbezeichnung", "Food name"]:
        raise ValueError("unexpected BLS workbook headers")
    columns = {}
    for name, (code, unit, factor) in NUTRIENTS.items():
        found = [i for i, label in enumerate(header) if str(label).startswith(code + " ")]
        found = [i for i in found if str(header[i]).endswith(f"[{unit}/100g]")]
        if len(found) != 1:
            raise ValueError(f"unexpected or missing BLS component/unit: {code}")
        columns[name] = (found[0], factor)
    return columns


def nutrients(row, columns):
    """Unknowns and detection-limit strings are absent; declared numeric zero stays."""
    result = {}
    for name, (column, factor) in columns.items():
        value = row[column]
        if value is None or value in ("-", "<LOD", "<LOQ", "<LOD or <LOQ", "TR"):
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"unexpected BLS nutrient representation: {value!r}")
        if not math.isfinite(value) or value < 0:
            raise ValueError("invalid BLS nutrient")
        result[name] = float(Decimal(str(value)) * Decimal(str(factor)))
    return result


def generate(archive_path):
    archive_data = archive_path.read_bytes()
    if hashlib.sha256(archive_data).hexdigest() != ARCHIVE_SHA256:
        raise ValueError("archive differs from the pinned official BLS 4.0 release")
    with ZipFile(io.BytesIO(archive_data)) as archive:
        content = archive.read(WORKBOOK)
    if hashlib.sha256(content).hexdigest() != WORKBOOK_SHA256:
        raise ValueError("BLS workbook differs from the pinned release")
    rows = workbook_rows(content)
    columns = nutrient_columns(next(rows))
    foods = []
    for row in rows:
        code, name, english = row[:3]
        if not isinstance(code, str) or re.fullmatch(r"[A-Z][A-Z0-9]{6}", code) is None:
            raise ValueError("invalid BLS food code")
        if not all(isinstance(text, str) and text.strip() for text in (name, english)):
            raise ValueError("missing BLS food name")
        foods.append([code, name, english, nutrients(row, columns)])
    if len(foods) != 7140 or len({row[0] for row in foods}) != 7140:
        raise ValueError("unexpected BLS food count or duplicate codes")
    data = {
        "version": "BLS 4.0 (2025)",
        "archive_url": ARCHIVE_URL,
        "archive_sha256": ARCHIVE_SHA256,
        "workbook_sha256": WORKBOOK_SHA256,
        "citation": "Max Rubner-Institut (2025), doi:10.25826/Data20251217-134202-0",
        "license": "CC-BY-4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "adaptation": "All foods; supported nutrient selection and explicit unit conversions.",
        "components": NUTRIENTS,
        "foods": sorted(foods),
    }
    output = io.BytesIO()
    with gzip.GzipFile(fileobj=output, mode="wb", filename="", mtime=0, compresslevel=9) as zipped:
        zipped.write((json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n").encode())
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    try:
        data = generate(args.archive)
    except ValueError as error:
        parser.error(str(error))
    target = (
        Path(__file__).resolve().parents[1] / "custom_components/macromate/bls_food_data.json.gz"
    )
    target.write_bytes(data)
    print(f"Wrote all 7140 BLS foods ({len(data)} bytes) to {target}")


if __name__ == "__main__":
    main()
