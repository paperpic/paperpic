---
title: 編集
description: PaperPic の編集モードの仕組みを、「編集」ボタンから「適用」まで、ツール、元に戻すとやり直す、プレビュー、コードが受け取るイベントとともに説明します。
---

# 編集

文書の写真は、保存する前にいくつか手直しが必要なことがほとんどです。編集モードはそれをひとまとめにします。ユーザーは変更を加え、確認し、まとめて適用します。[プレイグラウンド](../playground)で編集モード全体を試せます。

## 編集の流れ

1. ユーザーがツールバーの鉛筆、「編集」を押します。ツールバーは画像を隠さないように非表示になり、ビューアーの下部に編集バーが表示されます。
2. 「左に回転」と「反転」はすぐに変更を加えます。ほかのツールは編集バーにパネルを開き、そこで選んだ内容を「完了」で 1 つの変更として加えます。「元に戻す」と「やり直す」で変更をさかのぼったり進めたりできます。
3. 「適用」で結果が計算され、表示に戻ります。「キャンセル」は変更を破棄し、変更がある場合は先に確認します。

「適用」までは画像は変わりません。それまでの変更は一覧として保持され、ビューアーがプレビューを表示します。

編集バーはどの状態でも同じ高さの 2 行です。上の行にはツールか開いているツールのパネル、下の行には左に「キャンセル」、右に「適用」または「完了」が並びます。そのため、ツールを開いても画像の位置は変わりません。幅 28rem 以上のビューアーでは、バーは 1 行に収まります。「調整」と「クリーンアップ」は、設定が有効な間ドットで示されます。

## ツール

| ツール                                  | 動作                                     | Id            |
| --------------------------------------- | ---------------------------------------- | ------------- |
| [「切り抜き」](./tools/crop)            | 4 つの角の内側だけを残します             | `crop`        |
| [「傾き補正」](./tools/straighten)      | 斜めから撮った写真を平らなページにします | `perspective` |
| [「左に回転」](./tools/rotate-and-flip) | 画像を左に 90 度回転します               | `rotate`      |
| [「反転」](./tools/rotate-and-flip)     | 画像を左右に反転します                   | `flip`        |
| [「調整」](./tools/adjust)              | 明るさとコントラストを変えます           | `adjust`      |
| [「クリーンアップ」](./tools/clean-up)  | 文書を影のないくっきりした白黒にします   | `threshold`   |

[`tools`](../reference/options#tools) オプションで、編集バーに表示するツールを選べます。

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

「切り抜き」「傾き補正」「調整」「クリーンアップ」はツールの代わりにパネルを開くため、どれかが開いている間、編集バーのほかの部分は待機します。「完了」または `Enter` でツールで選んだ内容が変更に加わり、「このツールをキャンセル」または `Esc` で破棄されます。

パネルの中では、画像は「クリーンアップ」も含めて結果どおりに表示されます。例外は「傾き補正」で、紙の端が見えるように「クリーンアップ」なしの写真を表示します。

## プレビューと適用

編集中、ビューアーは約 2 メガピクセルの画像のコピーで変更をプレビューするため、大きな写真でも速く動きます。拡大すると、プレビューは結果よりもぼやけて見えます。「適用」はすべての変更をフル解像度、または [`maxOutputSize`](../reference/options#maxoutputsize) で、Web Worker の中で計算します。

適用は中断できません。実行中は操作がロックされ、メッセージが表示されます。そのあと結果が表示中の画像と置き換わり、履歴が空になり、ビューアーは表示モードに戻ります。適用に失敗した場合は、ユーザーがやり直せるよう編集は開いたままです。

## コードが受け取るもの

| イベント | タイミング                                                   |
| -------- | ------------------------------------------------------------ |
| `apply`  | 結果ができたときに、`{ blob, width, height, type }` とともに |
| `change` | ユーザーの操作のたびに、[状態](../reference/state)とともに   |
| `error`  | 適用に失敗したとき、または画像を読み込めないとき             |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## 変更が破棄される場合

- ユーザーが確認したあとの「キャンセル」、または確認しない [`cancel()`](../reference/methods#cancel)。
- 編集中の新しい `src`。
- 編集中の `editable` の変更。

適用のあとに同じ `src` をもう一度渡しても何も起きないため、結果は表示されたままです。元画像に戻すには [`reload()`](../reference/methods#reload) を使います。

## キーボード

ビューアーにフォーカスがあるとき:

| キー                           | 操作                                               |
| ------------------------------ | -------------------------------------------------- |
| `Ctrl+Z`                       | 元に戻す                                           |
| `Ctrl+Shift+Z` または `Ctrl+Y` | やり直す                                           |
| `Enter`                        | 開いているツールを確定、なければ変更を適用         |
| `Esc`                          | 開いているツールを閉じる、なければ変更をキャンセル |

macOS では `Cmd` が `Ctrl` と同じ働きをします。
