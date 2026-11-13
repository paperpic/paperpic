---
title: Tipos
description: Cada tipo de TypeScript que exporta PaperPic, con su definición, la página que lo explica y cómo importarlo del paquete que instalaste.
---

# Tipos

La referencia y los ejemplos nombran tipos como `ExportedImage` o `ToolId`. Esta página muestra qué contiene cada uno, para que puedas tipar tu propio código. Cada tipo enlaza a la página que lo explica.

Importa los tipos del paquete que instalaste. `@paperpic/vue` y `@paperpic/react` exportan todos los tipos de `@paperpic/core`, así que no hace falta instalarlo:

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

## Opciones

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

Lo que reciben el constructor y [`setOptions()`](./methods#setoptions). En Vue y React, son las props del componente. [Opciones](./options) explica cada una.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

La imagen de [`src`](./options#src): una URL del mismo origen, o un `File` o `Blob` adjuntado en el cliente. El `source` de [`PaperPicDownload`](#paperpicdownload) tiene el mismo tipo.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

El formato de la imagen editada, en [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Una herramienta de la barra de edición, en [`tools`](./options#tools), [`openTool()`](./methods#opentool) y el `activeTool` del [estado](./state). [`tools`](./options#tools) indica el botón de cada una.

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

Cada texto de la interfaz, en [`labels`](./options#labels). Los textos que incluyen un valor, como el nivel de zoom, son funciones. [Textos de la interfaz](./labels) da el texto en inglés de cada uno.

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

Cada icono de la interfaz, como el marcado de un elemento, en [`icons`](./options#icons), que indica los botones de cada uno.

## Estado

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

Lo que devuelve [`getState()`](./methods#getstate) y lleva el evento [`change`](./events#change). [Estado](./state) explica cada campo.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Cómo se ajusta la imagen al visor: entera, por su ancho o por su alto. Lo recibe [`fit()`](./methods#fit), y lo guarda el `fit` del [estado](./state).

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

Cuánto está girada la imagen en pantalla, en grados en el sentido de las agujas del reloj, en el `rotation` del [estado](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Un ancho y un alto en píxeles, como el `image` del [estado](./state) o lo que lleva el evento [`load`](./events#load).

## Eventos

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

Cada evento con lo que lleva, para [`on()`](./methods#on). [Eventos](./events) explica cada uno.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

La imagen editada, que lleva el evento [`apply`](./events#apply). `type` es el formato de `blob`, que elige [`output`](./options#output).

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

Lo que lleva el evento [`download`](./events#download). Llama a `preventDefault()` para guardar el archivo de otra forma.

## Métodos

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Un punto en píxeles CSS desde la esquina superior izquierda del visor, para [`zoomTo()`](./methods#zoomto).

## Vue y React

`@paperpic/vue` y `@paperpic/react` también exportan los tipos de su componente. [Vue](./vue) y [React](./react) muestran cómo usarlo.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

El visor que te da el componente: `instance` en Vue, y lo que recibe `ref` en React. Es la clase `PaperPic` de `@paperpic/core`, con todos los [métodos](./methods).

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

Las props del componente en React: las opciones, más las clases y los estilos de su elemento, un callback por cada evento y `ref`. En Vue, las props tienen los mismos campos que [`PaperPicOptions`](#paperpicoptions), y los eventos son eventos del componente.
