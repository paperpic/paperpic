---
title: Zuschneiden
description: Wie das Werkzeug Zuschneiden von PaperPic den Teil eines Fotos behält, der das Dokument zeigt, mit Eckgriffen, einer Lupe auf Touchscreens und der Tastatur.
---

# Zuschneiden

Das Foto eines Dokuments zeigt oft den Tisch, eine Hand oder andere Papiere drumherum. Zuschneiden behält das Rechteck mit dem Dokument und verwirft den Rest.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['crop']" />

## So geht’s

1. Drücke Bearbeiten, dann Zuschneiden. Im Bild erscheint ein Rechteck mit einem Griff an jeder Ecke.
2. Ziehe die Ecken, bis das Rechteck das Dokument einrahmt. Das Bedienfeld von Zuschneiden hat Zoom-Schaltflächen, damit du zum genauen Platzieren hineinzoomen kannst.
3. Drücke Fertig oder `Enter`, um den Zuschnitt zu den Änderungen hinzuzufügen. Mit Dieses Werkzeug abbrechen oder `Esc` schließt du Zuschneiden, ohne etwas zu ändern.

Solange Zuschneiden offen ist, sieht das Bild so aus, wie das Ergebnis wird, mit Anpassen und Bereinigen. Der Zuschnitt ist eine Änderung wie jede andere: Mit Rückgängig entfernst du ihn, mit Übernehmen wird er dauerhaft.

## Eckgriffe

- Die Griffe bleiben im Bild, und das Rechteck stülpt sich nie um.
- Mit dem Finger oder einem Stift zeigt eine Lupe den Bereich darunter, während eine Ecke gezogen wird, damit nichts verdeckt, wo die Ecke landet.
- Ohne Ziehen: Drücke einen Griff und tippe dann auf die Stelle, an die seine Ecke soll. Bis dahin bleibt der Griff hervorgehoben, die Zoom-Schaltflächen zoomen zu seiner Ecke, und `Esc` lässt ihn los.
- Mit der Tastatur wechselt Tab zwischen den Griffen, und die Pfeiltasten bewegen den fokussierten Griff um 1 Bildschirmpixel, mit Umschalt um 10. `+` und `-` zoomen zum fokussierten Griff. Screenreader sagen jede Bewegung an.

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
