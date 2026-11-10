---
title: Schreibgeschützter Viewer
description: Ein vollständiges Beispiel für einen schreibgeschützten PaperPic-Viewer für die Anhänge einer Akte, mit einer Dokumentliste, Drehung und einer Download-Schaltfläche.
---

# Schreibgeschützter Viewer

Manche Dokumente soll man lesen, aber nicht ändern, etwa die Anhänge einer Bestellung oder einer Reklamation. Dieses Beispiel zeigt sie nacheinander in einem schreibgeschützten Viewer, mit einer Liste zum Wechseln und einer Schaltfläche zum Herunterladen.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Rechnung</option>
  <option value="1">Lieferschein</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Rechnung' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Lieferschein' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Rechnung' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Lieferschein' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Rechnung' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Lieferschein' },
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

## Hinweise

- Mit `editable: false` hat die Werkzeugleiste keine Schaltfläche Bearbeiten, und ihre Drehen-Schaltflächen drehen nur das angezeigte Bild.
- `download: true` fügt eine Schaltfläche hinzu, die das Dokument unverändert mit seinem eigenen Dateinamen speichert. Mit dem Ereignis [`download`](../reference/events#download) lieferst du es stattdessen von deinem Server aus.
- `wheelZoom: false` lässt das Mausrad die Seite scrollen, was zu einem Viewer in einer längeren Seite passt.
- Ein neuer `src` lädt das nächste Dokument und passt es in den Viewer ein.
