---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Straighten now finds the document. As it opens, it looks for the document in the photo and places the four corners on it, so Done is ready without a drag. The corners slide there, unless the user prefers less motion. When it is not sure, the corners start inside the image and Done waits for a move, as before. It never moves a corner that the user has already touched.

The search runs in the worker, on a small copy of the photo, without dependencies or requests. The new label `perspectiveFound` says on screen and to screen readers that the document was found, and the `canConfirm` of the state turns `true`, with a `change`.

Fix the magnifier leaving the screen in a short viewer, where neither above nor below the finger has room for it. It now goes to its side.

Fix a viewer destroyed while it starts to process an image leaving a worker behind.
