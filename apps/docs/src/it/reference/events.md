---
title: Eventi
description: Gli eventi di PaperPic (load, error, change, apply e download), i dati di ciascuno e come ascoltarli in JavaScript, Vue e React.
---

# Eventi

Gli eventi dicono al tuo codice cosa succede nel visualizzatore. Ascoltali con [`on()`](./methods#on). In Vue sono eventi del componente, come `@apply`, e in React sono props, come `onApply`. Se una funzione in ascolto lancia un errore, il visualizzatore va avanti: la pagina riceve l’errore come ogni errore non gestito, e le altre funzioni vengono eseguite lo stesso.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Dati:** [`Size`](./types#size)

L’immagine è caricata e visualizzata. `width` e `height` sono la sua dimensione in pixel. Viene emesso a ogni caricamento di uno `src`, anche con [`reload()`](./methods#reload), ma non dopo Applica, il cui risultato arriva con [`apply`](#apply).

## `error`

- **Dati:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Qualcosa è fallito, e `phase` dice cosa:

- `'load'`: non è stato possibile caricare l’immagine.
- `'preview'`: non è stato possibile mostrare una modifica, per esempio perché l’immagine è troppo grande per il browser. La modifica resta aperta.
- `'apply'`: non è stato possibile applicare i cambiamenti. La modifica resta aperta.

## `change`

- **Dati:** [`PaperPicState`](./state)

Lo stato è cambiato, per mano dell’utente o di un metodo, ad esempio zoomando, aprendo uno strumento o annullando, o perché Raddrizza ha [trovato il documento](../guide/tools/straighten#finding-the-document). Invia lo stato completo, lo stesso che restituirebbe [`getState()`](./methods#getstate) in quel momento. Applica lo emette due volte: all’inizio, con `busy: true`, e alla fine se riesce, dopo [`apply`](#apply).

Queste cose cambiano lo stato senza emettere `change`:

- Il caricamento di un’immagine, che segnala [`load`](#load) o [`error`](#error).
- Un Applica che fallisce, che segnala [`error`](#error). `busy` torna `false`.
- `setOptions()` e le props dei componenti, così i binding bidirezionali non vanno in loop.
- Un ridimensionamento del visualizzatore, che cambia `zoom` mentre è in vigore un adattamento.

Spostare l’immagine non emette nulla, perché lo stato non contiene la sua posizione. [Stato](./state#in-step) mostra come sincronizzare i tuoi controlli.

## `apply`

- **Dati:** [`ExportedImage`](./types#exportedimage)

Applica è terminato, dal pulsante, `Invio` o [`apply()`](./methods#apply), e il risultato è già visualizzato. `blob` contiene l’immagine nel formato `type`, che sceglie [`output`](./options#output).

## `download`

- **Dati:** [`PaperPicDownload`](./types#paperpicdownload)

L’immagine sta per essere salvata, dal pulsante di download o da [`download()`](./methods#download). `source` è l’immagine visualizzata: il risultato dell’ultimo Applica, altrimenti il `src`. `filename` è il nome del file.

Chiama `preventDefault()` perché il browser non salvi il file, ad esempio per salvarlo in un altro modo:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
