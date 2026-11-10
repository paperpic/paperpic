---
title: 只读查看器
description: 一个完整示例：用只读的 PaperPic 查看器显示记录的附件，包含文档列表、旋转和下载按钮。
---

# 只读查看器

有些文档只应阅读而不应修改，例如订单或理赔的附件。这个示例在只读查看器中逐个显示它们，用一个列表切换文档，并提供下载按钮。

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">发票</option>
  <option value="1">送货单</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '发票' },
  { src: '/orders/42/delivery-note.jpg', alt: '送货单' },
]

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  ...documents[0],
  editable: false,
  download: true,
  wheelZoom: false,
})

document.querySelector('#documents')!.addEventListener('change', (event) => {
  const index = Number((event.target as HTMLSelectElement).value)
  pic.setOptions(documents[index]!)
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '发票' },
  { src: '/orders/42/delivery-note.jpg', alt: '送货单' },
]

const current = shallowRef(documents[0]!)
</script>

<template>
  <select v-model="current">
    <option v-for="item in documents" :key="item.src" :value="item">
      {{ item.alt }}
    </option>
  </select>
  <div style="height: 480px">
    <PaperPic
      :src="current.src"
      :alt="current.alt"
      :editable="false"
      download
      :wheel-zoom="false"
    />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '发票' },
  { src: '/orders/42/delivery-note.jpg', alt: '送货单' },
]

export function Attachments() {
  const [index, setIndex] = useState(0)
  const current = documents[index]!

  return (
    <>
      <select value={index} onChange={event => setIndex(Number(event.target.value))}>
        {documents.map((item, position) => (
          <option key={item.src} value={position}>{item.alt}</option>
        ))}
      </select>
      <div style={{ height: 480 }}>
        <PaperPic src={current.src} alt={current.alt} editable={false} download wheelZoom={false} />
      </div>
    </>
  )
}
```

:::

## 说明

- 设置 `editable: false` 时，工具栏没有“编辑”按钮，旋转按钮只旋转显示的图片。
- `download: true` 会添加一个按钮，按原样保存文档，使用它自己的文件名。通过 [`download`](../reference/events#download) 事件，你可以改为从你的服务器提供文件。
- `wheelZoom: false` 让滚轮滚动页面，适合放在较长页面中的查看器。
- 新的 `src` 会加载下一个文档，并让它适合查看器。
