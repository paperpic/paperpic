---
title: Recortar
description: Como a ferramenta Recortar do PaperPic mantém a parte da foto que contém o documento, com alças de canto, uma lupa em telas sensíveis ao toque e o teclado.
---

# Recortar

A foto de um documento costuma mostrar a mesa, uma mão ou outros papéis em volta. Recortar mantém o retângulo que contém o documento e descarta o resto.

## Como usar

1. Toque em Editar e depois em Recortar. Um retângulo aparece dentro da imagem, com uma alça em cada canto.
2. Arraste os cantos até o retângulo enquadrar o documento. O painel de Recortar tem botões de zoom, então você pode ampliar para posicioná-los com precisão.
3. Toque em Concluído, ou `Enter`, para adicionar o recorte às alterações. Cancelar esta ferramenta, ou `Esc`, fecha Recortar sem mudar nada.

Enquanto Recortar está aberto, a imagem aparece como o resultado vai ficar, com Ajustar e Limpar incluídos. O recorte é uma alteração como qualquer outra: Desfazer a remove, e Aplicar a torna permanente.

## Alças de canto

- As alças ficam dentro da imagem, e o retângulo nunca se inverte.
- Numa tela sensível ao toque, uma lupa mostra a área sob o dedo enquanto ele arrasta um canto, para que o dedo não esconda onde o canto vai parar.
- Sem arrastar, pressione uma alça e depois toque onde o canto dela vai. Até lá a alça fica destacada, os botões de zoom ampliam em direção ao canto dela, e `Esc` a solta.
- Pelo teclado, Tab passa de uma alça para outra, e as setas movem a alça com foco 1 pixel da tela, ou 10 com Shift. `+` e `-` dão zoom em direção à alça com foco. Os leitores de tela anunciam cada movimento.

## Recortar ou Endireitar?

Recortar mantém um retângulo como ele é. Numa foto tirada em ângulo, o documento parece um trapézio, e nenhum retângulo se encaixa. Para esses casos, use [Endireitar](./straighten): ele move cada canto separadamente e deixa a página plana.

## Pelo código

Recortar está na barra de edição por padrão, com o id `'crop'` em [`tools`](../../reference/options#tools). Com `toolbar: false`, abra-o com [`openTool()`](../../reference/methods#opentool) e feche-o com [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('crop')

// Depois, a partir de um botão seu
pic.confirmTool()
```
