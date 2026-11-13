# @paperpic/core

## 0.2.0

### Minor Changes

- [#71](https://github.com/paperpic/paperpic/pull/71) [`9431e42`](https://github.com/paperpic/paperpic/commit/9431e42e564207b6151f18cf23adcf9e2d9738bc) Thanks [@Unlooper](https://github.com/Unlooper)! - Every public type has a description and a link to its page on paperpic.dev, which your editor shows on hover. Two types now have a name, with the same fields as before: the `source` of `PaperPicDownload` is a `PaperPicSource`, and the payload of the `load` event is a `Size`.
  
  `@paperpic/core` no longer exports `normalizeRotation`, which was never documented. If you used it, round the angle yourself: `((Math.round(degrees / 90) * 90) % 360 + 360) % 360`.

## 0.1.0

### Minor Changes

- [#65](https://github.com/paperpic/paperpic/pull/65) [`cd559ef`](https://github.com/paperpic/paperpic/commit/cd559ef89ef57945f7c28be264ae3ff04c5536d8) Thanks [@Unlooper](https://github.com/Unlooper)! - Initial release.
