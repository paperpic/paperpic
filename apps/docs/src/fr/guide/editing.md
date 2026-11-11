---
title: Modification
description: Comment fonctionne le mode d’édition de PaperPic, du bouton Modifier jusqu’à Appliquer, avec les outils, Annuler la dernière action et Rétablir, l’aperçu et les événements que reçoit votre code.
---

# Modification

La photo d’un document a souvent besoin de quelques corrections avant de valoir la peine d’être gardée. Le mode d’édition les regroupe : l’utilisateur fait les changements, les vérifie, puis les applique tous d’un coup. Le [playground](../playground) permet d’essayer tout le mode d’édition.

## Le déroulé

1. L’utilisateur appuie sur Modifier, le crayon de la barre d’outils. La barre de modification apparaît en bas de la visionneuse.
2. Chaque outil de la barre de modification ajoute un changement, que la visionneuse affiche aussitôt. Annuler la dernière action et Rétablir parcourent les changements.
3. Appliquer calcule le résultat et revient à l’affichage. Annuler abandonne les changements, et demande d’abord s’il y en a.

Rien ne modifie l’image avant Appliquer. Jusque-là, les changements sont une liste dont la visionneuse montre un aperçu.

## Outils

| Outil                                       | Ce qu’il fait                                            | Id            |
| ------------------------------------------- | -------------------------------------------------------- | ------------- |
| [Recadrer](./tools/crop)                    | Garde la partie de l’image à l’intérieur de quatre coins | `crop`        |
| [Redresser](./tools/straighten)             | Transforme une photo prise de biais en page bien à plat  | `perspective` |
| [Pivoter à gauche](./tools/rotate-and-flip) | Fait pivoter l’image d’un quart de tour vers la gauche   | `rotate`      |
| [Retourner](./tools/rotate-and-flip)        | Retourne l’image de gauche à droite                      | `flip`        |
| [Ajuster](./tools/adjust)                   | Change la luminosité et le contraste                     | `adjust`      |
| [Nettoyer](./tools/clean-up)                | Transforme le document en noir et blanc net, sans ombres | `threshold`   |

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

Recadrer et Redresser ont leur propre sélection, donc le reste de la barre de modification attend tant que l’un d’eux est ouvert. Terminé, ou `Entrée`, ajoute la sélection aux changements, et Annuler cet outil, ou `Échap`, l’abandonne.

## Aperçu et Appliquer

Pendant la modification, la visionneuse montre un aperçu des changements sur une copie de l’image d’environ 2 mégapixels, pour rester rapide avec de grandes photos. En zoomant, l’aperçu paraît plus doux que le résultat. Appliquer calcule tous les changements en pleine résolution, ou à [`maxOutputSize`](../reference/options#maxoutputsize), dans un Web Worker.

Appliquer ne peut pas être interrompu. Il bloque les commandes et affiche un message pendant son exécution. Ensuite, le résultat remplace l’image affichée, l’historique se vide et la visionneuse revient au mode d’affichage. Si Appliquer échoue, la modification reste ouverte pour que l’utilisateur puisse réessayer.

## Ce que reçoit votre code

| Événement | Quand                                                                   |
| --------- | ----------------------------------------------------------------------- |
| `apply`   | Quand le résultat est prêt, avec `{ blob, width, height, type }`        |
| `change`  | Après chaque action de l’utilisateur, avec l’[état](../reference/state) |
| `error`   | Quand Appliquer échoue, ou quand l’image ne peut pas être chargée       |

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
- Un nouveau `src` pendant la modification.
- Un changement d’`editable` pendant la modification.

Après Appliquer, passer le même `src` une nouvelle fois ne fait rien, donc le résultat reste affiché. [`reload()`](../reference/methods#reload) ramène l’original.

## Clavier

Quand la visionneuse a le focus :

| Touche                   | Action                                                  |
| ------------------------ | ------------------------------------------------------- |
| `Ctrl+Z`                 | Annuler la dernière action                              |
| `Ctrl+Maj+Z` ou `Ctrl+Y` | Rétablir                                                |
| `Entrée`                 | Valider l’outil ouvert, sinon appliquer les changements |
| `Échap`                  | Fermer l’outil ouvert, sinon annuler les changements    |

Sur macOS, `Cmd` fonctionne comme `Ctrl`.
