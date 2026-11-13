---
title: Barra degli strumenti personalizzata
description: Un esempio completo che nasconde la barra degli strumenti integrata di PaperPic e guida il visualizzatore da pulsanti tuoi, allineati al suo stato.
---

# Barra degli strumenti personalizzata

Quando i controlli del visualizzatore devono accordarsi con il resto della tua interfaccia, nascondi quelli integrati con `toolbar: false` e chiama i [metodi](../reference/methods) da pulsanti tuoi. Questo esempio offre lo zoom, Raddrizza, Annulla l’ultima azione e Applica, e attiva ogni pulsante solo quando può agire.

L’evento [`change`](../reference/events#change) porta lo [stato](../reference/state) dopo ogni azione, comprese quelle avviate dai tuoi pulsanti. `load` ed `error` segnalano l’arrivo dell’immagine o il fallimento di Applica.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Ingrandisci</button>
  <button type="button" data-action="zoomOut">Riduci</button>
  <button type="button" data-action="edit">Modifica</button>
  <button type="button" data-action="straighten">Raddrizza</button>
  <button type="button" data-action="confirmTool">Fatto</button>
  <button type="button" data-action="undo">Annulla l’ultima azione</button>
  <button type="button" data-action="cancel">Annulla</button>
  <button type="button" data-action="apply">Applica</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Uno scontrino',
  toolbar: false,
})

const actions: Record<string, () => void> = {
  zoomIn: () => pic.zoomIn(),
  zoomOut: () => pic.zoomOut(),
  edit: () => pic.edit(),
  straighten: () => pic.openTool('perspective'),
  confirmTool: () => pic.confirmTool(),
  undo: () => pic.undo(),
  cancel: () => pic.cancel(),
  apply: () => pic.apply(),
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]')
for (const button of buttons) {
  button.addEventListener('click', () => actions[button.dataset.action!]!())
}

function update({ status, mode, activeTool, canUndo, canApply, busy }: PaperPicState) {
  const editing = mode === 'edit'
  const visible: Record<string, boolean> = {
    zoomIn: true,
    zoomOut: true,
    edit: !editing,
    straighten: editing && !activeTool,
    confirmTool: Boolean(activeTool),
    undo: editing && !activeTool,
    cancel: editing && !activeTool,
    apply: editing && !activeTool,
  }
  for (const button of buttons) {
    const action = button.dataset.action!
    button.hidden = !visible[action]
  }
  document.querySelector<HTMLButtonElement>('[data-action="edit"]')!.disabled = status !== 'ready'
  document.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled = !canUndo || busy
  document.querySelector<HTMLButtonElement>('[data-action="apply"]')!.disabled = !canApply || busy
}

pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
update(pic.getState())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { computed, shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef<InstanceType<typeof PaperPic>>('pic')
const viewer = computed(() => pic.value?.instance)
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = viewer.value?.getState()
}
</script>

<template>
  <div v-if="state">
    <button type="button" @click="viewer?.zoomIn()">
      Ingrandisci
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Riduci
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Modifica
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <button type="button" @click="viewer?.confirmTool()">
        Fatto
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Raddrizza
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Annulla l’ultima azione
      </button>
      <button type="button" @click="viewer?.cancel()">
        Annulla
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Applica
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Uno scontrino"
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

  const viewer = () => picRef.current!

  return (
    <>
      {state && (
        <div>
          <button type="button" onClick={() => viewer().zoomIn()}>Ingrandisci</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Riduci</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Modifica</button>
          )}
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>Fatto</button>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Raddrizza</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Annulla l’ultima azione</button>
              <button type="button" onClick={() => viewer().cancel()}>Annulla</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Applica</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Uno scontrino"
          toolbar={false}
          onChange={setState}
          onLoad={refresh}
          onError={refresh}
        />
      </div>
    </>
  )
}
```

:::

## Note

- Con `toolbar: false` si nasconde anche la barra di modifica integrata, quindi Ritaglia e Raddrizza mostrano le loro maniglie ma non il pulsante Fatto. La tua interfaccia li conferma con [`confirmTool()`](../reference/methods#confirmtool), come `Invio`.
- I tuoi cursori possono chiamare direttamente [`setThreshold()`](../reference/methods#setthreshold) e [`setAdjustments()`](../reference/methods#setadjustments), il che aggiunge un cambiamento a ogni chiamata. Per lasciare un solo cambiamento per tutto un trascinamento, apri prima lo strumento con [`openTool()`](../reference/methods#opentool): gli stessi metodi cambiano allora ciò che mostra, e `confirmTool()` lo conserva.
- [`cancel()`](../reference/methods#cancel) non chiede conferma prima di scartare le modifiche. Chiedila tu all’utente se ce ne sono, ad esempio quando `canApply` è vero.
- Le scorciatoie da tastiera continuano a funzionare con il focus sul visualizzatore. Vedi [Accessibilità](../guide/accessibility).
