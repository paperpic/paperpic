---
title: Загрузка на сервер
description: Полный пример, который отправляет отредактированное в PaperPic изображение на ваш сервер и сообщает пользователю, сохранилось ли оно, на JavaScript, Vue и React.
---

# Загрузка на сервер

Просмотрщик сразу показывает результат применения, но сохранить его — задача вашего приложения. Этот пример отправляет отредактированное изображение на ваш сервер и сообщает пользователю, чем всё закончилось.

Эта функция отправляет изображение как файл в форме и завершается ошибкой, если сервер его не принимает:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

Просмотрщик вызывает её при применении, а строка состояния сообщает результат:

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: 'Счёт 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Сохранение…'
  try {
    await upload(blob, type)
    status.textContent = 'Сохранено'
  }
  catch {
    status.textContent = 'Не удалось сохранить документ'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = 'Сохранение…'
  try {
    await upload(blob, type)
    status.value = 'Сохранено'
  }
  catch {
    status.value = 'Не удалось сохранить документ'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Счёт 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('Сохранение…')
    try {
      await upload(blob, type)
      setStatus('Сохранено')
    }
    catch {
      setStatus('Не удалось сохранить документ')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Счёт 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Примечания

- `role="status"` заставляет программы чтения с экрана озвучить результат загрузки.
- [`maxOutputSize`](../reference/options#maxoutputsize) сохраняет файл небольшим. Документы остаются читаемыми при 3000 пикселях по длинной стороне.
- После применения история пуста, поэтому пользователь не может вернуться к старому изображению. Чтобы предложить кнопку повтора, сохраните последние `blob` и `type` и снова вызовите `upload`.
- Для очищенного документа сервер получает PNG, иначе — формат исходного изображения. Чтобы выбрать другой, см. [Сохранение результата](../guide/saving).
