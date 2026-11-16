---
title: Attach and scan
description: A complete example where the user takes a photo of a document or picks a file, straightens and cleans it up in PaperPic, and sends the result to your server, in plain JavaScript, Vue and React.
---

# Attach and scan

Most apps that take documents ask the user for a photo of one, such as a receipt for an expense or a signed form. This example lets the user take the photo or pick a file, edit it in PaperPic, and send the result to your server.

`upload` is the function from [Upload to a server](./upload), which sends the image and fails when the server does not accept it.

:::tabs key:framework
== JavaScript

```html
<label>
  Photo of the document
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
  alt: 'The document you attached',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// The edit starts as soon as the photo is on display
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'This file is not an image the browser can open'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Sending…'
  try {
    await upload(blob, type)
    status.textContent = 'Sent'
  }
  catch {
    status.textContent = 'The document could not be sent'
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
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'This file is not an image the browser can open'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Sending…'
  try {
    await upload(blob, type)
    status.value = 'Sent'
  }
  catch {
    status.value = 'The document could not be sent'
  }
}
</script>

<template>
  <label>
    Photo of the document
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="The document you attached"
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

  function choose(file: File | undefined) {
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('This file is not an image the browser can open')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Sending…')
    try {
      await upload(blob, type)
      setStatus('Sent')
    }
    catch {
      setStatus('The document could not be sent')
    }
  }

  return (
    <>
      <label>
        Photo of the document
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="The document you attached"
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

## Notes

- `capture="environment"` opens the back camera on phones, and computers ignore it. Without it, phones offer the camera and the photo library, which suits documents the user already has.
- The viewer opens in the edit mode once the photo loads, so the user goes straight to Straighten or Clean up. Leave out the `load` listener to show the photo first.
- `phase: 'load'` tells a file the browser cannot open, such as a HEIC photo outside Safari, from a failed edit. [Loading images](../guide/loading#formats) lists the formats.
- The photo stays in the browser until Apply calls `upload`. PaperPic sends nothing on its own.
- [`maxOutputSize`](../reference/options#maxoutputsize) keeps the upload small. Phone photos have 12 megapixels or more, and documents stay readable at 3000 pixels on the longest side.
