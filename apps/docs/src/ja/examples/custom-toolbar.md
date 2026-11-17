---
title: 独自のツールバー
description: PaperPic の組み込みツールバーを隠し、ビューアーの状態に合わせた自前のボタンで操作する完全な例。
---

# 独自のツールバー

ビューアーの操作をインターフェースのほかの部分と合わせたいときは、`toolbar: false` で組み込みの操作を隠し、自前のボタンから[メソッド](../reference/methods)を呼び出します。この例では、ズーム、「傾き補正」、「元に戻す」、「適用」を用意し、各ボタンは動作できるときだけ有効にします。

[`change`](../reference/events#change) イベントは、自前のボタンが始めたものも含めて、操作のたびに[状態](../reference/state)を渡します。`load` と `error` は、画像が届いたときと適用に失敗したときを知らせます。

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">拡大</button>
  <button type="button" data-action="zoomOut">縮小</button>
  <button type="button" data-action="edit">編集</button>
  <button type="button" data-action="straighten">傾き補正</button>
  <button type="button" data-action="confirmTool">完了</button>
  <button type="button" data-action="cancelTool">このツールをキャンセル</button>
  <button type="button" data-action="undo">元に戻す</button>
  <button type="button" data-action="cancel">キャンセル</button>
  <button type="button" data-action="apply">適用</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'レシート',
  toolbar: false,
})

const actions: Record<string, () => void> = {
  zoomIn: () => pic.zoomIn(),
  zoomOut: () => pic.zoomOut(),
  edit: () => pic.edit(),
  straighten: () => pic.openTool('perspective'),
  confirmTool: () => pic.confirmTool(),
  cancelTool: () => pic.cancelTool(),
  undo: () => pic.undo(),
  cancel: () => pic.cancel(),
  apply: () => pic.apply(),
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]')
for (const button of buttons) {
  button.addEventListener('click', () => actions[button.dataset.action!]!())
}

function update({ status, mode, activeTool, canUndo, canApply, busy }: PaperPicState) {
  const editing = mode === 'edit'
  const visible: Record<string, boolean> = {
    zoomIn: true,
    zoomOut: true,
    edit: !editing,
    straighten: editing && !activeTool,
    confirmTool: Boolean(activeTool),
    cancelTool: Boolean(activeTool),
    undo: editing && !activeTool,
    cancel: editing && !activeTool,
    apply: editing && !activeTool,
  }
  for (const button of buttons) {
    const action = button.dataset.action!
    button.hidden = !visible[action]
  }
  document.querySelector<HTMLButtonElement>('[data-action="edit"]')!.disabled = status !== 'ready'
  document.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled = !canUndo || busy
  document.querySelector<HTMLButtonElement>('[data-action="apply"]')!.disabled = !canApply || busy
}

pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
update(pic.getState())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { computed, shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef<InstanceType<typeof PaperPic>>('pic')
const viewer = computed(() => pic.value?.instance)
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = viewer.value?.getState()
}
</script>

