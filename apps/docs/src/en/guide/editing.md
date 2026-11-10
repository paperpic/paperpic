---
title: Editing
description: How the edit mode of PaperPic works, from the Edit button to Apply, with the tools, Undo and Redo, the preview and the events your code receives.
---

# Editing

A photo of a document usually needs a few fixes before it is worth keeping. The edit mode groups them: the user makes the changes, checks them, and applies them all at once. The [playground](../playground) has the whole edit mode to try.

## The edit flow

1. The user presses Edit, the pencil in the toolbar. The edit bar appears at the bottom of the viewer.
2. Each tool in the edit bar adds an edit, which the viewer shows at once. Undo and Redo move through the edits.
3. Apply computes the result and goes back to viewing. Cancel discards the edits, and asks first when there are some.

Nothing changes the image until Apply. Before that, the edits are a list that the viewer previews.

## Tools

| Tool        | What it does                                                   | Id            |
| ----------- | -------------------------------------------------------------- | ------------- |
| Crop        | Keeps the part of the image inside four corners                | `crop`        |
| Straighten  | Turns a photo taken at an angle into a flat page               | `perspective` |
| Rotate left | Turns the image a quarter turn to the left                     | `rotate`      |
| Flip        | Mirrors the image left to right                                | `flip`        |
| Adjust      | Changes the brightness and the contrast                        | `adjust`      |
| Clean up    | Turns the document into crisp black and white, without shadows | `threshold`   |

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

Crop and Straighten have a selection of their own, so the rest of the edit bar waits while one of them is open. Done, or `Enter`, adds the selection to the edits, and Cancel this tool, or `Esc`, discards it.

## Preview and Apply

While editing, the viewer previews the edits on a copy of the image of about 2 megapixels, so it stays fast with large photos. Zoomed in, the preview looks softer than the result. Apply computes every edit at full resolution, or at [`maxOutputSize`](../reference/options#maxoutputsize), in a Web Worker.

Apply cannot be interrupted. It blocks the controls and shows a message while it runs. Then the result replaces the image on display, the history empties, and the viewer goes back to the view mode. If Apply fails, the edit stays open, so the user can try again.

## What your code receives

| Event    | When                                                                |
| -------- | ------------------------------------------------------------------- |
| `change` | After each action of the user, with the [state](../reference/state) |
| `apply`  | When the result is ready, with `{ blob, width, height, type }`      |
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
