---
title: メソッド
description: PaperPic クラスのすべてのメソッド。ズーム、フィット、回転、編集、適用、ダウンロード、再読み込みなど、ビューアーをコードから操作します。
---

# メソッド

メソッドを使うと、コードからビューアーを操作できます。たとえば [`toolbar: false`](./options#toolbar) にして独自のボタンから呼び出します。core では、作成した `PaperPic` に対して呼び出します。Vue ではコンポーネントがビューアーを `instance` として公開し、React では `ref` が受け取ります。どちらもコンポーネントがマウントされるまでは `null` です。

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    拡大
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>拡大</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

Vue と React では、コンポーネントがビューアーを作成・破棄し、オプションを props として、イベントを独自のイベントとして受け取ります。そのため、そこでは [`new PaperPic()`](#new-paperpic)、[`destroy()`](#destroy)、[`setOptions()`](#setoptions)、[`on()`](#on) を呼び出さないでください。

## 作成と破棄

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

`container` の中にビューアーを作成し、コンテナーいっぱいに広げます。コンテナーに高さを指定してください。指定しないと最小の高さのままです。`options` に渡せるものは[オプション](./options)にあります。

`container` が要素でない場合は `TypeError` を投げます。要素ができてから、たとえばマウント時にビューアーを作成してください。オプションが範囲外の場合は `RangeError` を投げます。

core のみ: Vue と React のコンポーネントは、マウント時にビューアーを作成します。

### `destroy()`

```ts
function destroy(): void
```

ビューアーを取り除き、worker や画像のメモリなど、保持しているものをすべて解放します。2 回呼び出しても問題ありません。

core のみ: Vue と React のコンポーネントは、アンマウント時にこれを呼び出します。コンポーネントのビューアーに対して呼ぶと、コンポーネントが空になります。

## オプションと状態

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

渡したオプションを変更し、ほかはそのまま残します。`undefined` を渡すとデフォルト値に戻ります。`change` は発生しないため、双方向バインディングがループしません。オプションが範囲外の場合は `RangeError` を投げ、どのオプションも変更しません。

Vue と React では、代わりに props を変更してください。いずれかの prop が次に変わるとすべてのオプションが再送されるため、`setOptions()` で行った変更は元に戻ります。

### `getState()`

```ts
function getState(): PaperPicState
```

ズーム、モード、適用できる変更があるかなど、ビューアーの現在の状態を返します。尋ねずに変更のたびに知るには、[`change`](./events#change) を受け取ります。各フィールドと 2 つの組み合わせ方は[状態](./state)で説明しています。

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

イベントを購読し、購読をやめる関数を返します。各イベントは[イベント](./events)で説明しています。

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

Vue と React では、代わりにコンポーネントのイベント（`@apply` や `onApply` など）を受け取ってください。

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

`zoom` が `NaN` の場合や、`point` の座標が有限の数でない場合は `RangeError` を投げ、ズームは変わりません。

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

画像を 90 度回転します。デフォルトの `1` で時計回り、`-1` で反時計回りです。編集中は、[`apply()`](#apply) で確定する変更を加えます。ツールが開いている間や適用中は何もしません。読み取り専用のビューアーでは表示だけが変わります。それ以外の場合は何もしません。

### `flip()`

```ts
function flip(): void
```

表示されている向きのまま、画像を左右に反転します。90 度回転したあとでも左右に反転します。上下に反転するには、反転してから 2 回回転します。これは変更の一つで、編集モード以外やツールが開いている間は何もしません。

### `openTool()`

```ts
function openTool(id: ToolId): void
```

パネルを持つツールを開きます。切り抜き（`'crop'`）、傾き補正（`'perspective'`）、調整（`'adjust'`）、クリーンアップ（`'finish'`）のどれかで、クリーンアップは仕上げがオリジナルのとき、開くと白黒を選びます。ツールは [`confirmTool()`](#confirmtool) か [`cancelTool()`](#canceltool) まで開いたままです。その間はほかの変更を始められず、元に戻す、やり直す、適用は何もしません。編集モード以外、ほかのツールが開いている間、白黒のときの調整、プレビューの準備中の切り抜きと傾き補正では何もしません。傾き補正は開くときに文書を探し、[見つかれば](../guide/tools/straighten#finding-the-document)その上に角を置きます。

「塗りつぶし」(`'redact'`) も「切り抜き」と同じく角付きで開きます。

### `confirmTool()`

```ts
function confirmTool(): void
```

開いているツールを閉じ、そこで選んだ内容を変更に加えます。`Enter` と同じです。切り抜きと傾き補正の選択範囲、または調整とクリーンアップの設定が 1 つの変更になります。「傾き補正」では、ビューアーが文書を見つけるか、角が動くまで何もしません。いつ確定できるかは[状態](./state)の `canConfirm` が示します。

### `cancelTool()`

```ts
function cancelTool(): void
```

開いているツールを閉じ、その変更を破棄します。`Esc` と同じです。

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

[クリーンアップ](../guide/tools/clean-up)の仕上げを選びます。`'original'`、`'gray'`、白黒の `'mono'` のどれかです。白黒の感度も 0 から 1 で変更します。仕上げは常にほかの変更のあとに適用されます。クリーンアップが開いている間はその表示を変え、[`confirmTool()`](#confirmtool) がそれを 1 つの変更として残します。編集モード以外やほかのツールが開いている間は何もしません。

`mode` が [`FinishMode`](./types#finishmode) でないか、`sensitivity` が 0 から 1 の範囲外なら `RangeError` を投げます。

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

明るさまたはコントラストを、それぞれ -1 から 1 で変更します。0 は画像をそのままにします。ほかの変更のあと、グレーの前に適用されます。調整が開いている間はその表示を変え、[`confirmTool()`](#confirmtool) がそれを 1 つの変更として残します。編集モード以外、ほかのツールが開いている間、白黒の間は何もしません。白黒は各ピクセルを周囲と比べるので、明るさとコントラストは結果をほとんど変えないためです。

値が -1 から 1 の範囲外なら `RangeError` を投げます。

### `setPaper()`

```ts
function setPaper(setting: { size?: PaperSize }): void
```

[傾き補正](../guide/tools/straighten#paper-size)の結果に縦横比を与える用紙を選びます。`'a4'`、`'letter'`、身分証や銀行カードの `'card'`、または既定の `'auto'` です。`'auto'` は [`aspectRatio`](./options#aspectratio) を使い、なければ推定します。縦向きか横向きかは角の位置に従います。「傾き補正」が開いていないときは何もせず、開くたびに `'auto'` から始まります。

`size` が [`PaperSize`](./types#papersize) でなければ `RangeError` を投げます。

### `setRedaction()`

```ts
function setRedaction(setting: { color?: RedactColor }): void
```

[塗りつぶし](../guide/tools/redact)で覆う色を選びます。既定の `'black'` か `'white'` です。「塗りつぶし」が開いている間は表示中の領域を変え、[`confirmTool()`](#confirmtool) がそれを残します。それ以外のときは次の領域の色になります。どのモードでも動作します。

`color` が [`RedactColor`](./types#redactcolor) でなければ `RangeError` を投げます。

### `undo()`

```ts
function undo(): void
```

最後の変更を元に戻します。編集モード以外、ツールが開いている間、適用中は何もしません。

### `redo()`

```ts
function redo(): void
```

最後に元に戻した変更をやり直します。編集モード以外、ツールが開いている間、適用中は何もしません。

### `apply()`

```ts
function apply(): Promise<void>
```

変更をフル解像度、または [`maxOutputSize`](./options#maxoutputsize) で適用します。結果が表示中の画像になり、履歴が空になり、ビューアーは表示モードに戻り、[`apply`](./events#apply) イベントが結果を渡します。適用は中断できず、実行中は操作がロックされます。編集モード以外、ツールが開いている間、適用するものがないときは何もしません。

失敗した場合は [`error`](./events#error) イベントで通知され、編集は開いたままです。Promise は適用が終わると、失敗した場合も解決されます。`try/catch` では検出できないので、`error` を受け取ってください。

### `cancel()`

```ts
function cancel(): void
```

変更を破棄して表示モードに戻ります。確認はしません。確認するのは組み込みの「キャンセル」ボタンと `Esc` です。適用中は何もしません。

## 画像

### `download()`

```ts
function download(): void
```

表示中の画像をファイルに保存します。保存されるのは最後の適用の結果、なければ元画像です。ボタンを表示するだけの [`download`](./options#download) オプションがなくても動きます。[`download`](./events#download) イベントが先に発生し、保存を止めることができます。編集中は、変更がまだ適用されていないため何もしません。最初の適用より前は、別のオリジンの `src` はブラウザーで開かれます。[結果の保存](../guide/saving#download)を参照してください。

### `reload()`

```ts
function reload(): void
```

現在の [`src`](./options#src) を読み込み直します。適用のあとに元画像に戻せます。編集中は変更を破棄します。`src` がなければ何もしません。
