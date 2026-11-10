---
title: Barre d’outils personnalisée
description: Un exemple complet qui masque la barre d’outils intégrée de PaperPic et pilote la visionneuse depuis vos propres boutons, tenus à jour avec l’état de la visionneuse.
---

# Barre d’outils personnalisée

Quand les commandes de la visionneuse doivent s’accorder avec le reste de votre interface, masquez celles intégrées avec `toolbar: false` et appelez les [méthodes](../reference/methods) depuis vos propres boutons. Cet exemple propose le zoom, Redresser, Annuler la dernière action et Appliquer, et n’active chaque bouton que lorsqu’il peut agir.

L’événement [`change`](../reference/events#change) transporte l’[état](../reference/state) après chaque action, y compris celles lancées par vos boutons. `load` et `error` signalent l’arrivée de l’image ou l’échec d’Appliquer.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Zoom avant</button>
  <button type="button" data-action="zoomOut">Zoom arrière</button>
  <button type="button" data-action="edit">Modifier</button>
  <button type="button" data-action="straighten">Redresser</button>
  <button type="button" data-action="confirmTool">Terminé</button>
  <button type="button" data-action="undo">Annuler la dernière action</button>
  <button type="button" data-action="cancel">Annuler</button>
  <button type="button" data-action="apply">Appliquer</button>
</div>
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

const pic = useTemplateRef('pic')
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
      <button type="button" @click="viewer?.confirmTool()">
        Terminé
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
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>Terminé</button>
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

## Remarques

- Avec `toolbar: false`, la barre de modification intégrée est aussi masquée, donc Recadrer et Redresser affichent leurs poignées mais pas de bouton Terminé. Votre interface les valide avec [`confirmTool()`](../reference/methods#confirmtool), comme `Entrée`.
- [`cancel()`](../reference/methods#cancel) ne demande rien avant d’abandonner les changements. Demandez à l’utilisateur s’il y en a, par exemple quand `canApply` est vrai.
- Les raccourcis clavier fonctionnent toujours quand la visionneuse a le focus. Voir [Accessibilité](../guide/accessibility).
