---
title: React
description: React용 PaperPic 컴포넌트가 코어의 옵션, 이벤트, 메서드를 props, 콜백 props, ref에 어떻게 대응시키는지 설명합니다.
---

# React

`@paperpic/react`는 뷰어를 React 19 이상용 컴포넌트로 감쌉니다. 옵션은 props, 이벤트는 콜백 props이고, 메서드는 `ref`가 받는 뷰어에 있습니다.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // 편집한 이미지를 서버로 보냅니다
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="영수증" onApply={upload} />
    </div>
  )
}
```

컴포넌트는 부모 요소를 가득 채우므로 부모 요소에 높이를 지정하세요.

## Props

각 [옵션](./options)은 같은 이름의 prop입니다. 예를 들어 `editable={false}`나 `aspectRatio={210 / 297}`입니다. 뷰어를 담는 요소의 스타일을 정하는 props가 두 개 더 있습니다.

| Prop        | 타입            | 설명                          |
| ----------- | --------------- | ----------------------------- |
| `className` | `string`        | `paperpic-host`에 더할 클래스 |
| `style`     | `CSSProperties` | 인라인 스타일                 |

`labels`나 `tools` 같은 객체와 배열은 새로 만들어질 때마다 뷰어에 다시 전달됩니다. 컴포넌트 밖에서 정의하거나 `useMemo`를 쓰세요.

## 이벤트

| Prop         | 페이로드                               |
| ------------ | -------------------------------------- |
| `onLoad`     | `{ width, height }`                    |
| `onError`    | `{ error }`                            |
| `onChange`   | [`PaperPicState`](./state)             |
| `onApply`    | `{ blob, width, height, type }`        |
| `onDownload` | `{ source, filename, preventDefault }` |

각 이벤트는 [이벤트](./events)에서 설명합니다. 새 함수를 전달해도 뷰어를 다시 만들지 않으므로 인라인 함수를 써도 됩니다. props가 바뀌어도 `onChange`는 호출되지 않습니다.

## 메서드

`ref`는 모든 [메서드](./methods)를 가진 `PaperPicInstance` 타입의 뷰어를 받습니다. 컴포넌트가 마운트되기 전에는 `null`입니다.

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>확대</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

같은 `src`를 다시 전달해도 이미지를 다시 불러오지 않으므로 편집 결과가 유지됩니다. 원본으로 돌아가려면 `picRef.current.reload()`를 호출하세요.

## 타입

`@paperpic/react`는 필요한 타입을 내보내므로 `@paperpic/core`를 설치할 필요가 없습니다. `PaperPicProps`, `PaperPicInstance`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage`, `ToolId`입니다.

## 서버 사이드 렌더링

이 컴포넌트에는 `'use client'`가 표시되어 있습니다. Next.js 같은 서버 사이드 렌더링에서는 서버에서 빈 요소를 렌더링하고, 브라우저에서 뷰어를 만듭니다.
