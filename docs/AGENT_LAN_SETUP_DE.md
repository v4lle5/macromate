# Agenten in der App verbinden

Home Assistant und dein Agent können direkt im selben LAN miteinander sprechen.
Du richtest den Zugang in MacroMate ein:

1. Öffne **Einstellungen → Agent** mit deinem Home-Assistant-Administratorkonto.
2. Prüfe die **Home-Assistant-Adresse** und tippe auf **Agent verbinden**.
   Der Name ist optional, die aktuelle Adresse ist bereits eingetragen. Falls du HA von
   unterwegs geöffnet hast, trage die vom Agenten erreichbare LAN-Adresse ein,
   etwa `http://192.168.1.42:8123`.
3. Tippe auf **Verbindung kopieren** und übergib den gesamten Block deinem
   gewünschten Agenten. Er enthält die Adresse, seinen eigenen MacroMate-Zugang
   und die Anweisung für die ersten API-Aufrufe.

Danach kannst du ihn zum Beispiel bitten: „Lege ein Bananen-Haferfrühstück in
MacroMate an.“ Der Agent prüft seine Verbindung, erstellt das Rezept und liest es
zur Kontrolle zurück. Das Rezept erscheint anschließend in deiner App.

Falls dein Browser im lokalen HTTP-Netz das Kopieren blockiert, öffne
**Verbindungsdaten anzeigen** und markiere und kopiere den Block manuell. Der Zugang wird nur bei seiner
Erstellung angezeigt. Bewahre ihn in der geschützten Zugangskonfiguration deines
Agenten auf; teile den Block ausschließlich mit dem gewählten Agenten.

Dieser Zugang erlaubt Rezepte zu lesen, anzulegen und zu ändern. Webseitenimporte
und Bildtransfers sind darüber nicht freigegeben. Dein Agent braucht die
Möglichkeit, HTTP-Anfragen auszuführen; seine eigene Einrichtung erfolgt in seiner
Anwendung.

Unter **Einstellungen → Agent** siehst du die vorhandenen Zugänge und kannst sie
mit **Trennen** jederzeit widerrufen. Dafür bleibt dein HA-Administratorkonto nur in Home Assistant;
der Agent verwendet ausschließlich seinen eingeschränkten MacroMate-Zugang.

[Optionale Einrichtung per Terminal](AGENT_LAN_SETUP_ADVANCED_DE.md) ·
[Technische API-Details](SCOPED_AGENT_ACCESS.md)
