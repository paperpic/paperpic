---
title: Allega e scansiona
description: Un esempio completo in cui l’utente fotografa un documento o sceglie un file, lo raddrizza e lo pulisce in PaperPic, e invia il risultato al tuo server, in JavaScript, Vue e React.
---

# Allega e scansiona

La maggior parte delle app che ricevono documenti chiede all’utente una foto, come uno scontrino per una nota spese o un modulo firmato. Questo esempio permette all’utente di scattare la foto o scegliere un file, modificarlo in PaperPic e inviare il risultato al tuo server.

`upload` è la funzione di [Caricare su un server](./upload), che invia l’immagine e fallisce quando il server non la accetta.

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
  alt: 'Il documento che hai allegato',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// La modifica inizia non appena la foto è sullo schermo
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Questo file non è un’immagine che il browser può aprire'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Invio…'
  try {
    await upload(blob, type)
    status.textContent = 'Inviato'
  }
  catch {
    status.textContent = 'Non è stato possibile inviare il documento'
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
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'Questo file non è un’immagine che il browser può aprire'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Invio…'
  try {
    await upload(blob, type)
    status.value = 'Inviato'
  }
  catch {
    status.value = 'Non è stato possibile inviare il documento'
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
      alt="Il documento che hai allegato"
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

  function choose(file: File | undefined) {
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('Questo file non è un’immagine che il browser può aprire')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Invio…')
    try {
      await upload(blob, type)
      setStatus('Inviato')
    }
    catch {
      setStatus('Non è stato possibile inviare il documento')
    }
  }

  return (
    <>
      <label>
        Foto del documento
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="Il documento che hai allegato"
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

## Note

- `capture="environment"` apre la fotocamera posteriore sui telefoni, e i computer lo ignorano. Senza, i telefoni offrono la fotocamera e la libreria foto, il che va bene per i documenti che l’utente ha già.
- Il visualizzatore apre la modalità di modifica appena la foto è caricata, così l’utente passa subito a Raddrizza o Pulisci. Togli il listener di `load` per mostrare prima la foto.
- `phase: 'load'` distingue un file che il browser non può aprire, come una foto HEIC fuori da Safari, da una modifica fallita. [Caricare le immagini](../guide/loading#formats) elenca i formati.
- La foto resta nel browser finché Applica non chiama `upload`. PaperPic non invia niente da solo.
- [`maxOutputSize`](../reference/options#maxoutputsize) tiene piccolo il caricamento. Le foto dei telefoni hanno 12 megapixel o più, e i documenti restano leggibili a 3000 pixel sul lato più lungo.
