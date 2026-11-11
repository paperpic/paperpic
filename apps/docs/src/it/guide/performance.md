---
title: Prestazioni e compatibilità
description: Dove PaperPic fa il suo lavoro, cosa richiedono bundler, Content Security Policy e rendering lato server, come gestisce le grandi foto da telefono e quali browser supporta.
---

# Prestazioni e compatibilità

Le foto da telefono hanno 12 megapixel o più, e modificarle richiede lavoro vero. Questa pagina spiega dove gira quel lavoro, cosa servono alla tua build e al tuo server, e quali browser supporta PaperPic.

## Un Web Worker fa il lavoro

Pulisci e Raddrizza impiegano più di un secondo su una foto da 12 megapixel su un telefono. Sul thread principale, la pagina resterebbe bloccata per tutto quel tempo. PaperPic li esegue invece in un Web Worker, così la pagina resta reattiva mentre Applica è in corso.

Il worker è incluso nel pacchetto e parte con lo standard `new Worker(new URL(…, import.meta.url))`, che bundler come Vite e webpack 5 riconoscono da soli, senza configurazione. Se il worker non può partire, la modifica gira sul thread principale: funziona comunque, ma la pagina può bloccarsi per un attimo con immagini grandi.

## Content Security Policy

Con una Content Security Policy, consenti:

- `worker-src 'self'`, per il worker.
- `img-src blob:`, perché il visualizzatore mostra i file allegati e i risultati di Applica tramite URL `blob:`.

## Foto grandi

- **Durante la modifica**, l’anteprima lavora su una copia di circa 2 megapixel, così cursori e strumenti restano fluidi con qualsiasi foto.
- **Ad Applica**, ogni cambiamento viene calcolato alla risoluzione piena. Le foto grandi richiedono qualche secondo, quindi il visualizzatore mostra un messaggio e blocca i controlli nel frattempo.
- **Per risparmiare tempo e memoria**, imposta [`maxOutputSize`](../reference/options#maxoutputsize). Un limite come 2000 o 3000 pixel mantiene leggibili i documenti, rende Applica più veloce e i file più piccoli.

## Immagini accettate

`src` accetta un URL della stessa origine della tua pagina, oppure un `File` o un `Blob` allegato nel client. PaperPic legge i pixel dell’immagine, e i browser lo consentono per le immagini di altre origini solo tramite CORS, che PaperPic non richiede. Servi le immagini dal tuo dominio, oppure scaricale tu e passa il `Blob`.

## Rendering lato server

PaperPic ha bisogno di un browser. I componenti Vue e React renderizzano un elemento vuoto sul server, come in Nuxt o Next.js, e creano il visualizzatore nel browser. Con il core, crea tu il visualizzatore nel browser, ad esempio quando il tuo componente viene montato.

## Browser supportati

PaperPic supporta i browser di [Baseline Widely Available](https://web.dev/baseline): le funzionalità che funzionano in tutti i browser principali da almeno 30 mesi. I pacchetti sono compilati per questo obiettivo, cioè Chrome ed Edge 124, Firefox 125 e Safari 17.5 o successivi, quindi non serve transpilarli.
