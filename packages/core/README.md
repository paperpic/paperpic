# @paperpic/core

Framework-agnostic document image viewer and editor, for use with plain JavaScript or through a PaperPic wrapper such as [`@paperpic/vue`](https://www.npmjs.com/package/@paperpic/vue).

## Installation

```sh
pnpm add @paperpic/core
```

Documentation: [paperpic.dev](https://paperpic.dev)

## Styling

Import the stylesheet once in your app:

```ts
import '@paperpic/core/style.css'
```

The styles live in the `paperpic` cascade layer, so any of your CSS outside a layer overrides them, whatever its specificity. This includes global resets, such as a rule on `img`.

Set any of these custom properties on `:root`, on an ancestor or on `.paperpic`:

| Custom property                  | Default   | Description                         |
| -------------------------------- | --------- | ----------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | Background of the interface         |
| `--paperpic-color-text`          | `#1a263c` | Text of the interface               |
| `--paperpic-color-accent`        | `#0a84ff` | Accent of the interface             |
| `--paperpic-radius`              | `6px`     | Corner radius of the interface      |
| `--paperpic-transition-duration` | `0.2s`    | Duration of the rotation transition |

## Browser support

`@paperpic/core` targets browsers in [Baseline Widely Available](https://web.dev/baseline).
