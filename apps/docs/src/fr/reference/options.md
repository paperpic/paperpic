---
title: Options
description: Toutes les options de PaperPic, avec leur type, leur valeur par défaut et ce qu’elles changent, pour le constructeur, setOptions() et les props des composants Vue et React.
---

# Options

Les options définissent ce que la visionneuse affiche et ce que l’utilisateur peut en faire. Passez-les à la création de la visionneuse, ou changez-les plus tard avec [`setOptions()`](./methods#setoptions). Les composants Vue et React les reçoivent comme props, avec les mêmes noms.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Un ticket de caisse' })

pic.setOptions({ editable: false })
```

`setOptions()` ne change que les options que vous passez, et `undefined` remet une option à sa valeur par défaut. Elle n’émet jamais `change`.

## Image

### `src`

- **Type :** [`PaperPicSource`](./types#paperpicsource)
- **Valeur par défaut :** aucune

L’image à afficher : une URL de la même origine, ou un `File` ou un `Blob` joint côté client.

Passer la même valeur une nouvelle fois ne recharge pas l’image, donc le résultat d’une modification reste affiché. Appelez [`reload()`](./methods#reload) pour retrouver l’original. Une nouvelle valeur pendant la modification abandonne les changements.

### `alt`

- **Type :** `string`
- **Valeur par défaut :** `''`

Décrit l’image pour les lecteurs d’écran. Sans `alt`, les lecteurs d’écran ignorent l’image, comme une `<img>` dont l’`alt` est vide.

## Interface

### `editable`

- **Type :** `boolean`
- **Valeur par défaut :** `true`

Indique si l’utilisateur peut modifier l’image. Avec `false`, c’est une visionneuse en lecture seule, et sa barre d’outils ajoute des boutons pour faire pivoter l’image. Cette rotation ne change que l’affichage. Changer cette option pendant la modification abandonne les changements.

### `toolbar`

- **Type :** `boolean`
- **Valeur par défaut :** `true`

Indique s’il faut afficher la barre d’outils et la barre de modification intégrées. Sans elles, créez vos propres commandes avec les [méthodes](./methods).

### `tools`

- **Type :** [`readonly ToolId[]`](./types#toolid)
- **Valeur par défaut :** tous les outils

Les outils que propose la barre de modification. Ils gardent l’ordre de ce tableau, quel que soit l’ordre du tableau passé.

| Id              | Bouton                                      |
| --------------- | ------------------------------------------- |
| `'crop'`        | Recadrer                                    |
| `'perspective'` | Redresser                                   |
| `'rotate'`      | Pivoter à gauche                            |
| `'flip'`        | Retourner                                   |
| `'adjust'`      | Ajuster, pour la luminosité et le contraste |
| `'threshold'`   | Nettoyer                                    |

### `wheelZoom`

- **Type :** `boolean`
- **Valeur par défaut :** `true`

Indique si la molette zoome sur l’image. Désactivez-la quand la visionneuse se trouve dans une longue page, pour que la molette fasse défiler la page.

### `download`

- **Type :** `boolean`
- **Valeur par défaut :** `false`

Indique si la barre d’outils a un bouton qui enregistre l’image affichée : le résultat du dernier Appliquer, ou sinon l’image source. Le bouton est masqué pendant la modification. L’événement [`download`](./events#download) vous permet d’enregistrer le fichier autrement.

### `labels`

- **Type :** [`Partial<PaperPicLabels>`](./types#paperpiclabels)
- **Valeur par défaut :** les textes en anglais

Remplace n’importe quel texte que le composant affiche ou annonce. [Libellés](./labels) liste toutes les clés.

### `icons`

- **Type :** [`Partial<PaperPicIcons>`](./types#paperpicicons)
- **Valeur par défaut :** les icônes intégrées

Remplace n’importe quelle icône par votre propre balisage d’un seul élément, comme un `<svg>`. Le balisage entre dans la page en HTML, donc ne passez que du balisage de confiance. Une chaîne vide laisse sans icône les boutons de cette icône. [Styles](../guide/styling#icons) montre un exemple.

Chaque clé nomme une icône, et certaines icônes apparaissent sur deux boutons :

| Clé              | Bouton                                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| `adjust`         | Ajuster                                                                     |
| `apply`          | Appliquer, et Terminé dans chaque outil                                     |
| `brightness`     | Luminosité, dans le panneau d’Ajuster                                       |
| `cancel`         | Annuler, et Annuler cet outil                                               |
| `contrast`       | Contraste, dans le panneau d’Ajuster                                        |
| `crop`           | Recadrer                                                                    |
| `download`       | Télécharger                                                                 |
| `edit`           | Modifier                                                                    |
| `fitHeight`      | Ajuster à la hauteur                                                        |
| `fitWidth`       | Ajuster à la largeur                                                        |
| `flip`           | Retourner                                                                   |
| `perspective`    | Redresser                                                                   |
| `redo`           | Rétablir                                                                    |
| `rotateDocument` | Pivoter à gauche, dans la barre de modification                             |
| `rotateLeft`     | Pivoter à gauche, dans la barre d’outils d’une visionneuse en lecture seule |
| `rotateRight`    | Pivoter à droite, dans la barre d’outils d’une visionneuse en lecture seule |
| `threshold`      | Nettoyer                                                                    |
| `undo`           | Annuler la dernière action                                                  |
| `zoomIn`         | Zoom avant                                                                  |
| `zoomOut`        | Zoom arrière                                                                |

## Résultat

### `output`

- **Type :** [`PaperPicOutput`](./types#paperpicoutput)
- **Valeur par défaut :** le format de l’image source

Le format de l’image modifiée. `type` vaut `'image/jpeg'`, `'image/png'` ou `'image/webp'`, et `quality` va de 0 à 1 pour JPEG et WebP, avec `0.92` par défaut.

Sans `type`, une image nettoyée est en PNG, car le JPEG abîmerait ses bords nets, et toute autre image garde le format de la source. Un format que le navigateur ne sait pas encoder donne du PNG.

### `maxOutputSize`

- **Type :** `number`
- **Valeur par défaut :** la pleine résolution

Le plus grand côté de l’image modifiée, en pixels. Un résultat plus grand est réduit.

### `filename`

- **Type :** `string`
- **Valeur par défaut :** le nom de l’image source

Le nom du fichier enregistré. Son extension suit le format de l’image, donc un `receipt.jpg` nettoyé s’enregistre en `receipt.png`. Quand la source n’a pas de nom, comme un `Blob`, le fichier s’appelle `image`.

## Outils

### `aspectRatio`

- **Type :** `number`
- **Valeur par défaut :** estimées

Les proportions réelles du document, en largeur divisée par hauteur, comme `210 / 297` pour une feuille A4. Redresser donne ces proportions à son résultat. Sans elles, il les estime à partir de la photo.

### `softness`

- **Type :** `number`, de 0 à 1
- **Valeur par défaut :** `0.25`

La quantité de gris que Nettoyer garde au bord des lettres, ce qui les rend plus faciles à lire. Utilisez `0` pour un noir et blanc strict, qui donne des fichiers plus petits mais casse les traits fins.
