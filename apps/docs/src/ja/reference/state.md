---
title: 状態
description: getState() が返し、change イベントが送る内容。画像の状態、モード、ズーム、変更、適用できるものがあるかなどと、独自の操作をそれに同期させる方法です。
---

# 状態

状態はビューアーのスナップショットです。画像があるか、モード、ズーム、開いているツール、適用できる変更があるかを表します。取得する方法は 2 つあり、どちらも同じ [`PaperPicState`](./types#paperpicstate) オブジェクトを返します。

- [`getState()`](./methods#getstate) は、呼び出したときに返します。
- [`change`](./events#change) イベントは、ユーザーかメソッドが状態を変えるたびに送ります。

## 独自の操作を同期する {#in-step}

`change` は画像については通知しません。読み込まれた画像は [`load`](./events#load) で、失敗した読み込みや適用は [`error`](./events#error) で届きます。独自の「適用」ボタンなど、自前の操作を同期するには、最初に状態を読み、`change` のたびに受け取り、`load` と `error` で読み直します。

:::tabs key:framework
== JavaScript

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const applyButton = document.querySelector<HTMLButtonElement>('#apply')!
const pic = new PaperPic(container, { src: '/receipt.jpg', toolbar: false })

function update({ canApply, busy }: PaperPicState) {
  applyButton.disabled = !canApply || busy
}

update(pic.getState())
pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
applyButton.addEventListener('click', () => pic.apply())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = pic.value?.instance?.getState()
}
</script>

<template>
  <button type="button" :disabled="!state || !state.canApply || state.busy" @click="pic?.instance?.apply()">
    適用
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      :toolbar="false"
      @change="next => (state = next)"
      @load="refresh"
      @error="refresh"
    />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()

  function refresh() {
    setState(picRef.current?.getState())
  }

  return (
    <>
      <button type="button" disabled={!state || !state.canApply || state.busy} onClick={() => picRef.current?.apply()}>
        適用
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

Vue と React では、ビューアーはコンポーネントがマウントされてから存在します。そのため状態は `undefined` から始まり、最初の `load` か `error` で届きます。それまでは適用するものはありません。

## フィールド

| フィールド    | 型                                           | 説明                                                                                                                                                                         |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | 開いているツール（`'crop'` や `'adjust'` など）、または `null`                                                                                                               |
| `adjustments` | `{ brightness, contrast }`                   | 明るさとコントラスト（それぞれ -1 から 1）。白黒の間は使われません。調整が開いている間は、そのパネルの値                                                                     |
| `busy`        | `boolean`                                    | 適用の実行中か                                                                                                                                                               |
| `canApply`    | `boolean`                                    | 適用できる変更があるか。打ち消し合う回転と反転は変更に数えません                                                                                                             |
| `canRedo`     | `boolean`                                    | やり直せる変更があるか                                                                                                                                                       |
| `canUndo`     | `boolean`                                    | 元に戻せる変更があるか                                                                                                                                                       |
| `finish`      | `{ mode, sensitivity }`                      | クリーンアップの仕上げ（[`FinishMode`](./types#finishmode)）と、0 から 1 の白黒の感度。クリーンアップが開いている間は、そのパネルの値                                        |
| `fit`         | [`Fit \| null`](./types#fit)                 | 現在のフィット。ユーザーが手動でズームすると `null`                                                                                                                          |
| `hint`        | `string \| null`                             | 開いているツールがユーザーに求めること。内蔵の編集バーの表示と同じで、たとえば「Drag the corners」。なければ `null`。`toolbar: false` では独自のインターフェースに表示します |
| `image`       | [`Size \| null`](./types#size)               | フル解像度で、これまでの変更を含み、`rotation` の回転を含まない画像のピクセルサイズ。画像がなければ `null`                                                                   |
| `mode`        | `'view' \| 'edit'`                           | ユーザーが画像を見ているか、編集しているか                                                                                                                                   |
| `redaction`   | `{ color }`                                  | 「塗りつぶし」の色。[`RedactColor`](./types#redactcolor) で、開いている間はパネルの色、それ以外は次の領域の色です                                                            |
| `rotation`    | [`Rotation`](./types#rotation)               | `image` に対する表示中の画像の回転角度（時計回り、度単位）                                                                                                                   |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `src` がなければ `'empty'`、読み込み中は `'loading'`、表示されると `'ready'`、読み込めなければ `'error'`                                                                     |
| `zoom`        | `number`                                     | 画像の 1 ピクセルあたりの画面のピクセル数                                                                                                                                    |

`rotation` が 90 か 270 のとき、表示中の画像と適用の結果は、`image` の幅と高さが入れ替わります。[`maxOutputSize`](./options#maxoutputsize) で結果が小さくなることもあります。
