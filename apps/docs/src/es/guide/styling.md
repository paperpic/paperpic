---
title: Estilos
description: Cómo integrar PaperPic en el aspecto de tu app, con su hoja de estilos, sus tokens CSS, el modo oscuro y una capa de cascada que deja ganar a tu CSS.
---

# Estilos

PaperPic debe parecer parte de tu app. Incluye una sola hoja de estilos, toma sus colores y esquinas de unos pocos tokens CSS, y guarda sus reglas en una capa de cascada, así que tu propio CSS siempre gana.

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

## Modo oscuro {#dark-mode}

Los colores pasan a los oscuros cuando el sistema del usuario prefiere un esquema de color oscuro. Si tu sitio cambia de tema de otra forma, como con una clase en `<html>`, define tú los colores de cada tema:

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

## Disposición

La interfaz se adapta sola a su contenedor:

- La barra de herramientas está a la derecha y se desplaza cuando el visor es demasiado bajo para sus botones.
- La barra de edición está abajo, en una fila, o en dos en un visor de menos de 28rem de ancho.
- En pantallas táctiles, los botones y los tiradores de esquina miden al menos 44 píxeles.

## Nombres de clase

Todas las clases del componente empiezan por `paperpic`, y sus nombres son estables, así que puedes usarlas en tus selectores. Usa los tokens cuando cubran lo que necesitas, porque siguen funcionando aunque cambie la estructura interna.
