---
title: Types
description: Chaque type TypeScript exporté par PaperPic, avec sa définition, la page qui l’explique et comment l’importer depuis le paquet que vous avez installé.
---

# Types

La référence et les exemples nomment des types comme `ExportedImage` ou `ToolId`. Cette page montre ce que contient chacun, pour que vous puissiez typer votre propre code. Chaque type renvoie à la page qui l’explique.

Importez les types depuis le paquet que vous avez installé. `@paperpic/vue` et `@paperpic/react` exportent tous les types de `@paperpic/core`, donc inutile de l’installer :

:::tabs key:framework
== JavaScript

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/core'
```

== Vue

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/vue'
```

== React

```ts
import type { ExportedImage, PaperPicState, ToolId } from '@paperpic/react'
```

:::

## Options

### `PaperPicOptions`

```ts
interface PaperPicOptions {
  alt?: string
  aspectRatio?: number
  download?: boolean
  editable?: boolean
  filename?: string
  icons?: Partial<PaperPicIcons>
  labels?: Partial<PaperPicLabels>
  maxOutputSize?: number
  output?: PaperPicOutput
  softness?: number
  src?: PaperPicSource
  toolbar?: boolean
  tools?: readonly ToolId[]
  wheelZoom?: boolean
}
```

Ce que prennent le constructeur et [`setOptions()`](./methods#setoptions). Dans Vue et React, ce sont les props du composant. [Options](./options) explique chacune.

### `PaperPicSource`

```ts
type PaperPicSource = string | Blob
```

L’image de [`src`](./options#src) : une URL de la même origine, ou un `File` ou un `Blob` joint côté client. Le `source` de [`PaperPicDownload`](#paperpicdownload) a le même type.

### `PaperPicOutput`

```ts
interface PaperPicOutput {
  quality?: number
  type?: string
}
```

Le format de l’image modifiée, dans [`output`](./options#output).

### `ToolId`

```ts
type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'
```

Un outil de la barre de modification, dans [`tools`](./options#tools), [`openTool()`](./methods#opentool) et le `activeTool` de l’[état](./state). [`tools`](./options#tools) indique le bouton de chacun.

### `PaperPicLabels`

```ts
interface PaperPicLabels {
  adjust: string
  adjustmentLevel: (name: string, value: number) => string
  applied: string
  apply: string
  applyError: string
  brightness: string
  cancel: string
  cancelTool: string
  confirm: string
  contrast: string
  cornerBottomLeft: string
  cornerBottomRight: string
  cornerMoved: (corner: string, x: number, y: number) => string
  cornerSelected: (corner: string) => string
  cornerTopLeft: string
  cornerTopRight: string
  crop: string
  cropHint: string
  discard: string
  discardQuestion: string
  download: string
  edit: string
  editBar: string
  editing: string
  fitHeight: string
  fitWidth: string
  flip: string
  inUse: string
  keepEditing: string
  loadError: string
  loading: string
  perspective: string
  perspectiveHint: string
  processing: string
  redo: string
  rotateLeft: string
  rotateRight: string
  threshold: string
  thresholdLevel: (percent: number) => string
  thresholdSensitivity: string
  toolbar: string
  undo: string
  viewer: string
  zoomIn: string
  zoomLevel: (percent: number) => string
  zoomOut: string
}
```

Chaque texte de l’interface, dans [`labels`](./options#labels). Les textes qui contiennent une valeur, comme le niveau de zoom, sont des fonctions. [Libellés](./labels) donne le texte anglais de chacun.

### `PaperPicIcons`

```ts
interface PaperPicIcons {
  adjust: string
  apply: string
  brightness: string
  cancel: string
  contrast: string
  crop: string
  download: string
  edit: string
  fitHeight: string
  fitWidth: string
  flip: string
  perspective: string
  redo: string
  rotateDocument: string
  rotateLeft: string
  rotateRight: string
  threshold: string
  undo: string
  zoomIn: string
  zoomOut: string
}
```

Chaque icône de l’interface, sous forme du balisage d’un élément, dans [`icons`](./options#icons), qui indique les boutons de chacune.

## État

### `PaperPicState`

```ts
interface PaperPicState {
  activeTool: ToolId | null
  adjustments: { brightness: number, contrast: number }
  busy: boolean
  canApply: boolean
  canRedo: boolean
  canUndo: boolean
  fit: Fit | null
  image: Size | null
  mode: 'view' | 'edit'
  rotation: Rotation
  status: 'empty' | 'loading' | 'ready' | 'error'
  threshold: { enabled: boolean, sensitivity: number }
  zoom: number
}
```

Ce que renvoie [`getState()`](./methods#getstate) et ce que transmet l’événement [`change`](./events#change). [État](./state) explique chaque champ.

### `Fit`

```ts
type Fit = 'image' | 'width' | 'height'
```

Comment l’image s’ajuste à la visionneuse : entière, à sa largeur ou à sa hauteur. [`fit()`](./methods#fit) le prend, et le `fit` de l’[état](./state) le contient.

### `Rotation`

```ts
type Rotation = 0 | 90 | 180 | 270
```

De combien l’image affichée est tournée, en degrés dans le sens des aiguilles d’une montre, dans le `rotation` de l’[état](./state).

### `Size`

```ts
interface Size {
  height: number
  width: number
}
```

Une largeur et une hauteur en pixels, comme le `image` de l’[état](./state) ou ce que transmet l’événement [`load`](./events#load).

## Événements

### `PaperPicEvents`

```ts
interface PaperPicEvents {
  apply: ExportedImage
  change: PaperPicState
  download: PaperPicDownload
  error: { error: Error }
  load: Size
}
```

Chaque événement avec ce qu’il transmet, pour [`on()`](./methods#on). [Événements](./events) explique chacun.

### `ExportedImage`

```ts
interface ExportedImage {
  blob: Blob
  height: number
  type: string
  width: number
}
```

L’image modifiée, que transmet l’événement [`apply`](./events#apply). `type` est le format de `blob`, que choisit [`output`](./options#output).

### `PaperPicDownload`

```ts
interface PaperPicDownload {
  filename: string
  preventDefault: () => void
  source: PaperPicSource
}
```

Ce que transmet l’événement [`download`](./events#download). Appelez `preventDefault()` pour enregistrer le fichier autrement.

## Méthodes

### `ViewPoint`

```ts
interface ViewPoint {
  x: number
  y: number
}
```

Un point en pixels CSS depuis le coin supérieur gauche de la visionneuse, pour [`zoomTo()`](./methods#zoomto).

## Vue et React

`@paperpic/vue` et `@paperpic/react` exportent aussi les types de leur composant. [Vue](./vue) et [React](./react) montrent comment l’utiliser.

### `PaperPicInstance`

```ts
type PaperPicInstance = PaperPic
```

La visionneuse que vous donne le composant : `instance` dans Vue, et ce que reçoit `ref` dans React. C’est la classe `PaperPic` de `@paperpic/core`, avec toutes les [méthodes](./methods).

### `PaperPicProps`

```ts
interface PaperPicProps extends PaperPicOptions {
  className?: string
  onApply?: (result: PaperPicEvents['apply']) => void
  onChange?: (state: PaperPicEvents['change']) => void
  onDownload?: (download: PaperPicEvents['download']) => void
  onError?: (failure: PaperPicEvents['error']) => void
  onLoad?: (size: PaperPicEvents['load']) => void
  ref?: Ref<PaperPicInstance>
  style?: CSSProperties
}
```

Les props du composant dans React : les options, plus les classes et les styles de son élément, un callback pour chaque événement et `ref`. Dans Vue, les props ont les mêmes champs que [`PaperPicOptions`](#paperpicoptions), et les événements sont des événements du composant.
