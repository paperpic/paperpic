---
title: События
description: События PaperPic и данные каждого из них, load, error, change, apply и download, и как подписаться на них в JavaScript, Vue и React.
---

# События

События сообщают вашему коду, что происходит в просмотрщике. Подписывайтесь на них через [`on()`](./methods#on). В Vue это события компонента, например `@apply`, а в React — props, например `onApply`.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Данные:** [`Size`](./types#size)

Изображение загружено и показано. `width` и `height` — его размер в пикселях.

## `error`

- **Данные:** `{ error: Error }`

Изображение не удалось загрузить или изменения не удалось применить. После неудачного применения редактирование остаётся открытым.

## `change`

- **Данные:** [`PaperPicState`](./state)

Пользователь изменил просмотр или редактирование, например масштабировал, открыл инструмент или отменил изменение. Событие также сообщает о начале применения с `busy: true`. `setOptions()` и props компонентов никогда его не вызывают.

## `apply`

- **Данные:** [`ExportedImage`](./types#exportedimage)

Пользователь применил изменения, и результат уже на экране. `blob` содержит изображение в формате `type`, который выбирает [`output`](./options#output).

## `download`

- **Данные:** [`PaperPicDownload`](./types#paperpicdownload)

Изображение вот-вот будет сохранено кнопкой скачивания или через [`download()`](./methods#download). `source` — изображение на экране: результат последнего применения или, если его нет, `src`. `filename` — имя файла.

Вызовите `preventDefault()`, чтобы браузер не сохранял файл, например чтобы сохранить его иначе:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
