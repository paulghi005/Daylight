# Daylight

Persönlicher Tagesplaner für Handy, iPad und Computer. Die Startseite zeigt die Direkteingabe und offene Aufgaben. Zusätzliche Funktionen bleiben in Details oder eigenen Ansichten.

## Aufgaben und Planung

- Schnell eine Aufgabe für den gewählten Tag eingeben.
- Arbeitstag und Deadline getrennt festlegen.
- Die Option „(Keine Angabe)“ lässt die Dauer offen. Es wird keine Endzeit erfunden.
- Unteraufgaben hinzufügen und einzeln abhaken. Der Fortschritt lässt sich unter der Aufgabe aufklappen.
- Über das Kalendersymbol direkt auf heute, morgen oder ein anderes Datum verschieben. Deadline und Startzeit bleiben erhalten.
- Aufgaben mit Notizen, Bereich, Priorität und optionaler Erinnerung ergänzen.
- Liste, Kalender, Board, Fokus-Timer, Suche und JSON-Sicherung sind weiterhin vorhanden.

## Wiederholungen

Unter „Wiederholung → Jede Woche“ einen oder mehrere Wochentage auswählen. Möglich sind ein Enddatum, eine Anzahl Wochen oder eine Serie ohne Ende. Montag und Dienstag über zehn Wochen ergeben zwanzig getrennte Termine.

Jeder Termin kann einzeln bearbeitet, abgehakt, verschoben oder ausgelassen werden. Unter „Wiederholungen → Bearbeiten“ lassen sich Wochentage, Titel, Uhrzeit und weitere Angaben für heutige und künftige offene Termine gemeinsam ändern. Bereits erledigte und individuell angepasste Termine bleiben erhalten. Vorhandene vergangene Termine werden nicht überschrieben. Änderungen lassen sich unmittelbar rückgängig machen.

Endlose Serien ergänzen auf dem Gerät die kommenden 90 Tage und zusätzlich aufgerufene Kalendertage. Der Erinnerungsserver kann auch dann Termine einer aktiven Serie berechnen, wenn die App länger nicht geöffnet wurde.

## Vorlagen

In einer Aufgabe „Als Vorlage speichern“ wählen. Titel, Notizen, Dauer, Bereich, Unteraufgaben und die relative Deadline werden gespeichert. Eine Vorlage unter „Vorlagen → Verwenden“ oder im neuen Aufgabendialog übernehmen. Die Unteraufgaben starten dabei wieder offen.

## Geräteabgleich

Der Geräteabgleich ist bewusst zunächst ausgeschaltet. In den Einstellungen auf jedem gewünschten Gerät aktivieren. Die lokale Kopie bleibt offline verfügbar. Aufgaben, Serien, Bereiche, Vorlagen und abgeschlossene Fokuseinheiten werden abgeglichen. Der laufende Timer bleibt gerätebezogen.

- **Gehostete private Vorschau:** Der vorhandene ChatGPT-Zugang trennt die Daten nach Benutzer. Auf allen Geräten denselben Zugang verwenden. Der Server-Speicher wird mit dem Worker bereitgestellt.
- **Netlify:** In Einstellungen unter „Gerätecode für Netlify“ auf dem ersten Gerät einen Code erzeugen und kopieren. Auf dem zweiten Gerät denselben Code übernehmen. Danach auf beiden Geräten den Abgleich aktivieren. Der Code ist der Zugang zu diesem Datenbestand und sollte wie ein Passwort behandelt werden.

Der Abgleich verwendet Änderungsmarken, Löschmarken und bedingte Schreibvorgänge. Gleichzeitige Änderungen an unterschiedlichen Aufgaben werden zusammengeführt. Bei konkurrierenden Änderungen an derselben Aufgabe gewinnt die neuere Version; es handelt sich nicht um einen gemeinsamen Live-Texteditor. Einträge vor großen Änderungen weiterhin exportieren.

## Push-Erinnerungen

In der Aufgabe einen Vorlauf und den Bezug auf Arbeitstag oder Deadline wählen. Ohne Startzeit wird die eingestellte Ersatz-Uhrzeit verwendet, standardmäßig 09:00. Zeitzone und Sommerzeit werden berücksichtigt.

