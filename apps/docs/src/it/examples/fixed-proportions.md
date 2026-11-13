---
title: Proporzioni fisse
description: Un esempio completo che lascia scegliere all’utente il tipo di documento, come un foglio A4 o una carta d’identità, perché Raddrizza dia al risultato le sue proporzioni esatte.
---

# Proporzioni fisse

Raddrizza stima le proporzioni del documento dalla foto, e la stima non può essere esatta. Quando la tua app sa cosa fotografa l’utente, come un modulo A4 o una carta d’identità, [`aspectRatio`](../reference/options#aspectratio) dà al risultato la sua forma reale. Questo esempio lascia scegliere all’utente il tipo di documento prima di raddrizzarlo.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">Foglio A4</option>
  <option value="letter">Foglio US Letter</option>
  <option value="idCard">Carta d’identità</option>
  <option value="other">Altro</option>
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
  alt: 'Modulo firmato',
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
  { name: 'Foglio A4', aspectRatio: 210 / 297 },
  { name: 'Foglio US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Carta d’identità', aspectRatio: 85.6 / 53.98 },
  { name: 'Altro', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="Modulo firmato" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'Foglio A4', aspectRatio: 210 / 297 },
  { name: 'Foglio US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Carta d’identità', aspectRatio: 85.6 / 53.98 },
  { name: 'Altro', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Modulo firmato" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Note

- Raddrizza memorizza le proporzioni quando l’utente preme Fatto, quindi scegli il tipo prima di raddrizzare. Cambiarlo dopo vale solo per il raddrizzamento successivo.
- Per un documento in orizzontale, inverti i numeri, come `297 / 210`.
- Lascia `aspectRatio` non impostato per i documenti senza dimensione fissa, come gli scontrini, e Raddrizza le stima.
- [Raddrizza](../guide/tools/straighten) spiega la stima e cosa fare con gli angoli che escono dalla foto.
