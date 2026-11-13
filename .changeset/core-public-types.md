---
"@paperpic/core": minor
---

Every public type has a description and a link to its page on paperpic.dev, which your editor shows on hover. Two types now have a name, with the same fields as before: the `source` of `PaperPicDownload` is a `PaperPicSource`, and the payload of the `load` event is a `Size`.

`@paperpic/core` no longer exports `normalizeRotation`, which was never documented. If you used it, round the angle yourself: `((Math.round(degrees / 90) * 90) % 360 + 360) % 360`.
