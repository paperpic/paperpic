---
title: Proporciones fijas
description: Un ejemplo completo que deja al usuario elegir el tipo de documento, como una hoja A4 o una tarjeta de identidad, para que Enderezar dé al resultado sus proporciones exactas.
---

# Proporciones fijas

Enderezar estima las proporciones del documento a partir de la foto, y la estimación no puede ser exacta. Cuando tu app sabe qué fotografía el usuario, como un formulario A4 o una tarjeta de identidad, [`aspectRatio`](../reference/options#aspectratio) da al resultado su forma real. Este ejemplo deja al usuario elegir el tipo de documento antes de enderezarlo.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">Hoja A4</option>
  <option value="letter">Hoja US Letter</option>
  <option value="idCard">Tarjeta de identidad</option>
  <option value="other">Otro</option>
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
  alt: 'Formulario firmado',
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
  { name: 'Hoja A4', aspectRatio: 210 / 297 },
  { name: 'Hoja US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Tarjeta de identidad', aspectRatio: 85.6 / 53.98 },
  { name: 'Otro', aspectRatio: undefined },
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
  { name: 'Hoja A4', aspectRatio: 210 / 297 },
  { name: 'Hoja US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Tarjeta de identidad', aspectRatio: 85.6 / 53.98 },
  { name: 'Otro', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Formulario firmado" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Notas

- Enderezar guarda las proporciones cuando el usuario pulsa Hecho, así que elige el tipo antes de enderezar. Cambiarlo después solo afecta al siguiente enderezado.
- Para un documento en horizontal, invierte los números, como en `297 / 210`.
- Deja `aspectRatio` sin definir para documentos sin tamaño fijo, como los tiques, y Enderezar los estima.
- [Enderezar](../guide/tools/straighten) explica la estimación y qué hacer con las esquinas que se salen de la foto.
