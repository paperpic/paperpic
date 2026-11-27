---
title: 通过表单发送
description: 一个完整的示例：收据照片放在表单字段中，用户在 PaperPic 中编辑，表单无需自己的代码就会发送编辑后的图片，提供 JavaScript、Vue 和 React 版本。
---

# 通过表单发送

有些应用用普通表单发送文档，例如带收据的报销单，并没有自己上传文件的代码。这个示例把照片留在表单的文件字段中，并在用户应用修改时把编辑后的图片放回该字段，这样表单就会像发送任何文件一样发送它。

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    金额
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    收据
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">发送</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: '你添加的收据',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// 表单发送编辑后的图片，而不是原照片
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

// 表单发送编辑后的图片，而不是原照片
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
      金额
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      收据
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="你添加的收据" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      发送
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

  // 表单发送编辑后的图片，而不是原照片
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
        金额
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        收据
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="你添加的收据" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">发送</button>
    </form>
  )
}
```

:::

## 说明

- 应用修改时，示例会通过 [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer) 把编辑后的图片放进文件字段，因此表单会用同一个名称发送它。在应用任何修改之前，表单发送的是用户选择的原照片。
- 用代码修改字段中的文件不会触发它的 `change` 事件，因此查看器会继续显示结果。
- 文件保留照片的名称，只把扩展名换成结果的格式，例如清理成黑白后是 `receipt.png`。
- 查看器的按钮永远不会提交表单。
- [`maxOutputSize`](../reference/options#maxoutputsize) 让表单保持轻量。手机照片有 1200 万像素或更多，而文档在长边 3000 像素时仍然清晰可读。
