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

레이블 5개는 텍스트에 값이 들어가므로 함수입니다. 함수는 만들 때마다 새것이 되고 뷰어는 새 함수를 변경으로 받아들이므로, 함수가 든 레이블은 렌더링할 때마다가 아니라 한 번만 만드세요.

| 키                  | 영어                                                             | 용도                                                                            |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | 밝기와 대비 눈금자를 여는 버튼                                                  |
| `adjustmentLevel`   | Brightness +30                                                   | 이름과 -100부터 100까지 값의 함수. ‘조정’ 눈금자를 움직인 뒤 읽어 줌            |
| `adjustUnavailable` | Not available in black and white                                 | 흑백일 때의 ‘조정’ 설명. 그동안 ‘조정’은 쓸 수 없음                             |
| `applied`           | Changes applied                                                  | 변경이 적용되면 읽어 줌                                                         |
| `apply`             | Apply                                                            | 변경을 적용하는 버튼                                                            |
| `applyError`        | The changes could not be applied                                 | 적용에 실패하면 표시                                                            |
| `brightness`        | Brightness                                                       | ‘조정’에서 밝기를 고르는 버튼과 그 눈금자의 이름                                |
| `cancel`            | Cancel                                                           | 편집 모드를 끝내는 버튼                                                         |
| `cancelTool`        | Cancel this tool                                                 | 도구를 닫고 변경을 버리는 버튼                                                  |
| `confirm`           | Done                                                             | 도구를 닫고 변경을 유지하는 버튼                                                |
| `contrast`          | Contrast                                                         | ‘조정’에서 대비를 고르는 버튼과 그 눈금자의 이름                                |
| `cornerBottomLeft`  | Bottom left corner                                               | 모서리 핸들의 이름                                                              |
| `cornerBottomRight` | Bottom right corner                                              | 모서리 핸들의 이름                                                              |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | 모서리 핸들의 설명. 키의 동작과 Enter로 마친다는 것                             |
| `cornerMoved`       | Top left corner: 120, 80                                         | 모서리와 이미지 픽셀 단위 위치의 함수. 모서리를 옮긴 뒤 읽어 줌                 |
| `cornerSelected`    | Top left corner: tap where it goes                               | 모서리의 함수. 모서리 핸들을 누른 뒤 이미지를 탭해 옮길 때까지 표시하고 읽어 줌 |
| `cornerTopLeft`     | Top left corner                                                  | 모서리 핸들의 이름                                                              |
| `cornerTopRight`    | Top right corner                                                 | 모서리 핸들의 이름                                                              |
| `crop`              | Crop                                                             | ‘자르기’ 버튼                                                                   |
| `cropHint`          | Drag the corners                                                 | ‘자르기’에서 할 일                                                              |
| `discard`           | Discard                                                          | 변경을 잃는 것을 확정하는 버튼                                                  |
| `discardQuestion`   | Discard your changes?                                            | 변경을 잃기 전의 질문                                                           |
| `download`          | Download                                                         | 다운로드 버튼                                                                   |
| `edit`              | Edit                                                             | 편집을 시작하는 버튼                                                            |
| `editBar`           | Editing controls                                                 | 스크린 리더용 편집 바 이름                                                      |
| `editing`           | Editing                                                          | 편집 모드가 시작되면 읽어 줌                                                    |
| `finish`            | Clean up                                                         | ‘정리’ 버튼과, 마무리 선택의 이름                                               |
| `finishGray`        | Gray                                                             | ‘정리’에서 회색을 고름                                                          |
| `finishLevel`       | Sensitivity 50%                                                  | 백분율의 함수. ‘정리’ 눈금자를 움직인 뒤 읽어 줌                                |
| `finishMono`        | Black and white                                                  | ‘정리’에서 흑백을 고름                                                          |
| `finishOriginal`    | Original                                                         | ‘정리’에서 원래 색조를 골라 이를 끔                                             |
| `finishSensitivity` | Sensitivity                                                      | ‘정리’ 눈금자의 이름                                                            |
| `fitHeight`         | Fit to height                                                    | 이미지 높이를 맞추는 버튼                                                       |
| `fitWidth`          | Fit to width                                                     | 이미지 너비를 맞추는 버튼                                                       |
| `flip`              | Flip                                                             | ‘뒤집기’ 버튼                                                                   |
| `inUse`             | In use                                                           | ‘조정’ 또는 ‘정리’의 설정이 적용되는 동안의 설명. 점으로 표시됨                 |
| `keepEditing`       | Keep editing                                                     | 변경을 잃지 않고 편집으로 돌아가는 버튼                                         |
| `loadError`         | The image could not be loaded                                    | 이미지를 불러오지 못하면 표시                                                   |
| `loading`           | Loading image                                                    | 이미지를 불러오는 동안 표시                                                     |
| `paper`             | Paper size                                                       | ‘기울기 보정’의 용지 크기 선택의 이름                                           |
| `paperA4`           | A4                                                               | ‘기울기 보정’에서 A4를 고릅니다                                                 |
| `paperAuto`         | Auto                                                             | ‘기울기 보정’에서 자동 비율을 고릅니다                                          |
| `paperCard`         | Card                                                             | ‘기울기 보정’에서 신분증이나 은행 카드 크기를 고릅니다                          |
| `paperLetter`       | Letter                                                           | ‘기울기 보정’에서 US 레터를 고릅니다                                            |
| `perspective`       | Straighten                                                       | ‘기울기 보정’ 버튼                                                              |
| `perspectiveFound`  | Document found. Check its corners                                | ‘기울기 보정’이 문서를 찾았을 때 표시되고 읽힘                                  |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | ‘기울기 보정’에서 할 일                                                         |
| `previewError`      | The changes could not be shown                                   | 변경을 표시할 수 없으면 표시                                                    |
| `processing`        | Applying changes                                                 | 적용이 진행되는 동안 표시                                                       |
| `redact`            | Redact                                                           | ‘가리기’ 버튼과, 색 선택의 이름                                                 |
| `redactAngle`       | Angle 12°                                                        | 각도(도)의 함수로, ‘가리기’ 영역을 회전한 뒤 읽어 줍니다                        |
| `redactArea`        | Area                                                             | ‘가리기’ 영역으로, 전체를 옮깁니다                                              |
| `redactBlack`       | Black                                                            | ‘가리기’에서 검정을 고릅니다                                                    |
| `redactHint`        | Drag the area over what to hide                                  | ‘가리기’에서 할 일                                                              |
| `redactTurn`        | Turn                                                             | ‘가리기’ 영역을 회전하는 핸들                                                   |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | 영역을 회전하는 핸들의 설명으로, 키가 하는 일과 Enter로 마친다는 것             |
| `redactWhite`       | White                                                            | ‘가리기’에서 흰색을 고릅니다                                                    |
| `redo`              | Redo                                                             | ‘다시 실행’ 버튼                                                                |
| `rotateLeft`        | Rotate left                                                      | 편집 바의 회전 버튼, 그리고 읽기 전용 뷰어의 회전 버튼 두 개 중 하나            |
| `rotateRight`       | Rotate right                                                     | 읽기 전용 뷰어의 다른 회전 버튼                                                 |
| `toolbar`           | Image controls                                                   | 스크린 리더용 도구 모음 이름                                                    |
| `undo`              | Undo                                                             | ‘실행 취소’ 버튼                                                                |
| `viewer`            | Image viewer                                                     | 스크린 리더용, 이미지를 보여 주는 영역의 이름                                   |
| `zoomIn`            | Zoom in                                                          | ‘확대’ 버튼. 도구 모음과 ‘자르기’, ‘기울기 보정’ 패널에 있음                    |
| `zoomLevel`         | Zoom 150%                                                        | 백분율의 함수. 도구 모음이나 키보드로 확대/축소한 뒤 읽어 줌                    |
| `zoomOut`           | Zoom out                                                         | ‘축소’ 버튼. 도구 모음과 ‘자르기’, ‘기울기 보정’ 패널에 있음                    |
