---
title: Abdecken
description: Wie das Werkzeug Abdecken von PaperPic einen Teil eines Fotos mit deckendem Schwarz oder Weiß überdeckt, etwa eine Kontonummer oder eine Unterschrift, sodass das Ergebnis ihn nicht mehr enthält.
---

# Abdecken

Das Foto eines Dokuments zeigt oft mehr als nötig: eine Kontonummer, eine Unterschrift, ein Gesicht im Hintergrund. Abdecken überdeckt ein gerades oder schräges Rechteck mit deckendem Schwarz oder Weiß, und das Ergebnis enthält nicht mehr, was darunter lag.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['redact']" />

## So geht’s

1. Drücke Bearbeiten, dann Abdecken. Quer durch die Mitte des Bildes erscheint ein Streifen mit einem Griff an jeder Ecke.
2. Zeichne den Bereich über das, was verborgen werden soll: Ziehe von einer seiner Ecken zur gegenüberliegenden, überall auf dem Bild, auch auf dem Streifen. Ziehe dann den Bereich, um ihn zu bewegen, drehe ihn am Griff über ihm, damit er sich mit einer Textzeile neigt, und ziehe seine Ecken, um seine Größe zu ändern. Der Bereich zeigt seine Farbe noch durchscheinend, damit du ihn über die richtigen Wörter legen kannst.
3. Wähle im Bedienfeld Schwarz oder Weiß.
4. Drücke Fertig oder `Enter`, um den Bereich zu den Änderungen hinzuzufügen. Mit Dieses Werkzeug abbrechen oder `Esc` schließt du Abdecken, ohne etwas zu ändern.

Zeichnen kannst du nur, bis du den Bereich platziert hast. Sobald du ihn zeichnest, bewegst, drehst oder seine Größe änderst, verschiebt Ziehen auf dem übrigen Bild wieder das Bild, damit nichts den Bereich versehentlich ersetzt. Vorher verschiebst du ein gezoomtes Bild mit zwei Fingern oder mit den Pfeiltasten, solange der Fokus auf dem Bild liegt. Ohne Ziehen ist der Streifen der Bereich: Bewege ihn mit der Tastatur, oder drücke ihn und tippe dann auf sein Ziel.

Jeder Druck auf Fertig fügt einen Bereich hinzu. Öffne Abdecken also erneut, um einen weiteren Teil zu überdecken. Mit Rückgängig entfernst du den letzten Bereich, und die Farbe bleibt für den nächsten. Die Eckgriffe funktionieren wie bei [Zuschneiden](./crop): ziehen, antippen und dann das Ziel antippen, oder mit der Tastatur bewegen. Am Griff über dem Bereich drehen die Pfeiltasten ihn um 1 Grad, mit Umschalt um 10. Beim Ziehen rastet er gerade ein.

## Was es garantiert {#guarantees}

- Die Bereiche werden nach allen anderen Änderungen überdeckt, sodass Anpassen und Bereinigen ihr Schwarz oder Weiß nie aufhellen.
- Ein Bereich folgt den späteren Änderungen: Eine Drehung, eine Spiegelung oder ein Zuschnitt bewegt ihn mit dem Bild, und Begradigen verzerrt ihn mit der Seite.
- Er deckt jedes Pixel ab, das seine Kanten auch nur teilweise berühren, und ist auch in einem transparenten PNG deckend.
- Beim Übernehmen werden deckende Pixel in das Ergebnis geschrieben, sodass die Datei nichts von dem behält, was sie überdecken.

Bis zum Übernehmen behält der Viewer das Quellbild, daher holst du mit Rückgängig zurück, was ein Bereich überdeckt. Teile immer das übernommene Ergebnis, nie das Quellbild.

## Aus dem Code

Abdecken ist standardmäßig in der Bearbeitungsleiste, mit der Id `'redact'` in [`tools`](../../reference/options#tools). Mit `toolbar: false` öffnest du es mit [`openTool()`](../../reference/methods#opentool), wählst die Farbe mit [`setRedaction()`](../../reference/methods#setredaction) und schließt es mit [`confirmTool()`](../../reference/methods#confirmtool) oder [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Später, über eine eigene Schaltfläche
pic.confirmTool()
```

`redaction` im [Zustand](../../reference/state) enthält die verwendete Farbe.
