---
title: 自定义工具栏
description: 一个完整示例：隐藏 PaperPic 的内置工具栏，用你自己的按钮控制查看器，并让按钮与查看器的状态保持同步。
---

# 自定义工具栏

当查看器的控件需要与界面的其余部分一致时，用 `toolbar: false` 隐藏内置控件，并从你自己的按钮调用[方法](../reference/methods)。这个示例提供缩放、“矫正”、“撤销”和“应用”，并且只在按钮能起作用时才启用它。

[`change`](../reference/events#change) 事件在每次操作之后携带[状态](../reference/state)，包括由你的按钮发起的操作。`load` 和 `error` 报告图片到达或应用失败的时刻。

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">放大</button>
  <button type="button" data-action="zoomOut">缩小</button>
  <button type="button" data-action="edit">编辑</button>
  <button type="button" data-action="straighten">矫正</button>
  <button type="button" data-action="confirmTool">完成</button>
  <button type="button" data-action="undo">撤销</button>
  <button type="button" data-action="cancel">取消</button>
  <button type="button" data-action="apply">应用</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: '一张收据',
  toolbar: false,
})

const actions: Record<string, () => void> = {
  zoomIn: () => pic.zoomIn(),
  zoomOut: () => pic.zoomOut(),
  edit: () => pic.edit(),
  straighten: () => pic.openTool('perspective'),
  confirmTool: () => pic.confirmTool(),
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
      放大
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      缩小
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        编辑
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <button type="button" @click="viewer?.confirmTool()">
        完成
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        矫正
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        撤销
      </button>
      <button type="button" @click="viewer?.cancel()">
        取消
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        应用
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="一张收据"
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
          <button type="button" onClick={() => viewer().zoomIn()}>放大</button>
          <button type="button" onClick={() => viewer().zoomOut()}>缩小</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>编辑</button>
          )}
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>完成</button>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>矫正</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>撤销</button>
              <button type="button" onClick={() => viewer().cancel()}>取消</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>应用</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="一张收据"
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

## 说明

- 设置 `toolbar: false` 时内置编辑栏也会隐藏，因此“裁剪”和“矫正”会显示手柄，但没有“完成”按钮。你的界面用 [`confirmTool()`](../reference/methods#confirmtool) 确认它们，与 `Enter` 相同。
- 你自己的滑块可以直接调用 [`setThreshold()`](../reference/methods#setthreshold) 和 [`setAdjustments()`](../reference/methods#setadjustments)，每次调用都会添加一项修改。若要让整次拖动只留下一项修改，请先用 [`openTool()`](../reference/methods#opentool) 打开工具：这样同样的方法会改变工具显示的内容，`confirmTool()` 再把它保留下来。
- [`cancel()`](../reference/methods#cancel) 在放弃修改前不会询问。如果有修改，请先询问用户，例如在 `canApply` 为 true 时。
- 焦点在查看器上时，键盘快捷键依然有效。参见[无障碍](../guide/accessibility)。
