---
title: 상태
description: getState()가 반환하고 change 이벤트가 보내는 내용. 이미지 상태, 모드, 배율, 변경 사항, 적용할 것이 있는지 등과, 자체 컨트롤을 여기에 맞춰 동기화하는 방법입니다.
---

# 상태

상태는 뷰어의 스냅숏입니다. 이미지가 있는지, 모드, 배율, 열린 도구, 적용할 변경이 있는지를 나타냅니다. 상태를 얻는 방법은 두 가지이며, 둘 다 같은 [`PaperPicState`](./types#paperpicstate) 객체를 줍니다.

- [`getState()`](./methods#getstate)는 요청할 때마다 반환합니다.
- [`change`](./events#change) 이벤트는 사용자나 메서드가 상태를 바꿀 때마다 보냅니다.

## 자체 컨트롤 동기화 {#in-step}

`change`는 이미지를 알리지 않습니다. 불러온 이미지는 [`load`](./events#load)로, 실패한 불러오기나 적용은 [`error`](./events#error)로 옵니다. 직접 만든 ‘적용’ 버튼 같은 자체 컨트롤을 동기화하려면, 처음에 상태를 읽고, `change`마다 받아 두고, `load`와 `error`에서 다시 읽습니다.

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
    적용
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
        적용
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

Vue와 React에서는 컴포넌트가 마운트된 뒤에야 뷰어가 생깁니다. 그래서 상태는 `undefined`로 시작하고 첫 `load`나 `error`와 함께 옵니다. 그때까지는 적용할 것이 없습니다.

## 필드

| 필드          | 타입                                         | 설명                                                                                                                                                                   |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | 열린 도구(`'crop'`, `'adjust'` 등), 또는 `null`                                                                                                                        |
| `adjustments` | `{ brightness, contrast }`                   | 밝기와 대비(각각 -1부터 1까지). 흑백에서는 적용되지 않습니다. 조정이 열려 있는 동안에는 그 패널의 값                                                                   |
| `busy`        | `boolean`                                    | 적용이 진행 중인지                                                                                                                                                     |
| `canApply`    | `boolean`                                    | 적용할 변경이 있는지. 서로 상쇄되는 회전과 뒤집기는 변경으로 치지 않습니다                                                                                             |
| `canRedo`     | `boolean`                                    | 다시 실행할 변경이 있는지                                                                                                                                              |
| `canUndo`     | `boolean`                                    | 실행 취소할 변경이 있는지                                                                                                                                              |
| `finish`      | `{ mode, sensitivity }`                      | 정리의 마무리([`FinishMode`](./types#finishmode))와 0부터 1까지의 흑백 민감도. 정리가 열려 있는 동안에는 그 패널의 값                                                  |
| `fit`         | [`Fit \| null`](./types#fit)                 | 현재 맞추기 방식. 사용자가 직접 확대/축소하면 `null`                                                                                                                   |
| `hint`        | `string \| null`                             | 열린 도구가 사용자에게 요청하는 것. 내장 편집 바에 표시되는 그대로이며 예: ‘Drag the corners’, 없으면 `null`. `toolbar: false`에서는 직접 만든 인터페이스에 표시하세요 |
| `image`       | [`Size \| null`](./types#size)               | 원본 해상도에서 지금까지의 변경을 반영하되 `rotation`의 회전은 뺀 이미지의 픽셀 크기. 이미지가 없으면 `null`                                                           |
| `mode`        | `'view' \| 'edit'`                           | 사용자가 이미지를 보고 있는지, 편집하고 있는지                                                                                                                         |
| `rotation`    | [`Rotation`](./types#rotation)               | 화면 이미지가 `image`에서 시계 방향으로 회전한 각도                                                                                                                    |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `src`가 없으면 `'empty'`, 불러오는 동안 `'loading'`, 화면에 보이면 `'ready'`, 불러오지 못하면 `'error'`                                                                |
| `zoom`        | `number`                                     | 이미지 1픽셀당 화면 픽셀 수                                                                                                                                            |

`rotation`이 90이나 270이면, 화면 이미지와 적용 결과는 `image`의 너비와 높이가 서로 바뀝니다. [`maxOutputSize`](./options#maxoutputsize)로 결과가 더 작아질 수도 있습니다.
