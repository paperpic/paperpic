---
title: はじめに
description: JavaScript、Vue、React 向けに PaperPic をインストールし、最初の文書画像を表示して、編集後の画像を受け取ります。
---

# はじめに

このページでは、PaperPic のインストールから、画像の表示、編集結果の受け取りまでを説明します。どの例でもフレームワークを選ぶと、サイト内のほかの例も切り替わります。

## インストール

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` には Vue 3.5 以降が必要です。

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` には React 19 以降が必要です。

:::

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

const pic = new PaperPic(document.querySelector('#viewer'), {
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

`src` には、ページと同一オリジンの URL か、ユーザーが `<input type="file">` などで選んだ `File` を指定します。`alt` はスクリーンリーダー向けの画像の説明です。

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

`blob` は元画像の形式のままですが、ユーザーが文書をクリーンアップした場合は PNG になります。[`output`](../reference/options#output) オプションで変更できます。

## 画像を表示するだけにする

変更されては困る文書を表示するには、`editable: false` で編集をオフにします。[ビューアー](./viewer)のページで動作を確認できます。

## 必要な環境

- PaperPic は [Baseline Widely Available](https://web.dev/baseline) のブラウザーで動作します。
- 編集は Web Worker で行われ、Vite や webpack などのバンドラーが自動で扱います。worker を起動できない場合はメインスレッドで編集が行われます。動作はしますが、大きな画像ではページが一瞬止まることがあります。
- Content Security Policy を使う場合は、`worker-src 'self'` で worker を、`img-src blob:` で画像を許可してください。ビューアーは添付ファイルと結果を `blob:` URL で表示するためです。
- Nuxt や Next.js などのサーバーサイドレンダリングでは、Vue と React のコンポーネントはサーバーで空の要素を描画し、ブラウザーでビューアーを作成します。コアを使う場合は、ブラウザーでビューアーを作成してください。

## 次のステップ

- [ビューアー](./viewer): ズーム、フィット、読み取り専用での使い方。
- [編集](./editing): 編集モード、ツール、元に戻す、適用。
- [オプション](../reference/options): 設定できるすべての項目。
