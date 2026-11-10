---
title: Ajuster
description: Comment l’outil Ajuster de PaperPic change la luminosité et le contraste de l’image d’un document avec deux curseurs en direct, et comment les régler depuis le code.
---

# Ajuster

Les photos prises avec peu de lumière sortent sombres ou grises. Ajuster change la luminosité et le contraste et garde les couleurs, pour les documents qui ne doivent pas passer en noir et blanc, comme des formulaires en couleur ou des photos.

## Utilisation

1. Appuyez sur Modifier, puis sur Ajuster. Deux curseurs apparaissent dans la barre de modification : Luminosité et Contraste.
2. Faites glisser un curseur. L’aperçu change pendant le glissement, et relâcher le curseur laisse un changement, qu’Annuler la dernière action retire.
3. Appuyez de nouveau sur Ajuster pour masquer les curseurs.

Le milieu de chaque curseur laisse l’image telle quelle, et un curseur ramené au milieu ne compte pas comme un changement. Les lecteurs d’écran annoncent la valeur de -100 à 100, comme « Luminosité +30 ».

Ajuster s’applique après les autres changements, donc Recadrer et Redresser montrent l’image avec lui.

## Ajuster ou Nettoyer ?

| Ajuster                                            | [Nettoyer](./clean-up)                  |
| -------------------------------------------------- | --------------------------------------- |
| Garde les couleurs et les gris                     | Transforme le document en noir et blanc |
| Pour les formulaires en couleur, tampons et photos | Pour le texte sur papier                |
| Garde le format de l’image source                  | Donne du PNG                            |

Tant que Nettoyer est activé, Ajuster est désactivé, car un document nettoyé a ses propres tons.

## Depuis le code

[`setAdjustments()`](../../reference/methods#setadjustments) prend des valeurs de -1 à 1, où 0 ne change rien, et [`getState()`](../../reference/methods#getstate) les renvoie dans `adjustments` :

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

Dans l’option [`tools`](../../reference/options#tools), Ajuster est `'adjust'`.
