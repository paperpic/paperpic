---
title: What is PaperPic?
description: PaperPic is a document image viewer and editor for the web. People zoom into photos of paper, straighten them, crop them and clean them up before your app keeps them.
---

# What is PaperPic?

Photos of documents arrive skewed, shadowed and full of background. PaperPic shows them in a viewer that people can zoom into, and lets them straighten and clean up each photo before your app keeps it, as a scanner app would.

## What it does

- **View.** Zoom with the buttons, the wheel or a pinch, pan, and fit the whole image, its width or its height. A read-only viewer can also rotate the image.
- **Edit.** In the edit mode, the user can crop, straighten a photo taken at an angle, rotate, flip, adjust the brightness and the contrast, and clean up the document into black and white. Every edit can be undone until the user applies the changes.
- **Deliver.** Apply computes the result at full resolution and hands it to your code as a `Blob`. A download button can also save it.

Each step happens only when the user asks for it. Nothing changes the photo on its own.

## What it does not do

- It does not upload anything. Your app decides what to do with the result.
- It does not open PDF files, only images.
- It does not find the edges of the document on its own: the user drags the corners.

## Packages

| Package           | Use it with                        |
| ----------------- | ---------------------------------- |
| `@paperpic/core`  | Plain JavaScript, or any framework |
| `@paperpic/vue`   | Vue 3.5 or newer                   |
| `@paperpic/react` | React 19 or newer                  |

The three have the same options, events and methods, and the core has no runtime dependencies. The editing runs in a Web Worker, so the page stays responsive with large photos.

## Try it

The [playground](../playground) lets you edit a sample receipt, or a photo of your own that never leaves your browser. To add PaperPic to your app, go to [Getting started](./getting-started).
