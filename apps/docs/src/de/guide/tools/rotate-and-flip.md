---
title: Drehen und spiegeln
description: Wie man das Bild eines Dokuments in PaperPic dreht und spiegelt, im Bearbeitungsmodus, in einem schreibgeschützten Viewer und aus dem Code.
---

# Drehen und spiegeln

Handys speichern das Foto eines Dokuments oft seitlich oder kopfüber, und manche Scans kommen gespiegelt heraus. Nach links drehen und Spiegeln korrigieren die Ausrichtung und lassen den Rest des Bildes unverändert.

## Drehen

In der Bearbeitungsleiste dreht Nach links drehen das Bild um eine Vierteldrehung gegen den Uhrzeigersinn, wie in Fotogalerien. Drücke zweimal für eine halbe Drehung oder dreimal für eine Vierteldrehung im Uhrzeigersinn.

Eine Drehung ist eine Änderung: Rückgängig entfernt sie, und Übernehmen macht sie dauerhaft. Vier Drehungen bringen das Bild an seinen Ausgangspunkt zurück, und dann gibt es nichts zu übernehmen.

Aus dem Code dreht [`rotate()`](../../reference/methods#rotate) mit `1` im Uhrzeigersinn und mit `-1` dagegen:

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Spiegeln

Spiegeln spiegelt das Bild von links nach rechts, so wie es angezeigt wird, nach einer Vierteldrehung also weiterhin von links nach rechts auf dem Bildschirm. Um ein Bild auf den Kopf zu stellen, spiegle es und drehe es zweimal.

Spiegelungen und Drehungen, die sich aufheben, lassen nichts zu übernehmen. Aus dem Code rufst du [`flip()`](../../reference/methods#flip) auf.

## In einem schreibgeschützten Viewer

Mit [`editable: false`](../viewer#read-only) hat die Werkzeugleiste die Schaltflächen Nach links drehen und Nach rechts drehen. Sie drehen nur das angezeigte Bild: Nichts wird gespeichert, und das Ereignis `apply` kommt nie. [`rotate()`](../../reference/methods#rotate) tut dasselbe aus dem Code. Ein schreibgeschützter Viewer hat kein Spiegeln.

## Ids

In der Option [`tools`](../../reference/options#tools) ist Nach links drehen `'rotate'` und Spiegeln `'flip'`.
