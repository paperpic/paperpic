---
title: 方法
description: PaperPic 类的所有方法，用于在代码中控制查看器，例如缩放、适合、旋转、编辑、应用、下载和重新加载。
---

# 方法

方法让你在代码中控制查看器，例如配合 [`toolbar: false`](./options#toolbar) 从你自己的按钮调用。使用 core 时，在你创建的 `PaperPic` 上调用它们。在 Vue 中，组件把查看器暴露为 `instance`；在 React 中，由 `ref` 接收它。组件挂载之前，两者都为 `null`：

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    放大
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>放大</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

在 Vue 和 React 中，组件负责创建和销毁查看器，并以 props 接收选项、以自己的事件提供事件。所以在那里不要调用 [`new PaperPic()`](#new-paperpic)、[`destroy()`](#destroy)、[`setOptions()`](#setoptions) 或 [`on()`](#on)。

## 创建与销毁

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

在 `container` 中创建查看器并填满它。请给容器设置高度，否则查看器会停留在最小高度。`options` 接受的内容见[选项](./options)。

如果 `container` 不是元素，会抛出 `TypeError`。请在元素存在之后创建查看器，例如在挂载时。如果某个选项超出范围，会抛出 `RangeError`。

仅用于 core：Vue 和 React 组件在挂载时创建查看器。

### `destroy()`

```ts
function destroy(): void
```

移除查看器并释放它占用的一切，例如 worker 和图片的内存。调用两次也没有问题。

仅用于 core：Vue 和 React 组件在卸载时调用它。在它们的查看器上调用，会让组件变空。

## 选项与状态

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

修改你传入的选项，保留其他选项。传入 `undefined` 会让选项恢复默认值。它从不触发 `change`，因此双向绑定不会循环。如果某个选项超出范围，会抛出 `RangeError`，此时不会修改任何选项。

在 Vue 和 React 中，请改为修改 props。任何 prop 下次变化时都会重新发送所有选项，从而撤销用 `setOptions()` 做的修改。

### `getState()`

```ts
function getState(): PaperPicState
```

返回查看器的当前状态，例如缩放、模式以及是否有可应用的修改。要在每次变化时得到通知而不必询问，请监听 [`change`](./events#change)。每个字段以及两者如何配合见[状态](./state)。

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

监听一个事件，并返回一个停止监听的函数。每个事件见[事件](./events)。

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

在 Vue 和 React 中，请改为监听组件的事件，例如 `@apply` 或 `onApply`。

## 查看

### `zoomIn()`

```ts
function zoomIn(): void
```

以查看器中心为基准放大一级。

### `zoomOut()`

```ts
function zoomOut(): void
```

以查看器中心为基准缩小一级。

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

设置缩放，`1` 表示一个图片像素对应一个屏幕像素。[`point`](./types#viewpoint) 保持在原位：它以 CSS 像素表示，从查看器左上角算起，默认是查看器中心。

缩放范围从适合整张图片的缩放（若它大于 `1` 则为 `1`）到 `8`。超出范围的值会被限制在范围内。

如果 `zoom` 是 `NaN`，或 `point` 的某个坐标不是有限数，会抛出 `RangeError`，此时缩放不会改变。

### `fit()`

```ts
function fit(fit: Fit): void
```

让整张图片、图片宽度或图片高度适合查看器。`fit` 的类型是 [`Fit`](./types#fit)，取值为 `'image'`、`'width'` 或 `'height'`。

## 编辑

### `edit()`

```ts
function edit(): void
```

开始编辑。如果图片尚未就绪，或 [`editable`](./options#editable) 为 `false`，则什么也不做。

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

将图片旋转四分之一圈：默认的 `1` 为顺时针，`-1` 为逆时针。编辑时，它会添加一项由 [`apply()`](#apply) 确定的修改；有工具打开或正在应用时，它什么也不做。在只读查看器中，它只改变显示。其他情况下什么也不做。

### `flip()`

```ts
function flip(): void
```

按显示的样子将图片左右翻转，因此旋转四分之一圈之后仍是左右翻转。要上下镜像图片，先翻转再旋转两次。这是一项修改，在编辑模式之外或有工具打开时什么也不做。

### `openTool()`

```ts
function openTool(id: ToolId): void
```

打开带面板的工具：裁剪（`'crop'`）、矫正（`'perspective'`）、调整（`'adjust'`）或清理（`'finish'`）。当效果为原图时，清理在打开时会选择黑白。工具会一直打开，直到 [`confirmTool()`](#confirmtool) 或 [`cancelTool()`](#canceltool)。在此期间，不能开始其他修改，撤销、重做和应用也都不起作用。在编辑模式之外、有其他工具打开时、黑白模式下的调整，以及预览准备期间的裁剪和矫正，什么也不做。矫正在打开时会寻找文档，[找到后](../guide/tools/straighten#finding-the-document)把四个角放到文档上。

“遮盖”（`'redact'`）也像“裁剪”一样带着角点打开。

### `confirmTool()`

```ts
function confirmTool(): void
```

关闭打开的工具，并把其中的选择加入修改，与 `Enter` 相同：裁剪或矫正的选区，或者调整或清理的设置，作为一项修改。在“矫正”中，查看器找到文档或某个角被移动之前，它不做任何事，[状态](./state)的 `canConfirm` 会说明何时可以。

### `cancelTool()`

```ts
function cancelTool(): void
```

关闭打开的工具，并放弃它的修改，与 `Esc` 相同。

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

选择[清理](../guide/tools/clean-up)的效果：`'original'`、`'gray'` 或表示黑白的 `'mono'`。它也修改黑白的灵敏度，范围 0 到 1。效果总是在其他修改之后进行。清理打开时，它会改变清理显示的内容，[`confirmTool()`](#confirmtool) 会把它作为一项修改保留。在编辑模式之外或有其他工具打开时什么也不做。

如果 `mode` 不是 [`FinishMode`](./types#finishmode)，或 `sensitivity` 不在 0 到 1 之间，会抛出 `RangeError`。

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

修改亮度或对比度，各自范围为 -1 到 1，0 表示保持原样。它们在其他修改之后、灰度之前进行。调整打开时，它会改变调整显示的值，[`confirmTool()`](#confirmtool) 会把它作为一项修改保留。在编辑模式之外、有其他工具打开时或黑白模式下什么也不做：黑白会把每个像素与周围比较，所以亮度和对比度几乎不会改变它的结果。

如果某个值不在 -1 到 1 之间，会抛出 `RangeError`。

### `setPaper()`

```ts
function setPaper(setting: { size?: PaperSize }): void
```

选择为[矫正](../guide/tools/straighten#paper-size)的结果提供宽高比的纸张：`'a4'`、`'letter'`、用于身份证或银行卡的 `'card'`，或默认的 `'auto'`，它采用 [`aspectRatio`](./options#aspectratio)，没有时则估算。纵向还是横向由四个角决定。“矫正”未打开时它不做任何事，每次打开都从 `'auto'` 开始。

如果 `size` 不是 [`PaperSize`](./types#papersize)，会抛出 `RangeError`。

### `setRedaction()`

```ts
function setRedaction(setting: { color?: RedactColor }): void
```

选择[遮盖](../guide/tools/redact)使用的颜色：默认的 `'black'` 或 `'white'`。“遮盖”打开时，它会改变显示中的区域，[`confirmTool()`](#confirmtool) 会保留它。否则它是下一个区域的颜色。在任何模式下都有效。

如果 `color` 不是 [`RedactColor`](./types#redactcolor)，会抛出 `RangeError`。

### `undo()`

```ts
function undo(): void
```

撤销上一次修改。在编辑模式之外、有工具打开时或正在应用时，什么也不做。

### `redo()`

```ts
function redo(): void
```

恢复上一次撤销的修改。在编辑模式之外、有工具打开时或正在应用时，什么也不做。

### `apply()`

```ts
function apply(): Promise<void>
```

以完整分辨率或 [`maxOutputSize`](./options#maxoutputsize) 应用修改。结果成为显示的图片，历史记录清空，查看器回到查看模式，[`apply`](./events#apply) 事件携带结果。应用无法中断，运行期间会锁定控件。在编辑模式之外、有工具打开时或没有可应用的内容时，什么也不做。

如果失败，[`error`](./events#error) 事件会报告，编辑保持打开。应用结束时 promise 都会兑现，失败时也一样：请监听 `error`，因为 `try/catch` 捕获不到它。

### `cancel()`

```ts
function cancel(): void
```

放弃修改并回到查看模式。它不会询问：询问的是内置的“取消”按钮和 `Esc`。正在应用时什么也不做。

## 图片

### `download()`

```ts
function download(): void
```

将显示的图片保存为文件：上一次应用的结果，没有则是原图。即使没有只负责显示按钮的 [`download`](./options#download) 选项，它也能工作。[`download`](./events#download) 事件会先触发，并可以阻止保存。编辑时什么也不做，因为修改尚未应用。在第一次应用之前，来自其他源的 `src` 会在浏览器中打开：参见[保存结果](../guide/saving#download)。

### `reload()`

```ts
function reload(): void
```

重新加载当前的 [`src`](./options#src)，可在应用之后恢复原图。编辑时会放弃修改。没有 `src` 时什么也不做。
