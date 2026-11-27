---
title: Leistung und Kompatibilität
description: Wo PaperPic seine Arbeit erledigt, was Bundler, Content Security Policy und serverseitiges Rendern brauchen, wie es mit großen Handyfotos umgeht und welche Browser es unterstützt.
---

# Leistung und Kompatibilität

Handyfotos haben 12 Megapixel oder mehr, und ihre Bearbeitung ist echte Arbeit. Diese Seite erklärt, wo diese Arbeit läuft, was dein Build und dein Server brauchen und welche Browser PaperPic unterstützt.

## Ein Web Worker erledigt die Arbeit

Schwarzweiß und Begradigen brauchen bei einem Foto mit 12 Megapixeln auf einem aktuellen Smartphone etwa anderthalb Sekunden, wie die [gemessenen Zeiten](#measurements) zeigen. Im Hauptthread würde die Seite so lange einfrieren. PaperPic führt sie deshalb in einem Web Worker aus, sodass die Seite reagiert, während die Änderungen übernommen werden. Auch die Suche nach dem Dokument läuft dort.

Der Worker steckt im Paket und startet mit dem Standard `new Worker(new URL(…, import.meta.url))`, den Bundler wie Vite und webpack 5 von selbst erkennen, ohne Konfiguration. Kann der Worker nicht starten, läuft die Bearbeitung im Hauptthread: Sie funktioniert weiter, aber die Seite kann bei großen Bildern kurz einfrieren.

## Content Security Policy

Erlaube mit einer Content Security Policy:

- `worker-src 'self'` für den Worker.
- `img-src blob:`, weil der Viewer angehängte Dateien und übernommene Ergebnisse über `blob:`-URLs zeigt.
- `paperpic` in `trusted-types`, wenn deine Richtlinie die Richtlinien von Trusted Types einschränkt, weil die Icons der Schaltflächen durch diese Richtlinie laufen.
- Eine `default`-Richtlinie von Trusted Types, deren `createScriptURL` die URL des Workers annimmt, wenn deine Richtlinie Trusted Types verlangt. Bundler erkennen nur einen Worker, der mit einer einfachen URL erstellt wird, und die blockiert Trusted Types. Ohne diese Richtlinie läuft die Bearbeitung also im Hauptthread.

## Große Fotos

- **Beim Bearbeiten** arbeitet die Vorschau auf einer Kopie mit etwa 2 Megapixeln, damit Skalen und Werkzeuge mit jedem Foto flüssig bleiben.
- **Beim Übernehmen** läuft jede Änderung in voller Auflösung. Große Fotos brauchen ein paar Sekunden, deshalb zeigt der Viewer eine Meldung und sperrt währenddessen die Bedienelemente.
- **Um Zeit und Speicher zu sparen**, setze [`maxOutputSize`](../reference/options#maxoutputsize). Eine Grenze wie 2000 oder 3000 Pixel hält Dokumente lesbar, macht das Übernehmen schneller und die Dateien kleiner.

## Gemessene Zeiten {#measurements}

Jeder Schritt beim Übernehmen, im Worker, auf einem Pixel 10 Pro mit Chrome 156:

| Schritt                       | 2 MP   | 12 MP  | 37,5 MP |
| ----------------------------- | ------ | ------ | ------- |
| Schwarzweiß                   | 256 ms | 1,5 s  | 4,8 s   |
| Begradigen                    | 251 ms | 1,6 s  | 5,0 s   |
| Export als PNG                | 92 ms  | 378 ms | 979 ms  |
| Export als JPEG, Qualität 0,9 | 33 ms  | 142 ms | 525 ms  |

- Eine Bewegung des Lineals von Bereinigen dauert auf demselben Smartphone etwa 40 ms, weil sie auf der Vorschau mit etwa 2 MP arbeitet.
- Ein Desktop-Computer mit 8 Kernen erledigt jeden Schritt etwa sechsmal schneller.
- Bei 37,5 MP braucht Schwarzweiß in der Spitze etwa 340 MB Speicher.
- Android-Geräte der Mittelklasse und iPhones sind noch nicht gemessen.

## Serverseitiges Rendern

PaperPic braucht einen Browser. Die Vue- und React-Komponenten rendern auf dem Server ein leeres Element, etwa in Nuxt oder Next.js, und erstellen den Viewer im Browser. Mit dem Kern erstellst du den Viewer selbst im Browser, etwa beim Mounten deiner Komponente.

## Browserunterstützung

PaperPic unterstützt die Browser von [Baseline Widely Available](https://web.dev/baseline): Funktionen, die seit mindestens 30 Monaten in allen großen Browsern laufen. Die Pakete sind für dieses Ziel gebaut, das heißt für Chrome und Edge 124, Firefox 125 und Safari 17.5 oder neuer, du musst sie also nicht transpilieren.
