---
title: Tokens CSS
description: Las propiedades personalizadas de CSS que dan estilo a PaperPic, con sus valores claros y oscuros, más su hoja de estilos, su capa de cascada, sus clases públicas y los nombres de sus controles.
---

# Tokens CSS

Los tokens son propiedades personalizadas de CSS que cambian el aspecto del componente sin sobrescribir sus reglas. Defínelos en `:root`, en un antecesor del visor o en `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Claro     | Oscuro    | Descripción                                 |
| -------------------------------- | --------- | --------- | ------------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Color de acento de la interfaz              |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Fondo de la interfaz                        |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Texto de la interfaz                        |
| `--paperpic-radius`              | `6px`     | `6px`     | Radio de las esquinas de la interfaz        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Duración de las transiciones de la interfaz |

## Modo oscuro

Los tokens de color toman su valor claro u oscuro con `light-dark()`, según el `color-scheme` de la página. Sin `color-scheme` son claros. Con `color-scheme: dark` son oscuros, y con `color-scheme: light dark` son oscuros cuando el sistema prefiere un esquema de color oscuro. [Estilos](../guide/styling#dark-mode) muestra cómo definirlo.

Para elegir los dos valores de un token, usa también `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

## Hoja de estilos

Cada paquete incluye una hoja de estilos. Impórtala una vez en tu app:

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

Sus reglas están en la capa de cascada `paperpic`, así que cualquier CSS tuyo fuera de una capa las sobrescribe, tenga la especificidad que tenga. Eso incluye los reset globales, como una regla sobre `button`. Con Tailwind CSS, nombra el orden de las capas, como muestra [Estilos](../guide/styling#tailwind).

## Clases {#classes}

Estas clases son públicas: sus nombres, y los elementos que marcan, se mantienen estables entre versiones. Las demás clases del componente sostienen su disposición y pueden cambiar en cualquier versión.

| Clase                     | Elemento                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `paperpic`                | La raíz del visor                                                                                                      |
| `paperpic-button`         | Cada botón de la barra de herramientas y de la barra de edición                                                        |
| `paperpic-button-danger`  | Descartar, en la pregunta antes de descartar los cambios                                                               |
| `paperpic-button-primary` | Aplicar, y Hecho en Recortar y Enderezar                                                                               |
| `paperpic-button-text`    | Los botones de la pregunta antes de descartar los cambios                                                              |
| `paperpic-edit-bar`       | La barra de edición, abajo                                                                                             |
| `paperpic-editing`        | La raíz, durante la edición                                                                                            |
| `paperpic-handle`         | Un tirador de esquina de Recortar y Enderezar                                                                          |
| `paperpic-host`           | El elemento que los componentes de Vue y React crean alrededor del visor                                               |
| `paperpic-icon`           | El icono de un botón                                                                                                   |
| `paperpic-status`         | El mensaje para lectores de pantalla, que también se ve mientras la imagen carga o los cambios se aplican, y al fallar |
| `paperpic-status-visible` | El mensaje, mientras se ve en el centro del visor                                                                      |
| `paperpic-toolbar`        | La barra de herramientas, a la derecha                                                                                 |
| `paperpic-viewport`       | El área que muestra la imagen y recibe el foco del teclado                                                             |

Los botones muestran su estado con atributos ARIA, que también puedes seleccionar:

| Atributo                 | Estado                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | El botón no puede actuar ahora. Conserva el foco del teclado, así que no es `disabled`    |
| `[aria-expanded='true']` | Ajustar, mientras se ven sus controles deslizantes                                        |
| `[aria-pressed='true']`  | Un botón activado, como Limpiar, o Ajustar al ancho y Ajustar al alto mientras se aplican |

El estado al pasar el puntero y estos estados se pintan con `box-shadow`, que los reset globales de botones no tocan. Para cambiarlos, sobrescribe también `box-shadow`.

## Controles {#controls}

Cada botón, control deslizante y tirador de esquina lleva `data-paperpic-control`, con la clave de su [texto de la interfaz](./labels). Selecciónalo para dar estilo a un solo control:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Lugar                       | Valores                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Barra de herramientas       | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| Barra de edición            | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| Controles deslizantes       | `thresholdSensitivity`, `brightness`, `contrast`                                                      |
| Recortar y Enderezar        | `cancelTool`, `confirm`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`   |
| Pregunta antes de descartar | `keepEditing`, `discard`                                                                              |

`rotateLeft` nombra dos botones que nunca se ven a la vez: el de un visor de solo lectura, que gira la vista, y el de la barra de edición, que gira la imagen.
