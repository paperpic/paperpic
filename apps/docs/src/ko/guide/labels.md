---
title: 인터페이스 번역
description: labels 옵션으로 PaperPic을 번역하거나 표현을 바꾸는 방법. 스크린 리더가 읽는 텍스트와 앱의 언어를 따르는 방법도 설명합니다.
---

# 인터페이스 번역

PaperPic은 버튼, 힌트, 메시지를 영어로 보여 주고, 스크린 리더도 바뀐 내용을 영어로 읽어 줍니다. [`labels`](../reference/options#labels) 옵션은 이 텍스트를 무엇이든 바꿔서, 컴포넌트가 앱의 언어로 말하게 합니다. 패키지에는 번역이 들어 있지 않습니다.

## 일부 텍스트 바꾸기

바꾸고 싶은 텍스트만 전달하세요. 나머지는 영어로 남습니다.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: '저장', threshold: '흑백' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: '저장', threshold: '흑백' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: '저장', threshold: '흑백' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

모든 키와 영어 텍스트, 나타나는 위치는 [레이블](../reference/labels)에 있습니다.

## 값이 들어간 텍스트

레이블 5개는 텍스트에 값이 들어가므로 함수입니다. 확대/축소 배율, ‘정리’의 민감도, 모서리와 그 위치, 선택한 모서리, ‘조정’의 슬라이더입니다. 스크린 리더가 이를 읽어 줍니다. 숫자는 여러분 언어의 방식대로 형식을 맞추세요.

```ts
const signed = new Intl.NumberFormat('ko', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `확대/축소 ${percent}%`,
  thresholdLevel: percent => `민감도 ${percent}%`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: 옮길 위치를 탭하세요`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## 앱의 언어 따르기

앱의 언어가 바뀌면 새 레이블을 전달하세요. 뷰어가 바로 텍스트를 바꿉니다. 객체는 언어가 바뀔 때만 만드세요. 그래야 뷰어가 렌더링할 때마다 새 객체를 받지 않습니다.

:::tabs key:framework
== JavaScript

```ts
function setLanguage(language: string) {
  pic.setOptions({ labels: translations[language] })
}
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const labels = computed(() => translations[locale.value])
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useMemo } from 'react'

export function Receipt({ language }: { language: string }) {
  const labels = useMemo(() => translations[language], [language])
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

여기서 `translations`는 언어별 레이블을 담은 여러분의 객체입니다.

## 시작점

이 사이트는 영어 말고도 아홉 개 언어로 컴포넌트를 보여 줍니다. 그 레이블은 [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts)에 있으며, 앱에 복사해서 쓸 수 있습니다.
