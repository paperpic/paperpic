---
title: Gestaltung
description: Wie du PaperPic an das Aussehen deiner App anpasst, mit seinem Stylesheet, seinen CSS-Token, dem Dunkelmodus und einer Kaskadenebene, die dein CSS gewinnen lässt.
---

# Gestaltung

PaperPic soll wie ein Teil deiner App aussehen. Es liefert ein einziges Stylesheet, holt seine Farben und Ecken aus wenigen CSS-Token und legt seine Regeln in eine Kaskadenebene, sodass dein eigenes CSS immer gewinnt.

## Das Stylesheet importieren

Importiere es einmal in deiner App:

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

## Eine Größe geben

Der Viewer füllt seinen Container aus und hat keine eigene Höhe, also braucht der Container eine. Jedes CSS, das ihm eine Höhe gibt, funktioniert:

```css
.document-viewer {
  height: 70dvh;
}
```

Der Viewer folgt der Größe seines Containers, nicht der des Bildschirms. Er reagiert, wenn sich der Container ändert, etwa wenn sich eine Seitenleiste öffnet.

## Farben und Ecken

Fünf [CSS-Token](../reference/css-tokens) legen Hintergrund, Text, Akzentfarbe, Eckenradius und Dauer der Übergänge fest. Setze sie auf `:root`, auf einem Vorfahren des Viewers oder auf `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

## Dunkelmodus {#dark-mode}

Die Farben wechseln zu dunklen, wenn das System des Nutzers ein dunkles Farbschema bevorzugt. Wechselt deine Website das Design auf andere Weise, etwa mit einer Klasse auf `<html>`, setze die Farben jedes Designs selbst:

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
}
```

## Dein CSS gewinnt

Die Regeln von PaperPic liegen in der Kaskadenebene `paperpic`, und jedes CSS außerhalb einer Ebene überschreibt sie, egal wie spezifisch es ist. Das macht Anpassungen leicht, aber ein globaler Reset außerhalb einer Ebene, etwa eine Regel für `button`, trifft auch die Schaltflächen des Viewers.

Wenn dein Reset den Viewer stört, verschiebe ihn in eine Ebene vor `paperpic`. Die erste Anweisung, die die Ebenen nennt, legt ihre Reihenfolge fest, also setze sie in CSS, das vor dem Stylesheet von PaperPic lädt:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Anordnung

Die Oberfläche passt sich ihrem Container von selbst an:

- Die Werkzeugleiste sitzt rechts und scrollt, wenn der Viewer zu niedrig für ihre Schaltflächen ist.
- Die Bearbeitungsleiste sitzt unten, in einer Zeile, oder in zwei, wenn der Viewer schmaler als 28rem ist.
- Auf Touchscreens sind Schaltflächen und Eckgriffe mindestens 44 Pixel groß.

## Klassennamen

Alle Klassen der Komponente beginnen mit `paperpic`, und ihre Namen sind stabil, du kannst sie also in Selektoren nutzen. Nimm lieber die Token, wenn sie abdecken, was du brauchst, weil sie weiter funktionieren, wenn sich die innere Struktur ändert.
