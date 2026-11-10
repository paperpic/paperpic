---
title: 스타일
description: PaperPic을 앱의 모양에 맞추는 방법. 스타일시트, CSS 토큰, 다크 모드, 그리고 여러분의 CSS가 이기게 하는 캐스케이드 레이어를 설명합니다.
---

# 스타일

PaperPic은 앱의 일부처럼 보여야 합니다. 스타일시트는 하나뿐이고, 색과 모서리는 몇 개의 CSS 토큰에서 가져오며, 규칙은 캐스케이드 레이어에 두므로 여러분의 CSS가 항상 이깁니다.

## 스타일시트 가져오기

앱에서 한 번만 가져오세요.

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

## 크기 지정하기

뷰어는 컨테이너를 가득 채우고 자체 높이가 없으므로, 컨테이너에 높이가 필요합니다. 높이를 주는 CSS라면 무엇이든 됩니다.

```css
.document-viewer {
  height: 70dvh;
}
```

뷰어는 화면이 아니라 컨테이너의 크기를 따릅니다. 사이드 패널이 열리는 등 컨테이너가 바뀌면 그에 맞춥니다.

## 색과 모서리

다섯 개의 [CSS 토큰](../reference/css-tokens)이 배경, 텍스트, 강조 색, 모서리 반경, 전환 시간을 정합니다. `:root`, 뷰어의 조상 요소, 또는 `.paperpic`에 설정하세요.

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

## 다크 모드 {#dark-mode}

사용자의 시스템이 어두운 색 구성표를 선호하면 색이 어두운 색으로 바뀝니다. `<html>`의 클래스 등 다른 방법으로 테마를 바꾸는 사이트라면, 각 테마의 색을 직접 설정하세요.

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

## 여러분의 CSS가 이깁니다

PaperPic의 규칙은 `paperpic` 캐스케이드 레이어에 있고, 레이어 밖의 CSS는 명시도와 관계없이 이를 덮어씁니다. 덕분에 꾸미기는 쉽지만, `button`에 대한 규칙처럼 레이어 밖의 전역 리셋도 뷰어의 버튼에 적용됩니다.

리셋 때문에 뷰어가 깨지면, 리셋을 `paperpic`보다 앞선 레이어로 옮기세요. 레이어 이름을 나열하는 첫 선언이 순서를 정하므로, PaperPic의 스타일시트보다 먼저 불러오는 CSS에 두세요.

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## 배치

인터페이스는 컨테이너에 맞춰 알아서 바뀝니다.

- 도구 모음은 오른쪽에 있으며, 뷰어가 버튼을 담기에 너무 낮으면 스크롤됩니다.
- 편집 바는 아래쪽에 한 줄로 있으며, 너비가 28rem보다 좁은 뷰어에서는 두 줄이 됩니다.
- 터치스크린에서는 버튼과 모서리 핸들이 최소 44픽셀입니다.

## 클래스 이름

컴포넌트의 모든 클래스는 `paperpic`으로 시작하고 이름이 바뀌지 않으므로, 선택자에 쓸 수 있습니다. 토큰으로 충분하다면 토큰을 쓰세요. 내부 구조가 바뀌어도 계속 동작합니다.
