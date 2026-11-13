---
title: Fixed proportions
description: A complete example that lets the user pick the type of document, such as an A4 sheet or an ID card, so that Straighten gives the result its exact proportions.
---

# Fixed proportions

Straighten estimates the proportions of a document from the photo, and the estimate cannot be exact. When your app knows what the user photographs, such as an A4 form or an ID card, [`aspectRatio`](../reference/options#aspectratio) gives the result its real shape. This example lets the user pick the type of document before straightening it.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">A4 sheet</option>
  <option value="letter">US Letter sheet</option>
  <option value="idCard">ID card</option>
  <option value="other">Other</option>
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
  alt: 'Signed form',
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
  { name: 'A4 sheet', aspectRatio: 210 / 297 },
  { name: 'US Letter sheet', aspectRatio: 8.5 / 11 },
  { name: 'ID card', aspectRatio: 85.6 / 53.98 },
  { name: 'Other', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="Signed form" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'A4 sheet', aspectRatio: 210 / 297 },
  { name: 'US Letter sheet', aspectRatio: 8.5 / 11 },
  { name: 'ID card', aspectRatio: 85.6 / 53.98 },
  { name: 'Other', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Signed form" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Notes

- Straighten stores the proportions when the user presses Done, so choose the type before straightening. Changing it later affects only the next straightening.
- For a document in landscape, swap the numbers, such as `297 / 210`.
- Leave `aspectRatio` out for documents without a fixed size, such as receipts, and Straighten estimates them.
- [Straighten](../guide/tools/straighten) explains the estimate and how to handle corners that fall outside the photo.
