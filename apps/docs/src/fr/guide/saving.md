---
title: Enregistrer le résultat
description: Comment PaperPic remet l’image modifiée, comment choisir son format et sa taille, comment l’envoyer, et comment fonctionnent le bouton de téléchargement et son événement.
---

# Enregistrer le résultat

PaperPic n’envoie ni ne stocke jamais rien. Quand l’utilisateur applique les changements, il remet le résultat à votre code, et votre application décide où il va. Cette page explique ce que vous recevez et comment l’enregistrer.

## L’événement `apply`

Appliquer calcule le résultat et émet [`apply`](../reference/events#apply) avec :

| Champ             | Type     | Description                     |
| ----------------- | -------- | ------------------------------- |
| `blob`            | `Blob`   | L’image modifiée                |
| `width`, `height` | `number` | Sa taille en pixels             |
| `type`            | `string` | Son format, comme `'image/png'` |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

Après Appliquer, le résultat est l’image affichée, l’historique est vide, et la modification suivante part du résultat. [`reload()`](../reference/methods#reload) ramène le `src` d’origine.

## L’envoyer

Envoyez le `blob` comme fichier dans un formulaire :

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

La visionneuse affiche le résultat aussitôt, qu’il atteigne votre serveur ou non, donc prévenez l’utilisateur si l’envoi échoue.

## Format et qualité

Sans option, le résultat garde le format de l’image source : JPEG, PNG ou WebP. Un document nettoyé est en PNG, car le JPEG ajouterait des artefacts autour de ses bords nets. Toute autre source, comme un GIF, donne du PNG.

[`output`](../reference/options#output) choisit le format, et sa qualité de 0 à 1 pour JPEG et WebP, avec 0.92 par défaut :

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| Format       | Convient à                                                         |
| ------------ | ------------------------------------------------------------------ |
| `image/png`  | Documents nettoyés et texte, sans perte                            |
| `image/jpeg` | Photos et documents en couleur, en petits fichiers                 |
| `image/webp` | Photos et documents en couleur, en fichiers plus petits qu’en JPEG |

Un navigateur qui ne sait pas encoder le format demandé donne du PNG, donc lisez `type` dans l’événement.

## Taille

Le résultat garde la pleine résolution de la source, qui atteint 12 mégapixels ou plus pour beaucoup de photos de téléphone. [`maxOutputSize`](../reference/options#maxoutputsize) limite son plus grand côté, en pixels :

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

L’aperçu pendant la modification fait toujours environ 2 mégapixels, donc `maxOutputSize` ne change que le résultat.

## Le bouton de téléchargement

[`download: true`](../reference/options#download) ajoute un bouton à la fin de la barre d’outils qui enregistre l’image affichée : le résultat du dernier Appliquer, ou sinon l’image source telle quelle. Il est masqué pendant la modification, car les changements ne sont pas encore appliqués. [`download()`](../reference/methods#download) fait de même depuis le code, avec ou sans le bouton. Le menu contextuel du navigateur ne s’ouvre pas sur la visionneuse, donc ce bouton est le moyen d’en enregistrer l’image.

Le fichier garde le nom de la source et prend l’extension de son format, donc un `receipt.jpg` nettoyé s’enregistre en `receipt.png`. [`filename`](../reference/options#filename) choisit un autre nom. Sans aucun nom, comme pour un `Blob`, le fichier s’appelle `image`.

### L’enregistrer autrement

L’événement [`download`](../reference/events#download) arrive avant que le navigateur enregistre le fichier. Appelez `preventDefault()` pour l’enregistrer autrement, par exemple depuis votre serveur, qui peut nommer le fichier et vérifier qui le télécharge :

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
