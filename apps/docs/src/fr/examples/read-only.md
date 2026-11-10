---
title: Visionneuse en lecture seule
description: Un exemple complet de visionneuse PaperPic en lecture seule pour les pièces jointes d’un dossier, avec une liste de documents, la rotation et un bouton de téléchargement.
---

# Visionneuse en lecture seule

Certains documents doivent être lus mais pas modifiés, comme les pièces jointes d’une commande ou d’une réclamation. Cet exemple les affiche un par un dans une visionneuse en lecture seule, avec une liste pour passer de l’un à l’autre et un bouton pour les télécharger.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Facture</option>
  <option value="1">Bon de livraison</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Facture' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bon de livraison' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Facture' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bon de livraison' },
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
  { src: '/orders/42/invoice.jpg', alt: 'Facture' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Bon de livraison' },
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

## Remarques

- Avec `editable: false`, la barre d’outils n’a pas de bouton Modifier, et ses boutons de rotation ne font pivoter que l’image affichée.
- `download: true` ajoute un bouton qui enregistre le document tel quel, avec son propre nom de fichier. L’événement [`download`](../reference/events#download) vous permet de le servir depuis votre serveur.
- `wheelZoom: false` laisse la molette faire défiler la page, ce qui convient à une visionneuse dans une page plus longue.
- Un nouveau `src` charge le document suivant et l’ajuste à la visionneuse.
