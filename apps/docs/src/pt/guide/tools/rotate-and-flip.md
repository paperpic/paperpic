---
title: Girar e espelhar
description: Como girar e espelhar a imagem de um documento no PaperPic, no modo de edição, num visualizador somente leitura e pelo código.
---

# Girar e espelhar

Celulares costumam salvar a foto de um documento de lado ou de cabeça para baixo, e alguns escaneamentos saem espelhados. Girar para a esquerda e Espelhar corrigem a orientação e deixam o resto da imagem como está.

## Girar

Na barra de edição, Girar para a esquerda gira a imagem um quarto de volta no sentido anti-horário, como nas galerias de fotos. Toque duas vezes para meia volta, ou três vezes para um quarto de volta no sentido horário.

Um giro é uma alteração: Desfazer o remove, e Aplicar o torna permanente. Quatro giros trazem a imagem de volta para onde estava, e então não há nada a aplicar.

Pelo código, [`rotate()`](../../reference/methods#rotate) gira no sentido horário com `1`, e no anti-horário com `-1`:

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Espelhar

Espelhar inverte a imagem da esquerda para a direita como ela aparece, então depois de um quarto de volta ela ainda é espelhada da esquerda para a direita na tela. Para virar uma imagem de cabeça para baixo, espelhe-a e gire-a duas vezes.

Espelhamentos e giros que se anulam não deixam nada a aplicar. Pelo código, chame [`flip()`](../../reference/methods#flip).

## Num visualizador somente leitura

Com [`editable: false`](../viewer#read-only), a barra de ferramentas tem os botões Girar para a esquerda e Girar para a direita. Eles só giram a imagem na tela: nada é salvo, e o evento `apply` nunca é emitido. [`rotate()`](../../reference/methods#rotate) faz o mesmo pelo código. Um visualizador somente leitura não tem Espelhar.

## Ids

Na opção [`tools`](../../reference/options#tools), Girar para a esquerda é `'rotate'` e Espelhar é `'flip'`.
