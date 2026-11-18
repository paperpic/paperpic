---
title: State
description: What getState() returns and the change event carries, such as the status of the image, the mode, the zoom, the edits and whether there is something to apply, and how to keep controls of your own in step with it.
---

# State

The state is a snapshot of the viewer: whether there is an image, the mode, the zoom, the open tool and whether there are changes to apply. You get it in two ways, and both give the same [`PaperPicState`](./types#paperpicstate) object:

- [`getState()`](./methods#getstate) returns it whenever you ask.
- The [`change`](./events#change) event sends it each time the user or a method changes it.

## Keeping controls in step {#in-step}

`change` does not report the image. A loaded image comes with [`load`](./events#load), and a load or an Apply that fails comes with [`error`](./events#error). To keep controls of your own in step, such as an Apply button, read the state at the start, take it from each `change`, and read it again on `load` and `error`:

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
    Apply
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
        Apply
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

In Vue and React the viewer exists only once the component mounts, so the state starts as `undefined` and arrives with the first `load` or `error`. Until then, there is nothing to apply.

## Fields

| Field         | Type                                         | Description                                                                                                                                                                 |
| ------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | The open tool, such as `'crop'` or `'adjust'`, or `null`                                                                                                                    |
| `adjustments` | `{ brightness, contrast }`                   | The brightness and the contrast, each from -1 to 1. They do not apply in black and white. While Adjust is open, they are the values on its panel                            |
| `busy`        | `boolean`                                    | Whether Apply is running                                                                                                                                                    |
| `canApply`    | `boolean`                                    | Whether there are changes to apply. Rotations and flips that cancel out are no change                                                                                       |
| `canRedo`     | `boolean`                                    | Whether there is an edit to bring back                                                                                                                                      |
| `canUndo`     | `boolean`                                    | Whether there is an edit to undo                                                                                                                                            |
| `finish`      | `{ mode, sensitivity }`                      | The finish of Clean up, a [`FinishMode`](./types#finishmode), and the sensitivity of black and white, from 0 to 1. While Clean up is open, they are the values on its panel |
| `fit`         | [`Fit \| null`](./types#fit)                 | The fit in effect, or `null` once the user has zoomed by hand                                                                                                               |
| `hint`        | `string \| null`                             | What the open tool asks of the user, as the built-in edit bar shows it, such as "Drag the corners", or `null`. With `toolbar: false`, show it in your interface             |
| `image`       | [`Size \| null`](./types#size)               | The size of the image in pixels, at full resolution and with the edits so far, but without the turn of `rotation`, or `null` without an image                               |
| `mode`        | `'view' \| 'edit'`                           | Whether the user is viewing or editing the image                                                                                                                            |
| `rotation`    | [`Rotation`](./types#rotation)               | How far the image on display is turned from `image`, in degrees clockwise                                                                                                   |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` without `src`, `'loading'` while it loads, `'ready'` once it is on display, and `'error'` if it could not be loaded                                               |
| `zoom`        | `number`                                     | Screen pixels per pixel of the image                                                                                                                                        |

With a `rotation` of 90 or 270, the image on screen, and the result of Apply, have the width and the height of `image` swapped. [`maxOutputSize`](./options#maxoutputsize) can make the result smaller.
