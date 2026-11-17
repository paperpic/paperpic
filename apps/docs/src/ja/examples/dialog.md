---
title: ダイアログでの編集
description: PaperPic をダイアログで開いて写真を編集し、ユーザーが変更を適用またはキャンセルするとダイアログを閉じる完全な例。JavaScript、Vue、React 版があります。
---

# ダイアログでの編集

多くのアプリでは、添付ファイルの一覧などから、ページの上に開くダイアログで文書を編集します。この例では `<dialog>` でビューアーを開いて編集モードを始め、ユーザーが変更を適用またはキャンセルするとダイアログを閉じます。

`upload` は[サーバーへのアップロード](./upload)の関数です。

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">写真を編集</button>
<dialog id="editor">
  <div id="viewer" style="width: min(90vw, 720px); height: 70vh"></div>
</dialog>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const dialog = document.querySelector<HTMLDialogElement>('#editor')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'レシート',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// 読み込み中の写真は、表示されたらすぐに編集を始める
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// 適用またはキャンセルで編集が終わると、ダイアログも閉じる
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// 編集中の Esc はビューアーに渡り、変更を破棄する前に確認する
dialog.addEventListener('cancel', (event) => {
  if (editing) {
    event.preventDefault()
  }
})

pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const dialog = useTemplateRef('dialog')
const pic = useTemplateRef('pic')
let editing = false

function open() {
  dialog.value?.showModal()
  pic.value?.instance?.edit()
}

// 読み込み中の写真は、表示されたらすぐに編集を始める
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// 適用またはキャンセルで編集が終わると、ダイアログも閉じる
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// 編集中の Esc はビューアーに渡り、変更を破棄する前に確認する
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    写真を編集
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="レシート"
        @load="loaded"
        @change="changed"
        @apply="({ blob, type }) => upload(blob, type)"
      />
    </div>
  </dialog>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import type { SyntheticEvent } from 'react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'
import '@paperpic/react/style.css'

export function PhotoEditor() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const picRef = useRef<PaperPicInstance>(null)
  const editing = useRef(false)

  function open() {
    dialogRef.current?.showModal()
    picRef.current?.edit()
  }

  // 読み込み中の写真は、表示されたらすぐに編集を始める
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // 適用またはキャンセルで編集が終わると、ダイアログも閉じる
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // 編集中の Esc はビューアーに渡り、変更を破棄する前に確認する
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>写真を編集</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="レシート"
            onLoad={loaded}
            onChange={changed}
            onApply={({ blob, type }) => upload(blob, type)}
          />
        </div>
      </dialog>
    </>
  )
}
```

:::

## 補足

- ビューアーは、閉じているダイアログの中に置いておけます。そのあいだはサイズがなく、ダイアログが開くとすぐに画像をフィットさせます。
- ダイアログを開くと編集モードが始まります。写真がまだ読み込み中なら、代わりに `load` イベントで始まります。
- 適用とキャンセルで編集が終わり、続く [`change`](../reference/events#change) でダイアログが閉じます。適用に失敗したときは、編集もダイアログも開いたままです。
- 開くたびに表示中の画像を編集します。適用のあとは、それが結果です。毎回元の画像から始めるには、`edit()` の前に [`reload()`](../reference/methods#reload) を呼び出してください。
