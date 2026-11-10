---
title: Guardar el resultado
description: Cómo entrega PaperPic la imagen editada, cómo elegir su formato y su tamaño, cómo subirla, y cómo funcionan el botón de descarga y su evento.
---

# Guardar el resultado

PaperPic nunca sube ni guarda nada. Cuando el usuario aplica los cambios, entrega el resultado a tu código, y tu app decide adónde va. Esta página explica qué recibes y cómo guardarlo.

## El evento `apply`

Aplicar calcula el resultado y emite [`apply`](../reference/events#apply) con:

| Campo             | Tipo     | Descripción                    |
| ----------------- | -------- | ------------------------------ |
| `blob`            | `Blob`   | La imagen editada              |
| `width`, `height` | `number` | Su tamaño en píxeles           |
| `type`            | `string` | Su formato, como `'image/png'` |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

Después de Aplicar, el resultado es la imagen en pantalla, el historial está vacío y la siguiente edición parte del resultado. [`reload()`](../reference/methods#reload) recupera el `src` original.

## Subirlo

Envía el `blob` como un archivo en un formulario:

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

El visor muestra el resultado al momento, llegue o no a tu servidor, así que avisa al usuario si la subida falla.

## Formato y calidad

Sin opciones, el resultado mantiene el formato de la imagen original: JPEG, PNG o WebP. Un documento limpiado sale en PNG, porque JPEG añadiría artefactos alrededor de sus bordes nítidos. Cualquier otra imagen original, como un GIF, da PNG.

[`output`](../reference/options#output) elige el formato y su calidad, de 0 a 1 para JPEG y WebP, con 0.92 por defecto:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| Formato      | Para                                                           |
| ------------ | -------------------------------------------------------------- |
| `image/png`  | Documentos limpiados y texto, sin pérdida                      |
| `image/jpeg` | Fotos y documentos en color, en archivos pequeños              |
| `image/webp` | Fotos y documentos en color, en archivos más pequeños que JPEG |

Un navegador que no sabe codificar el formato que pides da PNG, así que lee `type` en el evento.

## Tamaño

El resultado mantiene la resolución completa de la imagen original, que en muchas fotos de móvil es de 12 megapíxeles o más. [`maxOutputSize`](../reference/options#maxoutputsize) limita su lado más largo, en píxeles:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

La vista previa durante la edición siempre es de unos 2 megapíxeles, así que `maxOutputSize` solo cambia el resultado.

## El botón de descarga

[`download: true`](../reference/options#download) añade un botón al final de la barra de herramientas que guarda la imagen en pantalla: el resultado del último Aplicar, o si no, la imagen original tal cual. Se oculta durante la edición, porque los cambios aún no se han aplicado. [`download()`](../reference/methods#download) hace lo mismo desde el código, con o sin el botón. El menú contextual del navegador no se abre sobre el visor, así que este botón es la forma de guardar la imagen desde él.

El archivo conserva el nombre de la imagen original y toma la extensión de su formato, así que un `receipt.jpg` limpiado se guarda como `receipt.png`. [`filename`](../reference/options#filename) fija otro nombre. Sin ningún nombre, como en un `Blob`, el archivo se llama `image`.

### Guardarlo de otra forma

El evento [`download`](../reference/events#download) llega antes de que el navegador guarde el archivo. Llama a `preventDefault()` para guardarlo de otra forma, por ejemplo desde tu servidor, que puede poner nombre al archivo y comprobar quién lo descarga:

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
