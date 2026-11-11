---
title: Vue
description: Come il componente PaperPic per Vue trasforma le opzioni, gli eventi e i metodi del core in props, eventi del componente e una template ref.
---

# Vue

`@paperpic/vue` avvolge il visualizzatore in un componente per Vue 3.5 o successivo. Le opzioni sono props, gli eventi sono eventi del componente, e i metodi stanno sull’`instance` che il componente espone.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Invia l’immagine modificata al tuo server
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Uno scontrino" @apply="upload" />
  </div>
</template>
```

Il componente riempie il suo elemento genitore, quindi assegnagli un’altezza.

## Props

Ogni [opzione](./options) è una prop con lo stesso nome, come `:editable="false"` o `:aspect-ratio="210 / 297"`. Una prop cambiata arriva al visualizzatore tramite `setOptions()`.

Gli oggetti e gli array che il template costruisce, come `:labels="{ apply: t('apply') }"`, sono nuovi a ogni render del genitore, e il visualizzatore li riceve di nuovo ogni volta. Costruiscili invece con `computed`.

## Eventi

| Evento     | Dati                                   |
| ---------- | -------------------------------------- |
| `apply`    | `{ blob, width, height, type }`        |
| `change`   | [`PaperPicState`](./state)             |
| `download` | `{ source, filename, preventDefault }` |
| `error`    | `{ error }`                            |
| `load`     | `{ width, height }`                    |

[Eventi](./events) descrive ciascuno. Una prop cambiata non emette mai `change`.

## Metodi

Il componente espone il visualizzatore come `instance`, con tutti i [metodi](./methods). È `null` finché il componente non viene montato:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Ingrandisci
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Passare di nuovo lo stesso `src` non ricarica l’immagine, quindi conserva il risultato di una modifica. Per riavere l’originale, chiama `instance.reload()`.

## Tipi

`@paperpic/vue` esporta i tipi che ti servono, quindi non devi installare `@paperpic/core`: `PaperPicProps`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` e `ToolId`.

## Rendering lato server

Con il rendering lato server, come in Nuxt, il componente renderizza un elemento vuoto sul server e crea il visualizzatore nel browser.
