---
title: 状态
description: getState() 返回和 change 事件发送的内容，例如图片状态、模式、缩放、修改以及是否有可应用的内容，以及如何让你自己的控件与它保持同步。
---

# 状态

状态是查看器的一份快照：是否有图片、模式、缩放、打开的工具以及是否有可应用的修改。获取它有两种方式，两者给出同一个 [`PaperPicState`](./types#paperpicstate) 对象：

- [`getState()`](./methods#getstate) 在你需要时返回它。
- [`change`](./events#change) 事件在用户或方法每次改变它时发送它。

## 让你的控件保持同步 {#in-step}

`change` 不报告图片。加载好的图片通过 [`load`](./events#load) 到来，加载或应用失败通过 [`error`](./events#error) 到来。要让你自己的控件保持同步，例如一个“应用”按钮，先在开始时读取状态，再从每次 `change` 中取得它，并在 `load` 和 `error` 时重新读取：

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
    应用
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
        应用
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

在 Vue 和 React 中，查看器在组件挂载之后才存在，所以状态起初是 `undefined`，随第一次 `load` 或 `error` 到来。在那之前没有可应用的内容。

## 字段

| 字段          | 类型                                         | 说明                                                                                                                                        |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | 打开的工具，例如 `'crop'` 或 `'adjust'`，或 `null`                                                                                          |
| `adjustments` | `{ brightness, contrast }`                   | 亮度和对比度，各自从 -1 到 1。黑白模式下不生效。调整打开时，是它面板上的值                                                                  |
| `busy`        | `boolean`                                    | 应用是否正在进行                                                                                                                            |
| `canApply`    | `boolean`                                    | 是否有可应用的修改。相互抵消的旋转和翻转不算修改                                                                                            |
| `canRedo`     | `boolean`                                    | 是否有可重做的修改                                                                                                                          |
| `canUndo`     | `boolean`                                    | 是否有可撤销的修改                                                                                                                          |
| `finish`      | `{ mode, sensitivity }`                      | 清理的效果，即 [`FinishMode`](./types#finishmode)，以及 0 到 1 的黑白灵敏度。清理打开时，是它面板上的值                                     |
| `fit`         | [`Fit \| null`](./types#fit)                 | 当前的适合方式，用户手动缩放后为 `null`                                                                                                     |
| `hint`        | `string \| null`                             | 打开的工具要求用户做的事，与内置编辑栏显示的一致，例如“Drag the corners”，否则为 `null`。使用 `toolbar: false` 时，请在你自己的界面中显示它 |
| `image`       | [`Size \| null`](./types#size)               | 完整分辨率下、包含已做修改但不含 `rotation` 旋转的图片像素尺寸，没有图片时为 `null`                                                         |
| `mode`        | `'view' \| 'edit'`                           | 用户是在查看还是在编辑图片                                                                                                                  |
| `rotation`    | [`Rotation`](./types#rotation)               | 显示的图片相对于 `image` 顺时针旋转的角度                                                                                                   |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | 没有 `src` 时为 `'empty'`，加载中为 `'loading'`，显示后为 `'ready'`，无法加载时为 `'error'`                                                 |
| `zoom`        | `number`                                     | 每个图片像素对应的屏幕像素数                                                                                                                |

当 `rotation` 为 90 或 270 时，显示的图片和应用的结果会交换 `image` 的宽度和高度。[`maxOutputSize`](./options#maxoutputsize) 可能让结果更小。
