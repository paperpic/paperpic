---
title: React
description: Come il componente PaperPic per React trasforma le opzioni, gli eventi e i metodi del core in props, props di callback e una ref.
---

# React

`@paperpic/react` avvolge il visualizzatore in un componente per React 19 o successivo. Le opzioni sono props, gli eventi sono props di callback, e i metodi stanno sul visualizzatore che riceve `ref`.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Invia l’immagine modificata al tuo server
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Uno scontrino" onApply={upload} />
    </div>
  )
}
```

Il componente riempie il suo elemento genitore, quindi assegnagli un’altezza.

## Props

Ogni [opzione](./options) è una prop con lo stesso nome, come `editable={false}` o `aspectRatio={210 / 297}`. Altre due props danno stile all’elemento che contiene il visualizzatore:

| Prop        | Tipo            | Descrizione                                |
| ----------- | --------------- | ------------------------------------------ |
| `className` | `string`        | Classi che si aggiungono a `paperpic-host` |
| `style`     | `CSSProperties` | Stili in linea                             |

Gli oggetti e gli array, come `labels` o `tools`, arrivano di nuovo al visualizzatore ogni volta che sono nuovi. Definiscili fuori dal componente, o con `useMemo`.

## Eventi

| Prop         | Dati                                           |
| ------------ | ---------------------------------------------- |
| `onApply`    | [`ExportedImage`](./types#exportedimage)       |
| `onChange`   | [`PaperPicState`](./state)                     |
| `onDownload` | [`PaperPicDownload`](./types#paperpicdownload) |
| `onError`    | `{ error }`                                    |
| `onLoad`     | [`Size`](./types#size)                         |

[Eventi](./events) descrive ciascuno. Una funzione nuova non ricrea il visualizzatore, quindi le funzioni in linea vanno bene. Un cambio di props non chiama mai `onChange`.

## Metodi

`ref` riceve il visualizzatore, di tipo [`PaperPicInstance`](./types#paperpicinstance), con tutti i [metodi](./methods). È `null` finché il componente non viene montato:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Ingrandisci</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Passare di nuovo lo stesso `src` non ricarica l’immagine, quindi conserva il risultato di una modifica. Per riavere l’originale, chiama `picRef.current.reload()`.

## Tipi {#types}

`@paperpic/react` esporta tutti i tipi di `@paperpic/core`, quindi non devi installarlo: [Tipi](./types) li mostra uno per uno. Esporta anche i tipi del componente: [`PaperPicProps`](./types#paperpicprops), con le sue props, e [`PaperPicInstance`](./types#paperpicinstance), il visualizzatore che riceve `ref`.

## Rendering lato server

Il componente è marcato con `'use client'`. Con il rendering lato server, come in Next.js, renderizza un elemento vuoto sul server e crea il visualizzatore nel browser.
