---
title: Загрузка изображений
description: Как передать PaperPic изображение — по URL, из файла, который выбрал пользователь, или из полученного Blob, — какие форматы он открывает и как ваш код узнаёт, что изображение загрузилось или не загрузилось.
---

# Загрузка изображений

PaperPic показывает изображение, которое вы передаёте в `src`. Здесь описано, откуда может взяться это изображение, какие форматы открываются и как ваш код узнаёт, что изображение готово или что загрузка не удалась.

## Откуда берётся изображение

`src` принимает одно из трёх:

- **URL того же источника, что и ваша страница**, например `/documents/42.jpg`.
- **`File`**, который пользователь выбирает через `<input type="file">`. Пример [Прикрепить и отсканировать](../examples/attach-and-scan) показывает весь путь, от камеры до загрузки.
- **`Blob`**, который есть у вашего кода, например тело ответа.

Для `File` или `Blob` PaperPic сам создаёт нужный URL `blob:` и освобождает его, когда изображение меняется или просмотрщик уничтожается.

## Изображения с другого источника или за входом в аккаунт {#fetch}

Чтобы редактировать изображение, PaperPic читает его пиксели. Для изображения с другого источника браузеры разрешают это, только если оно пришло с CORS, а PaperPic его не запрашивает. Такое изображение показывается, но первая правка завершается [`error`](../reference/events#error) с объяснением.

Получите изображение сами и передайте `Blob` в `src`. Так работают и изображения за входом в аккаунт, потому что ваш запрос несёт cookie пользователя:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

Другой сервер должен разрешать ваш источник через CORS, как для любого `fetch` со страницы.

## Форматы {#formats}

PaperPic открывает любой формат, который браузер показывает в `<img>`:

- **JPEG, PNG, WebP и AVIF** открываются во всех [поддерживаемых браузерах](./performance#browser-support).
- **SVG** открывается, если у файла есть атрибуты `width` и `height`. Без них у него нет размера, и загрузка не удаётся.
- **HEIC**, формат фото с iPhone, открывается только в Safari. Когда пользователь iPhone выбирает фото через `<input type="file" accept="image/*">`, iOS обычно передаёт странице копию в JPEG. Файл HEIC, попавший в другой браузер иным путём, не загрузится.

Телефоны часто сохраняют фото боком, с тегом EXIF, который говорит, как его повернуть. PaperPic показывает фото так, как говорит тег, как это делает `<img>`, и результат кнопки «Применить» получается ровным.

## Как узнать, что изображение загрузилось или нет

Событие [`load`](../reference/events#load) сообщает, что изображение на экране, и передаёт его размер. Если изображение не загружается, потому что его нет, это не изображение или браузер не может его декодировать, просмотрщик показывает сообщение, а событие [`error`](../reference/events#error) несёт `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Счёт 42' })

pic.on('load', ({ width, height }) => {
  console.log(`Размер изображения ${width}×${height} пикселей`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`Размер изображения ${width}×${height} пикселей`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Счёт 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`Размер изображения ${width}×${height} пикселей`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Счёт 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

Поле `status` из [`getState()`](../reference/state) в любой момент даёт тот же ответ: `'empty'`, `'loading'`, `'ready'` или `'error'`.

## Смена и перезагрузка изображения

- **Новый `src`** загружает новое изображение. Если пользователь редактирует, правки отбрасываются.
- **Тот же `src`** ничего не делает, поэтому результат кнопки «Применить» остаётся на экране.
- **[`reload()`](../reference/methods#reload)** заново загружает текущий `src`, что возвращает оригинал после применения.
