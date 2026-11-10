---
title: Bien démarrer
description: Installez PaperPic pour JavaScript, Vue ou React, affichez votre première image de document et récupérez l’image modifiée.
---

# Bien démarrer

Cette page vous mène de l’installation de PaperPic à l’affichage d’une image et à la récupération du résultat modifié. Choisissez votre framework dans n’importe quel exemple, et les autres exemples du site suivent.

## Installation

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` nécessite Vue 3.5 ou plus récent.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` nécessite React 19 ou plus récent.

:::

## Afficher une image

La visionneuse remplit son conteneur : donnez une hauteur au conteneur. Importez la feuille de style une fois dans votre application.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: 'Un ticket de caisse',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" />
    </div>
  )
}
```

:::

`src` accepte une URL de la même origine que votre page, ou un `File` choisi par l’utilisateur, par exemple depuis un `<input type="file">`. `alt` décrit l’image pour les lecteurs d’écran.

## Récupérer l’image modifiée

Le crayon de la barre d’outils ouvre le mode d’édition. Quand l’utilisateur applique les changements, le résultat remplace l’image affichée, et l’événement `apply` le remet à votre code :

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Un ticket de caisse" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Un ticket de caisse" onApply={({ blob }) => upload(blob)} />
```

:::

Ici, `upload` représente votre propre code, par exemple :

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

Le `blob` garde le format de l’image source, ou est en PNG quand l’utilisateur a nettoyé le document. L’option [`output`](../reference/options#output) le change.

## Seulement afficher l’image

Pour afficher un document qui ne doit pas être modifié, désactivez la modification avec `editable: false`. La page [Visionneuse](./viewer) le montre en action.

## Prérequis

- PaperPic fonctionne dans les navigateurs de [Baseline Widely Available](https://web.dev/baseline).
- La modification s’exécute dans un Web Worker, que des bundlers comme Vite et webpack prennent en charge seuls. Si le worker ne peut pas démarrer, la modification s’exécute sur le thread principal : elle fonctionne toujours, mais la page peut se figer un instant avec de grandes images.
- Avec une Content Security Policy, autorisez le worker avec `worker-src 'self'`, et autorisez `img-src blob:`, car la visionneuse affiche les fichiers joints et les résultats par des URL `blob:`.
- Avec un rendu côté serveur, comme dans Nuxt ou Next.js, les composants Vue et React rendent un élément vide sur le serveur et créent la visionneuse dans le navigateur. Avec le cœur, créez vous-même la visionneuse dans le navigateur.

## Étapes suivantes

- [Visionneuse](./viewer) : zoom, ajustement et lecture seule.
- [Modification](./editing) : le mode d’édition, les outils et Appliquer.
- [Options](../reference/options) : tout ce que vous pouvez configurer.
