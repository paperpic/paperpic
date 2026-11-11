---
title: Vue
description: Cómo el componente de PaperPic para Vue traduce las opciones, los eventos y los métodos del core a props, eventos del componente y una template ref.
---

# Vue

`@paperpic/vue` envuelve el visor en un componente para Vue 3.5 o posterior. Las opciones son props, los eventos son eventos del componente, y los métodos están en el `instance` que expone el componente.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Envía la imagen editada a tu servidor
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Un tique" @apply="upload" />
  </div>
</template>
```

El componente llena su elemento padre, así que dale una altura al padre.

## Props

Cada [opción](./options) es una prop con el mismo nombre, como `:editable="false"` o `:aspect-ratio="210 / 297"`. Un cambio en una prop llega al visor a través de `setOptions()`.

Los objetos y arrays que crea la plantilla, como `:labels="{ apply: t('apply') }"`, son nuevos en cada renderizado del padre, y el visor los recibe otra vez cada vez. Créalos con `computed`.

## Eventos

| Evento     | Datos                                  |
| ---------- | -------------------------------------- |
| `apply`    | `{ blob, width, height, type }`        |
| `change`   | [`PaperPicState`](./state)             |
| `download` | `{ source, filename, preventDefault }` |
| `error`    | `{ error }`                            |
| `load`     | `{ width, height }`                    |

[Eventos](./events) describe cada uno. Un cambio en una prop nunca emite `change`.

## Métodos

El componente expone el visor como `instance`, con todos los [métodos](./methods). Es `null` hasta que el componente se monta:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Acercar
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Pasar el mismo `src` otra vez no recarga la imagen, así que conserva el resultado de una edición. Para recuperar la original, llama a `instance.reload()`.

## Tipos

`@paperpic/vue` exporta los tipos que necesitas, así que no hace falta instalar `@paperpic/core`: `PaperPicProps`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` y `ToolId`.

## Renderizado en el servidor

Con renderizado en el servidor, como en Nuxt, el componente renderiza un elemento vacío en el servidor y crea el visor en el navegador.
