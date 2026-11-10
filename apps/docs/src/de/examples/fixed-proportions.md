---
title: Feste Seitenverhältnisse
description: Ein vollständiges Beispiel, bei dem der Nutzer die Dokumentart wählt, etwa ein A4-Blatt oder eine Ausweiskarte, damit Begradigen dem Ergebnis sein genaues Seitenverhältnis gibt.
---

# Feste Seitenverhältnisse

Begradigen schätzt das Seitenverhältnis des Dokuments aus dem Foto, und die Schätzung kann nicht exakt sein. Wenn deine App weiß, was der Nutzer fotografiert, etwa ein A4-Formular oder eine Ausweiskarte, gibt [`aspectRatio`](../reference/options#aspectratio) dem Ergebnis seine echte Form. In diesem Beispiel wählt der Nutzer die Dokumentart, bevor er begradigt.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">A4-Blatt</option>
  <option value="letter">US-Letter-Blatt</option>
  <option value="idCard">Ausweiskarte</option>
  <option value="other">Anderes</option>
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
  alt: 'Unterschriebenes Formular',
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
  { name: 'A4-Blatt', aspectRatio: 210 / 297 },
  { name: 'US-Letter-Blatt', aspectRatio: 8.5 / 11 },
  { name: 'Ausweiskarte', aspectRatio: 85.6 / 53.98 },
  { name: 'Anderes', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="Unterschriebenes Formular" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'A4-Blatt', aspectRatio: 210 / 297 },
  { name: 'US-Letter-Blatt', aspectRatio: 8.5 / 11 },
  { name: 'Ausweiskarte', aspectRatio: 85.6 / 53.98 },
  { name: 'Anderes', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Unterschriebenes Formular" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Hinweise

- Begradigen speichert das Seitenverhältnis, wenn der Nutzer Fertig drückt, also wähle die Art vor dem Begradigen. Eine spätere Änderung wirkt nur auf das nächste Begradigen.
- Für ein Dokument im Querformat vertausche die Zahlen, etwa `297 / 210`.
- Lass `aspectRatio` für Dokumente ohne feste Größe weg, etwa Kassenbons, dann schätzt Begradigen es.
- [Begradigen](../guide/tools/straighten) erklärt die Schätzung und den Umgang mit Ecken außerhalb des Fotos.
