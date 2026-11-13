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

| Field         | Type                                         | Description                                                                                                             |
| ------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | The open tool, such as `'crop'` or `'adjust'`, or `null`                                                                |
| `adjustments` | `{ brightness, contrast }`                   | The brightness and the contrast, each from -1 to 1. Clean up leaves them out. While Adjust is open, the values it shows |
| `busy`        | `boolean`                                    | Whether Apply is running                                                                                                |
| `canApply`    | `boolean`                                    | Whether there are changes to apply. Rotations and flips that cancel out are no change                                   |
| `canRedo`     | `boolean`                                    | Whether there is an edit to bring back                                                                                  |
| `canUndo`     | `boolean`                                    | Whether there is an edit to undo                                                                                        |
| `fit`         | [`Fit \| null`](./types#fit)                 | The fit in effect, or `null` once the user has zoomed by hand                                                           |
| `image`       | [`Size \| null`](./types#size)               | The size of the image on display in pixels, with the edits so far, or `null` without an image                           |
| `mode`        | `'view' \| 'edit'`                           | Whether the user is viewing or editing the image                                                                        |
| `rotation`    | [`Rotation`](./types#rotation)               | How far the image on display is turned, in degrees clockwise                                                            |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Whether there is an image, and whether it loaded                                                                        |
| `threshold`   | `{ enabled, sensitivity }`                   | Whether Clean up is on, and its sensitivity from 0 to 1. While Clean up is open, what it shows                          |
| `zoom`        | `number`                                     | Screen pixels per pixel of the image                                                                                    |
