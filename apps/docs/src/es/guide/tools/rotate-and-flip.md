---
title: Girar y voltear
description: Cómo girar y voltear la imagen de un documento en PaperPic, en el modo de edición, en un visor de solo lectura y desde el código.
---

# Girar y voltear

Los móviles guardan a menudo la foto de un documento de lado o boca abajo, y algunos escaneos salen como en un espejo. Girar a la izquierda y Voltear corrigen la orientación y dejan el resto de la imagen como está.

## Girar

En la barra de edición, Girar a la izquierda gira la imagen un cuarto de vuelta en sentido contrario a las agujas del reloj, como en las galerías de fotos. Púlsalo dos veces para media vuelta, o tres para un cuarto de vuelta en el sentido de las agujas del reloj.

Un giro es un cambio: Deshacer lo quita y Aplicar lo hace permanente. Cuatro giros devuelven la imagen a donde estaba, y entonces no hay nada que aplicar.

Desde el código, [`rotate()`](../../reference/methods#rotate) gira en el sentido de las agujas del reloj con `1` y en el contrario con `-1`:

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Voltear

Voltear refleja la imagen de izquierda a derecha tal como se ve, así que después de un cuarto de vuelta sigue reflejándola de izquierda a derecha en la pantalla. Para poner una imagen boca abajo, voltéala y gírala dos veces.

Los volteos y giros que se anulan entre sí no dejan nada que aplicar. Desde el código, llama a [`flip()`](../../reference/methods#flip).

## En un visor de solo lectura

Con [`editable: false`](../viewer#read-only), la barra de herramientas tiene los botones Girar a la izquierda y Girar a la derecha. Solo giran la imagen en pantalla: no se guarda nada y el evento `apply` nunca se emite. [`rotate()`](../../reference/methods#rotate) hace lo mismo desde el código. Un visor de solo lectura no tiene Voltear.

## Ids

En la opción [`tools`](../../reference/options#tools), Girar a la izquierda es `'rotate'` y Voltear es `'flip'`.
