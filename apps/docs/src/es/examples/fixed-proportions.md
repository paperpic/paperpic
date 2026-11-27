---
title: Proporciones fijas
description: Un ejemplo completo que deja al usuario elegir el tipo de documento, como una hoja Legal o una página de pasaporte, para que Enderezar dé al resultado sus proporciones exactas.
---

# Proporciones fijas

Enderezar estima las proporciones del documento a partir de la foto, y la estimación no puede ser exacta. Cuando tu app sabe qué fotografía el usuario, como un formulario Legal o una página de pasaporte, [`aspectRatio`](../reference/options#aspectratio) da al resultado su forma real. Este ejemplo deja al usuario elegir el tipo de documento antes de enderezarlo.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Hoja Legal</option>
  <option value="passport">Página de pasaporte</option>
  <option value="envelope">Sobre DL</option>
  <option value="other">Otro</option>
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
  alt: 'Formulario firmado',
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
  { name: 'Hoja Legal', aspectRatio: 8.5 / 14 },
  { name: 'Página de pasaporte', aspectRatio: 125 / 88 },
  { name: 'Sobre DL', aspectRatio: 220 / 110 },
  { name: 'Otro', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="Formulario firmado" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'Hoja Legal', aspectRatio: 8.5 / 14 },
  { name: 'Página de pasaporte', aspectRatio: 125 / 88 },
  { name: 'Sobre DL', aspectRatio: 220 / 110 },
  { name: 'Otro', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Formulario firmado" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Notas

- Enderezar fija las proporciones cuando el usuario pulsa Aceptar, así que elige el tipo antes de enderezar. Cambiarlo después solo afecta al siguiente enderezado.
- Para un documento en horizontal, invierte los números, como en `14 / 8.5`.
- Las proporciones se aplican a la página tal como se ve en pantalla. Si la foto está de lado, gírala con Girar a la izquierda antes de usar Enderezar, o una hoja en vertical saldrá aplastada.
- Deja `aspectRatio` sin definir para documentos sin tamaño fijo, como los tiques, y Enderezar los estima.
- El panel de Enderezar ya ofrece A4, Carta y Tarjeta como [tamaños de papel](../guide/tools/straighten#paper-size), así que este ejemplo añade otros documentos. El tamaño que el usuario elige ahí manda sobre `aspectRatio` en ese enderezado.
- [Enderezar](../guide/tools/straighten) explica la estimación y qué hacer con las esquinas que se salen de la foto.
