---
title: Limpar
description: Como a ferramenta Limpar do PaperPic transforma a foto de um documento num preto e branco nítido sem sombras, e como a sensibilidade e a suavidade mudam o resultado, com uma demo ao vivo.
---

# Limpar

Texto em papel se lê melhor em preto e branco, mas uma foto tem sombras, luz irregular e papel acinzentado. Limpar compara cada pixel com o que está em volta para decidir se é tinta ou papel, então as sombras e a luz irregular somem e o texto fica nítido. O id dela na API é `threshold`.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['perspective', 'threshold']" />

Endireite o recibo primeiro e depois limpe-o.

## Como usar

1. Toque em Editar e depois em Limpar. O painel dele ocupa o lugar das ferramentas, a pré-visualização fica em preto e branco, e aparece uma régua de Sensibilidade.
2. Arraste a régua. Mais sensibilidade escurece mais pixels, o que recupera texto fraco ou gasto. Menos sensibilidade deixa a página mais limpa, sem o que aparece do verso.
3. Toque em Concluído para mantê-lo como uma única alteração, ou em Cancelar esta ferramenta para deixar a imagem como estava.

Para desligar um Limpar que já é uma alteração, abra-o de novo: um interruptor ao lado da régua o desliga, e as alterações que vieram depois continuam. Desfazer tiraria essas alterações primeiro.

Limpar sempre vem depois das outras alterações. Recortar mostra a imagem limpa, como ela vai ficar. Endireitar a mostra sem Limpar, porque numa página limpa é difícil encontrar as bordas do papel.

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

Enquanto Limpar está aberto, `setThreshold()` muda o que o painel dele mostra, e [`confirmTool()`](../../reference/methods#confirmtool) o mantém como uma única alteração.
