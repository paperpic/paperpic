---
title: Gestaltung
description: Wie du PaperPic in das Aussehen deiner App einfügst, mit seinem Stylesheet, seinen CSS-Token, dem Dunkelmodus, eigenen Icons und einer Kaskadenebene, die dein CSS gewinnen lässt.
---

# Gestaltung

PaperPic soll wie ein Teil deiner App aussehen. Es liefert ein einziges Stylesheet, holt seine Farben und Ecken aus wenigen CSS-Token, folgt dem Farbschema deiner Seite und legt seine Regeln in eine Kaskadenebene, sodass dein eigenes CSS immer gewinnt.

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

Die Token werden vererbt, also ändert eine Klasse auf dem Container eines Viewers, oder auf der Vue- oder React-Komponente, nur diesen Viewer:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Die Farben deines Designsystems nutzen {#design-system}

Wenn deine App ihre Farben in CSS-Variablen hält, lass die Token auf diese zeigen, statt ihre Werte zu kopieren. Dann folgt der Viewer deinem Design, samt Dunkelmodus:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Setze sie wie hier auf `.paperpic`. Ein Token, das `var()` nutzt, liest die Variable auf dem Element, auf dem du es setzt. Auf `:root` würde es also ein Design verpassen, das du nur in einem Teil der Seite wechselst.

Jedes Designsystem mit CSS-Variablen funktioniert, etwa die Theme-Variablen von Tailwind CSS 4: `var(--color-blue-600)` oder `var(--radius-md)`.

## Dunkelmodus {#dark-mode}

Die Farben folgen dem `color-scheme` deiner Seite, wie es die Formularelemente des Browsers tun:

- Mit `color-scheme: light dark` werden sie dunkel, wenn das System des Nutzers ein dunkles Farbschema bevorzugt.
- Mit `color-scheme: dark` sind sie immer dunkel. Das funktioniert auch in einem Teil der Seite.
- Ohne `color-scheme` bleiben sie hell, sodass eine Seite ohne dunkles Design einen hellen Viewer behält.

Folgt deine Website dem System, gib das einmal an:

```css
:root {
  color-scheme: light dark;
}
```

Wechselt deine Website das Design mit einer Klasse, etwa auf `<html>`, setze `color-scheme` mit dieser Klasse. Auch die Scrollleisten und Formularelemente des Browsers folgen ihm:

```css
:root.dark {
  color-scheme: dark;
}
```

Um eigene dunkle Farben zu wählen, gib einem Token beide Werte mit `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Token, die auf die Variablen deines [Designsystems](#design-system) zeigen, folgen stattdessen deinem Design.

## Icons {#icons}

Die Option [`icons`](../reference/options#icons) ersetzt beliebige Icons durch dein eigenes Markup, meist ein `<svg>` aus dem Icon-Set deiner App:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- Jeder Schlüssel benennt ein Icon, und manche Icons stehen auf zwei Schaltflächen: `apply` auch auf Fertig, und `cancel` schließt auch Zuschneiden und Begradigen. [Optionen](../reference/options#icons) listet alle Schlüssel.
- PaperPic gibt dem Icon die Klasse `paperpic-icon`, die seine Größe festlegt, und verbirgt es vor Screenreadern, weil die Schaltfläche schon einen Namen hat.
- Zeichne das Icon mit `currentColor`, damit es in jedem Design die Farbe der Schaltfläche annimmt.
- Das Markup kommt als HTML in die Seite, übergib also nur Markup, dem du vertraust.
- Mit Vite liefert `import zoomIn from './zoom-in.svg?raw'` das Markup einer `.svg`-Datei.

Um alle Icons auf einmal zu ändern, etwa ihre Größe oder die Stärke ihrer Linien, gestalte die Klasse:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
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

## Tailwind CSS {#tailwind}

Auch Tailwind CSS 4 legt seine Regeln in Kaskadenebenen. Nenne alle Ebenen der Reihe nach, bevor du Tailwind und PaperPic importierst, damit der Reset von Tailwind vor `paperpic` kommt und seine Utilities danach:

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

Importiere das Stylesheet von PaperPic hier, in deinem CSS, und nicht aus JavaScript. In anderer Reihenfolge entfernt der Reset von Tailwind Innenabstände und Rahmen des Viewers, oder der Viewer überschreibt Utilities wie `h-96` auf der Komponente.

## Klassennamen {#class-names}

Die [CSS-Referenz](../reference/css-tokens#classes) listet die Klassen, die du in Selektoren nutzen kannst, etwa `paperpic-toolbar` und `paperpic-button`, und ihre Namen sind stabil. Andere Klassen halten das Layout zusammen und können sich in jeder Version ändern. Nimm lieber die Token, wenn sie abdecken, was du brauchst.

Jede Schaltfläche, jeder Regler und jeder Eckgriff trägt außerdem `data-paperpic-control`, mit dem Schlüssel seiner [Beschriftung](../reference/labels). Wähle ihn aus, um ein einzelnes Bedienelement zu gestalten:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Anordnung

Die Oberfläche passt sich ihrem Container von selbst an:

- Die Werkzeugleiste sitzt rechts und scrollt, wenn der Viewer zu niedrig für ihre Schaltflächen ist.
- Die Bearbeitungsleiste sitzt unten, in einer Zeile, oder in zwei, wenn der Viewer schmaler als 28rem ist.
- Auf Touchscreens sind Schaltflächen und Eckgriffe mindestens 44 Pixel groß.

## Eigene Bedienelemente

Wenn Gestaltung nicht reicht, blende die Werkzeugleiste und die Bearbeitungsleiste mit `toolbar: false` aus und steuere den Viewer mit eigenen Bedienelementen. [Eigene Werkzeugleiste](../examples/custom-toolbar) zeigt, wie.
