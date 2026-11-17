---
title: 保存结果
description: PaperPic 如何交出编辑后的图片，如何选择格式和尺寸，如何上传，以及下载按钮和它的事件如何工作。
---

# 保存结果

PaperPic 从不上传或存储任何东西。用户应用修改后，它把结果交给你的代码，由你的应用决定结果去向。本页介绍你会收到什么以及如何保存。

## `apply` 事件

“应用”计算结果，并以如下内容触发 [`apply`](../reference/events#apply)：

| 字段              | 类型     | 说明                     |
| ----------------- | -------- | ------------------------ |
| `blob`            | `Blob`   | 编辑后的图片             |
| `type`            | `string` | 格式，例如 `'image/png'` |
| `width`、`height` | `number` | 像素尺寸                 |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="({ blob, type }) => upload(blob, type)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={({ blob, type }) => upload(blob, type)} />
```

:::

应用之后，结果成为显示的图片，历史记录清空，下一次编辑从结果开始。[`reload()`](../reference/methods#reload) 可以恢复原来的 `src`。

## 上传

把 `blob` 作为表单中的文件发送：

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

无论结果是否到达你的服务器，查看器都会立即显示它，因此上传失败时请告知用户。

## 格式和质量 {#format}

没有选项时，如果原图是 JPEG、PNG 或 WebP，结果会保留它的格式。PaperPic 根据 URL 的扩展名（例如 `.jpg`）或 `File`、`Blob` 的类型判断格式。清理后的文档为 PNG，因为 JPEG 会在清晰的边缘周围产生噪点。其他原图也会得到 PNG，例如 GIF，或像 `/api/documents/42` 这样没有扩展名的 URL，即使它返回的是 JPEG。

[`output`](../reference/options#output) 选择格式，以及 JPEG 和 WebP 的质量（0 到 1，默认为 0.92）：

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| 格式         | 适用于                           |
| ------------ | -------------------------------- |
| `image/png`  | 清理后的文档和文字，无损         |
| `image/jpeg` | 照片和彩色文档，文件较小         |
| `image/webp` | 照片和彩色文档，文件比 JPEG 更小 |

浏览器无法编码你要求的格式时会输出 PNG，因此请读取事件中的 `type`。

## 尺寸

结果保留原图的完整分辨率，许多手机照片在 1200 万像素以上。[`maxOutputSize`](../reference/options#maxoutputsize) 以像素为单位限制它的最长边：

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

编辑时的预览最多约为 200 万像素，因此 `maxOutputSize` 只影响结果。

iOS 上的 Safari 将 canvas 限制在约 1600 万像素，而新款 iPhone 拍摄的照片有 2400 万像素或更多，因此以完整分辨率应用可能失败。如果用户在 iPhone 上编辑照片，请设置 `maxOutputSize`。3000 像素既能让文档保持清晰可读，又远低于这一限制。错误信息见[处理大照片时应用失败](./troubleshooting#too-large)。

## 元数据 {#metadata}

应用的结果不带任何元数据。PaperPic 把图片绘制到 canvas 上，因此照片的 EXIF 数据（例如 GPS 位置、相机和日期）都会丢失。在第一次应用之前，下载按钮会原样保存原图，包括它的元数据。

## 下载按钮 {#download}

[`download: true`](../reference/options#download) 会在工具栏末尾添加一个保存显示图片的按钮：保存的是上一次应用的结果，没有则是原样的原图。编辑时它会隐藏，因为修改尚未应用。[`download()`](../reference/methods#download) 可以通过代码做同样的事，不论有没有按钮。查看器上不会打开浏览器的右键菜单，因此要从查看器保存图片就用这个按钮。

文件保留原图的名称，并使用其格式的扩展名，因此清理后的 `receipt.jpg` 会保存为 `receipt.png`。[`filename`](../reference/options#filename) 可以设置其他名称。完全没有名称时（例如 `Blob`），文件名为 `image`。在第一次应用之前，没有扩展名的 URL 因为格式未知，保存时也没有扩展名。

如果 `src` 来自其他源，在第一次应用之前浏览器不会保存文件，而是打开图片，用户会离开你的页面。请像[加载图片](./loading#fetch)中那样以 `Blob` 传入图片，或在 `download` 事件中自己保存。

### 用其他方式保存

[`download`](../reference/events#download) 事件会在浏览器保存文件之前触发。调用 `preventDefault()` 即可用其他方式保存，例如从你的服务器下载，由服务器命名文件并检查是谁在下载：

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
