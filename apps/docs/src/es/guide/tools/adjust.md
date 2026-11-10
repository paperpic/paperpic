---
title: Ajustar
description: Cómo la herramienta Ajustar de PaperPic cambia el brillo y el contraste de la imagen de un documento con dos controles deslizantes en vivo, y cómo fijarlos desde el código.
---

# Ajustar

Las fotos hechas con poca luz salen oscuras o grises. Ajustar cambia el brillo y el contraste y conserva los colores, para documentos que no deben pasar a blanco y negro, como formularios en color o fotos.

## Cómo se usa

1. Pulsa Editar y luego Ajustar. En la barra de edición aparecen dos controles deslizantes: Brillo y Contraste.
2. Arrastra un control. La vista previa cambia mientras arrastras, y al soltarlo queda un cambio, que Deshacer quita.
3. Pulsa Ajustar otra vez para ocultar los controles.

El centro de cada control deja la imagen como está, y un control que vuelve al centro no cuenta como cambio. Los lectores de pantalla anuncian el valor de -100 a 100, como «Brillo +30».

Ajustar se aplica después de los demás cambios, así que Recortar y Enderezar muestran la imagen con él.

## ¿Ajustar o Limpiar?

| Ajustar                                   | [Limpiar](./clean-up)                    |
| ----------------------------------------- | ---------------------------------------- |
| Conserva los colores y los grises         | Convierte el documento en blanco y negro |
| Para formularios en color, sellos y fotos | Para texto sobre papel                   |
| Mantiene el formato de la imagen original | Da PNG                                   |

Mientras Limpiar está activado, Ajustar está desactivado, porque un documento limpiado tiene sus propios tonos.

## Desde el código

[`setAdjustments()`](../../reference/methods#setadjustments) acepta valores de -1 a 1, donde 0 es no cambiar, y [`getState()`](../../reference/methods#getstate) los devuelve en `adjustments`:

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

En la opción [`tools`](../../reference/options#tools), Ajustar es `'adjust'`.
