---
title: CSS 토큰
description: PaperPic의 모양을 바꾸는 CSS 사용자 지정 속성과 라이트, 다크 값. 스타일시트, 캐스케이드 레이어, 공개 클래스, 컨트롤 이름도 설명합니다.
---

# CSS 토큰

토큰은 컴포넌트의 규칙을 덮어쓰지 않고 모양을 바꾸는 CSS 사용자 지정 속성입니다. `:root`, 뷰어의 조상 요소, 또는 `.paperpic`에 설정하세요.

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| 토큰                             | 라이트    | 다크      | 설명                   |
| -------------------------------- | --------- | --------- | ---------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | 인터페이스 강조 색     |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | 인터페이스 배경        |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | 인터페이스 텍스트      |
| `--paperpic-radius`              | `6px`     | `6px`     | 인터페이스 모서리 반경 |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | 인터페이스 전환 시간   |

## 다크 모드

색 토큰은 페이지의 `color-scheme`에 따라 `light-dark()`로 밝은 값이나 어두운 값을 고릅니다. `color-scheme`이 없으면 밝은 값입니다. `color-scheme: dark`이면 어두운 값이고, `color-scheme: light dark`이면 시스템이 어두운 색 구성표를 선호할 때 어두운 값입니다. 설정 방법은 [스타일](../guide/styling#dark-mode)에 있습니다.

토큰의 두 값을 직접 고르려면 똑같이 `light-dark()`를 쓰세요.

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

## 스타일시트

각 패키지에는 스타일시트가 하나 있습니다. 앱에서 한 번만 가져오세요.

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

규칙은 `paperpic` 캐스케이드 레이어에 있으므로, 레이어 밖에 있는 여러분의 CSS는 명시도와 관계없이 이 규칙을 덮어씁니다. `button`에 대한 규칙 같은 전역 리셋도 마찬가지입니다. Tailwind CSS에서는 [스타일](../guide/styling#tailwind)에 나온 대로 레이어 순서를 나열하세요.

## 클래스 {#classes}

이 클래스들은 공개되어 있습니다. 이름과, 클래스가 붙는 요소는 릴리스가 바뀌어도 그대로입니다. 컴포넌트의 다른 클래스는 배치를 받치는 것이라 어느 릴리스에서든 바뀔 수 있습니다.

| 클래스                    | 요소                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `paperpic`                | 뷰어의 루트                                                                                        |
| `paperpic-button`         | 도구 모음과 편집 바의 모든 버튼                                                                    |
| `paperpic-button-danger`  | 변경 사항을 버리기 전 질문에 있는 삭제                                                             |
| `paperpic-button-primary` | 적용, 그리고 각 도구의 완료                                                                        |
| `paperpic-button-text`    | 변경 사항을 버리기 전 질문에 있는 버튼                                                             |
| `paperpic-edit-bar`       | 편집하는 동안 아래쪽에 나오는 카드 형태의 편집 바                                                  |
| `paperpic-editing`        | 편집 중인 루트                                                                                     |
| `paperpic-handle`         | 자르기와 기울기 보정의 모서리 핸들                                                                 |
| `paperpic-host`           | Vue와 React 컴포넌트가 뷰어 바깥에 만드는 요소                                                     |
| `paperpic-icon`           | 버튼의 아이콘                                                                                      |
| `paperpic-status`         | 스크린 리더용 메시지. 이미지를 불러오거나 변경 사항을 적용하는 동안, 그리고 실패했을 때도 보입니다 |
| `paperpic-status-visible` | 뷰어 가운데에 보이는 동안의 메시지                                                                 |
| `paperpic-toolbar`        | 오른쪽의 도구 모음. 편집하는 동안 숨겨짐                                                           |
| `paperpic-viewport`       | 이미지를 보여 주고 키보드 포커스를 받는 영역                                                       |

버튼은 ARIA 속성으로 상태를 나타내며, 이것도 선택할 수 있습니다.

| 속성                     | 상태                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | 지금은 동작할 수 없는 버튼. 키보드 포커스는 유지하므로 `disabled`가 아닙니다       |
| `[aria-pressed='true']`  | 적용 중인 맞춤(너비에 맞추기, 높이에 맞추기), 또는 눈금자가 바꾸는 ‘조정’의 선택지 |

호버와 이 상태들은 `box-shadow`로 그려지며, 버튼의 전역 리셋은 이를 건드리지 않습니다. 바꾸려면 `box-shadow`도 덮어쓰세요.

## 컨트롤 {#controls}

버튼, 눈금자, 모서리 핸들에는 각각 `data-paperpic-control`이 있으며, 그 [레이블](./labels)의 키가 들어 있습니다. 컨트롤 하나만 꾸밀 때 선택하세요.

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| 위치                 | 값                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| 도구 모음            | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| 편집 바              | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| 조정과 정리          | `brightness`와 `contrast`(선택지와 그 눈금자), `threshold`(스위치), `thresholdSensitivity`(그 눈금자) |
| 각 도구              | `cancelTool`, `confirm`                                                                               |
| 자르기와 기울기 보정 | `zoomIn`, `zoomOut`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`       |
| 버리기 전 질문       | `keepEditing`, `discard`                                                                              |

`rotateLeft`는 동시에 보이지 않는 두 버튼을 가리킵니다. 화면 표시만 돌리는 읽기 전용 뷰어의 버튼과, 이미지 자체를 돌리는 편집 바의 버튼입니다. `zoomIn`과 `zoomOut`(도구 모음과 패널), `threshold`(‘정리’ 버튼과 그 스위치)도 마찬가지입니다. `brightness`와 `contrast`는 선택지와 그 눈금자를 가리키며, 둘이 함께 보입니다. 구분하려면 선택자에 `button`이나 `input`을 더하세요.
