---
title: État
description: Ce que renvoie getState() et ce qu’envoie l’événement change, comme le statut de l’image, le mode, le zoom, les changements et s’il y a quelque chose à appliquer, et comment y synchroniser vos propres commandes.
---

# État

L’état est un instantané de la visionneuse : s’il y a une image, le mode, le zoom, l’outil ouvert et s’il y a des changements à appliquer. Vous l’obtenez de deux façons, et les deux donnent le même objet [`PaperPicState`](./types#paperpicstate) :

- [`getState()`](./methods#getstate) le renvoie quand vous le demandez.
- L’événement [`change`](./events#change) l’envoie chaque fois que l’utilisateur ou une méthode le change.

## Synchroniser vos commandes {#in-step}

`change` ne signale pas l’image. Une image chargée arrive avec [`load`](./events#load), et un chargement ou un Appliquer qui échoue arrive avec [`error`](./events#error). Pour synchroniser vos propres commandes, comme un bouton Appliquer, lisez l’état au début, prenez-le de chaque `change` et relisez-le sur `load` et `error` :

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
    Appliquer
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
        Appliquer
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

En Vue et en React, la visionneuse n’existe qu’une fois le composant monté, donc l’état commence à `undefined` et arrive avec le premier `load` ou `error`. Jusque-là, il n’y a rien à appliquer.

## Champs

| Champ         | Type                                         | Description                                                                                                                                                                                              |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | L’outil ouvert, comme `'crop'` ou `'adjust'`, ou `null`                                                                                                                                                  |
| `adjustments` | `{ brightness, contrast }`                   | La luminosité et le contraste, chacun de -1 à 1. Ils ne s’appliquent pas en noir et blanc. Tant qu’Ajuster est ouvert, les valeurs de son panneau                                                        |
| `busy`        | `boolean`                                    | Si Appliquer est en cours                                                                                                                                                                                |
| `canApply`    | `boolean`                                    | S’il y a des changements à appliquer. Les rotations et retournements qui s’annulent ne comptent pas                                                                                                      |
| `canRedo`     | `boolean`                                    | S’il y a un changement à rétablir                                                                                                                                                                        |
| `canUndo`     | `boolean`                                    | S’il y a un changement à annuler                                                                                                                                                                         |
| `finish`      | `{ mode, sensitivity }`                      | La finition de Nettoyer, un [`FinishMode`](./types#finishmode), et la sensibilité du noir et blanc, de 0 à 1. Tant que Nettoyer est ouvert, les valeurs de son panneau                                   |
| `fit`         | [`Fit \| null`](./types#fit)                 | L’adaptation en vigueur, ou `null` dès que l’utilisateur a zoomé à la main                                                                                                                               |
| `hint`        | `string \| null`                             | Ce que l’outil ouvert demande à l’utilisateur, tel que la barre de modification intégrée l’affiche, par exemple « Drag the corners », ou `null`. Avec `toolbar: false`, affichez-le dans votre interface |
| `image`       | [`Size \| null`](./types#size)               | La taille de l’image en pixels, en pleine résolution et avec les changements faits, mais sans la rotation de `rotation`, ou `null` sans image                                                            |
| `mode`        | `'view' \| 'edit'`                           | Si l’utilisateur regarde ou modifie l’image                                                                                                                                                              |
| `rotation`    | [`Rotation`](./types#rotation)               | La rotation de l’image affichée par rapport à `image`, en degrés dans le sens des aiguilles d’une montre                                                                                                 |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` sans `src`, `'loading'` pendant le chargement, `'ready'` une fois affichée, et `'error'` si elle n’a pas pu être chargée                                                                       |
| `zoom`        | `number`                                     | Pixels d’écran par pixel de l’image                                                                                                                                                                      |

Avec une `rotation` de 90 ou 270, l’image affichée, et le résultat d’Appliquer, ont la largeur et la hauteur de `image` inversées. [`maxOutputSize`](./options#maxoutputsize) peut rendre le résultat plus petit.
