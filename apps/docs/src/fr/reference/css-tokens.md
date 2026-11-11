---
title: Jetons CSS
description: Les propriétés personnalisées CSS qui habillent PaperPic, avec leurs valeurs claires et sombres, ainsi que sa feuille de style, sa couche de cascade et ses noms de classe.
---

# Jetons CSS

Les jetons sont des propriétés personnalisées CSS qui changent l’apparence du composant sans écraser ses règles. Définissez-les sur `:root`, sur un ancêtre de la visionneuse ou sur `.paperpic` :

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Jeton                            | Par défaut | En sombre | Description                          |
| -------------------------------- | ---------- | --------- | ------------------------------------ |
| `--paperpic-color-accent`        | `#0a84ff`  | `#5cb5ff` | Couleur d’accent de l’interface      |
| `--paperpic-color-surface`       | `#fff`     | `#151e2e` | Fond de l’interface                  |
| `--paperpic-color-text`          | `#1a263c`  | `#f2f5f9` | Texte de l’interface                 |
| `--paperpic-radius`              | `6px`      | `6px`     | Rayon des coins de l’interface       |
| `--paperpic-transition-duration` | `0.2s`     | `0.2s`    | Durée des transitions de l’interface |

## Mode sombre

Les valeurs sombres s’appliquent quand le système de l’utilisateur préfère un thème sombre. Si votre site change de thème autrement, par exemple avec une classe sur `<html>`, définissez vous-même les couleurs de chaque thème :

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

Ses règles se trouvent dans la couche de cascade `paperpic`, donc tout CSS à vous hors d’une couche les écrase, quelle que soit sa spécificité. Cela inclut les réinitialisations globales, comme une règle sur `button`.

## Noms de classe

`.paperpic` est la racine de la visionneuse, et `.paperpic-host` est l’élément que les composants Vue et React créent autour d’elle. Toutes les classes du composant commencent par `paperpic`, et leurs noms sont stables. Préférez les jetons quand ils couvrent votre besoin.
