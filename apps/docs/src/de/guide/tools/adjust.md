---
title: Anpassen
description: Wie das Werkzeug Anpassen von PaperPic Helligkeit und Kontrast eines Dokumentbilds mit zwei Live-Reglern ändert und wie du sie aus dem Code setzt.
---

# Anpassen

Fotos bei schlechtem Licht werden dunkel oder grau. Anpassen ändert Helligkeit und Kontrast und behält die Farben, für Dokumente, die nicht schwarzweiß werden sollen, etwa farbige Formulare oder Fotos.

## So geht’s

1. Drücke Bearbeiten, dann Anpassen. In der Bearbeitungsleiste erscheinen zwei Regler: Helligkeit und Kontrast.
2. Ziehe einen Regler. Die Vorschau ändert sich beim Ziehen, und das Loslassen hinterlässt eine Änderung, die Rückgängig entfernt.
3. Drücke erneut Anpassen, um die Regler auszublenden.

Die Mitte jedes Reglers lässt das Bild, wie es ist, und ein Regler, der zur Mitte zurückkehrt, zählt nicht als Änderung. Screenreader sagen den Wert von -100 bis 100 an, etwa „Helligkeit +30“.

Anpassen läuft nach den übrigen Änderungen, deshalb zeigen Zuschneiden und Begradigen das Bild mit ihm.

## Anpassen oder Bereinigen?

| Anpassen                                 | [Bereinigen](./clean-up)       |
| ---------------------------------------- | ------------------------------ |
| Behält Farben und Grautöne               | Macht das Dokument schwarzweiß |
| Für farbige Formulare, Stempel und Fotos | Für Text auf Papier            |
| Behält das Format des Quellbilds         | Ergibt PNG                     |

Solange Bereinigen eingeschaltet ist, ist Anpassen deaktiviert, weil ein bereinigtes Dokument eigene Töne hat.

## Aus dem Code

[`setAdjustments()`](../../reference/methods#setadjustments) nimmt Werte von -1 bis 1, wobei 0 nichts ändert, und [`getState()`](../../reference/methods#getstate) gibt sie in `adjustments` zurück:

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

In der Option [`tools`](../../reference/options#tools) ist Anpassen `'adjust'`.
