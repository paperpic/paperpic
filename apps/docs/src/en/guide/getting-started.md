---
title: Getting started with Vue
description: Install @paperpic/vue and show your first document image with the PaperPic component in a Vue 3 app.
---

# Getting started

PaperPic is in early development. The API below is a placeholder and will change.

## Installation

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requires Vue 3.5 or newer.

## Usage

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function save({ blob }: { blob: Blob }) {
  // Upload the edited image
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Scanned document" @apply="save" />
  </div>
</template>
```

The viewer fills its parent element, so give the parent a height. The pencil opens the edit mode, and `apply` delivers the edited image as a `Blob`. With `:editable="false"` it is a read-only viewer.

Try it live in the [playground](/playground).
