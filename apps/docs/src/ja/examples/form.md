---
title: フォームでの送信
description: レシートの写真をフォームのフィールドに入れ、ユーザーが PaperPic で編集し、独自のコードなしでフォームが編集後の画像を送信する完全な例。JavaScript、Vue、React 版があります。
---

# フォームでの送信

経費とレシートのように、通常のフォームで文書を送信し、ファイルをアップロードする独自のコードを持たないアプリもあります。この例では写真をフォームのファイルフィールドに置いたままにし、ユーザーが変更を適用すると編集後の画像をそのフィールドに戻すので、フォームはほかのファイルと同じように送信します。

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    金額
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    レシート
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">送信</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: '添付したレシート',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// フォームは写真の代わりに編集後の画像を送信する
pic.on('apply', ({ blob, type }) => {
  const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  input.files = files.files
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const input = useTemplateRef('input')
const photo = shallowRef<File>()

function choose() {
  photo.value = input.value?.files?.[0]
}

// フォームは写真の代わりに編集後の画像を送信する
function applied({ blob, type }: ExportedImage) {
  const field = input.value
  if (!field) {
    return
  }
  const name = field.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  field.files = files.files
}
</script>

<template>
  <form action="/api/expenses" method="post" enctype="multipart/form-data">
    <label>
      金額
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      レシート
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="添付したレシート" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      送信
    </button>
  </form>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function ExpenseForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File>()

  // フォームは写真の代わりに編集後の画像を送信する
  function applied({ blob, type }: ExportedImage) {
    const input = inputRef.current
    if (!input) {
      return
    }
    const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
    const files = new DataTransfer()
    files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
    input.files = files.files
  }

  return (
    <form action="/api/expenses" method="post" encType="multipart/form-data">
      <label>
        金額
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        レシート
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="添付したレシート" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">送信</button>
    </form>
  )
}
```

:::

## 補足

- 適用すると、[`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer) で編集後の画像がファイルフィールドに入るので、フォームは同じ名前で送信します。一度も適用していなければ、ユーザーが選んだままの写真を送信します。
- コードからフィールドのファイルを変えても、フィールドの `change` イベントは発生しないため、ビューアーは結果を表示したままです。
- ファイル名は写真の名前のまま、拡張子だけ結果に合わせます。たとえばクリーンアップのあとは `receipt.png` です。
- ビューアーのボタンがフォームを送信することはありません。
- [`maxOutputSize`](../reference/options#maxoutputsize) でフォームを軽く保てます。スマートフォンの写真は 12 メガピクセル以上ありますが、文書は長辺 3000 ピクセルでも十分に読めます。
