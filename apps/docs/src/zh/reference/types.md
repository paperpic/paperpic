---
title: 类型
description: PaperPic 导出的每个 TypeScript 类型，包括其定义、讲解它的页面，以及如何从你安装的包中导入。
---

# 类型

参考和示例中会出现 `ExportedImage`、`ToolId` 等类型。本页展示每个类型包含的内容，方便你为自己的代码添加类型。每个类型都链接到讲解它的页面。

从你安装的包中导入类型。`@paperpic/vue` 和 `@paperpic/react` 导出了 `@paperpic/core` 的所有类型，因此无需安装 `@paperpic/core`：

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

## 选项

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

构造函数和 [`setOptions()`](./methods#setoptions) 接收的内容。在 Vue 和 React 中，它们就是组件的 props。[选项](./options)逐一讲解。

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

[`src`](./options#src) 中的图片：同源的 URL，或在客户端附加的 `File` 或 `Blob`。[`PaperPicDownload`](#paperpicdownload) 的 `source` 也是这个类型。

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

编辑后图片的格式，用于 [`output`](./options#output)。

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

编辑栏中的一个工具，用于 [`tools`](./options#tools)、[`openTool()`](./methods#opentool) 和[状态](./state)的 `activeTool`。[`tools`](./options#tools) 列出了每个工具对应的按钮。

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

界面中的每段文本，用于 [`labels`](./options#labels)。包含数值的文本（如缩放级别）是函数。[标签](./labels)给出了每段文本的英文原文。

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

界面中的每个图标，以单个元素的标记表示，用于 [`icons`](./options#icons)，那里也列出了每个图标所在的按钮。

## 状态

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

[`getState()`](./methods#getstate) 返回、[`change`](./events#change) 事件携带的内容。[状态](./state)讲解了每个字段。

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

图片如何适应查看器：完整显示、按宽度或按高度。[`fit()`](./methods#fit) 接收它，[状态](./state)的 `fit` 保存它。

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

显示的图片顺时针旋转的角度，位于[状态](./state)的 `rotation` 中。

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

以像素为单位的宽度和高度，例如[状态](./state)的 `image`，或 [`load`](./events#load) 事件携带的内容。

## 事件

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

每个事件及其携带的内容，用于 [`on()`](./methods#on)。[事件](./events)逐一讲解。

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

[`apply`](./events#apply) 事件携带的编辑后图片。`type` 是 `blob` 的格式，由 [`output`](./options#output) 选择。

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

[`download`](./events#download) 事件携带的内容。调用 `preventDefault()` 可以用其他方式保存文件。

## 方法

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

从查看器左上角起算的点，以 CSS 像素为单位，用于 [`zoomTo()`](./methods#zoomto)。

## Vue 和 React

`@paperpic/vue` 和 `@paperpic/react` 还导出了各自组件的类型。[Vue](./vue) 和 [React](./react) 介绍了用法。

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

组件提供的查看器：在 Vue 中是 `instance`，在 React 中是 `ref` 接收的值。它就是 `@paperpic/core` 的 `PaperPic` 类，拥有全部[方法](./methods)。

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

React 中组件的 props：除了各个选项，还有其元素的类名和样式、每个事件的回调以及 `ref`。在 Vue 中，props 的字段与 [`PaperPicOptions`](#paperpicoptions) 相同，事件则是组件事件。
