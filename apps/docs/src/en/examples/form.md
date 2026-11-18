---
title: Send with a form
description: A complete example where the photo of a receipt goes in a form field, the user edits it in PaperPic, and the form sends the edited image without any code of its own, in plain JavaScript, Vue and React.
---

# Send with a form

Some apps send documents with a plain form, such as an expense with its receipt, and have no code of their own to upload a file. This example keeps the photo in the file field of the form, and puts the edited image back in that field when the user applies the changes, so the form sends it as it would any file.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Amount
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Receipt
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Send</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'The receipt you attached',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// The form sends the edited image in place of the photo
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

// The form sends the edited image in place of the photo
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
      Amount
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Receipt
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="The receipt you attached" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Send
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

  // The form sends the edited image in place of the photo
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
        Amount
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Receipt
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="The receipt you attached" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Send</button>
    </form>
  )
}
```

:::

## Notes

- Apply puts the edited image in the file field with a [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), so the form sends it under the same name. Before any Apply, the form sends the photo as the user picked it.
- Changing the files of the field from code does not fire its `change` event, so the viewer keeps the result on display.
- The file keeps the name of the photo, with the extension of the result, such as `receipt.png` after Clean up in black and white.
- The buttons of the viewer never submit the form.
- [`maxOutputSize`](../reference/options#maxoutputsize) keeps the form light. Phone photos have 12 megapixels or more, and documents stay readable at 3000 pixels on the longest side.
