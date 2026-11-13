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

Los objetos y arrays, como `labels` o `tools`, llegan otra vez al visor cada vez que son nuevos. Defínelos fuera del componente, o con `useMemo`.

## Eventos

| Prop         | Datos                                          |
| ------------ | ---------------------------------------------- |
| `onApply`    | [`ExportedImage`](./types#exportedimage)       |
| `onChange`   | [`PaperPicState`](./state)                     |
| `onDownload` | [`PaperPicDownload`](./types#paperpicdownload) |
| `onError`    | `{ error }`                                    |
| `onLoad`     | [`Size`](./types#size)                         |

[Eventos](./events) describe cada uno. Una función nueva no vuelve a crear el visor, así que las funciones en línea están bien. Un cambio de props nunca llama a `onChange`.

## Métodos

`ref` recibe el visor, de tipo [`PaperPicInstance`](./types#paperpicinstance), con todos los [métodos](./methods). Es `null` hasta que el componente se monta:

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

Pasar el mismo `src` otra vez no recarga la imagen, así que conserva el resultado de una edición. Para recuperar la original, llama a `picRef.current.reload()`.

## Tipos {#types}

`@paperpic/react` exporta todos los tipos de `@paperpic/core`, así que no hace falta instalarlo: [Tipos](./types) muestra cada uno. También exporta los tipos del componente: [`PaperPicProps`](./types#paperpicprops), con sus props, y [`PaperPicInstance`](./types#paperpicinstance), el visor que recibe `ref`.

## Renderizado en el servidor

El componente está marcado con `'use client'`. Con renderizado en el servidor, como en Next.js, renderiza un elemento vacío en el servidor y crea el visor en el navegador.
