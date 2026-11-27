---
title: Salvare il risultato
description: Come PaperPic consegna l’immagine modificata, come sceglierne formato e dimensione, come caricarla, e come funzionano il pulsante di download e il suo evento.
---

# Salvare il risultato

PaperPic non carica né conserva mai nulla. Quando l’utente applica le modifiche, consegna il risultato al tuo codice, e la tua app decide dove va. Questa pagina spiega cosa ricevi e come salvarlo.

## L’evento `apply`

Quando si applicano le modifiche, PaperPic calcola il risultato ed emette [`apply`](../reference/events#apply) con:

| Campo             | Tipo     | Descrizione                        |
| ----------------- | -------- | ---------------------------------- |
| `blob`            | `Blob`   | L’immagine modificata              |
| `type`            | `string` | Il suo formato, come `'image/png'` |
| `width`, `height` | `number` | La sua dimensione in pixel         |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="({ blob, type }) => upload(blob, type)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={({ blob, type }) => upload(blob, type)} />
```

:::

Dopo aver applicato le modifiche, il risultato è l’immagine visualizzata, la cronologia è vuota, e la modifica successiva parte dal risultato. [`reload()`](../reference/methods#reload) riporta il `src` originale.

## Caricarlo

Invia il `blob` come file in un modulo:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

Il visualizzatore mostra subito il risultato, che arrivi o no al tuo server, quindi avvisa l’utente se il caricamento fallisce.

## Formato e qualità {#format}

Senza opzioni, il risultato mantiene il formato dell’immagine originale quando è JPEG, PNG o WebP. PaperPic lo ricava dall’estensione dell’URL, come `.jpg`, o dal tipo del `File` o del `Blob`. Un documento in bianco e nero esce in PNG, perché il JPEG aggiungerebbe artefatti intorno ai suoi bordi netti. Anche qualsiasi altra immagine originale dà PNG, come una GIF, o un URL senza estensione come `/api/documents/42`, anche se serve un JPEG.

[`output`](../reference/options#output) sceglie il formato e la sua qualità da 0 a 1 per JPEG e WebP, con 0.92 come valore predefinito:

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

| Formato      | Adatto a                                                |
| ------------ | ------------------------------------------------------- |
| `image/png`  | Documenti in bianco e nero, e testo, senza perdita      |
| `image/jpeg` | Foto e documenti a colori, in file piccoli              |
| `image/webp` | Foto e documenti a colori, in file più piccoli del JPEG |

Un browser che non sa codificare il formato richiesto dà PNG, quindi leggi `type` nell’evento.

## Dimensione

Il risultato mantiene la risoluzione piena dell’originale, che per molte foto da telefono è di 12 megapixel o più. [`maxOutputSize`](../reference/options#maxoutputsize) limita il suo lato più lungo, in pixel:

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

L’anteprima durante la modifica è al massimo di circa 2 megapixel, quindi `maxOutputSize` cambia solo il risultato.

Safari su iOS limita un canvas a circa 16 megapixel, e gli iPhone recenti scattano foto da 24 megapixel o più, quindi applicare le modifiche a piena risoluzione può fallire. Se i tuoi utenti modificano foto da un iPhone, imposta `maxOutputSize`. 3000 pixel mantengono i documenti leggibili e restano ben sotto il limite. [L’applicazione fallisce con una foto grande](./troubleshooting#too-large) mostra l’errore.

## Metadati {#metadata}

Il risultato modificato non contiene metadati. PaperPic disegna l’immagine su un canvas, quindi i dati EXIF della foto, come la posizione GPS, la fotocamera e la data, spariscono. Il pulsante di download salva l’immagine originale così com’è, con i suoi metadati, finché non si applica nessuna modifica.

## Il pulsante di download {#download}

[`download: true`](../reference/options#download) aggiunge in fondo alla barra degli strumenti un pulsante che salva l’immagine visualizzata: l’ultimo risultato modificato, altrimenti l’immagine originale così com’è. È nascosto durante la modifica, perché le modifiche non sono ancora applicate. [`download()`](../reference/methods#download) fa lo stesso dal codice, con o senza il pulsante. Il menu contestuale del browser non si apre sul visualizzatore, quindi questo pulsante è il modo per salvarne l’immagine.

Il file mantiene il nome dell’originale e prende l’estensione del suo formato, quindi un `receipt.jpg` in bianco e nero si salva come `receipt.png`. [`filename`](../reference/options#filename) imposta un altro nome. Senza alcun nome, come per un `Blob`, il file si chiama `image`. Finché non si applica nessuna modifica, un URL senza estensione si salva senza estensione, perché il suo formato è sconosciuto.

Con uno `src` da un’altra origine, i browser non salvano il file finché non si applica nessuna modifica: aprono invece l’immagine, e l’utente lascia la tua pagina. Passa l’immagine come `Blob`, come mostra [Caricare le immagini](./loading#fetch), o salvala tu nell’evento `download`.

### Salvarlo in un altro modo

L’evento [`download`](../reference/events#download) arriva prima che il browser salvi il file. Chiama `preventDefault()` per salvarlo in un altro modo, ad esempio dal tuo server, che può dare il nome al file e controllare chi lo scarica:

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
