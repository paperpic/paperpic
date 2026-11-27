---
title: Visionneuse
description: Comment on zoome, déplace et adapte l’image d’un document dans PaperPic, ce que propose la barre d’outils, et comment afficher une image en lecture seule, avec une démo en direct.
---

# Visionneuse

Les petits caractères et les longs tickets de caisse sont difficiles à lire d’un coup d’œil à l’écran. La visionneuse adapte l’image à son chargement et permet de zoomer sur n’importe quelle partie.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :editable="false" />

## Zoomer et déplacer

| Action                                  | Souris et pavé tactile                    | Tactile        | Clavier    |
| --------------------------------------- | ----------------------------------------- | -------------- | ---------- |
| Zoomer                                  | Molette, ou pincement sur un pavé tactile | Pincement      | `+` et `-` |
| Déplacer                                | Glisser                                   | Glisser        | Flèches    |
| Basculer entre l’image adaptée et 100 % | Double-clic                               | Double toucher |            |
| Adapter l’image entière                 |                                           |                | `0`        |

Les touches fonctionnent tant que le focus est dans la visionneuse. Sur un bouton, les flèches passent plutôt d’un bouton à l’autre, et tant qu’il n’y a rien à déplacer, elles font défiler la page. Un pincement zoome autour du point entre les doigts. Sur un écran tactile, un doigt fait défiler la page tant que l’image est adaptée, et déplace l’image une fois zoomée.

Le zoom va de celui qui adapte l’image entière, ou 100 % pour une petite image, jusqu’à 800 %. Une image qui tient reste centrée, et une image qui dépasse se déplace jusqu’à ses bords.

Au chargement, l’image est adaptée entière à la visionneuse, et elle reste adaptée quand la visionneuse change de taille, jusqu’à ce que l’utilisateur zoome à la main.

Dans une longue page, la molette zoomerait sur l’image au lieu de faire défiler la page. Utilisez-y `wheelZoom: false` : les boutons, le clavier et un pincement sur un écran tactile zooment toujours. Un pincement sur un trackpad ne zoome plus sur l’image, car le navigateur le traite comme la molette.

## La barre d’outils

La barre d’outils se trouve à droite de la visionneuse, et défile quand la visionneuse est trop basse pour ses boutons. Elle se masque pendant la modification, donc elle ne cache jamais un coin de Recadrer ou de Redresser.

| Bouton                                     | Ce qu’il fait                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Modifier                                   | Ouvre le [mode d’édition](./editing). Apparaît quand l’image est prête, et jamais avec `editable: false` |
| Zoom avant, Zoom arrière                   | Zooment d’un cran de 25 %, autour du centre                                                              |
| Ajuster à la largeur, Ajuster à la hauteur | Adaptent l’image à la largeur, pratique pour les longs documents, ou à la hauteur                        |
| Pivoter à gauche, Pivoter à droite         | Seulement dans une visionneuse en lecture seule : font pivoter l’image affichée                          |
| Télécharger                                | Seulement avec `download: true` : enregistre l’image affichée                                            |

Ajuster à la largeur et Ajuster à la hauteur restent enfoncés tant que leur adaptation tient. Aucun bouton ne réadapte l’image entière : appuyez sur `0`, ou dézoomez au maximum.

Avec `toolbar: false`, la barre d’outils et la barre de modification sont masquées, et vous pouvez créer vos propres commandes avec les [méthodes](../reference/methods).

## Visionneuse en lecture seule {#read-only}

Avec `editable: false`, le bouton Modifier disparaît, et la barre d’outils gagne deux boutons qui font pivoter l’image. Cette rotation ne change que l’affichage, et rien n’est enregistré : le bouton Télécharger enregistre l’image sans elle. Utilisez-la pour des documents à lire mais pas à modifier, comme les pièces jointes d’un dossier.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'Un ticket de caisse',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Un ticket de caisse" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Un ticket de caisse" editable={false} />
```

:::

## Piloter l’affichage depuis le code

Les méthodes [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) et [`fit()`](../reference/methods#fit) font ce que font les boutons, et [`getState()`](../reference/methods#getstate) vous donne le zoom et l’adaptation en vigueur :

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
