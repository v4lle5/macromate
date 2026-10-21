# Erweiterte LAN-Einrichtung per Terminal

Diese optionale Anleitung richtet den Zugang per Terminal ein. Der einfachere
Weg führt über [Einstellungen → Agent in der App](AGENT_LAN_SETUP_DE.md).

Der Agent spricht direkt mit Home Assistant im selben LAN. Er braucht keine
Cloud, keinen zusätzlichen MCP-Server und keine Portfreigabe am Router.
MacroMate muss in Home Assistant installiert und genau einmal geladen sein.
Die Oberfläche erstellt keine neuen Rezepte mehr; bestehende Rezepte bleiben
in der App bearbeitbar.

## 1. Adresse und Zugang vorbereiten

Beispieladresse: `http://192.168.1.42:8123`. Ersetze die IP durch die LAN-Adresse
deines Home Assistant. Bei vorhandenem HTTPS verwende dessen gültige Adresse
und lasse `--trusted-lan-http` weg. HTTP ist nur für das bewusst vertraute LAN
gedacht. Die Adresse enthält keinen Dashboard-Pfad wie `/lovelace`.

Der Betreiber benötigt einmalig einen Home-Assistant-Administratorzugang,
gespeichert als Token in einer lokalen Datei mit Rechten `0600`. Der Agent
bekommt anschließend **nur den eigenen MacroMate-Token**, keinen HA-Admin-Token.
`/secure/...` sind Beispielpfade; wähle lokale geschützte Pfade. Die Token-Datei
muss dem jeweiligen aufrufenden Betriebssystembenutzer gehören.

Aus dem MacroMate-Repository führt der Betreiber einmal aus:

```sh
python3 tools/macromate_scoped_client.py \
  --origin http://192.168.1.42:8123 --trusted-lan-http \
  --secret-file /secure/operator-ha.secret mint \
  --label 'Lokaler Rezept-Agent' \
  --scope recipes.read --scope recipes.create --scope recipes.update \
  --output-file /secure/macromate-agent.secret
```

Die neue Datei wird mit `0600` angelegt; die Ausgabe enthält nur Metadaten.
Übergib dem Agenten die Adresse, einen Repository-Checkout und ausschließlich
diese neue Token-Datei. Alternativ müssen `tools/macromate_scoped_client.py` und
`tools/macromate_client.py` gemeinsam im selben Verzeichnis liegen; der zweite
Client liefert nur Hilfsfunktionen und wird nicht direkt aufgerufen. Der Agent
erhält weiterhin keinen HA-Admin-Token. Rezepte lesen, erstellen und ändern ist
damit erlaubt. Löschen,
Tagebuch und Wochenplan sind in diesem Beispiel nicht freigegeben.

## 2. Verbindung und erlaubte Aktionen prüfen

Speichere `{}` als `empty-object.json`. Der Agent ruft auf:

```sh
python3 tools/macromate_scoped_client.py \
  --origin http://192.168.1.42:8123 --trusted-lan-http \
  --secret-file /secure/macromate-agent.secret call describe \
  --json-file empty-object.json
```

Die Antwort nennt nur erlaubte Aktionen, benötigte Scopes und gültige
Eingabefelder. Die Route lautet
`POST /api/macromate/agent/action/describe`; der Client setzt den Bearer-Header.

## 3. Ein Rezept erstellen und exakt zurücklesen

Speichere Folgendes als `recipe-create.json`:

```json
{
  "name": "Bananen-Haferfrühstück",
  "servings": 1,
  "ingredients": [
    {"name": "Haferflocken", "amount": "60", "unit": "g"},
    {"name": "Banane, geschält", "amount": "120", "unit": "g"}
  ],
  "instructions": ["Banane zerdrücken und mit den Haferflocken mischen."],
  "request_id": "rezept-bananen-hafer-001"
}
```

```sh
python3 tools/macromate_scoped_client.py \
  --origin http://192.168.1.42:8123 --trusted-lan-http \
  --secret-file /secure/macromate-agent.secret call recipes_add \
  --json-file recipe-create.json
```

Die Antwort enthält `recipe.id`. Speichere genau diese ID, ohne sie aus dem Namen
abzuleiten, in `recipe-get.json`: `{"recipe_id":"ID-AUS-DER-ANTWORT"}`. Dann:

```sh
python3 tools/macromate_scoped_client.py \
  --origin http://192.168.1.42:8123 --trusted-lan-http \
  --secret-file /secure/macromate-agent.secret call recipes_get \
  --json-file recipe-get.json
```

Nährwerte werden nicht erfunden: Ohne deklarierte Werte bleiben sie unbekannt.
Zum Ändern dient `recipes_update` mit derselben `recipe_id`, den geänderten
Feldern und einer neuen stabilen `request_id` für diese Änderung.

Optionaler direkter HTTP-Aufruf mit curl, wenn der Betreiber eine ebenfalls
geschützte Header-Datei (`0600`) mit der Zeile
`Authorization: Bearer <MacroMate-Token>` lokal eingerichtet hat:

```sh
curl --noproxy '*' --max-time 20 --fail-with-body \
  --header @/secure/macromate-agent.header \
  --header 'Content-Type: application/json' --data-binary @recipe-create.json \
  http://192.168.1.42:8123/api/macromate/agent/action/recipes_add
```

Der Token steht damit nicht im Befehlsargument. Der mitgelieferte Python-Client
prüft zusätzlich Dateirechte und Antwortgrenzen und meldet Fehler ohne
Antwortinhalt. Bei diesem Terminalweg erhält der Agent den geschützten
Dateipfad; der Token muss dafür nicht in einen Einrichtungsdialog kopiert werden.

## Grenzen und Fehler

- Strukturierte Rezepte anlegen, lesen und ändern funktioniert mit diesen drei
  Scopes. URL-Scraping, Recipe-Keeper-Import sowie Bild-Upload/-Download sind
  mit dem eingeschränkten Token nicht verfügbar. Der Agent kann bereits
  vorhandene Rezeptdaten als strukturierte Felder übermitteln; ein `source_url`
  oder `image_url` löst dabei keinen serverseitigen Download aus.
- `401`: Token ungültig/abgelaufen/widerrufen oder ausstellender HA-Administrator
  nicht mehr aktiv. `403`: Aktion oder benötigter Scope nicht freigegeben.
- `404`: Adresse/Route oder installierte Version prüfen. `400`: Eingabefelder
  gegen `describe` prüfen; jede Änderung benötigt eine `request_id`.
- `429`: Ratenlimit; frühestens nach 60 Sekunden erneut prüfen. `503` oder
  Verbindungsabbruch: Zustand zurücklesen. Bei unklarem Schreibausgang dieselbe
  `request_id` und identischen Inhalt behalten; nicht mit neuer ID duplizieren.

Weitere Scopes, Widerruf und Profilgrenzen stehen in
[SCOPED_AGENT_ACCESS.md](SCOPED_AGENT_ACCESS.md); die dauerhaften
[Agenten-Instruktionen](SCOPED_AGENT_INSTRUCTIONS.md) beschreiben den Arbeitsablauf.
Diese Anleitung allein installiert nichts und aktiviert keinen echten Zugang.
