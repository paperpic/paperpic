---
layout: home
title: PaperPic
titleTemplate: 文書画像のビューアー兼エディター
description: ブラウザー向けの文書画像ビューアー兼エディター。スマートフォンの写真、スキャン、文字の入ったあらゆる画像の傾き補正、切り抜き、回転、クリーンアップ。JavaScript、Vue、React 向け。

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: きれいで読みやすい文書画像を、ブラウザーだけで
  tagline: スマートフォンの写真、スキャン、文字の入ったあらゆる画像の傾き補正、切り抜き、クリーンアップ。JavaScript、Vue、React で使え、あなたのコードが送るまで何も端末から出ません。
  image:
    src: /hero.svg
    alt: ""
  actions:
    - theme: brand
      text: はじめる
      link: /ja/guide/getting-started
    - theme: alt
      text: プレイグラウンド
      link: /ja/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "ビューアー"
    details: "ボタン、ホイール、ピンチでズームし、画像を移動し、長いレシートは幅に合わせられます。必要なら読み取り専用にもできます。"
    link: /ja/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "傾き補正と切り抜き"
    details: "斜めから撮った写真を平らなページにします。縦横比は推定も指定もできます。角はビューアーが見つけ、ドラッグで直せます。"
    link: /ja/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "クリーンアップ"
    details: "影のある写真をくっきりした白黒にし、カラーの文書は明るさとコントラストを調整できます。"
    link: /ja/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "フル解像度"
    details: "適用すると、編集した画像を Blob としてコードに渡します。処理は Web Worker で行われ、ページは軽快なままです。"
    link: /ja/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "アクセシブル"
    details: "キーボードショートカット、矢印キーで動かせる角のハンドル、スクリーンリーダー向けの読み上げ。"
    link: /ja/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "あらゆるフレームワーク"
    details: "素の JavaScript 用のコアと、Vue と React 用の軽量ラッパー。実行時の依存関係はありません。"
    link: /ja/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "写真と結果を比べる"
  beforeLabel: "写真"
  afterLabel: "PaperPic"
  beforeAlt: "机の上のレシートを斜めから撮った、一部が影になった写真"
  afterAlt: "同じレシートを傾き補正し、白黒にクリーンアップしたもの"
---

## 数行で始める

フレームワークに合ったパッケージをインストールし、コンテナに高さを与えて、適用を受け取ります。

:::tabs key:framework
== JavaScript

```sh
npm install @paperpic/core
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'レシート' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```sh
npm install @paperpic/vue
```

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="レシート" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```sh
npm install @paperpic/react
```

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="レシート" onApply={({ blob }) => upload(blob)} />
}
```

:::

インストールと各手順は[はじめに](./guide/getting-started)で説明しています。
