# Security Policy

## Sicherheitsmodell

MacroMate öffnet keinen eigenen Netzwerkdienst. Remotezugriff erfolgt ausschließlich über Home Assistants authentifizierte API und deren Berechtigungsmodell.

- Keine Tokens in Issues, Logs oder Chatnachrichten veröffentlichen.
- `HA_TOKEN` ausschließlich über eine Secret- oder Umgebungsverwaltung bereitstellen.
- Gesundheits- und Ernährungsdaten sind private Daten. Für Fehlerberichte synthetische Beispiele verwenden.
- Ein vermutetes Sicherheitsproblem nicht als öffentliches Issue mit Exploitdetails melden. Bis ein privater Meldeweg für das spätere Remote-Repository feststeht, den Betreiber direkt kontaktieren.

Unterstützte Version: jeweils die aktuelle Version auf `main`.
