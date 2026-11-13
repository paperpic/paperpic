---
title: Ajuster
description: Comment l’outil Ajuster de PaperPic change la luminosité et le contraste de l’image d’un document avec une règle en direct, et comment les régler depuis le code.
---

# Ajuster

Les photos prises avec peu de lumière sortent sombres ou grises. Ajuster change la luminosité et le contraste et garde les couleurs, pour les documents qui ne doivent pas passer en noir et blanc, comme des formulaires en couleur ou des photos.

## Utilisation

1. Appuyez sur Modifier, puis sur Ajuster. Son panneau prend la place des outils : une règle, avec Luminosité et Contraste pour choisir le ton qu’elle change.
2. Faites glisser la règle. L’aperçu change pendant le glissement. Choisissez Contraste pour changer l’autre ton avec la même règle.
3. Appuyez sur Terminé pour garder les deux tons comme un seul changement, qu’Annuler la dernière action retire. Annuler cet outil laisse l’image telle qu’elle était.

Le milieu de la règle laisse l’image telle quelle, et l’aiguille s’y arrête, donc il est facile de revenir à aucun changement. Les lecteurs d’écran annoncent la valeur de -100 à 100, comme « Luminosité +30 ». Un point sur Ajuster marque des valeurs différentes de 0.

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

Tant qu’Ajuster est ouvert, `setAdjustments()` change ce que montre son panneau, et [`confirmTool()`](../../reference/methods#confirmtool) le garde comme un seul changement.

Dans l’option [`tools`](../../reference/options#tools), Ajuster est `'adjust'`.
