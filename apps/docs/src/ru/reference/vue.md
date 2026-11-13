---
title: Vue
description: Как компонент PaperPic для Vue переводит опции, события и методы ядра в props, события компонента и template ref.
---

# Vue

`@paperpic/vue` оборачивает просмотрщик в компонент для Vue 3.5 и новее. Опции — это props, события — события компонента, а методы находятся в `instance`, который компонент открывает наружу.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Отправьте отредактированное изображение на свой сервер
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Кассовый чек" @apply="upload" />
  </div>
</template>
```

Компонент заполняет родительский элемент, поэтому задайте родителю высоту.

## Props

Каждая [опция](./options) — это prop с тем же именем, например `:editable="false"` или `:aspect-ratio="210 / 297"`. Изменённый prop доходит до просмотрщика через `setOptions()`.

Объекты и массивы, которые строит шаблон, например `:labels="{ apply: t('apply') }"`, создаются заново при каждом рендере родителя, и просмотрщик каждый раз получает их снова. Стройте их через `computed`.

## События

| Событие    | Данные                                         |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error }`                                    |
| `load`     | [`Size`](./types#size)                         |

[События](./events) описывают каждое. Изменённый prop никогда не вызывает `change`.

## Методы

Компонент открывает просмотрщик как `instance` со всеми [методами](./methods). До монтирования компонента он равен `null`:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Увеличить
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Повторная передача того же `src` не перезагружает изображение, поэтому результат редактирования сохраняется. Чтобы вернуть оригинал, вызовите `instance.reload()`.

## Типы {#types}

`@paperpic/vue` экспортирует все типы `@paperpic/core`, так что устанавливать его не нужно: каждый из них показан в разделе [Типы](./types). Кроме того, он экспортирует типы компонента: [`PaperPicProps`](./types#paperpicprops) с его пропсами и [`PaperPicInstance`](./types#paperpicinstance) — просмотрщик в `instance`.

## Рендеринг на сервере

При рендеринге на сервере, например в Nuxt, компонент выводит на сервере пустой элемент и создаёт просмотрщик в браузере.
