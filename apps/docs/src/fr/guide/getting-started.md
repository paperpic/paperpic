---
title: Bien démarrer
description: Installez PaperPic pour JavaScript, Vue ou React, affichez votre première image de document et récupérez l’image modifiée.
---

# Bien démarrer

Cette page vous mène de l’installation de PaperPic à l’affichage d’une image et à la récupération du résultat modifié. Choisissez votre framework dans n’importe quel exemple, et les autres exemples du site suivent.

## Installation

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` nécessite Vue 3.5 ou plus récent.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` nécessite React 19 ou plus récent.

::::

### Sans bundler {#cdn}

Le core se charge aussi depuis un CDN qui sert les fichiers du paquet tels quels, comme jsDelivr. Importez `dist/index.js` depuis un script de module, et liez `dist/style.css` :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Un ticket de caisse' })
</script>
```

Les navigateurs ne démarrent un worker que depuis l’origine de la page, donc avec le paquet sur un CDN la modification s’exécute sur le thread principal : elle fonctionne, mais les grandes photos figent la page un instant pendant Appliquer. Servez les fichiers depuis votre propre origine, ou utilisez un bundler, pour garder le worker. Les composants Vue et React ont besoin d’un bundler.

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` accepte une URL de la même origine que votre page, un `File` choisi par l’utilisateur, par exemple depuis un `<input type="file">`, ou un `Blob`. `alt` décrit l’image pour les lecteurs d’écran. [Charger des images](./loading) traite des images d’autres origines, des formats et des erreurs de chargement.

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

Le `blob` garde le format de l’image source quand c’est du JPEG, du PNG ou du WebP, et est en PNG quand l’utilisateur a nettoyé le document. [Format et qualité](./saving#format) explique comment PaperPic reconnaît le format, et l’option [`output`](../reference/options#output) le change.

## Retirer la visionneuse {#destroy}

Les composants Vue et React créent la visionneuse quand ils sont montés et la détruisent quand ils sont démontés. Avec le core, appelez [`destroy()`](../reference/methods#destroy) quand vous retirez la visionneuse de la page, par exemple quand la route change :

```ts
pic.destroy()
```

Elle retire la visionneuse de son conteneur, arrête ses écouteurs et son worker, et libère la mémoire de l’image. Pour l’afficher de nouveau, créez-en une nouvelle.

## Seulement afficher l’image

Pour afficher un document qui ne doit pas être modifié, désactivez la modification avec `editable: false`. La page [Visionneuse](./viewer) le montre en action.

## Prérequis

PaperPic fonctionne dans les navigateurs de [Baseline Widely Available](https://web.dev/baseline). [Performances et compatibilité](./performance) traite du worker, de la Content Security Policy, du rendu côté serveur et des grandes photos.

## Étapes suivantes

- [Charger des images](./loading) : d’où vient l’image, et quels formats s’ouvrent.
- [Visionneuse](./viewer) : zoom, adaptation et lecture seule.
- [Modification](./editing) : le mode d’édition, les outils et Appliquer.
- [Options](../reference/options) : tout ce que vous pouvez configurer.
- [Dépannage](./troubleshooting) : quand la visionneuse ne s’affiche pas ou ne fonctionne pas comme prévu.
