---
title: Leistung und Kompatibilität
description: Wo PaperPic seine Arbeit erledigt, was Bundler, Content Security Policy und serverseitiges Rendern brauchen, wie es mit großen Handyfotos umgeht und welche Browser es unterstützt.
---

# Leistung und Kompatibilität

Handyfotos haben 12 Megapixel oder mehr, und ihre Bearbeitung ist echte Arbeit. Diese Seite erklärt, wo diese Arbeit läuft, was dein Build und dein Server brauchen und welche Browser PaperPic unterstützt.

## Ein Web Worker erledigt die Arbeit

Bereinigen und Begradigen dauern bei einem 12-Megapixel-Foto auf einem Handy länger als eine Sekunde. Im Hauptthread würde die Seite so lange einfrieren. PaperPic führt sie deshalb in einem Web Worker aus, und die Seite reagiert weiter, während Übernehmen läuft.

Der Worker steckt im Paket und startet mit dem Standard `new Worker(new URL(…, import.meta.url))`, den Bundler wie Vite und webpack 5 von selbst erkennen, ohne Konfiguration. Kann der Worker nicht starten, läuft die Bearbeitung im Hauptthread: Sie funktioniert weiter, aber die Seite kann bei großen Bildern kurz einfrieren.

## Content Security Policy

Erlaube mit einer Content Security Policy:

- `worker-src 'self'` für den Worker.
- `img-src blob:`, weil der Viewer angehängte Dateien und die Ergebnisse von Übernehmen über `blob:`-URLs zeigt.

## Große Fotos

- **Beim Bearbeiten** arbeitet die Vorschau auf einer Kopie mit etwa 2 Megapixeln, damit Regler und Werkzeuge mit jedem Foto flüssig bleiben.
- **Beim Übernehmen** läuft jede Änderung in voller Auflösung. Große Fotos brauchen ein paar Sekunden, deshalb zeigt der Viewer eine Meldung und sperrt währenddessen die Bedienelemente.
- **Um Zeit und Speicher zu sparen**, setze [`maxOutputSize`](../reference/options#maxoutputsize). Eine Grenze wie 2000 oder 3000 Pixel hält Dokumente lesbar, macht Übernehmen schneller und die Dateien kleiner.

## Welche Bilder es annimmt

`src` nimmt eine URL vom selben Ursprung wie deine Seite, oder eine `File` oder einen `Blob`, die im Client angehängt wurden. PaperPic liest die Pixel des Bildes, und Browser erlauben das bei Bildern anderer Ursprünge nur über CORS, das PaperPic nicht anfordert. Liefere die Bilder von deiner eigenen Domain aus, oder lade sie selbst und übergib den `Blob`.

## Serverseitiges Rendern

PaperPic braucht einen Browser. Die Vue- und React-Komponenten rendern auf dem Server ein leeres Element, etwa in Nuxt oder Next.js, und erstellen den Viewer im Browser. Mit dem Kern erstellst du den Viewer selbst im Browser, etwa beim Mounten deiner Komponente.

## Browserunterstützung

PaperPic unterstützt die Browser von [Baseline Widely Available](https://web.dev/baseline): Funktionen, die seit mindestens 30 Monaten in allen großen Browsern laufen. Die Pakete sind für dieses Ziel gebaut, du musst sie also nicht transpilieren.
