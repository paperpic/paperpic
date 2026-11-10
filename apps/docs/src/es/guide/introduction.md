---
title: ¿Qué es PaperPic?
description: PaperPic es un visor y editor de imágenes de documentos para la web. Permite hacer zoom en fotos de papel, enderezarlas, recortarlas y limpiarlas antes de que tu app las guarde.
---

# ¿Qué es PaperPic?

Las fotos de documentos llegan torcidas, con sombras y con mucho fondo. PaperPic las muestra en un visor en el que se puede hacer zoom, y deja enderezar y limpiar cada foto antes de que tu app la guarde, como haría una app de escáner.

## Qué hace

- **Ver.** Hacer zoom con los botones, la rueda o el gesto de pellizcar, desplazar la imagen y ajustar la imagen entera, su ancho o su alto. Un visor de solo lectura también puede girar la imagen.
- **Editar.** En el modo de edición, el usuario puede recortar, enderezar una foto hecha en ángulo, girar, voltear, ajustar el brillo y el contraste, y limpiar el documento en blanco y negro. Cada cambio se puede deshacer hasta que el usuario aplica los cambios.
- **Entregar.** Aplicar calcula el resultado a resolución completa y se lo pasa a tu código como un `Blob`. Un botón de descarga también puede guardarlo.

Cada paso ocurre solo cuando el usuario lo pide. Nada cambia la foto por su cuenta.

## Qué no hace

- No sube nada. Tu app decide qué hacer con el resultado.
- No abre archivos PDF, solo imágenes.
- No encuentra por sí solo los bordes del documento: el usuario arrastra las esquinas.

## Paquetes

| Paquete           | Úsalo con                                       |
| ----------------- | ----------------------------------------------- |
| `@paperpic/core`  | JavaScript sin framework, o cualquier framework |
| `@paperpic/vue`   | Vue 3.5 o posterior                             |
| `@paperpic/react` | React 19 o posterior                            |

Los tres tienen las mismas opciones, eventos y métodos, y el core no tiene dependencias en tiempo de ejecución. La edición se hace en un Web Worker, así que la página sigue respondiendo con fotos grandes.

## Pruébalo

En el [playground](../playground) puedes editar un tique de ejemplo, o una foto tuya que nunca sale de tu navegador. Para añadir PaperPic a tu app, ve a [Primeros pasos](./getting-started).
