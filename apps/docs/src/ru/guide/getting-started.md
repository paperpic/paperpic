---
title: Начало работы
description: Установите PaperPic для JavaScript, Vue или React, покажите первое изображение документа и получите отредактированное изображение.
---

# Начало работы

Эта страница проведёт вас от установки PaperPic до показа изображения и получения отредактированного результата. Выберите свой фреймворк в любом примере, и остальные примеры на сайте переключатся следом.

## Установка

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` требует Vue 3.5 или новее.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` требует React 19 или новее.

:::

## Показать изображение

Просмотрщик заполняет свой контейнер, поэтому задайте контейнеру высоту. Импортируйте таблицу стилей в приложении один раз.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Кассовый чек',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Кассовый чек" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Кассовый чек" />
    </div>
  )
}
```

:::

`src` принимает URL того же источника, что и ваша страница, или `File`, который выбирает пользователь, например через `<input type="file">`. `alt` описывает изображение для программ чтения с экрана.

## Получить отредактированное изображение

Карандаш на панели инструментов открывает режим редактирования. Когда пользователь применяет изменения, результат заменяет изображение на экране, а событие `apply` передаёт его вашему коду:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Кассовый чек" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Кассовый чек" onApply={({ blob }) => upload(blob)} />
```

:::

Здесь `upload` — ваш собственный код, например:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

`blob` сохраняет формат исходного изображения или будет PNG, если пользователь очистил документ. Опция [`output`](../reference/options#output) это меняет.

## Только показать изображение

Чтобы показать документ, который нельзя менять, выключите редактирование через `editable: false`. На странице [Просмотрщик](./viewer) это показано в работе.

## Требования

- PaperPic работает в браузерах из [Baseline Widely Available](https://web.dev/baseline).
- Редактирование выполняется в Web Worker, который сборщики вроде Vite и webpack подхватывают сами. Если worker не может запуститься, редактирование выполняется в основном потоке: всё работает, но страница может ненадолго замереть на больших изображениях.
- С Content Security Policy разрешите worker через `worker-src 'self'` и разрешите `img-src blob:`, потому что просмотрщик показывает прикреплённые файлы и результаты через URL `blob:`.
- При рендеринге на сервере, например в Nuxt или Next.js, компоненты Vue и React выводят на сервере пустой элемент и создают просмотрщик в браузере. С ядром создавайте просмотрщик в браузере сами.

## Что дальше

- [Просмотрщик](./viewer): масштаб, подгонка и режим только для чтения.
- [Редактирование](./editing): режим редактирования, инструменты, отмена и применение.
- [Опции](../reference/options): всё, что можно настроить.
