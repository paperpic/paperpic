---
title: Своя панель инструментов
description: Полный пример, который скрывает встроенную панель инструментов PaperPic и управляет просмотрщиком собственными кнопками, согласованными с его состоянием.
---

# Своя панель инструментов

Когда элементы управления просмотрщика должны совпадать с остальным интерфейсом, скройте встроенные через `toolbar: false` и вызывайте [методы](../reference/methods) из своих кнопок. Этот пример предлагает масштаб, «Выровнять», «Отменить» и «Применить» и включает каждую кнопку, только когда она может сработать.

Событие [`change`](../reference/events#change) передаёт [состояние](../reference/state) после каждого действия, включая запущенные вашими кнопками. `load` и `error` сообщают, когда пришло изображение или не удалось применение.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Увеличить</button>
  <button type="button" data-action="zoomOut">Уменьшить</button>
  <button type="button" data-action="edit">Редактировать</button>
  <button type="button" data-action="straighten">Выровнять</button>
  <button type="button" data-action="confirmTool">Готово</button>
  <button type="button" data-action="cancelTool">Отменить этот инструмент</button>
  <button type="button" data-action="undo">Отменить</button>
  <button type="button" data-action="cancel">Отмена</button>
  <button type="button" data-action="apply">Применить</button>
</div>
<p id="hint"></p>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Кассовый чек',
  toolbar: false,
})

const actions: Record<string, () => void> = {
  zoomIn: () => pic.zoomIn(),
  zoomOut: () => pic.zoomOut(),
  edit: () => pic.edit(),
  straighten: () => pic.openTool('perspective'),
  confirmTool: () => pic.confirmTool(),
  cancelTool: () => pic.cancelTool(),
  undo: () => pic.undo(),
  cancel: () => pic.cancel(),
  apply: () => pic.apply(),
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]')
for (const button of buttons) {
  button.addEventListener('click', () => actions[button.dataset.action!]!())
}

function update({ status, mode, activeTool, hint, canUndo, canApply, canConfirm, busy }: PaperPicState) {
  const editing = mode === 'edit'
  const visible: Record<string, boolean> = {
    zoomIn: true,
    zoomOut: true,
    edit: !editing,
    straighten: editing && !activeTool,
    confirmTool: Boolean(activeTool),
    cancelTool: Boolean(activeTool),
    undo: editing && !activeTool,
    cancel: editing && !activeTool,
    apply: editing && !activeTool,
  }
  for (const button of buttons) {
    const action = button.dataset.action!
    button.hidden = !visible[action]
  }
  document.querySelector<HTMLButtonElement>('[data-action="edit"]')!.disabled = status !== 'ready'
  document.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled = !canUndo || busy
  document.querySelector<HTMLButtonElement>('[data-action="confirmTool"]')!.disabled = !canConfirm
  document.querySelector<HTMLButtonElement>('[data-action="apply"]')!.disabled = !canApply || busy
  document.querySelector('#hint')!.textContent = hint ?? ''
}

pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
update(pic.getState())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { computed, shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef<InstanceType<typeof PaperPic>>('pic')
const viewer = computed(() => pic.value?.instance)
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = viewer.value?.getState()
}
</script>

<template>
  <div v-if="state">
    <button type="button" @click="viewer?.zoomIn()">
      Увеличить
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Уменьшить
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Редактировать
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <p v-if="state.hint">
        {{ state.hint }}
      </p>
      <button type="button" :disabled="!state.canConfirm" @click="viewer?.confirmTool()">
        Готово
      </button>
      <button type="button" @click="viewer?.cancelTool()">
        Отменить этот инструмент
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Выровнять
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Отменить
      </button>
      <button type="button" @click="viewer?.cancel()">
        Отмена
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Применить
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Кассовый чек"
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

  const viewer = () => picRef.current!

  return (
    <>
      {state && (
        <div>
          <button type="button" onClick={() => viewer().zoomIn()}>Увеличить</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Уменьшить</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Редактировать</button>
          )}
          {state.hint && <p>{state.hint}</p>}
          {state.mode === 'edit' && state.activeTool && (
            <>
              <button type="button" disabled={!state.canConfirm} onClick={() => viewer().confirmTool()}>Готово</button>
              <button type="button" onClick={() => viewer().cancelTool()}>Отменить этот инструмент</button>
            </>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Выровнять</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Отменить</button>
              <button type="button" onClick={() => viewer().cancel()}>Отмена</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Применить</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Кассовый чек"
          toolbar={false}
          onChange={setState}
          onLoad={refresh}
          onError={refresh}
        />
      </div>
    </>
  )
}
```

:::

## Свой ползунок {#slider}

Свой ползунок для инструмента «Очистить» сначала открывает его. Затем каждое движение вызывает `setFinish()`, который меняет то, что показывает «Очистить», а `confirmTool()` сохраняет последнее значение как одну правку. Здесь кнопка «Готово» ещё и применяет результат, а кнопка «Отмена» выходит из режима редактирования, так что эти элементы и есть весь интерфейс.

:::tabs key:framework
== JavaScript

```html
<button id="clean-up" type="button">Очистить</button>
<div id="ruler" hidden>
  <label>
    Чувствительность
    <input id="sensitivity" type="range" min="0" max="1" step="0.05" />
  </label>
  <button id="done" type="button">Готово</button>
  <button id="cancel" type="button">Отмена</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Кассовый чек',
  toolbar: false,
})
const slider = document.querySelector<HTMLInputElement>('#sensitivity')!

