---
title: Événements
description: Les événements de PaperPic (load, error, change, apply et download), ce que chacun envoie, et la façon de les écouter en JavaScript, Vue et React.
---

# Événements

Les événements informent votre code de ce qui se passe dans la visionneuse. Écoutez-les avec [`on()`](./methods#on). En Vue, ce sont des événements du composant, comme `@apply`, et en React, ce sont des props, comme `onApply`. Si une fonction à l’écoute lève une erreur, la visionneuse continue : la page reçoit l’erreur comme toute erreur non interceptée, et les autres fonctions s’exécutent quand même.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Données :** [`Size`](./types#size)

L’image est chargée et affichée. `width` et `height` sont sa taille en pixels. Il est émis à chaque chargement d’un `src`, y compris avec [`reload()`](./methods#reload), mais pas après Appliquer, dont le résultat arrive avec [`apply`](#apply).

## `error`

- **Données :** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Quelque chose a échoué, et `phase` dit quoi :

- `'load'` : l’image n’a pas pu être chargée.
- `'preview'` : une modification n’a pas pu être affichée, par exemple parce que l’image est trop grande pour le navigateur. La modification reste ouverte.
- `'apply'` : les changements n’ont pas pu être appliqués. La modification reste ouverte.

## `change`

- **Données :** [`PaperPicState`](./state)

L’état a changé, par l’utilisateur ou par une méthode, par exemple en zoomant, en ouvrant un outil ou en annulant, ou parce que Redresser a [trouvé le document](../guide/tools/straighten#finding-the-document). Il envoie l’état complet, le même que renverrait [`getState()`](./methods#getstate) à ce moment-là. Appliquer l’émet deux fois : au début, avec `busy: true`, et à la fin quand il réussit, après [`apply`](#apply).

Ceci change l’état sans émettre `change` :

- Le chargement d’une image, que signale [`load`](#load) ou [`error`](#error).
- Un Appliquer qui échoue, que signale [`error`](#error). `busy` revient à `false`.
- `setOptions()` et les props des composants, donc les liaisons bidirectionnelles ne bouclent pas.
- Un redimensionnement de la visionneuse, qui change `zoom` tant qu’une adaptation est en vigueur.

Déplacer l’image n’émet rien, car l’état ne contient pas sa position. [État](./state#in-step) montre comment synchroniser vos propres commandes.

## `apply`

- **Données :** [`ExportedImage`](./types#exportedimage)

Appliquer est terminé, depuis le bouton, `Entrée` ou [`apply()`](./methods#apply), et le résultat est déjà affiché. `blob` contient l’image au format `type`, que choisit [`output`](./options#output).

## `download`

- **Données :** [`PaperPicDownload`](./types#paperpicdownload)

L’image est sur le point d’être enregistrée, depuis le bouton de téléchargement ou depuis [`download()`](./methods#download). `source` est l’image affichée : le résultat du dernier Appliquer, ou sinon le `src`. `filename` est le nom du fichier.

Appelez `preventDefault()` pour que le navigateur n’enregistre pas le fichier, par exemple pour l’enregistrer autrement :

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
