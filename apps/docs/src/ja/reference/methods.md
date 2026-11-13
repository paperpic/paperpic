---
title: メソッド
description: PaperPic クラスのすべてのメソッド。ズーム、フィット、回転、編集、適用、ダウンロード、再読み込みなど、ビューアーをコードから操作します。
---

# メソッド

メソッドを使うと、コードからビューアーを操作できます。たとえば [`toolbar: false`](./options#toolbar) にして独自のボタンから呼び出します。Vue と React では、コンポーネントの ref からビューアーを取得します。[Vue](./vue) と [React](./react) を参照してください。

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## 作成と破棄

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

`container` の中にビューアーを作成し、コンテナーいっぱいに広げます。コンテナーに高さを指定してください。指定しないと最小の高さのままです。`options` に渡せるものは[オプション](./options)にあります。

`container` が要素でない場合は `TypeError` を投げます。要素ができてから、たとえばマウント時にビューアーを作成してください。

### `destroy()`

```ts
function destroy(): void
```

ビューアーを取り除き、worker や画像のメモリなど、保持しているものをすべて解放します。2 回呼び出しても問題ありません。

## オプションと状態

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

渡したオプションを変更し、ほかはそのまま残します。`undefined` を渡すとデフォルト値に戻ります。`change` は発生しないため、双方向バインディングがループしません。

### `getState()`

```ts
function getState(): PaperPicState
```

ズーム、モード、適用できる変更があるかなど、ビューアーの表示内容を返します。各フィールドは[状態](./state)で説明しています。

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

イベントを購読し、購読をやめる関数を返します。各イベントは[イベント](./events)で説明しています。

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

## 表示

### `zoomIn()`

```ts
function zoomIn(): void
```

ビューアーの中心を基準に 1 段階拡大します。

### `zoomOut()`

```ts
function zoomOut(): void
```

ビューアーの中心を基準に 1 段階縮小します。

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

ズームを設定します。`1` で画像の 1 ピクセルを画面の 1 ピクセルで表示します。[`point`](./types#viewpoint) の位置は動きません。`point` はビューアーの左上からの CSS ピクセルで指定し、デフォルトはビューアーの中心です。

ズームの範囲は、画像全体を収める倍率（それが `1` より大きい場合は `1`）から `8` までです。範囲外の値は範囲内に収められます。

### `fit()`

```ts
function fit(fit: Fit): void
```

画像全体、幅、または高さをビューアーに合わせます。`fit` は [`Fit`](./types#fit) 型で、`'image'`、`'width'`、`'height'` のいずれかです。

## 編集

### `edit()`

```ts
function edit(): void
```

編集を始めます。画像の準備ができていない場合や [`editable`](./options#editable) が `false` の場合は何もしません。

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

画像を 90 度回転します。デフォルトの `1` で時計回り、`-1` で反時計回りです。編集中は、[`apply()`](#apply) で確定する変更になります。読み取り専用のビューアーでは表示だけが変わります。それ以外の場合は何もしません。

### `flip()`

```ts
function flip(): void
```

表示されている向きのまま、画像を左右に反転します。90 度回転したあとでも左右に反転します。上下を逆にするには、反転してから 2 回回転します。これは変更の一つで、編集モード以外やツールが開いている間は何もしません。

### `openTool()`

```ts
function openTool(id: ToolId): void
```

パネルを持つツールを開きます。`'crop'` で切り抜き、`'perspective'` で傾き補正、`'adjust'` で調整、`'threshold'` でクリーンアップが開き、クリーンアップは開くとオンになります。ツールは [`confirmTool()`](#confirmtool) か [`cancelTool()`](#canceltool) まで開いたままで、その間はほかの変更、元に戻す、やり直す、適用は何もしません。編集モード以外、ほかのツールが開いている間、クリーンアップがオンのときの調整、プレビューの準備中の切り抜きと傾き補正では何もしません。

### `confirmTool()`

```ts
function confirmTool(): void
```

開いているツールを閉じ、そこで選んだ内容を変更に加えます。`Enter` と同じです。切り抜きと傾き補正の選択範囲、または調整とクリーンアップの設定が 1 つの変更になります。

### `cancelTool()`

```ts
function cancelTool(): void
```

開いているツールを閉じ、その変更を破棄します。`Esc` と同じです。

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

クリーンアップのオンとオフを切り替えるか、感度を 0 から 1 で変更します。クリーンアップは常にほかの変更のあとに適用されます。クリーンアップが開いている間はその表示を変え、[`confirmTool()`](#confirmtool) がそれを 1 つの変更として残します。編集モード以外やほかのツールが開いている間は何もしません。

`sensitivity` が 0 から 1 の範囲外なら `RangeError` を投げます。

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

明るさまたはコントラストを、それぞれ -1 から 1 で変更します。0 は画像をそのままにします。ほかの変更のあとに適用されます。調整が開いている間はその表示を変え、[`confirmTool()`](#confirmtool) がそれを 1 つの変更として残します。編集モード以外、ほかのツールが開いている間、クリーンアップがオンの間は何もしません。クリーンアップした文書には独自の階調があるためです。

値が -1 から 1 の範囲外なら `RangeError` を投げます。

### `undo()`

```ts
function undo(): void
```

最後の変更を元に戻します。

### `redo()`

```ts
function redo(): void
```

最後に元に戻した変更をやり直します。

### `apply()`

```ts
function apply(): Promise<void>
```

変更をフル解像度、または [`maxOutputSize`](./options#maxoutputsize) で適用します。結果が表示中の画像になり、履歴が空になり、ビューアーは表示モードに戻り、[`apply`](./events#apply) イベントが結果を渡します。適用は中断できず、実行中は操作がロックされます。

失敗した場合は [`error`](./events#error) イベントで通知され、編集は開いたままです。

### `cancel()`

```ts
function cancel(): void
```

変更を破棄して表示モードに戻ります。確認はしません。確認するのは組み込みの「キャンセル」ボタンと `Esc` です。

## 画像

### `download()`

```ts
function download(): void
```

表示中の画像をファイルに保存します。保存されるのは最後の適用の結果、なければ元画像です。ボタンを表示するだけの [`download`](./options#download) オプションがなくても動きます。[`download`](./events#download) イベントが先に発生し、保存を止めることができます。編集中は、変更がまだ適用されていないため何もしません。

### `reload()`

```ts
function reload(): void
```

現在の [`src`](./options#src) を読み込み直します。適用のあとに元画像に戻せます。
