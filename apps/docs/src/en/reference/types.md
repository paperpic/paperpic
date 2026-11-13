---
title: Types
description: Every TypeScript type that PaperPic exports, with its definition, the page that explains it and how to import it from the package you installed.
---

# Types

The reference and the examples name types such as `ExportedImage` or `ToolId`. This page shows what each one holds, so you can type your own code. Each type links to the page that explains it.

Import the types from the package you installed. `@paperpic/vue` and `@paperpic/react` export every type of `@paperpic/core`, so you do not need to install it:

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

## Options

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

What the constructor and [`setOptions()`](./methods#setoptions) take. In Vue and React, these are the props of the component. [Options](./options) explains each one.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

The image in [`src`](./options#src): a URL from the same origin, or a `File` or `Blob` attached on the client. The `source` of [`PaperPicDownload`](#paperpicdownload) has the same type.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

The format of the edited image, in [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

A tool of the edit bar, in [`tools`](./options#tools), [`openTool()`](./methods#opentool) and the `activeTool` of the [state](./state). [`tools`](./options#tools) gives the button of each one.

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

Every text of the interface, in [`labels`](./options#labels). The texts that include a value, such as the zoom level, are functions. [Labels](./labels) gives the English text of each one.

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

Every icon of the interface, as the markup of one element, in [`icons`](./options#icons), which gives the buttons of each one.

## State

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

What [`getState()`](./methods#getstate) returns and the [`change`](./events#change) event carries. [State](./state) explains each field.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

How the image fits the viewer: whole, by its width or by its height. [`fit()`](./methods#fit) takes it, and the `fit` of the [state](./state) holds it.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

How far the image on display is turned, in degrees clockwise, in the `rotation` of the [state](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

A width and a height in pixels, such as the `image` of the [state](./state) or what the [`load`](./events#load) event carries.

## Events

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

Each event with what it carries, for [`on()`](./methods#on). [Events](./events) explains each one.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

The edited image, which the [`apply`](./events#apply) event carries. `type` is the format of `blob`, which [`output`](./options#output) chooses.

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

What the [`download`](./events#download) event carries. Call `preventDefault()` to save the file another way.

## Methods

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

A point in CSS pixels from the top left corner of the viewer, for [`zoomTo()`](./methods#zoomto).

## Vue and React

`@paperpic/vue` and `@paperpic/react` also export the types of their component. [Vue](./vue) and [React](./react) show how to use it.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

The viewer that the component gives you: `instance` in Vue, and what `ref` receives in React. It is the class `PaperPic` of `@paperpic/core`, with every [method](./methods).

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

The props of the component in React: the options, plus the classes and styles of its element, a callback for each event, and `ref`. In Vue, the props have the same fields as [`PaperPicOptions`](#paperpicoptions), and the events are component events.
