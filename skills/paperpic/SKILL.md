---
name: paperpic
description: Add PaperPic to an app, a viewer and editor that turns photos of paper into clean documents in the browser. Use when code imports @paperpic/core, @paperpic/vue or @paperpic/react, or when the user wants to show, crop, straighten or clean up photos of documents, receipts or ID cards.
---

# PaperPic

PaperPic shows an image of a document and lets the user crop, straighten, rotate, flip, adjust and clean it up. Your code gets the result as a `Blob`. The API is the same in every package: the Vue and React components take the options as props with the same names.

## Set it up

1. **Install the package of the framework.** It brings the core with it, and exports every type.

   | Framework        | Package           | Requires          |
   | ---------------- | ----------------- | ----------------- |
   | Plain JavaScript | `@paperpic/core`  | Nothing           |
   | Vue              | `@paperpic/vue`   | Vue 3.5 or newer  |
   | React            | `@paperpic/react` | React 19 or newer |

   PaperPic runs in the browsers of Baseline Widely Available.

2. **Import the stylesheet once**, from the same package: `@paperpic/core/style.css`, `@paperpic/vue/style.css` or `@paperpic/react/style.css`. Without it, the console warns `PaperPic: the stylesheet is missing`.
3. **Give the container a height.** The viewer fills its container, and otherwise stays at its minimum height.
4. **Pass `src` and `alt`.** `src` is a URL from the same origin as the page, or a `File` or `Blob` that the user attached. `alt` describes the image for screen readers.
5. **Read the result from the `apply` event.** Its payload is `{ blob, width, height, type }`.

Done when the image shows at the container's height, and `apply` hands a `Blob` to your code.

### Plain JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'A receipt',
})

pic.on('apply', ({ blob }) => upload(blob))

// When the element leaves the page:
pic.destroy()
```

Create the viewer once its element exists, in the browser. `destroy()` releases the worker and the memory of the images.

### Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="A receipt" @apply="({ blob }) => upload(blob)" />
  </div>
</template>
```

The methods live on `instance` of the component ref, which is `null` until mount: `pic.value?.instance?.zoomIn()`.

### React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="A receipt" onApply={({ blob }) => upload(blob)} />
    </div>
  )
}
```

`ref` receives a `PaperPicInstance` with the methods, which is `null` until mount. Events are props: `onApply`, `onChange`, `onDownload`, `onError`, `onLoad`.

### Upload the result

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

## Common tasks

| Task                                   | How                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Show a document without editing        | `editable: false`. The toolbar then rotates the display only.            |
| Fix the proportions of known documents | `aspectRatio: 210 / 297` for A4. Straighten gives its result that shape. |
| Choose the format of the result        | `output: { type: 'image/jpeg', quality: 0.9 }`                           |
| Limit the size of the result           | `maxOutputSize: 2000`, the longest side in pixels                        |
| Offer only some tools                  | `tools: ['crop', 'perspective', 'rotate']`                               |
| Build your own controls                | `toolbar: false`, then call the methods, such as `edit()` and `apply()`  |
| Let the user save the image            | `download: true`. The `download` event can save it another way.          |
| Translate the interface                | `labels: { ... }`, a partial object of texts                             |
| Bring back the original after an edit  | `reload()`                                                               |
| Let the wheel scroll a long page       | `wheelZoom: false`                                                       |

The tool ids are `'crop'`, `'perspective'` (Straighten), `'rotate'`, `'flip'`, `'adjust'` and `'threshold'` (Clean up).

## Behavior to plan for

- **The same `src` keeps the edit.** Passing the value again does not reload the image, so the result of Apply stays on display. Call `reload()` for the original. A new `src` while editing discards the edits.
- **The result format follows the source.** A cleaned up image is PNG, to keep the edges of the letters sharp, unless `output.type` says otherwise. The saved filename takes the matching extension.
- **Stable objects in props.** In Vue, build `labels`, `tools`, `icons` and `output` with `computed`. In React, define them outside the component or with `useMemo`. Inline event handlers are fine in both.
- **`change` comes from the user only.** `setOptions()` and prop changes never emit it.
- **Errors arrive as an event.** `error` carries `{ error }` when the image fails to load or Apply fails. After a failed Apply, the edit stays open.
- **Server-side rendering works with the components.** In Nuxt or Next.js, they render an empty element on the server and create the viewer in the browser. The React component is already marked `'use client'`.
- **Content Security Policy:** allow `worker-src 'self'` and `img-src blob:`.
- **`icons` is inserted as HTML.** Pass only markup you trust.

## Full reference

- The types in `node_modules/@paperpic/core/dist/index.d.ts` document every option, method and event, and match the installed version.
- The docs: https://paperpic.dev/reference/options, `/reference/methods`, `/reference/events`, `/reference/vue` and `/reference/react`.
- All the docs in one file for agents: https://paperpic.dev/llms-full.txt
