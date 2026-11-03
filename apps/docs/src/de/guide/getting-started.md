---
title: Erste Schritte mit Vue
description: Installiere @paperpic/vue und zeige dein erstes Dokumentbild mit der PaperPic-Komponente in einer Vue-3-Anwendung an.
---

# Erste Schritte

PaperPic befindet sich in einer frühen Entwicklungsphase. Die unten gezeigte API ist vorläufig und wird sich ändern.

## Installation

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` benötigt Vue 3.5 oder neuer.

## Verwendung

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/document.jpg" alt="Gescanntes Dokument" :rotation="90" />
</template>
```

Probiere es live im [Playground](/de/playground) aus.
