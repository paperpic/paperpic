---
title: Styles
description: Comment intégrer PaperPic à l’apparence de votre application, avec sa feuille de style, ses jetons CSS, le mode sombre, vos propres icônes et une couche de cascade qui laisse gagner votre CSS.
---

# Styles

PaperPic doit avoir l’air de faire partie de votre application. Il fournit une seule feuille de style, prend ses couleurs et ses coins dans quelques jetons CSS, suit le schéma de couleurs de votre page et range ses règles dans une couche de cascade, donc votre propre CSS gagne toujours.

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

Les jetons s’héritent, donc une classe sur le conteneur d’une visionneuse, ou sur le composant Vue ou React, ne change que cette visionneuse :

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Utiliser les couleurs de votre design system {#design-system}

Si votre application garde ses couleurs dans des variables CSS, faites pointer les jetons vers elles au lieu de copier leurs valeurs. La visionneuse suit alors votre thème, mode sombre compris :

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Définissez-les sur `.paperpic`, comme ici. Un jeton qui utilise `var()` lit la variable sur l’élément où vous le définissez, donc sur `:root` il ne verrait pas un thème que vous changez sur une partie de la page.

Tout design system avec des variables CSS convient, comme les variables du thème de Tailwind CSS 4 : `var(--color-blue-600)` ou `var(--radius-md)`.

## Mode sombre {#dark-mode}

Les couleurs suivent le `color-scheme` de votre page, comme les contrôles de formulaire du navigateur :

- Avec `color-scheme: light dark`, elles passent au sombre quand le système de l’utilisateur préfère un thème sombre.
- Avec `color-scheme: dark`, elles sont toujours sombres. Cela marche aussi sur une partie de la page.
- Sans `color-scheme`, elles restent claires, donc une page sans thème sombre garde une visionneuse claire.

Si votre site suit le système, déclarez-le une fois :

```css
:root {
  color-scheme: light dark;
}
```

Si votre site change de thème avec une classe, par exemple sur `<html>`, définissez `color-scheme` avec cette classe. Les barres de défilement et les contrôles de formulaire du navigateur le suivent aussi :

```css
:root.dark {
  color-scheme: dark;
}
```

Pour choisir vos propres couleurs sombres, donnez à un jeton ses deux valeurs avec `light-dark()` :

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Les jetons qui pointent vers les variables de votre [design system](#design-system) suivent plutôt votre thème.

## Icônes {#icons}

L’option [`icons`](../reference/options#icons) remplace n’importe quelle icône par votre propre balisage, en général un `<svg>` du jeu d’icônes de votre application :

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- Chaque clé nomme une icône, et certaines icônes apparaissent sur deux boutons : `apply` est aussi sur Terminé, et `cancel` ferme aussi un outil. [Options](../reference/options#icons) liste toutes les clés.
- PaperPic donne à l’icône la classe `paperpic-icon`, qui fixe sa taille, et la cache aux lecteurs d’écran, car le bouton a déjà un nom.
- Dessinez l’icône avec `currentColor`, pour qu’elle prenne la couleur du bouton dans chaque thème.
- Le balisage entre dans la page en HTML, donc ne passez que du balisage de confiance.
- Avec Vite, `import zoomIn from './zoom-in.svg?raw'` vous donne le balisage d’un fichier `.svg`.

Pour changer toutes les icônes à la fois, comme leur taille ou l’épaisseur de leurs traits, stylez la classe :

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
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

## Tailwind CSS {#tailwind}

Tailwind CSS 4 range aussi ses règles dans des couches de cascade. Nommez toutes les couches, dans l’ordre, avant d’importer Tailwind et PaperPic, pour que la réinitialisation de Tailwind vienne avant `paperpic` et ses utilitaires après :

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

Importez ici la feuille de style de PaperPic, dans votre CSS, et non depuis JavaScript. Dans un autre ordre, la réinitialisation de Tailwind retire marges intérieures et bordures à la visionneuse, ou la visionneuse écrase des utilitaires comme `h-96` sur le composant.

## Noms de classe {#class-names}

La [référence CSS](../reference/css-tokens#classes) liste les classes que vous pouvez cibler, comme `paperpic-toolbar` et `paperpic-button`, et leurs noms sont stables. Les autres classes tiennent la disposition et peuvent changer dans n’importe quelle version. Préférez les jetons quand ils couvrent votre besoin.

Chaque bouton, règle et poignée d’angle porte aussi `data-paperpic-control`, avec la clé de son [libellé](../reference/labels). Sélectionnez-le pour styler un seul contrôle :

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Disposition

L’interface s’adapte seule à son conteneur :

- La barre d’outils se trouve à droite et défile quand la visionneuse est trop basse pour ses boutons. Elle se masque pendant la modification.
- La barre de modification est une carte en bas avec deux lignes de hauteur fixe, ou une ligne dans une visionneuse d’au moins 28rem de large, donc l’image garde sa place quand un outil s’ouvre.
- Sur les écrans tactiles, les boutons et les poignées d’angle mesurent au moins 44 pixels.

## Vos propres contrôles

Quand les styles ne suffisent pas, masquez la barre d’outils et la barre de modification avec `toolbar: false`, et pilotez la visionneuse avec vos propres contrôles. [Barre d’outils personnalisée](../examples/custom-toolbar) montre comment.
