# PaperPic component spec

**Status:** draft. This file grows as decisions are made. Anything not listed under [Decisions](#decisions) is still open.

## Goal

An image viewer and editor for the web, built as a framework-agnostic component with thin wrappers. It displays an image and lets the user straighten and clean it up, as a scanner app would.

The architecture and style rules in [CONTRIBUTING](../../.github/CONTRIBUTING.md#architecture) apply to everything here.

## Decisions

| ID  | Decision                                                                                                                                                                                                                                                                                                       | Reason                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Targets are vanilla, Vue, React and, if feasible, Angular. Vanilla and Vue come first.                                                                                                                                                                                                                         | One core with wrappers keeps this affordable.                                                                                                                                                |
| D2  | No wizard. An added image loads as is, and the user enters editing through an Edit button, as in a phone gallery.                                                                                                                                                                                              | Processing must never happen without the user asking for it.                                                                                                                                 |
| D3  | Editing covers crop, perspective change, permanent rotation, flip, brightness and contrast, and threshold. More tools may follow.                                                                                                                                                                              | Core feature set.                                                                                                                                                                            |
| D4  | No background loading of a higher-resolution image.                                                                                                                                                                                                                                                            | The component does not know about any backend.                                                                                                                                               |
| D5  | No PDF support.                                                                                                                                                                                                                                                                                                | Out of scope.                                                                                                                                                                                |
| D6  | Use an established library when one holds up. Write our own only when it is worth it, and measure before adding GPU code.                                                                                                                                                                                      | Avoid reinventing the wheel, and avoid dependencies that do not fit.                                                                                                                         |
| D7  | WebGPU, if ever used, is an optional acceleration with a fallback. It cannot be required.                                                                                                                                                                                                                      | The packages target Baseline Widely Available browsers.                                                                                                                                      |
| D8  | The Edit button opens a toolbar with crop, perspective change, permanent rotation, flip, brightness and contrast, and adaptive threshold.                                                                                                                                                                      | Each edit is a choice the user makes, in the order they want.                                                                                                                                |
| D9  | Crop and perspective are two separate tools.                                                                                                                                                                                                                                                                   | They are different tasks with different selection flows.                                                                                                                                     |
| D10 | Perspective works with 4 manually selected points. Automatic detection is optional and is dropped if it proves too much.                                                                                                                                                                                       | The manual flow must work alone, so detection never blocks a release.                                                                                                                        |
| D11 | Edits can be undone with an Undo button until they are applied.                                                                                                                                                                                                                                                | The user can experiment safely.                                                                                                                                                              |
| D12 | Applying the changes emits an event with the changed image. Sending it to a backend is up to the consumer.                                                                                                                                                                                                     | The component does not know about any backend.                                                                                                                                               |
| D13 | No TIFF. No pagination for now, though it may come later.                                                                                                                                                                                                                                                      | Browsers rarely decode TIFF, and pages depended on a backend.                                                                                                                                |
| D14 | Rotate and threshold apply at once and can be undone. Crop and perspective have their own confirm inside the tool. Apply confirms everything.                                                                                                                                                                  | A selection needs an explicit end, and a button press does not.                                                                                                                              |
| D15 | Threshold is one on/off setting that always runs after geometry. Its slider controls the real sensitivity, and preview and export share one pipeline. The output keeps some gray by default, and `softness: 0` gives strict black and white.                                                                   | The result must not depend on tool order, and what the user sees must be what is exported. Strict black and white breaks thin strokes in real photos.                                        |
| D16 | Rotation in edit mode is permanent. With `editable: false`, view mode has rotate buttons, which only change the display. With editing available, view mode has no rotation.                                                                                                                                    | A read-only viewer needs to turn a sideways image, and each case still shows only one kind of rotation, so they cannot be confused.                                                          |
| D17 | Images come from the same origin or are attached on the client.                                                                                                                                                                                                                                                | Pixels can always be read, so cross-origin support is out of scope.                                                                                                                          |
| D18 | The attach button belongs to the consumer. The component takes `src: string \| Blob \| File`. The playground and the docs demo offer an attach button and a preloaded sample image.                                                                                                                            | Each app decides its own file picker and validation. Demo visitors can try it with no file of their own.                                                                                     |
| D19 | The Apply event carries `{ blob, width, height, type }`. The type is PNG with threshold on, and otherwise the source type (JPEG, PNG, WebP). `output: { type, quality }` overrides it.                                                                                                                         | JPEG artifacts damage the sharp edges of a cleaned document.                                                                                                                                 |
| D20 | Output is full resolution by default, with an optional `maxOutputSize`. Benchmarks must validate this default on large phone photos.                                                                                                                                                                           | The old 1920 px cap lost quality without telling anyone.                                                                                                                                     |
| D21 | A later edit starts from the last applied image. The component does not keep the first one.                                                                                                                                                                                                                    | Keeping originals is up to the consumer, who can bring one back with `reload()` or a new `src`.                                                                                              |
| D22 | The entry point is the class `new PaperPic(container, options)`.                                                                                                                                                                                                                                               | It matches the package name, and the component does more than view.                                                                                                                          |
| D23 | A built-in toolbar by default, with `tools` to choose tools, `editable: false` to hide Edit, and `toolbar: false` plus public commands for a custom interface.                                                                                                                                                 | Most consumers want it to work at once, and others need their own interface.                                                                                                                 |
| D24 | The only extra in the first version is Redo.                                                                                                                                                                                                                                                                   | It costs little once Undo exists.                                                                                                                                                            |
| D25 | Every tool is independent and testable, new tools can be added without changing the others, and painting the canvas is a separate part.                                                                                                                                                                        | The set of tools will grow.                                                                                                                                                                  |
| D26 | Edits are an internal list of operations over the base image, not a sequence of applied pixels. The list is not public in the first version.                                                                                                                                                                   | Undo and Redo stay simple and quality does not degrade between steps. Exposing the list later breaks nothing.                                                                                |
| D27 | Third parties cannot register their own tools in the first version.                                                                                                                                                                                                                                            | A public contract must stay compatible, so it waits until our own tools have proven it.                                                                                                      |
| D28 | The wheel zooms over the image. `wheelZoom: false` turns it off.                                                                                                                                                                                                                                               | Zooming is the main action in a viewer, and a long page can opt out.                                                                                                                         |
| D29 | In view mode, one finger scrolls the page while the image is fitted and pans it only when zoomed. Edit mode always captures gestures.                                                                                                                                                                          | The viewer must not trap page scrolling on mobile.                                                                                                                                           |
| D30 | Texts are in English by default, and the `labels` option replaces any of them. No translations ship with the packages.                                                                                                                                                                                         | Shipped translations would need maintenance in every release. The name leaves `locale` free for later.                                                                                       |
| D31 | Dragging a corner by touch shows a magnifier, in crop and perspective. It is part of those tools.                                                                                                                                                                                                              | The finger hides the exact point being placed.                                                                                                                                               |
| D32 | Threshold and perspective are our own code, with no dependencies. Threshold uses the Bradley comparison with soft output.                                                                                                                                                                                      | The [spike](spike-results.md) found no library with an adaptive threshold at a reasonable size, and our warp is faster and much smaller than the best candidate.                             |
| D33 | Perspective estimates the proportions of the document, and the `aspectRatio` option fixes them when they are known, as width divided by height.                                                                                                                                                                | An estimate from a photo cannot be exact, and consumers often know their document.                                                                                                           |
| D34 | The public demo uses a made-up, AI-generated receipt, labelled as such. Real receipts stay out of the repo, and quality is still checked on real photos, locally.                                                                                                                                              | It shows the tools without publishing purchases or brands.                                                                                                                                   |
| D35 | Corner handles stay inside the image. When a corner of the document is cut off by the photo, the user places its handle on the photo border, along the edge that keeps the content.                                                                                                                            | No invented pixels and no margin around the viewer. The last rows lean slightly and the estimated proportions suffer, and `aspectRatio` can fix the proportions.                             |
| D36 | The view toolbar sits at the right: zoom in, zoom out, fit to width, fit to height and, only with `editable: false`, rotate left and right.                                                                                                                                                                    | The controls of the previous viewer, which already worked for long documents.                                                                                                                |
| D37 | The Edit pencil goes at the top of the right toolbar and disappears while editing. A bar at the bottom holds Cancel, the tools, Undo, Redo and Apply. The zoom toolbar stays, because placing corners needs it.                                                                                                | One place for editing, and it fits in a phone by splitting into two rows.                                                                                                                    |
| D38 | Passing the same `src` again does not reload the image. `reload()` does.                                                                                                                                                                                                                                       | Wrappers resend every option on each change, which would erase the result of an edit.                                                                                                        |
| D39 | The color tokens have dark defaults under `prefers-color-scheme: dark`. A site that switches themes another way sets the tokens for each theme.                                                                                                                                                                | It follows the system, as the browser does, and `light-dark()` is only just Baseline Widely Available.                                                                                       |
| D40 | `download: true` adds a button at the end of the view toolbar that saves the image on display, which is the result of the last Apply or else the source as it is. It is off by default and hidden while editing. The `download` event comes first, and `preventDefault()` on it stops the browser from saving. | Saving needs no backend, but many viewers show documents their site does not want to offer. The event lets an app save another way, such as from its own server.                             |
| D41 | The browser's context menu never opens over the viewer.                                                                                                                                                                                                                                                        | It only offers to save the canvas, which holds the view on screen at screen size, and never the image. Nothing can stop a screenshot, so this is no protection.                              |
| D42 | Brightness and contrast share one Adjust button, which shows both sliders. They go from -1 to 1, with 0 as no change. Like threshold, they are a setting that runs after geometry, and releasing a slider leaves one edit. While threshold is on they are left out and their button is disabled.               | Photo galleries group these behind one button, and two sliders fit at once. Threshold compares each pixel with its surroundings, so tones set before it barely change its result.            |
| D43 | Flip is one button that mirrors the image left to right, as it is on display. It is an edit with new pixels, like crop, and flips and rotations next to each other merge or cancel out.                                                                                                                        | A vertical flip is a flip and a half turn, so one button covers both. The view matrix only turns, which keeps the view and its coordinates simple, at the cost of a preview after each flip. |
| D44 | The React wrapper needs React 19. Its props are the options plus `onApply`, `onChange`, `onDownload`, `onError` and `onLoad`, and `ref` receives the viewer. A new handler does not recreate the viewer, and only a changed option reaches `setOptions()`.                                                     | React 19 takes `ref` as a prop. Inline handlers are the norm in React, and the viewer holds the edit, so it must outlive a render.                                                           |

## Public API

```ts
const pic = new PaperPic(container, {
  src, // string | Blob | File
  alt, // string
  editable, // boolean, true by default
  toolbar, // boolean, true by default
  tools, // readonly ToolId[], all of them by default
  wheelZoom, // boolean, true by default
  download, // boolean, false by default
  filename, // string, the name of the source by default
  output, // { type, quality }, the format of the source by default
  maxOutputSize, // number, full resolution by default
  aspectRatio, // number, width divided by height, estimated by default
  softness, // number, from 0 to 1, 0.25 by default
  labels, // Partial<PaperPicLabels>
})

pic.zoomIn()
pic.zoomOut()
pic.zoomTo(1)
pic.fit('image') // or 'width', 'height'
pic.edit()
pic.rotate(1) // or -1. An edit while editing, display only with editable: false
pic.flip() // left to right, while editing
pic.openTool('crop') // or 'perspective'
pic.confirmTool()
pic.cancelTool()
pic.setThreshold({ enabled: true, sensitivity: 0.5 })
pic.setAdjustments({ brightness: 0.2, contrast: 0.1 }) // from -1 to 1, 0 by default
pic.undo()
pic.redo()
await pic.apply() // emits 'apply' with { blob, width, height, type }
pic.cancel()
pic.download() // emits a cancelable 'download' with { source, filename, preventDefault }
pic.reload()
pic.setOptions({ alt: 'A receipt' })
pic.getState() // { status, mode, image, zoom, fit, rotation, canUndo, canRedo, canApply, busy, activeTool, threshold, adjustments }
const off = pic.on('change', listener) // also 'load', 'error', 'apply' and 'download'
pic.destroy()
```

- The component fills its container, which needs a height.
- `change` reports user actions, and `setOptions()` never emits it. `load` reports a loaded image, and `error` a failed load or a failed Apply. `apply` carries the result.
- Rotate is one button in the edit bar that turns a quarter turn to the left, as in photo galleries. `rotate(1)` still turns right.
- Flip is one button in the edit bar. It mirrors the image as it is on display, so after a turn it still mirrors left to right.
- Rotations and flips that cancel out are no change, so Apply stays disabled.
- While a tool with its own selection is open, the other edits, Undo, Redo and Apply do nothing. `Enter` confirms it and `Esc` cancels it.
- After an edit that needs new pixels, the viewer shows a preview on a copy of about 2 MP, painted at the size of the result. Zoom and coordinates do not change, but the preview looks softer than the result when zoomed in. Apply computes everything at full resolution.
- Perspective keeps the corners a convex shape inside the image, so they can always be straightened. It stores the proportions when the user confirms. They come from `aspectRatio`, or else from an estimate that follows crops and rotations back to the center of the photo. After another perspective change, or after Apply, that center is unknown and the current image counts as the photo.
- Threshold is a button and a slider in the edit bar. Dragging the slider repaints the preview at once, and releasing it leaves one edit. An open tool sees the image without the threshold, because the edges of the paper are hard to find on a cleaned image. Rotating does not compute it again.
- `getState().image` is the size of the result so far. `maxOutputSize` limits the longest side of the result.
- Adjust is a button in the edit bar that shows the sliders of brightness and contrast. Dragging a slider repaints the preview at once, and releasing it leaves one edit. Values that go back to 0 are no change. An open tool sees the image with them.
- Apply cannot be interrupted. It blocks the controls, shows a message and emits `change` with `busy: true`. If it fails, the edit stays open.
- After Apply, the result is the image on display, the history is empty and the mode is View. Passing the same `src` again does nothing, because wrappers resend it. `reload()` brings back the original.
- Changing `src` or `editable` while editing discards the edit.
- The saved file keeps the name of the source, or takes `filename`, and ends in the extension of its format, so a cleaned `receipt.jpg` saves as `receipt.png`. A URL source is saved through a link with `download`, which works because it comes from the same origin (D17).
- `cancel()` does not ask. The built-in Cancel button and `Esc` ask first when there are changes to lose.
- The zoom goes from the fit of the whole image, or 100% if that is smaller, up to 800%. Only a very small image can fit beyond that.
- An image that fits stays centered. One that overflows pans up to its edges, plus the width of the toolbar at the sides, so the toolbar never hides a part for good.

## Architecture

The code lives in `packages/core/src`. Dependencies point downwards in this table, and `processing` knows nothing about the others.

| Layer         | Responsibility                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `paperpic.ts` | Public class. Connects the other layers.                                                                              |
| `ui/`         | Optional toolbar and edit bar. They only call commands and read state.                                                |
| `tools/`      | One folder per tool: `adjust/`, `crop/`, `flip/`, `perspective/`, `rotate/`, `threshold/`.                            |
| `input/`      | Turns Pointer Events into drag, pinch and wheel gestures, and routes them to the active tool or the view.             |
| `render/`     | Paints a scene on the canvas. It decides nothing.                                                                     |
| `pipeline/`   | Turns the operation list into an image. Preview and export use the same code.                                         |
| `state/`      | Mode, zoom and pan, operation list, Undo and Redo history.                                                            |
| `processing/` | Pure functions on pixel arrays: homography, warp, threshold, flip, brightness and contrast. Tested without a browser. |

### Tools

Adding a tool means creating its folder and registering it. A tool handles its own interaction and, on confirm, adds an operation such as `{ type: 'crop', rect }`. It does not paint the image or touch pixels.

Operations store fractions of the image, as the user saw it at that moment with the earlier edits done, so they mean the same on a preview and at full resolution.

Each action of a tool becomes a button in the edit bar. A tool that holds a selection open also has `activate`, and its corner handles are DOM elements with their own pointer events, so any other drag still pans the view.

```ts
interface Tool {
  actions: readonly ToolAction[]
  /** Only for a tool with its own selection and confirmation. */
  activate?: (host: ToolHost) => ToolSession
  id: ToolId
}

interface ToolAction {
  id: string
  run: (context: ToolContext) => void
}

interface ToolContext {
  addOperation: (operation: Operation) => void
  openTool: (id: ToolId) => void
}

interface ToolSession {
  /** The edit the user chose, or `null` if it changes nothing. */
  confirm: () => Operation | null
  deactivate: () => void
  drawOverlay: (context: CanvasRenderingContext2D) => void
  focus: () => void
  update: () => void
}
```

`ToolHost` gives an open tool the layer for its elements, conversions between the image and the viewport, and ways to paint and announce.

### Rendering

- The image is repainted when something changes: zoom, pan, container size, a loaded image, a new pipeline result, rotation, Undo or Redo. There is no continuous loop.
- Changes are coalesced with `requestAnimationFrame`, so one frame paints once.
- Painting never processes pixels. It draws an image the pipeline has already produced.
- The canvas respects `devicePixelRatio`.
- One pure function computes the transform matrix. Painting and converting pointer coordinates to image coordinates both use it.
- A 90 degree rotation after the last edit that needs new pixels is applied in the matrix, so it is instant. Export bakes it into the pixels.
- The crops at the start of the edits, and the area around the first perspective change, decide which part of the image gets read. A small selection of a large photo stays sharp in the preview and uses less memory on export.
- There are three layers: a canvas for the image, a canvas for the dimmed area and selection lines, and DOM elements for the corner handles, so they can take focus and work with a keyboard.
- Mobile and desktop share this one path.

### Risks to prove first

The [spike results](spike-results.md) track the status of each one. One top Android phone is measured. Mid-range Android and iOS are not.

- **Worker packaging.** Heavy processing belongs in a worker, which must work with consumers' bundlers and Content Security Policy. Proven in Vite and webpack 5, falling back to the main thread if a policy blocks it.
- **Preview and export.** The threshold slider works on a copy of about 2 MP to stay fluid, at 40 ms per change on a top Android phone. Code and parameters are the same, but the result can differ slightly from full resolution.
- **Memory.** A 12 MP photo takes 48 MB as RGBA, so only the base image and the last result are kept. Undo recomputes from the base image. Threshold peaks at about 340 MB at 37.5 MP.
- **Text sharpness when downscaling.** No visible difference on desktop or Android, so painting needs no reduced copy for sharpness. Zoom and pan also work well with a 37.5 MP photo on a top Android phone, checked by hand.

## Accessibility

The target is WCAG 2.2 AA, including `prefers-reduced-motion` and `forced-colors`.

- The canvas has `role="img"` and uses the `alt` the consumer passes.
- The toolbar has `role="toolbar"` and arrow key navigation.
- Corner handles take focus with Tab and move with the arrow keys: 1 screen pixel, or 10 with Shift. Each move is announced to screen readers.
- An `aria-live` region announces processing, the active tool and results.

| Key                                      | Action                                    |
| ---------------------------------------- | ----------------------------------------- |
| `+` and `-`                              | Zoom                                      |
| Arrow keys                               | Pan                                       |
| `0`                                      | Fit to the screen                         |
| `Ctrl+Z`, and `Ctrl+Shift+Z` or `Ctrl+Y` | Undo and Redo                             |
| `Enter`, with the focus on the viewer    | Apply                                     |
| `Esc`                                    | Cancel, asking first if there are changes |

## Responsive behavior

- The component fills its container and adapts with `ResizeObserver` and container queries. It does not detect the device.
- The main toolbar is always vertical, at the right. It scrolls when the container is too short for its buttons.
- The edit bar sits at the bottom, on one row when it fits and on two when it does not.
- Touch targets are at least 44 px with `pointer: coarse`.
- Pinch zooms around the point between the fingers. Double tap toggles between fitted and 100%.

## Roadmap

1. **Technical spike.** Done, see the [results](spike-results.md). Worker packaging, threshold and perspective implementations, benchmarks and a wider library search.
2. **Viewer.** Renderer, gestures, view mode with its rotate buttons for `editable: false`, and the Vue wrapper. The placeholder `rotation` option goes away, and docs and playgrounds follow.
3. **Edit base.** Done. Edit bar, operation list, Undo, Redo and Apply, with Rotate as the first tool and processing in a packaged worker.
4. **Tools.** Done. Crop, with the shared corner handles, magnifier and preview, Perspective and Threshold. Brightness and contrast, and Flip, came after.
5. **Other frameworks.** React is done. Angular, if feasible.
6. **Automatic detection.** Only if it proves worth it.

## Open decisions

- Whether the toolbar offers paper size presets on top of the `aspectRatio` option.
- Tools for later versions: free-angle straightening.
- Whether full resolution holds as the default (D20). It works on a top Android phone, and mid-range Android and iOS are not measured.
- Library or own implementation for point detection, after a prototype on real photos.
