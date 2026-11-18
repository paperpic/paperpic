---
title: Limpar
description: Como a ferramenta Limpar do PaperPic passa a foto de um documento para cinza, ou para um preto e branco nítido sem sombras, e como a sensibilidade e a suavidade mudam o resultado, com uma demo ao vivo.
---

# Limpar

Limpar escolhe o acabamento da imagem: os tons originais, cinza, ou preto e branco. O id dela na API é `finish`.

Texto em papel se lê melhor em preto e branco, mas uma foto tem sombras, luz irregular e papel acinzentado. O preto e branco compara cada pixel com o que está em volta para decidir se é tinta ou papel, então as sombras e a luz irregular somem e o texto fica nítido. O cinza mantém todos os tons e só tira a cor, para documentos com fotos ou carimbos que o preto e branco perderia.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['perspective', 'finish']" />

Endireite o recibo primeiro e depois limpe-o.

## Como usar

1. Toque em Editar e depois em Limpar. O painel dela ocupa o lugar das ferramentas, com três acabamentos: Original, Cinza e Preto e branco. Ela abre em preto e branco, então a pré-visualização fica em preto e branco e a régua Sensibilidade funciona.
2. Arraste a régua. Mais sensibilidade escurece mais pixels, o que recupera texto fraco ou gasto. Menos sensibilidade dá uma página mais limpa, sem a impressão que aparece do verso.
3. Escolha Cinza para uma imagem em cinza, ou Original para os tons da foto. A régua só funciona em preto e branco.
4. Toque em Concluído para mantê-la como uma única alteração, ou em Cancelar esta ferramenta para deixar a imagem como estava.

Quando Limpar já é uma alteração, ela abre de novo com o seu acabamento. Para desligá-la, escolha Original: as alterações feitas depois ficam. Desfazer, ao contrário, também removeria essas alterações.

Limpar sempre vem depois das outras alterações. Recortar mostra a imagem com o seu acabamento, como vai ficar. Endireitar a mostra sem o preto e branco, porque as bordas do papel são difíceis de achar numa página limpa, e mantém o cinza.

[Ajustar](./adjust) funciona com o cinza, que vem depois, e fica desativado em preto e branco, que tem tons próprios.

## Suavidade

[`softness`](../../reference/options#softness) define quanto cinza o preto e branco mantém nas bordas das letras, de 0 a 1, com 0.25 como padrão. Um pouco de cinza suaviza as bordas e deixa o texto pequeno mais legível. Use `0` para um preto e branco estrito, que gera arquivos menores mas quebra traços finos.

## Formato do resultado

Uma imagem em preto e branco é PNG, porque o JPEG adicionaria artefatos em volta das bordas nítidas. Uma imagem em cinza mantém o formato da origem. A opção [`output`](../../reference/options#output) pode escolher outro formato.

## Pelo código

[`setFinish()`](../../reference/methods#setfinish) escolhe o acabamento, `'original'`, `'gray'` ou `'mono'` para preto e branco, e define a sensibilidade do preto e branco, de 0 a 1, com 0.5 como padrão. [`getState()`](../../reference/methods#getstate) devolve os dois em `finish`:

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

Enquanto Limpar está aberto, `setFinish()` muda o que o painel mostra, e [`confirmTool()`](../../reference/methods#confirmtool) o mantém como uma única alteração.
