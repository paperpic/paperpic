---
title: Primi passi
description: Installa PaperPic per JavaScript, Vue o React, mostra la tua prima immagine di un documento e ricevi l’immagine modificata.
---

# Primi passi

Questa pagina ti accompagna dall’installazione di PaperPic fino a mostrare un’immagine e ricevere il risultato modificato. Scegli il tuo framework in un esempio qualsiasi, e gli altri esempi del sito lo seguono.

## Installazione

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

`@paperpic/vue` richiede Vue 3.5 o successivo.

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

`@paperpic/react` richiede React 19 o successivo.

::::

### Senza bundler {#cdn}

Il core si carica anche da una CDN che serve i file del pacchetto così come sono, come jsDelivr. Importa `dist/index.js` da uno script di modulo, e collega `dist/style.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Uno scontrino' })
</script>
```

I browser avviano un worker solo dall’origine della pagina, quindi con il pacchetto su un CDN la modifica gira sul thread principale: funziona, ma le foto grandi bloccano la pagina per un momento mentre si applicano le modifiche. Servi i file dalla tua origine, o usa un bundler, per mantenere il worker. I componenti per Vue e React hanno bisogno di un bundler.

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` accetta un URL della stessa origine della tua pagina, un `File` scelto dall’utente, ad esempio da un `<input type="file">`, o un `Blob`. `alt` descrive l’immagine per i lettori di schermo. [Caricare le immagini](./loading) spiega le immagini da altre origini, i formati e gli errori di caricamento.

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

Il `blob` mantiene il formato dell’immagine originale quando è JPEG, PNG o WebP, ed è PNG quando l’utente ha portato il documento in bianco e nero. [Formato e qualità](./saving#format) spiega come PaperPic riconosce il formato, e l’opzione [`output`](../reference/options#output) lo cambia.

## Rimuovere il visualizzatore {#destroy}

I componenti per Vue e React creano il visualizzatore quando vengono montati e lo distruggono quando vengono smontati. Con il core, chiama [`destroy()`](../reference/methods#destroy) quando togli il visualizzatore dalla pagina, per esempio quando cambia la route:

```ts
pic.destroy()
```

Toglie il visualizzatore dal suo contenitore, ferma i suoi listener e il suo worker, e libera la memoria dell’immagine. Per mostrarlo di nuovo, creane uno nuovo.

## Mostrare soltanto l’immagine

Per mostrare un documento che non si deve modificare, disattiva la modifica con `editable: false`. La pagina [Visualizzatore](./viewer) lo mostra in azione.

## Requisiti

PaperPic funziona nei browser di [Baseline Widely Available](https://web.dev/baseline). [Prestazioni e compatibilità](./performance) tratta il worker, la Content Security Policy, il rendering lato server e le foto grandi.

## Prossimi passi

- [Caricare le immagini](./loading): da dove viene l’immagine e quali formati si aprono.
- [Visualizzatore](./viewer): zoom, adattamento e uso in sola lettura.
- [Modifica](./editing): la modalità di modifica, gli strumenti e Applica.
- [Opzioni](../reference/options): tutto ciò che puoi configurare.
- [Risoluzione dei problemi](./troubleshooting): quando il visualizzatore non si vede o non funziona come dovrebbe.
