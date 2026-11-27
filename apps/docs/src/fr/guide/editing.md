---
title: Modification
description: Comment fonctionne le mode d’édition de PaperPic, du bouton Modifier jusqu’à l’application des modifications, avec les outils, Annuler la dernière action et Rétablir, l’aperçu et les événements que reçoit votre code.
---

# Modification

La photo d’un document a souvent besoin de quelques corrections avant de valoir la peine d’être gardée. Le mode d’édition les regroupe : l’utilisateur fait les changements, les vérifie, puis les applique tous d’un coup. Le [playground](../playground) permet d’essayer tout le mode d’édition.

## Le déroulé

1. L’utilisateur appuie sur Modifier, le crayon de la barre d’outils. La barre d’outils se masque, pour que rien ne cache l’image, et la barre de modification apparaît en bas de la visionneuse.
2. Pivoter à gauche et Retourner ajoutent aussitôt un changement. Les autres outils ouvrent un panneau dans la barre de modification, et un appui sur Terminé ajoute ce que l’utilisateur y a choisi comme un seul changement. Annuler la dernière action et Rétablir permettent de reculer et d’avancer dans les changements.
3. Un appui sur Appliquer calcule le résultat et ramène la visionneuse à l’affichage. Annuler abandonne les changements, après confirmation s’il y en a.

Rien ne modifie l’image tant que l’utilisateur n’a pas appuyé sur Appliquer. Jusque-là, les changements sont une liste dont la visionneuse montre un aperçu.

Dans une visionneuse étroite, la barre de modification a deux lignes : en haut, les outils ou le panneau de l’outil ouvert, et en bas, Annuler à gauche et Appliquer, ou Terminé, à droite. À partir de 38rem de large, tout tient sur une ligne. Dans les deux cas, la barre garde sa hauteur quand un outil s’ouvre, donc l’image garde sa place. Un point marque Ajuster et Nettoyer tant que leur réglage s’applique.

## Outils

| Outil                                       | Ce qu’il fait                                                       | Id            |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------- |
| [Recadrer](./tools/crop)                    | Garde la partie de l’image à l’intérieur de quatre coins            | `crop`        |
| [Redresser](./tools/straighten)             | Transforme une photo prise de biais en page bien à plat             | `perspective` |
| [Pivoter à gauche](./tools/rotate-and-flip) | Fait pivoter l’image d’un quart de tour vers la gauche              | `rotate`      |
| [Retourner](./tools/rotate-and-flip)        | Retourne l’image de gauche à droite                                 | `flip`        |
| [Ajuster](./tools/adjust)                   | Change la luminosité et le contraste                                | `adjust`      |
| [Nettoyer](./tools/clean-up)                | Transforme le document en gris, ou en noir et blanc net sans ombres | `finish`      |
| [Masquer](./tools/redact)                   | Recouvre une zone de noir ou de blanc opaque                        | `redact`      |

L’option [`tools`](../reference/options#tools) choisit ceux que propose la barre de modification :

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Recadrer, Redresser, Masquer, Ajuster et Nettoyer ouvrent un panneau à la place des outils. Tant que l’un d’eux est ouvert, les autres outils, Annuler la dernière action, Rétablir et Appliquer sont désactivés. Terminé, ou `Entrée`, ajoute aux changements ce qui est choisi dans l’outil, et Annuler cet outil, ou `Échap`, l’abandonne.

Dans un panneau, l’image apparaît telle que sera le résultat, Nettoyer compris. Redresser fait exception : il montre la photo sans le noir et blanc, pour que les bords du papier restent visibles.

## Aperçu et résultat

Pendant la modification, la visionneuse montre un aperçu des changements sur une copie de l’image d’environ 2 mégapixels, pour rester rapide avec de grandes photos. En zoomant, l’aperçu paraît plus doux que le résultat. L’application des modifications calcule tous les changements en pleine résolution, ou à [`maxOutputSize`](../reference/options#maxoutputsize), dans un Web Worker.

Une fois lancée, l’application des modifications ne peut pas être interrompue. Elle bloque les commandes et affiche un message pendant son exécution. Ensuite, le résultat remplace l’image affichée, l’historique se vide et la visionneuse revient au mode d’affichage. En cas d’échec, la modification reste ouverte pour que l’utilisateur puisse réessayer.

## Ce que reçoit votre code

| Événement | Quand                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `apply`   | Quand le résultat est prêt, avec `{ blob, width, height, type }`                                      |
| `change`  | Chaque fois que l’utilisateur ou une méthode change l’[état](../reference/state)                      |
| `error`   | Quand l’image ne peut pas être chargée, ou qu’une modification ne peut pas être affichée ou appliquée |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## Ce qui abandonne les changements

- Annuler, après confirmation de l’utilisateur, ou [`cancel()`](../reference/methods#cancel), qui ne demande rien.
- Un nouveau `src`, ou [`reload()`](../reference/methods#reload), pendant la modification.
- Un changement d’`editable` pendant la modification.

Après l’application des modifications, passer le même `src` une nouvelle fois ne fait rien, donc le résultat reste affiché. [`reload()`](../reference/methods#reload) ramène l’original.

## Clavier

Avec le focus sur la visionneuse, des touches annulent, rétablissent, confirment et abandonnent. [Accessibilité](./accessibility#keyboard) liste toutes les touches.
