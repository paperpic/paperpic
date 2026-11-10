---
title: Recadrer
description: Comment l’outil Recadrer de PaperPic garde la partie de la photo qui contient le document, avec des poignées d’angle, une loupe sur les écrans tactiles et le clavier.
---

# Recadrer

La photo d’un document montre souvent la table, une main ou d’autres papiers autour. Recadrer garde le rectangle qui contient le document et écarte le reste.

## Utilisation

1. Appuyez sur Modifier, puis sur Recadrer. Un rectangle apparaît dans l’image, avec une poignée à chaque coin.
2. Faites glisser les coins jusqu’à ce que le rectangle encadre le document. Les boutons de zoom restent disponibles pour placer les coins avec précision.
3. Appuyez sur Terminé, ou `Entrée`, pour ajouter le recadrage aux changements. Annuler cet outil, ou `Échap`, ferme Recadrer sans rien changer.

Le recadrage est un changement comme un autre : Annuler la dernière action le retire, et Appliquer le rend définitif.

## Poignées d’angle

- Les poignées restent dans l’image, et le rectangle ne se retourne jamais.
- Sur un écran tactile, une loupe montre la zone sous le doigt pendant qu’il fait glisser un coin, pour que le doigt ne cache pas où il se pose.
- Au clavier, Tab passe d’une poignée à l’autre, et les flèches déplacent la poignée qui a le focus de 1 pixel d’écran, ou de 10 avec Maj. Les lecteurs d’écran annoncent chaque déplacement.

## Recadrer ou Redresser ?

Recadrer garde un rectangle tel quel. Sur une photo prise de biais, le document ressemble à un trapèze, et aucun rectangle ne lui correspond. Utilisez alors [Redresser](./straighten) : il déplace chaque coin séparément et met la page à plat.

## Depuis le code

Recadrer est dans la barre de modification par défaut, avec l’id `'crop'` dans [`tools`](../../reference/options#tools). Avec `toolbar: false`, ouvrez-le avec [`openTool()`](../../reference/methods#opentool) et fermez-le avec [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool) :

```ts
pic.edit()
pic.openTool('crop')

// Plus tard, depuis un de vos boutons
pic.confirmTool()
```
