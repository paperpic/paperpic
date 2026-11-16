---
title: Loading images
description: How to give PaperPic an image, from a URL, a file the user picks or a Blob you fetch, which formats it opens, and how your code learns that the image loaded or failed.
---

# Loading images

PaperPic shows the image that you pass in `src`. This page covers where that image can come from, which formats open, and how your code learns that the image is ready or that it failed.

## Where the image comes from

`src` takes one of three things:

- **A URL from the same origin as your page**, such as `/documents/42.jpg`.
- **A `File`** that the user picks with `<input type="file">`. [Attach and scan](../examples/attach-and-scan) shows the whole flow, from the camera to the upload.
- **A `Blob`** that your code holds, such as the body of a response.

For a `File` or a `Blob`, PaperPic creates the `blob:` URL it needs, and frees it when the image changes or the viewer is destroyed.

## Images from another origin, or behind a login {#fetch}

PaperPic reads the pixels of the image to edit it. Browsers only allow that for an image from another origin when it arrives with CORS, which PaperPic does not request. Such an image shows, but the first edit fails with an [`error`](../reference/events#error) that says so.

Fetch the image yourself, and pass the `Blob` as `src`. This also covers images behind a login, because your request carries the cookies of the user:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

The other server must allow your origin with CORS, as for any `fetch` from the page.

## Formats {#formats}

PaperPic opens every format that the browser shows in an `<img>`:

- **JPEG, PNG, WebP and AVIF** open in every [supported browser](./performance#browser-support).
- **SVG** opens when the file has `width` and `height` attributes. Without them, it has no size, and the load fails.
- **HEIC**, the format of iPhone photos, only opens in Safari. When an iPhone user picks a photo with `<input type="file" accept="image/*">`, iOS usually hands the page a JPEG copy. A HEIC file that reaches another browser in another way fails to load.

Phones often save a photo sideways, with an EXIF tag that says how to turn it. PaperPic shows the photo the way the tag says, as an `<img>` does, and the result of Apply comes out upright.

## Know when it loads or fails

The [`load`](../reference/events#load) event reports that the image is on display, with its size. If the image cannot load, because it is missing, it is not an image or the browser cannot decode it, the viewer shows a message, and the [`error`](../reference/events#error) event carries `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Invoice 42' })

pic.on('load', ({ width, height }) => {
  console.log(`The image is ${width}×${height} pixels`)
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
  console.log(`The image is ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Invoice 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`The image is ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Invoice 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

The `status` of [`getState()`](../reference/state) gives the same answer at any time: `'empty'`, `'loading'`, `'ready'` or `'error'`.

## Change or reload the image

- **A new `src`** loads the new image. While the user is editing, it discards the edits.
- **The same `src`** does nothing, so the result of Apply stays on display.
- **[`reload()`](../reference/methods#reload)** loads the current `src` again, which brings back the original after an Apply.
