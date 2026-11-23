---
title: Фиксированные пропорции
description: Полный пример, в котором пользователь выбирает тип документа, например лист US Legal или страницу паспорта, чтобы «Выровнять» придал результату точные пропорции.
---

# Фиксированные пропорции

«Выровнять» оценивает пропорции документа по фотографии, и точной эта оценка быть не может. Когда ваше приложение знает, что фотографирует пользователь, например бланк US Legal или страницу паспорта, [`aspectRatio`](../reference/options#aspectratio) придаёт результату его настоящую форму. В этом примере пользователь выбирает тип документа перед выравниванием.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Лист US Legal</option>
  <option value="passport">Страница паспорта</option>
  <option value="envelope">Конверт DL</option>
  <option value="other">Другое</option>
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
  alt: 'Подписанная форма',
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
  { name: 'Лист US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Страница паспорта', aspectRatio: 125 / 88 },
  { name: 'Конверт DL', aspectRatio: 220 / 110 },
  { name: 'Другое', aspectRatio: undefined },
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
  { name: 'Лист US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Страница паспорта', aspectRatio: 125 / 88 },
  { name: 'Конверт DL', aspectRatio: 220 / 110 },
  { name: 'Другое', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="Подписанная форма" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Примечания

- «Выровнять» запоминает пропорции, когда пользователь нажимает «Готово», поэтому выбирайте тип до выравнивания. Изменение позже влияет только на следующее выравнивание.
- Для документа в альбомной ориентации поменяйте числа местами, например `14 / 8.5`.
- Пропорции применяются к странице так, как она видна на экране. Если фото лежит на боку, поверните его кнопкой «Повернуть влево» до «Выровнять», иначе лист в книжной ориентации получится сплющенным.
- Не задавайте `aspectRatio` для документов без фиксированного размера, например чеков, и «Выровнять» оценит их сам.
- В элементах управления «Выровнять» уже есть [форматы бумаги](../guide/tools/straighten#paper-size) «A4», «Letter» и «Карта», поэтому этот пример добавляет другие документы. Выбранный там формат для этого выравнивания важнее `aspectRatio`.
- [«Выровнять»](../guide/tools/straighten) объясняет оценку и что делать с углами за пределами фотографии.
