---
title: Caricare le immagini
description: Come dare un’immagine a PaperPic, da un URL, da un file che sceglie l’utente o da un Blob che scarichi, quali formati apre e come il tuo codice sa che l’immagine si è caricata o è fallita.
---

# Caricare le immagini

PaperPic mostra l’immagine che passi in `src`. Questa pagina spiega da dove può venire quell’immagine, quali formati si aprono e come il tuo codice sa che l’immagine è pronta o che è fallita.

## Da dove viene l’immagine

`src` accetta una di queste tre cose:

- **Un URL della stessa origine della tua pagina**, come `/documents/42.jpg`.
- **Un `File`** che l’utente sceglie con `<input type="file">`. [Allega e scansiona](../examples/attach-and-scan) mostra tutto il flusso, dalla fotocamera al caricamento.
- **Un `Blob`** che il tuo codice ha, come il corpo di una risposta.

Per un `File` o un `Blob`, PaperPic crea l’URL `blob:` che gli serve, e lo libera quando l’immagine cambia o il visualizzatore viene distrutto.

## Immagini da un’altra origine, o dietro un accesso {#fetch}

PaperPic legge i pixel dell’immagine per modificarla. I browser lo permettono per un’immagine da un’altra origine solo quando arriva con CORS, che PaperPic non richiede. Un’immagine così si vede, ma modificarla fallisce: un [`error`](../reference/events#error) lo segnala appena un cambiamento ha bisogno dei suoi pixel, o mentre si applicano le modifiche.

Scarica tu l’immagine e passa il `Blob` come `src`. Questo copre anche le immagini dietro un accesso, perché la tua richiesta porta i cookie dell’utente:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

L’altro server deve consentire la tua origine con CORS, come per qualsiasi `fetch` dalla pagina.

## Formati {#formats}

PaperPic apre ogni formato che il browser mostra in un `<img>`:

- **JPEG, PNG, WebP e AVIF** si aprono in tutti i [browser supportati](./performance#browser-support).
- **SVG** si apre quando il file ha gli attributi `width` e `height`. Senza, non ha dimensioni, e il caricamento fallisce.
- **HEIC**, il formato delle foto dell’iPhone, si apre solo in Safari. Quando un utente iPhone sceglie una foto con `<input type="file" accept="image/*">`, di solito iOS dà alla pagina una copia in JPEG. Un file HEIC che arriva a un altro browser per un’altra strada non si carica.

I telefoni spesso salvano una foto di lato, con un tag EXIF che dice come girarla. PaperPic mostra la foto come dice il tag, come fa un `<img>`, e il risultato modificato esce dritto.

## Sapere quando si carica o fallisce

L’evento [`load`](../reference/events#load) segnala che l’immagine è sullo schermo, con le sue dimensioni. Se l’immagine non può caricarsi, perché manca, non è un’immagine o il browser non sa decodificarla, il visualizzatore mostra un messaggio, e l’evento [`error`](../reference/events#error) arriva con `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Fattura 42' })

pic.on('load', ({ width, height }) => {
  console.log(`L’immagine misura ${width}×${height} pixel`)
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
  console.log(`L’immagine misura ${width}×${height} pixel`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Fattura 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`L’immagine misura ${width}×${height} pixel`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Fattura 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

`load` viene emesso a ogni caricamento di uno `src`, anche con [`reload()`](../reference/methods#reload), ma non dopo l’applicazione delle modifiche: il risultato arriva con l’evento [`apply`](../reference/events#apply).

Lo `status` di [`getState()`](../reference/state) dà la stessa risposta in ogni momento: `'empty'`, `'loading'`, `'ready'` o `'error'`.

## Cambiare o ricaricare l’immagine

- **Un nuovo `src`** carica la nuova immagine. Mentre l’utente sta modificando, scarta le modifiche.
- **Lo stesso `src`** non fa nulla, così il risultato modificato resta sullo schermo.
- **[`reload()`](../reference/methods#reload)** ricarica lo `src` attuale, il che riporta l’originale dopo l’applicazione delle modifiche. Durante la modifica, scarta anche i cambiamenti.
