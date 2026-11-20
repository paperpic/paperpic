---
title: Labels
description: Every text of the PaperPic interface, with its key and its English default, to translate the component or change its wording.
---

# Labels

Labels are the texts that the component shows, and the ones it announces to screen readers. They are in English by default. Pass the ones you want to change to the [`labels`](./options#labels) option, and the others keep their English text.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: 'Aplicar',
    cancel: 'Cancelar',
    zoomLevel: percent => `Zoom ${percent} %`,
  },
})
```

Five labels are functions, because their text includes a value. A function is new each time it is created, and the viewer takes a new one as a change, so create the labels that hold functions once, and not on every render.

| Key                 | English                                                          | Use                                                                                                           |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | The button that opens the ruler of brightness and contrast                                                    |
| `adjustmentLevel`   | Brightness +30                                                   | Function of the name and the value from -100 to 100, announced after moving the ruler of Adjust               |
| `adjustUnavailable` | Not available in black and white                                 | The description of Adjust in black and white, which keeps it disabled                                         |
| `applied`           | Changes applied                                                  | Announced when the changes are applied                                                                        |
| `apply`             | Apply                                                            | The button that applies the changes                                                                           |
| `applyError`        | The changes could not be applied                                 | Shown when Apply fails                                                                                        |
| `brightness`        | Brightness                                                       | The choice of brightness in Adjust, and the name of its ruler                                                 |
| `cancel`            | Cancel                                                           | The button that leaves the edit mode                                                                          |
| `cancelTool`        | Cancel this tool                                                 | The button that closes a tool and discards its changes                                                        |
| `confirm`           | Done                                                             | The button that closes a tool and keeps its changes                                                           |
| `contrast`          | Contrast                                                         | The choice of contrast in Adjust, and the name of its ruler                                                   |
| `cornerBottomLeft`  | Bottom left corner                                               | The name of a corner handle                                                                                   |
| `cornerBottomRight` | Bottom right corner                                              | The name of a corner handle                                                                                   |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | The description of a corner handle: what the keys do, and that Enter finishes                                 |
| `cornerMoved`       | Top left corner: 120, 80                                         | Function of the corner and its position in pixels of the image, announced after moving a corner               |
| `cornerSelected`    | Top left corner: tap where it goes                               | Function of the corner, shown and announced after pressing a corner handle, until a tap on the image moves it |
| `cornerTopLeft`     | Top left corner                                                  | The name of a corner handle                                                                                   |
| `cornerTopRight`    | Top right corner                                                 | The name of a corner handle                                                                                   |
| `crop`              | Crop                                                             | The Crop button                                                                                               |
| `cropHint`          | Drag the corners                                                 | What to do in Crop                                                                                            |
| `discard`           | Discard                                                          | The button that confirms losing the changes                                                                   |
| `discardQuestion`   | Discard your changes?                                            | The question before losing the changes                                                                        |
| `download`          | Download                                                         | The download button                                                                                           |
| `edit`              | Edit                                                             | The button that starts editing                                                                                |
| `editBar`           | Editing controls                                                 | The name of the edit bar, for screen readers                                                                  |
| `editing`           | Editing                                                          | Announced when the edit mode starts                                                                           |
| `finish`            | Clean up                                                         | The Clean up button, and the name of its choice of finish                                                     |
| `finishGray`        | Gray                                                             | Chooses gray in Clean up                                                                                      |
| `finishLevel`       | Sensitivity 50%                                                  | Function of the percent, announced after moving the ruler of Clean up                                         |
| `finishMono`        | Black and white                                                  | Chooses black and white in Clean up                                                                           |
| `finishOriginal`    | Original                                                         | Chooses the original tones in Clean up, which turns it off                                                    |
| `finishSensitivity` | Sensitivity                                                      | The name of the ruler of Clean up                                                                             |
| `fitHeight`         | Fit to height                                                    | The button that fits the height of the image                                                                  |
| `fitWidth`          | Fit to width                                                     | The button that fits the width of the image                                                                   |
| `flip`              | Flip                                                             | The Flip button                                                                                               |
| `inUse`             | In use                                                           | The description of Adjust or Clean up while its setting is in effect, which a dot shows                       |
| `keepEditing`       | Keep editing                                                     | The button that goes back to editing instead of losing the changes                                            |
| `loadError`         | The image could not be loaded                                    | Shown when the image fails to load                                                                            |
| `loading`           | Loading image                                                    | Shown while the image loads                                                                                   |
| `perspective`       | Straighten                                                       | The Straighten button                                                                                         |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | What to do in Straighten                                                                                      |
| `previewError`      | The changes could not be shown                                   | Shown when an edit cannot be shown                                                                            |
| `processing`        | Applying changes                                                 | Shown while Apply runs                                                                                        |
| `redact`            | Redact                                                           | The Redact button, and the name of its choice of color                                                        |
| `redactAngle`       | Angle 12°                                                        | Function of the angle in degrees, announced after turning the area of Redact                                  |
| `redactArea`        | Area                                                             | The area of Redact, which moves it as a whole                                                                 |
| `redactBlack`       | Black                                                            | Chooses black in Redact                                                                                       |
| `redactHint`        | Drag the area over what to hide                                  | What to do in Redact                                                                                          |
| `redactTurn`        | Turn                                                             | The handle that turns the area of Redact                                                                      |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | The description of the handle that turns the area: what the keys do, and that Enter finishes                  |
| `redactWhite`       | White                                                            | Chooses white in Redact                                                                                       |
| `redo`              | Redo                                                             | The Redo button                                                                                               |
| `rotateLeft`        | Rotate left                                                      | The rotate button of the edit bar, and one of the two of a read-only viewer                                   |
| `rotateRight`       | Rotate right                                                     | The other rotate button of a read-only viewer                                                                 |
| `toolbar`           | Image controls                                                   | The name of the toolbar, for screen readers                                                                   |
| `undo`              | Undo                                                             | The Undo button                                                                                               |
| `viewer`            | Image viewer                                                     | The name of the area that shows the image, for screen readers                                                 |
| `zoomIn`            | Zoom in                                                          | The zoom in button, in the toolbar and in the panels of Crop and Straighten                                   |
| `zoomLevel`         | Zoom 150%                                                        | Function of the percent, announced after zooming from the toolbar or the keyboard                             |
| `zoomOut`           | Zoom out                                                         | The zoom out button, in the toolbar and in the panels of Crop and Straighten                                  |
