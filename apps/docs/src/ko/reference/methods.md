---
title: 메서드
description: PaperPic 클래스의 모든 메서드. 확대/축소, 맞추기, 회전, 편집, 적용, 다운로드, 다시 불러오기 등 코드에서 뷰어를 제어합니다.
---

# 메서드

메서드로 코드에서 뷰어를 제어합니다. 예를 들어 [`toolbar: false`](./options#toolbar)로 두고 직접 만든 버튼에서 호출합니다. core에서는 직접 만든 `PaperPic`에서 호출합니다. Vue에서는 컴포넌트가 뷰어를 `instance`로 노출하고, React에서는 `ref`가 받습니다. 둘 다 컴포넌트가 마운트되기 전에는 `null`입니다.

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
    확대
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
      <button type="button" onClick={() => picRef.current?.zoomIn()}>확대</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

Vue와 React에서는 컴포넌트가 뷰어를 만들고 없애며, 옵션은 props로, 이벤트는 자체 이벤트로 받습니다. 그래서 그곳에서는 [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions), [`on()`](#on)을 호출하지 마세요.

## 생성과 제거

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

`container` 안에 뷰어를 만들고 컨테이너를 가득 채웁니다. 컨테이너에 높이를 지정하세요. 지정하지 않으면 뷰어가 최소 높이로 남습니다. `options`에 전달할 수 있는 값은 [옵션](./options)에 있습니다.

`container`가 요소가 아니면 `TypeError`를 던집니다. 요소가 만들어진 뒤에, 예를 들어 마운트할 때 뷰어를 만드세요. 옵션이 범위를 벗어나면 `RangeError`를 던집니다.

core 전용: Vue와 React 컴포넌트는 마운트될 때 뷰어를 만듭니다.

### `destroy()`

```ts
function destroy(): void
```

뷰어를 제거하고 worker와 이미지 메모리 등 가진 것을 모두 해제합니다. 두 번 호출해도 문제없습니다.

core 전용: Vue와 React 컴포넌트는 언마운트될 때 이를 호출합니다. 컴포넌트의 뷰어에 호출하면 컴포넌트가 비게 됩니다.

## 옵션과 상태

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

전달한 옵션을 바꾸고 나머지는 그대로 둡니다. `undefined`를 전달하면 기본값으로 돌아갑니다. `change`를 발생시키지 않으므로 양방향 바인딩이 반복되지 않습니다. 옵션이 범위를 벗어나면 `RangeError`를 던지고, 어떤 옵션도 바꾸지 않습니다.

Vue와 React에서는 대신 props를 바꾸세요. 다음에 prop이 하나라도 바뀌면 모든 옵션을 다시 보내므로, `setOptions()`로 한 변경은 되돌려집니다.

### `getState()`

```ts
function getState(): PaperPicState
```

확대/축소 배율, 모드, 적용할 변경 사항이 있는지 등 뷰어의 현재 상태를 반환합니다. 묻지 않고 변경될 때마다 알고 싶다면 [`change`](./events#change)를 수신하세요. 각 필드와 둘을 함께 쓰는 방법은 [상태](./state)에서 설명합니다.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

이벤트를 구독하고, 구독을 끝내는 함수를 반환합니다. 각 이벤트는 [이벤트](./events)에서 설명합니다.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

Vue와 React에서는 대신 컴포넌트의 이벤트(`@apply`나 `onApply` 등)를 수신하세요.

## 보기

### `zoomIn()`

```ts
function zoomIn(): void
```

뷰어 중앙을 기준으로 한 단계 확대합니다.

### `zoomOut()`

```ts
function zoomOut(): void
```

뷰어 중앙을 기준으로 한 단계 축소합니다.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

배율을 설정합니다. `1`은 이미지 1픽셀을 화면 1픽셀로 보여 줍니다. [`point`](./types#viewpoint)는 제자리에 머뭅니다. `point`는 뷰어 왼쪽 위에서부터의 CSS 픽셀이며, 기본값은 뷰어 중앙입니다.

배율은 이미지 전체를 맞춘 배율(그 값이 `1`보다 크면 `1`)부터 `8`까지입니다. 범위를 벗어난 값은 범위 안으로 맞춰집니다.

`zoom`이 `NaN`이거나 `point`의 좌표가 유한한 수가 아니면 `RangeError`를 던지며, 이때 배율은 바뀌지 않습니다.

### `fit()`

```ts
function fit(fit: Fit): void
```

이미지 전체, 너비, 또는 높이를 뷰어에 맞춥니다. `fit`은 [`Fit`](./types#fit) 타입으로, `'image'`, `'width'`, `'height'` 중 하나입니다.

## 편집

### `edit()`

```ts
function edit(): void
```

편집을 시작합니다. 이미지가 준비되지 않았거나 [`editable`](./options#editable)이 `false`이면 아무것도 하지 않습니다.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

이미지를 90도 회전합니다. 기본값인 `1`은 시계 방향, `-1`은 시계 반대 방향입니다. 편집 중에는 [`apply()`](#apply)로 확정되는 변경을 더하며, 도구가 열려 있거나 적용 중이면 아무것도 하지 않습니다. 읽기 전용 뷰어에서는 표시만 바꿉니다. 그 밖의 경우에는 아무것도 하지 않습니다.

### `flip()`

```ts
function flip(): void
```

보이는 그대로 이미지를 좌우로 뒤집습니다. 90도 회전한 뒤에도 좌우로 뒤집습니다. 위아래로 뒤집으려면 뒤집은 뒤 두 번 회전하세요. 변경의 하나이며, 편집 모드가 아니거나 도구가 열려 있으면 아무것도 하지 않습니다.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

패널이 있는 도구를 엽니다. 자르기(`'crop'`), 기울기 보정(`'perspective'`), 조정(`'adjust'`), 정리(`'finish'`) 중 하나이며, 정리는 마무리가 원본일 때 열리면서 흑백을 고릅니다. 도구는 [`confirmTool()`](#confirmtool)이나 [`cancelTool()`](#canceltool)까지 열려 있습니다. 그동안에는 다른 변경을 시작할 수 없고, 실행 취소, 다시 실행, 적용은 아무것도 하지 않습니다. 편집 모드가 아니거나, 다른 도구가 열려 있거나, 흑백일 때의 조정, 미리보기를 준비하는 동안의 자르기와 기울기 보정에서는 아무것도 하지 않습니다.

### `confirmTool()`

```ts
function confirmTool(): void
```

열린 도구를 닫고 거기서 고른 내용을 변경에 더합니다. `Enter`와 같습니다. 자르기와 기울기 보정의 선택 영역, 또는 조정과 정리의 설정이 변경 하나가 됩니다.

### `cancelTool()`

```ts
function cancelTool(): void
```

열린 도구를 닫고 그 변경을 버립니다. `Esc`와 같습니다.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

[정리](../guide/tools/clean-up)의 마무리를 고릅니다. `'original'`, `'gray'`, 흑백인 `'mono'` 중 하나입니다. 흑백의 민감도도 0부터 1까지로 바꿉니다. 마무리는 항상 다른 변경 다음에 적용됩니다. 정리가 열려 있는 동안에는 그 패널에 보이는 내용을 바꾸고, [`confirmTool()`](#confirmtool)이 이를 변경 하나로 남깁니다. 편집 모드가 아니거나 다른 도구가 열려 있으면 아무것도 하지 않습니다.

`mode`가 [`FinishMode`](./types#finishmode)가 아니거나 `sensitivity`가 0부터 1 사이가 아니면 `RangeError`를 던집니다.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

밝기나 대비를 각각 -1부터 1까지로 바꿉니다. 0은 이미지를 그대로 둡니다. 다른 변경 다음, 회색 전에 적용됩니다. 조정이 열려 있는 동안에는 그 패널에 보이는 값을 바꾸고, [`confirmTool()`](#confirmtool)이 이를 변경 하나로 남깁니다. 편집 모드가 아니거나, 다른 도구가 열려 있거나, 흑백이면 아무것도 하지 않습니다. 흑백은 각 픽셀을 주변과 비교하므로, 밝기와 대비는 그 결과를 거의 바꾸지 못하기 때문입니다.

값이 -1부터 1 사이가 아니면 `RangeError`를 던집니다.

### `undo()`

```ts
function undo(): void
```

마지막 변경을 실행 취소합니다. 편집 모드가 아니거나, 도구가 열려 있거나, 적용 중이면 아무것도 하지 않습니다.

### `redo()`

```ts
function redo(): void
```

마지막으로 실행 취소한 변경을 다시 실행합니다. 편집 모드가 아니거나, 도구가 열려 있거나, 적용 중이면 아무것도 하지 않습니다.

### `apply()`

```ts
function apply(): Promise<void>
```

변경을 원본 해상도나 [`maxOutputSize`](./options#maxoutputsize)로 적용합니다. 결과가 화면의 이미지가 되고, 기록이 비워지고, 뷰어는 보기 모드로 돌아가며, [`apply`](./events#apply) 이벤트가 결과를 전달합니다. 적용은 중단할 수 없고, 진행 중에는 컨트롤이 잠깁니다. 편집 모드가 아니거나, 도구가 열려 있거나, 적용할 것이 없으면 아무것도 하지 않습니다.

실패하면 [`error`](./events#error) 이벤트가 알리고, 편집은 열린 채로 남습니다. Promise는 적용이 끝나면 실패한 경우에도 이행됩니다. `try/catch`로는 잡히지 않으니 `error`를 수신하세요.

### `cancel()`

```ts
function cancel(): void
```

변경 사항을 버리고 보기 모드로 돌아갑니다. 묻지 않습니다. 묻는 것은 기본 제공 ‘취소’ 버튼과 `Esc`입니다. 적용 중에는 아무것도 하지 않습니다.

## 이미지

### `download()`

```ts
function download(): void
```

화면의 이미지를 파일로 저장합니다. 마지막 적용의 결과이고, 없으면 원본 이미지입니다. 버튼만 표시하는 [`download`](./options#download) 옵션이 없어도 동작합니다. [`download`](./events#download) 이벤트가 먼저 발생하며 저장을 막을 수 있습니다. 편집 중에는 변경이 아직 적용되지 않았으므로 아무것도 하지 않습니다. 첫 적용 전에는 다른 출처의 `src`가 브라우저에서 열립니다. [결과 저장](../guide/saving#download)을 참고하세요.

### `reload()`

```ts
function reload(): void
```

현재 [`src`](./options#src)를 다시 불러옵니다. 적용한 뒤 원본으로 돌아갈 때 씁니다. 편집 중에는 변경을 버립니다. `src`가 없으면 아무것도 하지 않습니다.
