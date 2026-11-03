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
</script>

<template>
  <PaperPic src="/document.jpg" alt="Scanned document" :rotation="90" />
</template>
```

Try it live in the [playground](/playground).
