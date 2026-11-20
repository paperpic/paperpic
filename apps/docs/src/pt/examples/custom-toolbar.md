---
title: Barra de ferramentas própria
description: Um exemplo completo que esconde a barra de ferramentas integrada do PaperPic e controla o visualizador por botões seus, mantidos em dia com o estado do visualizador.
---

# Barra de ferramentas própria

Quando os controles do visualizador precisam combinar com o resto da sua interface, esconda os integrados com `toolbar: false` e chame os [métodos](../reference/methods) a partir de botões seus. Este exemplo oferece zoom, Endireitar, Desfazer e Aplicar, e ativa cada botão só quando ele pode agir.

O evento [`change`](../reference/events#change) envia o [estado](../reference/state) depois de cada ação, inclusive as que os seus botões iniciam. `load` e `error` avisam quando a imagem chega ou quando o Aplicar falha.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Ampliar</button>
  <button type="button" data-action="zoomOut">Reduzir</button>
  <button type="button" data-action="edit">Editar</button>
  <button type="button" data-action="straighten">Endireitar</button>
  <button type="button" data-action="confirmTool">Concluído</button>
  <button type="button" data-action="cancelTool">Cancelar esta ferramenta</button>
  <button type="button" data-action="undo">Desfazer</button>
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
  alt: 'Um recibo',
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
      Ampliar
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Reduzir
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
        Concluído
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        Cancelar esta ferramenta
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Endireitar
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Desfazer
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
      alt="Um recibo"
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
          <button type="button" onClick={() => viewer().zoomIn()}>Ampliar</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Reduzir</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Editar</button>
          )}
          {state.hint && <p>{state.hint}</p>}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().confirmTool()}>Concluído</button>
              <button type="button" onClick={() => viewer().cancelTool()}>Cancelar esta ferramenta</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Endireitar</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Desfazer</button>
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
          alt="Um recibo"
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

## Um slider próprio {#slider}

Um slider próprio para o Limpar abre a ferramenta antes. Cada movimento então chama `setFinish()`, que muda o que o Limpar mostra, e `confirmTool()` guarda o último valor como uma única edição. Aqui o Concluído também aplica o resultado, e o Cancelar sai do modo de edição, então esses controles são toda a interface.

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">Limpar</button>
<div id="ruler" hidden>
  <label>
    Sensibilidade
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">Concluído</button>
  <button id="cancel" type="button">Cancelar</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Um recibo',
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
      Sensibilidade
      <input type="range" min="0" max="1" step="0.05" :value="state.finish.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      Concluído
    </button>
    <button type="button" @click="cancel">
      Cancelar
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    Limpar
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Um recibo"
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
                Sensibilidade
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.finish.sensitivity}
                  onChange={event => viewer().setFinish({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>Concluído</button>
              <button type="button" onClick={cancel}>Cancelar</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>Limpar</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Um recibo"
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

## Observações

- Com `toolbar: false`, a barra de edição integrada também fica oculta, então Recortar e Endireitar mostram suas alças mas não o botão Concluído. A sua interface os confirma com [`confirmTool()`](../reference/methods#confirmtool), como faz o `Enter`. Para fechá-las sem as alterações, chame [`cancelTool()`](../reference/methods#canceltool), como faz o `Esc`.
- Enquanto Recortar ou Endireitar está aberto, `hint` no estado diz o que fazer, por exemplo "Drag the corners", como faz a barra de edição integrada. Mostre-o, porque com `toolbar: false` nada mais o mostra. Um novo hint, como depois de pressionar um canto, chega com `change`.
- Os seus próprios controles deslizantes podem chamar [`setFinish()`](../reference/methods#setfinish) e [`setAdjustments()`](../reference/methods#setadjustments) diretamente, o que adiciona uma alteração a cada chamada. Para deixar uma única alteração por um arraste inteiro, abra antes a ferramenta com [`openTool()`](../reference/methods#opentool): os mesmos métodos então mudam o que ela mostra, e `confirmTool()` o mantém.
- [`cancel()`](../reference/methods#cancel) não pergunta antes de descartar as alterações. Pergunte você ao usuário se houver alguma, por exemplo quando `canApply` for verdadeiro.
- Os atalhos de teclado continuam funcionando com o foco no visualizador. Veja [Acessibilidade](../guide/accessibility).
