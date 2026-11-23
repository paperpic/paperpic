---
title: Fixed proportions
description: A complete example that lets the user pick the type of document, such as a Legal sheet or a passport page, so that Straighten gives the result its exact proportions.
---

# Fixed proportions

Straighten estimates the proportions of a document from the photo, and the estimate cannot be exact. When your app knows what the user photographs, such as a Legal form or a passport page, [`aspectRatio`](../reference/options#aspectratio) gives the result its real shape. This example lets the user pick the type of document before straightening it.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Legal sheet</option>
  <option value="passport">Passport page</option>
  <option value="envelope">DL envelope</option>
  <option value="other">Other</option>
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
  alt: 'Signed form',
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
  { name: 'Legal sheet', aspectRatio: 8.5 / 14 },
  { name: 'Passport page', aspectRatio: 125 / 88 },
  { name: 'DL envelope', aspectRatio: 220 / 110 },
  { name: 'Other', aspectRatio: undefined },
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
  { name: 'Legal sheet', aspectRatio: 8.5 / 14 },
  { name: 'Passport page', aspectRatio: 125 / 88 },
  { name: 'DL envelope', aspectRatio: 220 / 110 },
  { name: 'Other', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Signed form" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Notes

- Straighten stores the proportions when the user presses Done, so choose the type before straightening. Changing it later affects only the next straightening.
- For a document in landscape, swap the numbers, such as `14 / 8.5`.
- The proportions apply to the page as it shows on screen. If the photo is sideways, turn it with Rotate left before you use Straighten, or a sheet in portrait comes out squashed.
- Leave `aspectRatio` out for documents without a fixed size, such as receipts, and Straighten estimates them.
- The panel of Straighten already offers A4, Letter and Card as [paper sizes](../guide/tools/straighten#paper-size), so this example adds other documents. A size the user chooses there wins over `aspectRatio` for that straightening.
- [Straighten](../guide/tools/straighten) explains the estimate and how to handle corners that fall outside the photo.
