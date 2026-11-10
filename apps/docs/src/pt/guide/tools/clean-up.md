---
title: Limpar
description: Como a ferramenta Limpar do PaperPic transforma a foto de um documento num preto e branco nítido sem sombras, e como a sensibilidade e a suavidade mudam o resultado, com uma demo ao vivo.
---

# Limpar

Texto em papel se lê melhor em preto e branco, mas uma foto tem sombras, luz irregular e papel acinzentado. Limpar compara cada pixel com o que está em volta para decidir se é tinta ou papel, então as sombras e a luz irregular somem e o texto fica nítido. O id dela na API é `threshold`.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['perspective', 'threshold']" />

Endireite o recibo primeiro e depois limpe-o.

## Como usar

1. Toque em Editar e depois em Limpar. A pré-visualização fica em preto e branco, e aparece um controle deslizante de Sensibilidade.
2. Arraste o controle. Mais sensibilidade escurece mais pixels, o que recupera texto fraco ou gasto. Menos sensibilidade deixa a página mais limpa, sem o que aparece do verso. Soltar o controle deixa uma alteração.
3. Toque em Limpar de novo para desligá-lo.

Limpar sempre vem depois das outras alterações. Recortar e Endireitar mostram a imagem sem ele, porque numa página limpa é difícil encontrar as bordas do papel.

## Suavidade

[`softness`](../../reference/options#softness) define quanto cinza Limpar mantém nas bordas das letras, de 0 a 1, com 0.25 como padrão. Um pouco de cinza suaviza as bordas e deixa letras pequenas mais fáceis de ler. Use `0` para um preto e branco estrito, que gera arquivos menores mas quebra traços finos.

## Formato do resultado

Uma imagem limpa sai em PNG, porque o JPEG adicionaria artefatos em volta das bordas nítidas dela. A opção [`output`](../../reference/options#output) pode escolher outro formato.

## Pelo código

[`setThreshold()`](../../reference/methods#setthreshold) liga ou desliga Limpar e define a sensibilidade, de 0 a 1, com 0.5 como padrão. [`getState()`](../../reference/methods#getstate) retorna os dois em `threshold`:

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```
