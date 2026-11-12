---
title: スタイル
description: PaperPic をアプリの見た目になじませる方法。スタイルシート、CSS トークン、ダークモード、独自のアイコン、そしてアプリの CSS を優先させるカスケードレイヤーを説明します。
---

# スタイル

PaperPic はアプリの一部のように見えるべきです。スタイルシートは 1 つだけで、色と角はいくつかの CSS トークンから取り、ページのカラースキームに従い、ルールはカスケードレイヤーに入っているため、あなたの CSS が常に優先されます。

## スタイルシートをインポートする

アプリで 1 回だけインポートします。

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

## サイズを与える

ビューアーはコンテナーいっぱいに広がり、自身の高さを持たないため、コンテナーに高さが必要です。高さを与える CSS なら何でも使えます。

```css
.document-viewer {
  height: 70dvh;
}
```

ビューアーは画面ではなくコンテナーのサイズに従います。サイドパネルが開くなど、コンテナーが変わると追従します。

## 色と角

5 つの [CSS トークン](../reference/css-tokens)で、背景、テキスト、アクセントカラー、角の半径、トランジションの長さを設定します。`:root`、ビューアーの祖先、または `.paperpic` に設定してください。

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

トークンは継承されるため、1 つのビューアーのコンテナー、または Vue や React のコンポーネントにクラスを付けると、そのビューアーだけが変わります。

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## デザインシステムの色を使う {#design-system}

アプリが色を CSS 変数に持っているなら、値をコピーせず、トークンをその変数に向けてください。ビューアーはダークモードも含めてあなたのテーマに従います。

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

ここにあるように `.paperpic` に設定してください。`var()` を使うトークンは、設定した要素の上で変数を読みます。そのため `:root` に設定すると、ページの一部だけで切り替えるテーマを取りこぼします。

CSS 変数を持つデザインシステムなら何でも使えます。たとえば Tailwind CSS 4 のテーマ変数 `var(--color-blue-600)` や `var(--radius-md)` です。

## ダークモード {#dark-mode}

色は、ブラウザーのフォームコントロールと同じく、ページの `color-scheme` に従います。

- `color-scheme: light dark` では、ユーザーのシステムがダークカラースキームを好むときにダークになります。
- `color-scheme: dark` では、常にダークです。ページの一部だけでも使えます。
- `color-scheme` がなければライトのままです。そのため、ダークテーマのないページではビューアーもライトのままです。

サイトがシステムに従うなら、一度だけ宣言します。

```css
:root {
  color-scheme: light dark;
}
```

`<html>` のクラスなどでテーマを切り替えるサイトでは、そのクラスと一緒に `color-scheme` を設定します。ブラウザーのスクロールバーやフォームコントロールもそれに従います。

```css
:root.dark {
  color-scheme: dark;
}
```

ダークの色を自分で選ぶには、`light-dark()` でトークンに両方の値を与えます。

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

[デザインシステム](#design-system)の変数を指すトークンは、代わりにあなたのテーマに従います。

## アイコン {#icons}

[`icons`](../reference/options#icons) オプションは、任意のアイコンを独自のマークアップに置き換えます。ふつうはアプリのアイコンセットの `<svg>` です。

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- 各キーはアイコンを表し、2 つのボタンに出るアイコンもあります。`apply` は完了にも、`cancel` はツールを閉じるボタンにも使われます。すべてのキーは[オプション](../reference/options#icons)にあります。
- PaperPic はアイコンにサイズを決める `paperpic-icon` クラスを付け、スクリーンリーダーからは隠します。ボタンにはすでに名前があるからです。
- アイコンは `currentColor` で描いてください。どのテーマでもボタンの色になります。
- マークアップは HTML としてページに入るため、信頼できるマークアップだけを渡してください。
- Vite では、`import zoomIn from './zoom-in.svg?raw'` で `.svg` ファイルのマークアップを取得できます。

サイズや線の太さなど、すべてのアイコンを一度に変えるには、クラスにスタイルを当てます。

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## あなたの CSS が優先される

PaperPic のルールは `paperpic` カスケードレイヤーにあり、レイヤー外の CSS は詳細度にかかわらずそれを上書きします。カスタマイズは簡単になりますが、`button` へのルールのようなレイヤー外のグローバルなリセットも、ビューアーのボタンに効いてしまいます。

リセットでビューアーが崩れる場合は、`paperpic` より前のレイヤーに移してください。レイヤーを列挙した最初の宣言が順序を決めるため、PaperPic のスタイルシートより先に読み込まれる CSS に書きます。

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Tailwind CSS 4 もルールをカスケードレイヤーに入れます。Tailwind と PaperPic をインポートする前に、すべてのレイヤーを順に列挙してください。そうすると Tailwind のリセットは `paperpic` の前に、ユーティリティは後に来ます。

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

PaperPic のスタイルシートは JavaScript からではなく、ここで CSS からインポートしてください。順序が違うと、Tailwind のリセットがビューアーの余白や枠線を消すか、ビューアーがコンポーネントに付けた `h-96` などのユーティリティを上書きします。

## クラス名 {#class-names}

セレクターで使えるクラスは、`paperpic-toolbar` や `paperpic-button` など [CSS リファレンス](../reference/css-tokens#classes)にあり、名前は変わりません。ほかのクラスはレイアウトを支えるもので、どのリリースでも変わる可能性があります。トークンで足りる場合はトークンを使ってください。

ボタン、目盛り、角のハンドルにはそれぞれ `data-paperpic-control` もあり、その[ラベル](../reference/labels)のキーが入っています。1 つのコントロールだけにスタイルを当てるときに選択してください。

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## レイアウト

インターフェースはコンテナーに合わせて自動で調整されます。

- ツールバーは右側にあり、ビューアーの高さが足りないときはスクロールします。編集中は非表示になります。
- 編集バーは下部のカードで、高さの固定された 2 行、幅 28rem 以上のビューアーでは 1 行です。そのため、ツールを開いても画像の位置は変わりません。
- タッチスクリーンでは、ボタンと角のハンドルが 44 ピクセル以上になります。

## 独自のコントロール

スタイルだけでは足りないときは、`toolbar: false` でツールバーと編集バーを隠し、独自のコントロールでビューアーを操作してください。方法は[独自のツールバー](../examples/custom-toolbar)にあります。
