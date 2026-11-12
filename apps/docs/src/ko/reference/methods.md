---
title: 메서드
description: PaperPic 클래스의 모든 메서드. 확대/축소, 맞추기, 회전, 편집, 적용, 다운로드, 다시 불러오기 등 코드에서 뷰어를 제어합니다.
---

# 메서드

메서드로 코드에서 뷰어를 제어합니다. 예를 들어 [`toolbar: false`](./options#toolbar)로 두고 직접 만든 버튼에서 호출합니다. Vue와 React에서는 컴포넌트의 ref로 뷰어를 얻습니다. [Vue](./vue)와 [React](./react)를 참고하세요.

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## 생성과 제거

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

`container` 안에 뷰어를 만들고 컨테이너를 가득 채웁니다. 컨테이너에 높이를 지정하세요. 지정하지 않으면 뷰어가 최소 높이로 남습니다. `options`에 전달할 수 있는 값은 [옵션](./options)에 있습니다.

`container`가 요소가 아니면 `TypeError`를 던집니다. 요소가 만들어진 뒤에, 예를 들어 마운트할 때 뷰어를 만드세요.

### `destroy()`

```ts
function destroy(): void
```

뷰어를 제거하고 worker와 이미지 메모리 등 가진 것을 모두 해제합니다. 두 번 호출해도 문제없습니다.

## 옵션과 상태

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

전달한 옵션을 바꾸고 나머지는 그대로 둡니다. `undefined`를 전달하면 기본값으로 돌아갑니다. `change`를 발생시키지 않으므로 양방향 바인딩이 반복되지 않습니다.

### `getState()`

```ts
function getState(): PaperPicState
```

확대/축소 배율, 모드, 적용할 변경 사항이 있는지 등 뷰어가 보여 주는 내용을 반환합니다. 각 필드는 [상태](./state)에서 설명합니다.

### `on()`

```ts
function on(name: keyof PaperPicEvents, listener: (payload) => void): () => void
```

이벤트를 구독하고, 구독을 끝내는 함수를 반환합니다. 각 이벤트는 [이벤트](./events)에서 설명합니다.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

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
function zoomTo(zoom: number, point?: { x: number, y: number }): void
```

배율을 설정합니다. `1`은 이미지 1픽셀을 화면 1픽셀로 보여 줍니다. `point`는 제자리에 머뭅니다. `point`는 뷰어 왼쪽 위에서부터의 CSS 픽셀이며, 기본값은 뷰어 중앙입니다.

배율은 이미지 전체를 맞춘 배율(그 값이 `1`보다 크면 `1`)부터 `8`까지입니다. 범위를 벗어난 값은 범위 안으로 맞춰집니다.

### `fit()`

```ts
function fit(fit: 'image' | 'width' | 'height'): void
```

이미지 전체, 너비, 또는 높이를 뷰어에 맞춥니다.

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

이미지를 90도 회전합니다. 기본값인 `1`은 시계 방향, `-1`은 시계 반대 방향입니다. 편집 중에는 [`apply()`](#apply)로 확정되는 변경입니다. 읽기 전용 뷰어에서는 표시만 바꿉니다. 그 밖의 경우에는 아무것도 하지 않습니다.

### `flip()`

```ts
function flip(): void
```

보이는 그대로 이미지를 좌우로 뒤집습니다. 90도 회전한 뒤에도 좌우로 뒤집습니다. 위아래를 바꾸려면 뒤집은 뒤 두 번 회전하세요. 변경의 하나이며, 편집 모드가 아니거나 도구가 열려 있으면 아무것도 하지 않습니다.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

패널이 있는 도구를 엽니다. `'crop'`은 자르기, `'perspective'`는 기울기 보정, `'adjust'`는 조정, `'threshold'`는 정리이며, 정리는 열리면서 켜집니다. 도구는 [`confirmTool()`](#confirmtool)이나 [`cancelTool()`](#canceltool)까지 열려 있고, 그동안 다른 변경, 실행 취소, 다시 실행, 적용은 아무것도 하지 않습니다. 편집 모드가 아니거나, 다른 도구가 열려 있거나, 정리가 켜져 있을 때의 조정, 미리보기를 준비하는 동안의 자르기와 기울기 보정에서는 아무것도 하지 않습니다.

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

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

정리를 켜거나 끄고, 민감도를 0부터 1까지로 바꿉니다. 정리는 항상 다른 변경 다음에 적용됩니다. 정리가 열려 있는 동안에는 그 패널에 보이는 내용을 바꾸고, [`confirmTool()`](#confirmtool)이 이를 변경 하나로 남깁니다. 편집 모드가 아니거나 다른 도구가 열려 있으면 아무것도 하지 않습니다.

`sensitivity`가 0부터 1 사이가 아니면 `RangeError`를 던집니다.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

밝기나 대비를 각각 -1부터 1까지로 바꿉니다. 0은 이미지를 그대로 둡니다. 다른 변경 다음에 적용됩니다. 조정이 열려 있는 동안에는 그 패널에 보이는 값을 바꾸고, [`confirmTool()`](#confirmtool)이 이를 변경 하나로 남깁니다. 편집 모드가 아니거나, 다른 도구가 열려 있거나, 정리가 켜져 있으면 아무것도 하지 않습니다. 정리한 문서에는 고유한 색조가 있기 때문입니다.

값이 -1부터 1 사이가 아니면 `RangeError`를 던집니다.

### `undo()`

```ts
function undo(): void
```

마지막 변경을 실행 취소합니다.

### `redo()`

```ts
function redo(): void
```

마지막으로 실행 취소한 변경을 다시 실행합니다.

### `apply()`

```ts
function apply(): Promise<void>
```

변경을 원본 해상도나 [`maxOutputSize`](./options#maxoutputsize)로 적용합니다. 결과가 화면의 이미지가 되고, 기록이 비워지고, 뷰어는 보기 모드로 돌아가며, [`apply`](./events#apply) 이벤트가 결과를 전달합니다. 적용은 중단할 수 없고, 진행 중에는 컨트롤이 잠깁니다.

실패하면 [`error`](./events#error) 이벤트가 알리고, 편집은 열린 채로 남습니다.

### `cancel()`

```ts
function cancel(): void
```

변경 사항을 버리고 보기 모드로 돌아갑니다. 묻지 않습니다. 묻는 것은 기본 제공 ‘취소’ 버튼과 `Esc`입니다.

## 이미지

### `download()`

```ts
function download(): void
```

화면의 이미지를 파일로 저장합니다. 마지막 적용의 결과이고, 없으면 원본 이미지입니다. 버튼만 표시하는 [`download`](./options#download) 옵션이 없어도 동작합니다. [`download`](./events#download) 이벤트가 먼저 발생하며 저장을 막을 수 있습니다. 편집 중에는 변경이 아직 적용되지 않았으므로 아무것도 하지 않습니다.

### `reload()`

```ts
function reload(): void
```

현재 [`src`](./options#src)를 다시 불러옵니다. 적용한 뒤 원본으로 돌아갈 때 씁니다.
