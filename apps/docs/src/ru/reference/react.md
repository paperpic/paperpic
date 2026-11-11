---
title: React
description: Как компонент PaperPic для React переводит опции, события и методы ядра в props, props-колбэки и ref.
---

# React

`@paperpic/react` оборачивает просмотрщик в компонент для React 19 и новее. Опции — это props, события — props-колбэки, а методы находятся в просмотрщике, который получает `ref`.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Отправьте отредактированное изображение на свой сервер
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Кассовый чек" onApply={upload} />
    </div>
  )
}
```

Компонент заполняет родительский элемент, поэтому задайте родителю высоту.

## Props

Каждая [опция](./options) — это prop с тем же именем, например `editable={false}` или `aspectRatio={210 / 297}`. Ещё два props оформляют элемент, который содержит просмотрщик:

| Prop        | Тип             | Описание                              |
| ----------- | --------------- | ------------------------------------- |
| `className` | `string`        | Классы в дополнение к `paperpic-host` |
| `style`     | `CSSProperties` | Встроенные стили                      |

Объекты и массивы, например `labels` или `tools`, снова доходят до просмотрщика, когда они новые. Определяйте их вне компонента или через `useMemo`.

## События

| Prop         | Данные                                 |
| ------------ | -------------------------------------- |
| `onApply`    | `{ blob, width, height, type }`        |
| `onChange`   | [`PaperPicState`](./state)             |
| `onDownload` | `{ source, filename, preventDefault }` |
| `onError`    | `{ error }`                            |
| `onLoad`     | `{ width, height }`                    |

[События](./events) описывают каждое. Новая функция не пересоздаёт просмотрщик, поэтому встроенные функции подходят. Изменение props никогда не вызывает `onChange`.

## Методы

`ref` получает просмотрщик типа `PaperPicInstance` со всеми [методами](./methods). До монтирования компонента он равен `null`:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Увеличить</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Повторная передача того же `src` не перезагружает изображение, поэтому результат редактирования сохраняется. Чтобы вернуть оригинал, вызовите `picRef.current.reload()`.

## Типы

`@paperpic/react` экспортирует нужные типы, так что устанавливать `@paperpic/core` не нужно: `PaperPicProps`, `PaperPicInstance`, `PaperPicState`, `PaperPicEvents`, `PaperPicIcons`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage` и `ToolId`.

## Рендеринг на сервере

Компонент помечен `'use client'`. При рендеринге на сервере, например в Next.js, он выводит на сервере пустой элемент и создаёт просмотрщик в браузере.
