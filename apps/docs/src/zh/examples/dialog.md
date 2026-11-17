---
title: 在对话框中编辑
description: 一个完整的示例：在对话框中打开 PaperPic 编辑照片，并在用户应用或取消修改时关闭对话框，提供 JavaScript、Vue 和 React 版本。
---

# 在对话框中编辑

许多应用会在页面上方的对话框中编辑文档，例如从附件列表中打开。这个示例在 `<dialog>` 中打开查看器，进入编辑模式，并在用户应用或取消修改时关闭对话框。

`upload` 是[上传到服务器](./upload)中的函数。

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">编辑照片</button>
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
  alt: '一张收据',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// 仍在加载的照片会在显示后立即开始编辑
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// 应用或取消会结束编辑，对话框也随之关闭
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// 编辑时，Esc 交给查看器处理，它会在放弃修改前先询问
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

// 仍在加载的照片会在显示后立即开始编辑
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// 应用或取消会结束编辑，对话框也随之关闭
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// 编辑时，Esc 交给查看器处理，它会在放弃修改前先询问
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    编辑照片
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="一张收据"
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

  // 仍在加载的照片会在显示后立即开始编辑
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // 应用或取消会结束编辑，对话框也随之关闭
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // 编辑时，Esc 交给查看器处理，它会在放弃修改前先询问
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>编辑照片</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="一张收据"
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

## 说明

- 查看器可以放在关闭的对话框里。那时它没有尺寸，对话框一打开就会让图片适合查看器。
- 打开对话框会进入编辑模式。如果照片还在加载，则由 `load` 事件进入。
- 应用和取消会结束编辑，随后的 [`change`](../reference/events#change) 会关闭对话框。如果应用失败，编辑保持打开，对话框也一样。
- 每次打开都编辑当前显示的图片，应用之后就是结果。要每次都从原图开始，请在 `edit()` 之前调用 [`reload()`](../reference/methods#reload)。
