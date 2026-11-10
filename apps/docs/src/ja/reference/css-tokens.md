---
title: CSS トークン
description: PaperPic の見た目を変える CSS カスタムプロパティと、そのライトとダークのデフォルト値。スタイルシート、カスケードレイヤー、クラス名も説明します。
---

# CSS トークン

トークンは、コンポーネントのルールを上書きせずに見た目を変える CSS カスタムプロパティです。`:root`、ビューアーの祖先、または `.paperpic` に設定します。

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| トークン                         | デフォルト | ダーク    | 説明                                 |
| -------------------------------- | ---------- | --------- | ------------------------------------ |
| `--paperpic-color-surface`       | `#fff`     | `#151e2e` | インターフェースの背景               |
| `--paperpic-color-text`          | `#1a263c`  | `#f2f5f9` | インターフェースのテキスト           |
| `--paperpic-color-accent`        | `#0a84ff`  | `#5cb5ff` | インターフェースのアクセントカラー   |
| `--paperpic-radius`              | `6px`      | `6px`     | インターフェースの角の半径           |
| `--paperpic-transition-duration` | `0.2s`     | `0.2s`    | インターフェースのトランジション時間 |

## ダークモード

ダークの値は、ユーザーのシステムがダークカラースキームを好む場合に使われます。`<html>` のクラスなど、別の方法でテーマを切り替えるサイトでは、各テーマの色を自分で設定してください。

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

## スタイルシート

各パッケージにはスタイルシートが 1 つあります。アプリで 1 回だけインポートしてください。

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

ルールは `paperpic` カスケードレイヤーにあるため、レイヤー外にあるあなたの CSS は、詳細度にかかわらずそれを上書きします。`button` に対するルールのようなグローバルなリセットも同様です。

## クラス名

`.paperpic` はビューアーのルート、`.paperpic-host` は Vue と React のコンポーネントがその周りに作る要素です。コンポーネントのクラスはすべて `paperpic` で始まり、名前は変わりません。必要なことがトークンでできるなら、トークンを使ってください。
