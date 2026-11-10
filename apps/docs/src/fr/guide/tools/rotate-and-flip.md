---
title: Pivoter et retourner
description: Comment faire pivoter et retourner l’image d’un document dans PaperPic, en mode d’édition, dans une visionneuse en lecture seule et depuis le code.
---

# Pivoter et retourner

Les téléphones enregistrent souvent la photo d’un document de côté ou à l’envers, et certains scans sortent en miroir. Pivoter à gauche et Retourner corrigent l’orientation et laissent le reste de l’image tel quel.

## Pivoter

Dans la barre de modification, Pivoter à gauche fait pivoter l’image d’un quart de tour dans le sens inverse des aiguilles d’une montre, comme dans les galeries de photos. Appuyez deux fois pour un demi-tour, ou trois fois pour un quart de tour dans le sens des aiguilles d’une montre.

Une rotation est un changement : Annuler la dernière action la retire, et Appliquer la rend définitive. Quatre rotations ramènent l’image à sa position, et il n’y a alors rien à appliquer.

Depuis le code, [`rotate()`](../../reference/methods#rotate) fait pivoter dans le sens des aiguilles d’une montre avec `1`, et dans le sens inverse avec `-1` :

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Retourner

Retourner met l’image en miroir de gauche à droite, telle qu’elle est affichée, donc après un quart de tour elle reste en miroir de gauche à droite à l’écran. Pour mettre une image à l’envers, retournez-la et faites-la pivoter deux fois.

Les retournements et rotations qui s’annulent ne laissent rien à appliquer. Depuis le code, appelez [`flip()`](../../reference/methods#flip).

## Dans une visionneuse en lecture seule

Avec [`editable: false`](../viewer#read-only), la barre d’outils a les boutons Pivoter à gauche et Pivoter à droite. Ils ne font pivoter que l’image affichée : rien n’est enregistré, et l’événement `apply` n’est jamais émis. [`rotate()`](../../reference/methods#rotate) fait de même depuis le code. Une visionneuse en lecture seule n’a pas Retourner.

## Ids

Dans l’option [`tools`](../../reference/options#tools), Pivoter à gauche est `'rotate'` et Retourner est `'flip'`.
