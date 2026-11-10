---
title: 选项
description: PaperPic 的所有选项及其类型、默认值和作用，适用于构造函数、setOptions() 以及 Vue 和 React 组件的 props。
---

# 选项

选项决定查看器显示什么，以及用户能用它做什么。在创建查看器时传入，或之后用 [`setOptions()`](./methods#setoptions) 修改。Vue 和 React 组件以同名 props 接收它们。

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: '一张收据' })

pic.setOptions({ editable: false })
```

`setOptions()` 只修改你传入的选项，传入 `undefined` 会让该选项恢复默认值。它从不触发 `change`。

## 图片

### `src`

- **类型：** `string | Blob`
- **默认值：** 无

要显示的图片：同源的 URL，或在客户端添加的 `File` 或 `Blob`。

再次传入相同的值不会重新加载图片，因此编辑结果会继续显示。调用 [`reload()`](./methods#reload) 可以恢复原图。编辑时传入新值会放弃所做的修改。

### `alt`

- **类型：** `string`
- **默认值：** `''`

为屏幕阅读器描述图片。

## 界面

### `editable`

- **类型：** `boolean`
- **默认值：** `true`

用户能否编辑图片。设为 `false` 时它是只读查看器，工具栏会增加旋转图片的按钮。这种旋转只改变显示。编辑时修改此选项会放弃所做的修改。

### `toolbar`

- **类型：** `boolean`
- **默认值：** `true`

是否显示内置的工具栏和编辑栏。不显示时，用[方法](./methods)构建你自己的控件。

### `tools`

- **类型：** `readonly ToolId[]`
- **默认值：** 所有工具

编辑栏提供的工具。无论数组的顺序如何，它们都按此表的顺序排列。

| Id              | 按钮                   |
| --------------- | ---------------------- |
| `'crop'`        | 裁剪                   |
| `'perspective'` | 矫正                   |
| `'rotate'`      | 向左旋转               |
| `'flip'`        | 翻转                   |
| `'adjust'`      | 调整，用于亮度和对比度 |
| `'threshold'`   | 清理                   |

### `wheelZoom`

- **类型：** `boolean`
- **默认值：** `true`

滚轮是否缩放图片。当查看器位于长页面中时将其关闭，滚轮就会滚动页面。

### `download`

- **类型：** `boolean`
- **默认值：** `false`

工具栏上是否有保存当前显示图片的按钮：保存的是上一次应用的结果，没有则是原图。编辑时按钮会隐藏。通过 [`download`](./events#download) 事件，你可以用其他方式保存文件。

### `labels`

- **类型：** `Partial<PaperPicLabels>`
- **默认值：** 英文文本

替换组件显示或朗读的任意文本。所有键都列在[标签](./labels)中。

## 结果

### `output`

- **类型：** `{ type?: string, quality?: number }`
- **默认值：** 原图的格式

编辑后图片的格式。`type` 为 `'image/jpeg'`、`'image/png'` 或 `'image/webp'`，`quality` 对 JPEG 和 WebP 取 0 到 1，默认为 `0.92`。

没有 `type` 时，清理后的图片为 PNG，因为 JPEG 会破坏它清晰的边缘；其他图片保留原图的格式。浏览器无法编码的格式会得到 PNG。

### `maxOutputSize`

- **类型：** `number`
- **默认值：** 完整分辨率

编辑后图片最长边的像素数。更大的结果会被缩小。

### `filename`

- **类型：** `string`
- **默认值：** 原图的名称

保存文件的名称。扩展名跟随图片格式，因此清理后的 `receipt.jpg` 会保存为 `receipt.png`。原图没有名称时（例如 `Blob`），文件名为 `image`。

## 工具

### `aspectRatio`

- **类型：** `number`
- **默认值：** 估算

文档的真实宽高比，即宽度除以高度，例如 A4 纸为 `210 / 297`。矫正会让结果采用这个宽高比。没有它时，会根据照片估算。

### `softness`

- **类型：** `number`，从 0 到 1
- **默认值：** `0.25`

清理在字母边缘保留多少灰色，这让文字更易读。使用 `0` 得到严格的黑白，文件更小，但细笔画会断开。
