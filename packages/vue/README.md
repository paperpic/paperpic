# @paperpic/vue

Vue 3 components to view and edit document images with PaperPic.

## Installation

```sh
pnpm add @paperpic/vue
```

Documentation: [paperpic.dev](https://paperpic.dev)

## Usage

The viewer fills its parent element, so give the parent a height:

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="A receipt" :editable="false" />
  </div>
</template>
```

| Prop        | Type                      | Default | Description                                                                           |
| ----------- | ------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `src`       | `string \| Blob \| File`  |         | The image: a URL from the same origin, or a file attached on the client               |
| `alt`       | `string`                  | `''`    | Describes the image for screen readers                                                |
| `editable`  | `boolean`                 | `true`  | With `false` it is a read-only viewer, whose toolbar can also rotate the image        |
| `toolbar`   | `boolean`                 | `true`  | Shows the built-in toolbar. Without it, build your own with the methods of `instance` |
| `wheelZoom` | `boolean`                 | `true`  | Whether the wheel zooms. Turn it off when the viewer sits in a long page              |
| `labels`    | `Partial<PaperPicLabels>` |         | Replaces any of the texts, which are in English by default                            |

It emits `load`, `error` and `change`, and exposes the viewer as `instance`, with the methods of [`@paperpic/core`](https://www.npmjs.com/package/@paperpic/core).

## Styling

Import the stylesheet once in your app:

```ts
import '@paperpic/vue/style.css'
```

The styles live in the `paperpic` cascade layer, so any of your CSS outside a layer overrides them, whatever its specificity. This includes global resets, such as a rule on `img`.

Set any of these custom properties on `:root`, on an ancestor or on `.paperpic`:

| Custom property                  | Default   | Description                           |
| -------------------------------- | --------- | ------------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | Background of the interface           |
| `--paperpic-color-text`          | `#1a263c` | Text of the interface                 |
| `--paperpic-color-accent`        | `#0a84ff` | Accent of the interface               |
| `--paperpic-radius`              | `6px`     | Corner radius of the interface        |
| `--paperpic-transition-duration` | `0.2s`    | Duration of the interface transitions |

## Browser support

`@paperpic/vue` targets browsers in [Baseline Widely Available](https://web.dev/baseline).
