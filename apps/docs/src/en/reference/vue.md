---
title: Vue
description: How the PaperPic component for Vue maps the options, events and methods of the core to props, component events and a template ref.
---

# Vue

`@paperpic/vue` wraps the viewer in a component for Vue 3.5 or newer. The options are props, the events are component events, and the methods are on the `instance` that the component exposes.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Send the edited image to your server
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="A receipt" @apply="upload" />
  </div>
</template>
```

The component fills its parent element, so give the parent a height.

## Props

Every [option](./options) is a prop with the same name, such as `:editable="false"` or `:aspect-ratio="210 / 297"`. A change of a prop reaches the viewer through `setOptions()`.

Objects and arrays that the template builds, such as `:labels="{ apply: t('apply') }"`, are new on every render of the parent, and the viewer receives them again each time. Build them with `computed` instead.

## Events

| Event      | Payload                                |
| ---------- | -------------------------------------- |
| `apply`    | `{ blob, width, height, type }`        |
| `change`   | [`PaperPicState`](./state)             |
| `download` | `{ source, filename, preventDefault }` |
| `error`    | `{ error }`                            |
| `load`     | `{ width, height }`                    |

[Events](./events) describes each one. A change of a prop never emits `change`.

## Methods

The component exposes the viewer as `instance`, with every [method](./methods). It is `null` until the component mounts:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Zoom in
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Passing the same `src` again does not reload the image, so it keeps the result of an edit. To bring back the original, call `instance.reload()`.

## Types

`@paperpic/vue` exports the types you need, so you do not need to install `@paperpic/core`: `PaperPicProps`, `PaperPicState`, `PaperPicEvents`, `PaperPicIcons`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` and `ToolId`.

## Server-side rendering

With server-side rendering, such as in Nuxt, the component renders an empty element on the server and creates the viewer in the browser.
