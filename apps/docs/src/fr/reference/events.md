---
title: Événements
description: Les événements de PaperPic et ce que chacun transporte, load, error, change, apply et download, avec la façon de les écouter en JavaScript, Vue et React.
---

# Événements

Les événements informent votre code de ce qui se passe dans la visionneuse. Écoutez-les avec [`on()`](./methods#on). En Vue, ce sont des événements du composant, comme `@apply`, et en React, ce sont des props, comme `onApply`.

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

- **Données :** `{ width: number, height: number }`

L’image est chargée et affichée. `width` et `height` sont sa taille en pixels.

## `error`

- **Données :** `{ error: Error }`

L’image n’a pas pu être chargée, ou les changements n’ont pas pu être appliqués. Après un Appliquer qui échoue, la modification reste ouverte.

## `change`

- **Données :** [`PaperPicState`](./state)

L’utilisateur a changé l’affichage ou la modification, par exemple en zoomant, en ouvrant un outil ou en annulant. Il signale aussi le début d’Appliquer, avec `busy: true`. `setOptions()` et les props des composants ne l’émettent jamais.

## `apply`

- **Données :** `{ blob: Blob, width: number, height: number, type: string }`

L’utilisateur a appliqué les changements, et le résultat est déjà affiché. `blob` contient l’image au format `type`, que choisit [`output`](./options#output).

## `download`

- **Données :** `{ source: string | Blob, filename: string, preventDefault: () => void }`

L’image est sur le point d’être enregistrée, depuis le bouton de téléchargement ou depuis [`download()`](./methods#download). `source` est l’image affichée : le résultat du dernier Appliquer, ou sinon le `src`. `filename` est le nom du fichier.

Appelez `preventDefault()` pour que le navigateur n’enregistre pas le fichier, par exemple pour l’enregistrer autrement :

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
