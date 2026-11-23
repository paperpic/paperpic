---
layout: home
title: PaperPic
titleTemplate: Document image viewer and editor
description: "Document image viewer and editor for the browser: straighten, crop, rotate and clean up phone photos, scans and any image with text. For plain JavaScript, Vue and React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Clean, readable document images, right in the browser
  tagline: Straighten, crop and clean up a phone photo, a scan or any image with text. With plain JavaScript, Vue or React, and nothing leaves the device until your code sends it.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Viewer"
    details: "Zoom with the buttons, the wheel or a pinch, pan, and fit the width of long receipts. Read-only when you need it."
    link: /guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Straighten and crop"
    details: "Turn a photo taken at an angle into a flat page, with its proportions estimated or set. The viewer finds the corners, and you can drag them."
    link: /guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Clean up"
    details: "Turn a shadowed photo into crisp black and white, and adjust brightness and contrast for color documents."
    link: /guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Full resolution"
    details: "Apply hands your code the edited image as a Blob, processed in a Web Worker so the page stays responsive."
    link: /guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessible"
    details: "Keyboard shortcuts, corner handles that move with the arrow keys, and announcements for screen readers."
    link: /guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Any framework"
    details: "One core for plain JavaScript, with thin wrappers for Vue and React, and no runtime dependencies."
    link: /guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Compare the photo and the result"
  beforeLabel: "Photo"
  afterLabel: "PaperPic"
  beforeAlt: "Photo of a receipt on a table, taken at an angle and partly in shadow"
  afterAlt: "The same receipt, straightened and cleaned up into black and white"
---

## Nothing leaves the browser

PaperPic edits the image on the device of the user, in a Web Worker, without a server and without requests of its own. A photo of a receipt, an ID card or a contract leaves the device only when your code sends the result.

## Start in a few lines

Install the package for your framework, give the container a height, and listen to Apply:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'A receipt' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="A receipt" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="A receipt" onApply={({ blob }) => upload(blob)} />
}
```

:::

[Getting started](./guide/getting-started) covers the installation and every step.
