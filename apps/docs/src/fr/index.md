---
layout: home
title: PaperPic
titleTemplate: Visionneuse et éditeur d’images de documents
description: "Visionneuse et éditeur d’images de documents pour le navigateur : redressez, recadrez, faites pivoter et nettoyez photos de téléphone, scans et toute image avec du texte. Pour JavaScript, Vue et React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Des images de documents nettes et lisibles, directement dans le navigateur
  tagline: Redressez, recadrez et nettoyez une photo de téléphone, un scan ou toute image avec du texte. En JavaScript, Vue ou React, et rien ne quitte l’appareil avant que votre code ne l’envoie.
  actions:
    - theme: brand
      text: Commencer
      link: /fr/guide/getting-started
    - theme: alt
      text: Playground
      link: /fr/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visionneuse"
    details: "Zoomez avec les boutons, la molette ou un pincement, déplacez l’image et adaptez à la largeur les longs tickets. En lecture seule si besoin."
    link: /fr/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Redresser et recadrer"
    details: "Transformez une photo prise de biais en page à plat, avec ses proportions estimées ou fixées. La visionneuse trouve les coins, et vous pouvez les faire glisser."
    link: /fr/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Nettoyer"
    details: "Transformez une photo pleine d’ombres en noir et blanc net, et réglez la luminosité et le contraste des documents en couleur."
    link: /fr/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Pleine résolution"
    details: "Appliquer remet à votre code l’image modifiée sous forme de Blob, traitée dans un Web Worker pour que la page reste réactive."
    link: /fr/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessible"
    details: "Raccourcis clavier, poignées d’angle qui se déplacent avec les flèches et annonces pour les lecteurs d’écran."
    link: /fr/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Tout framework"
    details: "Un cœur pour JavaScript sans framework, des wrappers légers pour Vue et React, et aucune dépendance à l’exécution."
    link: /fr/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Comparer la photo et le résultat"
  beforeLabel: "Photo"
  afterLabel: "PaperPic"
  beforeAlt: "Photo d’un ticket de caisse sur une table, prise de biais et en partie dans l’ombre"
  afterAlt: "Le même ticket, redressé et nettoyé en noir et blanc"
---

## Rien ne quitte le navigateur

PaperPic modifie l’image sur l’appareil de l’utilisateur, dans un Web Worker, sans serveur et sans requête de sa part. La photo d’un ticket de caisse, d’une carte d’identité ou d’un contrat ne quitte l’appareil que lorsque votre code envoie le résultat.

## Démarrer en quelques lignes

Installez le paquet de votre framework, donnez une hauteur au conteneur et écoutez Appliquer :

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'Un ticket de caisse' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" onApply={({ blob }) => upload(blob)} />
}
```

:::

[Bien démarrer](./guide/getting-started) détaille l’installation et chaque étape.
