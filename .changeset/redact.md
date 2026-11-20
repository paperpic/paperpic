---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Add Redact, a tool that covers an area with solid black or white, such as an account number or a signature. The area is a rectangle that moves as a whole, turns by a handle to lean with a line of text, and resizes by its corners. Each Done leaves one area, which follows the edits after it and runs after Adjust and Clean up, and Apply writes it into the pixels of the result. `setRedaction({ color })` chooses the color, `getState().redaction` reports it, and the new type `RedactColor` names it. The tool id is `'redact'`, and it joins the edit bar by default: pass `tools` without it to leave it out.
