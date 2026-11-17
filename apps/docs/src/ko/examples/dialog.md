---
title: 대화상자에서 편집하기
description: PaperPic을 대화상자에서 열어 사진을 편집하고, 사용자가 변경을 적용하거나 취소하면 대화상자를 닫는 완전한 예제. JavaScript, Vue, React 버전이 있습니다.
---

# 대화상자에서 편집하기

많은 앱은 첨부 파일 목록 같은 곳에서, 페이지 위에 열리는 대화상자로 문서를 편집합니다. 이 예제는 `<dialog>`에서 뷰어를 열어 편집 모드를 시작하고, 사용자가 변경을 적용하거나 취소하면 대화상자를 닫습니다.

`upload`는 [서버에 업로드](./upload)의 함수입니다.

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">사진 편집</button>
<dialog id="editor">
  <div id="viewer" style="width: min(90vw, 720px); height: 70vh"></div>
</dialog>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const dialog = document.querySelector<HTMLDialogElement>('#editor')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: '영수증',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// 아직 불러오는 중인 사진은 화면에 나오면 바로 편집을 시작한다
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// 적용이나 취소로 편집이 끝나면 대화상자도 함께 닫힌다
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// 편집 중의 Esc는 뷰어로 가고, 뷰어는 변경을 버리기 전에 묻는다
dialog.addEventListener('cancel', (event) => {
  if (editing) {
    event.preventDefault()
  }
})

pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const dialog = useTemplateRef('dialog')
const pic = useTemplateRef('pic')
let editing = false

function open() {
  dialog.value?.showModal()
  pic.value?.instance?.edit()
}

// 아직 불러오는 중인 사진은 화면에 나오면 바로 편집을 시작한다
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// 적용이나 취소로 편집이 끝나면 대화상자도 함께 닫힌다
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// 편집 중의 Esc는 뷰어로 가고, 뷰어는 변경을 버리기 전에 묻는다
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    사진 편집
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="영수증"
        @load="loaded"
        @change="changed"
        @apply="({ blob, type }) => upload(blob, type)"
      />
    </div>
  </dialog>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import type { SyntheticEvent } from 'react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'
import '@paperpic/react/style.css'

export function PhotoEditor() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const picRef = useRef<PaperPicInstance>(null)
  const editing = useRef(false)

  function open() {
    dialogRef.current?.showModal()
    picRef.current?.edit()
  }

  // 아직 불러오는 중인 사진은 화면에 나오면 바로 편집을 시작한다
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // 적용이나 취소로 편집이 끝나면 대화상자도 함께 닫힌다
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // 편집 중의 Esc는 뷰어로 가고, 뷰어는 변경을 버리기 전에 묻는다
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>사진 편집</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="영수증"
            onLoad={loaded}
            onChange={changed}
            onApply={({ blob, type }) => upload(blob, type)}
          />
        </div>
      </dialog>
    </>
  )
}
```

:::

## 참고

- 뷰어는 닫힌 대화상자 안에 있어도 됩니다. 그동안에는 크기가 없고, 대화상자가 열리는 즉시 이미지를 맞춥니다.
- 대화상자를 열면 편집 모드가 시작됩니다. 사진이 아직 불러오는 중이면 대신 `load` 이벤트가 시작합니다.
- 적용과 취소로 편집이 끝나고, 이어지는 [`change`](../reference/events#change)가 대화상자를 닫습니다. 적용에 실패하면 편집도 대화상자도 열린 채로 남습니다.
- 열 때마다 화면의 이미지를 편집하며, 적용한 뒤에는 그것이 결과입니다. 매번 원본에서 시작하려면 `edit()` 전에 [`reload()`](../reference/methods#reload)를 호출하세요.
