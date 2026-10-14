# Contributing

## Lokale Prüfung

```bash
python3 -m unittest discover -s tests -v
python3 -m compileall -q custom_components tests tools
```

Neue Funktionen werden testgetrieben umgesetzt: zuerst ein fehlschlagender Test, dann die kleinste Implementierung, danach Refactoring.

## Pull Requests

- Eine fachliche Änderung pro Pull Request.
- Keine Zugangsdaten, Tokens oder echten Gesundheitsdaten in Fixtures, Logs oder Screenshots.
- Änderungen an Berechnungsformeln müssen Annahmen, Einheiten und Rundung dokumentieren.
- Änderungen an Aktionen müssen Rückgabedaten und Fehlerverhalten testen.
- Die Integration darf keine zusätzliche unauthentifizierte Netzwerkschnittstelle öffnen.
