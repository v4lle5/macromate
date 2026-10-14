---
name: marcomate
description: "Use when logging, listing, correcting, or deleting meals in Valentin's MarcoMate. Use the authenticated client safely."
---

# MarcoMate über Home Assistant

Verwende `tools/marcomate_client.py` aus dem installierten MarcoMate-Projekt. Es benötigt `HA_URL` und `HA_TOKEN` aus der Secret-/Umgebungsverwaltung. Gib den Token niemals aus und schreibe ihn nie in Argumente, Prompts oder Dateien.

## Regeln

1. Vor Korrektur oder Löschung immer zuerst `list` aufrufen und die konkrete `entry_id` ermitteln. Nicht anhand eines Namens raten.
2. Beim Anlegen eine stabile, eindeutige `--request-id` verwenden. Nach unklarem Timeout denselben Request mit derselben ID wiederholen; keine neue ID erzeugen.
3. Nährwerte als Zahlen übergeben. Schätzwerte gegenüber dem Benutzer als Schätzung benennen.
4. Einen ganzen Tag nur auf ausdrücklichen Wunsch mit `clear-day` löschen.
5. Nach jeder Änderung erneut `list` aufrufen und den Zielzustand prüfen.
6. Grundumsatz und Kalorienempfehlung sind Schätz-/Garminwerte, keine medizinische Diagnose.

## Befehle

```bash
python3 tools/marcomate_client.py list [--date YYYY-MM-DD]
python3 tools/marcomate_client.py add --name NAME --meal-type breakfast|lunch|dinner|snack --calories KCAL [--protein G --carbs G --fat G] --request-id ID
python3 tools/marcomate_client.py update ENTRY_ID [--name NAME --calories KCAL --protein G --carbs G --fat G]
python3 tools/marcomate_client.py delete ENTRY_ID
python3 tools/marcomate_client.py clear-day --date YYYY-MM-DD
```

Erfolg nur behaupten, wenn der Client Exitcode 0 liefert und der anschließende `list`-Readback die Änderung bestätigt.
