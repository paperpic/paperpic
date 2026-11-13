---
title: 方法
description: PaperPic 类的所有方法，用于在代码中控制查看器，例如缩放、适合、旋转、编辑、应用、下载和重新加载。
---

# 方法

方法让你在代码中控制查看器，例如配合 [`toolbar: false`](./options#toolbar) 从你自己的按钮调用。在 Vue 和 React 中，组件的 ref 会给你查看器：参见 [Vue](./vue) 和 [React](./react)。

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## 创建与销毁

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

在 `container` 中创建查看器并填满它。请给容器设置高度，否则查看器会停留在最小高度。`options` 接受的内容见[选项](./options)。

如果 `container` 不是元素，会抛出 `TypeError`。请在元素存在之后创建查看器，例如在挂载时。

### `destroy()`

```ts
function destroy(): void
```

移除查看器并释放它占用的一切，例如 worker 和图片的内存。调用两次也没有问题。

## 选项与状态

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

修改你传入的选项，保留其他选项。传入 `undefined` 会让选项恢复默认值。它从不触发 `change`，因此双向绑定不会循环。

### `getState()`

```ts
function getState(): PaperPicState
```

返回查看器正在显示的内容，例如缩放、模式以及是否有可应用的修改。每个字段见[状态](./state)。

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

监听一个事件，并返回一个停止监听的函数。每个事件见[事件](./events)。

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

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

将图片旋转四分之一圈：默认的 `1` 为顺时针，`-1` 为逆时针。编辑时，这是一项由 [`apply()`](#apply) 确定的修改。在只读查看器中，它只改变显示。其他情况下什么也不做。

### `flip()`

```ts
function flip(): void
```

按显示的样子将图片左右翻转，因此旋转四分之一圈之后仍是左右翻转。要上下颠倒图片，先翻转再旋转两次。这是一项修改，在编辑模式之外或有工具打开时什么也不做。

### `openTool()`

```ts
function openTool(id: ToolId): void
```

打开带面板的工具：`'crop'` 打开裁剪，`'perspective'` 打开矫正，`'adjust'` 打开调整，`'threshold'` 打开清理，清理在打开时开启。工具会一直打开，直到 [`confirmTool()`](#confirmtool) 或 [`cancelTool()`](#canceltool)；在此期间，其他修改、撤销、重做和应用都不起作用。在编辑模式之外、有其他工具打开时、开启清理时的调整，以及预览准备期间的裁剪和矫正，什么也不做。

### `confirmTool()`

```ts
function confirmTool(): void
```

关闭打开的工具，并把其中的选择加入修改，与 `Enter` 相同：裁剪或矫正的选区，或者调整或清理的设置，作为一项修改。

### `cancelTool()`

```ts
function cancelTool(): void
```

关闭打开的工具，并放弃它的修改，与 `Esc` 相同。

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

开启或关闭清理，或修改它的灵敏度，范围 0 到 1。清理总是在其他修改之后进行。清理打开时，它会改变清理显示的内容，[`confirmTool()`](#confirmtool) 会把它作为一项修改保留。在编辑模式之外或有其他工具打开时什么也不做。

如果 `sensitivity` 不在 0 到 1 之间，会抛出 `RangeError`。

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

修改亮度或对比度，各自范围为 -1 到 1，0 表示保持原样。它们在其他修改之后进行。调整打开时，它会改变调整显示的值，[`confirmTool()`](#confirmtool) 会把它作为一项修改保留。在编辑模式之外、有其他工具打开时或开启清理时什么也不做，因为清理后的文档有自己的色调。

如果某个值不在 -1 到 1 之间，会抛出 `RangeError`。

### `undo()`

```ts
function undo(): void
```

撤销上一次修改。

### `redo()`

```ts
function redo(): void
```

恢复上一次撤销的修改。

### `apply()`

```ts
function apply(): Promise<void>
```

以完整分辨率或 [`maxOutputSize`](./options#maxoutputsize) 应用修改。结果成为显示的图片，历史记录清空，查看器回到查看模式，[`apply`](./events#apply) 事件携带结果。应用无法中断，运行期间会锁定控件。

如果失败，[`error`](./events#error) 事件会报告，编辑保持打开。

### `cancel()`

```ts
function cancel(): void
```

放弃修改并回到查看模式。它不会询问：询问的是内置的“取消”按钮和 `Esc`。

## 图片

### `download()`

```ts
function download(): void
```

将显示的图片保存为文件：上一次应用的结果，没有则是原图。即使没有只负责显示按钮的 [`download`](./options#download) 选项，它也能工作。[`download`](./events#download) 事件会先触发，并可以阻止保存。编辑时什么也不做，因为修改尚未应用。

### `reload()`

```ts
function reload(): void
```

重新加载当前的 [`src`](./options#src)，可在应用之后恢复原图。
