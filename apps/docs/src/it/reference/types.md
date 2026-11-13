---
title: Tipi
description: Ogni tipo TypeScript esportato da PaperPic, con la sua definizione, la pagina che lo spiega e come importarlo dal pacchetto che hai installato.
---

# Tipi

Il riferimento e gli esempi nominano tipi come `ExportedImage` o `ToolId`. Questa pagina mostra cosa contiene ciascuno, così puoi tipizzare il tuo codice. Ogni tipo rimanda alla pagina che lo spiega.

Importa i tipi dal pacchetto che hai installato. `@paperpic/vue` e `@paperpic/react` esportano tutti i tipi di `@paperpic/core`, quindi non devi installarlo:

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

## Opzioni

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

Ciò che ricevono il costruttore e [`setOptions()`](./methods#setoptions). In Vue e React, sono le props del componente. [Opzioni](./options) spiega ciascuna.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

L’immagine di [`src`](./options#src): un URL della stessa origine, oppure un `File` o un `Blob` allegato nel client. Il `source` di [`PaperPicDownload`](#paperpicdownload) ha lo stesso tipo.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

Il formato dell’immagine modificata, in [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Uno strumento della barra di modifica, in [`tools`](./options#tools), [`openTool()`](./methods#opentool) e nell’`activeTool` dello [stato](./state). [`tools`](./options#tools) indica il pulsante di ciascuno.

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

Ogni testo dell’interfaccia, in [`labels`](./options#labels). I testi che includono un valore, come il livello di zoom, sono funzioni. [Etichette](./labels) dà il testo inglese di ciascuno.

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

Ogni icona dell’interfaccia, come markup di un elemento, in [`icons`](./options#icons), che indica i pulsanti di ciascuna.

## Stato

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

Ciò che restituisce [`getState()`](./methods#getstate) e che porta l’evento [`change`](./events#change). [Stato](./state) spiega ogni campo.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Come l’immagine si adatta al visualizzatore: intera, alla sua larghezza o alla sua altezza. [`fit()`](./methods#fit) lo riceve, e il `fit` dello [stato](./state) lo contiene.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

Di quanto è ruotata l’immagine visualizzata, in gradi in senso orario, nel `rotation` dello [stato](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Una larghezza e un’altezza in pixel, come l’`image` dello [stato](./state) o ciò che porta l’evento [`load`](./events#load).

## Eventi

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

Ogni evento con ciò che porta, per [`on()`](./methods#on). [Eventi](./events) spiega ciascuno.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

L’immagine modificata, che porta l’evento [`apply`](./events#apply). `type` è il formato di `blob`, che sceglie [`output`](./options#output).

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

Ciò che porta l’evento [`download`](./events#download). Chiama `preventDefault()` per salvare il file in un altro modo.

## Metodi

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Un punto in pixel CSS dall’angolo in alto a sinistra del visualizzatore, per [`zoomTo()`](./methods#zoomto).

## Vue e React

`@paperpic/vue` e `@paperpic/react` esportano anche i tipi del loro componente. [Vue](./vue) e [React](./react) mostrano come usarlo.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

Il visualizzatore che ti dà il componente: `instance` in Vue, e ciò che riceve `ref` in React. È la classe `PaperPic` di `@paperpic/core`, con tutti i [metodi](./methods).

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

Le props del componente in React: le opzioni, più le classi e gli stili del suo elemento, una callback per ogni evento e `ref`. In Vue, le props hanno gli stessi campi di [`PaperPicOptions`](#paperpicoptions), e gli eventi sono eventi del componente.
