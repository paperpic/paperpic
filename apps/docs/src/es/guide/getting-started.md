---
title: Primeros pasos
description: Instala PaperPic para JavaScript, Vue o React, muestra tu primera imagen de un documento y recupera la imagen editada.
---

# Primeros pasos

Esta página te lleva desde instalar PaperPic hasta mostrar una imagen y recuperar el resultado editado. Elige tu framework en cualquier ejemplo, y los demás de la web lo siguen.

## Instalación

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` requiere Vue 3.5 o posterior.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` requiere React 19 o posterior.

::::

### Sin bundler {#cdn}

El core también carga desde un CDN que sirve los archivos del paquete tal cual, como jsDelivr. Importa `dist/index.js` desde un script de módulo, y enlaza `dist/style.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Un tique' })
</script>
```

Los navegadores solo arrancan un worker del origen de la página, así que ahí la edición va en el hilo principal: funciona, pero las fotos grandes congelan la página un momento al aplicar. Sirve los archivos desde tu propio origen, o usa un bundler, para conservar el worker. Los componentes de Vue y React necesitan un bundler.

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` acepta una URL del mismo origen que tu página, o un `File` que elige el usuario, por ejemplo desde un `<input type="file">`. `alt` describe la imagen para los lectores de pantalla. [Cargar imágenes](./loading) explica las imágenes de otros orígenes, los formatos y los errores de carga.

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

## Quitar el visor {#destroy}

Los componentes de Vue y React crean el visor al montarse y lo destruyen al desmontarse. Con el core, llama a [`destroy()`](../reference/methods#destroy) cuando quites el visor de la página, por ejemplo al cambiar de ruta:

```ts
pic.destroy()
```

Saca el visor de su contenedor, detiene sus listeners y su worker, y libera la memoria de la imagen. Para volver a mostrarlo, crea uno nuevo.

## Solo mostrar la imagen

Para mostrar un documento que no se debe cambiar, desactiva la edición con `editable: false`. La página [Visor](./viewer) lo muestra en acción.

## Requisitos

PaperPic funciona en los navegadores de [Baseline Widely Available](https://web.dev/baseline). [Rendimiento y compatibilidad](./performance) explica el worker, la Content Security Policy, el renderizado en servidor y las fotos grandes.

## Siguientes pasos

- [Cargar imágenes](./loading): de dónde viene la imagen y qué formatos se abren.
- [Visor](./viewer): zoom, ajuste y uso de solo lectura.
- [Edición](./editing): el modo de edición, las herramientas, Deshacer y Aplicar.
- [Opciones](../reference/options): todo lo que puedes configurar.
- [Solución de problemas](./troubleshooting): cuando el visor no se ve o no funciona como debería.
