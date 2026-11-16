---
title: Cargar imágenes
description: Cómo dar a PaperPic una imagen, desde una URL, un archivo que elige el usuario o un Blob que descargas, qué formatos abre y cómo sabe tu código que la imagen ha cargado o ha fallado.
---

# Cargar imágenes

PaperPic muestra la imagen que pasas en `src`. Esta página explica de dónde puede venir esa imagen, qué formatos se abren y cómo sabe tu código que la imagen está lista o que ha fallado.

## De dónde viene la imagen

`src` acepta una de estas tres cosas:

- **Una URL del mismo origen que tu página**, como `/documents/42.jpg`.
- **Un `File`** que el usuario elige con `<input type="file">`. [Adjuntar y escanear](../examples/attach-and-scan) muestra el flujo completo, de la cámara a la subida.
- **Un `Blob`** que tiene tu código, como el cuerpo de una respuesta.

Para un `File` o un `Blob`, PaperPic crea la URL `blob:` que necesita, y la libera cuando cambia la imagen o se destruye el visor.

## Imágenes de otro origen o tras un inicio de sesión {#fetch}

PaperPic lee los píxeles de la imagen para editarla. Los navegadores solo lo permiten con una imagen de otro origen cuando llega con CORS, que PaperPic no pide. Esa imagen se muestra, pero la primera edición falla con un [`error`](../reference/events#error) que lo dice.

Descarga tú la imagen y pasa el `Blob` como `src`. Así también funcionan las imágenes tras un inicio de sesión, porque tu petición lleva las cookies del usuario:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

El otro servidor tiene que permitir tu origen con CORS, como con cualquier `fetch` desde la página.

## Formatos {#formats}

PaperPic abre cualquier formato que el navegador muestre en un `<img>`:

- **JPEG, PNG, WebP y AVIF** se abren en todos los [navegadores compatibles](./performance#browser-support).
- **SVG** se abre cuando el archivo tiene los atributos `width` y `height`. Sin ellos no tiene tamaño, y la carga falla.
- **HEIC**, el formato de las fotos del iPhone, solo se abre en Safari. Cuando un usuario de iPhone elige una foto con `<input type="file" accept="image/*">`, iOS suele dar a la página una copia en JPEG. Un archivo HEIC que llega a otro navegador por otro camino no carga.

Los móviles suelen guardar la foto de lado, con una etiqueta EXIF que dice cómo girarla. PaperPic muestra la foto como dice la etiqueta, igual que un `<img>`, y el resultado de Aplicar sale derecho.

## Saber cuándo carga o falla

El evento [`load`](../reference/events#load) avisa de que la imagen está en pantalla, con su tamaño. Si la imagen no puede cargar, porque no existe, no es una imagen o el navegador no sabe decodificarla, el visor muestra un mensaje, y el evento [`error`](../reference/events#error) lleva `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Factura 42' })

pic.on('load', ({ width, height }) => {
  console.log(`La imagen mide ${width}×${height} píxeles`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`La imagen mide ${width}×${height} píxeles`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Factura 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`La imagen mide ${width}×${height} píxeles`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Factura 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

El `status` de [`getState()`](../reference/state) da la misma respuesta en cualquier momento: `'empty'`, `'loading'`, `'ready'` o `'error'`.

## Cambiar o recargar la imagen

- **Un `src` nuevo** carga la imagen nueva. Si el usuario está editando, descarta las ediciones.
- **El mismo `src`** no hace nada, así que el resultado de Aplicar sigue en pantalla.
- **[`reload()`](../reference/methods#reload)** vuelve a cargar el `src` actual, lo que recupera el original después de Aplicar.
