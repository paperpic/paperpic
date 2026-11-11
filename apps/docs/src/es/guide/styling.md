---
title: Estilos
description: Cómo integrar PaperPic en el aspecto de tu app, con su hoja de estilos, sus tokens CSS, el modo oscuro, tus propios iconos y una capa de cascada que deja ganar a tu CSS.
---

# Estilos

PaperPic debe parecer parte de tu app. Incluye una sola hoja de estilos, toma sus colores y esquinas de unos pocos tokens CSS, sigue el esquema de color de tu página y guarda sus reglas en una capa de cascada, así que tu propio CSS siempre gana.

## Importar la hoja de estilos

Impórtala una vez en tu app:

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

## Darle un tamaño

El visor llena su contenedor y no tiene altura propia, así que el contenedor necesita una. Sirve cualquier CSS que le dé altura:

```css
.document-viewer {
  height: 70dvh;
}
```

El visor sigue el tamaño de su contenedor, no el de la pantalla. Reacciona cuando el contenedor cambia, por ejemplo al abrirse un panel lateral.

## Colores y esquinas

Cinco [tokens CSS](../reference/css-tokens) fijan el fondo, el texto, el color de acento, el radio de las esquinas y la duración de las transiciones. Defínelos en `:root`, en un antecesor del visor o en `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

Los tokens se heredan, así que una clase en el contenedor de un visor, o en el componente de Vue o React, cambia solo ese visor:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Usar los colores de tu sistema de diseño {#design-system}

Si tu app guarda sus colores en variables CSS, apunta los tokens a ellas en lugar de copiar sus valores. Así el visor sigue tu tema, modo oscuro incluido:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Defínelos en `.paperpic`, como aquí. Un token que usa `var()` lee la variable en el elemento donde lo defines, así que en `:root` no vería un tema que cambias en una parte de la página.

Sirve cualquier sistema de diseño con variables CSS, como las variables del tema de Tailwind CSS 4: `var(--color-blue-600)` o `var(--radius-md)`.

## Modo oscuro {#dark-mode}

Los colores siguen el `color-scheme` de tu página, como hacen los controles de formulario del navegador:

- Con `color-scheme: light dark`, pasan a oscuros cuando el sistema del usuario prefiere un esquema de color oscuro.
- Con `color-scheme: dark`, son siempre oscuros. También funciona en una parte de la página.
- Sin `color-scheme`, siguen claros, así que una página sin tema oscuro mantiene un visor claro.

Si tu sitio sigue al sistema, decláralo una vez:

```css
:root {
  color-scheme: light dark;
}
```

Si tu sitio cambia de tema con una clase, como en `<html>`, define `color-scheme` con esa clase. Las barras de desplazamiento y los controles de formulario del navegador también lo siguen:

```css
:root.dark {
  color-scheme: dark;
}
```

Para elegir tus propios colores oscuros, da a un token sus dos valores con `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Los tokens que apuntan a las variables de tu [sistema de diseño](#design-system) siguen tu tema en su lugar.

## Iconos {#icons}

La opción [`icons`](../reference/options#icons) sustituye cualquier icono por tu propio marcado, normalmente un `<svg>` del set de iconos de tu app:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- Cada clave nombra un icono, y algunos iconos aparecen en dos botones: `apply` también está en Hecho, y `cancel` también cierra Recortar y Enderezar. [Opciones](../reference/options#icons) recoge todas las claves.
- PaperPic da al icono la clase `paperpic-icon`, que fija su tamaño, y lo oculta a los lectores de pantalla, porque el botón ya tiene nombre.
- Dibuja el icono con `currentColor`, para que tome el color del botón en cualquier tema.
- El marcado entra en la página como HTML, así que pasa solo marcado de confianza.
- Con Vite, `import zoomIn from './zoom-in.svg?raw'` te da el marcado de un archivo `.svg`.

Para cambiar todos los iconos a la vez, como su tamaño o el grosor de sus líneas, da estilo a la clase:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## Tu CSS gana

Las reglas de PaperPic están en la capa de cascada `paperpic`, y cualquier CSS fuera de una capa las sobrescribe, tenga la especificidad que tenga. Eso facilita personalizarlo, pero un reset global fuera de una capa, como una regla sobre `button`, también llega a los botones del visor.

Si tu reset rompe el visor, muévelo a una capa anterior a `paperpic`. La primera declaración que nombra las capas fija su orden, así que ponla en un CSS que cargue antes que la hoja de estilos de PaperPic:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Tailwind CSS 4 también guarda sus reglas en capas de cascada. Nombra todas las capas, en orden, antes de importar Tailwind y PaperPic, para que el reset de Tailwind vaya antes de `paperpic` y sus utilidades después:

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

Importa aquí la hoja de estilos de PaperPic, en tu CSS, y no desde JavaScript. Con otro orden, el reset de Tailwind quita márgenes interiores y bordes al visor, o el visor sobrescribe utilidades como `h-96` en el componente.

## Nombres de clase {#class-names}

La [referencia de CSS](../reference/css-tokens#classes) recoge las clases que puedes usar en tus selectores, como `paperpic-toolbar` y `paperpic-button`, y sus nombres son estables. Las demás clases sostienen la disposición y pueden cambiar en cualquier versión. Usa los tokens cuando cubran lo que necesitas.

Cada botón, control deslizante y tirador de esquina lleva además `data-paperpic-control`, con la clave de su [texto de la interfaz](../reference/labels). Selecciónalo para dar estilo a un solo control:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Disposición

La interfaz se adapta sola a su contenedor:

- La barra de herramientas está a la derecha y se desplaza cuando el visor es demasiado bajo para sus botones.
- La barra de edición está abajo, en una fila, o en dos en un visor de menos de 28rem de ancho.
- En pantallas táctiles, los botones y los tiradores de esquina miden al menos 44 píxeles.

## Tus propios controles

Cuando los estilos no bastan, oculta la barra de herramientas y la barra de edición con `toolbar: false`, y maneja el visor con controles propios. [Barra de herramientas propia](../examples/custom-toolbar) muestra cómo.
