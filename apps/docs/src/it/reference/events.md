---
title: Eventi
description: Gli eventi di PaperPic e cosa porta ciascuno, load, error, change, apply e download, con come ascoltarli in JavaScript, Vue e React.
---

# Eventi

Gli eventi dicono al tuo codice cosa succede nel visualizzatore. Ascoltali con [`on()`](./methods#on). In Vue sono eventi del componente, come `@apply`, e in React sono props, come `onApply`.

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

L’immagine è caricata e visualizzata. `width` e `height` sono la sua dimensione in pixel.

## `error`

- **Dati:** `{ error: Error }`

Non è stato possibile caricare l’immagine o applicare i cambiamenti. Dopo un Applica fallito, la modifica resta aperta.

## `change`

- **Dati:** [`PaperPicState`](./state)

L’utente ha cambiato la visualizzazione o la modifica, ad esempio zoomando, aprendo uno strumento o annullando. Segnala anche l’inizio di Applica, con `busy: true`. `setOptions()` e le props dei componenti non lo emettono mai.

## `apply`

- **Dati:** [`ExportedImage`](./types#exportedimage)

L’utente ha applicato i cambiamenti, e il risultato è già visualizzato. `blob` contiene l’immagine nel formato `type`, che sceglie [`output`](./options#output).

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