Für Push müssen alle folgenden Schritte abgeschlossen sein:

1. Das vollständige Netlify-Projekt veröffentlichen, einschließlich Serverfunktionen.
2. Geräteabgleich aktivieren, damit die Termine dem Server vorliegen.
3. Auf jedem gewünschten Gerät „Benachrichtigungen aktivieren“ wählen und die Browserfreigabe erteilen.
4. Auf dem iPhone die App vom Home-Bildschirm öffnen.
5. Eine Testnachricht senden.

Die geplante Netlify-Funktion prüft im veröffentlichten Produktionsstand jede Minute auf fällige Erinnerungen. Vorschau-Veröffentlichungen und der lokale Entwicklungsserver führen diesen Zeitplan nicht automatisch aus. Der Server verschlüsselt Web-Push-Nachrichten gemäß RFC 8291 und signiert sie mit VAPID gemäß RFC 8292. Schlüssel werden ausschließlich im privaten Server-Speicher erzeugt und aufbewahrt. Einzelne Zustellungen werden pro Gerät protokolliert, damit Folgeläufe sie nicht erneut anstoßen. Die tatsächliche Anzeige hängt zusätzlich vom Push-Dienst, Netz und den Geräteeinstellungen ab.

**Die private Sites-Vorschau enthält den Geräteabgleich und die Push-Schnittstellen, aber keinen automatisch eingerichteten Minutentakt. Sie zeigt daher den Erinnerungsversand als noch nicht aktiviert an. Der vollständige Zeitplan ist im Netlify-Projekt enthalten.** Es wird keine Erinnerung bei geschlossener App versprochen, solange dieser Serverbetrieb nicht aktiv ist.

## Vollständig auf Netlify veröffentlichen

Diese Version benötigt das gesamte Projekt. Nur den Ordner `dist` per Drag-and-drop hochzuladen veröffentlicht die Oberfläche, nicht die Funktionen für Geräteabgleich und Push.

- ZIP entpacken und das gesamte Projekt über ein Git-Repository oder die Netlify CLI veröffentlichen.
- Build-Befehl: `npm run build`.
- Veröffentlichungsordner: `dist`.
- Funktionsordner: `netlify/functions`.
- `netlify.toml`, `package.json`, `package-lock.json`, `server/` und `netlify/functions/` müssen Bestandteil des Projekts sein.
- Nach der Produktionsveröffentlichung sollte die Funktion `reminders` als geplante Funktion mit minütlichem Zeitplan erscheinen.
- Netlify Blobs wird im Funktionskontext automatisch verwendet. Es ist kein zusätzliches Datenbankkonto erforderlich.

## Quellcode und Prüfungen

`dist/` enthält die installierbare Oberfläche und den Service Worker. `server/` enthält den Cloud-Abgleich und Web-Push-Versand. `netlify/functions/` verbindet beides mit Netlify. `worker/entry.mjs` und `scripts/build-worker.mjs` erzeugen den Worker für die private Vorschau; seine Ressourcen sind im Worker eingebettet.

```sh
npm ci
npm run check
npm run build
```

Automatisierte Prüfungen decken Unteraufgaben, Vorlagen, Serienänderungen, Sicherungen, Zusammenführung mehrerer Geräte, Löschmarken, API-Zugriff, konkurrierende Schreibzugriffe, Zeitzonen, Web-Push-Verschlüsselung und doppelte Zustellung ab. Die Hauptbedienwege und die Formularanordnung wurden zusätzlich im Browser auf Handy- und Tabletbreiten geprüft. Eine reale Push-Zustellung auf dem persönlichen iPhone ist erst nach Veröffentlichung der Netlify-Funktionen und der Gerätefreigabe prüfbar.

Offizielle Grundlagen: [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/), [Apple Web Push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers), [RFC 8291](https://www.rfc-editor.org/rfc/rfc8291), [RFC 8292](https://www.rfc-editor.org/rfc/rfc8292).
