---
title: Tipos
description: Cada tipo TypeScript que o PaperPic exporta, com sua definição, a página que o explica e como importá-lo do pacote que você instalou.
---

# Tipos

A referência e os exemplos citam tipos como `ExportedImage` ou `ToolId`. Esta página mostra o que cada um contém, para que você possa tipar o seu próprio código. Cada tipo tem um link para a página que o explica.

Importe os tipos do pacote que você instalou. `@paperpic/vue` e `@paperpic/react` exportam todos os tipos de `@paperpic/core`, então não é preciso instalá-lo:

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

## Opções

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

O que o construtor e [`setOptions()`](./methods#setoptions) recebem. No Vue e no React, são as props do componente. [Opções](./options) explica cada uma.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

A imagem em [`src`](./options#src): uma URL da mesma origem, ou um `File` ou `Blob` anexado no cliente. O `source` de [`PaperPicDownload`](#paperpicdownload) tem o mesmo tipo.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

O formato da imagem editada, em [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Uma ferramenta da barra de edição, em [`tools`](./options#tools), [`openTool()`](./methods#opentool) e no `activeTool` do [estado](./state). [`tools`](./options#tools) indica o botão de cada uma.

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

Cada texto da interface, em [`labels`](./options#labels). Os textos que incluem um valor, como o nível de zoom, são funções. [Rótulos](./labels) mostra o texto em inglês de cada um.

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

Cada ícone da interface, como a marcação de um elemento, em [`icons`](./options#icons), que indica os botões de cada um.

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

O que [`getState()`](./methods#getstate) retorna e o evento [`change`](./events#change) leva. [Estado](./state) explica cada campo.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Como a imagem se ajusta ao visualizador: inteira, pela largura ou pela altura. [`fit()`](./methods#fit) o recebe, e o `fit` do [estado](./state) o guarda.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

Quanto a imagem exibida está girada, em graus no sentido horário, no `rotation` do [estado](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Uma largura e uma altura em pixels, como o `image` do [estado](./state) ou o que o evento [`load`](./events#load) leva.

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

Cada evento com o que ele leva, para [`on()`](./methods#on). [Eventos](./events) explica cada um.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

A imagem editada, que o evento [`apply`](./events#apply) leva. `type` é o formato de `blob`, que [`output`](./options#output) escolhe.

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

O que o evento [`download`](./events#download) leva. Chame `preventDefault()` para salvar o arquivo de outra forma.

## Métodos

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Um ponto em pixels CSS a partir do canto superior esquerdo do visualizador, para [`zoomTo()`](./methods#zoomto).

## Vue e React

`@paperpic/vue` e `@paperpic/react` também exportam os tipos do seu componente. [Vue](./vue) e [React](./react) mostram como usá-lo.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

O visualizador que o componente entrega: `instance` no Vue, e o que `ref` recebe no React. É a classe `PaperPic` de `@paperpic/core`, com todos os [métodos](./methods).

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

As props do componente no React: as opções, mais as classes e os estilos do seu elemento, um callback para cada evento e `ref`. No Vue, as props têm os mesmos campos que [`PaperPicOptions`](#paperpicoptions), e os eventos são eventos do componente.
