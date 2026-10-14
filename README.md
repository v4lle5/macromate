# MarcoMate für Home Assistant

<p align="center">
  <img src="brand/marcomate-logo.jpg" alt="MarcoMate – Track Eat Progress" width="420">
</p>

Ein lokaler Mahlzeiten- und Makro-Tracker mit Garmin-Connect-Daten und einer sauberen Schnittstelle für Hermes Agent.

## Was er macht

- Mahlzeiten mit Kalorien, Protein, Kohlenhydraten und Fett erfassen
- Einträge auflisten, korrigieren und löschen
- Garmin-Gewicht und Garmin-Aktivkalorien aus vorhandenen Home-Assistant-Sensoren übernehmen
- Garmin-Grundumsatz verwenden, sofern der Sensor verfügbar ist
- andernfalls den Grundumsatz transparent aus `Gewicht × kcal/kg` schätzen
- Tagesempfehlung berechnen: `Grundumsatz + Aktivkalorien + Defizit/Plus`
- Protein und Fett gewichtsbasiert empfehlen; Kohlenhydrate füllen die restlichen Kalorien
- Daten lokal in Home Assistants `.storage` speichern

Die gewichtsbasierte Berechnung ist eine konfigurierbare Alltagsschätzung, keine medizinische Ernährungsberatung. Wenn Garmin einen eigenen BMR-Wert liefert, wird dieser bevorzugt.

## Installation über HACS

[![In HACS öffnen](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=v4lle5&repository=marcomate&category=integration)

**Aktuell blockiert:** Dieses Repository ist privat. HACS unterstützt keine privaten GitHub-Repositories. Der Button ist für die spätere öffentliche Bereitstellung vorbereitet; er macht das Repository nicht öffentlich und installiert nichts automatisch.

Sobald das Repository öffentlich und der Entwicklungsstand installierbar ist:

1. HACS muss in deiner Home-Assistant-Instanz installiert sein.
2. Den Button anklicken und deine Home-Assistant-Instanz auswählen.
3. MarcoMate in HACS hinzufügen und herunterladen.
4. Home Assistant neu starten.
5. Unter **Einstellungen → Geräte & Dienste → Integration hinzufügen → MarcoMate** einrichten.

Falls das Hinzufügen über den Button nicht angeboten wird: **HACS → ⋮ → Benutzerdefinierte Repositories**, URL `https://github.com/v4lle5/marcomate`, Typ **Integration** hinzufügen.

**Entwicklungsstand:** Noch kein freigegebenes Release; bekannte Test- und Sicherheitsprobleme sind offen.

## Manuelle Einrichtung

1. `custom_components/marcomate` nach `/config/custom_components/marcomate` kopieren.
2. Home Assistant neu starten.
3. **Einstellungen → Geräte & Dienste → Integration hinzufügen → MarcoMate**.
4. Aus deiner vorhandenen Garmin-Connect-Integration auswählen:
   - Gewicht
   - Aktivkalorien
   - optional: BMR/Grundumsatz
5. Faktoren festlegen. Standardwerte:
   - Grundumsatz-Ersatzwert: `22 kcal/kg`
   - Protein: `1,6 g/kg`
   - Fett: `0,8 g/kg`
   - Kalorienkorrektur: `0 kcal` — ein Defizit ist negativ, ein Plus positiv

Die offiziellen Garmin-Connect-Entity-IDs liegen üblicherweise bei `sensor.garmin_connect_weight`, `sensor.garmin_connect_active_calories` und `sensor.garmin_connect_bmr_calories`. Der Einrichtungsdialog nutzt Entity-Auswahlfelder, deshalb hängt nichts blind an diesen Namen.

## Home-Assistant-Aktionen

- `marcomate.log_meal`
- `marcomate.list_meals`
- `marcomate.update_meal`
- `marcomate.delete_meal`
- `marcomate.clear_day`

### Eintragen

```yaml
action: marcomate.log_meal
data:
  name: Haferflocken mit Banane
  meal_type: breakfast
  calories: 540
  protein: 24
  carbs: 78
  fat: 14
  request_id: "hermes-20261013-breakfast-1"
response_variable: meal
```

`request_id` ist optional. Ein Agent sollte pro logischem Eintrag eine stabile ID verwenden. Wird derselbe Auftrag nach einem Timeout wiederholt, entsteht dadurch kein zweiter Eintrag.

### Auflisten

```yaml
action: marcomate.list_meals
response_variable: meals
```

Die Antwort enthält Einträge mit `entry_id`, Tagessummen und die aktuelle Garmin-basierte Empfehlung.

### Korrigieren

```yaml
action: marcomate.update_meal
data:
  entry_id: "ID_AUS_LIST_MEALS"
  calories: 510
  protein: 26
response_variable: corrected
```

### Löschen

```yaml
action: marcomate.delete_meal
data:
  entry_id: "ID_AUS_LIST_MEALS"
response_variable: deleted
```

## Hermes Agent im selben Netz

Kein zusätzlicher offener Port. Kein eigener Mini-Webserver. Hermes verwendet Home Assistants bereits authentifizierte REST-API.

Das mitgelieferte Werkzeug `tools/marcomate_client.py` kann ein Agent direkt ausführen:

```bash
export HA_URL="http://homeassistant.local:8123"
export HA_TOKEN="<Home-Assistant-Long-Lived-Access-Token>"

python3 tools/marcomate_client.py list
python3 tools/marcomate_client.py add \
  --name "Müsli" --meal-type breakfast --calories 430 \
  --protein 20 --carbs 61 --fat 12 \
  --request-id "hermes-20261013-breakfast"
python3 tools/marcomate_client.py update ENTRY_ID --calories 410
python3 tools/marcomate_client.py delete ENTRY_ID
```

Den Token niemals in Prompts, Skills, Logs oder Chatnachrichten schreiben. Er gehört in die Secret-/Umgebungsverwaltung des Agenten. Das Werkzeug liest ausschließlich `HA_URL` und `HA_TOKEN` und gibt den Token nie aus.

Für Agenten liegt unter `agent-skill/SKILL.md` eine knappe Arbeitsanweisung bei.

## Sensoren

Die wichtigsten erzeugten Entitäten heißen voraussichtlich:

- `sensor.kalorien_gegessen`
- `sensor.grundumsatz_empfehlung`
- `sensor.garmin_aktivkalorien`
- `sensor.kalorienempfehlung_heute`
- `sensor.kalorienbilanz`
- `sensor.proteinempfehlung`, `sensor.kohlenhydratempfehlung`, `sensor.fettempfehlung`
- die entsprechenden Gegessen-/Bilanz-Sensoren

Home Assistant kann Entity-IDs bei Namenskollisionen abwandeln. Im Zweifel gilt die Entitätsübersicht, nicht Wunschdenken.

## Datenschutz

Mahlzeiten bleiben lokal in Home Assistant. Diese Integration ruft Garmin nicht selbst auf; sie liest lediglich die Zustände deiner vorhandenen Garmin-Connect-Entitäten. Die Garmin-Integration selbst ist Cloud-Polling.

Beim Entfernen der Integration wird ihr lokaler Mahlzeitenspeicher gelöscht.

## Tests

```bash
python3 -m unittest discover -s tests -v
python3 -m compileall -q custom_components tests tools
```

## Noch nicht enthalten

- Barcode- oder Lebensmitteldatenbank
- Fotoerkennung
- Rezepte und Portionsumrechnung
- eigene grafische Eingabekarte

Erst belastbare Datenwege. Dann Glitzer.
