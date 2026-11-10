---
title: Begradigen
description: Wie das Werkzeug Begradigen von PaperPic aus einem schräg aufgenommenen Dokumentfoto eine flache Seite macht, wie es das Seitenverhältnis schätzt und wann aspectRatio hilft, mit einer Live-Demo.
---

# Begradigen

Ein schräg fotografiertes Dokument sieht wie ein Trapez aus: Die hintere Kante ist kürzer, und der Text kippt. Begradigen macht daraus wieder eine flache, rechteckige Seite, als wäre sie gescannt. Seine Id in der API ist `perspective`.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :tools="['perspective']" />

## So geht’s

1. Drücke Bearbeiten, dann Begradigen. Für jede Ecke erscheint ein Griff.
2. Ziehe jeden Griff auf eine Ecke des Dokuments. Zoome hinein, um sie genau zu platzieren.
3. Drücke Fertig oder `Enter`. Der Viewer zeigt die Seite flach, auf die vier Ecken zugeschnitten.

Die Griffe funktionieren wie bei [Zuschneiden](./crop): eine Lupe auf Touchscreens, Tab und Pfeiltasten auf der Tastatur. Die vier Ecken bilden immer eine konvexe Form, damit sich die Seite immer flach machen lässt.

## Seitenverhältnis

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

Für ein Blatt im Querformat vertausche die Zahlen, etwa `297 / 210`.

## Vom Foto abgeschnittene Ecken

Manchmal liegt eine Ecke des Dokuments außerhalb des Fotos. Die Griffe bleiben im Bild, also setze diesen Griff auf den Rand des Fotos, entlang der Kante des Dokuments, die den Inhalt behält. Die letzten Zeilen kippen leicht, und das geschätzte Seitenverhältnis leidet, was [`aspectRatio`](../../reference/options#aspectratio) beheben kann.

Im [Playground](../../playground) gibt es einen Beispiel-Kassenbon mit abgeschnittener Ecke zum Ausprobieren.

## Aus dem Code

Begradigen öffnet sich mit [`openTool('perspective')`](../../reference/methods#opentool) und schließt sich mit [`confirmTool()`](../../reference/methods#confirmtool) oder [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')

// Später, über eine eigene Schaltfläche
pic.confirmTool()
```
