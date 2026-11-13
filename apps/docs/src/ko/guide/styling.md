---
title: 스타일
description: PaperPic을 앱의 모양에 맞추는 방법. 스타일시트, CSS 토큰, 다크 모드, 직접 만든 아이콘, 그리고 여러분의 CSS가 이기게 하는 캐스케이드 레이어를 설명합니다.
---

# 스타일

PaperPic은 앱의 일부처럼 보여야 합니다. 스타일시트는 하나뿐이고, 색과 모서리는 몇 개의 CSS 토큰에서 가져오며, 페이지의 색 구성표를 따르고, 규칙은 캐스케이드 레이어에 두므로 여러분의 CSS가 항상 이깁니다.

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

토큰은 상속되므로, 한 뷰어의 컨테이너나 Vue 또는 React 컴포넌트에 클래스를 붙이면 그 뷰어만 바뀝니다.

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## 디자인 시스템의 색 쓰기 {#design-system}

앱이 색을 CSS 변수에 두고 있다면, 값을 복사하지 말고 토큰이 그 변수를 가리키게 하세요. 그러면 뷰어가 다크 모드를 포함해 여러분의 테마를 따릅니다.

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

여기처럼 `.paperpic`에 설정하세요. `var()`를 쓰는 토큰은 설정한 요소에서 변수를 읽습니다. 그래서 `:root`에 두면 페이지 일부에서만 바꾸는 테마를 놓칩니다.

CSS 변수가 있는 디자인 시스템이라면 무엇이든 됩니다. 예를 들어 Tailwind CSS 4의 테마 변수 `var(--color-blue-600)`이나 `var(--radius-md)`도 쓸 수 있습니다.

## 다크 모드 {#dark-mode}

색은 브라우저의 폼 컨트롤처럼 페이지의 `color-scheme`을 따릅니다.

- `color-scheme: light dark`이면, 사용자의 시스템이 어두운 색 구성표를 선호할 때 어두워집니다.
- `color-scheme: dark`이면 항상 어둡습니다. 페이지의 일부에서도 됩니다.
- `color-scheme`이 없으면 밝은 색으로 남습니다. 그래서 다크 테마가 없는 페이지는 밝은 뷰어를 유지합니다.

사이트가 시스템을 따른다면 한 번만 선언하세요.

```css
:root {
  color-scheme: light dark;
}
```

`<html>`의 클래스 등으로 테마를 바꾸는 사이트라면, 그 클래스와 함께 `color-scheme`을 설정하세요. 브라우저의 스크롤바와 폼 컨트롤도 이를 따릅니다.

```css
:root.dark {
  color-scheme: dark;
}
```

어두운 색을 직접 고르려면 `light-dark()`로 토큰에 두 값을 모두 주세요.

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

[디자인 시스템](#design-system)의 변수를 가리키는 토큰은 대신 여러분의 테마를 따릅니다.

## 아이콘 {#icons}

[`icons`](../reference/options#icons) 옵션은 어떤 아이콘이든 직접 만든 마크업으로 바꿉니다. 보통은 앱 아이콘 세트의 `<svg>`입니다.

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- 각 키는 아이콘 하나를 가리키며, 두 버튼에 나오는 아이콘도 있습니다. `apply`는 완료에도 쓰이고, `cancel`은 도구를 닫는 버튼에도 쓰입니다. 모든 키는 [옵션](../reference/options#icons)에 있습니다.
- PaperPic은 아이콘에 크기를 정하는 `paperpic-icon` 클래스를 붙이고, 스크린 리더에서는 숨깁니다. 버튼에 이미 이름이 있기 때문입니다.
- 아이콘은 `currentColor`로 그리세요. 그러면 어느 테마에서든 버튼의 색을 따릅니다.
- 마크업은 HTML로 페이지에 들어가므로, 신뢰할 수 있는 마크업만 전달하세요.
- Vite에서는 `import zoomIn from './zoom-in.svg?raw'`로 `.svg` 파일의 마크업을 얻을 수 있습니다.

크기나 선 굵기처럼 모든 아이콘을 한 번에 바꾸려면 클래스에 스타일을 주세요.

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
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

## Tailwind CSS {#tailwind}

Tailwind CSS 4도 규칙을 캐스케이드 레이어에 둡니다. Tailwind와 PaperPic을 가져오기 전에 모든 레이어를 순서대로 나열하세요. 그러면 Tailwind의 리셋은 `paperpic` 앞에, 유틸리티는 뒤에 옵니다.

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

PaperPic의 스타일시트는 JavaScript가 아니라 여기, 여러분의 CSS에서 가져오세요. 순서가 다르면 Tailwind의 리셋이 뷰어의 안쪽 여백과 테두리를 없애거나, 뷰어가 컴포넌트에 붙인 `h-96` 같은 유틸리티를 덮어씁니다.

## 클래스 이름 {#class-names}

선택자에 쓸 수 있는 클래스는 `paperpic-toolbar`, `paperpic-button` 등 [CSS 레퍼런스](../reference/css-tokens#classes)에 있으며, 이름이 바뀌지 않습니다. 다른 클래스는 배치를 받치는 것이라 어느 릴리스에서든 바뀔 수 있습니다. 토큰으로 충분하다면 토큰을 쓰세요.

버튼, 눈금자, 모서리 핸들에는 각각 `data-paperpic-control`도 있으며, 그 [레이블](../reference/labels)의 키가 들어 있습니다. 컨트롤 하나만 꾸밀 때 선택하세요.

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## 배치

인터페이스는 컨테이너에 맞춰 알아서 바뀝니다.

- 도구 모음은 오른쪽에 있으며, 뷰어가 버튼을 담기에 너무 낮으면 스크롤됩니다. 편집하는 동안에는 숨겨집니다.
- 편집 바는 아래쪽의 카드로, 높이가 고정된 두 줄이며 너비가 28rem 이상인 뷰어에서는 한 줄입니다. 그래서 도구를 열어도 이미지가 움직이지 않습니다.
- 터치스크린에서는 버튼과 모서리 핸들이 최소 44픽셀입니다.

## 직접 만든 컨트롤

스타일만으로 부족하면 `toolbar: false`로 도구 모음과 편집 바를 숨기고, 직접 만든 컨트롤로 뷰어를 다루세요. 방법은 [직접 만든 도구 모음](../examples/custom-toolbar)에 있습니다.
