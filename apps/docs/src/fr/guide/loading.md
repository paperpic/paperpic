---
title: Charger des images
description: Comment donner une image à PaperPic, depuis une URL, un fichier choisi par l’utilisateur ou un Blob que vous récupérez, quels formats il ouvre, et comment votre code sait que l’image a chargé ou échoué.
---

# Charger des images

PaperPic affiche l’image que vous passez dans `src`. Cette page explique d’où peut venir cette image, quels formats s’ouvrent, et comment votre code sait que l’image est prête ou qu’elle a échoué.

## D’où vient l’image

`src` accepte l’une de ces trois choses :

- **Une URL de la même origine que votre page**, comme `/documents/42.jpg`.
- **Un `File`** que l’utilisateur choisit avec `<input type="file">`. [Joindre et numériser](../examples/attach-and-scan) montre tout le parcours, de la caméra à l’envoi.
- **Un `Blob`** que détient votre code, comme le corps d’une réponse.

Pour un `File` ou un `Blob`, PaperPic crée l’URL `blob:` dont il a besoin, et la libère quand l’image change ou que la visionneuse est détruite.

## Images d’une autre origine, ou derrière une connexion {#fetch}

PaperPic lit les pixels de l’image pour la modifier. Les navigateurs ne l’autorisent pour une image d’une autre origine que si elle arrive avec CORS, ce que PaperPic ne demande pas. Une telle image s’affiche, mais la modifier échoue : une [`error`](../reference/events#error) le signale dès qu’un changement a besoin de ses pixels, ou pendant Appliquer.

Récupérez l’image vous-même, et passez le `Blob` comme `src`. Cela couvre aussi les images derrière une connexion, car votre requête porte les cookies de l’utilisateur :

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

L’autre serveur doit autoriser votre origine avec CORS, comme pour tout `fetch` depuis la page.

## Formats {#formats}

PaperPic ouvre tout format que le navigateur affiche dans un `<img>` :

- **JPEG, PNG, WebP et AVIF** s’ouvrent dans tous les [navigateurs pris en charge](./performance#browser-support).
- **SVG** s’ouvre quand le fichier a les attributs `width` et `height`. Sans eux, il n’a pas de taille, et le chargement échoue.
- **HEIC**, le format des photos d’iPhone, ne s’ouvre que dans Safari. Quand un utilisateur d’iPhone choisit une photo avec `<input type="file" accept="image/*">`, iOS donne en général à la page une copie en JPEG. Un fichier HEIC qui arrive dans un autre navigateur par un autre chemin ne se charge pas.

Les téléphones enregistrent souvent une photo de côté, avec une balise EXIF qui indique comment la tourner. PaperPic affiche la photo comme l’indique la balise, comme le fait un `<img>`, et le résultat de Appliquer sort droit.

## Savoir quand elle charge ou échoue

L’événement [`load`](../reference/events#load) signale que l’image est affichée, avec sa taille. Si l’image ne peut pas charger, parce qu’elle n’existe pas, que ce n’est pas une image ou que le navigateur ne sait pas la décoder, la visionneuse affiche un message, et l’événement [`error`](../reference/events#error) porte `phase: 'load'` :

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Facture 42' })

pic.on('load', ({ width, height }) => {
  console.log(`L’image fait ${width}×${height} pixels`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`L’image fait ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Facture 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`L’image fait ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Facture 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

`load` est émis à chaque chargement d’un `src`, y compris avec [`reload()`](../reference/methods#reload), mais pas après Appliquer : le résultat arrive avec l’événement [`apply`](../reference/events#apply).

Le `status` de [`getState()`](../reference/state) donne la même réponse à tout moment : `'empty'`, `'loading'`, `'ready'` ou `'error'`.

## Changer ou recharger l’image

- **Un nouveau `src`** charge la nouvelle image. Pendant que l’utilisateur modifie, il abandonne les modifications.
- **Le même `src`** ne fait rien, si bien que le résultat de Appliquer reste affiché.
- **[`reload()`](../reference/methods#reload)** recharge le `src` actuel, ce qui ramène l’original après Appliquer. Pendant la modification, il abandonne aussi les changements.
