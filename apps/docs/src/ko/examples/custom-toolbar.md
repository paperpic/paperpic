---
title: 직접 만든 도구 모음
description: PaperPic의 기본 도구 모음을 숨기고, 뷰어 상태에 맞춰지는 직접 만든 버튼으로 뷰어를 조작하는 완전한 예제.
---

# 직접 만든 도구 모음

뷰어의 컨트롤이 인터페이스의 나머지와 어울려야 할 때는 `toolbar: false`로 기본 컨트롤을 숨기고, 직접 만든 버튼에서 [메서드](../reference/methods)를 호출하세요. 이 예제는 확대/축소, ‘기울기 보정’, ‘실행 취소’, ‘적용’을 제공하며, 각 버튼은 동작할 수 있을 때만 활성화합니다.

[`change`](../reference/events#change) 이벤트는 직접 만든 버튼이 시작한 동작을 포함해, 동작마다 [상태](../reference/state)를 전달합니다. `load`와 `error`는 이미지가 도착한 때와 적용이 실패한 때를 알립니다.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">확대</button>
  <button type="button" data-action="zoomOut">축소</button>
  <button type="button" data-action="edit">편집</button>
  <button type="button" data-action="straighten">기울기 보정</button>
  <button type="button" data-action="confirmTool">완료</button>
  <button type="button" data-action="cancelTool">이 도구 취소</button>
  <button type="button" data-action="undo">실행 취소</button>
  <button type="button" data-action="cancel">취소</button>
  <button type="button" data-action="apply">적용</button>
</div>
<p id="hint"></p>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: '영수증',
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

function update({ status, mode, activeTool, hint, canUndo, canApply, canConfirm, busy }: PaperPicState) {
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
  document.querySelector<HTMLButtonElement>('[data-action="confirmTool"]')!.disabled = !canConfirm
  document.querySelector<HTMLButtonElement>('[data-action="apply"]')!.disabled = !canApply || busy
  document.querySelector('#hint')!.textContent = hint ?? ''
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
      확대
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      축소
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        편집
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <p v-if="state.hint">
        {{ state.hint }}
      </p>
      <button type="button" :disabled="!state.canConfirm" @click="viewer?.confirmTool()">
        완료
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        이 도구 취소
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        기울기 보정
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        실행 취소
      </button>
      <button type="button" @click="viewer?.cancel()">
        취소
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        적용
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="영수증"
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
          <button type="button" onClick={() => viewer().zoomIn()}>확대</button>
          <button type="button" onClick={() => viewer().zoomOut()}>축소</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>편집</button>
          )}
          {state.hint && <p>{state.hint}</p>}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" disabled={!state.canConfirm} onClick={() => viewer().confirmTool()}>완료</button>
              <button type="button" onClick={() => viewer().cancelTool()}>이 도구 취소</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>기울기 보정</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>실행 취소</button>
              <button type="button" onClick={() => viewer().cancel()}>취소</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>적용</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="영수증"
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

## 직접 만든 슬라이더 {#slider}

정리용 슬라이더를 직접 만들 때는 먼저 도구를 엽니다. 그다음 움직일 때마다 `setFinish()`를 호출하면 정리가 보여 주는 내용이 바뀌고, `confirmTool()`이 마지막 값을 하나의 편집으로 남깁니다. 여기서는 완료가 결과도 적용하고 취소가 편집 모드를 끝내므로, 이 컨트롤만으로 인터페이스가 완성됩니다.

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">정리</button>
<div id="ruler" hidden>
  <label>
    민감도
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">완료</button>
  <button id="cancel" type="button">취소</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: '영수증',
  toolbar: false,
})
const slider = document.querySelector<HTMLInputElement>('#sensitivity')!

document.querySelector('#clean-up')!.addEventListener('click', () => {
  pic.edit()
  pic.openTool('finish')
})
slider.addEventListener('input', () => pic.setFinish({ sensitivity: slider.valueAsNumber }))
document.querySelector('#done')!.addEventListener('click', () => {
  pic.confirmTool()
  pic.apply()
})
document.querySelector('#cancel')!.addEventListener('click', () => {
  pic.cancelTool()
  pic.cancel()
})

pic.on('change', ({ activeTool, finish }) => {
  const open = activeTool === 'finish'
  document.querySelector<HTMLElement>('#ruler')!.hidden = !open
  document.querySelector<HTMLElement>('#clean-up')!.hidden = open
  slider.value = String(finish.sensitivity)
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
  viewer.value?.openTool('finish')
}

function slide(event: Event) {
  viewer.value?.setFinish({ sensitivity: (event.target as HTMLInputElement).valueAsNumber })
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
  <div v-if="state?.activeTool === 'finish'">
    <label>
      민감도
      <input type="range" min="0" max="1" step="0.05" :value="state.finish.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      완료
    </button>
    <button type="button" @click="cancel">
      취소
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    정리
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="영수증"
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
    viewer().openTool('finish')
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
      {state?.activeTool === 'finish'
        ? (
            <div>
              <label>
                민감도
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.finish.sensitivity}
                  onChange={event => viewer().setFinish({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>완료</button>
              <button type="button" onClick={cancel}>취소</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>정리</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="영수증"
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

## 참고

- `toolbar: false`에서는 기본 편집 바도 숨겨지므로, ‘자르기’와 ‘기울기 보정’은 핸들은 보여 주지만 ‘완료’ 버튼은 없습니다. 여러분의 인터페이스에서 `Enter`처럼 [`confirmTool()`](../reference/methods#confirmtool)로 확정하세요. 변경 없이 닫으려면 `Esc`처럼 [`cancelTool()`](../reference/methods#canceltool)을 호출하세요.
- ‘자르기’나 ‘기울기 보정’이 열려 있는 동안 상태의 `hint`는 내장 편집 바처럼 할 일을 알려 줍니다. 예: ‘Drag the corners’. `toolbar: false`에서는 달리 보여 주는 곳이 없으므로 표시하세요. 모서리를 누른 뒤처럼 새 힌트는 `change`로 옵니다.
- 상태의 `canConfirm`은 `confirmTool()`이 도구가 보여 주는 내용을 남길 수 있는지 알려 줍니다. ‘기울기 보정’은 사용자가 모서리를 움직일 때까지 기다리므로, 그때까지 여러분의 ‘완료’ 버튼을 비활성화하세요.
- 여러분의 슬라이더는 [`setFinish()`](../reference/methods#setfinish)와 [`setAdjustments()`](../reference/methods#setadjustments)를 직접 호출할 수 있으며, 호출할 때마다 변경이 하나 더해집니다. 끌기 전체를 변경 하나로 남기려면 먼저 [`openTool()`](../reference/methods#opentool)로 도구를 여세요. 그러면 같은 메서드가 도구에 보이는 내용을 바꾸고, `confirmTool()`이 이를 남깁니다.
- [`cancel()`](../reference/methods#cancel)은 변경을 버리기 전에 묻지 않습니다. `canApply`가 true일 때처럼 변경이 있으면 사용자에게 먼저 물어보세요.
- 뷰어에 포커스가 있으면 키보드 단축키는 계속 동작합니다. [접근성](../guide/accessibility)을 참고하세요.
