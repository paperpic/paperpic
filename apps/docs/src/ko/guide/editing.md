---
title: 편집
description: PaperPic 편집 모드가 ‘편집’ 버튼부터 ‘적용’까지 어떻게 동작하는지, 도구, 실행 취소와 다시 실행, 미리보기, 코드가 받는 이벤트와 함께 설명합니다.
---

# 편집

문서 사진은 저장할 만해지기 전에 보통 몇 가지 손질이 필요합니다. 편집 모드는 이를 한데 모읍니다. 사용자는 변경하고, 확인하고, 한 번에 적용합니다. [플레이그라운드](../playground)에서 편집 모드 전체를 써 볼 수 있습니다.

## 편집 흐름

1. 사용자가 도구 모음의 연필, ‘편집’을 누릅니다. 뷰어 아래쪽에 편집 바가 나타납니다.
2. 편집 바의 각 도구가 변경을 더하고, 뷰어는 이를 바로 보여 줍니다. ‘실행 취소’와 ‘다시 실행’으로 변경 사이를 오갑니다.
3. ‘적용’은 결과를 계산하고 보기로 돌아갑니다. ‘취소’는 변경을 버리며, 변경이 있으면 먼저 묻습니다.

‘적용’ 전에는 이미지가 바뀌지 않습니다. 그때까지 변경은 목록으로 남고, 뷰어가 미리보기를 보여 줍니다.

## 도구

| 도구                                       | 하는 일                                       | Id            |
| ------------------------------------------ | --------------------------------------------- | ------------- |
| [‘자르기’](./tools/crop)                   | 네 모서리 안쪽 부분만 남깁니다                | `crop`        |
| [‘기울기 보정’](./tools/straighten)        | 비스듬히 찍은 사진을 평평한 페이지로 만듭니다 | `perspective` |
| [‘왼쪽으로 회전’](./tools/rotate-and-flip) | 이미지를 왼쪽으로 90도 회전합니다             | `rotate`      |
| [‘뒤집기’](./tools/rotate-and-flip)        | 이미지를 좌우로 뒤집습니다                    | `flip`        |
| [‘조정’](./tools/adjust)                   | 밝기와 대비를 바꿉니다                        | `adjust`      |
| [‘정리’](./tools/clean-up)                 | 문서를 그림자 없는 선명한 흑백으로 만듭니다   | `threshold`   |

[`tools`](../reference/options#tools) 옵션으로 편집 바에 보일 도구를 고릅니다.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

‘자르기’와 ‘기울기 보정’에는 자체 선택 영역이 있어서, 둘 중 하나가 열려 있는 동안 편집 바의 나머지는 기다립니다. ‘완료’ 또는 `Enter`는 선택 영역을 변경에 더하고, ‘이 도구 취소’ 또는 `Esc`는 버립니다.

## 미리보기와 적용

편집하는 동안 뷰어는 약 2메가픽셀 크기의 이미지 사본으로 변경을 미리 보여 주므로, 큰 사진에서도 빠르게 동작합니다. 크게 확대하면 미리보기가 결과보다 흐리게 보입니다. ‘적용’은 모든 변경을 원본 해상도나 [`maxOutputSize`](../reference/options#maxoutputsize)로 Web Worker에서 계산합니다.

적용은 중단할 수 없습니다. 진행하는 동안 컨트롤을 잠그고 메시지를 보여 줍니다. 그다음 결과가 화면의 이미지를 대신하고, 기록이 비워지며, 뷰어는 보기 모드로 돌아갑니다. 적용에 실패하면 사용자가 다시 시도할 수 있도록 편집이 열린 채로 남습니다.

## 코드가 받는 것

| 이벤트   | 시점                                                    |
| -------- | ------------------------------------------------------- |
| `apply`  | 결과가 준비되면, `{ blob, width, height, type }`과 함께 |
| `change` | 사용자의 동작마다, [상태](../reference/state)와 함께    |
| `error`  | 적용에 실패하거나 이미지를 불러오지 못했을 때           |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## 변경이 버려지는 경우

- 사용자가 확인한 뒤의 ‘취소’, 또는 묻지 않는 [`cancel()`](../reference/methods#cancel).
- 편집 중의 새 `src`.
- 편집 중의 `editable` 변경.

적용한 뒤 같은 `src`를 다시 전달해도 아무 일도 일어나지 않으므로 결과가 화면에 그대로 남습니다. [`reload()`](../reference/methods#reload)는 원본을 되돌립니다.

## 키보드

뷰어에 포커스가 있을 때:

| 키                           | 동작                                 |
| ---------------------------- | ------------------------------------ |
| `Ctrl+Z`                     | 실행 취소                            |
| `Ctrl+Shift+Z` 또는 `Ctrl+Y` | 다시 실행                            |
| `Enter`                      | 열린 도구를 확정, 없으면 변경을 적용 |
| `Esc`                        | 열린 도구를 닫기, 없으면 변경을 취소 |

macOS에서는 `Cmd`가 `Ctrl`처럼 동작합니다.
