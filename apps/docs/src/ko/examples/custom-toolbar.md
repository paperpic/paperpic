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
  <button type="button" data-action="undo">실행 취소</button>
  <button type="button" data-action="cancel">취소</button>
  <button type="button" data-action="apply">적용</button>
</div>
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
      <button type="button" @click="viewer?.confirmTool()">
        완료
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
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>완료</button>
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

## 참고

- `toolbar: false`에서는 기본 편집 바도 숨겨지므로, ‘자르기’와 ‘기울기 보정’은 핸들은 보여 주지만 ‘완료’ 버튼은 없습니다. 여러분의 인터페이스에서 `Enter`처럼 [`confirmTool()`](../reference/methods#confirmtool)로 확정하세요.
- 여러분의 슬라이더는 [`setThreshold()`](../reference/methods#setthreshold)와 [`setAdjustments()`](../reference/methods#setadjustments)를 직접 호출할 수 있으며, 호출할 때마다 변경이 하나 더해집니다. 끌기 전체를 변경 하나로 남기려면 먼저 [`openTool()`](../reference/methods#opentool)로 도구를 여세요. 그러면 같은 메서드가 도구에 보이는 내용을 바꾸고, `confirmTool()`이 이를 남깁니다.
- [`cancel()`](../reference/methods#cancel)은 변경을 버리기 전에 묻지 않습니다. `canApply`가 true일 때처럼 변경이 있으면 사용자에게 먼저 물어보세요.
- 뷰어에 포커스가 있으면 키보드 단축키는 계속 동작합니다. [접근성](../guide/accessibility)을 참고하세요.
