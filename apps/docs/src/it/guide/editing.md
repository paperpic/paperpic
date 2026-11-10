---
title: Modifica
description: Come funziona la modalità di modifica di PaperPic, dal pulsante Modifica fino ad Applica, con gli strumenti, Annulla l’ultima azione e Ripeti, l’anteprima e gli eventi che riceve il tuo codice.
---

# Modifica

La foto di un documento di solito ha bisogno di qualche ritocco prima di valere la pena di conservarla. La modalità di modifica li raccoglie: l’utente fa i cambiamenti, li controlla e li applica tutti insieme. Nel [playground](../playground) puoi provare la modalità di modifica completa.

## Il flusso

1. L’utente preme Modifica, la matita nella barra degli strumenti. La barra di modifica compare in basso nel visualizzatore.
2. Ogni strumento della barra di modifica aggiunge un cambiamento, che il visualizzatore mostra subito. Annulla l’ultima azione e Ripeti scorrono i cambiamenti.
3. Applica calcola il risultato e torna alla visualizzazione. Annulla scarta i cambiamenti, e prima chiede conferma se ce ne sono.

Niente cambia l’immagine prima di Applica. Fino ad allora, i cambiamenti sono un elenco di cui il visualizzatore mostra l’anteprima.

## Strumenti

| Strumento                                   | Cosa fa                                                        | Id            |
| ------------------------------------------- | -------------------------------------------------------------- | ------------- |
| [Ritaglia](./tools/crop)                    | Tiene la parte dell’immagine dentro quattro angoli             | `crop`        |
| [Raddrizza](./tools/straighten)             | Trasforma una foto scattata di sbieco in una pagina piatta     | `perspective` |
| [Ruota a sinistra](./tools/rotate-and-flip) | Ruota l’immagine di un quarto di giro a sinistra               | `rotate`      |
| [Capovolgi](./tools/rotate-and-flip)        | Capovolge l’immagine da sinistra a destra                      | `flip`        |
| [Regola](./tools/adjust)                    | Cambia la luminosità e il contrasto                            | `adjust`      |
| [Pulisci](./tools/clean-up)                 | Trasforma il documento in un bianco e nero nitido, senza ombre | `threshold`   |

L’opzione [`tools`](../reference/options#tools) sceglie quali offre la barra di modifica:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Ritaglia e Raddrizza hanno una selezione propria, quindi il resto della barra di modifica aspetta mentre uno dei due è aperto. Fatto, o `Invio`, aggiunge la selezione ai cambiamenti, e Annulla questo strumento, o `Esc`, la scarta.

## Anteprima e Applica

Durante la modifica, il visualizzatore mostra l’anteprima dei cambiamenti su una copia dell’immagine di circa 2 megapixel, così resta veloce con foto grandi. Con molto zoom, l’anteprima sembra più morbida del risultato. Applica calcola ogni cambiamento alla risoluzione piena, o a [`maxOutputSize`](../reference/options#maxoutputsize), in un Web Worker.

Applica non si può interrompere. Blocca i controlli e mostra un messaggio mentre è in corso. Poi il risultato sostituisce l’immagine visualizzata, la cronologia si svuota e il visualizzatore torna alla modalità di visualizzazione. Se Applica fallisce, la modifica resta aperta, così l’utente può riprovare.

## Cosa riceve il tuo codice

| Evento   | Quando                                                            |
| -------- | ----------------------------------------------------------------- |
| `change` | Dopo ogni azione dell’utente, con lo [stato](../reference/state)  |
| `apply`  | Quando il risultato è pronto, con `{ blob, width, height, type }` |
| `error`  | Quando Applica fallisce, o quando l’immagine non si carica        |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## Cosa scarta i cambiamenti

- Annulla, dopo che l’utente conferma, o [`cancel()`](../reference/methods#cancel), che non chiede conferma.
- Un nuovo `src` durante la modifica.
- Un cambio di `editable` durante la modifica.

Dopo Applica, passare di nuovo lo stesso `src` non fa nulla, quindi il risultato resta visualizzato. [`reload()`](../reference/methods#reload) riporta l’originale.

## Tastiera

Con il focus sul visualizzatore:

| Tasto                      | Azione                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `Ctrl+Z`                   | Annulla l’ultima azione                                       |
| `Ctrl+Maiusc+Z` o `Ctrl+Y` | Ripeti                                                        |
| `Invio`                    | Conferma lo strumento aperto, altrimenti applica le modifiche |
| `Esc`                      | Chiude lo strumento aperto, altrimenti annulla le modifiche   |

Su macOS, `Cmd` funziona come `Ctrl`.
