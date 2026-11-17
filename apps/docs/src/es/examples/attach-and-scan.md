---
title: Adjuntar y escanear
description: Un ejemplo completo en el que el usuario hace una foto de un documento o elige un archivo, lo endereza y lo limpia en PaperPic, y envía el resultado a tu servidor, en JavaScript, Vue y React.
---

# Adjuntar y escanear

Casi todas las apps que reciben documentos piden al usuario una foto, como un tique para un gasto o un formulario firmado. Este ejemplo deja al usuario hacer la foto o elegir un archivo, editarlo en PaperPic y enviar el resultado a tu servidor.

`upload` es la función de [Subir a un servidor](./upload), que envía la imagen y falla cuando el servidor no la acepta.

:::tabs key:framework
== JavaScript

```html
<label>
  Foto del documento
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'El documento que has adjuntado',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// La edición empieza en cuanto la foto está en pantalla
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Este archivo no es una imagen que el navegador pueda abrir'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Enviando…'
  try {
    await upload(blob, type)
    status.textContent = 'Enviado'
  }
  catch {
    status.textContent = 'No se ha podido enviar el documento'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'Este archivo no es una imagen que el navegador pueda abrir'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Enviando…'
  try {
    await upload(blob, type)
    status.value = 'Enviado'
  }
  catch {
    status.value = 'No se ha podido enviar el documento'
  }
}
</script>

<template>
  <label>
    Foto del documento
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="El documento que has adjuntado"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ''
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('Este archivo no es una imagen que el navegador pueda abrir')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Enviando…')
    try {
      await upload(blob, type)
      setStatus('Enviado')
    }
    catch {
      setStatus('No se ha podido enviar el documento')
    }
  }

  return (
    <>
      <label>
        Foto del documento
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target)} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="El documento que has adjuntado"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Notas

- `capture="environment"` abre la cámara trasera en los móviles, y los ordenadores lo ignoran. Sin él, los móviles ofrecen la cámara y la galería, lo que va mejor para documentos que el usuario ya tiene.
- Vaciar el input después de cada elección permite volver a elegir la misma foto, por ejemplo para empezar de nuevo después de Aplicar.
- El visor abre el modo de edición en cuanto carga la foto, así que el usuario va directo a Enderezar o Limpiar. Quita el listener de `load` para mostrar antes la foto.
- `phase: 'load'` distingue un archivo que el navegador no puede abrir, como una foto HEIC fuera de Safari, de un cambio que falla. [Cargar imágenes](../guide/loading#formats) enumera los formatos.
- La foto se queda en el navegador hasta que Aplicar llama a `upload`. PaperPic no envía nada por su cuenta.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantiene pequeño el envío. Las fotos del móvil tienen 12 megapíxeles o más, y los documentos siguen legibles a 3000 píxeles en el lado más largo.
