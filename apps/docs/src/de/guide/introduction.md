---
title: Was ist PaperPic?
description: PaperPic ist ein Viewer und Editor für Dokumentbilder im Web. Nutzer zoomen in Fotos von Papier, begradigen, beschneiden und bereinigen sie, bevor deine App sie speichert.
---

# Was ist PaperPic?

Fotos von Dokumenten kommen schief, mit Schatten und viel Hintergrund an. PaperPic zeigt sie in einem Viewer, in den man hineinzoomen kann, und lässt jedes Foto begradigen und bereinigen, bevor deine App es speichert, so wie eine Scanner-App.

## Was es kann

- **Ansehen.** Zoomen mit den Schaltflächen, dem Mausrad oder zwei Fingern, das Bild verschieben und das ganze Bild, seine Breite oder seine Höhe einpassen. Ein schreibgeschützter Viewer kann das Bild auch drehen.
- **Bearbeiten.** Im Bearbeitungsmodus kann der Nutzer zuschneiden, ein schräg aufgenommenes Foto begradigen, drehen, spiegeln, Helligkeit und Kontrast anpassen und das Dokument zu Schwarzweiß bereinigen. Jede Änderung lässt sich rückgängig machen, bis der Nutzer die Änderungen übernimmt.
- **Liefern.** Übernehmen berechnet das Ergebnis in voller Auflösung und übergibt es deinem Code als `Blob`. Eine Download-Schaltfläche kann es auch speichern.

Jeder Schritt passiert nur, wenn der Nutzer ihn anstößt. Nichts verändert das Foto von selbst.

## Was es nicht kann

- Es lädt nichts hoch. Deine App entscheidet, was mit dem Ergebnis passiert.
- Es öffnet keine PDF-Dateien, nur Bilder.
- Es findet die Ränder des Dokuments nicht selbst: Der Nutzer zieht die Ecken.

## Pakete

| Paket             | Für                                             |
| ----------------- | ----------------------------------------------- |
| `@paperpic/core`  | JavaScript ohne Framework, oder jedes Framework |
| `@paperpic/vue`   | Vue 3.5 oder neuer                              |
| `@paperpic/react` | React 19 oder neuer                             |

Alle drei haben dieselben Optionen, Ereignisse und Methoden, und der Kern hat keine Laufzeitabhängigkeiten. Die Bearbeitung läuft in einem Web Worker, die Seite bleibt also auch bei großen Fotos reaktionsschnell.

## Ausprobieren

Im [Playground](../playground) kannst du einen Beispiel-Kassenbon bearbeiten, oder ein eigenes Foto, das deinen Browser nie verlässt. Um PaperPic in deine App einzubauen, geh zu [Erste Schritte](./getting-started).
