---
title: 加载图片
description: 如何把图片交给 PaperPic：来自 URL、用户选择的文件或你获取的 Blob；它能打开哪些格式；以及你的代码如何得知图片已加载或加载失败。
---

# 加载图片

PaperPic 显示你在 `src` 中传入的图片。本页介绍图片可以从哪里来、哪些格式可以打开，以及你的代码如何得知图片已就绪或加载失败。

## 图片从哪里来

`src` 接受以下三种之一：

- **与页面同源的 URL**，例如 `/documents/42.jpg`。
- 用户通过 `<input type="file">` 选择的 **`File`**。[附加并扫描](../examples/attach-and-scan)展示了从相机到上传的完整流程。
- 你的代码持有的 **`Blob`**，例如响应的正文。

对于 `File` 或 `Blob`，PaperPic 会创建所需的 `blob:` URL，并在图片更换或查看器销毁时释放它。

## 来自其他源或需要登录的图片 {#fetch}

PaperPic 需要读取图片的像素才能编辑。对于来自其他源的图片，浏览器只有在它带有 CORS 时才允许这样做，而 PaperPic 不会请求 CORS。这样的图片可以显示，但第一次编辑会失败，并触发一个说明原因的 [`error`](../reference/events#error)。

请自己获取图片，并把 `Blob` 作为 `src` 传入。这也适用于需要登录的图片，因为你的请求会带上用户的 cookie：

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

和页面发出的任何 `fetch` 一样，另一台服务器需要通过 CORS 允许你的源。

## 格式 {#formats}

PaperPic 能打开浏览器在 `<img>` 中可以显示的所有格式：

- **JPEG、PNG、WebP 和 AVIF** 在所有[支持的浏览器](./performance#browser-support)中都能打开。
- **SVG** 需要文件带有 `width` 和 `height` 属性才能打开。没有这两个属性时，它没有尺寸，加载会失败。
- **HEIC** 是 iPhone 照片的格式，只能在 Safari 中打开。iPhone 用户通过 `<input type="file" accept="image/*">` 选择照片时，iOS 通常会给页面一份 JPEG 副本。经由其他途径到达其他浏览器的 HEIC 文件会加载失败。

手机常常把照片横着保存，并用一个 EXIF 标签说明该如何旋转。PaperPic 会像 `<img>` 一样按照标签显示照片，应用的结果也是正向的。

## 得知加载成功或失败

[`load`](../reference/events#load) 事件表示图片已经显示，并带有图片尺寸。如果图片无法加载（不存在、不是图片，或浏览器无法解码），查看器会显示一条消息，[`error`](../reference/events#error) 事件会带有 `phase: 'load'`：

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: '发票 42' })

pic.on('load', ({ width, height }) => {
  console.log(`图片尺寸为 ${width}×${height} 像素`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`图片尺寸为 ${width}×${height} 像素`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="发票 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`图片尺寸为 ${width}×${height} 像素`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="发票 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

[`getState()`](../reference/state) 的 `status` 随时给出同样的答案：`'empty'`、`'loading'`、`'ready'` 或 `'error'`。

## 更换或重新加载图片

- **新的 `src`** 会加载新图片。如果用户正在编辑，会丢弃这些编辑。
- **相同的 `src`** 不会有任何作用，因此应用的结果会继续显示。
- **[`reload()`](../reference/methods#reload)** 会重新加载当前的 `src`，在应用之后可以恢复原图。
