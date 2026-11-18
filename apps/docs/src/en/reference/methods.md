---
title: Methods
description: Every method of the PaperPic class, to control the viewer from your own code, such as zoom, fit, rotate, edit, apply, download and reload.
---

# Methods

The methods control the viewer from your own code, such as from buttons of your own with [`toolbar: false`](./options#toolbar). With the core, call them on the `PaperPic` you create. In Vue, the component exposes the viewer as `instance`, and in React, `ref` receives it. Both are `null` until the component mounts:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Zoom in
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Zoom in</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

In Vue and React, the component creates and destroys the viewer, and takes the options as props and the events as events of its own. So do not call [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions) or [`on()`](#on) there.

## Create and destroy

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Creates the viewer inside `container`, which it fills. Give the container a height, or the viewer stays at its minimum height. [Options](./options) lists what `options` takes.

It throws a `TypeError` if `container` is not an element. Create the viewer once the element exists, such as on mount. It throws a `RangeError` if an option is out of its range.

Only with the core: the Vue and React components create the viewer when they mount.

### `destroy()`

```ts
function destroy(): void
```

Removes the viewer and releases everything it holds, such as its worker and the memory of its images. Calling it twice is safe.

Only with the core: the Vue and React components call it when they unmount. Called on their viewer, it would leave the component empty.

## Options and state

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Changes the options you pass and keeps the others. `undefined` brings an option back to its default. It never emits `change`, so two-way bindings do not loop. It throws a `RangeError` if an option is out of its range, and then no option changes.

In Vue and React, change the props instead. The next change of any prop sends every option again, which would undo a change made with `setOptions()`.

### `getState()`

```ts
function getState(): PaperPicState
```

Returns the current state of the viewer, such as the zoom, the mode and whether there are changes to apply. To hear of each change instead of asking, listen to [`change`](./events#change). [State](./state) describes every field, and how the two fit together.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Listens to an event, and returns a function that stops listening. [Events](./events) describes each event.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

In Vue and React, listen to the events of the component instead, such as `@apply` or `onApply`.

## View

### `zoomIn()`

```ts
function zoomIn(): void
```

Zooms in one step, around the center of the viewer.

### `zoomOut()`

```ts
function zoomOut(): void
```

Zooms out one step, around the center of the viewer.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

Sets the zoom, where `1` shows one pixel of the image per screen pixel. [`point`](./types#viewpoint) stays in place: it is in CSS pixels from the top left corner of the viewer, and its center by default.

The zoom goes from the fit of the whole image, or `1` if that is smaller, up to `8`. A value out of range is clamped.

It throws a `RangeError` if `zoom` is `NaN` or a coordinate of `point` is not a finite number, and then the zoom does not change.

### `fit()`

```ts
function fit(fit: Fit): void
```

Fits the whole image, its width or its height to the viewer. `fit` is a [`Fit`](./types#fit): `'image'`, `'width'` or `'height'`.

## Editing

### `edit()`

```ts
function edit(): void
```

Starts editing. It does nothing if the image is not ready or [`editable`](./options#editable) is `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Turns the image a quarter turn: clockwise with `1`, the default, and counterclockwise with `-1`. While editing, it adds an edit that [`apply()`](#apply) makes permanent, and it does nothing while a tool is open or Apply runs. In a read-only viewer, it only changes the display. Otherwise, it does nothing.

### `flip()`

```ts
function flip(): void
```

Mirrors the image left to right as it is on display, so after a quarter turn it still mirrors left to right. To mirror it top to bottom, flip it and rotate it twice. It is an edit, and it does nothing outside the edit mode or while a tool is open.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Opens a tool with a panel: Crop (`'crop'`), Straighten (`'perspective'`), Adjust (`'adjust'`) or Clean up (`'finish'`), which chooses black and white as it opens when the finish is the original. The tool stays open until [`confirmTool()`](#confirmtool) or [`cancelTool()`](#canceltool). Meanwhile, no other edit can start, and Undo, Redo and Apply do nothing. It does nothing outside the edit mode, while another tool is open, for Adjust in black and white, and for Crop and Straighten while a preview is on its way.

### `confirmTool()`

```ts
function confirmTool(): void
```

Closes the open tool and adds what it chose to the edits, as `Enter` does: the selection of Crop or Straighten, or the settings of Adjust or Clean up, as one edit.

### `cancelTool()`

```ts
function cancelTool(): void
```

Closes the open tool and discards its changes, as `Esc` does.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

Chooses the finish of [Clean up](../guide/tools/clean-up): `'original'`, `'gray'` or `'mono'` for black and white. It also changes the sensitivity of black and white, from 0 to 1. The finish always runs after the other edits. While Clean up is open, it changes what Clean up shows, and [`confirmTool()`](#confirmtool) keeps it as one edit. It does nothing outside the edit mode or while another tool is open.

It throws a `RangeError` if `mode` is not a [`FinishMode`](./types#finishmode), or if `sensitivity` is not between 0 and 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Changes the brightness or the contrast, each from -1 to 1, where 0 leaves the image as it is. They run after the other edits, and before gray. While Adjust is open, it changes what Adjust shows, and [`confirmTool()`](#confirmtool) keeps it as one edit. It does nothing outside the edit mode, while another tool is open or in black and white: black and white compares each pixel with its surroundings, so brightness and contrast would barely change its result.

It throws a `RangeError` if a value is not between -1 and 1.

### `undo()`

```ts
function undo(): void
```

Undoes the last edit. It does nothing outside the edit mode, while a tool is open or while Apply runs.

### `redo()`

```ts
function redo(): void
```

Brings back the last edit undone. It does nothing outside the edit mode, while a tool is open or while Apply runs.

### `apply()`

```ts
function apply(): Promise<void>
```

Applies the edits at full resolution, or at [`maxOutputSize`](./options#maxoutputsize). The result becomes the image on display, the history empties, the viewer goes back to the view mode, and the [`apply`](./events#apply) event carries the result. Apply cannot be interrupted, and it blocks the controls while it runs. It does nothing outside the edit mode, while a tool is open, or when there is nothing to apply.

If it fails, the [`error`](./events#error) event reports it and the edit stays open. The promise resolves when Apply ends, also when it fails, so listen to `error` instead of catching it.

### `cancel()`

```ts
function cancel(): void
```

Discards the edits and goes back to the view mode. It does not ask first: the built-in Cancel button and `Esc` do. It does nothing while Apply runs.

## Image

### `download()`

```ts
function download(): void
```

Saves the image on display as a file: the result of the last Apply, or else the source. It works without the [`download`](./options#download) option, which only shows a button. The [`download`](./events#download) event comes first and can stop it. It does nothing while editing, because the edits are not applied yet. Before the first Apply, a `src` from another origin opens in the browser instead: see [Saving the result](../guide/saving#download).

### `reload()`

```ts
function reload(): void
```

Loads the current [`src`](./options#src) again, which brings back the original after an Apply. While editing, it discards the edits. Without a `src`, it does nothing.
