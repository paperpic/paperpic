---
title: Metodi
description: Tutti i metodi della classe PaperPic, per controllare il visualizzatore dal tuo codice, come zoomare, adattare, ruotare, modificare, applicare, scaricare e ricaricare.
---

# Metodi

I metodi controllano il visualizzatore dal tuo codice, ad esempio da pulsanti tuoi con [`toolbar: false`](./options#toolbar). In Vue e React, la ref del componente ti dà il visualizzatore: vedi [Vue](./vue) e [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Creare e distruggere

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Crea il visualizzatore dentro `container`, che riempie. Dai un’altezza al contenitore, altrimenti il visualizzatore resta alla sua altezza minima. [Opzioni](./options) spiega cosa accetta `options`.

Lancia un `TypeError` se `container` non è un elemento. Crea il visualizzatore quando l’elemento esiste già, ad esempio al montaggio.

### `destroy()`

```ts
function destroy(): void
```

Rimuove il visualizzatore e libera tutto ciò che occupa, come il suo worker e la memoria delle sue immagini. Chiamarlo due volte non crea problemi.

## Opzioni e stato

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Cambia le opzioni che passi e mantiene le altre. `undefined` riporta un’opzione al suo valore predefinito. Non emette mai `change`, così i binding bidirezionali non vanno in loop.

### `getState()`

```ts
function getState(): PaperPicState
```

Restituisce ciò che mostra il visualizzatore, come lo zoom, la modalità e se ci sono modifiche da applicare. [Stato](./state) descrive ogni campo.

### `on()`

```ts
function on(name: keyof PaperPicEvents, listener: (payload) => void): () => void
```

Ascolta un evento e restituisce una funzione che smette di ascoltarlo. [Eventi](./events) descrive ogni evento.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

## Visualizzazione

### `zoomIn()`

```ts
function zoomIn(): void
```

Ingrandisce di un passo, attorno al centro del visualizzatore.

### `zoomOut()`

```ts
function zoomOut(): void
```

Riduce di un passo, attorno al centro del visualizzatore.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: { x: number, y: number }): void
```

Imposta lo zoom, dove `1` mostra un pixel dell’immagine per pixel dello schermo. `point` resta al suo posto: è in pixel CSS dall’angolo in alto a sinistra del visualizzatore, e per impostazione predefinita è il suo centro.

Lo zoom va dall’adattamento dell’immagine intera, o `1` se è più piccolo, fino a `8`. Un valore fuori da questo intervallo viene limitato.

### `fit()`

```ts
function fit(fit: 'image' | 'width' | 'height'): void
```

Adatta al visualizzatore l’immagine intera, la sua larghezza o la sua altezza.

## Modifica

### `edit()`

```ts
function edit(): void
```

Avvia la modifica. Non fa nulla se l’immagine non è pronta o se [`editable`](./options#editable) è `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Ruota l’immagine di un quarto di giro: in senso orario con `1`, il valore predefinito, e in senso antiorario con `-1`. Durante la modifica è un cambiamento che [`apply()`](#apply) rende permanente. In un visualizzatore di sola lettura cambia solo la visualizzazione. Negli altri casi non fa nulla.

### `flip()`

```ts
function flip(): void
```

Capovolge l’immagine da sinistra a destra così come appare, quindi dopo un quarto di giro la capovolge ancora da sinistra a destra. Per metterla sottosopra, capovolgila e ruotala due volte. È un cambiamento, e non fa nulla fuori dalla modalità di modifica o con uno strumento aperto.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Apre Ritaglia, con `'crop'`, o Raddrizza, con `'perspective'`: gli strumenti con una selezione propria. Lo strumento resta aperto fino a [`confirmTool()`](#confirmtool) o [`cancelTool()`](#canceltool), e nel frattempo gli altri cambiamenti, Annulla l’ultima azione, Ripeti e Applica non fanno nulla. Non fa nulla fuori dalla modalità di modifica.

### `confirmTool()`

```ts
function confirmTool(): void
```

Chiude lo strumento aperto e aggiunge la sua selezione ai cambiamenti, come `Invio`.

### `cancelTool()`

```ts
function cancelTool(): void
```

Chiude lo strumento aperto e scarta la sua selezione, come `Esc`.

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Attiva o disattiva Pulisci, o ne cambia la sensibilità, da 0 a 1. Pulisci viene sempre dopo gli altri cambiamenti. Non fa nulla fuori dalla modalità di modifica o con uno strumento aperto.

Lancia un `RangeError` se `sensitivity` non è tra 0 e 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Cambia la luminosità o il contrasto, ciascuno da -1 a 1, dove 0 lascia l’immagine com’è. Vengono dopo gli altri cambiamenti. Non fa nulla fuori dalla modalità di modifica, con uno strumento aperto o con Pulisci attivo, perché un documento pulito ha toni suoi.

Lancia un `RangeError` se un valore non è tra -1 e 1.

### `undo()`

```ts
function undo(): void
```

Annulla l’ultimo cambiamento.

### `redo()`

```ts
function redo(): void
```

Ripristina l’ultimo cambiamento annullato.

### `apply()`

```ts
function apply(): Promise<void>
```

Applica i cambiamenti alla risoluzione piena, o a [`maxOutputSize`](./options#maxoutputsize). Il risultato diventa l’immagine visualizzata, la cronologia si svuota, il visualizzatore torna alla modalità di visualizzazione e l’evento [`apply`](./events#apply) porta il risultato. Applica non si può interrompere, e blocca i controlli mentre è in corso.

Se fallisce, l’evento [`error`](./events#error) lo segnala e la modifica resta aperta.

### `cancel()`

```ts
function cancel(): void
```

Scarta i cambiamenti e torna alla modalità di visualizzazione. Non chiede conferma: lo fanno il pulsante Annulla integrato e `Esc`.

## Immagine

### `download()`

```ts
function download(): void
```

Salva come file l’immagine visualizzata: il risultato dell’ultimo Applica, altrimenti l’immagine originale. Funziona senza l’opzione [`download`](./options#download), che mostra solo un pulsante. L’evento [`download`](./events#download) arriva prima e può impedirlo. Non fa nulla durante la modifica, perché i cambiamenti non sono ancora applicati.

### `reload()`

```ts
function reload(): void
```

Ricarica il [`src`](./options#src) attuale, il che riporta l’originale dopo un Applica.
