---
"@paperpic/core": patch
"@paperpic/vue": patch
"@paperpic/react": patch
---

The viewer no longer makes the browser report "ResizeObserver loop completed with undelivered notifications", which it could do on load since it also watched the size of its toolbar.
