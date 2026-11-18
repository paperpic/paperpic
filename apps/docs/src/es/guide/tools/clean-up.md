---
title: Limpiar
description: Cómo la herramienta Limpiar de PaperPic pasa la foto de un documento a gris, o a un blanco y negro nítido sin sombras, y cómo cambian el resultado la sensibilidad y la suavidad, con una demo en vivo.
---

# Limpiar

Limpiar elige el acabado de la imagen: los tonos originales, gris, o blanco y negro. Su id en la API es `finish`.

El texto sobre papel se lee mejor en blanco y negro, pero una foto tiene sombras, luz desigual y papel gris. El blanco y negro compara cada píxel con lo que lo rodea para decidir si es tinta o papel, así que las sombras y la luz desigual desaparecen y el texto queda nítido. El gris conserva todos los tonos y solo quita el color, para documentos con fotos o sellos que el blanco y negro perdería.

<Demo src="/samples/receipt.jpg" alt="Un tique" :tools="['perspective', 'finish']" />

Endereza primero el tique y después límpialo.

## Cómo se usa

1. Pulsa Editar y luego Limpiar. Su panel ocupa el lugar de las herramientas, con tres acabados: Original, Gris y Blanco y negro. Se abre en blanco y negro, así que la vista previa pasa a blanco y negro y la regla Sensibilidad funciona.
2. Arrastra la regla. Más sensibilidad oscurece más píxeles, lo que recupera texto tenue o gastado. Menos sensibilidad deja una página más limpia, sin lo impreso que se transparenta desde el dorso.
3. Elige Gris si quieres una imagen en gris, u Original para los tonos de la foto. La regla solo funciona en blanco y negro.
4. Pulsa Hecho para conservarlo como un solo cambio, o Cancelar esta herramienta para dejar la imagen como estaba.

Cuando Limpiar ya es un cambio, se vuelve a abrir con su acabado. Para desactivarla, elige Original: los cambios que vinieron después se quedan. Deshacer, en cambio, también quitaría esos cambios.

Limpiar siempre se aplica después de los demás cambios. Recortar muestra la imagen con su acabado, como quedará. Enderezar la muestra sin blanco y negro, porque los bordes del papel son difíciles de encontrar en una página limpia, y conserva el gris.

[Ajustar](./adjust) funciona con el gris, que va después, y se desactiva en blanco y negro, que tiene tonos propios.

## Suavidad

[`softness`](../../reference/options#softness) fija cuánto gris conserva el blanco y negro en los bordes de las letras, de 0 a 1, con 0.25 por defecto. Un poco de gris suaviza los bordes y hace más legible el texto pequeño. Usa `0` para un blanco y negro estricto, que da archivos más pequeños pero rompe los trazos finos.

## Formato del resultado

Una imagen en blanco y negro es PNG, porque JPEG añadiría artefactos alrededor de sus bordes nítidos. Una imagen en gris conserva el formato del origen. La opción [`output`](../../reference/options#output) puede elegir otro formato.

## Desde el código

[`setFinish()`](../../reference/methods#setfinish) elige el acabado, `'original'`, `'gray'` o `'mono'` para blanco y negro, y fija la sensibilidad del blanco y negro, de 0 a 1, con 0.5 por defecto. [`getState()`](../../reference/methods#getstate) devuelve ambos en `finish`:

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

Con Limpiar abierta, `setFinish()` cambia lo que muestra su panel, y [`confirmTool()`](../../reference/methods#confirmtool) lo conserva como un solo cambio.
