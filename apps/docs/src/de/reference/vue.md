---
title: Vue
description: Wie die PaperPic-Komponente für Vue die Optionen, Ereignisse und Methoden des Kerns auf Props, Komponentenereignisse und eine Template-Ref abbildet.
---

# Vue

`@paperpic/vue` verpackt den Viewer in eine Komponente für Vue 3.5 oder neuer. Die Optionen sind Props, die Ereignisse sind Komponentenereignisse, und die Methoden liegen auf der `instance`, die die Komponente bereitstellt.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Sende das bearbeitete Bild an deinen Server
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" @apply="upload" />
  </div>
</template>
```

Die Komponente füllt ihr Elternelement aus, gib diesem also eine Höhe.

## Props

Jede [Option](./options) ist eine Prop mit demselben Namen, etwa `:editable="false"` oder `:aspect-ratio="210 / 297"`. Eine geänderte Prop erreicht den Viewer über `setOptions()`.

Objekte und Arrays, die das Template baut, etwa `:labels="{ apply: t('apply') }"`, sind bei jedem Rendern des Elternteils neu, und der Viewer bekommt sie jedes Mal erneut. Baue sie stattdessen mit `computed`.

## Ereignisse

| Ereignis   | Daten                                          |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error }`                                    |
| `load`     | [`Size`](./types#size)                         |

[Ereignisse](./events) beschreibt jedes davon. Eine geänderte Prop löst nie `change` aus.

## Methoden

Die Komponente stellt den Viewer als `instance` bereit, mit allen [Methoden](./methods). Bis die Komponente gemountet ist, ist sie `null`:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Vergrößern
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Derselbe `src` ein zweites Mal lädt das Bild nicht neu, es behält also das Ergebnis einer Bearbeitung. Um das Original zurückzuholen, rufe `instance.reload()` auf.

## Typen {#types}

`@paperpic/vue` exportiert alle Typen von `@paperpic/core`, du musst es also nicht installieren: [Typen](./types) zeigt jeden einzelnen. Außerdem exportiert es die Typen der Komponente: [`PaperPicProps`](./types#paperpicprops) mit ihren Props und [`PaperPicInstance`](./types#paperpicinstance), den Viewer in `instance`.

## Serverseitiges Rendern

Beim serverseitigen Rendern, etwa in Nuxt, rendert die Komponente auf dem Server ein leeres Element und erstellt den Viewer im Browser.
