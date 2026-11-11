---
title: Performance and support
description: Where PaperPic does its work, what bundlers, Content Security Policy and server-side rendering need, how it handles large phone photos, and which browsers it supports.
---

# Performance and support

Phone photos have 12 megapixels or more, and editing them takes real work. This page explains where that work runs, what your build and your server need, and which browsers PaperPic supports.

## A Web Worker does the work

Clean up and Straighten take more than a second on a 12-megapixel photo on a phone. On the main thread, the page would freeze for that long. PaperPic runs them in a Web Worker instead, so the page keeps responding while Apply runs.

The worker ships inside the package and starts with the standard `new Worker(new URL(…, import.meta.url))`, which bundlers such as Vite and webpack 5 pick up on their own, with no configuration. If the worker cannot start, the editing runs on the main thread: it still works, but the page can freeze for a moment with large images.

## Content Security Policy

With a Content Security Policy, allow:

- `worker-src 'self'`, for the worker.
- `img-src blob:`, because the viewer shows attached files and the results of Apply through `blob:` URLs.

## Large photos

- **While editing**, the preview works on a copy of about 2 megapixels, so sliders and tools stay fluid with any photo.
- **On Apply**, every edit runs at full resolution. Large photos take a few seconds, so the viewer shows a message and blocks the controls meanwhile.
- **To save time and memory**, set [`maxOutputSize`](../reference/options#maxoutputsize). A limit such as 2000 or 3000 pixels keeps documents readable, and makes Apply faster and the files smaller.

## Images it accepts

`src` takes a URL from the same origin as your page, or a `File` or `Blob` attached on the client. PaperPic reads the pixels of the image, and browsers only allow that for images from other origins under CORS, which PaperPic does not request. Serve the images from your own domain, or fetch them yourself and pass the `Blob`.

## Server-side rendering

PaperPic needs a browser. The Vue and React components render an empty element on the server, such as in Nuxt or Next.js, and create the viewer in the browser. With the core, create the viewer in the browser yourself, such as when your component mounts.

## Browser support

PaperPic supports the browsers of [Baseline Widely Available](https://web.dev/baseline): the features that have worked in all the major browsers for at least 30 months. The packages are built for that target, which means Chrome and Edge 124, Firefox 125 and Safari 17.5 or newer, so you do not need to transpile them.
