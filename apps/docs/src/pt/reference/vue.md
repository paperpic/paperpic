---
title: Vue
description: Como o componente PaperPic para Vue transforma as opções, os eventos e os métodos do core em props, eventos do componente e uma template ref.
---

# Vue

`@paperpic/vue` envolve o visualizador num componente para Vue 3.5 ou mais recente. As opções são props, os eventos são eventos do componente, e os métodos ficam na `instance` que o componente expõe.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Envie a imagem editada para o seu servidor
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Um recibo" @apply="upload" />
  </div>
</template>
```

O componente preenche o elemento pai, então defina uma altura para ele.

## Props

Cada [opção](./options) é uma prop com o mesmo nome, como `:editable="false"` ou `:aspect-ratio="210 / 297"`. Uma prop alterada chega ao visualizador por `setOptions()`. `class` e `style` vão para o elemento que contém o visualizador, que também tem a classe `paperpic-host`.

Um objeto ou array com o mesmo conteúdo de antes, como `:tools="['crop', 'rotate']"`, não muda nada, então o template pode montá-los. Uma função é nova a cada renderização do pai, então monte com `computed` os `labels` que têm funções, como `zoomLevel`.

## Eventos

| Evento     | Dados                                          |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error, phase }`                             |
| `load`     | [`Size`](./types#size)                         |

[Eventos](./events) descreve cada um. Uma prop alterada nunca emite `change`. [Estado](./state#in-step) mostra como guardar o estado num `shallowRef` com `@change`, `@load` e `@error`.

## Métodos {#methods}

O componente expõe o visualizador como `instance`, com os [métodos](./methods), como `zoomIn()` ou `apply()`. Ele é `null` até o componente ser montado:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Ampliar
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

O componente cria o visualizador ao ser montado e o destrói ao ser desmontado, então não chame `destroy()`. Mude as props em vez de chamar `setOptions()`, que a próxima mudança de uma prop desfaria, e use os eventos do componente em vez de `on()`.

Passar o mesmo `src` de novo não recarrega a imagem, então ela mantém o resultado de uma edição. Para trazer de volta a original, chame `instance.reload()`.

## Tipos {#types}

`@paperpic/vue` exporta todos os tipos de `@paperpic/core`, então não é preciso instalá-lo: [Tipos](./types) mostra cada um. Também exporta os tipos do componente: [`PaperPicProps`](./types#paperpicprops), com suas props, e [`PaperPicInstance`](./types#paperpicinstance), o visualizador de `instance`.

## Renderização no servidor

Com renderização no servidor, como no Nuxt, o componente renderiza um elemento vazio no servidor e cria o visualizador no navegador.
