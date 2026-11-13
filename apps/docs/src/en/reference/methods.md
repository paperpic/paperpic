---
title: Methods
description: Every method of the PaperPic class, to control the viewer from your own code, such as zoom, fit, rotate, edit, apply, download and reload.
---

# Methods

The methods control the viewer from your own code, such as from buttons of your own with [`toolbar: false`](./options#toolbar). In Vue and React, the component ref gives you the viewer: see [Vue](./vue) and [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Create and destroy

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Creates the viewer inside `container`, which it fills. Give the container a height, or the viewer stays at its minimum height. [Options](./options) lists what `options` takes.

It throws a `TypeError` if `container` is not an element. Create the viewer once the element exists, such as on mount.

### `destroy()`

```ts
function destroy(): void
```

Removes the viewer and releases everything it holds, such as its worker and the memory of its images. Calling it twice is safe.

## Options and state

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Changes the options you pass and keeps the others. `undefined` brings an option back to its default. It never emits `change`, so two-way bindings do not loop.

### `getState()`

```ts
function getState(): PaperPicState
```

Returns what the viewer is showing, such as the zoom, the mode and whether there are changes to apply. [State](./state) describes every field.

### `on()`

```ts
function on(name: keyof PaperPicEvents, listener: (payload) => void): () => void
```

Listens to an event, and returns a function that stops listening. [Events](./events) describes each event.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

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
function zoomTo(zoom: number, point?: { x: number, y: number }): void
```

Sets the zoom, where `1` shows one pixel of the image per screen pixel. `point` stays in place: it is in CSS pixels from the top left corner of the viewer, and its center by default.

The zoom goes from the fit of the whole image, or `1` if that is smaller, up to `8`. A value out of range is clamped.

### `fit()`

```ts
function fit(fit: 'image' | 'width' | 'height'): void
```

Fits the whole image, its width or its height to the viewer.

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

Turns the image a quarter turn: clockwise with `1`, the default, and counterclockwise with `-1`. While editing, it is an edit that [`apply()`](#apply) makes permanent. In a read-only viewer, it only changes the display. Otherwise, it does nothing.

### `flip()`

```ts
function flip(): void
```

Mirrors the image left to right as it is on display, so after a quarter turn it still mirrors left to right. To turn the image upside down, flip it and rotate it twice. It is an edit, and it does nothing outside the edit mode or while a tool is open.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Opens a tool with a panel: Crop, with `'crop'`, Straighten, with `'perspective'`, Adjust, with `'adjust'`, or Clean up, with `'threshold'`, which turns on as it opens. The tool stays open until [`confirmTool()`](#confirmtool) or [`cancelTool()`](#canceltool), and meanwhile the other edits, Undo, Redo and Apply do nothing. It does nothing outside the edit mode, while another tool is open, for Adjust while Clean up is on, and for Crop and Straighten while a preview is on its way.

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

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Turns Clean up on or off, or changes its sensitivity, from 0 to 1. Clean up always runs after the other edits. While Clean up is open, it changes what Clean up shows, and [`confirmTool()`](#confirmtool) keeps it as one edit. It does nothing outside the edit mode or while another tool is open.

It throws a `RangeError` if `sensitivity` is not between 0 and 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Changes the brightness or the contrast, each from -1 to 1, where 0 leaves the image as it is. They run after the other edits. While Adjust is open, it changes what Adjust shows, and [`confirmTool()`](#confirmtool) keeps it as one edit. It does nothing outside the edit mode, while another tool is open or while Clean up is on, because a cleaned up document has tones of its own.

It throws a `RangeError` if a value is not between -1 and 1.

### `undo()`

```ts
function undo(): void
```

Undoes the last edit.

### `redo()`

```ts
function redo(): void
```

Brings back the last edit undone.

### `apply()`

```ts
function apply(): Promise<void>
```

Applies the edits at full resolution, or at [`maxOutputSize`](./options#maxoutputsize). The result becomes the image on display, the history empties, the viewer goes back to the view mode, and the [`apply`](./events#apply) event carries the result. Apply cannot be interrupted, and it blocks the controls while it runs.

If it fails, the [`error`](./events#error) event reports it and the edit stays open.

### `cancel()`

```ts
function cancel(): void
```

Discards the edits and goes back to the view mode. It does not ask first: the built-in Cancel button and `Esc` do.

## Image

### `download()`

```ts
function download(): void
```

Saves the image on display as a file: the result of the last Apply, or else the source. It works without the [`download`](./options#download) option, which only shows a button. The [`download`](./events#download) event comes first and can stop it. It does nothing while editing, because the edits are not applied yet.

### `reload()`

```ts
function reload(): void
```

Loads the current [`src`](./options#src) again, which brings back the original after an Apply.
