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

function save({ blob }: { blob: Blob }) {
  // Envie a imagem editada
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Documento digitalizado" @apply="save" />
  </div>
</template>
```

O visualizador preenche o elemento pai, então defina uma altura para ele. O lápis abre o modo de edição, e `apply` entrega a imagem editada como um `Blob`. Com `:editable="false"`, é um visualizador somente leitura.

Experimente ao vivo no [playground](/pt/playground).
