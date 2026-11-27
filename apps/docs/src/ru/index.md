---
layout: home
title: PaperPic
titleTemplate: Просмотр и редактирование изображений документов
description: "Просмотрщик и редактор изображений документов для браузера: выравнивание, обрезка, поворот и очистка фото с телефона, сканов и любых изображений с текстом. Для JavaScript, Vue и React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Чистые и читаемые изображения документов прямо в браузере
  tagline: Выравнивайте, обрезайте и очищайте фото с телефона, сканы и любые изображения с текстом. На JavaScript, Vue или React, и ничего не покидает устройство, пока это не отправит ваш код.
  image:
    src: /hero.svg
    alt: ""
  actions:
    - theme: brand
      text: Начать
      link: /ru/guide/getting-started
    - theme: alt
      text: Песочница
      link: /ru/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Просмотрщик"
    details: "Масштабируйте кнопками, колесом или щипком, перемещайте изображение и подгоняйте длинные чеки по ширине. При необходимости только для чтения."
    link: /ru/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Выравнивание и обрезка"
    details: "Превратите снятую под углом фотографию в ровную страницу, с оценёнными или заданными пропорциями. Просмотрщик находит углы, а вы можете их перетащить."
    link: /ru/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Очистка"
    details: "Превратите фотографию с тенями в чёткое чёрно-белое изображение, а для цветных документов настройте яркость и контрастность."
    link: /ru/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Полное разрешение"
    details: "Применение передаёт вашему коду отредактированное изображение как Blob, обработанное в Web Worker, чтобы страница оставалась отзывчивой."
    link: /ru/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Доступность"
    details: "Сочетания клавиш, угловые маркеры, которые двигаются стрелками, и объявления для программ чтения с экрана."
    link: /ru/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Любой фреймворк"
    details: "Ядро для чистого JavaScript, лёгкие обёртки для Vue и React и никаких зависимостей во время выполнения."
    link: /ru/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Сравните фотографию и результат"
  beforeLabel: "Фото"
  afterLabel: "PaperPic"
  beforeAlt: "Фотография чека на столе, снятая под углом и частично в тени"
  afterAlt: "Тот же чек, выровненный и очищенный до чёрно-белого"
---

## Начните с нескольких строк

Установите пакет для своего фреймворка, задайте контейнеру высоту и слушайте применение:

:::tabs key:framework
== JavaScript

```sh
npm install @paperpic/core
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'Чек' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```sh
npm install @paperpic/vue
```

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="Чек" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```sh
npm install @paperpic/react
```

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="Чек" onApply={({ blob }) => upload(blob)} />
}
```

:::

Установка и каждый шаг описаны в разделе [Начало работы](./guide/getting-started).
