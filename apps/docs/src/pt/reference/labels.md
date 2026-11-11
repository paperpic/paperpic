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

Cinco rótulos são funções, porque o texto deles inclui um valor. Crie o objeto uma vez só, e não a cada renderização, para que o visualizador não o receba de novo toda vez.

| Chave                  | Inglês                                       | Uso                                                                                                             |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | O botão que mostra os controles deslizantes de brilho e contraste                                               |
| `adjustmentLevel`      | Brightness +30                               | Função do nome e do valor de -100 a 100, anunciada depois de mover um controle de Ajustar                       |
| `applied`              | Changes applied                              | Anunciado quando as alterações são aplicadas                                                                    |
| `apply`                | Apply                                        | O botão que aplica as alterações                                                                                |
| `applyError`           | The changes could not be applied             | Mostrado quando Aplicar falha                                                                                   |
| `brightness`           | Brightness                                   | O nome do controle deslizante de brilho                                                                         |
| `cancel`               | Cancel                                       | O botão que sai do modo de edição                                                                               |
| `cancelTool`           | Cancel this tool                             | O botão que fecha uma ferramenta e descarta a seleção dela                                                      |
| `confirm`              | Done                                         | O botão que fecha uma ferramenta e mantém a seleção dela                                                        |
| `contrast`             | Contrast                                     | O nome do controle deslizante de contraste                                                                      |
| `cornerBottomLeft`     | Bottom left corner                           | O nome de uma alça de canto                                                                                     |
| `cornerBottomRight`    | Bottom right corner                          | O nome de uma alça de canto                                                                                     |
| `cornerMoved`          | Top left corner: 120, 80                     | Função do canto e da posição dele em pixels da imagem, anunciada depois de mover um canto                       |
| `cornerSelected`       | Top left corner: tap where it goes           | Função do canto, mostrada e anunciada depois de pressionar uma alça de canto, até que um toque na imagem a mova |
| `cornerTopLeft`        | Top left corner                              | O nome de uma alça de canto                                                                                     |
| `cornerTopRight`       | Top right corner                             | O nome de uma alça de canto                                                                                     |
| `crop`                 | Crop                                         | O botão Recortar                                                                                                |
| `cropHint`             | Drag the corners                             | O que fazer em Recortar                                                                                         |
| `discard`              | Discard                                      | O botão que confirma a perda das alterações                                                                     |
| `discardQuestion`      | Discard your changes?                        | A pergunta antes de perder as alterações                                                                        |
| `download`             | Download                                     | O botão de download                                                                                             |
| `edit`                 | Edit                                         | O botão que começa a edição                                                                                     |
| `editBar`              | Editing controls                             | O nome da barra de edição, para leitores de tela                                                                |
| `editing`              | Editing                                      | Anunciado quando o modo de edição começa                                                                        |
| `fitHeight`            | Fit to height                                | O botão que ajusta a altura da imagem                                                                           |
| `fitWidth`             | Fit to width                                 | O botão que ajusta a largura da imagem                                                                          |
| `flip`                 | Flip                                         | O botão Espelhar                                                                                                |
| `keepEditing`          | Keep editing                                 | O botão que volta à edição em vez de perder as alterações                                                       |
| `loadError`            | The image could not be loaded                | Mostrado quando a imagem não carrega                                                                            |
| `loading`              | Loading image                                | Mostrado enquanto a imagem carrega                                                                              |
| `perspective`          | Straighten                                   | O botão Endireitar                                                                                              |
| `perspectiveHint`      | Drag each corner to a corner of the document | O que fazer em Endireitar                                                                                       |
| `processing`           | Applying changes                             | Mostrado enquanto Aplicar está em andamento                                                                     |
| `redo`                 | Redo                                         | O botão Refazer                                                                                                 |
| `rotateLeft`           | Rotate left                                  | O botão de girar da barra de edição, e um dos dois de um visualizador somente leitura                           |
| `rotateRight`          | Rotate right                                 | O outro botão de girar de um visualizador somente leitura                                                       |
| `threshold`            | Clean up                                     | O botão Limpar                                                                                                  |
| `thresholdLevel`       | Sensitivity 50%                              | Função da porcentagem, anunciada depois de mover o controle de sensibilidade                                    |
| `thresholdSensitivity` | Sensitivity                                  | O nome do controle deslizante de sensibilidade                                                                  |
| `toolbar`              | Image controls                               | O nome da barra de ferramentas, para leitores de tela                                                           |
| `undo`                 | Undo                                         | O botão Desfazer                                                                                                |
| `viewer`               | Image viewer                                 | O nome da área que mostra a imagem, para leitores de tela                                                       |
| `zoomIn`               | Zoom in                                      | O botão Ampliar                                                                                                 |
| `zoomLevel`            | Zoom 150%                                    | Função da porcentagem, anunciada depois de um zoom pela barra de ferramentas ou pelo teclado                    |
| `zoomOut`              | Zoom out                                     | O botão Reduzir                                                                                                 |
