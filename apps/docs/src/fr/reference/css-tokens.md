---
title: Jetons CSS
description: Les propriétés personnalisées CSS qui définissent le thème de PaperPic, avec leurs valeurs claires et sombres, ainsi que sa feuille de style, sa couche de cascade, ses classes publiques et les noms de ses contrôles.
---

# Jetons CSS

Les jetons sont des propriétés personnalisées CSS qui changent l’apparence du composant sans écraser ses règles. Définissez-les sur `:root`, sur un ancêtre de la visionneuse ou sur `.paperpic` :

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Jeton                            | Clair     | Sombre    | Description                          |
| -------------------------------- | --------- | --------- | ------------------------------------ |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Couleur d’accent de l’interface      |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Fond de l’interface                  |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Texte de l’interface                 |
| `--paperpic-radius`              | `6px`     | `6px`     | Rayon des coins de l’interface       |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Durée des transitions de l’interface |

## Mode sombre

Les jetons de couleur prennent leur valeur claire ou sombre avec `light-dark()`, selon le `color-scheme` de la page. Sans `color-scheme`, ils sont clairs. Avec `color-scheme: dark`, ils sont sombres, et avec `color-scheme: light dark`, ils sont sombres quand le système préfère un thème sombre. [Styles](../guide/styling#dark-mode) montre comment le définir.

Pour choisir les deux valeurs d’un jeton, utilisez aussi `light-dark()` :

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

## Feuille de style

Chaque paquet fournit une feuille de style. Importez-la une fois dans votre application :

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

Ses règles se trouvent dans la couche de cascade `paperpic`, donc tout CSS à vous hors d’une couche les écrase, quelle que soit sa spécificité. Cela inclut les réinitialisations globales, comme une règle sur `button`. Avec Tailwind CSS, nommez l’ordre des couches, comme le montre [Styles](../guide/styling#tailwind).

## Classes {#classes}

Ces classes sont publiques : leurs noms, et les éléments qu’elles marquent, restent stables d’une version à l’autre. Les autres classes du composant tiennent sa disposition et peuvent changer dans n’importe quelle version.

| Classe                    | Élément                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `paperpic`                | La racine de la visionneuse                                                                                                                      |
| `paperpic-button`         | Chaque bouton de la barre d’outils et de la barre de modification                                                                                |
| `paperpic-button-danger`  | Abandonner, dans la question avant d’abandonner les modifications                                                                                |
| `paperpic-button-primary` | Appliquer, et Terminé dans Recadrer et Redresser                                                                                                 |
| `paperpic-button-text`    | Les boutons de la question avant d’abandonner les modifications                                                                                  |
| `paperpic-edit-bar`       | La barre de modification, en bas                                                                                                                 |
| `paperpic-editing`        | La racine, pendant la modification                                                                                                               |
| `paperpic-handle`         | Une poignée d’angle de Recadrer et Redresser                                                                                                     |
| `paperpic-host`           | L’élément que les composants Vue et React créent autour de la visionneuse                                                                        |
| `paperpic-icon`           | L’icône d’un bouton                                                                                                                              |
| `paperpic-status`         | Le message pour les lecteurs d’écran, qui s’affiche aussi pendant le chargement de l’image ou l’application des modifications, et en cas d’échec |
| `paperpic-status-visible` | Le message, quand il s’affiche au centre de la visionneuse                                                                                       |
| `paperpic-toolbar`        | La barre d’outils, à droite                                                                                                                      |
| `paperpic-viewport`       | La zone qui affiche l’image et reçoit le focus du clavier                                                                                        |

Les boutons montrent leur état avec des attributs ARIA, que vous pouvez aussi sélectionner :

| Attribut                 | État                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | Le bouton ne peut pas agir pour l’instant. Il garde le focus du clavier, donc il n’est pas `disabled`    |
| `[aria-expanded='true']` | Ajuster, pendant que ses curseurs s’affichent                                                            |
| `[aria-pressed='true']`  | Un bouton activé, comme Nettoyer, ou Ajuster à la largeur et Ajuster à la hauteur quand ils s’appliquent |

Le survol et ces états se peignent avec `box-shadow`, que les réinitialisations globales des boutons laissent intact. Pour les modifier, écrasez aussi `box-shadow`.

## Contrôles {#controls}

Chaque bouton, curseur et poignée d’angle porte `data-paperpic-control`, avec la clé de son [libellé](./labels). Sélectionnez-le pour styler un seul contrôle :

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Emplacement                 | Valeurs                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Barre d’outils              | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| Barre de modification       | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| Curseurs                    | `thresholdSensitivity`, `brightness`, `contrast`                                                      |
| Recadrer et Redresser       | `cancelTool`, `confirm`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`   |
| Question avant d’abandonner | `keepEditing`, `discard`                                                                              |

`rotateLeft` nomme deux boutons qui ne s’affichent jamais en même temps : celui d’une visionneuse en lecture seule, qui fait pivoter l’affichage, et celui de la barre de modification, qui fait pivoter l’image.
