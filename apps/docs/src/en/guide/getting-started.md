---
title: Getting started
description: Install PaperPic for plain JavaScript, Vue or React, show your first document image and get the edited image back.
---

# Getting started

This page takes you from installing PaperPic to showing an image and getting the edited result back. Choose your framework in any example, and the others on the site follow.

## Installation

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requires Vue 3.5 or newer.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` requires React 19 or newer.

:::

## Show an image

The viewer fills its container, so give the container a height. Import the stylesheet once in your app.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: 'A receipt',
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
    <PaperPic src="/receipt.jpg" alt="A receipt" />
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
      <PaperPic src="/receipt.jpg" alt="A receipt" />
    </div>
  )
}
```

:::

`src` takes a URL from the same origin as your page, or a `File` that the user picks, such as from an `<input type="file">`. `alt` describes the image for screen readers.

## Get the edited image

The pencil in the toolbar starts the edit mode. When the user applies the changes, the result replaces the image on display, and the `apply` event hands it to your code:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="A receipt" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="A receipt" onApply={({ blob }) => upload(blob)} />
```

:::

Here `upload` stands for your own code, such as:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

The `blob` keeps the format of the source, or is PNG when the user cleaned up the document. The [`output`](../reference/options#output) option changes it.

## Only show the image

To show a document that people should not change, turn editing off with `editable: false`. The [Viewer](./viewer) page shows it at work.

## Requirements

- PaperPic works in the browsers of [Baseline Widely Available](https://web.dev/baseline).
- The editing runs in a Web Worker, which bundlers such as Vite and webpack pick up on their own. If the worker cannot start, the editing runs on the main thread: it still works, but the page can freeze for a moment with large images.
- With a Content Security Policy, allow the worker with `worker-src 'self'`, and allow `img-src blob:`, because the viewer shows attached files and results through `blob:` URLs.
- With server-side rendering, such as in Nuxt or Next.js, the Vue and React components render an empty element on the server and create the viewer in the browser. With the core, create the viewer in the browser yourself.

## Next steps

- [Viewer](./viewer): zoom, fit and read-only use.
- [Editing](./editing): the edit mode, the tools, Undo and Apply.
- [Options](../reference/options): everything you can configure.
