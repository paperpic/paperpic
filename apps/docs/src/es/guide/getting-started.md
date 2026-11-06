---
title: Primeros pasos con Vue
description: Instala @paperpic/vue y muestra tu primera imagen de un documento con el componente PaperPic en una aplicación de Vue 3.
---

# Primeros pasos

PaperPic está en una fase temprana de desarrollo. La API que aparece abajo es provisional y cambiará.

## Instalación

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requiere Vue 3.5 o posterior.

## Uso

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Documento escaneado" :editable="false" />
  </div>
</template>
```

El visor llena su elemento padre, así que dale una altura.

Pruébalo en vivo en el [playground](/es/playground).
