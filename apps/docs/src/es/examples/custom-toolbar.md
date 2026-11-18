---
title: Barra de herramientas propia
description: Un ejemplo completo que oculta la barra de herramientas integrada de PaperPic y maneja el visor desde tus propios botones, al día con el estado del visor.
---

# Barra de herramientas propia

Cuando los controles del visor deben encajar con el resto de tu interfaz, oculta los integrados con `toolbar: false` y llama a los [métodos](../reference/methods) desde tus propios botones. Este ejemplo ofrece zoom, Enderezar, Deshacer y Aplicar, y activa cada botón solo cuando puede actuar.

El evento [`change`](../reference/events#change) envía el [estado](../reference/state) después de cada acción, incluidas las que inician tus botones. `load` y `error` avisan de cuándo llega la imagen o de cuándo falla Aplicar.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Acercar</button>
  <button type="button" data-action="zoomOut">Alejar</button>
  <button type="button" data-action="edit">Editar</button>
  <button type="button" data-action="straighten">Enderezar</button>
  <button type="button" data-action="confirmTool">Hecho</button>
  <button type="button" data-action="cancelTool">Cancelar esta herramienta</button>
  <button type="button" data-action="undo">Deshacer</button>
  <button type="button" data-action="cancel">Cancelar</button>
  <button type="button" data-action="apply">Aplicar</button>
</div>
<p id="hint"></p>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Un tique',
  toolbar: false,
})

const actions: Record<string, () => void> = {
  zoomIn: () => pic.zoomIn(),
  zoomOut: () => pic.zoomOut(),
  edit: () => pic.edit(),
  straighten: () => pic.openTool('perspective'),
  confirmTool: () => pic.confirmTool(),
  cancelTool: () => pic.cancelTool(),
  undo: () => pic.undo(),
  cancel: () => pic.cancel(),
  apply: () => pic.apply(),
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]')
for (const button of buttons) {
  button.addEventListener('click', () => actions[button.dataset.action!]!())
}

function update({ status, mode, activeTool, hint, canUndo, canApply, busy }: PaperPicState) {
  const editing = mode === 'edit'
  const visible: Record<string, boolean> = {
    zoomIn: true,
    zoomOut: true,
    edit: !editing,
    straighten: editing && !activeTool,
    confirmTool: Boolean(activeTool),
    cancelTool: Boolean(activeTool),
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
  document.querySelector('#hint')!.textContent = hint ?? ''
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
      Acercar
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Alejar
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Editar
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <p v-if="state.hint">
        {{ state.hint }}
      </p>
      <button type="button" @click="viewer?.confirmTool()">
        Hecho
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        Cancelar esta herramienta
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Enderezar
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Deshacer
      </button>
      <button type="button" @click="viewer?.cancel()">
        Cancelar
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Aplicar
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Un tique"
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
          <button type="button" onClick={() => viewer().zoomIn()}>Acercar</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Alejar</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Editar</button>
          )}
          {state.hint && <p>{state.hint}</p>}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().confirmTool()}>Hecho</button>
              <button type="button" onClick={() => viewer().cancelTool()}>Cancelar esta herramienta</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Enderezar</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Deshacer</button>
              <button type="button" onClick={() => viewer().cancel()}>Cancelar</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Aplicar</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Un tique"
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

## Un control deslizante propio {#slider}

Un control deslizante propio para Limpiar abre antes la herramienta. Cada movimiento llama entonces a `setFinish()`, que cambia lo que muestra Limpiar, y `confirmTool()` guarda el último valor como un solo cambio. Aquí Hecho también aplica el resultado, y Cancelar sale del modo de edición, así que estos controles son toda la interfaz.

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">Limpiar</button>
<div id="ruler" hidden>
  <label>
    Sensibilidad
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">Hecho</button>
  <button id="cancel" type="button">Cancelar</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Un tique',
  toolbar: false,
})
const slider = document.querySelector<HTMLInputElement>('#sensitivity')!

