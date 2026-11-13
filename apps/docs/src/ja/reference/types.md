---
title: 型
description: PaperPic がエクスポートするすべての TypeScript の型と、その定義、説明しているページ、インストールしたパッケージからのインポート方法。
---

# 型

リファレンスと例には `ExportedImage` や `ToolId` などの型が登場します。このページでは各型の中身を示すので、自分のコードに型を付けられます。各型から、それを説明するページにリンクしています。

型はインストールしたパッケージからインポートします。`@paperpic/vue` と `@paperpic/react` は `@paperpic/core` のすべての型をエクスポートしているため、`@paperpic/core` をインストールする必要はありません。

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

## オプション

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

コンストラクターと [`setOptions()`](./methods#setoptions) が受け取るもの。Vue と React ではコンポーネントの props です。各項目は[オプション](./options)で説明しています。

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

[`src`](./options#src) の画像。同じオリジンの URL か、クライアントで添付された `File` または `Blob` です。[`PaperPicDownload`](#paperpicdownload) の `source` も同じ型です。

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

[`output`](./options#output) で指定する、編集後の画像の形式。

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

編集バーのツール。[`tools`](./options#tools)、[`openTool()`](./methods#opentool)、[状態](./state)の `activeTool` で使います。各ツールのボタンは [`tools`](./options#tools) にあります。

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

[`labels`](./options#labels) で指定する、インターフェースのすべてのテキスト。ズーム倍率のように値を含むテキストは関数です。各テキストの英語の文言は[ラベル](./labels)にあります。

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

インターフェースのすべてのアイコンを、1 つの要素のマークアップとして [`icons`](./options#icons) で指定します。各アイコンを使うボタンもそこにあります。

## 状態

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

[`getState()`](./methods#getstate) が返し、[`change`](./events#change) イベントが渡すもの。各フィールドは[状態](./state)で説明しています。

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

画像をビューアーに合わせる方法。全体、幅、高さのいずれかです。[`fit()`](./methods#fit) が受け取り、[状態](./state)の `fit` が保持します。

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

表示中の画像の回転角度。時計回りの度数で、[状態](./state)の `rotation` にあります。

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

ピクセル単位の幅と高さ。[状態](./state)の `image` や、[`load`](./events#load) イベントが渡すものなどで使います。

## イベント

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

[`on()`](./methods#on) で使う、各イベントとそれが渡すもの。各イベントは[イベント](./events)で説明しています。

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

[`apply`](./events#apply) イベントが渡す、編集後の画像。`type` は `blob` の形式で、[`output`](./options#output) で選べます。

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

[`download`](./events#download) イベントが渡すもの。別の方法でファイルを保存するには `preventDefault()` を呼び出します。

## メソッド

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

ビューアーの左上隅からの CSS ピクセル単位の位置。[`zoomTo()`](./methods#zoomto) で使います。

## Vue と React

`@paperpic/vue` と `@paperpic/react` は、コンポーネントの型もエクスポートしています。使い方は [Vue](./vue) と [React](./react) を参照してください。

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

コンポーネントが渡すビューアー。Vue では `instance`、React では `ref` が受け取るものです。`@paperpic/core` のクラス `PaperPic` で、すべての[メソッド](./methods)を持ちます。

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

React でのコンポーネントの props。オプションに加えて、要素のクラスとスタイル、各イベントのコールバック、`ref` を持ちます。Vue では、props は [`PaperPicOptions`](#paperpicoptions) と同じフィールドを持ち、イベントはコンポーネントのイベントです。
