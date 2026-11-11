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

Cinco textos son funciones, porque incluyen un valor. Crea el objeto una sola vez, y no en cada renderizado, para que el visor no lo reciba de nuevo cada vez.

| Clave                  | Inglés                                       | Uso                                                                                                                          |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | El botón que muestra los controles deslizantes de brillo y contraste                                                         |
| `adjustmentLevel`      | Brightness +30                               | Función del nombre y del valor de -100 a 100, que se anuncia al mover un control de Ajustar                                  |
| `applied`              | Changes applied                              | Se anuncia cuando se aplican los cambios                                                                                     |
| `apply`                | Apply                                        | El botón que aplica los cambios                                                                                              |
| `applyError`           | The changes could not be applied             | Se muestra cuando Aplicar falla                                                                                              |
| `brightness`           | Brightness                                   | El nombre del control deslizante de brillo                                                                                   |
| `cancel`               | Cancel                                       | El botón que sale del modo de edición                                                                                        |
| `cancelTool`           | Cancel this tool                             | El botón que cierra una herramienta y descarta su selección                                                                  |
| `confirm`              | Done                                         | El botón que cierra una herramienta y conserva su selección                                                                  |
| `contrast`             | Contrast                                     | El nombre del control deslizante de contraste                                                                                |
| `cornerBottomLeft`     | Bottom left corner                           | El nombre de un tirador de esquina                                                                                           |
| `cornerBottomRight`    | Bottom right corner                          | El nombre de un tirador de esquina                                                                                           |
| `cornerMoved`          | Top left corner: 120, 80                     | Función de la esquina y su posición en píxeles de la imagen, que se anuncia al mover una esquina                             |
| `cornerSelected`       | Top left corner: tap where it goes           | Función de la esquina, que se muestra y se anuncia al pulsar un tirador de esquina, hasta que un toque en la imagen lo mueve |
| `cornerTopLeft`        | Top left corner                              | El nombre de un tirador de esquina                                                                                           |
| `cornerTopRight`       | Top right corner                             | El nombre de un tirador de esquina                                                                                           |
| `crop`                 | Crop                                         | El botón Recortar                                                                                                            |
| `cropHint`             | Drag the corners                             | Qué hacer en Recortar                                                                                                        |
| `discard`              | Discard                                      | El botón que confirma perder los cambios                                                                                     |
| `discardQuestion`      | Discard your changes?                        | La pregunta antes de perder los cambios                                                                                      |
| `download`             | Download                                     | El botón de descarga                                                                                                         |
| `edit`                 | Edit                                         | El botón que empieza la edición                                                                                              |
| `editBar`              | Editing controls                             | El nombre de la barra de edición, para los lectores de pantalla                                                              |
| `editing`              | Editing                                      | Se anuncia cuando empieza el modo de edición                                                                                 |
| `fitHeight`            | Fit to height                                | El botón que ajusta el alto de la imagen                                                                                     |
| `fitWidth`             | Fit to width                                 | El botón que ajusta el ancho de la imagen                                                                                    |
| `flip`                 | Flip                                         | El botón Voltear                                                                                                             |
| `keepEditing`          | Keep editing                                 | El botón que vuelve a la edición en vez de perder los cambios                                                                |
| `loadError`            | The image could not be loaded                | Se muestra cuando la imagen no se puede cargar                                                                               |
| `loading`              | Loading image                                | Se muestra mientras la imagen se carga                                                                                       |
| `perspective`          | Straighten                                   | El botón Enderezar                                                                                                           |
| `perspectiveHint`      | Drag each corner to a corner of the document | Qué hacer en Enderezar                                                                                                       |
| `processing`           | Applying changes                             | Se muestra mientras Aplicar está en marcha                                                                                   |
| `redo`                 | Redo                                         | El botón Rehacer                                                                                                             |
| `rotateLeft`           | Rotate left                                  | El botón de girar de la barra de edición, y uno de los dos de un visor de solo lectura                                       |
| `rotateRight`          | Rotate right                                 | El otro botón de girar de un visor de solo lectura                                                                           |
| `threshold`            | Clean up                                     | El botón Limpiar                                                                                                             |
| `thresholdLevel`       | Sensitivity 50%                              | Función del porcentaje, que se anuncia al mover el control de sensibilidad                                                   |
| `thresholdSensitivity` | Sensitivity                                  | El nombre del control deslizante de sensibilidad                                                                             |
| `toolbar`              | Image controls                               | El nombre de la barra de herramientas, para los lectores de pantalla                                                         |
| `undo`                 | Undo                                         | El botón Deshacer                                                                                                            |
| `viewer`               | Image viewer                                 | El nombre de la zona que muestra la imagen, para los lectores de pantalla                                                    |
| `zoomIn`               | Zoom in                                      | El botón de acercar                                                                                                          |
| `zoomLevel`            | Zoom 150%                                    | Función del porcentaje, que se anuncia al hacer zoom desde la barra de herramientas o el teclado                             |
| `zoomOut`              | Zoom out                                     | El botón de alejar                                                                                                           |
