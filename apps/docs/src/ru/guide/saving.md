---
title: Сохранение результата
description: Как PaperPic передаёт отредактированное изображение, как выбрать его формат и размер, как его загрузить и как работают кнопка скачивания и её событие.
---

# Сохранение результата

PaperPic ничего не загружает и не хранит. Когда пользователь применяет изменения, он передаёт результат вашему коду, а куда его отправить, решает ваше приложение. На этой странице — что вы получаете и как это сохранить.

## Событие `apply`

«Применить» вычисляет результат и вызывает [`apply`](../reference/events#apply) с данными:

| Поле              | Тип      | Описание                           |
| ----------------- | -------- | ---------------------------------- |
| `blob`            | `Blob`   | Отредактированное изображение      |
| `width`, `height` | `number` | Его размер в пикселях              |
| `type`            | `string` | Его формат, например `'image/png'` |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

После применения результат становится изображением на экране, история пуста, а следующее редактирование начинается с результата. [`reload()`](../reference/methods#reload) возвращает исходный `src`.

## Загрузка на сервер

Отправьте `blob` как файл в форме:

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

Просмотрщик сразу показывает результат, дошёл он до вашего сервера или нет, поэтому сообщите пользователю, если загрузка не удалась.

## Формат и качество

Без опций результат сохраняет формат исходного изображения: JPEG, PNG или WebP. Очищенный документ сохраняется в PNG, потому что JPEG добавил бы артефакты вокруг его чётких краёв. Любое другое исходное изображение, например GIF, даёт PNG.

[`output`](../reference/options#output) выбирает формат и его качество от 0 до 1 для JPEG и WebP, по умолчанию 0.92:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| Формат       | Подходит для                                               |
| ------------ | ---------------------------------------------------------- |
| `image/png`  | Очищенных документов и текста, без потерь                  |
| `image/jpeg` | Фотографий и цветных документов, в небольших файлах        |
| `image/webp` | Фотографий и цветных документов, в файлах меньше, чем JPEG |

Браузер, который не умеет кодировать запрошенный формат, даёт PNG, поэтому смотрите `type` в событии.

## Размер

Результат сохраняет полное разрешение исходного изображения — у многих фотографий с телефона это 12 мегапикселей и больше. [`maxOutputSize`](../reference/options#maxoutputsize) ограничивает его длинную сторону в пикселях:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

Предпросмотр во время редактирования всегда около 2 мегапикселей, поэтому `maxOutputSize` меняет только результат.

## Кнопка скачивания

[`download: true`](../reference/options#download) добавляет в конец панели инструментов кнопку, которая сохраняет изображение на экране: результат последнего применения или, если его нет, исходное изображение как есть. Во время редактирования она скрыта, потому что изменения ещё не применены. [`download()`](../reference/methods#download) делает то же из кода, с кнопкой или без неё. Контекстное меню браузера над просмотрщиком не открывается, поэтому эта кнопка — способ сохранить из него изображение.

Файл сохраняет имя исходного изображения и получает расширение своего формата, поэтому очищенный `receipt.jpg` сохраняется как `receipt.png`. [`filename`](../reference/options#filename) задаёт другое имя. Если имени нет совсем, как у `Blob`, файл называется `image`.

### Сохранить иначе

Событие [`download`](../reference/events#download) приходит до того, как браузер сохранит файл. Вызовите `preventDefault()`, чтобы сохранить его иначе, например через ваш сервер, который может назвать файл и проверить, кто его скачивает:

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