<template>
  <div v-if="state">
    <button type="button" @click="viewer?.zoomIn()">
      拡大
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      縮小
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        編集
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <button type="button" @click="viewer?.confirmTool()">
        完了
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        このツールをキャンセル
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        傾き補正
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        元に戻す
      </button>
      <button type="button" @click="viewer?.cancel()">
        キャンセル
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        適用
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="レシート"
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

  const viewer = () => picRef.current!

  return (
    <>
      {state && (
        <div>
          <button type="button" onClick={() => viewer().zoomIn()}>拡大</button>
          <button type="button" onClick={() => viewer().zoomOut()}>縮小</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>編集</button>
          )}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().confirmTool()}>完了</button>
              <button type="button" onClick={() => viewer().cancelTool()}>このツールをキャンセル</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>傾き補正</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>元に戻す</button>
              <button type="button" onClick={() => viewer().cancel()}>キャンセル</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>適用</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="レシート"
          toolbar={false}
          onChange={setState}
          onLoad={refresh}
          onError={refresh}
        />
      </div>
    </>
  )
}
```

:::

## 自前のスライダー {#slider}

クリーンアップ用の自前のスライダーでは、先にツールを開きます。そのあとは動かすたびに `setThreshold()` を呼ぶと、クリーンアップの表示が変わり、`confirmTool()` で最後の値が 1 つの編集として残ります。この例では完了で結果も適用し、キャンセルで編集モードを抜けるので、これらのコントロールだけで操作が完結します。

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">クリーンアップ</button>
<div id="ruler" hidden>
  <label>
    感度
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">完了</button>
  <button id="cancel" type="button">キャンセル</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'レシート',
  toolbar: false,
})
const slider = document.querySelector<HTMLInputElement>('#sensitivity')!

document.querySelector('#clean-up')!.addEventListener('click', () => {
  pic.edit()
  pic.openTool('threshold')
})
slider.addEventListener('input', () => pic.setThreshold({ sensitivity: slider.valueAsNumber }))
document.querySelector('#done')!.addEventListener('click', () => {
  pic.confirmTool()
  pic.apply()
})
document.querySelector('#cancel')!.addEventListener('click', () => {
  pic.cancelTool()
  pic.cancel()
})

pic.on('change', ({ activeTool, threshold }) => {
  const open = activeTool === 'threshold'
  document.querySelector<HTMLElement>('#ruler')!.hidden = !open
  document.querySelector<HTMLElement>('#clean-up')!.hidden = open
  slider.value = String(threshold.sensitivity)
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { computed, shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef<InstanceType<typeof PaperPic>>('pic')
const viewer = computed(() => pic.value?.instance)
const state = shallowRef<PaperPicState>()

function open() {
  viewer.value?.edit()
  viewer.value?.openTool('threshold')
}

function slide(event: Event) {
  viewer.value?.setThreshold({ sensitivity: (event.target as HTMLInputElement).valueAsNumber })
}

function done() {
  viewer.value?.confirmTool()
  viewer.value?.apply()
}

function cancel() {
  viewer.value?.cancelTool()
  viewer.value?.cancel()
}
</script>

<template>
  <div v-if="state?.activeTool === 'threshold'">
    <label>
      感度
      <input type="range" min="0" max="1" step="0.05" :value="state.threshold.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      完了
    </button>
    <button type="button" @click="cancel">
      キャンセル
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    クリーンアップ
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="レシート"
      :toolbar="false"
      @change="next => (state = next)"
      @load="state = viewer?.getState()"
      @error="state = viewer?.getState()"
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

export function CleanUpRuler() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()
  const viewer = () => picRef.current!

  function open() {
    viewer().edit()
    viewer().openTool('threshold')
  }

  function done() {
    viewer().confirmTool()
    viewer().apply()
  }

  function cancel() {
    viewer().cancelTool()
    viewer().cancel()
  }

  return (
    <>
      {state?.activeTool === 'threshold'
        ? (
            <div>
              <label>
                感度
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.threshold.sensitivity}
                  onChange={event => viewer().setThreshold({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>完了</button>
              <button type="button" onClick={cancel}>キャンセル</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>クリーンアップ</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="レシート"
          toolbar={false}
          onChange={setState}
          onLoad={() => setState(viewer().getState())}
          onError={() => setState(viewer().getState())}
        />
      </div>
    </>
  )
}
```

:::

## 補足

- `toolbar: false` では組み込みの編集バーも隠れるため、「切り抜き」と「傾き補正」はハンドルを表示しますが、「完了」ボタンはありません。あなたのインターフェースから、`Enter` と同じく [`confirmTool()`](../reference/methods#confirmtool) で確定してください。変更せずに閉じるには、`Esc` と同じように [`cancelTool()`](../reference/methods#canceltool) を呼び出します。
- 独自のスライダーから [`setThreshold()`](../reference/methods#setthreshold) と [`setAdjustments()`](../reference/methods#setadjustments) を直接呼べます。呼ぶたびに変更が 1 つ加わります。ドラッグ全体を 1 つの変更にするには、先に [`openTool()`](../reference/methods#opentool) でツールを開いてください。すると同じメソッドがツールの表示を変え、`confirmTool()` がそれを残します。
- [`cancel()`](../reference/methods#cancel) は変更を破棄する前に確認しません。`canApply` が true のときなど、変更がある場合はユーザーに確認してください。
- ビューアーにフォーカスがあれば、キーボードショートカットは引き続き使えます。[アクセシビリティ](../guide/accessibility)を参照してください。
