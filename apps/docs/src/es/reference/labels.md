---
title: Textos de la interfaz
description: Todos los textos de la interfaz de PaperPic, con su clave y su valor en inglés, para traducir el componente o cambiar sus palabras.
---

# Textos de la interfaz

Los textos de la interfaz son los que el componente muestra y los que anuncia a los lectores de pantalla. Por defecto están en inglés. Pasa los que quieras cambiar a la opción [`labels`](./options#labels), y los demás conservan su texto en inglés.

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

Cinco textos son funciones, porque incluyen un valor. Una función es nueva cada vez que se crea, y el visor la toma como un cambio, así que crea una sola vez los textos que contienen funciones, y no en cada renderizado.

| Clave               | Inglés                                                           | Uso                                                                                                                          |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | El botón que abre la regla de brillo y contraste                                                                             |
| `adjustmentLevel`   | Brightness +30                                                   | Función del nombre y del valor de -100 a 100, que se anuncia al mover la regla de Ajustar                                    |
| `adjustUnavailable` | Not available in black and white                                 | La descripción de Ajustar en blanco y negro, que la deja desactivada                                                         |
| `applied`           | Changes applied                                                  | Se anuncia cuando se aplican los cambios                                                                                     |
| `apply`             | Apply                                                            | El botón que aplica los cambios                                                                                              |
| `applyError`        | The changes could not be applied                                 | Se muestra cuando Aplicar falla                                                                                              |
| `brightness`        | Brightness                                                       | La opción de brillo en Ajustar, y el nombre de su regla                                                                      |
| `cancel`            | Cancel                                                           | El botón que sale del modo de edición                                                                                        |
| `cancelTool`        | Cancel this tool                                                 | El botón que cierra una herramienta y descarta sus cambios                                                                   |
| `confirm`           | Done                                                             | El botón que cierra una herramienta y conserva sus cambios                                                                   |
| `contrast`          | Contrast                                                         | La opción de contraste en Ajustar, y el nombre de su regla                                                                   |
| `cornerBottomLeft`  | Bottom left corner                                               | El nombre de un tirador de esquina                                                                                           |
| `cornerBottomRight` | Bottom right corner                                              | El nombre de un tirador de esquina                                                                                           |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | La descripción de un tirador de esquina: qué hacen las teclas y que Intro termina                                            |
| `cornerMoved`       | Top left corner: 120, 80                                         | Función de la esquina y su posición en píxeles de la imagen, que se anuncia al mover una esquina                             |
| `cornerSelected`    | Top left corner: tap where it goes                               | Función de la esquina, que se muestra y se anuncia al pulsar un tirador de esquina, hasta que un toque en la imagen lo mueve |
| `cornerTopLeft`     | Top left corner                                                  | El nombre de un tirador de esquina                                                                                           |
| `cornerTopRight`    | Top right corner                                                 | El nombre de un tirador de esquina                                                                                           |
| `crop`              | Crop                                                             | El botón Recortar                                                                                                            |
| `cropHint`          | Drag the corners                                                 | Qué hacer en Recortar                                                                                                        |
| `discard`           | Discard                                                          | El botón que confirma perder los cambios                                                                                     |
| `discardQuestion`   | Discard your changes?                                            | La pregunta antes de perder los cambios                                                                                      |
| `download`          | Download                                                         | El botón de descarga                                                                                                         |
| `edit`              | Edit                                                             | El botón que empieza la edición                                                                                              |
| `editBar`           | Editing controls                                                 | El nombre de la barra de edición, para los lectores de pantalla                                                              |
| `editing`           | Editing                                                          | Se anuncia cuando empieza el modo de edición                                                                                 |
| `finish`            | Clean up                                                         | El botón Limpiar, y el nombre de su elección de acabado                                                                      |
| `finishGray`        | Gray                                                             | Elige gris en Limpiar                                                                                                        |
| `finishLevel`       | Sensitivity 50%                                                  | Función del porcentaje, que se anuncia al mover la regla de Limpiar                                                          |
| `finishMono`        | Black and white                                                  | Elige blanco y negro en Limpiar                                                                                              |
| `finishOriginal`    | Original                                                         | Elige los tonos originales en Limpiar, lo que la desactiva                                                                   |
| `finishSensitivity` | Sensitivity                                                      | El nombre de la regla de Limpiar                                                                                             |
| `fitHeight`         | Fit to height                                                    | El botón que encaja la imagen a lo alto                                                                                      |
| `fitWidth`          | Fit to width                                                     | El botón que encaja la imagen a lo ancho                                                                                     |
| `flip`              | Flip                                                             | El botón Voltear                                                                                                             |
| `inUse`             | In use                                                           | La descripción de Ajustar o Limpiar mientras su valor está en uso, que muestra un punto                                      |
| `keepEditing`       | Keep editing                                                     | El botón que vuelve a la edición en vez de perder los cambios                                                                |
| `loadError`         | The image could not be loaded                                    | Se muestra cuando la imagen no se puede cargar                                                                               |
| `loading`           | Loading image                                                    | Se muestra mientras la imagen se carga                                                                                       |
| `paper`             | Paper size                                                       | El nombre de la elección del tamaño de papel, en Enderezar                                                                   |
| `paperA4`           | A4                                                               | Elige A4 en Enderezar                                                                                                        |
| `paperAuto`         | Auto                                                             | Elige las proporciones automáticas en Enderezar                                                                              |
| `paperCard`         | Card                                                             | Elige el tamaño de un carné o una tarjeta bancaria en Enderezar                                                              |
| `paperLetter`       | Letter                                                           | Elige Carta (EE. UU.) en Enderezar                                                                                           |
| `perspective`       | Straighten                                                       | El botón Enderezar                                                                                                           |
| `perspectiveFound`  | Document found. Check its corners                                | Se muestra y se anuncia cuando Enderezar encuentra el documento                                                              |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | Qué hacer en Enderezar                                                                                                       |
| `previewError`      | The changes could not be shown                                   | Se muestra cuando un cambio no se puede mostrar                                                                              |
| `processing`        | Applying changes                                                 | Se muestra mientras Aplicar está en marcha                                                                                   |
| `redact`            | Redact                                                           | El botón Tapar, y el nombre de su elección de color                                                                          |
| `redactAngle`       | Angle 12°                                                        | Función del ángulo en grados, anunciada al girar la zona de Tapar                                                            |
| `redactArea`        | Area                                                             | La zona de Tapar, que la mueve entera                                                                                        |
| `redactBlack`       | Black                                                            | Elige negro en Tapar                                                                                                         |
| `redactHint`        | Drag the area over what to hide                                  | Qué hacer en Tapar                                                                                                           |
| `redactTurn`        | Turn                                                             | El tirador que gira la zona de Tapar                                                                                         |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | La descripción del tirador que gira la zona: qué hacen las teclas, y que Intro termina                                       |
| `redactWhite`       | White                                                            | Elige blanco en Tapar                                                                                                        |
| `redo`              | Redo                                                             | El botón Rehacer                                                                                                             |
| `rotateLeft`        | Rotate left                                                      | El botón de girar de la barra de edición, y uno de los dos de un visor de solo lectura                                       |
| `rotateRight`       | Rotate right                                                     | El otro botón de girar de un visor de solo lectura                                                                           |
| `toolbar`           | Image controls                                                   | El nombre de la barra de herramientas, para los lectores de pantalla                                                         |
| `undo`              | Undo                                                             | El botón Deshacer                                                                                                            |
| `viewer`            | Image viewer                                                     | El nombre de la zona que muestra la imagen, para los lectores de pantalla                                                    |
| `zoomIn`            | Zoom in                                                          | El botón de acercar, en la barra de herramientas y en los paneles de Recortar y Enderezar                                    |
| `zoomLevel`         | Zoom 150%                                                        | Función del porcentaje, que se anuncia al hacer zoom desde la barra de herramientas o el teclado                             |
| `zoomOut`           | Zoom out                                                         | El botón de alejar, en la barra de herramientas y en los paneles de Recortar y Enderezar                                     |
