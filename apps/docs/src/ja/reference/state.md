---
title: 状態
description: getState() が返し、change イベントが渡す内容。画像の状態、モード、ズーム、変更、適用できるものがあるかなどです。
---

# 状態

状態は、ある時点でビューアーが表示している内容を表します。[`getState()`](./methods#getstate) が返し、[`change`](./events#change) イベントが渡します。独自の「適用」ボタンなど、自前の操作を最新に保つのに使います。

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| フィールド    | 型                                           | 説明                                                                                                         |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `activeTool`  | `ToolId \| null`                             | 開いているツール（`'crop'` や `'adjust'` など）、または `null`                                               |
| `adjustments` | `{ brightness, contrast }`                   | 明るさとコントラスト（それぞれ -1 から 1）。クリーンアップ時は使われません。調整が開いている間は、表示中の値 |
| `busy`        | `boolean`                                    | 適用の実行中か                                                                                               |
| `canApply`    | `boolean`                                    | 適用できる変更があるか。打ち消し合う回転と反転は変更に数えません                                             |
| `canRedo`     | `boolean`                                    | やり直せる変更があるか                                                                                       |
| `canUndo`     | `boolean`                                    | 元に戻せる変更があるか                                                                                       |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | 現在のフィット。ユーザーが手動でズームすると `null`                                                          |
| `image`       | `{ width, height } \| null`                  | これまでの変更を含む表示中の画像のピクセルサイズ。画像がなければ `null`                                      |
| `mode`        | `'view' \| 'edit'`                           | ユーザーが画像を見ているか、編集しているか                                                                   |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | 表示中の画像の回転角度（時計回り、度単位）                                                                   |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | 画像があるか、読み込めたか                                                                                   |
| `threshold`   | `{ enabled, sensitivity }`                   | クリーンアップがオンか、と 0 から 1 の感度。クリーンアップが開いている間は、表示中の内容                     |
| `zoom`        | `number`                                     | 画像の 1 ピクセルあたりの画面のピクセル数                                                                    |
