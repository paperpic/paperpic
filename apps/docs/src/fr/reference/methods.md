---
title: Méthodes
description: Toutes les méthodes de la classe PaperPic, pour piloter la visionneuse depuis votre code, comme zoomer, adapter, faire pivoter, modifier, appliquer, télécharger et recharger.
---

# Méthodes

Les méthodes pilotent la visionneuse depuis votre code, par exemple depuis vos propres boutons avec [`toolbar: false`](./options#toolbar). Avec le core, appelez-les sur le `PaperPic` que vous créez. En Vue, le composant expose la visionneuse comme `instance`, et en React, `ref` la reçoit. Les deux valent `null` jusqu’au montage du composant :

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

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
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Zoom avant</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

En Vue et en React, le composant crée et détruit la visionneuse, et reçoit les options comme props et les événements comme ses propres événements. N’y appelez donc pas [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions) ni [`on()`](#on).

## Créer et détruire

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Crée la visionneuse dans `container`, qu’elle remplit. Donnez une hauteur au conteneur, sinon la visionneuse reste à sa hauteur minimale. [Options](./options) détaille ce qu’accepte `options`.

Elle lève une `TypeError` si `container` n’est pas un élément. Créez la visionneuse une fois l’élément créé, par exemple au montage. Elle lève une `RangeError` si une option est hors de sa plage.

Seulement avec le core : les composants Vue et React créent la visionneuse à leur montage.

### `destroy()`

```ts
function destroy(): void
```

Retire la visionneuse et libère tout ce qu’elle occupe, comme son worker et la mémoire de ses images. L’appeler deux fois ne pose aucun problème.

Seulement avec le core : les composants Vue et React l’appellent à leur démontage. Appelée sur leur visionneuse, elle laisserait le composant vide.

## Options et état

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Change les options que vous passez et garde les autres. `undefined` remet une option à sa valeur par défaut. Elle n’émet jamais `change`, donc les liaisons bidirectionnelles ne bouclent pas. Elle lève une `RangeError` si une option est hors de sa plage, et aucune option ne change alors.

En Vue et en React, changez plutôt les props. Le prochain changement d’une prop renvoie toutes les options, ce qui annulerait un changement fait avec `setOptions()`.

### `getState()`

```ts
function getState(): PaperPicState
```

Renvoie l’état actuel de la visionneuse, comme le zoom, le mode et s’il y a des changements à appliquer. Pour être prévenu de chaque changement sans le demander, écoutez [`change`](./events#change). [État](./state) décrit chaque champ, et comment les deux se complètent.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Écoute un événement et renvoie une fonction qui arrête l’écoute. [Événements](./events) décrit chaque événement.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

En Vue et en React, écoutez plutôt les événements du composant, comme `@apply` ou `onApply`.

## Affichage

### `zoomIn()`

```ts
function zoomIn(): void
```

Zoome d’un cran, autour du centre de la visionneuse.

### `zoomOut()`

```ts
function zoomOut(): void
```

Dézoome d’un cran, autour du centre de la visionneuse.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

Fixe le zoom, où `1` affiche un pixel de l’image par pixel d’écran. [`point`](./types#viewpoint) reste en place : il est en pixels CSS depuis le coin supérieur gauche de la visionneuse, et c’est son centre par défaut.

Le zoom va de celui qui adapte l’image entière, ou `1` s’il est plus petit, jusqu’à `8`. Une valeur hors de cette plage est ramenée à la limite.

Elle lève une `RangeError` si `zoom` vaut `NaN` ou si une coordonnée de `point` n’est pas un nombre fini, et le zoom ne change alors pas.

### `fit()`

```ts
function fit(fit: Fit): void
```

Adapte à la visionneuse l’image entière, sa largeur ou sa hauteur. `fit` est un [`Fit`](./types#fit) : `'image'`, `'width'` ou `'height'`.

## Modification

### `edit()`

```ts
function edit(): void
```

Commence la modification. Ne fait rien si l’image n’est pas prête ou si [`editable`](./options#editable) vaut `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Fait pivoter l’image d’un quart de tour : dans le sens des aiguilles d’une montre avec `1`, la valeur par défaut, et dans le sens inverse avec `-1`. Pendant la modification, elle ajoute un changement qu’[`apply()`](#apply) rend définitif, et ne fait rien tant qu’un outil est ouvert ou qu’Appliquer est en cours. Dans une visionneuse en lecture seule, elle ne change que l’affichage. Sinon, elle ne fait rien.

### `flip()`

```ts
function flip(): void
```

Retourne l’image de gauche à droite telle qu’elle est affichée, donc après un quart de tour elle retourne toujours de gauche à droite. Pour la mettre en miroir de haut en bas, retournez-la et faites-la pivoter deux fois. C’est un changement, et elle ne fait rien hors du mode d’édition ou avec un outil ouvert.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Ouvre un outil avec un panneau : Recadrer (`'crop'`), Redresser (`'perspective'`), Ajuster (`'adjust'`) ou Nettoyer (`'finish'`), qui choisit le noir et blanc en s’ouvrant quand la finition est l’original. L’outil reste ouvert jusqu’à [`confirmTool()`](#confirmtool) ou [`cancelTool()`](#canceltool). Pendant ce temps, aucun autre changement ne peut commencer, et Annuler la dernière action, Rétablir et Appliquer ne font rien. Ne fait rien hors du mode d’édition, avec un autre outil ouvert, pour Ajuster en noir et blanc, ni pour Recadrer et Redresser pendant qu’un aperçu est en route.

### `confirmTool()`

```ts
function confirmTool(): void
```

Ferme l’outil ouvert et ajoute ce qu’il a choisi aux changements, comme `Entrée` : la sélection de Recadrer ou de Redresser, ou les réglages d’Ajuster ou de Nettoyer, comme un seul changement.

### `cancelTool()`

```ts
function cancelTool(): void
```

Ferme l’outil ouvert et abandonne ses changements, comme `Échap`.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

Choisit la finition de [Nettoyer](../guide/tools/clean-up) : `'original'`, `'gray'` ou `'mono'` pour le noir et blanc. Change aussi la sensibilité du noir et blanc, de 0 à 1. La finition s’applique toujours après les autres changements. Tant que Nettoyer est ouvert, change ce que montre Nettoyer, et [`confirmTool()`](#confirmtool) le garde comme un seul changement. Ne fait rien hors du mode d’édition ou avec un autre outil ouvert.

Elle lève une `RangeError` si `mode` n’est pas un [`FinishMode`](./types#finishmode), ou si `sensitivity` n’est pas entre 0 et 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Change la luminosité ou le contraste, chacun de -1 à 1, où 0 laisse l’image telle quelle. Ils s’appliquent après les autres changements, et avant le gris. Tant qu’Ajuster est ouvert, change ce que montre Ajuster, et [`confirmTool()`](#confirmtool) le garde comme un seul changement. Ne fait rien hors du mode d’édition, avec un autre outil ouvert ou en noir et blanc : le noir et blanc compare chaque pixel à son entourage, donc la luminosité et le contraste ne changeraient presque pas son résultat.

Elle lève une `RangeError` si une valeur n’est pas entre -1 et 1.

### `undo()`

```ts
function undo(): void
```

Annule le dernier changement. Ne fait rien hors du mode d’édition, avec un outil ouvert ou pendant qu’Appliquer est en cours.

### `redo()`

```ts
function redo(): void
```

Rétablit le dernier changement annulé. Ne fait rien hors du mode d’édition, avec un outil ouvert ou pendant qu’Appliquer est en cours.

### `apply()`

```ts
function apply(): Promise<void>
```

Applique les changements en pleine résolution, ou à [`maxOutputSize`](./options#maxoutputsize). Le résultat devient l’image affichée, l’historique se vide, la visionneuse revient au mode d’affichage, et l’événement [`apply`](./events#apply) envoie le résultat. Appliquer ne peut pas être interrompu, et bloque les commandes pendant son exécution. Ne fait rien hors du mode d’édition, avec un outil ouvert, ou quand il n’y a rien à appliquer.

En cas d’échec, l’événement [`error`](./events#error) le signale et la modification reste ouverte. La promesse se résout quand Appliquer se termine, même en cas d’échec : écoutez donc `error`, car un `try/catch` ne le voit pas.

### `cancel()`

```ts
function cancel(): void
```

Abandonne les changements et revient au mode d’affichage. Elle ne demande rien : c’est le rôle du bouton Annuler intégré et d’`Échap`. Ne fait rien pendant qu’Appliquer est en cours.

## Image

### `download()`

```ts
function download(): void
```

Enregistre l’image affichée dans un fichier : le résultat du dernier Appliquer, ou sinon l’image source. Elle fonctionne sans l’option [`download`](./options#download), qui ne fait qu’afficher un bouton. L’événement [`download`](./events#download) arrive avant et peut l’empêcher. Ne fait rien pendant la modification, car les changements ne sont pas encore appliqués. Avant le premier Appliquer, un `src` d’une autre origine s’ouvre plutôt dans le navigateur : voir [Enregistrer le résultat](../guide/saving#download).

### `reload()`

```ts
function reload(): void
```

Recharge le [`src`](./options#src) actuel, ce qui ramène l’original après un Appliquer. Pendant la modification, abandonne les changements. Sans `src`, ne fait rien.
