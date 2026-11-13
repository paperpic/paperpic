---
title: サーバーへのアップロード
description: PaperPic で編集した画像をサーバーに送り、保存できたかどうかをユーザーに知らせる完全な例。JavaScript、Vue、React で示します。
---

# サーバーへのアップロード

ビューアーは「適用」の結果をすぐに表示しますが、保存はアプリの役目です。この例では、編集した画像をサーバーに送り、結果をユーザーに知らせます。

この関数は画像をフォームのファイルとして送り、サーバーが受け付けなければ失敗します。

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

ビューアーは適用時にこれを呼び出し、ステータス行が結果を伝えます。

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
  alt: '請求書 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '保存中…'
  try {
    await upload(blob, type)
    status.textContent = '保存しました'
  }
  catch {
    status.textContent = '文書を保存できませんでした'
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
  status.value = '保存中…'
  try {
    await upload(blob, type)
    status.value = '保存しました'
  }
  catch {
    status.value = '文書を保存できませんでした'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="請求書 42" :max-output-size="3000" @apply="save" />
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
    setStatus('保存中…')
    try {
      await upload(blob, type)
      setStatus('保存しました')
    }
    catch {
      setStatus('文書を保存できませんでした')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="請求書 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## 補足

- `role="status"` にすると、スクリーンリーダーがアップロードの結果を読み上げます。
- [`maxOutputSize`](../reference/options#maxoutputsize) でファイルを小さく保てます。長辺 3000 ピクセルでも文書は読みやすいままです。
- 適用のあとは履歴が空になるため、ユーザーは元の画像に戻せません。再試行ボタンを用意するなら、最後の `blob` と `type` を保持して、もう一度 `upload` を呼び出してください。
- クリーンアップした文書ならサーバーには PNG が届き、それ以外は元画像の形式です。別の形式を選ぶには[結果の保存](../guide/saving)を参照してください。
