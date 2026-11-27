---
title: React
description: Cómo el componente de PaperPic para React traduce las opciones, los eventos y los métodos del core a props, props de callback y una ref.
---

# React

`@paperpic/react` envuelve el visor en un componente para React 19 o posterior. Las opciones son props, los eventos son props de callback, y los métodos están en el visor que recibe `ref`.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Envía la imagen editada a tu servidor
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Un tique" onApply={upload} />
    </div>
  )
}
```

El componente llena su elemento padre, así que dale una altura al padre.

## Props

Cada [opción](./options) es una prop con el mismo nombre, como `editable={false}` o `aspectRatio={210 / 297}`. Dos props más dan estilo al elemento que contiene el visor:

| Prop        | Tipo            | Descripción                           |
| ----------- | --------------- | ------------------------------------- |
| `className` | `string`        | Clases que se suman a `paperpic-host` |
| `style`     | `CSSProperties` | Estilos en línea                      |

Un objeto o array con el mismo contenido que antes, como `tools={['crop', 'rotate']}`, no cambia nada, así que los valores en línea sirven. Una función es nueva en cada renderizado, así que define las funciones de `labels`, como `zoomLevel`, fuera del componente, o crea esos labels con `useMemo`.

## Eventos

| Prop         | Datos                                          |
| ------------ | ---------------------------------------------- |
| `onApply`    | [`ExportedImage`](./types#exportedimage)       |
| `onChange`   | [`PaperPicState`](./state)                     |
| `onDownload` | [`PaperPicDownload`](./types#paperpicdownload) |
| `onError`    | `{ error, phase }`                             |
| `onLoad`     | [`Size`](./types#size)                         |

[Eventos](./events) describe cada uno. Una función nueva no vuelve a crear el visor, así que las funciones en línea están bien. Un cambio de props nunca llama a `onChange`.

`onChange` recibe el [estado](./state) del visor, no un evento del DOM. [Estado](./state#in-step) muestra cómo guardarlo con `useState`, `onChange`, `onLoad` y `onError`.

## Métodos {#methods}

`ref` recibe el visor, de tipo [`PaperPicInstance`](./types#paperpicinstance), con los [métodos](./methods), como `zoomIn()` o `apply()`. Es `null` hasta que el componente se monta:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Acercar</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

El componente crea el visor al montarse y lo destruye al desmontarse, así que no llames a `destroy()`. Cambia las props en vez de llamar a `setOptions()`, que el siguiente cambio de una prop desharía, y usa las props de callback en vez de `on()`.

Pasar el mismo `src` otra vez no recarga la imagen, así que conserva el resultado editado. Para recuperar la original, llama a `picRef.current.reload()`.

## Tipos {#types}

`@paperpic/react` exporta todos los tipos de `@paperpic/core`, así que no hace falta instalarlo: [Tipos](./types) muestra cada uno. También exporta los tipos del componente: [`PaperPicProps`](./types#paperpicprops), con sus props, y [`PaperPicInstance`](./types#paperpicinstance), el visor que recibe `ref`.

## Renderizado en el servidor

El componente está marcado con `'use client'`. Con renderizado en el servidor, como en Next.js, renderiza un elemento vacío en el servidor y crea el visor en el navegador.
