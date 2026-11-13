---
title: Estado
description: Lo que devuelve getState() y lleva el evento change, como el estado de la imagen, el modo, el zoom, los cambios y si hay algo para aplicar.
---

# Estado

El estado describe lo que muestra el visor en un momento dado. [`getState()`](./methods#getstate) lo devuelve, y el evento [`change`](./events#change) lo lleva. Úsalo para mantener al día tus propios controles, como un botón Aplicar:

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Campo         | Tipo                                         | Descripción                                                                                                        |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | La herramienta abierta, como `'crop'` o `'adjust'`, o `null`                                                       |
| `adjustments` | `{ brightness, contrast }`                   | El brillo y el contraste, cada uno de -1 a 1. Limpiar los deja fuera. Con Ajustar abierta, los valores que muestra |
| `busy`        | `boolean`                                    | Si Aplicar está en marcha                                                                                          |
| `canApply`    | `boolean`                                    | Si hay cambios para aplicar. Los giros y volteos que se anulan entre sí no cuentan como cambio                     |
| `canRedo`     | `boolean`                                    | Si hay un cambio para recuperar                                                                                    |
| `canUndo`     | `boolean`                                    | Si hay un cambio para deshacer                                                                                     |
| `fit`         | [`Fit \| null`](./types#fit)                 | El ajuste vigente, o `null` en cuanto el usuario hace zoom a mano                                                  |
| `image`       | [`Size \| null`](./types#size)               | El tamaño de la imagen en pantalla en píxeles, con los cambios hechos, o `null` si no hay imagen                   |
| `mode`        | `'view' \| 'edit'`                           | Si el usuario está viendo o editando la imagen                                                                     |
| `rotation`    | [`Rotation`](./types#rotation)               | Cuánto está girada la imagen en pantalla, en grados en el sentido de las agujas del reloj                          |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Si hay una imagen, y si se cargó                                                                                   |
| `threshold`   | `{ enabled, sensitivity }`                   | Si Limpiar está activado, y su sensibilidad de 0 a 1. Con Limpiar abierta, lo que muestra                          |
| `zoom`        | `number`                                     | Píxeles de pantalla por cada píxel de la imagen                                                                    |
