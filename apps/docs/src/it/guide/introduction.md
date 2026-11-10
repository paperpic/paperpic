---
title: Che cos’è PaperPic?
description: PaperPic è un visualizzatore ed editor di immagini di documenti per il web. Si può zoomare sulle foto di carta, raddrizzarle, ritagliarle e pulirle prima che la tua app le conservi.
---

# Che cos’è PaperPic?

Le foto dei documenti arrivano storte, con ombre e piene di sfondo. PaperPic le mostra in un visualizzatore dove si può zoomare, e permette di raddrizzare e pulire ogni foto prima che la tua app la conservi, come farebbe un’app scanner.

## Cosa fa

- **Visualizzare.** Zoomare con i pulsanti, la rotellina o il pizzico, spostare l’immagine e adattare l’immagine intera, la sua larghezza o la sua altezza. Un visualizzatore di sola lettura può anche ruotare l’immagine.
- **Modificare.** Nella modalità di modifica, l’utente può ritagliare, raddrizzare una foto scattata di sbieco, ruotare, capovolgere, regolare luminosità e contrasto, e pulire il documento in bianco e nero. Ogni cambiamento si può annullare finché l’utente non applica le modifiche.
- **Consegnare.** Applica calcola il risultato alla risoluzione piena e lo passa al tuo codice come `Blob`. Un pulsante di download può anche salvarlo.

Ogni passo avviene solo quando l’utente lo chiede. Niente cambia la foto da solo.

## Cosa non fa

- Non carica nulla. La tua app decide cosa fare con il risultato.
- Non apre file PDF, solo immagini.
- Non trova da solo i bordi del documento: l’utente trascina gli angoli.

## Pacchetti

| Pacchetto         | Da usare con                                      |
| ----------------- | ------------------------------------------------- |
| `@paperpic/core`  | JavaScript senza framework, o qualsiasi framework |
| `@paperpic/vue`   | Vue 3.5 o successivo                              |
| `@paperpic/react` | React 19 o successivo                             |

I tre hanno le stesse opzioni, gli stessi eventi e metodi, e il core non ha dipendenze a runtime. La modifica gira in un Web Worker, quindi la pagina resta reattiva con foto grandi.

## Provalo

Nel [playground](../playground) puoi modificare uno scontrino di esempio, o una tua foto che non lascia mai il browser. Per aggiungere PaperPic alla tua app, vai a [Primi passi](./getting-started).
