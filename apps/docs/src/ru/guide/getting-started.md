---
title: Начало работы
description: Установите PaperPic для JavaScript, Vue или React, покажите первое изображение документа и получите отредактированное изображение.
---

# Начало работы

Эта страница проведёт вас от установки PaperPic до показа изображения и получения отредактированного результата. Выберите свой фреймворк в любом примере, и остальные примеры на сайте переключатся следом.

## Установка

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` требует Vue 3.5 или новее.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` требует React 19 или новее.

::::

### Без сборщика {#cdn}

Core загружается и с CDN, который отдаёт файлы пакета как есть, например jsDelivr. Импортируйте `dist/index.js` из скрипта-модуля и подключите `dist/style.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Чек' })
</script>
```

Браузеры запускают worker только с источника страницы, поэтому, если пакет загружен с CDN, редактирование идёт в основном потоке: оно работает, но при применении большие фото ненадолго замораживают страницу. Чтобы сохранить worker, отдавайте файлы со своего источника или используйте сборщик. Компонентам для Vue и React нужен сборщик.

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

`src` принимает URL того же источника, что и ваша страница, `File`, который выбирает пользователь, например через `<input type="file">`, или `Blob`. `alt` описывает изображение для программ чтения с экрана. Об изображениях с других источников, форматах и ошибках загрузки — в разделе [Загрузка изображений](./loading).

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

`blob` сохраняет формат исходного изображения, если это JPEG, PNG или WebP, и будет PNG, если пользователь очистил документ. Как PaperPic определяет формат, объясняет раздел [Формат и качество](./saving#format), а опция [`output`](../reference/options#output) его меняет.

## Удаление просмотрщика {#destroy}

Компоненты для Vue и React создают просмотрщик при монтировании и уничтожают при размонтировании. С core вызывайте [`destroy()`](../reference/methods#destroy), когда убираете просмотрщик со страницы, например при смене маршрута:

```ts
pic.destroy()
```

Метод убирает просмотрщик из контейнера, останавливает его слушатели и worker и освобождает память изображения. Чтобы показать его снова, создайте новый.

## Только показать изображение

Чтобы показать документ, который нельзя менять, выключите редактирование через `editable: false`. На странице [Просмотрщик](./viewer) это показано в работе.

## Требования

PaperPic работает в браузерах [Baseline Widely Available](https://web.dev/baseline). Worker, Content Security Policy, серверный рендеринг и большие фото описаны в разделе [Производительность и поддержка](./performance).

## Что дальше

- [Загрузка изображений](./loading): откуда берётся изображение и какие форматы открываются.
- [Просмотрщик](./viewer): масштаб, подгонка и режим только для чтения.
- [Редактирование](./editing): режим редактирования, инструменты, отмена и применение.
- [Опции](../reference/options): всё, что можно настроить.
- [Решение проблем](./troubleshooting): если просмотрщик выглядит или работает не так, как должен.
