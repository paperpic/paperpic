---
title: 上传到服务器
description: 一个完整示例：把在 PaperPic 中编辑后的图片发送到你的服务器，并告诉用户是否已保存，包含 JavaScript、Vue 和 React 版本。
---

# 上传到服务器

查看器会立即显示“应用”的结果，但保存它是你的应用的事。这个示例把编辑后的图片发送到你的服务器，并告诉用户结果如何。

这个函数把图片作为表单中的文件发送，服务器不接受时会失败：

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

查看器在应用时调用它，一行状态文字报告结果：

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: '发票 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '正在保存…'
  try {
    await upload(blob, type)
    status.textContent = '已保存'
  }
  catch {
    status.textContent = '无法保存文档'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = '正在保存…'
  try {
    await upload(blob, type)
    status.value = '已保存'
  }
  catch {
    status.value = '无法保存文档'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="发票 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('正在保存…')
    try {
      await upload(blob, type)
      setStatus('已保存')
    }
    catch {
      setStatus('无法保存文档')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="发票 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## 说明

- `role="status"` 让屏幕阅读器朗读上传的结果。
- [`maxOutputSize`](../reference/options#maxoutputsize) 让文件保持较小。最长边为 3000 像素时文档依然清晰可读。
- 应用之后历史记录为空，用户无法撤销回原来的图片。要提供“重试”按钮，请保留最后的 `blob` 和 `type`，再次调用 `upload`。
- 清理过的文档服务器收到的是 PNG，否则是原图的格式。要选择其他格式，参见[保存结果](../guide/saving)。