document.querySelector('#clean-up')!.addEventListener('click', () => {
  pic.edit()
  pic.openTool('finish')
})
slider.addEventListener('input', () => pic.setFinish({ sensitivity: slider.valueAsNumber }))
document.querySelector('#done')!.addEventListener('click', () => {
  pic.confirmTool()
  pic.apply()
})
document.querySelector('#cancel')!.addEventListener('click', () => {
  pic.cancelTool()
  pic.cancel()
})

pic.on('change', ({ activeTool, finish }) => {
  const open = activeTool === 'finish'
  document.querySelector<HTMLElement>('#ruler')!.hidden = !open
  document.querySelector<HTMLElement>('#clean-up')!.hidden = open
  slider.value = String(finish.sensitivity)
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { computed, shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef<InstanceType<typeof PaperPic>>('pic')
const viewer = computed(() => pic.value?.instance)
const state = shallowRef<PaperPicState>()

function open() {
  viewer.value?.edit()
  viewer.value?.openTool('finish')
}

function slide(event: Event) {
  viewer.value?.setFinish({ sensitivity: (event.target as HTMLInputElement).valueAsNumber })
}

function done() {
  viewer.value?.confirmTool()
  viewer.value?.apply()
}

function cancel() {
  viewer.value?.cancelTool()
  viewer.value?.cancel()
}
</script>

<template>
  <div v-if="state?.activeTool === 'finish'">
    <label>
      Чувствительность
      <input type="range" min="0" max="1" step="0.05" :value="state.finish.sensitivity" @input="slide">
    </label>
    <button type="button" @click="done">
      Готово
    </button>
    <button type="button" @click="cancel">
      Отмена
    </button>
  </div>
  <button v-else type="button" :disabled="state?.status !== 'ready'" @click="open">
    Очистить
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="Кассовый чек"
      :toolbar="false"
      @change="next => (state = next)"
      @load="state = viewer?.getState()"
      @error="state = viewer?.getState()"
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

export function CleanUpRuler() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()
  const viewer = () => picRef.current!

  function open() {
    viewer().edit()
    viewer().openTool('finish')
  }

  function done() {
    viewer().confirmTool()
    viewer().apply()
  }

  function cancel() {
    viewer().cancelTool()
    viewer().cancel()
  }

  return (
    <>
      {state?.activeTool === 'finish'
        ? (
            <div>
              <label>
                Чувствительность
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.finish.sensitivity}
                  onChange={event => viewer().setFinish({ sensitivity: event.target.valueAsNumber })}
                />
              </label>
              <button type="button" onClick={done}>Готово</button>
              <button type="button" onClick={cancel}>Отмена</button>
            </div>
          )
        : (
            <button type="button" disabled={state?.status !== 'ready'} onClick={open}>Очистить</button>
          )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="Кассовый чек"
          toolbar={false}
          onChange={setState}
          onLoad={() => setState(viewer().getState())}
          onError={() => setState(viewer().getState())}
        />
      </div>
    </>
  )
}
```

:::

## Примечания

- С `toolbar: false` скрыта и встроенная панель редактирования, поэтому «Обрезать» и «Выровнять» показывают маркеры, но не кнопку «Готово». Ваш интерфейс подтверждает их через [`confirmTool()`](../reference/methods#confirmtool), как `Enter`. Чтобы закрыть их без изменений, вызовите [`cancelTool()`](../reference/methods#canceltool), как это делает `Esc`.
- Пока открыт «Обрезать» или «Выровнять», `hint` в состоянии говорит, что делать, например «Drag the corners», как встроенная панель редактирования. Покажите его, потому что с `toolbar: false` больше ничто его не показывает. Новая подсказка, например после нажатия на угол или когда «Выровнять» находит документ, приходит с `change`.
- `canConfirm` в состоянии говорит, может ли `confirmTool()` сохранить то, что показывает инструмент. «Выровнять» ждёт, пока не найдёт документ или пользователь не сдвинет угол, поэтому до этого отключите вашу кнопку «Готово».
- Ваши собственные ползунки могут напрямую вызывать [`setFinish()`](../reference/methods#setfinish) и [`setAdjustments()`](../reference/methods#setadjustments), и каждый вызов добавляет изменение. Чтобы всё перетаскивание дало одно изменение, сначала откройте инструмент через [`openTool()`](../reference/methods#opentool): тогда те же методы меняют то, что он показывает, а `confirmTool()` сохраняет это.
- [`cancel()`](../reference/methods#cancel) не спрашивает перед отменой изменений. Если они есть, спросите пользователя сами, например когда `canApply` равно true.
- Сочетания клавиш продолжают работать, когда фокус на просмотрщике. См. [Доступность](../guide/accessibility).
