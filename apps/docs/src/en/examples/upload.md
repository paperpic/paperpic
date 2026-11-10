---
title: Upload to a server
description: A complete example that sends the image edited in PaperPic to your server and tells the user whether it was saved, in plain JavaScript, Vue and React.
---

# Upload to a server

The viewer shows the result of Apply at once, but saving it is up to your app. This example sends the edited image to your server and tells the user how it went.

This function sends the image as a file in a form, and fails when the server does not accept it:

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

The viewer calls it on Apply, and a status line reports the result:

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
  alt: 'Invoice 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Saving…'
  try {
    await upload(blob, type)
    status.textContent = 'Saved'
  }
  catch {
    status.textContent = 'The document could not be saved'
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
  status.value = 'Saving…'
  try {
    await upload(blob, type)
    status.value = 'Saved'
  }
  catch {
    status.value = 'The document could not be saved'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Invoice 42" :max-output-size="3000" @apply="save" />
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
    setStatus('Saving…')
    try {
      await upload(blob, type)
      setStatus('Saved')
    }
    catch {
      setStatus('The document could not be saved')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Invoice 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Notes

- `role="status"` makes screen readers announce the result of the upload.
- [`maxOutputSize`](../reference/options#maxoutputsize) keeps the file small. Documents stay readable at 3000 pixels on the longest side.
- After Apply, the history is empty, so the user cannot undo into the old image. To offer a retry button, keep the last `blob` and `type` and call `upload` again.
- The server receives PNG for a cleaned up document, and the format of the source otherwise. Read [Saving the result](../guide/saving) to choose another one.
