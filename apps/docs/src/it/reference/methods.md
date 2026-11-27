---
title: Metodi
description: Tutti i metodi della classe PaperPic, per controllare il visualizzatore dal tuo codice, come zoomare, adattare, ruotare, modificare, applicare, scaricare e ricaricare.
---

# Metodi

I metodi controllano il visualizzatore dal tuo codice, ad esempio da pulsanti tuoi con [`toolbar: false`](./options#toolbar). Con il core, chiamali sul `PaperPic` che crei. In Vue il componente espone il visualizzatore come `instance`, e in React lo riceve `ref`. Entrambi sono `null` finché il componente non viene montato:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Ingrandisci
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Ingrandisci</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

In Vue e React il componente crea e distrugge il visualizzatore, e riceve le opzioni come props e gli eventi come eventi propri. Quindi lì non chiamare [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions) né [`on()`](#on).

## Creare e distruggere

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Crea il visualizzatore dentro `container`, che riempie. Dai un’altezza al contenitore, altrimenti il visualizzatore resta alla sua altezza minima. [Opzioni](./options) spiega cosa accetta `options`.

Lancia un `TypeError` se `container` non è un elemento. Crea il visualizzatore quando l’elemento esiste già, ad esempio al montaggio. Lancia un `RangeError` se un’opzione è fuori dal suo intervallo.

Solo con il core: i componenti per Vue e React creano il visualizzatore quando vengono montati.

### `destroy()`

```ts
function destroy(): void
```

Rimuove il visualizzatore e libera tutto ciò che occupa, come il suo worker e la memoria delle sue immagini. Chiamarlo due volte non crea problemi.

Solo con il core: i componenti per Vue e React lo chiamano quando vengono smontati. Chiamato sul loro visualizzatore, lascerebbe il componente vuoto.

## Opzioni e stato

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Cambia le opzioni che passi e mantiene le altre. `undefined` riporta un’opzione al suo valore predefinito. Non emette mai `change`, così i binding bidirezionali non vanno in loop. Lancia un `RangeError` se un’opzione è fuori dal suo intervallo, e in quel caso nessuna opzione cambia.

In Vue e React, cambia invece le props. Il prossimo cambio di una prop invia di nuovo tutte le opzioni, e annullerebbe un cambio fatto con `setOptions()`.

### `getState()`

```ts
function getState(): PaperPicState
```

Restituisce lo stato attuale del visualizzatore, come lo zoom, la modalità e se ci sono modifiche da applicare. Per sapere di ogni cambiamento senza chiedere, ascolta [`change`](./events#change). [Stato](./state) descrive ogni campo, e come si combinano i due.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Ascolta un evento e restituisce una funzione che smette di ascoltarlo. [Eventi](./events) descrive ogni evento.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

In Vue e React, ascolta invece gli eventi del componente, come `@apply` o `onApply`.

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
function zoomTo(zoom: number, point?: ViewPoint): void
```

Imposta lo zoom, dove `1` mostra un pixel dell’immagine per pixel dello schermo. [`point`](./types#viewpoint) resta al suo posto: è in pixel CSS dall’angolo in alto a sinistra del visualizzatore, e per impostazione predefinita è il suo centro.

Lo zoom va dall’adattamento dell’immagine intera, o `1` se è più piccolo, fino a `8`. Un valore fuori da questo intervallo viene limitato.

Lancia un `RangeError` se `zoom` è `NaN` o se una coordinata di `point` non è un numero finito, e lo zoom allora non cambia.

### `fit()`

```ts
function fit(fit: Fit): void
```

Adatta al visualizzatore l’immagine intera, la sua larghezza o la sua altezza. `fit` è un [`Fit`](./types#fit): `'image'`, `'width'` o `'height'`.

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

Ruota l’immagine di un quarto di giro: in senso orario con `1`, il valore predefinito, e in senso antiorario con `-1`. Durante la modifica aggiunge un cambiamento che [`apply()`](#apply) rende permanente, e non fa nulla con uno strumento aperto o mentre si applicano le modifiche. In un visualizzatore di sola lettura cambia solo la visualizzazione. Negli altri casi non fa nulla.

### `flip()`

```ts
function flip(): void
```

Capovolge l’immagine da sinistra a destra così come appare, quindi dopo un quarto di giro la capovolge ancora da sinistra a destra. Per specchiarla dall’alto in basso, capovolgila e ruotala due volte. È un cambiamento, e non fa nulla fuori dalla modalità di modifica o con uno strumento aperto.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Apre uno strumento con un pannello: Ritaglia (`'crop'`), Raddrizza (`'perspective'`), Regola (`'adjust'`) o Pulisci (`'finish'`), che quando si apre sceglie il bianco e nero se la finitura è l’originale. Lo strumento resta aperto fino a [`confirmTool()`](#confirmtool) o [`cancelTool()`](#canceltool). Nel frattempo non può cominciare nessun altro cambiamento, e Annulla l’ultima azione, Ripeti e Applica non fanno nulla. Non fa nulla fuori dalla modalità di modifica, con un altro strumento aperto, per Regola in bianco e nero, né per Ritaglia e Raddrizza mentre un’anteprima è in arrivo. Raddrizza cerca il documento quando si apre, e vi posiziona sopra gli angoli [se lo trova](../guide/tools/straighten#finding-the-document).

Anche Copri (`'redact'`) si apre con gli angoli, come Ritaglia.

### `confirmTool()`

```ts
function confirmTool(): void
```

Chiude lo strumento aperto e aggiunge ai cambiamenti ciò che ha scelto, come `Invio`: la selezione di Ritaglia o di Raddrizza, o le impostazioni di Regola o di Pulisci, come un solo cambiamento. In Raddrizza non fa nulla finché il visualizzatore non trova il documento o non si sposta un angolo, e il `canConfirm` dello [stato](./state) dice quando può.

### `cancelTool()`

```ts
function cancelTool(): void
```

Chiude lo strumento aperto e scarta i suoi cambiamenti, come `Esc`.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

Sceglie la finitura di [Pulisci](../guide/tools/clean-up): `'original'`, `'gray'` o `'mono'` per il bianco e nero. Cambia anche la sensibilità del bianco e nero, da 0 a 1. La finitura viene sempre dopo gli altri cambiamenti. Mentre Pulisci è aperto, cambia ciò che mostra Pulisci, e [`confirmTool()`](#confirmtool) lo conserva come un solo cambiamento. Non fa nulla fuori dalla modalità di modifica o con un altro strumento aperto.

Lancia un `RangeError` se `mode` non è un [`FinishMode`](./types#finishmode), o se `sensitivity` non è tra 0 e 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Cambia la luminosità o il contrasto, ciascuno da -1 a 1, dove 0 lascia l’immagine com’è. Vengono dopo gli altri cambiamenti, e prima del grigio. Mentre Regola è aperto, cambia ciò che mostra Regola, e [`confirmTool()`](#confirmtool) lo conserva come un solo cambiamento. Non fa nulla fuori dalla modalità di modifica, con un altro strumento aperto o in bianco e nero: il bianco e nero confronta ogni pixel con ciò che lo circonda, quindi luminosità e contrasto cambierebbero appena il suo risultato.

Lancia un `RangeError` se un valore non è tra -1 e 1.

### `setPaper()`

```ts
function setPaper(setting: { size?: PaperSize }): void
```

Sceglie la carta che dà le sue proporzioni al risultato di [Raddrizza](../guide/tools/straighten#paper-size): `'a4'`, `'letter'`, `'card'` per una carta d’identità o bancaria, o `'auto'`, il predefinito, che usa [`aspectRatio`](./options#aspectratio) o altrimenti una stima. La carta sta in verticale o in orizzontale come gli angoli. Non fa nulla se Raddrizza non è aperto, e ogni apertura comincia da `'auto'`.

Lancia un `RangeError` se `size` non è un [`PaperSize`](./types#papersize).

### `setRedaction()`

```ts
function setRedaction(setting: { color?: RedactColor }): void
```

Sceglie il colore con cui [Copri](../guide/tools/redact) copre: `'black'`, il predefinito, o `'white'`. Mentre Copri è aperto, cambia l’area sullo schermo, e [`confirmTool()`](#confirmtool) la conserva. Altrimenti è il colore della prossima area. Funziona in qualsiasi modalità.

Lancia un `RangeError` se `color` non è un [`RedactColor`](./types#redactcolor).

### `undo()`

```ts
function undo(): void
```

Annulla l’ultimo cambiamento. Non fa nulla fuori dalla modalità di modifica, con uno strumento aperto o mentre si applicano le modifiche.

### `redo()`

```ts
function redo(): void
```

Ripristina l’ultimo cambiamento annullato. Non fa nulla fuori dalla modalità di modifica, con uno strumento aperto o mentre si applicano le modifiche.

### `apply()`

```ts
function apply(): Promise<void>
```

Applica i cambiamenti alla risoluzione piena, o a [`maxOutputSize`](./options#maxoutputsize). Il risultato diventa l’immagine visualizzata, la cronologia si svuota, il visualizzatore torna alla modalità di visualizzazione e l’evento [`apply`](./events#apply) invia il risultato. Una volta avviata, l’applicazione non si può interrompere, e blocca i controlli mentre è in corso. Non fa nulla fuori dalla modalità di modifica, con uno strumento aperto, o quando non c’è nulla da applicare.

Se fallisce, l’evento [`error`](./events#error) lo segnala e la modifica resta aperta. La promessa si risolve quando l’applicazione finisce, anche se fallisce: ascolta quindi `error`, perché un `try/catch` non lo vede.

### `cancel()`

```ts
function cancel(): void
```

Scarta i cambiamenti e torna alla modalità di visualizzazione. Non chiede conferma: lo fanno il pulsante Annulla integrato e `Esc`. Non fa nulla mentre si applicano le modifiche.

## Immagine

### `download()`

```ts
function download(): void
```

Salva come file l’immagine visualizzata: l’ultimo risultato modificato, altrimenti l’immagine originale. Funziona senza l’opzione [`download`](./options#download), che mostra solo un pulsante. L’evento [`download`](./events#download) arriva prima e può impedirlo. Non fa nulla durante la modifica, perché i cambiamenti non sono ancora applicati. Finché non si applica nessuna modifica, uno `src` da un’altra origine si apre invece nel browser: vedi [Salvare il risultato](../guide/saving#download).

### `reload()`

```ts
function reload(): void
```

Ricarica il [`src`](./options#src) attuale, il che riporta l’originale dopo l’applicazione delle modifiche. Durante la modifica, scarta i cambiamenti. Senza `src`, non fa nulla.
