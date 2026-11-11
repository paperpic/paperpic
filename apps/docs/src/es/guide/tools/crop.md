---
title: Recortar
description: Cómo la herramienta Recortar de PaperPic conserva la parte de la foto que contiene el documento, con tiradores de esquina, una lupa en pantallas táctiles y el teclado.
---

# Recortar

La foto de un documento suele mostrar la mesa, una mano u otros papeles alrededor. Recortar conserva el rectángulo que contiene el documento y descarta el resto.

## Cómo se usa

1. Pulsa Editar y luego Recortar. Aparece un rectángulo dentro de la imagen, con un tirador en cada esquina.
2. Arrastra las esquinas hasta que el rectángulo enmarque el documento. Los botones de zoom siguen disponibles, así que puedes acercarte para colocarlas con precisión.
3. Pulsa Hecho, o `Enter`, para añadir el recorte a los cambios. Cancelar esta herramienta, o `Esc`, cierra Recortar sin cambiar nada.

El recorte es un cambio como cualquier otro: Deshacer lo quita y Aplicar lo hace permanente.

## Tiradores de esquina

- Los tiradores se quedan dentro de la imagen, y el rectángulo nunca se da la vuelta.
- En una pantalla táctil, una lupa muestra la zona bajo el dedo mientras arrastra una esquina, para que el dedo no tape dónde cae.
- Sin arrastrar, pulsa un tirador y luego toca donde va su esquina. Hasta entonces el tirador queda resaltado, y `Esc` lo suelta.
- Con el teclado, Tab pasa de un tirador a otro, y las flechas mueven el que tiene el foco 1 píxel de pantalla, o 10 con Mayús. Los lectores de pantalla anuncian cada movimiento.

## ¿Recortar o Enderezar?

Recortar conserva un rectángulo tal cual. En una foto hecha en ángulo, el documento parece un trapecio y ningún rectángulo encaja. Para esos casos usa [Enderezar](./straighten): mueve cada esquina por separado y aplana la página.

## Desde el código

Recortar está en la barra de edición por defecto, con el id `'crop'` en [`tools`](../../reference/options#tools). Con `toolbar: false`, ábrela con [`openTool()`](../../reference/methods#opentool) y ciérrala con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('crop')

// Más tarde, desde un botón tuyo
pic.confirmTool()
```
