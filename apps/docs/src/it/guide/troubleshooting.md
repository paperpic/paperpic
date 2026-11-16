---
title: Risoluzione dei problemi
description: Cosa fare quando il visualizzatore di PaperPic non ha altezza o stile, Tailwind CSS lo modifica, un’immagine non si carica o non si può modificare, la pagina si blocca durante Applica o una foto grande fallisce.
---

# Risoluzione dei problemi

La maggior parte dei problemi con PaperPic nasce dalla configurazione, e non dall’immagine. Cerca quello che vedi, e sotto trovi la soluzione.

## Il visualizzatore è una striscia sottile, o non si vede {#no-height}

Il visualizzatore riempie il suo contenitore, e un contenitore senza altezza si riduce all’altezza minima del visualizzatore. Dai un’altezza al contenitore, come `height: 480px`, o un posto in un layout flex o grid che gliene dia una. [Stili](./styling) mostra entrambe le strade.

## I pulsanti non hanno stile, e la console avvisa {#no-stylesheet}

La console dice `PaperPic: the stylesheet is missing, so the viewer has no layout.` Importa il foglio di stile una volta nella tua app: `@paperpic/core/style.css`, o lo `style.css` di `@paperpic/vue` o di `@paperpic/react`.

## Tailwind CSS toglie i bordi e il padding del visualizzatore {#tailwind}

Il reset di Tailwind CSS 4 vince sul foglio di stile di PaperPic quando i livelli della cascata arrivano nell’ordine sbagliato. Dai un nome ai livelli prima di importare entrambi, come mostra [Stili](./styling#tailwind).

## L’immagine si vede, ma modificarla fallisce {#other-origin}

L’[`error`](../reference/events#error) dice che l’immagine viene da un’altra origine. I browser non lasciano che PaperPic legga i pixel di un’immagine così. Scaricala tu e passa il `Blob`, come mostra [Caricare le immagini](./loading#fetch).

## L’immagine non si carica {#load-error}

Il visualizzatore mostra che non è stato possibile caricare l’immagine, e `error` porta `phase: 'load'`. Controlla che l’URL esista e che il browser apra il formato: HEIC si apre solo in Safari, e un SVG ha bisogno degli attributi `width` e `height`. [Caricare le immagini](./loading#formats) elenca i formati.

## La pagina si blocca mentre Applica è in corso {#worker}

Il worker non è partito, quindi la modifica gira sul thread principale. Funziona lo stesso, ma le foto grandi bloccano la pagina per un momento. Le cause più comuni sono:

- Una Content Security Policy senza `worker-src 'self'`, o una che richiede Trusted Types senza una policy `default`. [Prestazioni e compatibilità](./performance) elenca cosa consentire.
- Il pacchetto caricato da una CDN, da un’origine diversa da quella della pagina. I browser avviano un worker solo dall’origine della pagina.

Il pannello di rete del browser mostra se la pagina ha richiesto il file del worker, il cui nome inizia con `worker`.

## Applica fallisce con una foto grande {#too-large}

L’`error` dice `The browser could not read an image of …`. I browser limitano la dimensione di un canvas, e Safari su iOS più di tutti. Imposta [`maxOutputSize`](../reference/options#maxoutputsize), per esempio a 3000 pixel, che mantiene leggibili i documenti.

## La rotellina fa zoom sull’immagine invece di scorrere la pagina {#wheel}

Imposta [`wheelZoom: false`](../reference/options#wheelzoom). I pulsanti, la tastiera e il pizzico continuano a fare zoom.
