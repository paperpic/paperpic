---
title: Просмотрщик только для чтения
description: Полный пример просмотрщика PaperPic только для чтения для вложений карточки, со списком документов, поворотом и кнопкой скачивания.
---

# Просмотрщик только для чтения

Некоторые документы нужно читать, но нельзя менять, например вложения заказа или претензии. Этот пример показывает их по одному в просмотрщике только для чтения, со списком для переключения и кнопкой скачивания.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">Счёт</option>
  <option value="1">Накладная</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Счёт' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Накладная' },
]

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  ...documents[0],
  editable: false,
  download: true,
  wheelZoom: false,
})

document.querySelector('#documents')!.addEventListener('change', (event) => {
  const index = Number((event.target as HTMLSelectElement).value)
  pic.setOptions(documents[index]!)
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Счёт' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Накладная' },
]

const current = shallowRef(documents[0]!)
</script>

<template>
  <select v-model="current">
    <option v-for="item in documents" :key="item.src" :value="item">
      {{ item.alt }}
    </option>
  </select>
  <div style="height: 480px">
    <PaperPic
      :src="current.src"
      :alt="current.alt"
      :editable="false"
      download
      :wheel-zoom="false"
    />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: 'Счёт' },
  { src: '/orders/42/delivery-note.jpg', alt: 'Накладная' },
]

export function Attachments() {
  const [index, setIndex] = useState(0)
  const current = documents[index]!

  return (
    <>
      <select value={index} onChange={event => setIndex(Number(event.target.value))}>
        {documents.map((item, position) => (
          <option key={item.src} value={position}>{item.alt}</option>
        ))}
      </select>
      <div style={{ height: 480 }}>
        <PaperPic src={current.src} alt={current.alt} editable={false} download wheelZoom={false} />
      </div>
    </>
  )
}
```

:::

## Примечания

- С `editable: false` на панели инструментов нет кнопки «Редактировать», а кнопки поворота только поворачивают изображение на экране.
- `download: true` добавляет кнопку, которая сохраняет документ как есть, с его собственным именем файла. Событие [`download`](../reference/events#download) позволяет отдавать его с вашего сервера.
- `wheelZoom: false` позволяет колесу прокручивать страницу, что подходит для просмотрщика внутри длинной страницы.
- Новый `src` загружает следующий документ и подгоняет его под просмотрщик.
