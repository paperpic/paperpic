---
title: Limpiar
description: Cómo la herramienta Limpiar de PaperPic convierte la foto de un documento en un blanco y negro nítido sin sombras, y cómo cambian el resultado la sensibilidad y la suavidad, con una demo en vivo.
---

# Limpiar

El texto sobre papel se lee mejor en blanco y negro, pero una foto tiene sombras, luz desigual y papel gris. Limpiar compara cada píxel con lo que lo rodea para decidir si es tinta o papel, así que las sombras y la luz desigual desaparecen y el texto queda nítido. Su id en la API es `threshold`.

<Demo src="/samples/receipt.jpg" alt="Un tique" :tools="['perspective', 'threshold']" />

Endereza primero el tique y después límpialo.

## Cómo se usa

1. Pulsa Editar y luego Limpiar. Su panel ocupa el lugar de las herramientas, la vista previa pasa a blanco y negro y aparece una regla de Sensibilidad.
2. Arrastra la regla. Más sensibilidad oscurece más píxeles, lo que recupera texto tenue o gastado. Menos sensibilidad da una página más limpia, sin lo que se transparenta desde el reverso.
3. Pulsa Hecho para conservarlo como un solo cambio, o Cancelar esta herramienta para dejar la imagen como estaba.

Para desactivar un Limpiar que ya es un cambio, ábrelo de nuevo: un interruptor junto a la regla lo desactiva, y los cambios que vinieron después se mantienen. Deshacer quitaría antes esos cambios.

Limpiar siempre se aplica después de los demás cambios. Recortar muestra la imagen limpiada, como quedará. Enderezar la muestra sin Limpiar, porque en una página limpiada cuesta encontrar los bordes del papel.

## Suavidad

[`softness`](../../reference/options#softness) fija cuánto gris conserva Limpiar en los bordes de las letras, de 0 a 1, con 0.25 por defecto. Un poco de gris suaviza los bordes y hace que la letra pequeña se lea mejor. Usa `0` para un blanco y negro estricto, que da archivos más pequeños pero rompe los trazos finos.

## Formato del resultado

Una imagen limpiada sale en PNG, porque JPEG añadiría artefactos alrededor de sus bordes nítidos. La opción [`output`](../../reference/options#output) puede elegir otro formato.

## Desde el código

[`setThreshold()`](../../reference/methods#setthreshold) activa o desactiva Limpiar y fija su sensibilidad, de 0 a 1, con 0.5 por defecto. [`getState()`](../../reference/methods#getstate) devuelve ambos en `threshold`:

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```

Mientras Limpiar está abierta, `setThreshold()` cambia lo que muestra su panel, y [`confirmTool()`](../../reference/methods#confirmtool) lo conserva como un solo cambio.
