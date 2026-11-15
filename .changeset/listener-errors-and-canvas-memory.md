---
"@paperpic/core": patch
"@paperpic/vue": patch
"@paperpic/react": patch
---

Fix several problems found in an audit of the viewer.

- A listener of `on()` that throws no longer looks like a failure of the viewer. An error inside an `apply` listener left "The changes could not be applied" over the applied image, and one inside a `load` listener discarded the image. The page now gets the error as any uncaught one, and the other listeners still run.
- `change` no longer fires while the user pans. The state does not hold the position of the image, so it carried the same state on every move of the pointer.
- The viewer now works under a Content Security Policy that requires Trusted Types. Its icons go through a policy named `paperpic`, so a policy that restricts them needs `trusted-types paperpic`. The worker starts there only if the page has a `default` policy that accepts its URL, and otherwise the editing runs on the main thread, as before.
- Apply and the previews free the memory of their canvases at once, which Safari on iOS limits.
- An image too large for the browser to read no longer reports that it comes from another origin. The error says to set `maxOutputSize`.
