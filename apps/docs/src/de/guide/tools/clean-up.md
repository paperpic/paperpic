---
title: Bereinigen
description: Wie das Werkzeug Bereinigen von PaperPic das Foto eines Dokuments in Graustufen oder in klares Schwarzweiß ohne Schatten verwandelt und wie Empfindlichkeit und Weichheit das Ergebnis ändern, mit einer Live-Demo.
---

# Bereinigen

Bereinigen wählt das Finish des Bildes: die ursprünglichen Töne, Graustufen oder Schwarzweiß. Seine Id in der API ist `finish`.

Text auf Papier liest sich am besten in Schwarzweiß, aber ein Foto hat Schatten, ungleichmäßiges Licht und graues Papier. Schwarzweiß vergleicht jedes Pixel mit seiner Umgebung, um zu entscheiden, ob es Tinte oder Papier ist, sodass Schatten und ungleichmäßiges Licht verschwinden und der Text scharf bleibt. Graustufen behalten jeden Ton und entfernen nur die Farbe, für Dokumente mit Fotos oder Stempeln, die in Schwarzweiß verloren gingen.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['perspective', 'finish']" />

Begradige zuerst den Kassenbon, dann bereinige ihn.

## So geht’s

1. Drücke Bearbeiten, dann Bereinigen. Sein Bedienfeld nimmt den Platz der Werkzeuge ein, mit drei Finishs: Original, Graustufen und Schwarzweiß. Es öffnet sich in Schwarzweiß, also wird die Vorschau schwarzweiß und die Skala Empfindlichkeit funktioniert.
2. Ziehe die Skala. Höhere Empfindlichkeit macht mehr Pixel dunkel, was blassen oder abgenutzten Text zurückholt. Niedrigere Empfindlichkeit ergibt eine sauberere Seite, ohne den Druck, der von der Rückseite durchscheint.
3. Wähle stattdessen Graustufen für ein graues Bild oder Original für die Töne des Fotos. Die Skala funktioniert nur in Schwarzweiß.
4. Drücke Fertig, um es als eine Änderung zu behalten, oder Dieses Werkzeug abbrechen, um das Bild zu lassen, wie es war.

Ist Bereinigen schon unter den Änderungen, öffnet es sich wieder mit seinem Finish. Zum Ausschalten wähle Original: Die Änderungen danach bleiben. Mit Rückgängig würdest du dagegen auch diese Änderungen entfernen.

Bereinigen läuft immer nach den übrigen Änderungen. Zuschneiden zeigt das Bild mit seinem Finish, wie es sein wird. Begradigen zeigt es ohne Schwarzweiß, weil die Ränder des Papiers auf einer bereinigten Seite schwer zu finden sind, und behält Graustufen.

[Anpassen](./adjust) funktioniert mit Graustufen, die danach kommen, und ist in Schwarzweiß deaktiviert, das eigene Töne hat.

## Weichheit

[`softness`](../../reference/options#softness) legt fest, wie viel Grau Schwarzweiß an den Rändern der Buchstaben behält, von 0 bis 1, standardmäßig 0.25. Ein wenig Grau glättet die Ränder und macht kleinen Text leichter lesbar. Nimm `0` für striktes Schwarzweiß, das kleinere Dateien ergibt, aber dünne Striche bricht.

## Format des Ergebnisses

Ein Bild in Schwarzweiß ist PNG, weil JPEG um seine scharfen Ränder Artefakte hinzufügen würde. Ein graues Bild behält das Format der Quelle. Die Option [`output`](../../reference/options#output) kann ein anderes Format wählen.

## Aus dem Code

[`setFinish()`](../../reference/methods#setfinish) wählt das Finish, `'original'`, `'gray'` oder `'mono'` für Schwarzweiß, und setzt die Empfindlichkeit von Schwarzweiß, von 0 bis 1, standardmäßig 0.5. [`getState()`](../../reference/methods#getstate) gibt beides in `finish` zurück:

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

Solange Bereinigen offen ist, ändert `setFinish()`, was sein Bedienfeld zeigt, und [`confirmTool()`](../../reference/methods#confirmtool) behält es als eine Änderung.
