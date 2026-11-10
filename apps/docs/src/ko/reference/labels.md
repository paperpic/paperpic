---
title: 레이블
description: PaperPic 인터페이스의 모든 텍스트와 키, 영어 기본값. 컴포넌트를 번역하거나 표현을 바꿀 때 씁니다.
---

# 레이블

레이블은 컴포넌트가 표시하는 텍스트와 스크린 리더에 읽어 주는 텍스트입니다. 기본값은 영어입니다. 바꾸고 싶은 것만 [`labels`](./options#labels) 옵션에 전달하면 나머지는 영어로 남습니다.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: '적용',
    cancel: '취소',
    zoomLevel: percent => `확대/축소 ${percent}%`,
  },
})
```

레이블 4개는 텍스트에 값이 들어가므로 함수입니다. 객체는 렌더링할 때마다가 아니라 한 번만 만드세요. 그래야 뷰어가 매번 다시 받지 않습니다.

| 키                     | 영어                                         | 용도                                                                   |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | 밝기와 대비 슬라이더를 보여 주는 버튼                                  |
| `adjustmentLevel`      | Brightness +30                               | 이름과 -100부터 100까지 값의 함수. ‘조정’ 슬라이더를 움직인 뒤 읽어 줌 |
| `applied`              | Changes applied                              | 변경이 적용되면 읽어 줌                                                |
| `apply`                | Apply                                        | 변경을 적용하는 버튼                                                   |
| `applyError`           | The changes could not be applied             | 적용에 실패하면 표시                                                   |
| `brightness`           | Brightness                                   | 밝기 슬라이더의 이름                                                   |
| `cancel`               | Cancel                                       | 편집 모드를 끝내는 버튼                                                |
| `cancelTool`           | Cancel this tool                             | 도구를 닫고 선택 영역을 버리는 버튼                                    |
| `confirm`              | Done                                         | 도구를 닫고 선택 영역을 유지하는 버튼                                  |
| `contrast`             | Contrast                                     | 대비 슬라이더의 이름                                                   |
| `cornerBottomLeft`     | Bottom left corner                           | 모서리 핸들의 이름                                                     |
| `cornerBottomRight`    | Bottom right corner                          | 모서리 핸들의 이름                                                     |
| `cornerMoved`          | Top left corner: 120, 80                     | 모서리와 이미지 픽셀 단위 위치의 함수. 모서리를 옮긴 뒤 읽어 줌        |
| `cornerTopLeft`        | Top left corner                              | 모서리 핸들의 이름                                                     |
| `cornerTopRight`       | Top right corner                             | 모서리 핸들의 이름                                                     |
| `crop`                 | Crop                                         | ‘자르기’ 버튼                                                          |
| `cropHint`             | Drag the corners                             | ‘자르기’에서 할 일                                                     |
| `discard`              | Discard                                      | 변경을 잃는 것을 확정하는 버튼                                         |
| `discardQuestion`      | Discard your changes?                        | 변경을 잃기 전의 질문                                                  |
| `download`             | Download                                     | 다운로드 버튼                                                          |
| `edit`                 | Edit                                         | 편집을 시작하는 버튼                                                   |
| `editBar`              | Editing controls                             | 스크린 리더용 편집 바 이름                                             |
| `editing`              | Editing                                      | 편집 모드가 시작되면 읽어 줌                                           |
| `fitHeight`            | Fit to height                                | 이미지 높이를 맞추는 버튼                                              |
| `fitWidth`             | Fit to width                                 | 이미지 너비를 맞추는 버튼                                              |
| `flip`                 | Flip                                         | ‘뒤집기’ 버튼                                                          |
| `keepEditing`          | Keep editing                                 | 변경을 잃지 않고 편집으로 돌아가는 버튼                                |
| `loadError`            | The image could not be loaded                | 이미지를 불러오지 못하면 표시                                          |
| `loading`              | Loading image                                | 이미지를 불러오는 동안 표시                                            |
| `perspective`          | Straighten                                   | ‘기울기 보정’ 버튼                                                     |
| `perspectiveHint`      | Drag each corner to a corner of the document | ‘기울기 보정’에서 할 일                                                |
| `processing`           | Applying changes                             | 적용이 진행되는 동안 표시                                              |
| `redo`                 | Redo                                         | ‘다시 실행’ 버튼                                                       |
| `rotateLeft`           | Rotate left                                  | 편집 바의 회전 버튼, 그리고 읽기 전용 뷰어의 회전 버튼 두 개 중 하나   |
| `rotateRight`          | Rotate right                                 | 읽기 전용 뷰어의 다른 회전 버튼                                        |
| `threshold`            | Clean up                                     | ‘정리’ 버튼                                                            |
| `thresholdLevel`       | Sensitivity 50%                              | 백분율의 함수. 민감도 슬라이더를 움직인 뒤 읽어 줌                     |
| `thresholdSensitivity` | Sensitivity                                  | 민감도 슬라이더의 이름                                                 |
| `toolbar`              | Image controls                               | 스크린 리더용 도구 모음 이름                                           |
| `undo`                 | Undo                                         | ‘실행 취소’ 버튼                                                       |
| `viewer`               | Image viewer                                 | 스크린 리더용, 이미지를 보여 주는 영역의 이름                          |
| `zoomIn`               | Zoom in                                      | ‘확대’ 버튼                                                            |
| `zoomLevel`            | Zoom 150%                                    | 백분율의 함수. 도구 모음이나 키보드로 확대/축소한 뒤 읽어 줌           |
| `zoomOut`              | Zoom out                                     | ‘축소’ 버튼                                                            |
