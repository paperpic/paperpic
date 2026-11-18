---
"@paperpic/core": patch
"@paperpic/vue": patch
"@paperpic/react": patch
---

A long message in the middle of the viewer, such as a translated failure, now wraps instead of being cut off, and stays centered on pages written right to left. Buttons and corner handles measure 44 pixels on any device with a touch screen, also on a laptop whose main pointer is a trackpad. Closing a tool whose button `tools` hides no longer loses the keyboard focus, and screen readers hear the question before discarding the changes as a group named by it, not as a dialog. The `error` event always carries an `Error`, the canvas stays sharp when the window moves to a screen of another density, and a pan no longer measures the toolbar on every move.
