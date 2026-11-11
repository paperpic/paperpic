---
title: Tokens CSS
description: Las propiedades personalizadas de CSS que dan estilo a PaperPic, con sus valores claros y oscuros, más su hoja de estilos, su capa de cascada y sus nombres de clase.
---

# Tokens CSS

Los tokens son propiedades personalizadas de CSS que cambian el aspecto del componente sin sobrescribir sus reglas. Defínelos en `:root`, en un antecesor del visor o en `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Por defecto | En oscuro | Descripción                                 |
| -------------------------------- | ----------- | --------- | ------------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff`   | `#5cb5ff` | Color de acento de la interfaz              |
| `--paperpic-color-surface`       | `#fff`      | `#151e2e` | Fondo de la interfaz                        |
| `--paperpic-color-text`          | `#1a263c`   | `#f2f5f9` | Texto de la interfaz                        |
| `--paperpic-radius`              | `6px`       | `6px`     | Radio de las esquinas de la interfaz        |
| `--paperpic-transition-duration` | `0.2s`      | `0.2s`    | Duración de las transiciones de la interfaz |

## Modo oscuro

Los valores oscuros se aplican cuando el sistema del usuario prefiere un esquema de color oscuro. Si tu sitio cambia de tema de otra forma, como con una clase en `<html>`, define tú los colores de cada tema:

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

Sus reglas están en la capa de cascada `paperpic`, así que cualquier CSS tuyo fuera de una capa las sobrescribe, tenga la especificidad que tenga. Eso incluye los reset globales, como una regla sobre `button`.

## Nombres de clase

`.paperpic` es la raíz del visor, y `.paperpic-host` es el elemento que los componentes de Vue y React crean a su alrededor. Todas las clases del componente empiezan por `paperpic`, y sus nombres son estables. Usa los tokens cuando cubran lo que necesitas.
