---
title: Tapar
description: Cómo la herramienta Tapar de PaperPic cubre parte de una foto con negro o blanco sólidos, como un número de cuenta o una firma, para que el resultado ya no lo contenga.
---

# Tapar

La foto de un documento puede mostrar más de la cuenta: un número de cuenta, una firma, una cara al fondo. Tapar cubre un rectángulo, recto o inclinado, con negro o blanco sólidos, y el resultado ya no contiene lo que había debajo.

<Demo src="/samples/receipt.jpg" alt="Un tique" :tools="['redact']" />

## Cómo se usa

1. Pulsa Editar y luego Tapar. Aparece una franja en medio de la imagen, con un tirador en cada esquina.
2. Arrastra la zona sobre lo que quieras ocultar. Gírala con el tirador que tiene encima, para que se incline con una línea de texto, y arrastra sus esquinas para cambiar su tamaño. La zona muestra su color, aún transparente, para que puedas colocarla sobre las palabras justas.
3. Elige Negro o Blanco en el panel.
4. Pulsa Hecho, o `Enter`, para añadir la zona a los cambios. Cancelar esta herramienta, o `Esc`, cierra Tapar sin cambiar nada.

Cada Hecho añade una zona, así que abre Tapar otra vez para cubrir otra parte. Deshacer quita la última zona, y el color se mantiene para la siguiente. Los tiradores de esquina funcionan como en [Recortar](./crop): se arrastran, se pulsan y luego se toca su destino, o se mueven con el teclado. En el tirador de encima de la zona, las flechas la giran 1 grado, o 10 con Mayús. Al arrastrarlo, se ajusta a recto.

## Qué garantiza {#guarantees}

- Las zonas se cubren después de todos los demás cambios, así que Ajustar y Limpiar nunca aclaran su negro ni su blanco.
- Una zona sigue a los cambios posteriores: un giro, un volteo o un recorte la mueven con la imagen, y Enderezar la deforma con la página.
- Cubre cada píxel que tocan sus bordes, aunque sea en parte, y es opaca también en un PNG transparente.
- Aplicar escribe píxeles sólidos en el resultado, así que el archivo no guarda nada de lo que cubren.

Hasta Aplicar, el visor conserva la imagen original, así que Deshacer recupera lo que cubre una zona. Comparte el resultado de Aplicar, nunca la imagen original.

## Desde el código

Tapar está en la barra de edición por defecto, con el id `'redact'` en [`tools`](../../reference/options#tools). Con `toolbar: false`, ábrela con [`openTool()`](../../reference/methods#opentool), elige el color con [`setRedaction()`](../../reference/methods#setredaction) y ciérrala con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Más tarde, desde un botón propio
pic.confirmTool()
```

El `redaction` del [estado](../../reference/state) guarda el color en uso.
