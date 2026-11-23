---
title: Prestazioni e compatibilità
description: Dove PaperPic fa il suo lavoro, cosa richiedono bundler, Content Security Policy e rendering lato server, come gestisce le grandi foto da telefono e quali browser supporta.
---

# Prestazioni e compatibilità

Le foto da telefono hanno 12 megapixel o più, e modificarle richiede lavoro vero. Questa pagina spiega dove gira quel lavoro, cosa servono alla tua build e al tuo server, e quali browser supporta PaperPic.

## Un Web Worker fa il lavoro

Il bianco e nero e Raddrizza impiegano circa un secondo e mezzo su una foto da 12 megapixel con un telefono recente, come mostrano i [tempi misurati](#measurements). Sul thread principale, la pagina resterebbe bloccata per tutto quel tempo. PaperPic li esegue quindi in un Web Worker, e la pagina continua a rispondere durante Applica. Anche la ricerca del documento avviene lì.

Il worker è incluso nel pacchetto e parte con lo standard `new Worker(new URL(…, import.meta.url))`, che bundler come Vite e webpack 5 riconoscono da soli, senza configurazione. Se il worker non può partire, la modifica gira sul thread principale: funziona comunque, ma la pagina può bloccarsi per un attimo con immagini grandi.

## Content Security Policy

Con una Content Security Policy, consenti:

- `worker-src 'self'`, per il worker.
- `img-src blob:`, perché il visualizzatore mostra i file allegati e i risultati di Applica tramite URL `blob:`.
- `paperpic` in `trusted-types`, se la tua policy limita le policy di Trusted Types, perché le icone dei pulsanti passano da quella policy.
- Una policy `default` di Trusted Types il cui `createScriptURL` accetti l’URL del worker, se la tua policy richiede Trusted Types. I bundler riconoscono solo un worker creato con un URL semplice, che Trusted Types blocca, quindi senza quella policy la modifica gira sul thread principale.

## Foto grandi

- **Durante la modifica**, l’anteprima lavora su una copia di circa 2 megapixel, così righelli e strumenti restano fluidi con qualsiasi foto.
- **Ad Applica**, ogni cambiamento viene calcolato alla risoluzione piena. Le foto grandi richiedono qualche secondo, quindi il visualizzatore mostra un messaggio e blocca i controlli nel frattempo.
- **Per risparmiare tempo e memoria**, imposta [`maxOutputSize`](../reference/options#maxoutputsize). Un limite come 2000 o 3000 pixel mantiene leggibili i documenti, rende Applica più veloce e i file più piccoli.

## Tempi misurati {#measurements}

Ogni passo di Applica, nel worker, su un Pixel 10 Pro con Chrome 156:

| Passo                             | 2 MP   | 12 MP  | 37,5 MP |
| --------------------------------- | ------ | ------ | ------- |
| Bianco e nero                     | 256 ms | 1,5 s  | 4,8 s   |
| Raddrizza                         | 251 ms | 1,6 s  | 5,0 s   |
| Esportazione in PNG               | 92 ms  | 378 ms | 979 ms  |
| Esportazione in JPEG, qualità 0,9 | 33 ms  | 142 ms | 525 ms  |

- Un movimento del righello di Pulisci richiede circa 40 ms sullo stesso telefono, perché lavora sull’anteprima di circa 2 MP.
- Un computer desktop con 8 core fa ogni passo circa sei volte più in fretta.
- A 37,5 MP, il bianco e nero ha bisogno di circa 340 MB di memoria al picco.
- I telefoni Android di fascia media e gli iPhone non sono ancora misurati.

## Rendering lato server

PaperPic ha bisogno di un browser. I componenti Vue e React renderizzano un elemento vuoto sul server, come in Nuxt o Next.js, e creano il visualizzatore nel browser. Con il core, crea tu il visualizzatore nel browser, ad esempio quando il tuo componente viene montato.

## Browser supportati

PaperPic supporta i browser di [Baseline Widely Available](https://web.dev/baseline): le funzionalità che funzionano in tutti i browser principali da almeno 30 mesi. I pacchetti sono compilati per questo obiettivo, cioè Chrome ed Edge 124, Firefox 125 e Safari 17.5 o successivi, quindi non serve transpilarli.
