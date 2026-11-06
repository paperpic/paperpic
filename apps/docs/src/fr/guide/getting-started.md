---
title: Bien démarrer avec Vue
description: Installez @paperpic/vue et affichez votre première image de document avec le composant PaperPic dans une application Vue 3.
---

# Bien démarrer

PaperPic est au début de son développement. L’API présentée ci-dessous est provisoire et va changer.

## Installation

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` nécessite Vue 3.5 ou une version ultérieure.

## Utilisation

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Document numérisé" :editable="false" />
  </div>
</template>
```

La visionneuse remplit son élément parent : donnez-lui une hauteur.

Essayez-le en direct dans le [playground](/fr/playground).
