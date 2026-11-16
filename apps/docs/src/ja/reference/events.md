---
title: イベント
description: PaperPic のイベント load、error、change、apply、download と、それぞれが渡すデータ。JavaScript、Vue、React での購読方法も説明します。
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

画像が読み込まれ、表示されました。`width` と `height` はピクセル単位のサイズです。

## `error`

- **データ:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

何かが失敗しました。`phase` が何に失敗したかを示します。

- `'load'`：画像を読み込めませんでした。
- `'preview'`：編集を表示できませんでした。たとえば画像がブラウザーにとって大きすぎる場合です。編集は開いたままです。
- `'apply'`：変更を適用できませんでした。編集は開いたままです。

## `change`

- **データ:** [`PaperPicState`](./state)

ユーザーが表示や編集を変更しました。たとえばズーム、ツールを開く、元に戻すなどです。適用の開始も `busy: true` で通知します。画像を移動しても発生しません。状態は画像の位置を持たないためです。`setOptions()` とコンポーネントの props では発生しません。

## `apply`

- **データ:** [`ExportedImage`](./types#exportedimage)

ユーザーが変更を適用し、結果はすでに表示されています。`blob` は [`output`](./options#output) が決める形式 `type` の画像です。

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
