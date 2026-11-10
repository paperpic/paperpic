# @paperpic/vue

Vue 3 components to view and edit document images with PaperPic.

## Installation

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requires Vue 3.5 or newer.

## Usage

The viewer fills its parent element, so give the parent a height:

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function save({ blob }: ExportedImage) {
  // Upload the edited image
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="A receipt" @apply="save" />
  </div>
</template>
```

The pencil opens the edit mode. When the user applies the changes, the result replaces the image on display and the `apply` event carries it. With `:editable="false"` it is a read-only viewer.

## Documentation

[paperpic.dev](https://paperpic.dev) has the [guide](https://paperpic.dev/guide/introduction), the [props, events and methods of the component](https://paperpic.dev/reference/vue), and a [playground](https://paperpic.dev/playground).
