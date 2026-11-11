---
title: Saving the result
description: How PaperPic hands over the edited image, how to choose its format and size, how to upload it, and how the download button and its event work.
---

# Saving the result

PaperPic never uploads or stores anything. When the user applies the edits, it hands the result to your code, and your app decides where it goes. This page covers what you receive and how to save it.

## The `apply` event

Apply computes the result and fires [`apply`](../reference/events#apply) with:

| Field             | Type     | Description                       |
| ----------------- | -------- | --------------------------------- |
| `blob`            | `Blob`   | The edited image                  |
| `type`            | `string` | Its format, such as `'image/png'` |
| `width`, `height` | `number` | Its size in pixels                |

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

After Apply, the result is the image on display, the history is empty, and the next edit starts from the result. [`reload()`](../reference/methods#reload) brings back the original `src`.

## Upload it

Send the `blob` as a file in a form:

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

The viewer shows the result at once, whether or not it reaches your server, so tell the user when the upload fails.

## Format and quality

Without options, the result keeps the format of the source: JPEG, PNG or WebP. A cleaned up document is PNG, because JPEG would add artifacts around its sharp edges. Any other source, such as a GIF, gives PNG.

[`output`](../reference/options#output) chooses the format, and its quality from 0 to 1 for JPEG and WebP, with 0.92 by default:

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

| Format       | Suits                                                    |
| ------------ | -------------------------------------------------------- |
| `image/png`  | Cleaned up documents and text, with no loss              |
| `image/jpeg` | Photos and colored documents, in small files             |
| `image/webp` | Photos and colored documents, in smaller files than JPEG |

A browser that cannot encode the format you ask for gives PNG, so read `type` in the event.

## Size

The result keeps the full resolution of the source, which is 12 megapixels or more for many phone photos. [`maxOutputSize`](../reference/options#maxoutputsize) limits its longest side, in pixels:

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

The preview while editing is always about 2 megapixels, so `maxOutputSize` changes only the result.

## The download button

[`download: true`](../reference/options#download) adds a button at the end of the toolbar that saves the image on display: the result of the last Apply, or else the source as it is. It is hidden while editing, because the edits are not applied yet. [`download()`](../reference/methods#download) does the same from code, with or without the button. The browser's context menu does not open over the viewer, so this button is the way to save the image from it.

The file keeps the name of the source and takes the extension of its format, so a cleaned up `receipt.jpg` saves as `receipt.png`. [`filename`](../reference/options#filename) sets another name. Without any name, such as for a `Blob`, the file is called `image`.

### Save it another way

The [`download`](../reference/events#download) event comes before the browser saves the file. Call `preventDefault()` to save it another way, such as from your server, which can name the file and check who downloads it:

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
