---
title: Primeros pasos
description: Instala PaperPic para JavaScript, Vue o React, muestra tu primera imagen de un documento y recupera la imagen editada.
---

# Primeros pasos

Esta página te lleva desde instalar PaperPic hasta mostrar una imagen y recuperar el resultado editado. Elige tu framework en cualquier ejemplo, y los demás de la web lo siguen.

## Instalación

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requiere Vue 3.5 o posterior.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` requiere React 19 o posterior.

:::

## Mostrar una imagen

El visor llena su contenedor, así que dale una altura al contenedor. Importa la hoja de estilos una vez en tu app.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: 'Un tique',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Un tique" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Un tique" />
    </div>
  )
}
```

:::

`src` acepta una URL del mismo origen que tu página, o un `File` que elige el usuario, por ejemplo desde un `<input type="file">`. `alt` describe la imagen para los lectores de pantalla.

## Recuperar la imagen editada

El lápiz de la barra de herramientas abre el modo de edición. Cuando el usuario aplica los cambios, el resultado sustituye a la imagen en pantalla, y el evento `apply` se lo pasa a tu código:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Un tique" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Un tique" onApply={({ blob }) => upload(blob)} />
```

:::

Aquí `upload` representa tu propio código, por ejemplo:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

El `blob` mantiene el formato de la imagen original, o es PNG cuando el usuario limpió el documento. La opción [`output`](../reference/options#output) lo cambia.

## Solo mostrar la imagen

Para mostrar un documento que no se debe cambiar, desactiva la edición con `editable: false`. La página [Visor](./viewer) lo muestra en acción.

## Requisitos

- PaperPic funciona en los navegadores de [Baseline Widely Available](https://web.dev/baseline).
- La edición se hace en un Web Worker, que empaquetadores como Vite y webpack detectan solos. Si el worker no puede arrancar, la edición se hace en el hilo principal: sigue funcionando, pero la página puede congelarse un momento con imágenes grandes.
- Con una Content Security Policy, permite el worker con `worker-src 'self'`, y permite `img-src blob:`, porque el visor muestra los archivos adjuntos y los resultados con URLs `blob:`.
- Con renderizado en el servidor, como en Nuxt o Next.js, los componentes de Vue y React renderizan un elemento vacío en el servidor y crean el visor en el navegador. Con el core, crea tú el visor en el navegador.

## Siguientes pasos

- [Visor](./viewer): zoom, ajuste y uso de solo lectura.
- [Edición](./editing): el modo de edición, las herramientas, Deshacer y Aplicar.
- [Opciones](../reference/options): todo lo que puedes configurar.
