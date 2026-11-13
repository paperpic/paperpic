---
title: Proportions fixes
description: Un exemple complet qui laisse l’utilisateur choisir le type de document, comme une feuille A4 ou une carte d’identité, pour que Redresser donne au résultat ses proportions exactes.
---

# Proportions fixes

Redresser estime les proportions du document d’après la photo, et l’estimation ne peut pas être exacte. Quand votre application sait ce que l’utilisateur photographie, comme un formulaire A4 ou une carte d’identité, [`aspectRatio`](../reference/options#aspectratio) donne au résultat sa forme réelle. Cet exemple laisse l’utilisateur choisir le type de document avant de le redresser.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">Feuille A4</option>
  <option value="letter">Feuille US Letter</option>
  <option value="idCard">Carte d’identité</option>
  <option value="other">Autre</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const proportions: Record<string, number | undefined> = {
  a4: 210 / 297,
  letter: 8.5 / 11,
  idCard: 85.6 / 53.98,
  other: undefined,
}

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/scans/form.jpg',
  alt: 'Formulaire signé',
  tools: ['perspective', 'rotate', 'threshold'],
  aspectRatio: proportions.a4,
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
  { name: 'Feuille A4', aspectRatio: 210 / 297 },
  { name: 'Feuille US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Carte d’identité', aspectRatio: 85.6 / 53.98 },
  { name: 'Autre', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'threshold']

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
  { name: 'Feuille A4', aspectRatio: 210 / 297 },
  { name: 'Feuille US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Carte d’identité', aspectRatio: 85.6 / 53.98 },
  { name: 'Autre', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'threshold']

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
- Pour un document en paysage, inversez les nombres, comme `297 / 210`.
- Omettez `aspectRatio` pour les documents sans taille fixe, comme les tickets de caisse, et Redresser les estime.
- [Redresser](../guide/tools/straighten) explique l’estimation et que faire des coins qui sortent de la photo.
