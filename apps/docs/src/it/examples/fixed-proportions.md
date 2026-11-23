---
title: Proporzioni fisse
description: Un esempio completo che lascia scegliere all’utente il tipo di documento, come un foglio US Legal o una pagina di passaporto, perché Raddrizza dia al risultato le sue proporzioni esatte.
---

# Proporzioni fisse

Raddrizza stima le proporzioni del documento dalla foto, e la stima non può essere esatta. Quando la tua app sa cosa fotografa l’utente, come un modulo US Legal o una pagina di passaporto, [`aspectRatio`](../reference/options#aspectratio) dà al risultato la sua forma reale. Questo esempio lascia scegliere all’utente il tipo di documento prima di raddrizzarlo.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Foglio US Legal</option>
  <option value="passport">Pagina di passaporto</option>
  <option value="envelope">Busta DL</option>
  <option value="other">Altro</option>
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
  alt: 'Modulo firmato',
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
  { name: 'Foglio US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Pagina di passaporto', aspectRatio: 125 / 88 },
  { name: 'Busta DL', aspectRatio: 220 / 110 },
  { name: 'Altro', aspectRatio: undefined },
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
  { name: 'Foglio US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Pagina di passaporto', aspectRatio: 125 / 88 },
  { name: 'Busta DL', aspectRatio: 220 / 110 },
  { name: 'Altro', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Modulo firmato" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Note

- Raddrizza memorizza le proporzioni quando l’utente preme Fatto, quindi scegli il tipo prima di raddrizzare. Cambiarlo dopo vale solo per il raddrizzamento successivo.
- Per un documento in orizzontale, inverti i numeri, come `14 / 8.5`.
- Le proporzioni valgono per la pagina come appare sullo schermo. Se la foto è di lato, ruotala con Ruota a sinistra prima di usare Raddrizza, altrimenti un foglio in verticale esce schiacciato.
- Lascia `aspectRatio` non impostato per i documenti senza dimensione fissa, come gli scontrini, e Raddrizza le stima.
- Il pannello di Raddrizza offre già A4, Lettera e Tessera come [formati carta](../guide/tools/straighten#paper-size), quindi questo esempio aggiunge altri documenti. Il formato che l’utente sceglie lì prevale su `aspectRatio` per quel raddrizzamento.
- [Raddrizza](../guide/tools/straighten) spiega la stima e cosa fare con gli angoli che escono dalla foto.
