---
title: CSS 토큰
description: PaperPic의 모양을 바꾸는 CSS 사용자 지정 속성과 라이트, 다크 기본값. 스타일시트, 캐스케이드 레이어, 클래스 이름도 설명합니다.
---

# CSS 토큰

토큰은 컴포넌트의 규칙을 덮어쓰지 않고 모양을 바꾸는 CSS 사용자 지정 속성입니다. `:root`, 뷰어의 조상 요소, 또는 `.paperpic`에 설정하세요.

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| 토큰                             | 기본값    | 다크      | 설명                   |
| -------------------------------- | --------- | --------- | ---------------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | 인터페이스 배경        |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | 인터페이스 텍스트      |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | 인터페이스 강조 색     |
| `--paperpic-radius`              | `6px`     | `6px`     | 인터페이스 모서리 반경 |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | 인터페이스 전환 시간   |

## 다크 모드

다크 값은 사용자의 시스템이 어두운 색 구성표를 선호할 때 적용됩니다. `<html>`의 클래스 등 다른 방법으로 테마를 바꾸는 사이트라면, 각 테마의 색을 직접 설정하세요.

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

규칙은 `paperpic` 캐스케이드 레이어에 있으므로, 레이어 밖에 있는 여러분의 CSS는 명시도와 관계없이 이 규칙을 덮어씁니다. `button`에 대한 규칙 같은 전역 리셋도 마찬가지입니다.

## 클래스 이름

`.paperpic`은 뷰어의 루트이고, `.paperpic-host`는 Vue와 React 컴포넌트가 그 바깥에 만드는 요소입니다. 컴포넌트의 모든 클래스는 `paperpic`으로 시작하며, 이름은 바뀌지 않습니다. 필요한 것을 토큰으로 할 수 있다면 토큰을 쓰세요.
