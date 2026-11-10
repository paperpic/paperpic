---
title: Subir a un servidor
description: Un ejemplo completo que envía a tu servidor la imagen editada en PaperPic y le dice al usuario si se guardó, en JavaScript, Vue y React.
---

# Subir a un servidor

El visor muestra el resultado de Aplicar al momento, pero guardarlo es cosa de tu app. Este ejemplo envía la imagen editada a tu servidor y le dice al usuario cómo ha ido.

Esta función envía la imagen como un archivo en un formulario, y falla cuando el servidor no la acepta:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

El visor la llama al aplicar, y una línea de estado informa del resultado:

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: 'Factura 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Guardando…'
  try {
    await upload(blob, type)
    status.textContent = 'Guardado'
  }
  catch {
    status.textContent = 'No se pudo guardar el documento'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = 'Guardando…'
  try {
    await upload(blob, type)
    status.value = 'Guardado'
  }
  catch {
    status.value = 'No se pudo guardar el documento'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Factura 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('Guardando…')
    try {
      await upload(blob, type)
      setStatus('Guardado')
    }
    catch {
      setStatus('No se pudo guardar el documento')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Factura 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Notas

- `role="status"` hace que los lectores de pantalla anuncien el resultado de la subida.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantiene el archivo pequeño. Los documentos siguen siendo legibles con 3000 píxeles en el lado más largo.
- Después de Aplicar, el historial está vacío, así que el usuario no puede deshacer hasta la imagen anterior. Para ofrecer un botón de reintentar, guarda el último `blob` y `type` y vuelve a llamar a `upload`.
- El servidor recibe PNG si el documento se limpió, y si no, el formato de la imagen original. Consulta [Guardar el resultado](../guide/saving) para elegir otro.
