# Technical spike results

**Status:** finished on desktop and one top Android phone. iOS and mid-range Android are not measured. Measured on 2026-11-05.

This spike tests the risks in the [component spec](paperpic-component.md#risks-to-prove-first) before the viewer is built on top of them.

The code is in `packages/core/src/processing`, and it is not exported yet. To repeat the measurements, run `pnpm dev:bench` and choose a photo: nothing is uploaded or saved.

## Conclusions

| #   | Question                           | Answer                                                                                                                                 | Status                         |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Is a worker needed?                | Yes. At 12 MP on Android, threshold takes 1477 ms and warp 1468 ms on the main thread, far over the 100 ms limit.                      | Done                           |
| 2   | Can the library ship a worker?     | Yes. It runs without configuration in Vite and webpack 5, also under a strict Content Security Policy.                                 | Done                           |
| 3   | Which threshold?                   | Bradley with soft output: window of 1/16 of the shorter side, sensitivity 0.5 and softness 0.25 by default.                            | Done                           |
| 4   | Is the CPU enough for perspective? | Yes, narrowly: 1639 ms at 12 MP in a worker on a top phone, against a limit of 2 s.                                                    | Mid-range Android open         |
| 5   | Library or our own code?           | Our own code, for threshold and perspective.                                                                                           | Done                           |
| 6   | Full resolution by default?        | 37.5 MP decodes, processes and exports without failure on desktop and Android, but it takes seconds, so it needs a progress indicator. | Mid-range Android and iOS open |
| 7   | Is the slider preview fluid?       | Yes, on a copy of about 2 MP: a lookup table takes it to 40 ms per change on Android, painted, down from 272 ms.                       | Done                           |
| 8   | Does painting need a reduced copy? | Not for sharpness: no visible difference on desktop or Android.                                                                        | Done                           |

## Measurements

Headless Chrome 156 on Windows, 8 logical cores. The photo is a 4590×8160 JPEG of 6.1 MB, which took 173 ms to decode. Values are medians of 3 runs, except for 37.5 MP and for reading and exporting, with 1 run.

| Operation                           | 2 MP  | 12 MP  | 37.5 MP |
| ----------------------------------- | ----- | ------ | ------- |
| Read pixels                         | 89 ms | 410 ms | 164 ms  |
| Threshold, main thread              | 59 ms | 300 ms | 820 ms  |
| Threshold, worker                   | 52 ms | 234 ms | 720 ms  |
| Strict black and white, main thread | 41 ms | 211 ms | 648 ms  |
| Warp, main thread                   | 42 ms | 227 ms | 943 ms  |
| Warp, worker                        | 37 ms | 223 ms | 1119 ms |
| Export PNG                          | 86 ms | 483 ms | 1519 ms |
| Export JPEG, quality 0.9            | 25 ms | 144 ms | 480 ms  |

Reading pixels at 2 and 12 MP includes a high quality resize, so it takes longer than at full size. Exporting and reading still run on the main thread of this page, and moving them to the worker is part of building the pipeline.

### Android

Pixel 10 Pro with Chrome 156, on the same photo and corners, which took 260 ms to decode. Nothing failed. The 37.5 MP column comes from a separate run of the same code.

| Operation                           | 2 MP   | 12 MP   | 37.5 MP |
| ----------------------------------- | ------ | ------- | ------- |
| Read pixels                         | 87 ms  | 287 ms  | 123 ms  |
| Threshold, main thread              | 251 ms | 1477 ms | 4623 ms |
| Threshold, worker                   | 256 ms | 1533 ms | 4795 ms |
| Strict black and white, main thread | 247 ms | 1494 ms | 4751 ms |
| Warp, main thread                   | 222 ms | 1468 ms | 4578 ms |
| Warp, worker                        | 251 ms | 1639 ms | 4978 ms |
| Export PNG                          | 92 ms  | 378 ms  | 979 ms  |
| Export JPEG, quality 0.9            | 33 ms  | 142 ms  | 525 ms  |

Our JavaScript is 5 to 7 times slower here than on the test desktop, while the browser's native decoding, reading and exporting take about the same. JavaScript speed is therefore the bottleneck on phones, and this is a top phone, so mid-range ones will be slower.

### Fixing the slider preview

Sensitivity does not change the local mean, which is the expensive part. `prepareThreshold` stores the ratio between each pixel and its mean once, and `applyThreshold` turns those ratios into the final image with a lookup table on each slider change. Preview and export run this same code, and a full run costs about the same as before.

| Slider change, desktop, main thread | 2 MP  | 12 MP  | 37.5 MP |
| ----------------------------------- | ----- | ------ | ------- |
| Before, recalculating everything    | 59 ms | 300 ms | 820 ms  |
| Now, without painting               | 6 ms  | 36 ms  | 112 ms  |
| Now, painted on a canvas            | 7 ms  | 58 ms  | 177 ms  |

| Slider, Android, main thread     | 2 MP   | 12 MP   | 37.5 MP |
| -------------------------------- | ------ | ------- | ------- |
| Preparation, once                | 209 ms | 1253 ms | 3879 ms |
| Before, recalculating everything | 276 ms | 1638 ms | 5182 ms |
| Now, without painting            | 40 ms  | 235 ms  | 770 ms  |
| Now, painted on a canvas         | 40 ms  | 260 ms  | 793 ms  |

Only the 2 MP preview meets the 100 ms limit, so the slider works on a copy of about that size. The preparation runs once, when the tool opens, and it belongs in the worker.

## Painting

Two versions of the 37.5 MP photo were compared at 506×900, by eye, on desktop and Android: painted directly with `drawImage`, and painted from a copy reduced beforehand. Nobody could see a difference, so painting needs no reduced copy for sharpness.

The time of painting itself could not be measured, because `drawImage` hands the work to the GPU and returns at once. Checked by hand with the real viewer instead: zoom and pan work well on the 37.5 MP photo on the Pixel 10 Pro.

## Threshold

Two real receipt photos were compared: one of 0.3 MP with a shadow and creases, and one of 37.5 MP with strong perspective, a fold and print showing through from the back.

- **Strict black and white** breaks thin strokes in a photo that is slightly out of focus, because it forces the gray edges of each letter into one of two values. A blur before thresholding did not help. This is the reason the default output keeps gray.
- **Soft output is the default.** It uses the same Bradley comparison with the local mean, and it keeps a range of gray around the limit. It reads clearly better, and it ignores the print from the back at the default sensitivity.
- **Sensitivity** changes the exported pixels. Raising it recovers faint, out of focus text.
- **Sauvola** was removed. It was slower (329 ms against 230 ms at 12 MP), and at the equivalent setting it lost whole lines of low contrast text.
- A window of 1/32 lost text compared to 1/16, and 1/8 added no clear benefit.

| Output on the photo warped to 26 MP, before the proportions were fixed | Strict black and white (`softness: 0`) | Soft (default) |
| ---------------------------------------------------------------------- | -------------------------------------- | -------------- |
| PNG size                                                               | 1.2 MB                                 | 5.1 MB         |

Known limits:

- A dark background outside the paper turns into noise. This is acceptable because threshold runs after crop or perspective.
- Text that is out of focus or missing in the photo cannot be fully recovered by any setting.
- Paper creases stay slightly visible in the soft output.
- The soft output is not a true black and white image. Use `softness: 0` when that is required.

## Perspective

The implementation solves the homography of the 4 corners and maps each output pixel back with bilinear interpolation.

### Output proportions

The test document measures 80×204 mm, a proportion of 1:2.55.

| Method                                               | Proportion | Error |
| ---------------------------------------------------- | ---------- | ----- |
| Longer of each pair of opposite sides, first attempt | 1:1.65     | -35%  |
| Camera geometry (Zhang and He), current              | 1:2.24     | -12%  |

The first attempt squashed the document, so it was replaced. The method now estimates the camera's focal length from the corners. A photo tilted around only one axis, like this one, does not reveal it, so a typical phone value of 0.7 times the long side is used instead. The metadata of this photo gives about 0.64.

On synthetic documents the result is exact when the tilt is around both axes, and when it is around one axis with the right focal length.

Why the real photo still has an error:

- The corners are placed by hand. Moving them by 0.5% of the image gives from 1:2.18 to 1:2.30, and by 1% from 1:2.12 to 1:2.37.
- The paper is curved and folded, and one corner is folded over, while the method assumes a flat rectangle.
- The focal length is assumed.

So the estimate is much better but not exact. When the real proportions are known, the `aspectRatio` option replaces the estimate: with `80 / 204`, this photo gives exactly 1:2.55. The method needs the size of the whole photo, because it assumes the camera axis passes through the center. Running perspective after a crop must therefore use the center of the original photo.

### In the component

The real tool, on the 4590×8160 photo with corners placed by hand, on desktop. Applying includes reading the area around the corners, the warp in the worker and exporting a JPEG.

| Step                             | Time    |
| -------------------------------- | ------- |
| Preview, after confirming        | 368 ms  |
| Apply, 3064×6861 result          | 1660 ms |
| Longest block of the main thread | 300 ms  |

The result has the proportions the method predicts: 1:2.24 as estimated, and exactly 1:2.55 with `aspectRatio: 80 / 204`.

## Libraries

Reviewed on npm, without claiming to be exhaustive: `image-js`, `@silvia-odwyer/photon`, `wasm-vips`, `pica`, `opencv.js`, `@techstark/opencv-js`, `jimp`, `imagescript`, `homography`, `perspective-transform`, `glfx-es6`, `ml-matrix` and `otsu`.

`image-js` 1.7.1 is the only maintained one that covers perspective at a reasonable size:

|                    | Our code                 | `image-js` 1.7.1                    |
| ------------------ | ------------------------ | ----------------------------------- |
| Size, gzip         | 2.81 KB, with the worker | 77 KB, with the warp only           |
| Warp at 2 MP       | 45 ms                    | 164 ms                              |
| Warp at 12 MP      | 263 ms                   | 918 ms                              |
| Warp at 37.5 MP    | 1104 ms                  | 2882 ms                             |
| Adaptive threshold | Yes                      | No, only global methods             |
| Native dependency  | None                     | `skia-canvas`, with install scripts |

Figures from one session on the same machine, using the same interpolation and the same output sizes, before the proportions were fixed. Threshold has no candidate at a reasonable size, since `@techstark/opencv-js` takes 14.7 MB unpacked.

## Worker packaging

A package with a second entry, `dist/worker.js`, loaded with `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })`. `tsdown` keeps this pattern. The tarball was installed in throwaway apps, and each result comes from running a job in the browser.

| App                    | No CSP | `worker-src 'self'` | `worker-src 'none'`       |
| ---------------------- | ------ | ------------------- | ------------------------- |
| Vite 8.3.6, dev        | Works  | Not tested          | Not tested                |
| Vite 8.3.6, build      | Works  | Works               | Fails with an error event |
| webpack 5.112.2, dev   | Works  | Not tested          | Not tested                |
| webpack 5.112.2, build | Works  | Works               | Fails with an error event |

The error event means the component can detect a blocked worker and fall back to the main thread.

Still to solve when the pipeline is built:

- `packages/core/tsdown.config.ts` does not have the worker entry yet, so nothing changes for consumers until it is used.
- In source mode, the playgrounds alias the package to `src`, where `./worker.js` does not exist. The worker URL has to work in both modes.
- Angular and React are checked in their phases.

## Memory

At 37.5 MP, threshold peaks at about 340 MB: 150 MB for the source, 37.5 MB for the grayscale copy and 150 MB for the output. This did not fail on desktop or on the Android phone tested, which leaves phones with less memory as the risk.

## Open risks

- **Mid-range Android:** only a top phone was tested. Time, memory and the fluidity of zoom and pan with very large images may not hold on weaker ones.
- **iOS:** not measured, because no device was available. Safari has been the most restrictive browser for canvas size, so full resolution by default stays unproven there. Review this when the public demo exists.
