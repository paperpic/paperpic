---
title: 이벤트
description: PaperPic의 이벤트 load, error, change, apply, download와 각 이벤트가 전달하는 데이터, 그리고 JavaScript, Vue, React에서 구독하는 방법.
---

# 이벤트

이벤트는 뷰어에서 일어난 일을 코드에 알립니다. [`on()`](./methods#on)으로 구독합니다. Vue에서는 `@apply` 같은 컴포넌트 이벤트이고, React에서는 `onApply` 같은 props입니다.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **페이로드:** [`Size`](./types#size)

이미지를 불러와 화면에 표시했습니다. `width`와 `height`는 픽셀 단위 크기입니다.

## `error`

- **페이로드:** `{ error: Error }`

이미지를 불러오지 못했거나 변경을 적용하지 못했습니다. 적용에 실패하면 편집은 열린 채로 남습니다.

## `change`

- **페이로드:** [`PaperPicState`](./state)

사용자가 보기나 편집을 바꿨습니다. 예를 들어 확대/축소, 도구 열기, 실행 취소 등입니다. 적용의 시작도 `busy: true`로 알립니다. `setOptions()`와 컴포넌트의 props로는 발생하지 않습니다.

## `apply`

- **페이로드:** [`ExportedImage`](./types#exportedimage)

사용자가 변경을 적용했고, 결과가 이미 화면에 있습니다. `blob`에는 [`output`](./options#output)이 정하는 형식 `type`의 이미지가 들어 있습니다.

## `download`

- **페이로드:** [`PaperPicDownload`](./types#paperpicdownload)

다운로드 버튼이나 [`download()`](./methods#download)로 이미지가 곧 저장됩니다. `source`는 화면의 이미지로, 마지막 적용의 결과이고 없으면 `src`입니다. `filename`은 파일 이름입니다.

브라우저가 파일을 저장하지 않게 하려면 `preventDefault()`를 호출하세요. 다른 방법으로 저장할 때 씁니다.

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
