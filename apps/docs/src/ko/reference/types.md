---
title: 타입
description: PaperPic이 내보내는 모든 TypeScript 타입과 그 정의, 설명하는 페이지, 설치한 패키지에서 가져오는 방법.
---

# 타입

레퍼런스와 예제에는 `ExportedImage`나 `ToolId` 같은 타입이 나옵니다. 이 페이지는 각 타입에 무엇이 들어 있는지 보여 주므로, 직접 작성하는 코드에 타입을 지정할 수 있습니다. 각 타입은 그것을 설명하는 페이지로 연결됩니다.

타입은 설치한 패키지에서 가져옵니다. `@paperpic/vue`와 `@paperpic/react`는 `@paperpic/core`의 모든 타입을 내보내므로 `@paperpic/core`를 설치할 필요가 없습니다.

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

## 옵션

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

생성자와 [`setOptions()`](./methods#setoptions)가 받는 값입니다. Vue와 React에서는 컴포넌트의 props입니다. 각 항목은 [옵션](./options)에서 설명합니다.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

[`src`](./options#src)의 이미지입니다. 같은 출처의 URL이거나, 클라이언트에서 첨부한 `File` 또는 `Blob`입니다. [`PaperPicDownload`](#paperpicdownload)의 `source`도 같은 타입입니다.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

[`output`](./options#output)에서 지정하는 편집된 이미지의 형식입니다.

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

편집 바의 도구입니다. [`tools`](./options#tools), [`openTool()`](./methods#opentool), [상태](./state)의 `activeTool`에서 쓰입니다. 각 도구의 버튼은 [`tools`](./options#tools)에 나와 있습니다.

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

[`labels`](./options#labels)에서 지정하는 인터페이스의 모든 텍스트입니다. 확대/축소 배율처럼 값을 포함하는 텍스트는 함수입니다. 각 텍스트의 영어 문구는 [레이블](./labels)에 있습니다.

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

인터페이스의 모든 아이콘을 요소 하나의 마크업으로 [`icons`](./options#icons)에서 지정합니다. 각 아이콘을 쓰는 버튼도 그곳에 나와 있습니다.

## 상태

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

[`getState()`](./methods#getstate)가 반환하고 [`change`](./events#change) 이벤트가 전달하는 값입니다. 각 필드는 [상태](./state)에서 설명합니다.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

이미지를 뷰어에 맞추는 방식입니다. 전체, 너비, 높이 중 하나입니다. [`fit()`](./methods#fit)이 받고, [상태](./state)의 `fit`에 담깁니다.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

표시된 이미지가 시계 방향으로 회전한 각도이며, [상태](./state)의 `rotation`에 담깁니다.

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

픽셀 단위의 너비와 높이입니다. [상태](./state)의 `image`나 [`load`](./events#load) 이벤트가 전달하는 값 등에서 쓰입니다.

## 이벤트

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

[`on()`](./methods#on)에서 쓰는 각 이벤트와 그 이벤트가 전달하는 값입니다. 각 이벤트는 [이벤트](./events)에서 설명합니다.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

[`apply`](./events#apply) 이벤트가 전달하는 편집된 이미지입니다. `type`은 `blob`의 형식이며, [`output`](./options#output)에서 고릅니다.

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

[`download`](./events#download) 이벤트가 전달하는 값입니다. 다른 방식으로 파일을 저장하려면 `preventDefault()`를 호출하세요.

## 메서드

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

뷰어의 왼쪽 위 모서리에서 잰 CSS 픽셀 단위의 위치이며, [`zoomTo()`](./methods#zoomto)에서 쓰입니다.

## Vue와 React

`@paperpic/vue`와 `@paperpic/react`는 컴포넌트의 타입도 내보냅니다. 사용 방법은 [Vue](./vue)와 [React](./react)를 참고하세요.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

컴포넌트가 제공하는 뷰어입니다. Vue에서는 `instance`, React에서는 `ref`가 받는 값입니다. `@paperpic/core`의 클래스 `PaperPic`이며, 모든 [메서드](./methods)를 가집니다.

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

React에서 컴포넌트의 props입니다. 옵션에 더해 요소의 클래스와 스타일, 각 이벤트의 콜백, `ref`를 가집니다. Vue에서는 props가 [`PaperPicOptions`](#paperpicoptions)와 같은 필드를 가지며, 이벤트는 컴포넌트 이벤트입니다.
