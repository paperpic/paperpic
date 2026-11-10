---
title: Visor de solo lectura
description: Un ejemplo completo de un visor de PaperPic de solo lectura para los adjuntos de un expediente, con una lista de documentos, giro y botón de descarga.
---

# Visor de solo lectura

Algunos documentos se deben leer pero no cambiar, como los adjuntos de un pedido o de una reclamación. Este ejemplo los muestra de uno en uno en un visor de solo lectura, con una lista para pasar de uno a otro y un botón para descargarlos.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Factura</option>
  <option value="1">Albarán</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Factura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Albarán' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Factura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Albarán' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Factura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Albarán' },
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

## Notas

- Con `editable: false`, la barra de herramientas no tiene botón Editar, y sus botones de girar solo giran la imagen en pantalla.
- `download: true` añade un botón que guarda el documento tal cual, con su propio nombre de archivo. El evento [`download`](../reference/events#download) te permite servirlo desde tu servidor.
- `wheelZoom: false` deja que la rueda desplace la página, lo que va bien para un visor dentro de una página más larga.
- Un `src` nuevo carga el siguiente documento y lo ajusta al visor.
