---
title: スタイル
description: PaperPic をアプリの見た目になじませる方法。スタイルシート、CSS トークン、ダークモード、そしてアプリの CSS を優先させるカスケードレイヤーを説明します。
---

# スタイル

PaperPic はアプリの一部のように見えるべきです。スタイルシートは 1 つだけで、色と角はいくつかの CSS トークンから取り、ルールはカスケードレイヤーに入っているため、あなたの CSS が常に優先されます。

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

## ダークモード {#dark-mode}

ユーザーのシステムがダークカラースキームを好む場合、色はダーク用に切り替わります。`<html>` のクラスなど別の方法でテーマを切り替えるサイトでは、各テーマの色を自分で設定してください。

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

## レイアウト

インターフェースはコンテナーに合わせて自動で調整されます。

- ツールバーは右側にあり、ビューアーの高さが足りないときはスクロールします。
- 編集バーは下部にあり、通常は 1 行、幅 28rem 未満のビューアーでは 2 行になります。
- タッチスクリーンでは、ボタンと角のハンドルが 44 ピクセル以上になります。

## クラス名

コンポーネントのクラスはすべて `paperpic` で始まり、名前は変わらないため、セレクターで使えます。トークンで足りる場合はトークンを使ってください。内部構造が変わっても動き続けます。
