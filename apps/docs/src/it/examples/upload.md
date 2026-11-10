---
title: Caricare su un server
description: Un esempio completo che invia al tuo server l’immagine modificata in PaperPic e dice all’utente se è stata salvata, in JavaScript, Vue e React.
---

# Caricare su un server

Il visualizzatore mostra subito il risultato di Applica, ma salvarlo spetta alla tua app. Questo esempio invia l’immagine modificata al tuo server e dice all’utente com’è andata.

Questa funzione invia l’immagine come file in un modulo, e fallisce quando il server non la accetta:

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

Il visualizzatore la chiama ad Applica, e una riga di stato riporta il risultato:

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
  alt: 'Fattura 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Salvataggio…'
  try {
    await upload(blob, type)
    status.textContent = 'Salvato'
  }
  catch {
    status.textContent = 'Non è stato possibile salvare il documento'
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
  status.value = 'Salvataggio…'
  try {
    await upload(blob, type)
    status.value = 'Salvato'
  }
  catch {
    status.value = 'Non è stato possibile salvare il documento'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Fattura 42" :max-output-size="3000" @apply="save" />
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
    setStatus('Salvataggio…')
    try {
      await upload(blob, type)
      setStatus('Salvato')
    }
    catch {
      setStatus('Non è stato possibile salvare il documento')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Fattura 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Note

- `role="status"` fa annunciare ai lettori di schermo il risultato del caricamento.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantiene il file piccolo. I documenti restano leggibili con 3000 pixel sul lato più lungo.
- Dopo Applica la cronologia è vuota, quindi l’utente non può tornare all’immagine precedente. Per offrire un pulsante Riprova, conserva l’ultimo `blob` e `type` e chiama di nuovo `upload`.
- Il server riceve PNG per un documento pulito, altrimenti il formato dell’immagine originale. Vedi [Salvare il risultato](../guide/saving) per sceglierne un altro.
