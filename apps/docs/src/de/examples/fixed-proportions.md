---
title: Feste Seitenverhältnisse
description: Ein vollständiges Beispiel, bei dem der Nutzer die Dokumentart wählt, etwa ein US-Legal-Blatt oder eine Passseite, damit Begradigen dem Ergebnis sein genaues Seitenverhältnis gibt.
---

# Feste Seitenverhältnisse

Begradigen schätzt das Seitenverhältnis des Dokuments aus dem Foto, und die Schätzung kann nicht exakt sein. Wenn deine App weiß, was der Nutzer fotografiert, etwa ein US-Legal-Formular oder eine Passseite, gibt [`aspectRatio`](../reference/options#aspectratio) dem Ergebnis seine echte Form. In diesem Beispiel wählt der Nutzer die Dokumentart, bevor er begradigt.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">US-Legal-Blatt</option>
  <option value="passport">Passseite</option>
  <option value="envelope">DL-Umschlag</option>
  <option value="other">Anderes</option>
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
  alt: 'Unterschriebenes Formular',
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
  { name: 'US-Legal-Blatt', aspectRatio: 8.5 / 14 },
  { name: 'Passseite', aspectRatio: 125 / 88 },
  { name: 'DL-Umschlag', aspectRatio: 220 / 110 },
  { name: 'Anderes', aspectRatio: undefined },
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
  { name: 'US-Legal-Blatt', aspectRatio: 8.5 / 14 },
  { name: 'Passseite', aspectRatio: 125 / 88 },
  { name: 'DL-Umschlag', aspectRatio: 220 / 110 },
  { name: 'Anderes', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Unterschriebenes Formular" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Hinweise

- Begradigen speichert das Seitenverhältnis, wenn der Nutzer Fertig drückt, also wähle die Art vor dem Begradigen. Eine spätere Änderung wirkt nur auf das nächste Begradigen.
- Für ein Dokument im Querformat vertausche die Zahlen, etwa `14 / 8.5`.
- Das Seitenverhältnis gilt für die Seite, wie sie auf dem Bildschirm erscheint. Liegt das Foto seitlich, drehe es mit Nach links drehen, bevor du Begradigen nutzt, sonst wird ein Blatt im Hochformat gestaucht.
- Lass `aspectRatio` für Dokumente ohne feste Größe weg, etwa Kassenbons, dann schätzt Begradigen es.
- Das Bedienfeld von Begradigen bietet A4, Letter und Karte bereits als [Papierformate](../guide/tools/straighten#paper-size), daher ergänzt dieses Beispiel andere Dokumente. Ein dort gewähltes Format hat für dieses Begradigen Vorrang vor `aspectRatio`.
- [Begradigen](../guide/tools/straighten) erklärt die Schätzung und den Umgang mit Ecken außerhalb des Fotos.
