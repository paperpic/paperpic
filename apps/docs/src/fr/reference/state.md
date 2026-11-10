---
title: État
description: Ce que renvoie getState() et ce que transporte l’événement change, comme le statut de l’image, le mode, le zoom, les changements et s’il y a quelque chose à appliquer.
---

# État

L’état décrit ce que la visionneuse montre à un moment donné. [`getState()`](./methods#getstate) le renvoie, et l’événement [`change`](./events#change) le transporte. Utilisez-le pour tenir vos propres commandes à jour, comme un bouton Appliquer :

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Champ         | Type                                         | Description                                                                                         |
| ------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | S’il y a une image, et si elle s’est chargée                                                        |
| `mode`        | `'view' \| 'edit'`                           | Si l’utilisateur regarde ou modifie l’image                                                         |
| `image`       | `{ width, height } \| null`                  | La taille de l’image affichée en pixels, avec les changements faits, ou `null` sans image           |
| `zoom`        | `number`                                     | Pixels d’écran par pixel de l’image                                                                 |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | L’ajustement en vigueur, ou `null` dès que l’utilisateur a zoomé à la main                          |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | La rotation de l’image affichée, en degrés dans le sens des aiguilles d’une montre                  |
| `canUndo`     | `boolean`                                    | S’il y a un changement à annuler                                                                    |
| `canRedo`     | `boolean`                                    | S’il y a un changement à rétablir                                                                   |
| `canApply`    | `boolean`                                    | S’il y a des changements à appliquer. Les rotations et retournements qui s’annulent ne comptent pas |
| `busy`        | `boolean`                                    | Si Appliquer est en cours                                                                           |
| `activeTool`  | `ToolId \| null`                             | L’outil ouvert, `'crop'` ou `'perspective'`, ou `null`                                              |
| `threshold`   | `{ enabled, sensitivity }`                   | Si Nettoyer est activé, et sa sensibilité de 0 à 1                                                  |
| `adjustments` | `{ brightness, contrast }`                   | La luminosité et le contraste, chacun de -1 à 1. Nettoyer les laisse de côté                        |
