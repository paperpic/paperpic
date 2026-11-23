---
title: Rótulos
description: Todos os textos da interface do PaperPic, com a chave e o valor padrão em inglês, para traduzir o componente ou mudar as palavras dele.
---

# Rótulos

Rótulos são os textos que o componente mostra e os que anuncia aos leitores de tela. Por padrão, estão em inglês. Passe os que quiser mudar para a opção [`labels`](./options#labels), e os outros mantêm o texto em inglês.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: 'Aplicar',
    cancel: 'Cancelar',
    zoomLevel: percent => `Zoom ${percent}%`,
  },
})
```

Cinco rótulos são funções, porque o texto deles inclui um valor. Uma função é nova cada vez que é criada, e o visualizador a toma como uma mudança, então crie uma vez só os rótulos que contêm funções, e não a cada renderização.

| Chave               | Inglês                                                           | Uso                                                                                                             |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | O botão que abre a régua de brilho e contraste                                                                  |
| `adjustmentLevel`   | Brightness +30                                                   | Função do nome e do valor de -100 a 100, anunciada depois de mover a régua de Ajustar                           |
| `adjustUnavailable` | Not available in black and white                                 | A descrição de Ajustar em preto e branco, que o deixa desativado                                                |
| `applied`           | Changes applied                                                  | Anunciado quando as alterações são aplicadas                                                                    |
| `apply`             | Apply                                                            | O botão que aplica as alterações                                                                                |
| `applyError`        | The changes could not be applied                                 | Mostrado quando Aplicar falha                                                                                   |
| `brightness`        | Brightness                                                       | A escolha do brilho em Ajustar, e o nome da régua dele                                                          |
| `cancel`            | Cancel                                                           | O botão que sai do modo de edição                                                                               |
| `cancelTool`        | Cancel this tool                                                 | O botão que fecha uma ferramenta e descarta as alterações dela                                                  |
| `confirm`           | Done                                                             | O botão que fecha uma ferramenta e mantém as alterações dela                                                    |
| `contrast`          | Contrast                                                         | A escolha do contraste em Ajustar, e o nome da régua dele                                                       |
| `cornerBottomLeft`  | Bottom left corner                                               | O nome de uma alça de canto                                                                                     |
| `cornerBottomRight` | Bottom right corner                                              | O nome de uma alça de canto                                                                                     |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | A descrição de uma alça de canto: o que as teclas fazem e que Enter conclui                                     |
| `cornerMoved`       | Top left corner: 120, 80                                         | Função do canto e da posição dele em pixels da imagem, anunciada depois de mover um canto                       |
| `cornerSelected`    | Top left corner: tap where it goes                               | Função do canto, mostrada e anunciada depois de pressionar uma alça de canto, até que um toque na imagem a mova |
| `cornerTopLeft`     | Top left corner                                                  | O nome de uma alça de canto                                                                                     |
| `cornerTopRight`    | Top right corner                                                 | O nome de uma alça de canto                                                                                     |
| `crop`              | Crop                                                             | O botão Recortar                                                                                                |
| `cropHint`          | Drag the corners                                                 | O que fazer em Recortar                                                                                         |
| `discard`           | Discard                                                          | O botão que confirma a perda das alterações                                                                     |
| `discardQuestion`   | Discard your changes?                                            | A pergunta antes de perder as alterações                                                                        |
| `download`          | Download                                                         | O botão de download                                                                                             |
| `edit`              | Edit                                                             | O botão que começa a edição                                                                                     |
| `editBar`           | Editing controls                                                 | O nome da barra de edição, para leitores de tela                                                                |
| `editing`           | Editing                                                          | Anunciado quando o modo de edição começa                                                                        |
| `finish`            | Clean up                                                         | O botão Limpar, e o nome da sua escolha de acabamento                                                           |
| `finishGray`        | Gray                                                             | Escolhe cinza em Limpar                                                                                         |
| `finishLevel`       | Sensitivity 50%                                                  | Função da porcentagem, anunciada depois de mover a régua de Limpar                                              |
| `finishMono`        | Black and white                                                  | Escolhe preto e branco em Limpar                                                                                |
| `finishOriginal`    | Original                                                         | Escolhe os tons originais em Limpar, o que o desliga                                                            |
| `finishSensitivity` | Sensitivity                                                      | O nome da régua de Limpar                                                                                       |
| `fitHeight`         | Fit to height                                                    | O botão que encaixa a imagem na altura                                                                          |
| `fitWidth`          | Fit to width                                                     | O botão que encaixa a imagem na largura                                                                         |
| `flip`              | Flip                                                             | O botão Espelhar                                                                                                |
| `inUse`             | In use                                                           | A descrição de Ajustar ou de Limpar enquanto o valor dele está em uso, que um ponto mostra                      |
| `keepEditing`       | Keep editing                                                     | O botão que volta à edição em vez de perder as alterações                                                       |
| `loadError`         | The image could not be loaded                                    | Mostrado quando a imagem não carrega                                                                            |
| `loading`           | Loading image                                                    | Mostrado enquanto a imagem carrega                                                                              |
| `paper`             | Paper size                                                       | O nome da escolha do tamanho do papel, em Endireitar                                                            |
| `paperA4`           | A4                                                               | Escolhe A4 em Endireitar                                                                                        |
| `paperAuto`         | Auto                                                             | Escolhe as proporções automáticas em Endireitar                                                                 |
| `paperCard`         | Card                                                             | Escolhe o tamanho de um documento de identidade ou cartão bancário em Endireitar                                |
| `paperLetter`       | Letter                                                           | Escolhe Carta (EUA) em Endireitar                                                                               |
| `perspective`       | Straighten                                                       | O botão Endireitar                                                                                              |
| `perspectiveFound`  | Document found. Check its corners                                | Mostrado e anunciado quando Endireitar encontra o documento                                                     |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | O que fazer em Endireitar                                                                                       |
| `previewError`      | The changes could not be shown                                   | Mostrado quando uma alteração não pode ser mostrada                                                             |
| `processing`        | Applying changes                                                 | Mostrado enquanto Aplicar está em andamento                                                                     |
| `redact`            | Redact                                                           | O botão Ocultar, e o nome da sua escolha de cor                                                                 |
| `redactAngle`       | Angle 12°                                                        | Função do ângulo em graus, anunciada depois de girar a área de Ocultar                                          |
| `redactArea`        | Area                                                             | A área de Ocultar, que a move inteira                                                                           |
| `redactBlack`       | Black                                                            | Escolhe preto em Ocultar                                                                                        |
| `redactHint`        | Drag the area over what to hide                                  | O que fazer em Ocultar                                                                                          |
| `redactTurn`        | Turn                                                             | A alça que gira a área de Ocultar                                                                               |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | A descrição da alça que gira a área: o que as teclas fazem, e que Enter conclui                                 |
| `redactWhite`       | White                                                            | Escolhe branco em Ocultar                                                                                       |
| `redo`              | Redo                                                             | O botão Refazer                                                                                                 |
| `rotateLeft`        | Rotate left                                                      | O botão de girar da barra de edição, e um dos dois de um visualizador somente leitura                           |
| `rotateRight`       | Rotate right                                                     | O outro botão de girar de um visualizador somente leitura                                                       |
| `toolbar`           | Image controls                                                   | O nome da barra de ferramentas, para leitores de tela                                                           |
| `undo`              | Undo                                                             | O botão Desfazer                                                                                                |
| `viewer`            | Image viewer                                                     | O nome da área que mostra a imagem, para leitores de tela                                                       |
| `zoomIn`            | Zoom in                                                          | O botão Ampliar, na barra de ferramentas e nos painéis de Recortar e Endireitar                                 |
| `zoomLevel`         | Zoom 150%                                                        | Função da porcentagem, anunciada depois de um zoom pela barra de ferramentas ou pelo teclado                    |
| `zoomOut`           | Zoom out                                                         | O botão Reduzir, na barra de ferramentas e nos painéis de Recortar e Endireitar                                 |
