---
title: Bereinigen
description: Wie das Werkzeug Bereinigen von PaperPic aus dem Foto eines Dokuments klares Schwarzweiß ohne Schatten macht und wie Empfindlichkeit und Weichheit das Ergebnis ändern, mit einer Live-Demo.
---

# Bereinigen

Text auf Papier liest sich am besten in Schwarzweiß, aber ein Foto hat Schatten, ungleichmäßiges Licht und graues Papier. Bereinigen vergleicht jedes Pixel mit seiner Umgebung, um zu entscheiden, ob es Tinte oder Papier ist, sodass Schatten und ungleichmäßiges Licht verschwinden und der Text scharf bleibt. Seine Id in der API ist `threshold`.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['perspective', 'threshold']" />

Begradige zuerst den Kassenbon, dann bereinige ihn.

## So geht’s

1. Drücke Bearbeiten, dann Bereinigen. Sein Bedienfeld nimmt den Platz der Werkzeuge ein, die Vorschau wird schwarzweiß, und eine Skala Empfindlichkeit erscheint.
2. Ziehe die Skala. Höhere Empfindlichkeit macht mehr Pixel dunkel, was blassen oder abgenutzten Text zurückholt. Niedrigere Empfindlichkeit ergibt eine sauberere Seite, ohne das, was von der Rückseite durchscheint.
3. Drücke Fertig, um es als eine Änderung zu behalten, oder Dieses Werkzeug abbrechen, um das Bild zu lassen, wie es war.

Um ein Bereinigen auszuschalten, das schon eine Änderung ist, öffne es erneut: Ein Schalter neben der Skala schaltet es aus, und die Änderungen danach bleiben. Rückgängig würde zuerst diese Änderungen entfernen.

Bereinigen läuft immer nach den übrigen Änderungen. Zuschneiden zeigt das Bild bereinigt, so wie es wird. Begradigen zeigt es ohne Bereinigen, weil die Ränder des Papiers auf einer bereinigten Seite schwer zu finden sind.

## Weichheit

[`softness`](../../reference/options#softness) legt fest, wie viel Grau Bereinigen an den Rändern der Buchstaben behält, von 0 bis 1, standardmäßig 0.25. Ein wenig Grau glättet die Ränder und macht kleine Schrift leichter lesbar. Nimm `0` für strenges Schwarzweiß, das kleinere Dateien ergibt, aber dünne Striche zerbricht.

## Format des Ergebnisses

Ein bereinigtes Bild ist PNG, weil JPEG Artefakte um seine scharfen Kanten erzeugen würde. Die Option [`output`](../../reference/options#output) kann ein anderes Format wählen.

## Aus dem Code

[`setThreshold()`](../../reference/methods#setthreshold) schaltet Bereinigen ein oder aus und setzt seine Empfindlichkeit, von 0 bis 1, standardmäßig 0.5. [`getState()`](../../reference/methods#getstate) gibt beides in `threshold` zurück:

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```

Solange Bereinigen offen ist, ändert `setThreshold()`, was sein Bedienfeld zeigt, und [`confirmTool()`](../../reference/methods#confirmtool) behält es als eine Änderung.
