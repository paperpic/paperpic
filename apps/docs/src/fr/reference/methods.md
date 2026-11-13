---
title: Méthodes
description: Toutes les méthodes de la classe PaperPic, pour piloter la visionneuse depuis votre code, comme zoomer, ajuster, faire pivoter, modifier, appliquer, télécharger et recharger.
---

# Méthodes

Les méthodes pilotent la visionneuse depuis votre code, par exemple depuis vos propres boutons avec [`toolbar: false`](./options#toolbar). En Vue et en React, la ref du composant vous donne la visionneuse : voir [Vue](./vue) et [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Créer et détruire

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Crée la visionneuse dans `container`, qu’elle remplit. Donnez une hauteur au conteneur, sinon la visionneuse reste à sa hauteur minimale. [Options](./options) détaille ce qu’accepte `options`.

Elle lève une `TypeError` si `container` n’est pas un élément. Créez la visionneuse une fois l’élément créé, par exemple au montage.

### `destroy()`

```ts
function destroy(): void
```

Retire la visionneuse et libère tout ce qu’elle occupe, comme son worker et la mémoire de ses images. L’appeler deux fois ne pose aucun problème.

## Options et état

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Change les options que vous passez et garde les autres. `undefined` remet une option à sa valeur par défaut. Elle n’émet jamais `change`, donc les liaisons bidirectionnelles ne bouclent pas.

### `getState()`

```ts
function getState(): PaperPicState
```

Renvoie ce que montre la visionneuse, comme le zoom, le mode et s’il y a des changements à appliquer. [État](./state) décrit chaque champ.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Écoute un événement et renvoie une fonction qui arrête l’écoute. [Événements](./events) décrit chaque événement.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

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

Le zoom va de l’ajustement de l’image entière, ou `1` s’il est plus petit, jusqu’à `8`. Une valeur hors de cette plage est ramenée à la limite.

### `fit()`

```ts
function fit(fit: Fit): void
```

Ajuste à la visionneuse l’image entière, sa largeur ou sa hauteur. `fit` est un [`Fit`](./types#fit) : `'image'`, `'width'` ou `'height'`.

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

Fait pivoter l’image d’un quart de tour : dans le sens des aiguilles d’une montre avec `1`, la valeur par défaut, et dans le sens inverse avec `-1`. Pendant la modification, c’est un changement qu’[`apply()`](#apply) rend définitif. Dans une visionneuse en lecture seule, elle ne change que l’affichage. Sinon, elle ne fait rien.

### `flip()`

```ts
function flip(): void
```

Retourne l’image de gauche à droite telle qu’elle est affichée, donc après un quart de tour elle retourne toujours de gauche à droite. Pour mettre l’image à l’envers, retournez-la et faites-la pivoter deux fois. C’est un changement, et elle ne fait rien hors du mode d’édition ou avec un outil ouvert.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Ouvre un outil avec un panneau : Recadrer, avec `'crop'`, Redresser, avec `'perspective'`, Ajuster, avec `'adjust'`, ou Nettoyer, avec `'threshold'`, qui s’active en s’ouvrant. L’outil reste ouvert jusqu’à [`confirmTool()`](#confirmtool) ou [`cancelTool()`](#canceltool), et pendant ce temps les autres changements, Annuler la dernière action, Rétablir et Appliquer ne font rien. Ne fait rien hors du mode d’édition, avec un autre outil ouvert, pour Ajuster quand Nettoyer est activé, ni pour Recadrer et Redresser pendant qu’un aperçu est en route.

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

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Active ou désactive Nettoyer, ou change sa sensibilité, de 0 à 1. Nettoyer s’applique toujours après les autres changements. Tant que Nettoyer est ouvert, change ce que montre Nettoyer, et [`confirmTool()`](#confirmtool) le garde comme un seul changement. Ne fait rien hors du mode d’édition ou avec un autre outil ouvert.

Elle lève une `RangeError` si `sensitivity` n’est pas entre 0 et 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Change la luminosité ou le contraste, chacun de -1 à 1, où 0 laisse l’image telle quelle. Ils s’appliquent après les autres changements. Tant qu’Ajuster est ouvert, change ce que montre Ajuster, et [`confirmTool()`](#confirmtool) le garde comme un seul changement. Ne fait rien hors du mode d’édition, avec un autre outil ouvert ou quand Nettoyer est activé, car un document nettoyé a ses propres tons.

Elle lève une `RangeError` si une valeur n’est pas entre -1 et 1.

### `undo()`

```ts
function undo(): void
```

Annule le dernier changement.

### `redo()`

```ts
function redo(): void
```

Rétablit le dernier changement annulé.

### `apply()`

```ts
function apply(): Promise<void>
```

Applique les changements en pleine résolution, ou à [`maxOutputSize`](./options#maxoutputsize). Le résultat devient l’image affichée, l’historique se vide, la visionneuse revient au mode d’affichage, et l’événement [`apply`](./events#apply) transporte le résultat. Appliquer ne peut pas être interrompu, et bloque les commandes pendant son exécution.

En cas d’échec, l’événement [`error`](./events#error) le signale et la modification reste ouverte.

### `cancel()`

```ts
function cancel(): void
```

Abandonne les changements et revient au mode d’affichage. Elle ne demande rien : c’est le rôle du bouton Annuler intégré et d’`Échap`.

## Image

### `download()`

```ts
function download(): void
```

Enregistre l’image affichée dans un fichier : le résultat du dernier Appliquer, ou sinon l’image source. Elle fonctionne sans l’option [`download`](./options#download), qui ne fait qu’afficher un bouton. L’événement [`download`](./events#download) arrive avant et peut l’empêcher. Ne fait rien pendant la modification, car les changements ne sont pas encore appliqués.

### `reload()`

```ts
function reload(): void
```

Recharge le [`src`](./options#src) actuel, ce qui ramène l’original après un Appliquer.
