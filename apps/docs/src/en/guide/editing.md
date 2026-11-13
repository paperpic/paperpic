---
title: Editing
description: How the edit mode of PaperPic works, from the Edit button to Apply, with the tools, Undo and Redo, the preview and the events your code receives.
---

# Editing

A photo of a document usually needs a few fixes before it is worth keeping. The edit mode groups them: the user makes the changes, checks them, and applies them all at once. The [playground](../playground) has the whole edit mode to try.

## The edit flow

1. The user presses Edit, the pencil in the toolbar. The toolbar hides, so nothing covers the image, and the edit bar appears at the bottom of the viewer.
2. Rotate left and Flip add an edit at once. The other tools open a panel in the edit bar, and Done adds what the user chose there as one edit. Undo and Redo move through the edits.
3. Apply computes the result and goes back to viewing. Cancel discards the edits, and asks first when there are some.

Nothing changes the image until Apply. Before that, the edits are a list that the viewer previews.

The edit bar has two rows of the same height in every state: the tools, or the panel of the open tool, above, and below, Cancel at the left and Apply, or Done, at the right. So the image keeps its place when a tool opens. In a viewer at least 28rem wide, the bar fits on one row. A dot marks Adjust and Clean up while their setting is in effect.

## Tools

| Tool                                   | What it does                                                   | Id            |
| -------------------------------------- | -------------------------------------------------------------- | ------------- |
| [Crop](./tools/crop)                   | Keeps the part of the image inside four corners                | `crop`        |
| [Straighten](./tools/straighten)       | Turns a photo taken at an angle into a flat page               | `perspective` |
| [Rotate left](./tools/rotate-and-flip) | Turns the image a quarter turn to the left                     | `rotate`      |
| [Flip](./tools/rotate-and-flip)        | Mirrors the image left to right                                | `flip`        |
| [Adjust](./tools/adjust)               | Changes the brightness and the contrast                        | `adjust`      |
| [Clean up](./tools/clean-up)           | Turns the document into crisp black and white, without shadows | `threshold`   |

The [`tools`](../reference/options#tools) option chooses which ones the edit bar offers:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Crop, Straighten, Adjust and Clean up open a panel in place of the tools, so the rest of the edit bar waits while one of them is open. Done, or `Enter`, adds what the tool chose to the edits, and Cancel this tool, or `Esc`, discards it.

Inside a panel, the image looks as the result will, Clean up included. Straighten is the exception: it shows the photo without Clean up, so the edges of the paper stay visible.

## Preview and Apply

While editing, the viewer previews the edits on a copy of the image of about 2 megapixels, so it stays fast with large photos. Zoomed in, the preview looks softer than the result. Apply computes every edit at full resolution, or at [`maxOutputSize`](../reference/options#maxoutputsize), in a Web Worker.

Apply cannot be interrupted. It blocks the controls and shows a message while it runs. Then the result replaces the image on display, the history empties, and the viewer goes back to the view mode. If Apply fails, the edit stays open, so the user can try again.

## What your code receives

| Event    | When                                                                |
| -------- | ------------------------------------------------------------------- |
| `apply`  | When the result is ready, with `{ blob, width, height, type }`      |
| `change` | After each action of the user, with the [state](../reference/state) |
| `error`  | When Apply fails, or when the image cannot be loaded                |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## What discards the edits

- Cancel, after the user confirms, or [`cancel()`](../reference/methods#cancel), which does not ask.
- A new `src` while editing.
- A change of `editable` while editing.

After Apply, passing the same `src` again does nothing, so the result stays on display. [`reload()`](../reference/methods#reload) brings back the original.

## Keyboard

With the focus on the viewer:

| Key                        | Action                                           |
| -------------------------- | ------------------------------------------------ |
| `Ctrl+Z`                   | Undo                                             |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo                                             |
| `Enter`                    | Confirm the open tool, or else apply the changes |
| `Esc`                      | Close the open tool, or else cancel the changes  |

On macOS, `Cmd` works like `Ctrl`.
