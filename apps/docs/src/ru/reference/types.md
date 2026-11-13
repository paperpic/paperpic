---
title: Типы
description: Все типы TypeScript, которые экспортирует PaperPic, с их определениями, страницами с пояснениями и способом импорта из установленного пакета.
---

# Типы

В справочнике и примерах встречаются типы вроде `ExportedImage` или `ToolId`. На этой странице показано, что содержит каждый из них, чтобы вы могли типизировать свой код. Каждый тип ссылается на страницу, где он описан.

Импортируйте типы из установленного пакета. `@paperpic/vue` и `@paperpic/react` экспортируют все типы `@paperpic/core`, так что устанавливать его не нужно:

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

## Опции

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

То, что принимают конструктор и [`setOptions()`](./methods#setoptions). Во Vue и React это пропсы компонента. Каждая из них описана в разделе [Опции](./options).

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

Изображение в [`src`](./options#src): URL с того же источника или `File` либо `Blob`, прикреплённый на клиенте. У `source` в [`PaperPicDownload`](#paperpicdownload) тот же тип.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

Формат отредактированного изображения в [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Инструмент панели редактирования в [`tools`](./options#tools), [`openTool()`](./methods#opentool) и в `activeTool` [состояния](./state). В [`tools`](./options#tools) указана кнопка каждого из них.

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

Все тексты интерфейса в [`labels`](./options#labels). Тексты со значением, например уровень масштаба, — это функции. Английский текст каждого из них приведён в разделе [Подписи](./labels).

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

Все значки интерфейса в виде разметки одного элемента в [`icons`](./options#icons), где указаны кнопки каждого из них.

## Состояние

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

То, что возвращает [`getState()`](./methods#getstate) и передаёт событие [`change`](./events#change). Каждое поле описано в разделе [Состояние](./state).

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Как изображение вписывается в просмотрщик: целиком, по ширине или по высоте. Его принимает [`fit()`](./methods#fit), а хранит `fit` [состояния](./state).

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

На сколько повёрнуто показанное изображение, в градусах по часовой стрелке, в `rotation` [состояния](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Ширина и высота в пикселях, например `image` [состояния](./state) или то, что передаёт событие [`load`](./events#load).

## События

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

Каждое событие и то, что оно передаёт, для [`on()`](./methods#on). Каждое из них описано в разделе [События](./events).

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

Отредактированное изображение, которое передаёт событие [`apply`](./events#apply). `type` — формат `blob`, который выбирает [`output`](./options#output).

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

То, что передаёт событие [`download`](./events#download). Вызовите `preventDefault()`, чтобы сохранить файл иначе.

## Методы

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Точка в CSS-пикселях от левого верхнего угла просмотрщика для [`zoomTo()`](./methods#zoomto).

## Vue и React

`@paperpic/vue` и `@paperpic/react` также экспортируют типы своего компонента. Как их использовать, показано на страницах [Vue](./vue) и [React](./react).

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

Просмотрщик, который даёт компонент: `instance` во Vue и то, что получает `ref` в React. Это класс `PaperPic` из `@paperpic/core` со всеми [методами](./methods).

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

Пропсы компонента в React: опции, а также классы и стили его элемента, колбэк для каждого события и `ref`. Во Vue у пропсов те же поля, что у [`PaperPicOptions`](#paperpicoptions), а события — это события компонента.
