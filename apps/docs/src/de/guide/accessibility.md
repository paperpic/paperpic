---
title: Barrierefreiheit
description: Wie PaperPic mit Tastatur, Screenreadern und Touchscreens funktioniert, welche Einstellungen es beachtet und was deine App beisteuern muss.
---

# Barrierefreiheit

Menschen lesen und korrigieren Dokumente mit der Maus, dem Finger, der Tastatur oder einem Screenreader. PaperPic zielt auf WCAG 2.2 AA, und das meiste ist schon eingebaut. Diese Seite zeigt, was es tut und was deine App ergänzen muss.

## Was deine App beisteuert

- **Eine Beschreibung.** Übergib [`alt`](../reference/options#alt), etwa „Kassenbon vom 5. November“. Screenreader lesen ihn als Namen des Bildes.
- **Texte in der Sprache des Nutzers.** Screenreader sagen Schaltflächen und Änderungen an, also übersetze sie mit [`labels`](./labels).
- **Eigene Bedienelemente, falls vorhanden.** Mit `toolbar: false` ersetzen deine Schaltflächen die eingebauten, und sie brauchen eigene Namen und Tastaturbedienung.
- **Einen sichtbaren Fokus.** Achte darauf, dass dein CSS den Fokusrahmen des Viewers nicht versteckt.

## Tastatur

Wenn der Viewer den Fokus hat:

| Taste                           | Aktion                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `+` und `-`                     | Vergrößern und verkleinern                                                                     |
| Pfeiltasten                     | Verschieben                                                                                    |
| `0`                             | Das ganze Bild einpassen                                                                       |
| `Strg+Z`                        | Rückgängig                                                                                     |
| `Strg+Umschalt+Z` oder `Strg+Y` | Wiederholen                                                                                    |
| `Enter`                         | Das offene Werkzeug bestätigen, sonst die Änderungen übernehmen                                |
| `Esc`                           | Eine ausgewählte Ecke loslassen, das offene Werkzeug schließen, sonst die Änderungen abbrechen |

Unter macOS funktioniert `Cmd` wie `Strg`. Bevor `Esc` Änderungen abbricht, fragt es nach. Mit `toolbar: false` überlässt es sie deiner Oberfläche.

- **Werkzeugleiste und Bearbeitungsleiste.** Tab erreicht jede Leiste, und darin wechseln die Pfeiltasten zwischen den Schaltflächen, mit `Pos1` und `Ende` für die erste und die letzte.
- **Eckgriffe.** Bei offenem Zuschneiden oder Begradigen wechselt Tab zwischen den Griffen, und die Pfeiltasten bewegen den fokussierten um 1 Bildschirmpixel, mit Umschalt um 10.
- **Skalen.** Die Skalen von Anpassen und Bereinigen sind native Schieberegler: Die Pfeiltasten, `Bild auf`, `Bild ab`, `Pos1` und `Ende` bewegen sie. `Enter` behält den Wert, wie Fertig, und `Esc` schließt das Werkzeug ohne ihn.

## Screenreader

- Das Bild hat die Rolle eines Bildes, mit `alt` als Namen. Ohne `alt` überspringen Screenreader es.
- Werkzeugleiste und Bearbeitungsleiste haben eigene Namen, etwa „Bildsteuerung“ und „Bearbeitungssteuerung“.
- Eine Ansage meldet jede Änderung, die der Nutzer nicht allein am Fokus erkennt: die Zoomstufe, den Beginn des Bearbeitungsmodus, die Position einer verschobenen Ecke, den Wert einer Skala und das Ergebnis von Übernehmen.
- Der Schalter von Bereinigen hat die Rolle eines Schalters. Ein Werkzeug in Verwendung, das auf dem Bildschirm ein Punkt markiert, wird als „Aktiv“ beschrieben.

## Touchscreens

- Mit `pointer: coarse` sind Schaltflächen und Eckgriffe mindestens 44 Pixel groß.
- Während ein Finger eine Ecke zieht, zeigt eine Lupe den Bereich darunter.
- Eine Ecke lässt sich auch ohne Ziehen verschieben: Drücke ihren Griff und tippe dann auf die neue Stelle. Das geht auch mit der Maus.
- Solange das Bild eingepasst ist, scrollt ein Finger die Seite, der Viewer hält also niemanden gefangen. Ist es vergrößert, verschiebt er das Bild.

## Einstellungen

- **Weniger Bewegung.** Mit `prefers-reduced-motion: reduce` wechseln Schaltflächen ihren Zustand ohne Übergänge.
- **Erzwungene Farben.** Im Kontrastmodus von Windows und anderen Modi mit erzwungenen Farben behalten gedrückte Schaltflächen und die Hauptaktionen einen sichtbaren Rahmen.
- **Dunkelmodus.** Die Farben folgen dem `color-scheme` deiner Seite, das dem System folgen kann. Siehe [Gestaltung](./styling#dark-mode).
