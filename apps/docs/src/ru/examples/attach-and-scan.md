---
title: Прикрепить и отсканировать
description: Полный пример, в котором пользователь фотографирует документ или выбирает файл, выравнивает и очищает его в PaperPic и отправляет результат на ваш сервер, на JavaScript, Vue и React.
---

# Прикрепить и отсканировать

Большинство приложений, которые принимают документы, просят у пользователя фото: например, чек для авансового отчёта или подписанную форму. В этом примере пользователь делает фото или выбирает файл, редактирует его в PaperPic и отправляет результат на ваш сервер.

`upload` — это функция из примера [Загрузка на сервер](./upload): она отправляет изображение и завершается ошибкой, если сервер его не принял.

:::tabs key:framework
== JavaScript

```html
<label>
  Фото документа
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Документ, который вы прикрепили',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// Редактирование начинается, как только фото появилось на экране
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Этот файл не является изображением, которое может открыть браузер'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Отправка…'
  try {
    await upload(blob, type)
    status.textContent = 'Отправлено'
  }
  catch {
    status.textContent = 'Не удалось отправить документ'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'Этот файл не является изображением, которое может открыть браузер'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Отправка…'
  try {
    await upload(blob, type)
    status.value = 'Отправлено'
  }
  catch {
    status.value = 'Не удалось отправить документ'
  }
}
</script>

<template>
  <label>
    Фото документа
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="Документ, который вы прикрепили"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(file: File | undefined) {
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('Этот файл не является изображением, которое может открыть браузер')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Отправка…')
    try {
      await upload(blob, type)
      setStatus('Отправлено')
    }
    catch {
      setStatus('Не удалось отправить документ')
    }
  }

  return (
    <>
      <label>
        Фото документа
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="Документ, который вы прикрепили"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Примечания

- `capture="environment"` открывает заднюю камеру на телефонах, а компьютеры его игнорируют. Без него телефоны предлагают и камеру, и галерею, что подходит для документов, которые у пользователя уже есть.
- Как только фото загружено, просмотрщик открывает режим редактирования, и пользователь сразу переходит к инструментам «Выровнять» или «Очистить». Уберите слушатель `load`, чтобы сначала показать фото.
- `phase: 'load'` отличает файл, который браузер не может открыть, например фото HEIC вне Safari, от неудачной правки. Форматы перечислены в разделе [Загрузка изображений](../guide/loading#formats).
- Фото остаётся в браузере, пока кнопка «Применить» не вызовет `upload`. PaperPic сам ничего не отправляет.
- [`maxOutputSize`](../reference/options#maxoutputsize) уменьшает объём загрузки. У фото с телефона 12 мегапикселей и больше, а документы остаются читаемыми при 3000 пикселях по длинной стороне.
