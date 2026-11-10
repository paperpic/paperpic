---
title: Zuschneiden
description: Wie das Werkzeug Zuschneiden von PaperPic den Teil eines Fotos behält, der das Dokument zeigt, mit Eckgriffen, einer Lupe auf Touchscreens und der Tastatur.
---

# Zuschneiden

Das Foto eines Dokuments zeigt oft den Tisch, eine Hand oder andere Papiere drumherum. Zuschneiden behält das Rechteck mit dem Dokument und verwirft den Rest.

## So geht’s

1. Drücke Bearbeiten, dann Zuschneiden. Im Bild erscheint ein Rechteck mit einem Griff an jeder Ecke.
2. Ziehe die Ecken, bis das Rechteck das Dokument einrahmt. Die Zoom-Schaltflächen bleiben verfügbar, damit du zum genauen Platzieren hineinzoomen kannst.
3. Drücke Fertig oder `Enter`, um den Zuschnitt zu den Änderungen hinzuzufügen. Dieses Werkzeug abbrechen oder `Esc` schließt Zuschneiden, ohne etwas zu ändern.

Der Zuschnitt ist eine Änderung wie jede andere: Rückgängig entfernt ihn, und Übernehmen macht ihn dauerhaft.

## Eckgriffe

- Die Griffe bleiben im Bild, und das Rechteck stülpt sich nie um.
- Auf einem Touchscreen zeigt eine Lupe den Bereich unter dem Finger, während er eine Ecke zieht, damit der Finger nicht verdeckt, wo die Ecke landet.
- Mit der Tastatur wechselt Tab zwischen den Griffen, und die Pfeiltasten bewegen den fokussierten Griff um 1 Bildschirmpixel, mit Umschalt um 10. Screenreader sagen jede Bewegung an.

## Zuschneiden oder Begradigen?

Zuschneiden behält ein Rechteck, wie es ist. Auf einem schräg aufgenommenen Foto sieht das Dokument wie ein Trapez aus, und kein Rechteck passt. Nimm dafür [Begradigen](./straighten): Es bewegt jede Ecke einzeln und macht die Seite flach.

## Aus dem Code

Zuschneiden ist standardmäßig in der Bearbeitungsleiste, mit der Id `'crop'` in [`tools`](../../reference/options#tools). Mit `toolbar: false` öffnest du es mit [`openTool()`](../../reference/methods#opentool) und schließt es mit [`confirmTool()`](../../reference/methods#confirmtool) oder [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('crop')

// Später, über eine eigene Schaltfläche
pic.confirmTool()
```
