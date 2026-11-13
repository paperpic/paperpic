---
title: Typen
description: Jeder TypeScript-Typ, den PaperPic exportiert, mit seiner Definition, der Seite, die ihn erklärt, und dem Import aus dem Paket, das du installiert hast.
---

# Typen

Die Referenz und die Beispiele nennen Typen wie `ExportedImage` oder `ToolId`. Diese Seite zeigt, was jeder davon enthält, damit du deinen eigenen Code typisieren kannst. Jeder Typ verlinkt auf die Seite, die ihn erklärt.

Importiere die Typen aus dem Paket, das du installiert hast. `@paperpic/vue` und `@paperpic/react` exportieren alle Typen von `@paperpic/core`, du musst es also nicht installieren:

:::tabs key:framework
== JavaScript

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/core'
```

== Vue

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/vue'
```

== React

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/react'
```

:::

## Optionen

### `PaperPicOptions`

```ts
interface PaperPicOptions {
  alt?: string
  aspectRatio?: number
  download?: boolean
  editable?: boolean
  filename?: string
  icons?: Partial<PaperPicIcons>
  labels?: Partial<PaperPicLabels>
  maxOutputSize?: number
  output?: PaperPicOutput
  softness?: number
  src?: PaperPicSource
  toolbar?: boolean
  tools?: readonly ToolId[]
  wheelZoom?: boolean
}
```

Was der Konstruktor und [`setOptions()`](./methods#setoptions) annehmen. In Vue und React sind das die Props der Komponente. [Optionen](./options) erklärt jede einzelne.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

Das Bild in [`src`](./options#src): eine URL vom selben Ursprung oder eine `File` oder ein `Blob`, im Client angehängt. Das `source` von [`PaperPicDownload`](#paperpicdownload) hat denselben Typ.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

Das Format des bearbeiteten Bildes, in [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Ein Werkzeug der Bearbeitungsleiste, in [`tools`](./options#tools), [`openTool()`](./methods#opentool) und im `activeTool` des [Zustands](./state). [`tools`](./options#tools) nennt die Schaltfläche jedes Werkzeugs.

### `PaperPicLabels`

```ts
interface PaperPicLabels {
  adjust: string
  adjustmentLevel: (name: string, value: number) => string
  applied: string
  apply: string
  applyError: string
  brightness: string
  cancel: string
  cancelTool: string
  confirm: string
  contrast: string
  cornerBottomLeft: string
  cornerBottomRight: string
  cornerMoved: (corner: string, x: number, y: number) => string
  cornerSelected: (corner: string) => string
  cornerTopLeft: string
  cornerTopRight: string
  crop: string
  cropHint: string
  discard: string
  discardQuestion: string
  download: string
  edit: string
  editBar: string
  editing: string
  fitHeight: string
  fitWidth: string
  flip: string
  inUse: string
  keepEditing: string
  loadError: string
  loading: string
  perspective: string
  perspectiveHint: string
  processing: string
  redo: string
  rotateLeft: string
  rotateRight: string
  threshold: string
  thresholdLevel: (percent: number) => string
  thresholdSensitivity: string
  toolbar: string
  undo: string
  viewer: string
  zoomIn: string
  zoomLevel: (percent: number) => string
  zoomOut: string
}
```

Jeder Text der Oberfläche, in [`labels`](./options#labels). Die Texte, die einen Wert enthalten, etwa die Zoomstufe, sind Funktionen. [Beschriftungen](./labels) zeigt den englischen Text jedes einzelnen.

### `PaperPicIcons`

```ts
interface PaperPicIcons {
  adjust: string
  apply: string
  brightness: string
  cancel: string
  contrast: string
  crop: string
  download: string
  edit: string
  fitHeight: string
  fitWidth: string
  flip: string
  perspective: string
  redo: string
  rotateDocument: string
  rotateLeft: string
  rotateRight: string
  threshold: string
  undo: string
  zoomIn: string
  zoomOut: string
}
```

Jedes Symbol der Oberfläche, als Markup eines Elements, in [`icons`](./options#icons), wo die Schaltflächen jedes Symbols stehen.

## Zustand

### `PaperPicState`

```ts
interface PaperPicState {
  activeTool: ToolId | null
  adjustments: { brightness: number, contrast: number }
  busy: boolean
  canApply: boolean
  canRedo: boolean
  canUndo: boolean
  fit: Fit | null
  image: Size | null
  mode: 'view' | 'edit'
  rotation: Rotation
  status: 'empty' | 'loading' | 'ready' | 'error'
  threshold: { enabled: boolean, sensitivity: number }
  zoom: number
}
```

Was [`getState()`](./methods#getstate) zurückgibt und das Ereignis [`change`](./events#change) mitliefert. [Zustand](./state) erklärt jedes Feld.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Wie das Bild in den Viewer passt: ganz, nach seiner Breite oder nach seiner Höhe. [`fit()`](./methods#fit) nimmt es an, und das `fit` des [Zustands](./state) enthält es.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

Wie weit das angezeigte Bild gedreht ist, in Grad im Uhrzeigersinn, im `rotation` des [Zustands](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Eine Breite und eine Höhe in Pixeln, etwa das `image` des [Zustands](./state) oder was das Ereignis [`load`](./events#load) mitliefert.

## Ereignisse

### `PaperPicEvents`

```ts
interface PaperPicEvents {
  apply: ExportedImage
  change: PaperPicState
  download: PaperPicDownload
  error: { error: Error }
  load: Size
}
```

Jedes Ereignis mit dem, was es mitliefert, für [`on()`](./methods#on). [Ereignisse](./events) erklärt jedes einzelne.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

Das bearbeitete Bild, das das Ereignis [`apply`](./events#apply) mitliefert. `type` ist das Format von `blob`, das [`output`](./options#output) wählt.

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

Was das Ereignis [`download`](./events#download) mitliefert. Rufe `preventDefault()` auf, um die Datei auf andere Weise zu speichern.

## Methoden

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Ein Punkt in CSS-Pixeln ab der oberen linken Ecke des Viewers, für [`zoomTo()`](./methods#zoomto).

## Vue und React

`@paperpic/vue` und `@paperpic/react` exportieren außerdem die Typen ihrer Komponente. [Vue](./vue) und [React](./react) zeigen, wie du sie verwendest.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

Der Viewer, den dir die Komponente gibt: `instance` in Vue und das, was `ref` in React erhält. Er ist die Klasse `PaperPic` von `@paperpic/core`, mit allen [Methoden](./methods).

### `PaperPicProps`

```ts
interface PaperPicProps extends PaperPicOptions {
  className?: string
  onApply?: (result: PaperPicEvents['apply']) => void
  onChange?: (state: PaperPicEvents['change']) => void
  onDownload?: (download: PaperPicEvents['download']) => void
  onError?: (failure: PaperPicEvents['error']) => void
  onLoad?: (size: PaperPicEvents['load']) => void
  ref?: Ref<PaperPicInstance>
  style?: CSSProperties
}
```

Die Props der Komponente in React: die Optionen, dazu die Klassen und Stile ihres Elements, ein Callback für jedes Ereignis und `ref`. In Vue haben die Props dieselben Felder wie [`PaperPicOptions`](#paperpicoptions), und die Ereignisse sind Komponentenereignisse.
