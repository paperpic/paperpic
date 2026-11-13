---
title: Events
description: The events of PaperPic and what each one carries, load, error, change, apply and download, with how to listen to them in JavaScript, Vue and React.
---

# Events

Events tell your code what happens in the viewer. Listen to them with [`on()`](./methods#on). In Vue they are component events, such as `@apply`, and in React they are props, such as `onApply`.

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

- **Payload:** [`Size`](./types#size)

The image is loaded and on display. `width` and `height` are its size in pixels.

## `error`

- **Payload:** `{ error: Error }`

The image could not be loaded, or the edits could not be applied. After a failed Apply, the edit stays open.

## `change`

- **Payload:** [`PaperPicState`](./state)

The user changed the view or the edit, such as by zooming, opening a tool or undoing. It also reports the start of Apply, with `busy: true`. `setOptions()` and the props of the components never emit it.

## `apply`

- **Payload:** [`ExportedImage`](./types#exportedimage)

The user applied the edits, and the result is already on display. `blob` holds the image in the format `type`, which [`output`](./options#output) chooses.

## `download`

- **Payload:** [`PaperPicDownload`](./types#paperpicdownload)

The image is about to be saved, from the download button or from [`download()`](./methods#download). `source` is the image on display: the result of the last Apply, or else the `src`. `filename` is the name of the file.

Call `preventDefault()` to stop the browser from saving the file, such as to save it another way:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
