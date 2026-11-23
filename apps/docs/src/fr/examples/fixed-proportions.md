---
title: Proportions fixes
description: Un exemple complet qui laisse l’utilisateur choisir le type de document, comme une feuille US Legal ou une page de passeport, pour que Redresser donne au résultat ses proportions exactes.
---

# Proportions fixes

Redresser estime les proportions du document d’après la photo, et l’estimation ne peut pas être exacte. Quand votre application sait ce que l’utilisateur photographie, comme un formulaire US Legal ou une page de passeport, [`aspectRatio`](../reference/options#aspectratio) donne au résultat sa forme réelle. Cet exemple laisse l’utilisateur choisir le type de document avant de le redresser.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Feuille US Legal</option>
  <option value="passport">Page de passeport</option>
  <option value="envelope">Enveloppe DL</option>
  <option value="other">Autre</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const proportions: Record<string, number | undefined> = {
  legal: 8.5 / 14,
  passport: 125 / 88,
  envelope: 220 / 110,
  other: undefined,
}

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/scans/form.jpg',
  alt: 'Formulaire signé',
  tools: ['perspective', 'rotate', 'finish'],
  aspectRatio: proportions.legal,
})

document.querySelector('#type')!.addEventListener('change', (event) => {
  const type = (event.target as HTMLSelectElement).value
  pic.setOptions({ aspectRatio: proportions[type] })
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const types = [
  { name: 'Feuille US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Page de passeport', aspectRatio: 125 / 88 },
  { name: 'Enveloppe DL', aspectRatio: 220 / 110 },
  { name: 'Autre', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'finish']

const type = shallowRef(types[0]!)
</script>

<template>
  <select v-model="type">
    <option v-for="item in types" :key="item.name" :value="item">
      {{ item.name }}
    </option>
  </select>
  <div style="height: 480px">
    <PaperPic src="/scans/form.jpg" alt="Formulaire signé" :tools :aspect-ratio="type.aspectRatio" />
  </div>
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

const types = [
  { name: 'Feuille US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Page de passeport', aspectRatio: 125 / 88 },
  { name: 'Enveloppe DL', aspectRatio: 220 / 110 },
  { name: 'Autre', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'finish']

export function Form() {
  const [index, setIndex] = useState(0)

  return (
    <>
      <select value={index} onChange={event => setIndex(Number(event.target.value))}>
        {types.map((item, position) => (
          <option key={item.name} value={position}>{item.name}</option>
        ))}
      </select>
      <div style={{ height: 480 }}>
        <PaperPic src="/scans/form.jpg" alt="Formulaire signé" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Remarques

- Redresser enregistre les proportions quand l’utilisateur appuie sur Terminé, donc choisissez le type avant de redresser. Le changer ensuite n’affecte que le redressement suivant.
- Pour un document en paysage, inversez les nombres, comme `14 / 8.5`.
- Les proportions s’appliquent à la page telle qu’elle s’affiche à l’écran. Si la photo est de côté, faites-la pivoter avec Pivoter à gauche avant d’utiliser Redresser, sinon une feuille en portrait sort écrasée.
- Omettez `aspectRatio` pour les documents sans taille fixe, comme les tickets de caisse, et Redresser les estime.
- Le panneau de Redresser propose déjà A4, Lettre et Carte comme [formats de papier](../guide/tools/straighten#paper-size), donc cet exemple ajoute d’autres documents. Le format que l’utilisateur y choisit l’emporte sur `aspectRatio` pour ce redressement.
- [Redresser](../guide/tools/straighten) explique l’estimation et que faire des coins qui sortent de la photo.
