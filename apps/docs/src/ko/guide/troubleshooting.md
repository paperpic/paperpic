---
title: 문제 해결
description: PaperPic 뷰어에 높이나 스타일이 없을 때, Tailwind CSS가 뷰어를 바꿀 때, 이미지를 불러오지 못하거나 편집할 수 없을 때, 적용 중 페이지가 멈출 때, 큰 사진이 실패할 때 할 일.
---

# 문제 해결

PaperPic의 문제는 대부분 이미지가 아니라 설정에서 생깁니다. 보이는 증상을 찾으면 바로 아래에 해결 방법이 있습니다.

## 뷰어가 얇은 띠로 보이거나 보이지 않음 {#no-height}

뷰어는 컨테이너를 채우며, 높이가 없는 컨테이너는 뷰어의 최소 높이로 줄어듭니다. 컨테이너에 `height: 480px` 같은 높이를 주거나, 높이를 정해 주는 flex나 grid 레이아웃에 넣으세요. 두 방법 모두 [스타일](./styling)에 있습니다.

## 버튼에 스타일이 없고 콘솔에 경고가 나옴 {#no-stylesheet}

콘솔에 `PaperPic: the stylesheet is missing, so the viewer has no layout.`이 나옵니다. 앱에서 스타일시트를 한 번 가져오세요. `@paperpic/core/style.css`, 또는 `@paperpic/vue`나 `@paperpic/react`의 `style.css`입니다.

## Tailwind CSS가 뷰어의 테두리와 여백을 없앰 {#tailwind}

캐스케이드 레이어 순서가 틀리면 Tailwind CSS 4의 리셋이 PaperPic의 스타일시트를 이깁니다. 둘을 가져오기 전에 레이어 이름을 정하세요. 방법은 [스타일](./styling#tailwind)에 있습니다.

## 이미지는 보이지만 편집이 실패함 {#other-origin}

[`error`](../reference/events#error)가 이미지가 다른 출처에서 왔다고 알립니다. 브라우저는 그런 이미지의 픽셀을 PaperPic이 읽지 못하게 합니다. 이미지를 직접 가져와서 `Blob`을 넘기세요. 방법은 [이미지 불러오기](./loading#fetch)에 있습니다.

## 이미지를 불러오지 못함 {#load-error}

뷰어에 이미지를 불러오지 못했다고 표시되고, `error`가 `phase: 'load'`와 함께 옵니다. URL이 존재하는지, 브라우저가 그 형식을 열 수 있는지 확인하세요. HEIC는 Safari에서만 열리고, SVG에는 `width`와 `height` 속성이 필요합니다. 형식 목록은 [이미지 불러오기](./loading#formats)에 있습니다.

## 적용 중에 페이지가 멈춤 {#worker}

worker가 시작되지 않아 편집이 메인 스레드에서 실행되고 있습니다. 동작은 하지만, 큰 사진에서는 페이지가 잠시 멈춥니다. 흔한 원인은 다음과 같습니다.

- `worker-src 'self'`가 없는 Content Security Policy, 또는 `default` policy 없이 Trusted Types를 요구하는 정책. 허용할 항목은 [성능과 지원 환경](./performance)에 있습니다.
- 페이지와 다른 출처의 CDN에서 패키지를 불러옴. 브라우저는 페이지의 출처에서만 worker를 시작합니다.

브라우저의 네트워크 패널에서 페이지가 worker 파일을 요청했는지 볼 수 있습니다. 파일 이름은 `worker`로 시작합니다.

## 큰 사진에서 적용이 실패함 {#too-large}

`error`에 `The browser could not read an image of …`이 나옵니다. 브라우저는 canvas 크기를 제한하며, iOS의 Safari가 가장 엄격합니다. [`maxOutputSize`](../reference/options#maxoutputsize)를 예를 들어 3000픽셀로 설정하세요. 문서는 충분히 읽힙니다.

## 휠이 페이지를 스크롤하지 않고 이미지를 확대함 {#wheel}

[`wheelZoom: false`](../reference/options#wheelzoom)를 설정하세요. 버튼, 키보드, 핀치로는 계속 확대할 수 있습니다.
