---
title: Vue
description: Comment le composant PaperPic pour Vue fait correspondre les options, les événements et les méthodes du cœur à des props, des événements de composant et une template ref.
---

# Vue

`@paperpic/vue` enveloppe la visionneuse dans un composant pour Vue 3.5 ou plus récent. Les options sont des props, les événements sont des événements du composant, et les méthodes sont sur l’`instance` que le composant expose.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // Envoyez l’image modifiée à votre serveur
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" @apply="upload" />
  </div>
</template>
```

Le composant remplit son élément parent : donnez une hauteur au parent.

## Props

Chaque [option](./options) est une prop du même nom, comme `:editable="false"` ou `:aspect-ratio="210 / 297"`. Un changement de prop parvient à la visionneuse par `setOptions()`. `class` et `style` vont à l’élément qui contient la visionneuse, qui a aussi la classe `paperpic-host`.

Un objet ou un tableau au même contenu qu’avant, comme `:tools="['crop', 'rotate']"`, ne change rien, donc le template peut les construire. Une fonction est nouvelle à chaque rendu du parent, donc construisez avec `computed` les `labels` qui contiennent des fonctions, comme `zoomLevel`.

## Événements

| Événement  | Données                                        |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error, phase }`                             |
| `load`     | [`Size`](./types#size)                         |

[Événements](./events) décrit chacun d’eux. Un changement de prop n’émet jamais `change`. [État](./state#in-step) montre comment garder l’état dans un `shallowRef` avec `@change`, `@load` et `@error`.

## Méthodes {#methods}

Le composant expose la visionneuse comme `instance`, avec les [méthodes](./methods), comme `zoomIn()` ou `apply()`. Elle vaut `null` jusqu’au montage du composant :

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Zoom avant
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

Le composant crée la visionneuse à son montage et la détruit à son démontage, donc n’appelez pas `destroy()`. Changez les props au lieu d’appeler `setOptions()`, que le prochain changement d’une prop annulerait, et utilisez les événements du composant au lieu d’`on()`.

Passer le même `src` une nouvelle fois ne recharge pas l’image, donc elle garde le résultat d’une modification. Pour retrouver l’original, appelez `instance.reload()`.

## Types {#types}

`@paperpic/vue` exporte tous les types de `@paperpic/core`, donc inutile de l’installer : [Types](./types) les présente un par un. Il exporte aussi les types du composant : [`PaperPicProps`](./types#paperpicprops), avec ses props, et [`PaperPicInstance`](./types#paperpicinstance), la visionneuse de `instance`.

## Rendu côté serveur

Avec un rendu côté serveur, comme dans Nuxt, le composant rend un élément vide sur le serveur et crée la visionneuse dans le navigateur.