document.querySelector('#clean-up')!.addEventListener('click', () => {
  pic.edit()
  pic.openTool('finish')
})
slider.addEventListener('input', () => pic.setFinish({ sensitivity: slider.valueAsNumber }))
document.querySelector('#done')!.addEventListener('click', () => {
  pic.confirmTool()
  pic.apply()
})
document.querySelector('#cancel')!.addEventListener('click', () => {
  pic.cancelTool()
  pic.cancel()
})

pic.on('change', ({ activeTool, finish }) => {
  const open = activeTool === 'finish'
  document.querySelector<HTMLElement>('#ruler')!.hidden = !open
  document.querySelector<HTMLElement>('#clean-up')!.hidden = open
  slider.value = String(finish.sensitivity)
})
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

function open() {
  viewer.value?.edit()
  viewer.value?.openTool('finish')
}

function slide(event: Event) {
  viewer.value?.setFinish({ sensitivity: (event.target as HTMLInputElement).valueAsNumber })
}

function done() {
  viewer.value?.confirmTool()
  viewer.value?.apply()
}

function cancel() {
  viewer.value?.cancelTool()
  viewer.value?.cancel()
}
</script>

<template>
  <div v-if="state?.activeTool === 'finish'">
    <label>
      Sensibilidad
      <input type="range" min="0" max="1" step="0.05" :value="state.finish.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      Hecho
    </button>
    <button type="button" @click="cancel">
      Cancelar
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    Limpiar
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Un tique"
      :toolbar="false"
      @change="next => (state = next)"
      @load="state = viewer?.getState()"
      @error="state = viewer?.getState()"
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

export function CleanUpRuler() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()
  const viewer = () => picRef.current!

  function open() {
    viewer().edit()
    viewer().openTool('finish')
  }

  function done() {
    viewer().confirmTool()
    viewer().apply()
  }

  function cancel() {
    viewer().cancelTool()
    viewer().cancel()
  }

  return (
    <>
      {state?.activeTool === 'finish'
        ? (
            <div>
              <label>
                Sensibilidad
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.finish.sensitivity}
                  onChange={event => viewer().setFinish({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>Hecho</button>
              <button type="button" onClick={cancel}>Cancelar</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>Limpiar</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Un tique"
          toolbar={false}
          onChange={setState}
          onLoad={() => setState(viewer().getState())}
          onError={() => setState(viewer().getState())}
        />
      </div>
    </>
  )
}
```

:::

## Notas

- Con `toolbar: false` también se oculta la barra de edición integrada, así que Recortar y Enderezar muestran sus tiradores pero no el botón Hecho. Tu interfaz los confirma con [`confirmTool()`](../reference/methods#confirmtool), como hace `Enter`. Para cerrarlas sin sus cambios, llama a [`cancelTool()`](../reference/methods#canceltool), como hace `Esc`.
- Mientras Recortar o Enderezar está abierta, `hint` en el estado dice qué hacer, por ejemplo "Drag the corners", como hace la barra de edición integrada. Muéstralo, porque con `toolbar: false` nada más lo muestra. Un hint nuevo, como al pulsar una esquina, llega con `change`.
- Tus propios controles deslizantes pueden llamar directamente a [`setFinish()`](../reference/methods#setfinish) y [`setAdjustments()`](../reference/methods#setadjustments), lo que añade un cambio por cada llamada. Para dejar un solo cambio por todo un arrastre, abre antes la herramienta con [`openTool()`](../reference/methods#opentool): los mismos métodos cambian entonces lo que muestra, y `confirmTool()` lo conserva.
- [`cancel()`](../reference/methods#cancel) no pregunta antes de descartar los cambios. Pregunta tú al usuario si los hay, por ejemplo cuando `canApply` es verdadero.
- Los atajos de teclado siguen funcionando con el foco en el visor. Consulta [Accesibilidad](../guide/accessibility).
