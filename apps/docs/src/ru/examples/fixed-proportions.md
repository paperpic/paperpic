---
title: Фиксированные пропорции
description: Полный пример, в котором пользователь выбирает тип документа, например лист A4 или удостоверение личности, чтобы «Выровнять» придал результату точные пропорции.
---

# Фиксированные пропорции

«Выровнять» оценивает пропорции документа по фотографии, и точной эта оценка быть не может. Когда ваше приложение знает, что фотографирует пользователь, например бланк A4 или удостоверение личности, [`aspectRatio`](../reference/options#aspectratio) придаёт результату его настоящую форму. В этом примере пользователь выбирает тип документа перед выравниванием.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">Лист A4</option>
  <option value="letter">Лист US Letter</option>
  <option value="idCard">Удостоверение личности</option>
  <option value="other">Другое</option>
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
  alt: 'Подписанная форма',
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
  { name: 'Лист A4', aspectRatio: 210 / 297 },
  { name: 'Лист US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Удостоверение личности', aspectRatio: 85.6 / 53.98 },
  { name: 'Другое', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="Подписанная форма" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'Лист A4', aspectRatio: 210 / 297 },
  { name: 'Лист US Letter', aspectRatio: 8.5 / 11 },
  { name: 'Удостоверение личности', aspectRatio: 85.6 / 53.98 },
  { name: 'Другое', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Подписанная форма" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Примечания

- «Выровнять» запоминает пропорции, когда пользователь нажимает «Готово», поэтому выбирайте тип до выравнивания. Изменение позже влияет только на следующее выравнивание.
- Для документа в альбомной ориентации поменяйте числа местами, например `297 / 210`.
- Не задавайте `aspectRatio` для документов без фиксированного размера, например чеков, и «Выровнять» оценит их сам.
- [«Выровнять»](../guide/tools/straighten) объясняет оценку и что делать с углами за пределами фотографии.
