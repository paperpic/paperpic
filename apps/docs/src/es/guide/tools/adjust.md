---
title: Ajustar
description: Cómo la herramienta Ajustar de PaperPic cambia el brillo y el contraste de la imagen de un documento con una regla en vivo, y cómo fijarlos desde el código.
---

# Ajustar

Las fotos hechas con poca luz salen oscuras o grises. Ajustar cambia el brillo y el contraste y conserva los colores, para documentos que no deben pasar a blanco y negro, como formularios en color o fotos.

## Cómo se usa

1. Pulsa Editar y luego Ajustar. Su panel ocupa el lugar de las herramientas: una regla, y Brillo y Contraste para elegir qué tono cambia.
2. Arrastra la regla. La vista previa cambia mientras arrastras. Elige Contraste para cambiar el otro tono con la misma regla.
3. Pulsa Hecho para conservar ambos tonos como un solo cambio, que Deshacer quita. Cancelar esta herramienta deja la imagen como estaba.

El centro de la regla deja la imagen como está, y la aguja se engancha ahí, así que volver a no cambiar nada es fácil. Los lectores de pantalla anuncian el valor de -100 a 100, como «Brillo +30». Un punto en Ajustar, y en cada tono dentro de su panel, marca un valor distinto de 0.

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

Mientras Ajustar está abierta, `setAdjustments()` cambia lo que muestra su panel, y [`confirmTool()`](../../reference/methods#confirmtool) lo conserva como un solo cambio.

En la opción [`tools`](../../reference/options#tools), Ajustar es `'adjust'`.
