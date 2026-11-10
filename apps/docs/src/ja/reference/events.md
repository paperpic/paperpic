---
title: イベント
description: PaperPic のイベント load、error、change、apply、download と、それぞれが渡すデータ。JavaScript、Vue、React での購読方法も説明します。
---

# イベント

イベントは、ビューアーで起きたことをコードに伝えます。[`on()`](./methods#on) で購読します。Vue では `@apply` のようなコンポーネントのイベント、React では `onApply` のような props です。

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

- **データ:** `{ width: number, height: number }`

画像が読み込まれ、表示されました。`width` と `height` はピクセル単位のサイズです。

## `error`

- **データ:** `{ error: Error }`

画像を読み込めなかったか、変更を適用できませんでした。適用に失敗した場合、編集は開いたままです。

## `change`

- **データ:** [`PaperPicState`](./state)

ユーザーが表示や編集を変更しました。たとえばズーム、ツールを開く、元に戻すなどです。適用の開始も `busy: true` で通知します。`setOptions()` とコンポーネントの props では発生しません。

## `apply`

- **データ:** `{ blob: Blob, width: number, height: number, type: string }`

ユーザーが変更を適用し、結果はすでに表示されています。`blob` は [`output`](./options#output) が決める形式 `type` の画像です。

## `download`

- **データ:** `{ source: string | Blob, filename: string, preventDefault: () => void }`

ダウンロードボタンまたは [`download()`](./methods#download) から、画像がこれから保存されます。`source` は表示中の画像で、最後の適用の結果、なければ `src` です。`filename` はファイル名です。

ブラウザーにファイルを保存させないには `preventDefault()` を呼び出します。別の方法で保存したい場合などに使います。

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
