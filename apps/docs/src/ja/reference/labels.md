---
title: ラベル
description: PaperPic のインターフェースのすべてのテキストと、そのキーと英語のデフォルト値。コンポーネントの翻訳や言い回しの変更に使います。
---

# ラベル

ラベルは、コンポーネントが表示するテキストと、スクリーンリーダーに読み上げるテキストです。デフォルトは英語です。変えたいものだけを [`labels`](./options#labels) オプションに渡せば、ほかは英語のままです。

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: '適用',
    cancel: 'キャンセル',
    zoomLevel: percent => `ズーム ${percent}%`,
  },
})
```

5 つのラベルは、テキストに値を含むため関数です。オブジェクトはレンダーのたびではなく 1 回だけ作成してください。そうしないと、ビューアーが毎回受け取り直します。

| キー                   | 英語                                         | 用途                                                                          |
| ---------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | 明るさとコントラストのスライダーを表示するボタン                              |
| `adjustmentLevel`      | Brightness +30                               | 名前と -100 から 100 の値の関数。「調整」のスライダーを動かしたあとに読み上げ |
| `applied`              | Changes applied                              | 変更が適用されたときに読み上げ                                                |
| `apply`                | Apply                                        | 変更を適用するボタン                                                          |
| `applyError`           | The changes could not be applied             | 適用に失敗したときに表示                                                      |
| `brightness`           | Brightness                                   | 明るさのスライダーの名前                                                      |
| `cancel`               | Cancel                                       | 編集モードを終えるボタン                                                      |
| `cancelTool`           | Cancel this tool                             | ツールを閉じて選択範囲を破棄するボタン                                        |
| `confirm`              | Done                                         | ツールを閉じて選択範囲を残すボタン                                            |
| `contrast`             | Contrast                                     | コントラストのスライダーの名前                                                |
| `cornerBottomLeft`     | Bottom left corner                           | 角のハンドルの名前                                                            |
| `cornerBottomRight`    | Bottom right corner                          | 角のハンドルの名前                                                            |
| `cornerMoved`          | Top left corner: 120, 80                     | 角と画像のピクセル単位の位置の関数。角を動かしたあとに読み上げ                |
| `cornerSelected`       | Top left corner: tap where it goes           | 角の関数。角のハンドルを押したあと、画像のタップで移動するまで表示し読み上げ  |
| `cornerTopLeft`        | Top left corner                              | 角のハンドルの名前                                                            |
| `cornerTopRight`       | Top right corner                             | 角のハンドルの名前                                                            |
| `crop`                 | Crop                                         | 「切り抜き」ボタン                                                            |
| `cropHint`             | Drag the corners                             | 「切り抜き」での操作の説明                                                    |
| `discard`              | Discard                                      | 変更を失うことを確定するボタン                                                |
| `discardQuestion`      | Discard your changes?                        | 変更を失う前の確認                                                            |
| `download`             | Download                                     | ダウンロードボタン                                                            |
| `edit`                 | Edit                                         | 編集を始めるボタン                                                            |
| `editBar`              | Editing controls                             | スクリーンリーダー向けの編集バーの名前                                        |
| `editing`              | Editing                                      | 編集モードが始まったときに読み上げ                                            |
| `fitHeight`            | Fit to height                                | 画像の高さを合わせるボタン                                                    |
| `fitWidth`             | Fit to width                                 | 画像の幅を合わせるボタン                                                      |
| `flip`                 | Flip                                         | 「反転」ボタン                                                                |
| `keepEditing`          | Keep editing                                 | 変更を失わずに編集に戻るボタン                                                |
| `loadError`            | The image could not be loaded                | 画像を読み込めないときに表示                                                  |
| `loading`              | Loading image                                | 画像の読み込み中に表示                                                        |
| `perspective`          | Straighten                                   | 「傾き補正」ボタン                                                            |
| `perspectiveHint`      | Drag each corner to a corner of the document | 「傾き補正」での操作の説明                                                    |
| `processing`           | Applying changes                             | 適用の実行中に表示                                                            |
| `redo`                 | Redo                                         | 「やり直す」ボタン                                                            |
| `rotateLeft`           | Rotate left                                  | 編集バーの回転ボタン、および読み取り専用ビューアーの 2 つの回転ボタンの一方   |
| `rotateRight`          | Rotate right                                 | 読み取り専用ビューアーのもう一方の回転ボタン                                  |
| `threshold`            | Clean up                                     | 「クリーンアップ」ボタン                                                      |
| `thresholdLevel`       | Sensitivity 50%                              | パーセントの関数。感度のスライダーを動かしたあとに読み上げ                    |
| `thresholdSensitivity` | Sensitivity                                  | 感度のスライダーの名前                                                        |
| `toolbar`              | Image controls                               | スクリーンリーダー向けのツールバーの名前                                      |
| `undo`                 | Undo                                         | 「元に戻す」ボタン                                                            |
| `viewer`               | Image viewer                                 | スクリーンリーダー向けの、画像を表示する領域の名前                            |
| `zoomIn`               | Zoom in                                      | 「拡大」ボタン                                                                |
| `zoomLevel`            | Zoom 150%                                    | パーセントの関数。ツールバーかキーボードでズームしたあとに読み上げ            |
| `zoomOut`              | Zoom out                                     | 「縮小」ボタン                                                                |
