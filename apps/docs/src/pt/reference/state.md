---
title: Estado
description: O que getState() retorna e o evento change traz, como o status da imagem, o modo, o zoom, as alterações e se há algo para aplicar.
---

# Estado

O estado descreve o que o visualizador mostra num dado momento. [`getState()`](./methods#getstate) o retorna, e o evento [`change`](./events#change) o traz. Use-o para manter seus próprios controles em dia, como um botão Aplicar:

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Campo         | Tipo                                         | Descrição                                                                             |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `activeTool`  | `ToolId \| null`                             | A ferramenta aberta, `'crop'` ou `'perspective'`, ou `null`                           |
| `adjustments` | `{ brightness, contrast }`                   | O brilho e o contraste, cada um de -1 a 1. Limpar os deixa de fora                    |
| `busy`        | `boolean`                                    | Se o Aplicar está em andamento                                                        |
| `canApply`    | `boolean`                                    | Se há alterações para aplicar. Giros e espelhamentos que se anulam não contam         |
| `canRedo`     | `boolean`                                    | Se há uma alteração para trazer de volta                                              |
| `canUndo`     | `boolean`                                    | Se há uma alteração para desfazer                                                     |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | O ajuste em vigor, ou `null` assim que o usuário dá zoom manualmente                  |
| `image`       | `{ width, height } \| null`                  | O tamanho da imagem na tela em pixels, com as alterações feitas, ou `null` sem imagem |
| `mode`        | `'view' \| 'edit'`                           | Se o usuário está vendo ou editando a imagem                                          |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | Quanto a imagem na tela está girada, em graus no sentido horário                      |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Se há uma imagem, e se ela carregou                                                   |
| `threshold`   | `{ enabled, sensitivity }`                   | Se Limpar está ligado, e a sensibilidade de 0 a 1                                     |
| `zoom`        | `number`                                     | Pixels da tela por pixel da imagem                                                    |
