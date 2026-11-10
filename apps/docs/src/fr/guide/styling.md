---
title: Styles
description: Comment intégrer PaperPic à l’apparence de votre application, avec sa feuille de style, ses jetons CSS, le mode sombre et une couche de cascade qui laisse gagner votre CSS.
---

# Styles

PaperPic doit avoir l’air de faire partie de votre application. Il fournit une seule feuille de style, prend ses couleurs et ses coins dans quelques jetons CSS, et range ses règles dans une couche de cascade, donc votre propre CSS gagne toujours.

## Importer la feuille de style

Importez-la une fois dans votre application :

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

## Lui donner une taille

La visionneuse remplit son conteneur et n’a pas de hauteur propre, donc le conteneur en a besoin d’une. Tout CSS qui lui donne une hauteur convient :

```css
.document-viewer {
  height: 70dvh;
}
```

La visionneuse suit la taille de son conteneur, pas celle de l’écran. Elle réagit quand le conteneur change, par exemple à l’ouverture d’un panneau latéral.

## Couleurs et coins

Cinq [jetons CSS](../reference/css-tokens) règlent le fond, le texte, la couleur d’accent, le rayon des coins et la durée des transitions. Définissez-les sur `:root`, sur un ancêtre de la visionneuse ou sur `.paperpic` :

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

## Mode sombre {#dark-mode}

Les couleurs passent aux couleurs sombres quand le système de l’utilisateur préfère un thème sombre. Si votre site change de thème autrement, par exemple avec une classe sur `<html>`, définissez vous-même les couleurs de chaque thème :

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

## Votre CSS gagne

Les règles de PaperPic se trouvent dans la couche de cascade `paperpic`, et tout CSS hors d’une couche les écrase, quelle que soit sa spécificité. Cela facilite la personnalisation, mais une réinitialisation globale hors d’une couche, comme une règle sur `button`, atteint aussi les boutons de la visionneuse.

Si votre réinitialisation casse la visionneuse, placez-la dans une couche qui vient avant `paperpic`. La première déclaration qui nomme les couches fixe leur ordre, donc mettez-la dans un CSS chargé avant la feuille de style de PaperPic :

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Disposition

L’interface s’adapte seule à son conteneur :

- La barre d’outils se trouve à droite et défile quand la visionneuse est trop basse pour ses boutons.
- La barre de modification se trouve en bas, sur une ligne, ou sur deux dans une visionneuse de moins de 28rem de large.
- Sur les écrans tactiles, les boutons et les poignées d’angle mesurent au moins 44 pixels.

## Noms de classe

Toutes les classes du composant commencent par `paperpic`, et leurs noms sont stables, donc vous pouvez les cibler. Préférez les jetons quand ils couvrent votre besoin, car ils continuent de fonctionner si la structure interne change.
