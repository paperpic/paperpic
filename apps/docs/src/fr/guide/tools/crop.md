---
title: Recadrer
description: Comment l’outil Recadrer de PaperPic garde la partie de la photo qui contient le document, avec des poignées d’angle, une loupe sur les écrans tactiles et le clavier.
---

# Recadrer

La photo d’un document montre souvent la table, une main ou d’autres papiers autour. Recadrer garde le rectangle qui contient le document et écarte le reste.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['crop']" />

## Utilisation

1. Appuyez sur Modifier, puis sur Recadrer. Un rectangle apparaît dans l’image, avec une poignée à chaque coin.
2. Faites glisser les coins jusqu’à ce que le rectangle encadre le document. Le panneau de Recadrer a des boutons de zoom pour placer les coins avec précision.
3. Appuyez sur Terminé, ou `Entrée`, pour ajouter le recadrage aux changements. Annuler cet outil, ou `Échap`, ferme Recadrer sans rien changer.

Tant que Recadrer est ouvert, l’image apparaît telle que sera le résultat, Ajuster et Nettoyer compris. Le recadrage est un changement comme un autre : il se retire avec Annuler la dernière action et devient définitif quand vous appuyez sur Appliquer.

## Poignées d’angle

- Les poignées restent dans l’image, et le rectangle ne se retourne jamais.
- Avec le doigt ou un stylet, une loupe montre la zone dessous pendant le glissement d’un coin, pour ne pas cacher où il se pose.
- Sans faire glisser, appuyez sur une poignée, puis touchez l’endroit où va son coin. La poignée reste mise en évidence jusque-là, les boutons de zoom zooment vers son coin, et `Échap` la relâche.
- Au clavier, Tab passe d’une poignée à l’autre, et les flèches déplacent la poignée qui a le focus de 1 pixel d’écran, ou de 10 avec Maj. `+` et `-` zooment vers la poignée qui a le focus. Les lecteurs d’écran annoncent chaque déplacement.

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
