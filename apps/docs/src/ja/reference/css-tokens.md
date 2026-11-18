---
title: CSS トークン
description: PaperPic の見た目を変える CSS カスタムプロパティと、そのライトとダークの値。スタイルシート、カスケードレイヤー、公開クラス、コントロールの名前も説明します。
---

# CSS トークン

トークンは、コンポーネントのルールを上書きせずに見た目を変える CSS カスタムプロパティです。`:root`、ビューアーの祖先、または `.paperpic` に設定します。

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| トークン                         | ライト             | ダーク             | 説明                                                     |
| -------------------------------- | ------------------ | ------------------ | -------------------------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff`          | `#5cb5ff`          | インターフェースのアクセントカラー                       |
| `--paperpic-color-dim`           | `rgb(0 0 0 / 50%)` | `rgb(0 0 0 / 50%)` | 選択範囲の周りの画像を暗くします                         |
| `--paperpic-color-line`          | `#fff`             | `#fff`             | 画像の上の線。選択範囲の輪郭、角のハンドル、ルーペの十字 |
| `--paperpic-color-line-shadow`   | `rgb(0 0 0 / 60%)` | `rgb(0 0 0 / 60%)` | 各線の下の影。どの画像の上でも線が見えるようにします     |
| `--paperpic-color-surface`       | `#fff`             | `#151e2e`          | インターフェースの背景                                   |
| `--paperpic-color-text`          | `#1a263c`          | `#f2f5f9`          | インターフェースのテキスト                               |
| `--paperpic-radius`              | `6px`              | `6px`              | インターフェースの角の半径                               |
| `--paperpic-transition-duration` | `0.2s`             | `0.2s`             | インターフェースのトランジション時間                     |

## ダークモード

色のトークンは、ページの `color-scheme` に応じて `light-dark()` でライトかダークの値を取ります。`color-scheme` がなければライトです。`color-scheme: dark` ではダーク、`color-scheme: light dark` ではシステムがダークカラースキームを好むときにダークです。設定方法は[スタイル](../guide/styling#dark-mode)にあります。

トークンの両方の値を選ぶには、同じく `light-dark()` を使います。

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

画像の上に描く色、`--paperpic-color-dim`、`--paperpic-color-line`、`--paperpic-color-line-shadow` は、インターフェースではなく写真の上にあるため、両方のモードで同じ値です。線とその影は組で使います。暗い線には明るい影を選んでください。

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

ルールは `paperpic` カスケードレイヤーにあるため、レイヤー外にあるあなたの CSS は、詳細度にかかわらずそれを上書きします。`button` に対するルールのようなグローバルなリセットも同様です。Tailwind CSS では、[スタイル](../guide/styling#tailwind)にあるようにレイヤーの順序を列挙してください。

## クラス {#classes}

これらのクラスは公開されています。名前と、それが付く要素は、リリースをまたいで変わりません。コンポーネントのほかのクラスはレイアウトを支えるもので、どのリリースでも変わる可能性があります。

| クラス                    | 要素                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `paperpic`                | ビューアーのルート                                                                                   |
| `paperpic-button`         | ツールバーと編集バーのすべてのボタン                                                                 |
| `paperpic-button-danger`  | 変更を破棄する前の確認にある破棄                                                                     |
| `paperpic-button-primary` | 適用、および各ツールの完了                                                                           |
| `paperpic-button-text`    | 変更を破棄する前の確認にあるボタン                                                                   |
| `paperpic-edit-bar`       | 編集中に下部に表示されるカード型の編集バー                                                           |
| `paperpic-editing`        | 編集中のルート                                                                                       |
| `paperpic-handle`         | 切り抜きと傾き補正の角のハンドル                                                                     |
| `paperpic-host`           | Vue と React のコンポーネントがビューアーの周りに作る要素                                            |
| `paperpic-icon`           | ボタンのアイコン                                                                                     |
| `paperpic-status`         | 画像の読み込み中や変更の適用中、失敗したときに表示されるメッセージ。スクリーンリーダーも読み上げます |
| `paperpic-status-visible` | ビューアーの中央に表示されている間のメッセージ                                                       |
| `paperpic-toolbar`        | 右側のツールバー。編集中は非表示                                                                     |
| `paperpic-viewport`       | 画像を表示し、キーボードフォーカスを受ける領域                                                       |

ボタンは ARIA 属性で状態を示し、これも選択できます。

| 属性                     | 状態                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | ボタンが今は動作できない状態。キーボードフォーカスは保つため、`disabled` ではありません |
| `[aria-pressed='true']`  | 使用中の合わせ方（幅に合わせる、高さに合わせる）、または目盛りが変える「調整」の選択肢  |

ホバーとこれらの状態は `box-shadow` で描かれ、ボタンのグローバルなリセットの影響を受けません。変更するときは `box-shadow` も上書きしてください。

## 状態 {#states}

ルートの `.paperpic` は、CSS が追えるようにビューアーの状態を data 属性で持ちます。

| 属性                   | 値                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `data-paperpic-status` | `empty`、`loading`、`ready`、`error` のいずれか。[状態](./state)の `status` と同じです |
| `data-paperpic-mode`   | `view` または `edit`                                                                   |
| `data-paperpic-tool`   | 開いているツールの id（`crop` など）。ツールが開いていない間はありません               |

```css
.paperpic[data-paperpic-status='error'] .paperpic-status-visible {
  color: #b91c1c;
}
```

## コントロール {#controls}

ボタン、目盛り、角のハンドルにはそれぞれ `data-paperpic-control` があり、その[ラベル](./labels)のキーが入っています。1 つのコントロールだけにスタイルを当てるときに選択してください。

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| 場所                 | 値                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ツールバー           | `edit`、`zoomIn`、`zoomOut`、`fitWidth`、`fitHeight`、`rotateLeft`、`rotateRight`、`download`                                               |
| 編集バー             | `cancel`、`crop`、`perspective`、`rotateLeft`、`flip`、`adjust`、`finish`、`undo`、`redo`、`apply`                                          |
| 調整とクリーンアップ | `brightness` と `contrast`（選択肢とその目盛り）、`finishOriginal`、`finishGray`、`finishMono`（仕上げ）、`finishSensitivity`（その目盛り） |
| 各ツール             | `cancelTool`、`confirm`                                                                                                                     |
| 切り抜きと傾き補正   | `zoomIn`、`zoomOut`、`cornerTopLeft`、`cornerTopRight`、`cornerBottomRight`、`cornerBottomLeft`                                             |
| 破棄する前の確認     | `keepEditing`、`discard`                                                                                                                    |

`rotateLeft` は、同時には表示されない 2 つのボタンを指します。表示だけを回す読み取り専用のビューアーのボタンと、画像そのものを回す編集バーのボタンです。`zoomIn` と `zoomOut`（ツールバーとパネル）も同じです。`brightness` と `contrast` は選択肢とその目盛りを指し、両方が同時に表示されます。区別するには、セレクターに `button` か `input` を加えてください。
