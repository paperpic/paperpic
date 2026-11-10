---
title: React
description: Como o componente PaperPic para React transforma as opções, os eventos e os métodos do core em props, props de callback e uma ref.
---

# React

`@paperpic/react` envolve o visualizador num componente para React 19 ou mais recente. As opções são props, os eventos são props de callback, e os métodos ficam no visualizador que `ref` recebe.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Envie a imagem editada para o seu servidor
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Um recibo" onApply={upload} />
    </div>
  )
}
```

O componente preenche o elemento pai, então defina uma altura para ele.

## Props

Cada [opção](./options) é uma prop com o mesmo nome, como `editable={false}` ou `aspectRatio={210 / 297}`. Mais duas props estilizam o elemento que contém o visualizador:

| Prop        | Tipo            | Descrição                         |
| ----------- | --------------- | --------------------------------- |
| `className` | `string`        | Classes somadas a `paperpic-host` |
| `style`     | `CSSProperties` | Estilos inline                    |

Objetos e arrays, como `labels` ou `tools`, chegam de novo ao visualizador sempre que são novos. Defina-os fora do componente, ou com `useMemo`.

## Eventos

| Prop         | Dados                                  |
| ------------ | -------------------------------------- |
| `onLoad`     | `{ width, height }`                    |
| `onError`    | `{ error }`                            |
| `onChange`   | [`PaperPicState`](./state)             |
| `onApply`    | `{ blob, width, height, type }`        |
| `onDownload` | `{ source, filename, preventDefault }` |

[Eventos](./events) descreve cada um. Uma função nova não recria o visualizador, então funções inline não são problema. Uma mudança de props nunca chama `onChange`.

## Métodos

`ref` recebe o visualizador, do tipo `PaperPicInstance`, com todos os [métodos](./methods). Ele é `null` até o componente ser montado:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Ampliar</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Passar o mesmo `src` de novo não recarrega a imagem, então ela mantém o resultado de uma edição. Para trazer de volta a original, chame `picRef.current.reload()`.

## Tipos

`@paperpic/react` exporta os tipos de que você precisa, então não é preciso instalar `@paperpic/core`: `PaperPicProps`, `PaperPicInstance`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` e `ToolId`.

## Renderização no servidor

O componente é marcado com `'use client'`. Com renderização no servidor, como no Next.js, ele renderiza um elemento vazio no servidor e cria o visualizador no navegador.
