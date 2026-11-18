---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Clean up now chooses a finish: the original, gray or black and white. Gray keeps brightness and contrast, so Adjust is disabled only in black and white. This release renames the API of Clean up, so code that uses it needs these changes:

- `setThreshold({ enabled, sensitivity })` is now `setFinish({ mode, sensitivity })`, where `mode` is `'original'`, `'gray'` or `'mono'`. Replace `enabled: true` with `mode: 'mono'`, and `enabled: false` with `mode: 'original'`.
- `getState().threshold` is now `getState().finish`, with `{ mode, sensitivity }` in place of `{ enabled, sensitivity }`.
- The tool id `'threshold'` is now `'finish'`, in `tools`, `openTool()` and `getState().activeTool`, and in the `data-paperpic-tool` attribute of the root.
- The `labels` keys `threshold`, `thresholdLevel` and `thresholdSensitivity` are now `finish`, `finishLevel` and `finishSensitivity`, with three new keys for the finishes: `finishOriginal`, `finishGray` and `finishMono`. The `data-paperpic-control` values follow them.
- The `icons` key `threshold` is now `finish`.
- The switch of Clean up is gone, and the original finish turns it off. Its classes, `paperpic-edit-switch`, `paperpic-edit-switch-track` and `paperpic-edit-switch-thumb`, are gone too.

The `FinishMode` type names the finishes.
