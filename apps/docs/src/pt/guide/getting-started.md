---
title: Primeiros passos com Vue
description: Instale @paperpic/vue e exiba sua primeira imagem de documento com o componente PaperPic em um aplicativo Vue 3.
---

# Primeiros passos

O PaperPic está em fase inicial de desenvolvimento. A API abaixo é provisória e vai mudar.

## Instalação

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requer o Vue 3.5 ou mais recente.

## Uso

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Documento digitalizado" :editable="false" />
  </div>
</template>
```

O visualizador preenche o elemento pai, então defina uma altura para ele.

Experimente ao vivo no [playground](/pt/playground).
