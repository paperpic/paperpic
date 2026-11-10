---
title: Primi passi
description: Installa PaperPic per JavaScript, Vue o React, mostra la tua prima immagine di un documento e ricevi l’immagine modificata.
---

# Primi passi

Questa pagina ti accompagna dall’installazione di PaperPic fino a mostrare un’immagine e ricevere il risultato modificato. Scegli il tuo framework in un esempio qualsiasi, e gli altri esempi del sito lo seguono.

## Installazione

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` richiede Vue 3.5 o successivo.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` richiede React 19 o successivo.

:::

## Mostrare un’immagine

Il visualizzatore riempie il suo contenitore, quindi dai un’altezza al contenitore. Importa il foglio di stile una volta nella tua app.

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
  alt: 'Uno scontrino',
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
    <PaperPic src="/receipt.jpg" alt="Uno scontrino" />
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
      <PaperPic src="/receipt.jpg" alt="Uno scontrino" />
    </div>
  )
}
```

:::

`src` accetta un URL della stessa origine della tua pagina, o un `File` scelto dall’utente, ad esempio da un `<input type="file">`. `alt` descrive l’immagine per i lettori di schermo.

## Ricevere l’immagine modificata

La matita nella barra degli strumenti avvia la modalità di modifica. Quando l’utente applica le modifiche, il risultato sostituisce l’immagine visualizzata, e l’evento `apply` lo passa al tuo codice:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Uno scontrino" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Uno scontrino" onApply={({ blob }) => upload(blob)} />
```

:::

Qui `upload` rappresenta il tuo codice, ad esempio:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

Il `blob` mantiene il formato dell’immagine originale, oppure è PNG quando l’utente ha pulito il documento. L’opzione [`output`](../reference/options#output) lo cambia.

## Mostrare soltanto l’immagine

Per mostrare un documento che non si deve modificare, disattiva la modifica con `editable: false`. La pagina [Visualizzatore](./viewer) lo mostra in azione.

## Requisiti

- PaperPic funziona nei browser di [Baseline Widely Available](https://web.dev/baseline).
- La modifica gira in un Web Worker, che bundler come Vite e webpack riconoscono da soli. Se il worker non può partire, la modifica gira sul thread principale: funziona comunque, ma la pagina può bloccarsi per un attimo con immagini grandi.
- Con una Content Security Policy, consenti il worker con `worker-src 'self'`, e consenti `img-src blob:`, perché il visualizzatore mostra i file allegati e i risultati tramite URL `blob:`.
- Con il rendering lato server, come in Nuxt o Next.js, i componenti Vue e React renderizzano un elemento vuoto sul server e creano il visualizzatore nel browser. Con il core, crea tu il visualizzatore nel browser.

## Prossimi passi

- [Visualizzatore](./viewer): zoom, adattamento e uso in sola lettura.
- [Modifica](./editing): la modalità di modifica, gli strumenti e Applica.
- [Opzioni](../reference/options): tutto ciò che puoi configurare.
