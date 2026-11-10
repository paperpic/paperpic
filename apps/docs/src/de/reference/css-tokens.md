---
title: CSS-Token
description: Die CSS-Custom-Properties, mit denen du PaperPic gestaltest, mit ihren hellen und dunklen Standardwerten, dazu sein Stylesheet, seine Kaskadenebene und seine Klassennamen.
---

# CSS-Token

Die Token sind CSS-Custom-Properties, die das Aussehen der Komponente ändern, ohne ihre Regeln zu überschreiben. Setze sie auf `:root`, auf einem Vorfahren des Viewers oder auf `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Standard  | Dunkel    | Beschreibung                       |
| -------------------------------- | --------- | --------- | ---------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Hintergrund der Oberfläche         |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Text der Oberfläche                |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Akzentfarbe der Oberfläche         |
| `--paperpic-radius`              | `6px`     | `6px`     | Eckenradius der Oberfläche         |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Dauer der Übergänge der Oberfläche |

## Dunkelmodus

Die dunklen Werte gelten, wenn das System des Nutzers ein dunkles Farbschema bevorzugt. Wechselt deine Website das Design auf andere Weise, etwa mit einer Klasse auf `<html>`, setze die Farben jedes Designs selbst:

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

## Stylesheet

Jedes Paket liefert ein Stylesheet. Importiere es einmal in deiner App:

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

Seine Regeln liegen in der Kaskadenebene `paperpic`, also überschreibt jedes CSS von dir außerhalb einer Ebene sie, egal wie spezifisch es ist. Das gilt auch für globale Resets, etwa eine Regel für `button`.

## Klassennamen

`.paperpic` ist die Wurzel des Viewers, und `.paperpic-host` ist das Element, das die Vue- und React-Komponenten um ihn herum erzeugen. Alle Klassen der Komponente beginnen mit `paperpic`, und ihre Namen sind stabil. Nimm lieber die Token, wenn sie abdecken, was du brauchst.
