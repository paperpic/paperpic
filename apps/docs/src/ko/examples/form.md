---
title: 폼으로 보내기
description: 영수증 사진을 폼 필드에 넣고, 사용자가 PaperPic에서 편집하면, 별도 코드 없이 폼이 편집한 이미지를 보내는 완전한 예제. JavaScript, Vue, React 버전이 있습니다.
---

# 폼으로 보내기

경비와 영수증처럼 일반 폼으로 문서를 보내고, 파일을 업로드하는 별도 코드가 없는 앱도 있습니다. 이 예제는 사진을 폼의 파일 필드에 그대로 두고, 사용자가 변경을 적용하면 편집한 이미지를 그 필드에 다시 넣어 폼이 여느 파일처럼 보내게 합니다.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    금액
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    영수증
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">보내기</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: '첨부한 영수증',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// 폼은 사진 대신 편집한 이미지를 보낸다
pic.on('apply', ({ blob, type }) => {
  const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  input.files = files.files
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const input = useTemplateRef('input')
const photo = shallowRef<File>()

function choose() {
  photo.value = input.value?.files?.[0]
}

// 폼은 사진 대신 편집한 이미지를 보낸다
function applied({ blob, type }: ExportedImage) {
  const field = input.value
  if (!field) {
    return
  }
  const name = field.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  field.files = files.files
}
</script>

<template>
  <form action="/api/expenses" method="post" enctype="multipart/form-data">
    <label>
      금액
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      영수증
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="첨부한 영수증" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      보내기
    </button>
  </form>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function ExpenseForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File>()

  // 폼은 사진 대신 편집한 이미지를 보낸다
  function applied({ blob, type }: ExportedImage) {
    const input = inputRef.current
    if (!input) {
      return
    }
    const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
    const files = new DataTransfer()
    files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
    input.files = files.files
  }

  return (
    <form action="/api/expenses" method="post" encType="multipart/form-data">
      <label>
        금액
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        영수증
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="첨부한 영수증" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">보내기</button>
    </form>
  )
}
```

:::

## 참고

- 적용하면 [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer)로 편집한 이미지를 파일 필드에 넣으므로, 폼은 같은 이름으로 보냅니다. 한 번도 적용하지 않았다면 사용자가 고른 사진을 그대로 보냅니다.
- 코드에서 필드의 파일을 바꿔도 필드의 `change` 이벤트는 발생하지 않으므로, 뷰어는 결과를 계속 보여 줍니다.
- 파일은 사진의 이름을 유지하고 확장자만 결과에 맞춥니다. 예를 들어 정리한 뒤에는 `receipt.png`입니다.
- 뷰어의 버튼은 폼을 제출하지 않습니다.
- [`maxOutputSize`](../reference/options#maxoutputsize)로 폼을 가볍게 유지합니다. 휴대폰 사진은 1200만 화소 이상이지만, 문서는 긴 변 3000픽셀에서도 충분히 읽힙니다.
