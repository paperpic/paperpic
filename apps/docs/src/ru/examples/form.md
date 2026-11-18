---
title: Отправка через форму
description: Полный пример, где фото чека лежит в поле формы, пользователь правит его в PaperPic, а форма отправляет отредактированное изображение без собственного кода, на JavaScript, Vue и React.
---

# Отправка через форму

Некоторые приложения отправляют документы обычной формой, например расход с чеком, и не имеют своего кода для загрузки файла. Этот пример оставляет фото в файловом поле формы и кладёт туда отредактированное изображение, когда пользователь применяет изменения, поэтому форма отправляет его как любой файл.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Сумма
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Чек
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Отправить</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Прикреплённый вами чек',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// Форма отправляет отредактированное изображение вместо фото
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

// Форма отправляет отредактированное изображение вместо фото
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
      Сумма
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Чек
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="Прикреплённый вами чек" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Отправить
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

  // Форма отправляет отредактированное изображение вместо фото
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
        Сумма
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Чек
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="Прикреплённый вами чек" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Отправить</button>
    </form>
  )
}
```

:::

## Примечания

- Применение кладёт отредактированное изображение в файловое поле через [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), поэтому форма отправляет его под тем же именем. До первого применения форма отправляет фото в том виде, в каком его выбрал пользователь.
- Изменение файлов поля из кода не вызывает его событие `change`, поэтому просмотрщик продолжает показывать результат.
- Файл сохраняет имя фото с расширением результата, например `receipt.png` после чёрно-белого режима «Очистить».
- Кнопки просмотрщика никогда не отправляют форму.
- [`maxOutputSize`](../reference/options#maxoutputsize) сохраняет форму лёгкой. Фото с телефона имеют 12 мегапикселей и больше, а документы остаются читаемыми при 3000 пикселях по длинной стороне.
