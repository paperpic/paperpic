---
title: Состояние
description: Что возвращает getState() и отправляет событие change, например статус изображения, режим, масштаб, изменения и есть ли что применять, и как синхронизировать с ним свои элементы управления.
---

# Состояние

Состояние — это снимок просмотрщика: есть ли изображение, режим, масштаб, открытый инструмент и есть ли изменения для применения. Получить его можно двумя способами, и оба дают один и тот же объект [`PaperPicState`](./types#paperpicstate):

- [`getState()`](./methods#getstate) возвращает его, когда вы спрашиваете.
- Событие [`change`](./events#change) отправляет его каждый раз, когда его меняет пользователь или метод.

## Синхронизация своих элементов управления {#in-step}

`change` не сообщает об изображении. Загруженное изображение приходит с [`load`](./events#load), а неудачная загрузка или применение — с [`error`](./events#error). Чтобы синхронизировать свои элементы управления, например кнопку «Применить», прочитайте состояние в начале, берите его из каждого `change` и читайте заново на `load` и `error`:

:::tabs key:framework
== JavaScript

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const applyButton = document.querySelector<HTMLButtonElement>('#apply')!
const pic = new PaperPic(container, { src: '/receipt.jpg', toolbar: false })

function update({ canApply, busy }: PaperPicState) {
  applyButton.disabled = !canApply || busy
}

update(pic.getState())
pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
applyButton.addEventListener('click', () => pic.apply())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = pic.value?.instance?.getState()
}
</script>

<template>
  <button type="button" :disabled="!state || !state.canApply || state.busy" @click="pic?.instance?.apply()">
    Применить
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      :toolbar="false"
      @change="next => (state = next)"
      @load="refresh"
      @error="refresh"
    />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()

  function refresh() {
    setState(picRef.current?.getState())
  }

  return (
    <>
      <button type="button" disabled={!state || !state.canApply || state.busy} onClick={() => picRef.current?.apply()}>
        Применить
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

В Vue и React просмотрщик появляется только после монтирования компонента, поэтому состояние сначала равно `undefined` и приходит с первым `load` или `error`. До этого применять нечего.

## Поля

| Поле          | Тип                                          | Описание                                                                                                                                                                                                 |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | Открытый инструмент, например `'crop'` или `'adjust'`, или `null`                                                                                                                                        |
| `adjustments` | `{ brightness, contrast }`                   | Яркость и контрастность, каждая от -1 до 1. Не действуют в чёрно-белом режиме. Пока «Настроить» открыт — значения в его элементах управления                                                             |
| `busy`        | `boolean`                                    | Идёт ли применение                                                                                                                                                                                       |
| `canApply`    | `boolean`                                    | Есть ли изменения для применения. Повороты и отражения, которые компенсируют друг друга, не считаются                                                                                                    |
| `canConfirm`  | `boolean`                                    | Может ли [`confirmTool()`](./methods#confirmtool) сохранить то, что показывает открытый инструмент. «Выровнять» ждёт, пока не найдёт документ или не сдвинут угол. Без открытого инструмента это `false` |
| `canRedo`     | `boolean`                                    | Есть ли изменение для повтора                                                                                                                                                                            |
| `canUndo`     | `boolean`                                    | Есть ли изменение для отмены                                                                                                                                                                             |
| `finish`      | `{ mode, sensitivity }`                      | Обработка в «Очистить», [`FinishMode`](./types#finishmode), и чувствительность чёрно-белого режима от 0 до 1. Пока «Очистить» открыт — значения в его элементах управления                               |
| `fit`         | [`Fit \| null`](./types#fit)                 | Действующая подгонка или `null`, как только пользователь масштабировал вручную                                                                                                                           |
| `hint`        | `string \| null`                             | Что открытый инструмент просит от пользователя, как это показывает встроенная панель редактирования, например «Drag the corners», или `null`. С `toolbar: false` покажите это в своём интерфейсе         |
| `image`       | [`Size \| null`](./types#size)               | Размер изображения в пикселях в полном разрешении с учётом сделанных изменений, но без поворота из `rotation`, или `null` без изображения                                                                |
| `mode`        | `'view' \| 'edit'`                           | Просматривает пользователь изображение или редактирует                                                                                                                                                   |
| `paper`       | `{ size }`                                   | Формат бумаги в элементах управления «Выровнять», [`PaperSize`](./types#papersize), пока он открыт, иначе `'auto'`                                                                                       |
| `redaction`   | `{ color }`                                  | Цвет «Закрасить», [`RedactColor`](./types#redactcolor): пока инструмент открыт, это цвет в его элементах управления, иначе цвет следующей области                                                        |
| `rotation`    | [`Rotation`](./types#rotation)               | Насколько изображение на экране повёрнуто относительно `image`, в градусах по часовой стрелке                                                                                                            |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` без `src`, `'loading'` во время загрузки, `'ready'`, когда оно на экране, и `'error'`, если его не удалось загрузить                                                                           |
| `zoom`        | `number`                                     | Пиксели экрана на пиксель изображения                                                                                                                                                                    |

При `rotation`, равном 90 или 270, у изображения на экране и у результата применения ширина и высота `image` меняются местами. [`maxOutputSize`](./options#maxoutputsize) может сделать результат меньше.
