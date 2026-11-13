---
title: 読み取り専用のビューアー
description: 記録の添付ファイル向けの、読み取り専用の PaperPic ビューアーの完全な例。文書のリスト、回転、ダウンロードボタンを備えます。
---

# 読み取り専用のビューアー

注文や申請の添付ファイルのように、読んでほしいが変更されたくない文書があります。この例では、それらを読み取り専用のビューアーで 1 つずつ表示し、リストで切り替え、ボタンでダウンロードできるようにします。

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">請求書</option>
  <option value="1">納品書</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '請求書' },
  { src: '/orders/42/delivery-note.jpg', alt: '納品書' },
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
  { src: '/orders/42/invoice.jpg', alt: '請求書' },
  { src: '/orders/42/delivery-note.jpg', alt: '納品書' },
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
  { src: '/orders/42/invoice.jpg', alt: '請求書' },
  { src: '/orders/42/delivery-note.jpg', alt: '納品書' },
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

## 補足

- `editable: false` では、ツールバーに「編集」ボタンがなく、回転ボタンは表示中の画像を回すだけです。
- `download: true` は、文書をそのまま元のファイル名で保存するボタンを加えます。[`download`](../reference/events#download) イベントを使えば、代わりにサーバーから提供できます。
- `wheelZoom: false` にするとホイールでページがスクロールするため、長いページの中のビューアーに向いています。
- 新しい `src` を渡すと次の文書が読み込まれ、ビューアーにフィットします。
