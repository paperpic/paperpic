---
title: Events
description: The events of PaperPic (load, error, change, apply and download), what each one carries, and how to listen to them in JavaScript, Vue and React.
---

# Events

Events tell your code what happens in the viewer. Listen to them with [`on()`](./methods#on). In Vue they are component events, such as `@apply`, and in React they are props, such as `onApply`. A listener that throws does not stop the viewer: the page gets the error as any uncaught one, and the other listeners still run.

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

The image is loaded and on display. `width` and `height` are its size in pixels. It fires each time a `src` loads, also with [`reload()`](./methods#reload), but not after Apply, whose result comes with [`apply`](#apply).

## `error`

- **Payload:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Something failed, and `phase` says what:

- `'load'`: the image could not be loaded.
- `'preview'`: an edit could not be shown, as when the image is too large for the browser. The edit stays open.
- `'apply'`: the changes could not be applied. The edit stays open.

## `change`

- **Payload:** [`PaperPicState`](./state)

The state changed, through the user or through a method, such as by zooming, opening a tool or undoing, or because Straighten [found the document](../guide/tools/straighten#finding-the-document). It carries the whole state, the same that [`getState()`](./methods#getstate) would return at that moment. Apply emits it twice: when it starts, with `busy: true`, and when it ends well, after [`apply`](#apply).

These change the state without emitting `change`:

- Loading an image, which [`load`](#load) or [`error`](#error) reports.
- An Apply that fails, which [`error`](#error) reports. `busy` is `false` again.
- `setOptions()` and the props of the components, so two-way bindings do not loop.
- A resize of the viewer, which changes `zoom` while a fit is in effect.

A pan emits nothing, because the state does not hold the position of the image. [State](./state#in-step) shows how to keep controls of your own in step.

## `apply`

- **Payload:** [`ExportedImage`](./types#exportedimage)

Apply finished, from the button, `Enter` or [`apply()`](./methods#apply), and the result is already on display. `blob` holds the image in the format `type`, which [`output`](./options#output) chooses.

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
