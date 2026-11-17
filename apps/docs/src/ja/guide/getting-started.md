---
title: はじめに
description: JavaScript、Vue、React 向けに PaperPic をインストールし、最初の文書画像を表示して、編集後の画像を受け取ります。
---

# はじめに

このページでは、PaperPic のインストールから、画像の表示、編集結果の受け取りまでを説明します。どの例でもフレームワークを選ぶと、サイト内のほかの例も切り替わります。

## インストール

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` には Vue 3.5 以降が必要です。

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` には React 19 以降が必要です。

::::

### バンドラーを使わない場合 {#cdn}

core は、jsDelivr のようにパッケージのファイルをそのまま配信する CDN からも読み込めます。モジュールスクリプトで `dist/index.js` を読み込み、`dist/style.css` をリンクしてください。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'レシート' })
</script>
```

ブラウザーはページのオリジンからしか worker を起動しないので、パッケージを CDN から読み込むと編集はメインスレッドで動きます。動作はしますが、大きな写真では適用中にページが少しのあいだ固まります。worker を使うには、ファイルを自分のオリジンから配信するか、バンドラーを使ってください。Vue と React のコンポーネントにはバンドラーが必要です。

## 画像を表示する

ビューアーはコンテナーいっぱいに広がるため、コンテナーに高さを指定してください。スタイルシートはアプリで 1 回だけインポートします。

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'レシート',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="レシート" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="レシート" />
    </div>
  )
}
```

:::

`src` には、ページと同一オリジンの URL、ユーザーが `<input type="file">` などで選んだ `File`、または `Blob` を指定します。`alt` はスクリーンリーダー向けの画像の説明です。 別のオリジンの画像、形式、読み込みエラーについては[画像の読み込み](./loading)を参照してください。

## 編集後の画像を受け取る

ツールバーの鉛筆で編集モードが始まります。ユーザーが変更を適用すると、結果が表示中の画像と置き換わり、`apply` イベントがそれをコードに渡します。

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="レシート" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="レシート" onApply={({ blob }) => upload(blob)} />
```

:::

ここで `upload` はあなた自身のコードです。たとえば次のようにします。

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

`blob` は元画像が JPEG、PNG、WebP ならその形式のままですが、ユーザーが文書をクリーンアップした場合は PNG になります。PaperPic が形式をどう判断するかは[形式と品質](./saving#format)で説明しています。[`output`](../reference/options#output) オプションで変更できます。

## ビューアーを取り除く {#destroy}

Vue と React のコンポーネントは、マウント時にビューアーを作り、アンマウント時に破棄します。core の場合は、ルートが変わるときなど、ビューアーをページから取り除くときに [`destroy()`](../reference/methods#destroy) を呼んでください。

```ts
pic.destroy()
```

ビューアーをコンテナから取り除き、リスナーと worker を止め、画像のメモリーを解放します。もう一度表示するには、新しく作ってください。

## 画像を表示するだけにする

変更されては困る文書を表示するには、`editable: false` で編集をオフにします。[ビューアー](./viewer)のページで動作を確認できます。

## 必要な環境

PaperPic は [Baseline Widely Available](https://web.dev/baseline) のブラウザーで動きます。worker、Content Security Policy、サーバーサイドレンダリング、大きな写真については[パフォーマンスと対応環境](./performance)を参照してください。

## 次のステップ

- [画像の読み込み](./loading)：画像の渡し方と、開ける形式。
- [ビューアー](./viewer): ズーム、フィット、読み取り専用での使い方。
- [編集](./editing): 編集モード、ツール、元に戻す、適用。
- [オプション](../reference/options): 設定できるすべての項目。
- [トラブルシューティング](./troubleshooting)：ビューアーの見た目や動きがおかしいとき。
