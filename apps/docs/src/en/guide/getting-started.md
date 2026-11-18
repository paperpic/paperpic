---
title: Getting started
description: Install PaperPic for plain JavaScript, Vue or React, show your first document image and get the edited image back.
---

# Getting started

This page takes you from installing PaperPic to showing an image and getting the edited result back. Choose your framework in any example, and the others on the site follow.

## Installation

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

`@paperpic/vue` requires Vue 3.5 or newer.

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

`@paperpic/react` requires React 19 or newer.

::::

### Without a bundler {#cdn}

The core also loads from a CDN that serves the files of the package as they are, such as jsDelivr. Import `dist/index.js` from a module script, and link `dist/style.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'A receipt' })
</script>
```

Browsers only start a worker from the origin of the page, so with the package on a CDN the editing runs on the main thread: it works, but large photos freeze the page for a moment on Apply. Serve the files from your own origin, or use a bundler, to keep the worker. The Vue and React components need a bundler.

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` takes a URL from the same origin as your page, a `File` that the user picks, such as from an `<input type="file">`, or a `Blob`. `alt` describes the image for screen readers. [Loading images](./loading) covers images from other origins, formats and load errors.

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

The `blob` keeps the format of the source when it is JPEG, PNG or WebP, and is PNG when the user cleaned up the document into black and white. [Format and quality](./saving#format) explains how PaperPic tells the format, and the [`output`](../reference/options#output) option changes it.

## Remove the viewer {#destroy}

The Vue and React components create the viewer when they mount and destroy it when they unmount. With the core, call [`destroy()`](../reference/methods#destroy) when you take the viewer out of the page, such as when the route changes:

```ts
pic.destroy()
```

It removes the viewer from its container, stops its listeners and its worker, and frees the memory of the image. To show it again, create a new one.

## Only show the image

To show a document that people should not change, turn editing off with `editable: false`. The [Viewer](./viewer) page shows it at work.

## Requirements

PaperPic works in the browsers of [Baseline Widely Available](https://web.dev/baseline). [Performance and support](./performance) covers the worker, Content Security Policy, server-side rendering and large photos.

## Next steps

- [Loading images](./loading): where the image comes from, and which formats open.
- [Viewer](./viewer): zoom, fit and read-only use.
- [Editing](./editing): the edit mode, the tools, Undo and Apply.
- [Options](../reference/options): everything you can configure.
- [Troubleshooting](./troubleshooting): when the viewer does not look or work as it should.
