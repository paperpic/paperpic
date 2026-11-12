---
title: Anpassen
description: Wie das Werkzeug Anpassen von PaperPic Helligkeit und Kontrast eines Dokumentbilds mit einer Live-Skala ändert und wie du sie aus dem Code setzt.
---

# Anpassen

Fotos bei schlechtem Licht werden dunkel oder grau. Anpassen ändert Helligkeit und Kontrast und behält die Farben, für Dokumente, die nicht schwarzweiß werden sollen, etwa farbige Formulare oder Fotos.

## So geht’s

1. Drücke Bearbeiten, dann Anpassen. Sein Bedienfeld nimmt den Platz der Werkzeuge ein: eine Skala, dazu Helligkeit und Kontrast, um den Ton zu wählen, den sie ändert.
2. Ziehe die Skala. Die Vorschau ändert sich beim Ziehen. Wähle Kontrast, um den anderen Ton mit derselben Skala zu ändern.
3. Drücke Fertig, um beide Töne als eine Änderung zu behalten, die Rückgängig entfernt. Dieses Werkzeug abbrechen lässt das Bild, wie es war.

Die Mitte der Skala lässt das Bild, wie es ist, und die Nadel rastet dort ein, damit du leicht zu keiner Änderung zurückfindest. Screenreader sagen den Wert von -100 bis 100 an, etwa „Helligkeit +30“. Ein Punkt auf Anpassen und auf jedem Ton in seinem Bedienfeld markiert einen Wert, der nicht 0 ist.

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

Solange Anpassen offen ist, ändert `setAdjustments()`, was sein Bedienfeld zeigt, und [`confirmTool()`](../../reference/methods#confirmtool) behält es als eine Änderung.

In der Option [`tools`](../../reference/options#tools) ist Anpassen `'adjust'`.
