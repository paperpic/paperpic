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

function save({ blob }: { blob: Blob }) {
  // Upload the edited image
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="A receipt" @apply="save" />
  </div>
</template>
```

The pencil opens the edit mode. When the user applies the changes, the result replaces the image on display and the `apply` event carries it. With `:editable="false"` it is a read-only viewer.

| Prop            | Type                      | Default              | Description                                                                          |
| --------------- | ------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| `src`           | `string \| Blob \| File`  |                      | The image: a URL from the same origin, or a file attached on the client              |
| `alt`           | `string`                  | `''`                 | Describes the image for screen readers                                               |
| `editable`      | `boolean`                 | `true`               | With `false` it is a read-only viewer, whose toolbar can also rotate the image       |
| `toolbar`       | `boolean`                 | `true`               | Shows the built-in toolbar and edit bar. Without them, use the methods of `instance` |
| `tools`         | `ToolId[]`                | All of them          | Which tools the edit bar offers: `crop`, `perspective`, `rotate` and `threshold`     |
| `wheelZoom`     | `boolean`                 | `true`               | Whether the wheel zooms. Turn it off when the viewer sits in a long page             |
| `output`        | `{ type, quality }`       | Format of the source | The format of the result: `image/jpeg`, `image/png` or `image/webp`, and from 0 to 1 |
| `maxOutputSize` | `number`                  | Full resolution      | The longest side of the result, in pixels                                            |
| `aspectRatio`   | `number`                  | Estimated            | The real proportions of the document, as width divided by height, for Straighten     |
| `softness`      | `number`                  | `0.25`               | How much gray cleaning up keeps, from 0 to 1. Use 0 for strict black and white       |
| `labels`        | `Partial<PaperPicLabels>` |                      | Replaces any of the texts, which are in English by default                           |

It emits `load`, `error`, `change` and `apply`, and exposes the viewer as `instance`, with the methods of [`@paperpic/core`](https://www.npmjs.com/package/@paperpic/core).

Passing the same `src` again does not reload the image, so it keeps the result of an edit. To bring back the original, call `instance.reload()`.

Editing runs in a web worker, which bundlers such as Vite and webpack pick up on their own. If the worker cannot start, the processing runs on the main thread, so it still works but the page can freeze for a moment with large images.

With a Content Security Policy, allow the worker with `worker-src 'self'`. The viewer also needs `img-src blob:`, because it shows attached files and the result of an edit through `blob:` URLs.

## Styling

Import the stylesheet once in your app:

```ts
import '@paperpic/vue/style.css'
```

The styles live in the `paperpic` cascade layer, so any of your CSS outside a layer overrides them, whatever its specificity. This includes global resets, such as a rule on `img`.

Set any of these custom properties on `:root`, on an ancestor or on `.paperpic`:

| Custom property                  | Default   | Dark default | Description                           |
| -------------------------------- | --------- | ------------ | ------------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e`    | Background of the interface           |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9`    | Text of the interface                 |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff`    | Accent of the interface               |
| `--paperpic-radius`              | `6px`     | `6px`        | Corner radius of the interface        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`       | Duration of the interface transitions |

The dark defaults apply when the user's system prefers a dark color scheme. If your site switches themes in another way, such as a class on `<html>`, set the colors of each theme yourself:

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
}
```

## Browser support

`@paperpic/vue` targets browsers in [Baseline Widely Available](https://web.dev/baseline).
