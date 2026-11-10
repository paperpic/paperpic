---
title: Visualizador somente leitura
description: Um exemplo completo de visualizador PaperPic somente leitura para os anexos de um registro, com uma lista de documentos, rotação e um botão de download.
---

# Visualizador somente leitura

Alguns documentos devem ser lidos mas não alterados, como os anexos de um pedido ou de uma reclamação. Este exemplo os mostra um de cada vez num visualizador somente leitura, com uma lista para alternar entre eles e um botão para baixá-los.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Fatura</option>
  <option value="1">Nota de entrega</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Fatura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Nota de entrega' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Fatura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Nota de entrega' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Fatura' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Nota de entrega' },
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

## Observações

- Com `editable: false`, a barra de ferramentas não tem o botão Editar, e os botões de girar só giram a imagem na tela.
- `download: true` adiciona um botão que salva o documento como está, com o nome de arquivo dele. O evento [`download`](../reference/events#download) permite servi-lo pelo seu servidor.
- `wheelZoom: false` deixa a roda rolar a página, o que combina com um visualizador dentro de uma página mais longa.
- Um `src` novo carrega o próximo documento e o ajusta ao visualizador.
