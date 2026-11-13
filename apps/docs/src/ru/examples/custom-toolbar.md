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
  <button type="button" data-action="undo">Отменить</button>
  <button type="button" data-action="cancel">Отмена</button>
  <button type="button" data-action="apply">Применить</button>
</div>
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
  undo: () => pic.undo(),
  cancel: () => pic.cancel(),
  apply: () => pic.apply(),
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-action]')
for (const button of buttons) {
  button.addEventListener('click', () => actions[button.dataset.action!]!())
}

function update({ status, mode, activeTool, canUndo, canApply, busy }: PaperPicState) {
  const editing = mode === 'edit'
  const visible: Record<string, boolean> = {
    zoomIn: true,
    zoomOut: true,
    edit: !editing,
    straighten: editing && !activeTool,
    confirmTool: Boolean(activeTool),
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
  document.querySelector<HTMLButtonElement>('[data-action="apply"]')!.disabled = !canApply || busy
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
      <button type="button" @click="viewer?.confirmTool()">
        Готово
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
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>Готово</button>
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

## Примечания

- С `toolbar: false` скрыта и встроенная панель редактирования, поэтому «Обрезать» и «Выровнять» показывают маркеры, но не кнопку «Готово». Ваш интерфейс подтверждает их через [`confirmTool()`](../reference/methods#confirmtool), как `Enter`.
- Ваши собственные ползунки могут напрямую вызывать [`setThreshold()`](../reference/methods#setthreshold) и [`setAdjustments()`](../reference/methods#setadjustments), и каждый вызов добавляет изменение. Чтобы всё перетаскивание дало одно изменение, сначала откройте инструмент через [`openTool()`](../reference/methods#opentool): тогда те же методы меняют то, что он показывает, а `confirmTool()` сохраняет это.
- [`cancel()`](../reference/methods#cancel) не спрашивает перед отменой изменений. Если они есть, спросите пользователя сами, например когда `canApply` равно true.
- Сочетания клавиш продолжают работать, когда фокус на просмотрщике. См. [Доступность](../guide/accessibility).
