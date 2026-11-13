---
title: Enderezar
description: Cómo la herramienta Enderezar de PaperPic convierte la foto de un documento hecha en ángulo en una página plana, cómo estima las proporciones y cuándo usar aspectRatio, con una demo en vivo.
---

# Enderezar

Un documento fotografiado en ángulo parece un trapecio: el borde lejano es más corto y el texto se inclina. Enderezar lo devuelve a una página plana y rectangular, como si se hubiera escaneado. Su id en la API es `perspective`.

<Demo src="/samples/receipt.jpg" alt="Un tique" :tools="['perspective']" />

## Cómo se usa

1. Pulsa Editar y luego Enderezar. Aparece un tirador para cada esquina.
2. Arrastra cada tirador a una esquina del documento. Acércate con los botones de zoom de su panel para colocarlos con precisión.
3. Pulsa Hecho, o `Enter`. El visor muestra la página plana, recortada a las cuatro esquinas.

Los tiradores funcionan como en [Recortar](./crop): una lupa en pantallas táctiles, pulsar y tocar en lugar de arrastrar, y Tab y las flechas con el teclado. Las cuatro esquinas siempre forman una figura convexa, así que la página siempre se puede aplanar.

Enderezar muestra la foto sin [Limpiar](./clean-up), porque en una página limpiada cuesta encontrar los bordes del papel. Limpiar vuelve después de Hecho.

## Proporciones

Una foto no dice la forma real de la página, así que Enderezar estima sus proporciones a partir de dónde quedan las esquinas en la foto. La estimación va bien con fotos hechas desde una distancia normal, pero no puede ser exacta.

La estimación usa la foto original, incluso después de un recorte o un giro en la misma edición. En cuanto el usuario aplica, el resultado pasa a contar como la foto nueva, así que endereza antes de aplicar.

Si conoces el documento, pon en [`aspectRatio`](../../reference/options#aspectratio) su ancho dividido por su alto, y el resultado toma esas proporciones:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Documento                           | `aspectRatio`  |
| ----------------------------------- | -------------- |
| Hoja A4, en vertical                | `210 / 297`    |
| Hoja US Letter, en vertical         | `8.5 / 11`     |
| Tarjeta de identidad, en horizontal | `85.6 / 53.98` |

Para una hoja en horizontal, invierte los números, como en `297 / 210`.

## Esquinas que se salen de la foto

A veces una esquina del documento queda fuera de la foto. Los tiradores se quedan dentro de la imagen, así que coloca ese tirador en el borde de la foto, a lo largo del lado del documento que conserva el contenido. Las últimas filas se inclinan un poco y la estimación de las proporciones empeora, algo que [`aspectRatio`](../../reference/options#aspectratio) puede corregir.

En el [playground](../../playground) hay un tique de ejemplo con una esquina cortada para probarlo.

## Desde el código

Enderezar se abre con [`openTool('perspective')`](../../reference/methods#opentool) y se cierra con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')

// Más tarde, desde un botón tuyo
pic.confirmTool()
```
