---
title: 結果の保存
description: PaperPic が編集後の画像をどう渡すか、形式とサイズの選び方、アップロードの方法、ダウンロードボタンとそのイベントの仕組み。
---

# 結果の保存

PaperPic は何もアップロードせず、何も保存しません。ユーザーが変更を適用すると結果をコードに渡し、行き先はアプリが決めます。このページでは、受け取るものと保存の方法を説明します。

## `apply` イベント

「適用」は結果を計算し、次の内容で [`apply`](../reference/events#apply) を発生させます。

| フィールド        | 型       | 説明                       |
| ----------------- | -------- | -------------------------- |
| `blob`            | `Blob`   | 編集後の画像               |
| `width`、`height` | `number` | ピクセル単位のサイズ       |
| `type`            | `string` | 形式（`'image/png'` など） |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

適用のあとは、結果が表示中の画像になり、履歴は空になり、次の編集は結果から始まります。[`reload()`](../reference/methods#reload) で元の `src` に戻せます。

## アップロードする

`blob` をフォームのファイルとして送ります。

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

ビューアーは、サーバーに届いたかどうかに関係なく結果をすぐに表示します。アップロードに失敗したときは、ユーザーに知らせてください。

## 形式と品質

オプションがなければ、結果は元画像の形式（JPEG、PNG、WebP）を保ちます。クリーンアップした文書は PNG になります。JPEG だとくっきりした輪郭の周りにノイズが出るためです。GIF などそれ以外の元画像は PNG になります。

[`output`](../reference/options#output) で形式と、JPEG と WebP の品質を 0 から 1 で選べます。品質のデフォルトは 0.92 です。

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| 形式         | 向いているもの                              |
| ------------ | ------------------------------------------- |
| `image/png`  | クリーンアップした文書や文字。劣化なし      |
| `image/jpeg` | 写真やカラーの文書。小さなファイル          |
| `image/webp` | 写真やカラーの文書。JPEG より小さなファイル |

ブラウザーが指定の形式をエンコードできない場合は PNG になるため、イベントの `type` を確認してください。

## サイズ

結果は元画像のフル解像度を保ちます。スマートフォンの写真では 12 メガピクセル以上になることも多くあります。[`maxOutputSize`](../reference/options#maxoutputsize) で長辺をピクセル単位で制限できます。

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

編集中のプレビューは常に約 2 メガピクセルなので、`maxOutputSize` が変えるのは結果だけです。

## ダウンロードボタン

[`download: true`](../reference/options#download) にすると、ツールバーの最後に、表示中の画像を保存するボタンが加わります。保存されるのは最後の適用の結果、なければ元画像そのものです。編集中は、変更がまだ適用されていないためボタンが隠れます。[`download()`](../reference/methods#download) は、ボタンの有無にかかわらずコードから同じことをします。ビューアーの上ではブラウザーのコンテキストメニューが開かないため、画像を保存するにはこのボタンを使います。

ファイルは元画像の名前を保ち、形式の拡張子が付きます。そのため、クリーンアップした `receipt.jpg` は `receipt.png` として保存されます。[`filename`](../reference/options#filename) で別の名前を指定できます。`Blob` のように名前がまったくない場合、ファイル名は `image` になります。

### 別の方法で保存する

[`download`](../reference/events#download) イベントは、ブラウザーがファイルを保存する前に発生します。`preventDefault()` を呼び出すと、別の方法で保存できます。たとえばサーバーから保存すれば、ファイル名を付けたり、誰がダウンロードするかを確認したりできます。

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
