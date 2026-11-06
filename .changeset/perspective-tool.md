---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the Straighten tool, which corrects the perspective of a document from its 4 corners. The edit bar offers it by default, as `perspective` in `tools`, and it opens with `openTool('perspective')`. It estimates the proportions of the document, and the new `aspectRatio` option fixes them when they are known, as width divided by height.
