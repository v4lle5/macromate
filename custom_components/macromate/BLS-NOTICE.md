# Bundeslebensmittelschlüssel (BLS) 4.0

Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0 — Deutsche Nährstoffdatenbank. Karlsruhe.

Source: https://doi.org/10.25826/Data20251217-134202-0 and https://www.blsdb.de/

License: Creative Commons Attribution 4.0 International (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/

Copyright and database rights remain with their respective holders. MacroMate's MIT code license does not replace the data license. No endorsement by the Max Rubner-Institut is implied.

Adaptation: all 7,140 foods are included with their original German/English names and BLS codes. MacroMate selects 39 supported nutrient fields, converts source units explicitly, and stores a compressed offline catalogue. Unknown, trace and detection-limit entries are omitted from numeric totals. Source water/alcohol in grams are omitted because MacroMate uses ml for those fields. Vitamin A uses RAE, niacin uses NIA and folate uses food folate (FOLFD), consistent with the existing USDA mapping. All entries remain per 100 g edible portion; original preparation labels are preserved. No portions or densities are invented.

The official workbook contains 138 components and additional provenance/reference columns. The complete original documentation and data remain available through the source above. `tools/update_bls_foods.py` records the pinned release checksums and regenerates the bundled data reproducibly.
