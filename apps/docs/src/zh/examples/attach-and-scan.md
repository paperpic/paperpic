---
title: 附加并扫描
description: 一个完整示例：用户拍摄文档或选择文件，在 PaperPic 中矫正并清理，然后把结果发送到你的服务器，包含原生 JavaScript、Vue 和 React 版本。
---

# 附加并扫描

大多数接收文档的应用都会请用户提供一张照片，例如报销用的收据或签好字的表格。这个示例让用户拍照或选择文件，在 PaperPic 中编辑，再把结果发送到你的服务器。

`upload` 是[上传到服务器](./upload)中的函数，它发送图片，并在服务器不接受时失败。

:::tabs key:framework
== JavaScript

```html
<label>
  文档照片
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: '你附加的文档',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// 照片一显示就开始编辑
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = '这个文件不是浏览器能打开的图片'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '正在发送…'
  try {
    await upload(blob, type)
    status.textContent = '已发送'
  }
  catch {
    status.textContent = '文档无法发送'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = '这个文件不是浏览器能打开的图片'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = '正在发送…'
  try {
    await upload(blob, type)
    status.value = '已发送'
  }
  catch {
    status.value = '文档无法发送'
  }
}
</script>

<template>
  <label>
    文档照片
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="你附加的文档"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(file: File | undefined) {
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('这个文件不是浏览器能打开的图片')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('正在发送…')
    try {
      await upload(blob, type)
      setStatus('已发送')
    }
    catch {
      setStatus('文档无法发送')
    }
  }

  return (
    <>
      <label>
        文档照片
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="你附加的文档"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## 说明

- `capture="environment"` 在手机上会打开后置摄像头，电脑会忽略它。不加它时，手机会同时提供相机和相册，适合用户已有的文档。
- 照片加载后，查看器会进入编辑模式，用户可以直接使用矫正或清理。去掉 `load` 监听器即可先显示照片。
- `phase: 'load'` 能把浏览器无法打开的文件（例如 Safari 之外的 HEIC 照片）与编辑失败区分开。[加载图片](../guide/loading#formats)列出了支持的格式。
- 在应用调用 `upload` 之前，照片一直留在浏览器中。PaperPic 不会自行发送任何内容。
- [`maxOutputSize`](../reference/options#maxoutputsize) 让上传保持小巧。手机照片通常有 1200 万像素或更多，而文档在最长边 3000 像素时仍然清晰可读。
