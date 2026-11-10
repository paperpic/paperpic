---
title: State
description: What getState() returns and the change event carries, such as the status of the image, the mode, the zoom, the edits and whether there is something to apply.
---

# State

The state describes what the viewer shows at a given moment. [`getState()`](./methods#getstate) returns it, and the [`change`](./events#change) event carries it. Use it to keep controls of your own in step, such as an Apply button:

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Field         | Type                                         | Description                                                                                   |
| ------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Whether there is an image, and whether it loaded                                              |
| `mode`        | `'view' \| 'edit'`                           | Whether the user is viewing or editing the image                                              |
| `image`       | `{ width, height } \| null`                  | The size of the image on display in pixels, with the edits so far, or `null` without an image |
| `zoom`        | `number`                                     | Screen pixels per pixel of the image                                                          |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | The fit in effect, or `null` once the user has zoomed by hand                                 |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | How far the image on display is turned, in degrees clockwise                                  |
| `canUndo`     | `boolean`                                    | Whether there is an edit to undo                                                              |
| `canRedo`     | `boolean`                                    | Whether there is an edit to bring back                                                        |
| `canApply`    | `boolean`                                    | Whether there are changes to apply. Rotations and flips that cancel out are no change         |
| `busy`        | `boolean`                                    | Whether Apply is running                                                                      |
| `activeTool`  | `ToolId \| null`                             | The open tool, `'crop'` or `'perspective'`, or `null`                                         |
| `threshold`   | `{ enabled, sensitivity }`                   | Whether Clean up is on, and its sensitivity from 0 to 1                                       |
| `adjustments` | `{ brightness, contrast }`                   | The brightness and the contrast, each from -1 to 1. Clean up leaves them out                  |
