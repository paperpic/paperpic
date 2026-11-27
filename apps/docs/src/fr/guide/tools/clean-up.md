---
title: Nettoyer
description: Comment l’outil Nettoyer de PaperPic passe la photo d’un document en gris, ou en noir et blanc net sans ombres, et comment la sensibilité et la douceur changent le résultat, avec une démo en direct.
---

# Nettoyer

Nettoyer choisit la finition de l’image : les tons d’origine, le gris, ou le noir et blanc. Son id dans l’API est `finish`.

Le texte sur papier se lit mieux en noir et blanc, mais une photo a des ombres, une lumière inégale et un papier gris. Le noir et blanc compare chaque pixel à son entourage pour décider s’il est encre ou papier, donc les ombres et la lumière inégale disparaissent et le texte reste net. Le gris garde tous les tons et retire seulement la couleur, pour les documents avec des photos ou des tampons que le noir et blanc perdrait.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['perspective', 'finish']" />

Redressez d’abord le ticket, puis nettoyez-le.

## Utilisation

1. Appuyez sur Modifier, puis sur Nettoyer. Son panneau prend la place des outils, avec trois finitions : Original, Gris et Noir et blanc. Il s’ouvre en noir et blanc, donc l’aperçu passe en noir et blanc et la règle Sensibilité fonctionne.
2. Faites glisser la règle. Une sensibilité plus élevée assombrit plus de pixels, ce qui récupère un texte pâle ou usé. Une sensibilité plus basse donne une page plus propre, sans l’impression qui transparaît du verso.
3. Choisissez plutôt Gris pour une image en gris, ou Original pour les tons de la photo. La règle ne fonctionne qu’en noir et blanc.
4. Appuyez sur Terminé pour le garder comme un seul changement, ou sur Annuler cet outil pour laisser l’image comme elle était.

Si Nettoyer fait déjà partie des changements, il se rouvre avec sa finition. Pour le désactiver, choisissez Original : les changements faits après restent. Avec Annuler la dernière action, en revanche, vous retireriez aussi ces changements.

Nettoyer s’applique toujours après les autres changements. Recadrer montre l’image avec sa finition, telle qu’elle sera. Redresser la montre sans le noir et blanc, car les bords du papier sont difficiles à trouver sur une page nettoyée, et garde le gris.

[Ajuster](./adjust) fonctionne avec le gris, qui vient après, et est désactivé en noir et blanc, qui a ses propres tons.

## Douceur

[`softness`](../../reference/options#softness) règle combien de gris le noir et blanc garde aux bords des lettres, de 0 à 1, avec 0.25 par défaut. Un peu de gris adoucit les bords et rend les petits textes plus lisibles. Utilisez `0` pour un noir et blanc strict, qui donne des fichiers plus petits mais casse les traits fins.

## Format du résultat

Une image en noir et blanc est en PNG, car le JPEG ajouterait des artefacts autour de ses bords nets. Une image en gris garde le format de la source. L’option [`output`](../../reference/options#output) peut choisir un autre format.

## Depuis le code

[`setFinish()`](../../reference/methods#setfinish) choisit la finition, `'original'`, `'gray'` ou `'mono'` pour le noir et blanc, et règle la sensibilité du noir et blanc, de 0 à 1, avec 0.5 par défaut. [`getState()`](../../reference/methods#getstate) renvoie les deux dans `finish` :

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

Tant que Nettoyer est ouvert, `setFinish()` change ce que montre son panneau, et [`confirmTool()`](../../reference/methods#confirmtool) le garde comme un seul changement.
