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
| `type`            | `string` | Son format, comme `'image/png'` |
| `width`, `height` | `number` | Sa taille en pixels             |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="({ blob, type }) => upload(blob, type)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={({ blob, type }) => upload(blob, type)} />
```

:::

Après Appliquer, le résultat est l’image affichée, l’historique est vide, et la modification suivante part du résultat. [`reload()`](../reference/methods#reload) ramène le `src` d’origine.

## L’envoyer

Envoyez le `blob` comme fichier dans un formulaire :

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

La visionneuse affiche le résultat aussitôt, qu’il atteigne votre serveur ou non, donc prévenez l’utilisateur si l’envoi échoue.

## Format et qualité {#format}

Sans option, le résultat garde le format de l’image source quand c’est du JPEG, du PNG ou du WebP. PaperPic le lit dans l’extension de l’URL, comme `.jpg`, ou dans le type du `File` ou du `Blob`. Un document en noir et blanc est en PNG, car le JPEG ajouterait des artefacts autour de ses bords nets. Toute autre source donne aussi du PNG, comme un GIF, ou une URL sans extension comme `/api/documents/42`, même si elle sert un JPEG.

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
| `image/png`  | Documents en noir et blanc, et texte, sans perte                   |
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

L’aperçu pendant la modification fait au plus environ 2 mégapixels, donc `maxOutputSize` ne change que le résultat.

Safari sur iOS limite un canvas à environ 16 mégapixels, et les iPhone récents prennent des photos de 24 mégapixels ou plus, donc Appliquer peut échouer en pleine résolution. Si vos utilisateurs modifient des photos depuis un iPhone, définissez `maxOutputSize`. 3000 pixels gardent les documents lisibles et restent bien en dessous de la limite. [Appliquer échoue avec une grande photo](./troubleshooting#too-large) montre l’erreur.

## Métadonnées {#metadata}

Le résultat d’Appliquer ne contient aucune métadonnée. PaperPic dessine l’image sur un canvas, donc les données EXIF de la photo, comme la position GPS, l’appareil et la date, disparaissent. Le bouton de téléchargement enregistre l’image source telle quelle jusqu’au premier Appliquer, avec ses métadonnées.

## Le bouton de téléchargement {#download}

[`download: true`](../reference/options#download) ajoute un bouton à la fin de la barre d’outils qui enregistre l’image affichée : le résultat du dernier Appliquer, ou sinon l’image source telle quelle. Il est masqué pendant la modification, car les changements ne sont pas encore appliqués. [`download()`](../reference/methods#download) fait de même depuis le code, avec ou sans le bouton. Le menu contextuel du navigateur ne s’ouvre pas sur la visionneuse, donc ce bouton est le moyen d’en enregistrer l’image.

Le fichier garde le nom de la source et prend l’extension de son format, donc un `receipt.jpg` en noir et blanc s’enregistre en `receipt.png`. [`filename`](../reference/options#filename) choisit un autre nom. Sans aucun nom, comme pour un `Blob`, le fichier s’appelle `image`. Avant le premier Appliquer, une URL sans extension s’enregistre sans extension, car son format est inconnu.

Avec un `src` d’une autre origine, les navigateurs n’enregistrent pas le fichier avant le premier Appliquer : ils ouvrent l’image à la place, et l’utilisateur quitte votre page. Passez l’image en `Blob`, comme le montre [Charger des images](./loading#fetch), ou enregistrez-la vous-même dans l’événement `download`.

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
