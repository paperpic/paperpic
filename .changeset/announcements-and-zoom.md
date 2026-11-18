---
"@paperpic/core": patch
"@paperpic/vue": patch
"@paperpic/react": patch
---

A message in the middle of the viewer, such as the one of a failed Apply, now stays on screen when the viewer announces another change, such as the zoom. Only the image is marked busy now, so screen readers no longer risk holding back "Applying changes" and "Loading image". `zoomTo()` throws a `RangeError` for a zoom of `NaN`, which left the viewer blank, and the cross and the ring of the magnifier have a dark outline, so they show on white paper.
