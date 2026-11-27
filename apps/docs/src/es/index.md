---
layout: home
title: PaperPic
titleTemplate: Visor y editor de imágenes de documentos
description: "Visor y editor de imágenes de documentos para el navegador: endereza, recorta, gira y limpia fotos del móvil, escaneos y cualquier imagen con texto. Para JavaScript, Vue y React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Imágenes de documentos limpias y legibles, en el propio navegador
  tagline: Endereza, recorta y limpia una foto del móvil, un escaneo o cualquier imagen con texto. Con JavaScript, Vue o React, y nada sale del dispositivo hasta que tu código lo envía.
  image:
    src: /hero.svg
    alt: ""
  actions:
    - theme: brand
      text: Empezar
      link: /es/guide/getting-started
    - theme: alt
      text: Playground
      link: /es/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visor"
    details: "Haz zoom con los botones, la rueda o pellizcando, desplázate y encaja a lo ancho los tiques largos. De solo lectura si lo necesitas."
    link: /es/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Enderezar y recortar"
    details: "Convierte una foto hecha en ángulo en una página plana, con sus proporciones estimadas o fijadas. El visor encuentra las esquinas, y puedes arrastrarlas."
    link: /es/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Limpiar"
    details: "Convierte una foto con sombras en un blanco y negro nítido, y ajusta el brillo y el contraste de los documentos en color."
    link: /es/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Resolución completa"
    details: "Aplicar entrega a tu código la imagen editada como un Blob, procesada en un Web Worker para que la página siga respondiendo."
    link: /es/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accesible"
    details: "Atajos de teclado, tiradores de esquina que se mueven con las flechas y anuncios para lectores de pantalla."
    link: /es/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Cualquier framework"
    details: "Un core para JavaScript sin framework, con wrappers ligeros para Vue y React, y sin dependencias en tiempo de ejecución."
    link: /es/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Compara la foto y el resultado"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto de un tique sobre una mesa, hecha en ángulo y en parte a la sombra"
  afterAlt: "El mismo tique, enderezado y limpiado en blanco y negro"
---

## Nada sale del navegador

PaperPic edita la imagen en el dispositivo del usuario, en un Web Worker, sin servidor y sin peticiones propias. La foto de un tique, un DNI o un contrato solo sale del dispositivo cuando tu código envía el resultado.

## Empieza en pocas líneas

Instala el paquete de tu framework, da una altura al contenedor y escucha Aplicar:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'Un tique' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="Un tique" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="Un tique" onApply={({ blob }) => upload(blob)} />
}
```

:::

[Primeros pasos](./guide/getting-started) explica la instalación y cada paso.
