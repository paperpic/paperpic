---
title: CSS-Token
description: Die CSS Custom Properties, die PaperPic gestalten, mit ihren hellen und dunklen Werten, dazu sein Stylesheet, seine Kaskadenebene, seine öffentlichen Klassen und die Namen seiner Bedienelemente.
---

# CSS-Token

Die Token sind CSS Custom Properties, die das Aussehen der Komponente ändern, ohne ihre Regeln zu überschreiben. Setze sie auf `:root`, auf einem Vorfahren des Viewers oder auf `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Hell      | Dunkel    | Beschreibung                       |
| -------------------------------- | --------- | --------- | ---------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Akzentfarbe der Oberfläche         |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Hintergrund der Oberfläche         |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Text der Oberfläche                |
| `--paperpic-radius`              | `6px`     | `6px`     | Eckenradius der Oberfläche         |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Dauer der Übergänge der Oberfläche |

## Dunkelmodus

Die Farb-Token nehmen ihren hellen oder dunklen Wert mit `light-dark()`, nach dem `color-scheme` der Seite. Ohne `color-scheme` sind sie hell. Mit `color-scheme: dark` sind sie dunkel, und mit `color-scheme: light dark` sind sie dunkel, wenn das System ein dunkles Farbschema bevorzugt. [Gestaltung](../guide/styling#dark-mode) zeigt, wie du es setzt.

Um beide Werte eines Tokens zu wählen, nutze ebenfalls `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
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

Seine Regeln liegen in der Kaskadenebene `paperpic`, also überschreibt jedes CSS von dir außerhalb einer Ebene sie, egal wie spezifisch es ist. Das gilt auch für globale Resets, etwa eine Regel für `button`. Mit Tailwind CSS nennst du die Reihenfolge der Ebenen, wie [Gestaltung](../guide/styling#tailwind) zeigt.

## Klassen {#classes}

Diese Klassen sind öffentlich: Ihre Namen, und die Elemente, die sie markieren, bleiben zwischen Versionen stabil. Die anderen Klassen der Komponente halten ihr Layout zusammen und können sich in jeder Version ändern.

| Klasse                    | Element                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `paperpic`                | Die Wurzel des Viewers                                                                                                              |
| `paperpic-button`         | Jede Schaltfläche der Werkzeugleiste und der Bearbeitungsleiste                                                                     |
| `paperpic-button-danger`  | Verwerfen, in der Frage vor dem Verwerfen der Änderungen                                                                            |
| `paperpic-button-primary` | Übernehmen, und Fertig in Zuschneiden und Begradigen                                                                                |
| `paperpic-button-text`    | Die Schaltflächen der Frage vor dem Verwerfen der Änderungen                                                                        |
| `paperpic-edit-bar`       | Die Bearbeitungsleiste unten                                                                                                        |
| `paperpic-editing`        | Die Wurzel, während der Bearbeitung                                                                                                 |
| `paperpic-handle`         | Ein Eckgriff von Zuschneiden und Begradigen                                                                                         |
| `paperpic-host`           | Das Element, das die Vue- und React-Komponenten um den Viewer herum erzeugen                                                        |
| `paperpic-icon`           | Das Icon einer Schaltfläche                                                                                                         |
| `paperpic-status`         | Die Meldung für Screenreader, die auch erscheint, während das Bild lädt oder die Änderungen übernommen werden, und bei einem Fehler |
| `paperpic-status-visible` | Die Meldung, solange sie in der Mitte des Viewers erscheint                                                                         |
| `paperpic-toolbar`        | Die Werkzeugleiste rechts                                                                                                           |
| `paperpic-viewport`       | Der Bereich, der das Bild zeigt und den Tastaturfokus erhält                                                                        |

Schaltflächen zeigen ihren Zustand mit ARIA-Attributen, die du ebenfalls auswählen kannst:

| Attribut                 | Zustand                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | Die Schaltfläche kann gerade nicht handeln. Sie behält den Tastaturfokus, deshalb ist sie nicht `disabled`          |
| `[aria-expanded='true']` | Anpassen, solange seine Regler zu sehen sind                                                                        |
| `[aria-pressed='true']`  | Eine eingeschaltete Schaltfläche, etwa Bereinigen, oder An Breite anpassen und An Höhe anpassen, solange sie gelten |

Hover und diese Zustände werden mit `box-shadow` gezeichnet, das globale Resets von Schaltflächen nicht anfassen. Um sie umzugestalten, überschreibe auch `box-shadow`.

## Bedienelemente {#controls}

Jede Schaltfläche, jeder Regler und jeder Eckgriff trägt `data-paperpic-control`, mit dem Schlüssel seiner [Beschriftung](./labels). Wähle ihn aus, um ein einzelnes Bedienelement zu gestalten:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Ort                        | Werte                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Werkzeugleiste             | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| Bearbeitungsleiste         | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| Regler                     | `thresholdSensitivity`, `brightness`, `contrast`                                                      |
| Zuschneiden und Begradigen | `cancelTool`, `confirm`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`   |
| Frage vor dem Verwerfen    | `keepEditing`, `discard`                                                                              |

`rotateLeft` benennt zwei Schaltflächen, die nie gleichzeitig erscheinen: die eines schreibgeschützten Viewers, die die Anzeige dreht, und die der Bearbeitungsleiste, die das Bild dreht.
