---
title: Custom toolbar
description: A complete example that hides the built-in toolbar of PaperPic and drives the viewer from buttons of your own, kept in step with the state of the viewer.
---

# Custom toolbar

When the controls of the viewer must match the rest of your interface, hide the built-in ones with `toolbar: false` and call the [methods](../reference/methods) from buttons of your own. This example offers zoom, Straighten, Undo and Apply, and enables each button only when it can act.

The [`change`](../reference/events#change) event carries the [state](../reference/state) after each action, including those your buttons start. `load` and `error` report the moments when the image arrives or Apply fails.

:::tabs key:framework
== JavaScript

```html
<div id="controls">
  <button type="button" data-action="zoomIn">Zoom in</button>
  <button type="button" data-action="zoomOut">Zoom out</button>
  <button type="button" data-action="edit">Edit</button>
  <button type="button" data-action="straighten">Straighten</button>
  <button type="button" data-action="confirmTool">Done</button>
  <button type="button" data-action="undo">Undo</button>
  <button type="button" data-action="cancel">Cancel</button>
  <button type="button" data-action="apply">Apply</button>
</div>
<div id="viewer" style="height: 480px"></div>
```

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'A receipt',
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
      Zoom in
    </button>
    <button type="button" @click="viewer?.zoomOut()">
      Zoom out
    </button>
    <template v-if="state.mode === 'view'">
      <button type="button" :disabled="state.status !== 'ready'" @click="viewer?.edit()">
        Edit
      </button>
    </template>
    <template v-else-if="state.activeTool">
      <button type="button" @click="viewer?.confirmTool()">
        Done
      </button>
    </template>
    <template v-else>
      <button type="button" @click="viewer?.openTool('perspective')">
        Straighten
      </button>
      <button type="button" :disabled="!state.canUndo || state.busy" @click="viewer?.undo()">
        Undo
      </button>
      <button type="button" @click="viewer?.cancel()">
        Cancel
      </button>
      <button type="button" :disabled="!state.canApply || state.busy" @click="viewer?.apply()">
        Apply
      </button>
    </template>
  </div>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      alt="A receipt"
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
          <button type="button" onClick={() => viewer().zoomIn()}>Zoom in</button>
          <button type="button" onClick={() => viewer().zoomOut()}>Zoom out</button>
          {state.mode === 'view' && (
            <button type="button" disabled={state.status !== 'ready'} onClick={() => viewer().edit()}>Edit</button>
          )}
          {state.mode === 'edit' && state.activeTool && (
            <button type="button" onClick={() => viewer().confirmTool()}>Done</button>
          )}
          {state.mode === 'edit' && !state.activeTool && (
            <>
              <button type="button" onClick={() => viewer().openTool('perspective')}>Straighten</button>
              <button type="button" disabled={!state.canUndo || state.busy} onClick={() => viewer().undo()}>Undo</button>
              <button type="button" onClick={() => viewer().cancel()}>Cancel</button>
              <button type="button" disabled={!state.canApply || state.busy} onClick={() => viewer().apply()}>Apply</button>
            </>
          )}
        </div>
      )}
      <div style={{ height: 480 }}>
        <PaperPic
          ref={picRef}
          src="/receipt.jpg"
          alt="A receipt"
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

## Notes

- With `toolbar: false`, the built-in edit bar is hidden too, so Crop and Straighten show their handles but no Done button. Your interface confirms them with [`confirmTool()`](../reference/methods#confirmtool), as `Enter` does.
- Sliders of your own can call [`setThreshold()`](../reference/methods#setthreshold) and [`setAdjustments()`](../reference/methods#setadjustments) directly, which adds one edit for each call. To leave one edit for a whole drag, open the tool with [`openTool()`](../reference/methods#opentool) first: the same methods then change what it shows, and `confirmTool()` keeps it.
- [`cancel()`](../reference/methods#cancel) does not ask before discarding the edits. Ask the user first if there are some, such as when `canApply` is true.
- The keyboard shortcuts keep working with the focus on the viewer. See [Accessibility](../guide/accessibility).
