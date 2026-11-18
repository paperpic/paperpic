---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Three new tokens restyle what the viewer paints over the image: `--paperpic-color-dim` darkens the image around a selection, `--paperpic-color-line` colors the outline, the corner handles and the cross of the magnifier, and `--paperpic-color-line-shadow` the shadow that keeps those lines visible. The root `.paperpic` also carries `data-paperpic-status`, `data-paperpic-mode` and `data-paperpic-tool`, so CSS can follow the load status, the edit mode and the open tool.
