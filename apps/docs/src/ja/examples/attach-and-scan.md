---
title: 添付してスキャン
description: ユーザーが文書を撮影するかファイルを選び、PaperPic で傾き補正とクリーンアップをして、結果をサーバーに送る完全な例です。JavaScript、Vue、React 版があります。
---

# 添付してスキャン

文書を受け付けるアプリの多くは、経費精算のレシートや署名済みの書類など、文書の写真をユーザーに求めます。この例では、ユーザーが写真を撮るかファイルを選び、PaperPic で編集して、結果をサーバーに送ります。

`upload` は[サーバーへのアップロード](./upload)の関数で、画像を送り、サーバーが受け付けなかったときは失敗します。

:::tabs key:framework
== JavaScript

```html
<label>
  文書の写真
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
  alt: '添付した文書',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// 写真が表示されたらすぐに編集を始める
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'このファイルはブラウザーで開ける画像ではありません'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '送信中…'
  try {
    await upload(blob, type)
    status.textContent = '送信しました'
  }
  catch {
    status.textContent = '文書を送信できませんでした'
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
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'このファイルはブラウザーで開ける画像ではありません'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = '送信中…'
  try {
    await upload(blob, type)
    status.value = '送信しました'
  }
  catch {
    status.value = '文書を送信できませんでした'
  }
}
</script>

<template>
  <label>
    文書の写真
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="添付した文書"
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

  function choose(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ''
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('このファイルはブラウザーで開ける画像ではありません')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('送信中…')
    try {
      await upload(blob, type)
      setStatus('送信しました')
    }
    catch {
      setStatus('文書を送信できませんでした')
    }
  }

  return (
    <>
      <label>
        文書の写真
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target)} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="添付した文書"
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

## 補足

- `capture="environment"` はスマートフォンでは背面カメラを開き、パソコンでは無視されます。付けないと、スマートフォンはカメラと写真ライブラリの両方を選べるので、ユーザーが手元に持っている文書に向いています。
- 選択のたびに input を空にすると、同じ写真をもう一度選べます。たとえば適用のあとでやり直す場合です。
- 写真が読み込まれるとビューアーは編集モードになるので、ユーザーはすぐに傾き補正やクリーンアップを使えます。先に写真を見せたいときは `load` のリスナーを外してください。
- `phase: 'load'` で、Safari 以外での HEIC の写真のようにブラウザーが開けないファイルと、編集の失敗を区別できます。形式の一覧は[画像の読み込み](../guide/loading#formats)にあります。
- ユーザーが変更を適用し、コードが `upload` を呼ぶまで、写真はブラウザーの中にあります。PaperPic が自分から何かを送ることはありません。
- [`maxOutputSize`](../reference/options#maxoutputsize) でアップロードを小さく保てます。スマートフォンの写真は 1200 万画素以上ありますが、文書は長辺 3000 ピクセルでも十分に読めます。
