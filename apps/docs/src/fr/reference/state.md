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

| Champ         | Type                                         | Description                                                                                                                        |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | `ToolId \| null`                             | L’outil ouvert, comme `'crop'` ou `'adjust'`, ou `null`                                                                            |
| `adjustments` | `{ brightness, contrast }`                   | La luminosité et le contraste, chacun de -1 à 1. Nettoyer les laisse de côté. Tant qu’Ajuster est ouvert, les valeurs qu’il montre |
| `busy`        | `boolean`                                    | Si Appliquer est en cours                                                                                                          |
| `canApply`    | `boolean`                                    | S’il y a des changements à appliquer. Les rotations et retournements qui s’annulent ne comptent pas                                |
| `canRedo`     | `boolean`                                    | S’il y a un changement à rétablir                                                                                                  |
| `canUndo`     | `boolean`                                    | S’il y a un changement à annuler                                                                                                   |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | L’ajustement en vigueur, ou `null` dès que l’utilisateur a zoomé à la main                                                         |
| `image`       | `{ width, height } \| null`                  | La taille de l’image affichée en pixels, avec les changements faits, ou `null` sans image                                          |
| `mode`        | `'view' \| 'edit'`                           | Si l’utilisateur regarde ou modifie l’image                                                                                        |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | La rotation de l’image affichée, en degrés dans le sens des aiguilles d’une montre                                                 |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | S’il y a une image, et si elle s’est chargée                                                                                       |
| `threshold`   | `{ enabled, sensitivity }`                   | Si Nettoyer est activé, et sa sensibilité de 0 à 1. Tant que Nettoyer est ouvert, ce qu’il montre                                  |
| `zoom`        | `number`                                     | Pixels d’écran par pixel de l’image                                                                                                |
