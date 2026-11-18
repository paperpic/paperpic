---
title: Stato
description: Cosa restituisce getState() e invia l’evento change, come lo stato dell’immagine, la modalità, lo zoom, i cambiamenti e se c’è qualcosa da applicare, e come sincronizzare i tuoi controlli.
---

# Stato

Lo stato è un’istantanea del visualizzatore: se c’è un’immagine, la modalità, lo zoom, lo strumento aperto e se ci sono cambiamenti da applicare. Lo ottieni in due modi, ed entrambi danno lo stesso oggetto [`PaperPicState`](./types#paperpicstate):

- [`getState()`](./methods#getstate) lo restituisce quando lo chiedi.
- L’evento [`change`](./events#change) lo invia ogni volta che l’utente o un metodo lo cambiano.

## Sincronizzare i tuoi controlli {#in-step}

`change` non segnala l’immagine. Un’immagine caricata arriva con [`load`](./events#load), e un caricamento o un Applica che falliscono arrivano con [`error`](./events#error). Per sincronizzare i tuoi controlli, come un pulsante Applica, leggi lo stato all’inizio, prendilo da ogni `change` e rileggilo con `load` ed `error`:

:::tabs key:framework
== JavaScript

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const applyButton = document.querySelector<HTMLButtonElement>('#apply')!
const pic = new PaperPic(container, { src: '/receipt.jpg', toolbar: false })

function update({ canApply, busy }: PaperPicState) {
  applyButton.disabled = !canApply || busy
}

update(pic.getState())
pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
applyButton.addEventListener('click', () => pic.apply())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = pic.value?.instance?.getState()
}
</script>

<template>
  <button type="button" :disabled="!state || !state.canApply || state.busy" @click="pic?.instance?.apply()">
    Applica
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      :toolbar="false"
      @change="next => (state = next)"
      @load="refresh"
      @error="refresh"
    />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()

  function refresh() {
    setState(picRef.current?.getState())
  }

  return (
    <>
      <button type="button" disabled={!state || !state.canApply || state.busy} onClick={() => picRef.current?.apply()}>
        Applica
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

In Vue e React il visualizzatore esiste solo dopo il montaggio del componente, quindi lo stato parte da `undefined` e arriva con il primo `load` o `error`. Fino ad allora non c’è niente da applicare.

## Campi

| Campo         | Tipo                                         | Descrizione                                                                                                                                                                                  |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | Lo strumento aperto, come `'crop'` o `'adjust'`, o `null`                                                                                                                                    |
| `adjustments` | `{ brightness, contrast }`                   | La luminosità e il contrasto, ciascuno da -1 a 1. Non si applicano in bianco e nero. Mentre Regola è aperto, i valori del suo pannello                                                       |
| `busy`        | `boolean`                                    | Se Applica è in corso                                                                                                                                                                        |
| `canApply`    | `boolean`                                    | Se ci sono cambiamenti da applicare. Rotazioni e capovolgimenti che si annullano non contano                                                                                                 |
| `canRedo`     | `boolean`                                    | Se c’è un cambiamento da ripristinare                                                                                                                                                        |
| `canUndo`     | `boolean`                                    | Se c’è un cambiamento da annullare                                                                                                                                                           |
| `finish`      | `{ mode, sensitivity }`                      | La finitura di Pulisci, un [`FinishMode`](./types#finishmode), e la sensibilità del bianco e nero, da 0 a 1. Mentre Pulisci è aperto, i valori del suo pannello                              |
| `fit`         | [`Fit \| null`](./types#fit)                 | L’adattamento in vigore, o `null` appena l’utente zooma a mano                                                                                                                               |
| `hint`        | `string \| null`                             | Ciò che lo strumento aperto chiede all’utente, come lo mostra la barra di modifica integrata, per esempio «Drag the corners», o `null`. Con `toolbar: false`, mostralo nella tua interfaccia |
| `image`       | [`Size \| null`](./types#size)               | La dimensione dell’immagine in pixel, alla risoluzione piena e con i cambiamenti fatti, ma senza la rotazione di `rotation`, o `null` senza immagine                                         |
| `mode`        | `'view' \| 'edit'`                           | Se l’utente sta guardando o modificando l’immagine                                                                                                                                           |
| `rotation`    | [`Rotation`](./types#rotation)               | Quanto è ruotata l’immagine visualizzata rispetto a `image`, in gradi in senso orario                                                                                                        |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` senza `src`, `'loading'` durante il caricamento, `'ready'` quando è visualizzata, e `'error'` se non si è potuta caricare                                                          |
| `zoom`        | `number`                                     | Pixel dello schermo per pixel dell’immagine                                                                                                                                                  |

Con una `rotation` di 90 o 270, l’immagine visualizzata, e il risultato di Applica, hanno larghezza e altezza di `image` scambiate. [`maxOutputSize`](./options#maxoutputsize) può rendere il risultato più piccolo.
