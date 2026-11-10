---
title: Read-only viewer
description: A complete example of a read-only PaperPic viewer for the attachments of a record, with a list of documents, rotation and a download button.
---

# Read-only viewer

Some documents should be read but not changed, such as the attachments of an order or a claim. This example shows them one at a time in a read-only viewer, with a list to switch between them and a button to download them.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Invoice</option>
  <option value="1">Delivery note</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Invoice' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Delivery note' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Invoice' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Delivery note' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Invoice' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Delivery note' },
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

## Notes

- With `editable: false`, the toolbar has no Edit button, and its rotate buttons only turn the image on display.
- `download: true` adds a button that saves the document as it is, with its own file name. The [`download`](../reference/events#download) event lets you serve it from your server instead.
- `wheelZoom: false` lets the wheel scroll the page, which suits a viewer inside a longer page.
- A new `src` loads the next document and fits it to the viewer.
