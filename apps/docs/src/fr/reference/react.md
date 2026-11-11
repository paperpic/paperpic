---
title: React
description: Comment le composant PaperPic pour React fait correspondre les options, les événements et les méthodes du cœur à des props, des props de rappel et une ref.
---

# React

`@paperpic/react` enveloppe la visionneuse dans un composant pour React 19 ou plus récent. Les options sont des props, les événements sont des props de rappel, et les méthodes sont sur la visionneuse que reçoit `ref`.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Envoyez l’image modifiée à votre serveur
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Un ticket de caisse" onApply={upload} />
    </div>
  )
}
```

Le composant remplit son élément parent : donnez une hauteur au parent.

## Props

Chaque [option](./options) est une prop du même nom, comme `editable={false}` ou `aspectRatio={210 / 297}`. Deux props de plus habillent l’élément qui contient la visionneuse :

| Prop        | Type            | Description                        |
| ----------- | --------------- | ---------------------------------- |
| `className` | `string`        | Classes ajoutées à `paperpic-host` |
| `style`     | `CSSProperties` | Styles en ligne                    |

Les objets et tableaux, comme `labels` ou `tools`, parviennent de nouveau à la visionneuse chaque fois qu’ils sont nouveaux. Définissez-les hors du composant, ou avec `useMemo`.

## Événements

| Prop         | Données                                |
| ------------ | -------------------------------------- |
| `onApply`    | `{ blob, width, height, type }`        |
| `onChange`   | [`PaperPicState`](./state)             |
| `onDownload` | `{ source, filename, preventDefault }` |
| `onError`    | `{ error }`                            |
| `onLoad`     | `{ width, height }`                    |

[Événements](./events) décrit chacun d’eux. Une nouvelle fonction ne recrée pas la visionneuse, donc les fonctions en ligne conviennent. Un changement de props n’appelle jamais `onChange`.

## Méthodes

`ref` reçoit la visionneuse, de type `PaperPicInstance`, avec toutes les [méthodes](./methods). Elle vaut `null` jusqu’au montage du composant :

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Zoom avant</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Passer le même `src` une nouvelle fois ne recharge pas l’image, donc elle garde le résultat d’une modification. Pour retrouver l’original, appelez `picRef.current.reload()`.

## Types

`@paperpic/react` exporte les types dont vous avez besoin, donc inutile d’installer `@paperpic/core` : `PaperPicProps`, `PaperPicInstance`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` et `ToolId`.

## Rendu côté serveur

Le composant est marqué avec `'use client'`. Avec un rendu côté serveur, comme dans Next.js, il rend un élément vide sur le serveur et crée la visionneuse dans le navigateur.
