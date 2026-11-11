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

Cada [opção](./options) é uma prop com o mesmo nome, como `:editable="false"` ou `:aspect-ratio="210 / 297"`. Uma prop alterada chega ao visualizador por `setOptions()`.

Objetos e arrays que o template monta, como `:labels="{ apply: t('apply') }"`, são novos a cada renderização do pai, e o visualizador os recebe de novo toda vez. Monte-os com `computed`.

## Eventos

| Evento     | Dados                                  |
| ---------- | -------------------------------------- |
| `apply`    | `{ blob, width, height, type }`        |
| `change`   | [`PaperPicState`](./state)             |
| `download` | `{ source, filename, preventDefault }` |
| `error`    | `{ error }`                            |
| `load`     | `{ width, height }`                    |

[Eventos](./events) descreve cada um. Uma prop alterada nunca emite `change`.

## Métodos

O componente expõe o visualizador como `instance`, com todos os [métodos](./methods). Ela é `null` até o componente ser montado:

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

Passar o mesmo `src` de novo não recarrega a imagem, então ela mantém o resultado de uma edição. Para trazer de volta a original, chame `instance.reload()`.

## Tipos

`@paperpic/vue` exporta os tipos de que você precisa, então não é preciso instalar `@paperpic/core`: `PaperPicProps`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` e `ToolId`.

## Renderização no servidor

Com renderização no servidor, como no Nuxt, o componente renderiza um elemento vazio no servidor e cria o visualizador no navegador.
