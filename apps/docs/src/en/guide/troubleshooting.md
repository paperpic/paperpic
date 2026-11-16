---
title: Troubleshooting
description: What to do when the PaperPic viewer has no height or no style, Tailwind CSS changes it, an image does not load or cannot be edited, the page freezes on Apply, or a large photo fails.
---

# Troubleshooting

Most problems with PaperPic come from its setup, and not from the image. Find what you see, and the fix below it.

## The viewer is a thin strip, or does not show {#no-height}

The viewer fills its container, and a container without a height collapses to the minimum height of the viewer. Give the container a height, such as `height: 480px`, or a place in a flex or grid layout that gives it one. [Styling](./styling) shows both.

## The buttons have no style, and the console warns {#no-stylesheet}

The console says `PaperPic: the stylesheet is missing, so the viewer has no layout.` Import the stylesheet once in your app: `@paperpic/core/style.css`, or the `style.css` of `@paperpic/vue` or `@paperpic/react`.

## Tailwind CSS removes the borders and the padding of the viewer {#tailwind}

The reset of Tailwind CSS 4 wins over the stylesheet of PaperPic when the cascade layers come in the wrong order. Name the layers before you import both, as [Styling](./styling#tailwind) shows.

## The image shows, but editing it fails {#other-origin}

The [`error`](../reference/events#error) says that the image comes from another origin. Browsers do not let PaperPic read the pixels of such an image. Fetch it yourself and pass the `Blob`, as [Loading images](./loading#fetch) shows.

## The image does not load {#load-error}

The viewer shows that the image could not be loaded, and `error` carries `phase: 'load'`. Check that the URL exists, and that the browser opens the format: HEIC only opens in Safari, and an SVG needs `width` and `height` attributes. [Loading images](./loading#formats) lists the formats.

## The page freezes while Apply runs {#worker}

The worker did not start, so the editing runs on the main thread. It still works, but large photos freeze the page for a moment. The usual causes are:

- A Content Security Policy without `worker-src 'self'`, or one that requires Trusted Types without a `default` policy. [Performance and support](./performance) lists what to allow.
- The package loaded from a CDN, from another origin than the page. Browsers only start a worker from the origin of the page.

The network panel of the browser shows whether the page requested the worker file, whose name starts with `worker`.

## Apply fails with a large photo {#too-large}

The `error` says `The browser could not read an image of …`. Browsers limit the size of a canvas, and Safari on iOS the most. Set [`maxOutputSize`](../reference/options#maxoutputsize), such as to 3000 pixels, which keeps documents readable.

## The wheel zooms the image instead of scrolling the page {#wheel}

Set [`wheelZoom: false`](../reference/options#wheelzoom). The buttons, the keyboard and a pinch still zoom.
