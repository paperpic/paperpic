---
title: Nettoyer
description: Comment l’outil Nettoyer de PaperPic transforme la photo d’un document en noir et blanc net sans ombres, et comment la sensibilité et la douceur changent le résultat, avec une démo en direct.
---

# Nettoyer

Le texte sur papier se lit mieux en noir et blanc, mais une photo a des ombres, une lumière inégale et un papier gris. Nettoyer compare chaque pixel à ses voisins pour décider s’il est encre ou papier, donc les ombres et la lumière inégale disparaissent et le texte reste net. Son id dans l’API est `threshold`.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['perspective', 'threshold']" />

Redressez d’abord le ticket, puis nettoyez-le.

## Utilisation

1. Appuyez sur Modifier, puis sur Nettoyer. Son panneau prend la place des outils, l’aperçu passe en noir et blanc, et une règle Sensibilité apparaît.
2. Faites glisser la règle. Une sensibilité plus haute fonce plus de pixels, ce qui récupère le texte pâle ou usé. Une sensibilité plus basse donne une page plus propre, sans ce qui transparaît du verso.
3. Appuyez sur Terminé pour le garder comme un seul changement, ou sur Annuler cet outil pour laisser l’image telle qu’elle était.

Pour désactiver un Nettoyer qui est déjà un changement, rouvrez-le : un interrupteur à côté de la règle le désactive, et les changements qui ont suivi restent. Annuler la dernière action retirerait d’abord ces changements.

Nettoyer s’applique toujours après les autres changements. Recadrer montre l’image nettoyée, telle qu’elle sera. Redresser la montre sans Nettoyer, car les bords du papier sont difficiles à trouver sur une page nettoyée.

## Douceur

[`softness`](../../reference/options#softness) règle la quantité de gris que Nettoyer garde au bord des lettres, de 0 à 1, avec 0.25 par défaut. Un peu de gris adoucit les bords et rend les petits caractères plus lisibles. Utilisez `0` pour un noir et blanc strict, qui donne des fichiers plus petits mais casse les traits fins.

## Format du résultat

Une image nettoyée est en PNG, car le JPEG ajouterait des artefacts autour de ses bords nets. L’option [`output`](../../reference/options#output) peut choisir un autre format.

## Depuis le code

[`setThreshold()`](../../reference/methods#setthreshold) active ou désactive Nettoyer et règle sa sensibilité, de 0 à 1, avec 0.5 par défaut. [`getState()`](../../reference/methods#getstate) renvoie les deux dans `threshold` :

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```

Tant que Nettoyer est ouvert, `setThreshold()` change ce que montre son panneau, et [`confirmTool()`](../../reference/methods#confirmtool) le garde comme un seul changement.
