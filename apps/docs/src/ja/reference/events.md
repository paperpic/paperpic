---
title: イベント
description: PaperPic のイベント（load、error、change、apply、download）と、それぞれが渡すデータ、JavaScript、Vue、React での受け取り方。
---

# イベント

イベントは、ビューアーで起きたことをコードに伝えます。[`on()`](./methods#on) で購読します。Vue では `@apply` のようなコンポーネントのイベント、React では `onApply` のような props です。購読した関数がエラーを投げても、ビューアーは止まりません。ページはそのエラーを未処理のエラーとして受け取り、ほかの関数も実行されます。

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

- **データ:** [`Size`](./types#size)

画像が読み込まれ、表示されました。`width` と `height` はピクセル単位のサイズです。`src` を読み込むたびに発生し、[`reload()`](./methods#reload) でも発生しますが、適用のあとには発生しません。適用の結果は [`apply`](#apply) で届きます。

## `error`

- **データ:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

何かが失敗しました。`phase` が何に失敗したかを示します。

- `'load'`：画像を読み込めませんでした。
- `'preview'`：編集を表示できませんでした。たとえば画像がブラウザーにとって大きすぎる場合です。編集は開いたままです。
- `'apply'`：変更を適用できませんでした。編集は開いたままです。

## `change`

- **データ:** [`PaperPicState`](./state)

ユーザーかメソッドによって状態が変わりました。たとえばズーム、ツールを開く、元に戻すなどです。「傾き補正」が[文書を見つけた](../guide/tools/straighten#finding-the-document)ときにも変わります。状態全体を送り、その時点で [`getState()`](./methods#getstate) が返すものと同じです。変更を適用すると、このイベントは 2 回発生します。開始時に `busy: true` で、成功して終わったときに [`apply`](#apply) の後で発生します。

次の場合は、状態が変わっても `change` は発生しません。

- 画像の読み込み。[`load`](#load) か [`error`](#error) が通知します。
- 失敗した適用。[`error`](#error) が通知します。`busy` は `false` に戻ります。
- `setOptions()` とコンポーネントの props。双方向バインディングがループしないためです。
- ビューアーのサイズ変更。フィットが有効な間は `zoom` が変わります。

画像を移動しても何も発生しません。状態は画像の位置を持たないためです。独自の操作を同期する方法は[状態](./state#in-step)で説明しています。

## `apply`

- **データ:** [`ExportedImage`](./types#exportedimage)

ボタン、`Enter`、[`apply()`](./methods#apply) のいずれかで適用が終わり、結果はすでに表示されています。`blob` は [`output`](./options#output) が決める形式 `type` の画像です。

## `download`

- **データ:** [`PaperPicDownload`](./types#paperpicdownload)

ダウンロードボタンまたは [`download()`](./methods#download) から、画像がこれから保存されます。`source` は表示中の画像で、最後の適用の結果、なければ `src` です。`filename` はファイル名です。

ブラウザーにファイルを保存させないには `preventDefault()` を呼び出します。別の方法で保存したい場合などに使います。

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
