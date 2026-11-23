---
title: Barre d’outils personnalisée
description: Un exemple complet qui masque la barre d’outils intégrée de PaperPic et pilote la visionneuse depuis vos propres boutons, tenus à jour avec l’état de la visionneuse.
---

# Barre d’outils personnalisée

Quand les commandes de la visionneuse doivent s’accorder avec le reste de votre interface, masquez celles intégrées avec `toolbar: false` et appelez les [méthodes](../reference/methods) depuis vos propres boutons. Cet exemple propose le zoom, Redresser, Annuler la dernière action et Appliquer, et n’active chaque bouton que lorsqu’il peut agir.

L’événement [`change`](../reference/events#change) envoie l’[état](../reference/state) après chaque action, y compris celles lancées par vos boutons. `load` et `error` signalent l’arrivée de l’image ou l’échec d’Appliquer.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Zoom avant</button>
  <button type="button" data-action="zoomOut">Zoom arrière</button>
  <button type="button" data-action="edit">Modifier</button>
  <button type="button" data-action="straighten">Redresser</button>
  <button type="button" data-action="confirmTool">Terminé</button>
  <button type="button" data-action="cancelTool">Annuler cet outil</button>
  <button type="button" data-action="undo">Annuler la dernière action</button>
  <button type="button" data-action="cancel">Annuler</button>
  <button type="button" data-action="apply">Appliquer</button>
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
  alt: 'Un ticket de caisse',
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

function update({ status, mode, activeTool, hint, canUndo, canApply, canConfirm, busy }: PaperPicState) {
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
  document.querySelector<HTMLButtonElement>('[data-action="confirmTool"]')!.disabled = !canConfirm
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
      Zoom avant
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Zoom arrière
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Modifier
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <p v-if="state.hint">
        {{ state.hint }}
      </p>
      <button type="button" :disabled="!state.canConfirm" @click="viewer?.confirmTool()">
        Terminé
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        Annuler cet outil
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Redresser
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Annuler la dernière action
      </button>
      <button type="button" @click="viewer?.cancel()">
        Annuler
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Appliquer
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Un ticket de caisse"
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
          <button type="button" onClick={() => viewer().zoomIn()}>Zoom avant</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Zoom arrière</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Modifier</button>
          )}
          {state.hint && <p>{state.hint}</p>}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" disabled={!state.canConfirm} onClick={() => viewer().confirmTool()}>Terminé</button>
              <button type="button" onClick={() => viewer().cancelTool()}>Annuler cet outil</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Redresser</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Annuler la dernière action</button>
              <button type="button" onClick={() => viewer().cancel()}>Annuler</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Appliquer</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Un ticket de caisse"
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

## Un curseur à vous {#slider}

Un curseur à vous pour Nettoyer ouvre d’abord l’outil. Chaque mouvement appelle alors `setFinish()`, qui change ce que Nettoyer affiche, et `confirmTool()` garde la dernière valeur comme une seule modification. Ici, Terminé applique aussi le résultat, et Annuler quitte le mode d’édition, si bien que ces contrôles forment toute l’interface.

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">Nettoyer</button>
<div id="ruler" hidden>
  <label>
    Sensibilité
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">Terminé</button>
  <button id="cancel" type="button">Annuler</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Un ticket de caisse',
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
      Sensibilité
      <input type="range" min="0" max="1" step="0.05" :value="state.finish.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      Terminé
    </button>
    <button type="button" @click="cancel">
      Annuler
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    Nettoyer
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Un ticket de caisse"
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
                Sensibilité
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.finish.sensitivity}
                  onChange={event => viewer().setFinish({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>Terminé</button>
              <button type="button" onClick={cancel}>Annuler</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>Nettoyer</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Un ticket de caisse"
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

## Remarques

- Avec `toolbar: false`, la barre de modification intégrée est aussi masquée, donc Recadrer et Redresser affichent leurs poignées mais pas de bouton Terminé. Votre interface les valide avec [`confirmTool()`](../reference/methods#confirmtool), comme `Entrée`. Pour les fermer sans leurs changements, appelez [`cancelTool()`](../reference/methods#canceltool), comme le fait `Échap`.
- Tant que Recadrer ou Redresser est ouvert, `hint` dans l’état dit quoi faire, par exemple « Drag the corners », comme la barre de modification intégrée. Affichez-le, car avec `toolbar: false` rien d’autre ne le montre. Un nouveau hint, comme après avoir appuyé sur un coin ou quand Redresser trouve le document, arrive avec `change`.
- `canConfirm` dans l’état dit si `confirmTool()` peut garder ce que montre l’outil. Redresser attend de trouver le document ou que l’utilisateur déplace un coin, donc désactivez votre bouton Terminé jusque-là.
- Vos propres curseurs peuvent appeler directement [`setFinish()`](../reference/methods#setfinish) et [`setAdjustments()`](../reference/methods#setadjustments), ce qui ajoute un changement à chaque appel. Pour laisser un seul changement pour tout un glissement, ouvrez d’abord l’outil avec [`openTool()`](../reference/methods#opentool) : les mêmes méthodes changent alors ce qu’il montre, et `confirmTool()` le garde.
- [`cancel()`](../reference/methods#cancel) ne demande rien avant d’abandonner les changements. Demandez à l’utilisateur s’il y en a, par exemple quand `canApply` est vrai.
- Les raccourcis clavier fonctionnent toujours quand la visionneuse a le focus. Voir [Accessibilité](../guide/accessibility).
