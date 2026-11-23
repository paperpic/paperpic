---
title: Begradigen
description: Wie das Werkzeug Begradigen von PaperPic aus einem schräg aufgenommenen Dokumentfoto eine flache Seite macht, wie es das Seitenverhältnis schätzt und wann aspectRatio hilft, mit einer Live-Demo.
---

# Begradigen

Ein schräg fotografiertes Dokument sieht wie ein Trapez aus: Die hintere Kante ist kürzer, und der Text kippt. Begradigen macht daraus wieder eine flache, rechteckige Seite, als wäre sie gescannt. Seine Id in der API ist `perspective`.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['perspective']" />

## So geht’s

1. Drücke Bearbeiten, dann Begradigen. Für jede Ecke erscheint ein Griff.
2. Ziehe jeden Griff auf eine Ecke des Dokuments. Zoome mit den Schaltflächen seines Bedienfelds hinein, um sie genau zu platzieren.
3. Wenn du das Papier kennst, wähle sein [Format](#paper-size): A4, Letter oder Karte. Auto schätzt es.
4. Drücke Fertig oder `Enter`. Der Viewer zeigt die Seite flach, auf die vier Ecken zugeschnitten. Fertig wartet, bis du eine Ecke bewegst.

Die Griffe funktionieren wie bei [Zuschneiden](./crop): eine Lupe auf Touchscreens, Drücken und Tippen statt Ziehen, Tab und Pfeiltasten auf der Tastatur. Die vier Ecken bilden immer eine konvexe Form, damit sich die Seite immer flach machen lässt.

Begradigen zeigt das Foto ohne das Schwarzweiß von [Bereinigen](./clean-up), weil die Ränder des Papiers auf einer bereinigten Seite schwer zu finden sind. Schwarzweiß kommt nach Fertig zurück, und Graustufen bleiben.

## Papierformat {#paper-size}

Das Bedienfeld von Begradigen bietet Papierformate, die dem Ergebnis das exakte Seitenverhältnis dieses Papiers geben:

| Auswahl | Seitenverhältnis                                                                               |
| ------- | ---------------------------------------------------------------------------------------------- |
| Auto    | [`aspectRatio`](../../reference/options#aspectratio) oder sonst eine [Schätzung](#proportions) |
| A4      | 210 × 297 mm, wie auch A3 und A5                                                               |
| Letter  | 8,5 × 11 Zoll, US-Letter                                                                       |
| Karte   | 85,6 × 53,98 mm, eine Ausweis- oder Bankkarte                                                  |

Ein Format legt nur das Seitenverhältnis fest: Es bewegt keine Ecken und findet das Dokument nicht. Hoch- oder Querformat folgt den Ecken, du musst also keine Ausrichtung wählen. Ein Format, das nicht zum Dokument passt, verzerrt es, deshalb beginnt Begradigen bei jedem Öffnen mit Auto.

Liegen die vier Ecken auf den Ecken des Bildes, ändert Auto nichts, und ein Format gibt dem ganzen Bild das Seitenverhältnis dieses Papiers.

## Seitenverhältnis {#proportions}

Ein Foto verrät nicht die echte Form der Seite, also schätzt Begradigen ihr Seitenverhältnis aus der Lage der Ecken im Foto. Die Schätzung passt zu Fotos aus normalem Abstand, kann aber nicht exakt sein.

Die Schätzung nutzt das ursprüngliche Foto, auch nach einem Zuschnitt oder einer Drehung in derselben Bearbeitung. Sobald der Nutzer übernimmt, gilt das Ergebnis als neues Foto, also begradige vor dem Übernehmen.

Wenn du das Dokument kennst, setze [`aspectRatio`](../../reference/options#aspectratio) auf seine Breite geteilt durch seine Höhe, und das Ergebnis bekommt dieses Seitenverhältnis:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Dokument              | `aspectRatio`  |
| --------------------- | -------------- |
| A4-Blatt, hoch        | `210 / 297`    |
| US-Letter-Blatt, hoch | `8.5 / 11`     |
| Ausweiskarte, quer    | `85.6 / 53.98` |

Für ein Blatt im Querformat vertausche die Zahlen, etwa `297 / 210`. Das Seitenverhältnis gilt für die Seite, wie sie auf dem Bildschirm erscheint. Drehe ein seitliches Foto also mit [Nach links drehen](./rotate-and-flip), bevor du es begradigst.

## Vom Foto abgeschnittene Ecken

Manchmal liegt eine Ecke des Dokuments außerhalb des Fotos. Die Griffe bleiben im Bild, also setze diesen Griff auf den Rand des Fotos, entlang der Kante des Dokuments, die den Inhalt behält. Die letzten Zeilen kippen leicht, und das geschätzte Seitenverhältnis leidet, was [`aspectRatio`](../../reference/options#aspectratio) beheben kann.

Im [Playground](../../playground) gibt es einen Beispiel-Kassenbon mit abgeschnittener Ecke zum Ausprobieren.

## Aus dem Code

Begradigen öffnet sich mit [`openTool('perspective')`](../../reference/methods#opentool) und schließt sich mit [`confirmTool()`](../../reference/methods#confirmtool) oder [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')
pic.setPaper({ size: 'a4' })

// Später, über eine eigene Schaltfläche
pic.confirmTool()
```

Wähle das Papierformat mit [`setPaper()`](../../reference/methods#setpaper), solange das Werkzeug offen ist. `confirmTool()` wartet, bis sich eine Ecke bewegt, und `canConfirm` im [Zustand](../../reference/state) sagt, wann es geht.
