---
title: Eigene Werkzeugleiste
description: Ein vollständiges Beispiel, das die eingebaute Werkzeugleiste von PaperPic ausblendet und den Viewer über eigene Schaltflächen steuert, die mit seinem Zustand Schritt halten.
---

# Eigene Werkzeugleiste

Wenn die Bedienelemente des Viewers zum Rest deiner Oberfläche passen müssen, blende die eingebauten mit `toolbar: false` aus und rufe die [Methoden](../reference/methods) über eigene Schaltflächen auf. Dieses Beispiel bietet Zoom, Begradigen, Rückgängig und Übernehmen und aktiviert jede Schaltfläche nur, wenn sie etwas bewirken kann.

Das Ereignis [`change`](../reference/events#change) liefert nach jeder Aktion den [Zustand](../reference/state), auch nach denen, die deine Schaltflächen auslösen. `load` und `error` melden, wann das Bild ankommt oder Übernehmen fehlschlägt.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Vergrößern</button>
  <button type="button" data-action="zoomOut">Verkleinern</button>
  <button type="button" data-action="edit">Bearbeiten</button>
  <button type="button" data-action="straighten">Begradigen</button>
  <button type="button" data-action="confirmTool">Fertig</button>
  <button type="button" data-action="undo">Rückgängig</button>
  <button type="button" data-action="cancel">Abbrechen</button>
  <button type="button" data-action="apply">Übernehmen</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Ein Kassenbon',
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
      Vergrößern
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Verkleinern
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Bearbeiten
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <button type="button" @click="viewer?.confirmTool()">
        Fertig
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Begradigen
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Rückgängig
      </button>
      <button type="button" @click="viewer?.cancel()">
        Abbrechen
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Übernehmen
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Ein Kassenbon"
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
          <button type="button" onClick={() => viewer().zoomIn()}>Vergrößern</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Verkleinern</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Bearbeiten</button>
          )}
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>Fertig</button>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Begradigen</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Rückgängig</button>
              <button type="button" onClick={() => viewer().cancel()}>Abbrechen</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Übernehmen</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Ein Kassenbon"
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

## Hinweise

- Mit `toolbar: false` ist auch die eingebaute Bearbeitungsleiste ausgeblendet, Zuschneiden und Begradigen zeigen also ihre Griffe, aber keine Schaltfläche Fertig. Deine Oberfläche bestätigt sie mit [`confirmTool()`](../reference/methods#confirmtool), wie `Enter`.
- Eigene Regler können [`setThreshold()`](../reference/methods#setthreshold) und [`setAdjustments()`](../reference/methods#setadjustments) direkt aufrufen, was bei jedem Aufruf eine Änderung hinzufügt. Für eine einzige Änderung über ein ganzes Ziehen öffne das Werkzeug vorher mit [`openTool()`](../reference/methods#opentool): Dieselben Methoden ändern dann, was es zeigt, und `confirmTool()` behält es.
- [`cancel()`](../reference/methods#cancel) fragt nicht nach, bevor es die Änderungen verwirft. Frag selbst nach, wenn es welche gibt, etwa wenn `canApply` wahr ist.
- Die Tastenkürzel funktionieren weiter, wenn der Viewer den Fokus hat. Siehe [Barrierefreiheit](../guide/accessibility).
