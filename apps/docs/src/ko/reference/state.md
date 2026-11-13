---
title: 상태
description: getState()가 반환하고 change 이벤트가 전달하는 내용. 이미지 상태, 모드, 배율, 변경 사항, 적용할 것이 있는지 등입니다.
---

# 상태

상태는 어느 순간 뷰어가 보여 주는 내용을 나타냅니다. [`getState()`](./methods#getstate)가 반환하고, [`change`](./events#change) 이벤트가 전달합니다. 직접 만든 ‘적용’ 버튼처럼 자체 컨트롤을 최신으로 유지하는 데 씁니다.

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| 필드          | 타입                                         | 설명                                                                                             |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | 열린 도구(`'crop'`, `'adjust'` 등), 또는 `null`                                                  |
| `adjustments` | `{ brightness, contrast }`                   | 밝기와 대비(각각 -1부터 1까지). 정리 중에는 쓰이지 않습니다. 조정이 열려 있는 동안에는 보이는 값 |
| `busy`        | `boolean`                                    | 적용이 진행 중인지                                                                               |
| `canApply`    | `boolean`                                    | 적용할 변경이 있는지. 서로 상쇄되는 회전과 뒤집기는 변경으로 치지 않습니다                       |
| `canRedo`     | `boolean`                                    | 다시 실행할 변경이 있는지                                                                        |
| `canUndo`     | `boolean`                                    | 실행 취소할 변경이 있는지                                                                        |
| `fit`         | [`Fit \| null`](./types#fit)                 | 현재 맞추기 방식. 사용자가 직접 확대/축소하면 `null`                                             |
| `image`       | [`Size \| null`](./types#size)               | 지금까지의 변경을 반영한 화면 이미지의 픽셀 크기. 이미지가 없으면 `null`                         |
| `mode`        | `'view' \| 'edit'`                           | 사용자가 이미지를 보고 있는지, 편집하고 있는지                                                   |
| `rotation`    | [`Rotation`](./types#rotation)               | 화면 이미지가 시계 방향으로 회전한 각도                                                          |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | 이미지가 있는지, 불러왔는지                                                                      |
| `threshold`   | `{ enabled, sensitivity }`                   | 정리가 켜져 있는지와 0부터 1까지의 민감도. 정리가 열려 있는 동안에는 보이는 내용                 |
| `zoom`        | `number`                                     | 이미지 1픽셀당 화면 픽셀 수                                                                      |
