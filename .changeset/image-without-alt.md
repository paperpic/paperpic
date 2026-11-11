---
"@paperpic/core": patch
"@paperpic/vue": patch
---

Without `alt`, screen readers now skip the image, as they skip an `<img>` with an empty `alt`. Before, they found an image with no name, which breaks WCAG.
