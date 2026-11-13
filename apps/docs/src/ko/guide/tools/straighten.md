---
title: 기울기 보정
description: PaperPic의 ‘기울기 보정’ 도구로 비스듬히 찍은 문서 사진을 평평한 페이지로 만드는 방법, 비율 추정 방식, aspectRatio를 지정해야 할 때를 라이브 데모와 함께 설명합니다.
---

# 기울기 보정

비스듬히 찍은 문서는 사다리꼴로 보입니다. 먼 쪽 가장자리가 짧아지고 글자가 기울어집니다. ‘기울기 보정’은 스캔한 것처럼 평평한 직사각형 페이지로 되돌립니다. API에서의 id는 `perspective`입니다.

<Demo src="/samples/receipt.jpg" alt="영수증" :tools="['perspective']" />

## 사용 방법

1. ‘편집’을 누른 다음 ‘기울기 보정’을 누릅니다. 모서리마다 핸들이 나타납니다.
2. 각 핸들을 문서의 모서리로 끌어 옮깁니다. 패널의 확대/축소 버튼으로 확대하면 정확하게 놓을 수 있습니다.
3. ‘완료’ 또는 `Enter`를 누릅니다. 뷰어가 네 모서리에 맞춰 잘린 평평한 페이지를 보여 줍니다.

핸들은 [‘자르기’](./crop)와 같이 동작합니다. 터치스크린에서는 돋보기가 나오고, 끄는 대신 눌렀다가 탭할 수도 있으며, 키보드에서는 Tab과 화살표 키를 씁니다. 네 모서리는 항상 볼록한 모양을 유지하므로, 페이지를 언제든 평평하게 만들 수 있습니다.

‘기울기 보정’은 [‘정리’](./clean-up) 없이 사진을 보여 줍니다. 정리한 페이지에서는 종이 가장자리를 찾기 어렵기 때문입니다. ‘완료’를 누르면 정리가 다시 적용됩니다.

## 비율

사진만으로는 페이지의 실제 모양을 알 수 없으므로, ‘기울기 보정’은 사진 속 모서리 위치로 비율을 추정합니다. 보통 거리에서 찍은 사진에는 잘 맞지만, 정확할 수는 없습니다.

추정에는 원래 사진이 쓰입니다. 같은 편집에서 자르거나 회전한 뒤에도 마찬가지입니다. 사용자가 적용하면 그 결과가 새 사진으로 취급되므로, 기울기 보정은 적용하기 전에 하세요.

문서를 알고 있다면 [`aspectRatio`](../../reference/options#aspectratio)에 너비를 높이로 나눈 값을 지정하세요. 결과가 그 비율을 따릅니다.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| 문서                 | `aspectRatio`  |
| -------------------- | -------------- |
| A4 용지, 세로        | `210 / 297`    |
| US Letter 용지, 세로 | `8.5 / 11`     |
| 신분증 카드, 가로    | `85.6 / 53.98` |

가로 방향 용지라면 `297 / 210`처럼 숫자를 바꾸세요.

## 사진 밖으로 잘린 모서리

문서의 모서리가 사진 밖으로 나갈 때가 있습니다. 핸들은 이미지 안에 머무르므로, 그 핸들은 내용이 남는 쪽 문서 가장자리를 따라 사진 테두리에 놓으세요. 마지막 몇 줄이 조금 기울고 비율 추정도 나빠지지만, [`aspectRatio`](../../reference/options#aspectratio)로 바로잡을 수 있습니다.

[플레이그라운드](../../playground)에 모서리가 잘린 예시 영수증이 있어 직접 해 볼 수 있습니다.

## 코드에서 쓰기

‘기울기 보정’은 [`openTool('perspective')`](../../reference/methods#opentool)로 열고 [`confirmTool()`](../../reference/methods#confirmtool)이나 [`cancelTool()`](../../reference/methods#canceltool)로 닫습니다.

```ts
pic.edit()
pic.openTool('perspective')

// 나중에, 직접 만든 버튼에서
pic.confirmTool()
```
