---
title: Edición
description: Cómo funciona el modo de edición de PaperPic, desde el botón Editar hasta Aplicar, con las herramientas, Deshacer y Rehacer, la vista previa y los eventos que recibe tu código.
---

# Edición

La foto de un documento suele necesitar unos cuantos arreglos antes de merecer la pena guardarla. El modo de edición los agrupa: el usuario hace los cambios, los revisa y los aplica todos a la vez. En el [playground](../playground) puedes probar el modo de edición completo.

## El flujo de edición

1. El usuario pulsa Editar, el lápiz de la barra de herramientas. La barra de edición aparece en la parte inferior del visor.
2. Cada herramienta de la barra de edición añade un cambio, que el visor muestra al momento. Deshacer y Rehacer recorren los cambios.
3. Aplicar calcula el resultado y vuelve a la visualización. Cancelar descarta los cambios, y pregunta antes si los hay.

Nada cambia la imagen hasta Aplicar. Antes, los cambios son una lista de la que el visor muestra una vista previa.

## Herramientas

| Herramienta                                     | Qué hace                                                        | Id            |
| ----------------------------------------------- | --------------------------------------------------------------- | ------------- |
| [Recortar](./tools/crop)                        | Conserva la parte de la imagen dentro de cuatro esquinas        | `crop`        |
| [Enderezar](./tools/straighten)                 | Convierte una foto hecha en ángulo en una página plana          | `perspective` |
| [Girar a la izquierda](./tools/rotate-and-flip) | Gira la imagen un cuarto de vuelta a la izquierda               | `rotate`      |
| [Voltear](./tools/rotate-and-flip)              | Voltea la imagen de izquierda a derecha                         | `flip`        |
| [Ajustar](./tools/adjust)                       | Cambia el brillo y el contraste                                 | `adjust`      |
| [Limpiar](./tools/clean-up)                     | Convierte el documento en un blanco y negro nítido, sin sombras | `threshold`   |

La opción [`tools`](../reference/options#tools) elige cuáles ofrece la barra de edición:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Recortar y Enderezar tienen una selección propia, así que el resto de la barra de edición espera mientras una de ellas está abierta. Hecho, o `Enter`, añade la selección a los cambios, y Cancelar esta herramienta, o `Esc`, la descarta.

## Vista previa y Aplicar

Durante la edición, el visor muestra los cambios sobre una copia de la imagen de unos 2 megapíxeles, para que siga siendo rápido con fotos grandes. Con mucho zoom, la vista previa se ve más suave que el resultado. Aplicar calcula todos los cambios a resolución completa, o a [`maxOutputSize`](../reference/options#maxoutputsize), en un Web Worker.

Aplicar no se puede interrumpir. Bloquea los controles y muestra un mensaje mientras dura. Después, el resultado sustituye a la imagen en pantalla, el historial se vacía y el visor vuelve al modo de visualización. Si Aplicar falla, la edición sigue abierta para que el usuario pueda volver a intentarlo.

## Qué recibe tu código

| Evento   | Cuándo                                                                  |
| -------- | ----------------------------------------------------------------------- |
| `apply`  | Cuando el resultado está listo, con `{ blob, width, height, type }`     |
| `change` | Después de cada acción del usuario, con el [estado](../reference/state) |
| `error`  | Cuando Aplicar falla, o cuando la imagen no se puede cargar             |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## Qué descarta los cambios

- Cancelar, después de que el usuario confirme, o [`cancel()`](../reference/methods#cancel), que no pregunta.
- Un `src` nuevo durante la edición.
- Un cambio de `editable` durante la edición.

Después de Aplicar, pasar el mismo `src` otra vez no hace nada, así que el resultado sigue en pantalla. [`reload()`](../reference/methods#reload) recupera la imagen original.

## Teclado

Con el foco en el visor:

| Tecla                     | Acción                                                         |
| ------------------------- | -------------------------------------------------------------- |
| `Ctrl+Z`                  | Deshacer                                                       |
| `Ctrl+Shift+Z` o `Ctrl+Y` | Rehacer                                                        |
| `Enter`                   | Confirmar la herramienta abierta, o si no, aplicar los cambios |
| `Esc`                     | Cerrar la herramienta abierta, o si no, cancelar los cambios   |

En macOS, `Cmd` funciona como `Ctrl`.
