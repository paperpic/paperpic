---
title: Visualizzatore di sola lettura
description: Un esempio completo di visualizzatore PaperPic di sola lettura per gli allegati di una pratica, con un elenco di documenti, la rotazione e un pulsante di download.
---

# Visualizzatore di sola lettura

Alcuni documenti vanno letti ma non modificati, come gli allegati di un ordine o di un reclamo. Questo esempio li mostra uno alla volta in un visualizzatore di sola lettura, con un elenco per passare dall’uno all’altro e un pulsante per scaricarli.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Fattura</option>
  <option value="1">Bolla di consegna</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Fattura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bolla di consegna' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Fattura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bolla di consegna' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Fattura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bolla di consegna' },
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

## Note

- Con `editable: false`, la barra degli strumenti non ha il pulsante Modifica, e i suoi pulsanti di rotazione ruotano solo l’immagine visualizzata.
- `download: true` aggiunge un pulsante che salva il documento così com’è, con il suo nome di file. L’evento [`download`](../reference/events#download) ti permette di servirlo dal tuo server.
- `wheelZoom: false` lascia che la rotellina scorra la pagina, cosa adatta a un visualizzatore in una pagina più lunga.
- Un nuovo `src` carica il documento successivo e lo adatta al visualizzatore.
