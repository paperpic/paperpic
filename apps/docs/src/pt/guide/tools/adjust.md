---
title: Ajustar
description: Como a ferramenta Ajustar do PaperPic muda o brilho e o contraste da imagem de um documento com uma régua ao vivo, e como defini-los pelo código.
---

# Ajustar

Fotos tiradas com pouca luz saem escuras ou acinzentadas. Ajustar muda o brilho e o contraste e mantém as cores, para documentos que não devem virar preto e branco, como formulários coloridos ou fotos.

## Como usar

1. Toque em Editar e depois em Ajustar. O painel dele ocupa o lugar das ferramentas: uma régua, com Brilho e Contraste para escolher qual tom ela muda.
2. Arraste a régua. A pré-visualização muda enquanto você arrasta. Escolha Contraste para mudar o outro tom com a mesma régua.
3. Toque em Concluído para manter os dois tons como uma única alteração, que Desfazer remove. Cancelar esta ferramenta deixa a imagem como estava.

O meio da régua deixa a imagem como está, e a agulha se prende ali, então voltar a nenhuma alteração é fácil. Os leitores de tela anunciam o valor de -100 a 100, como "Brilho +30". Um ponto em Ajustar, e em cada tom dentro do painel dele, marca um valor diferente de 0.

Ajustar vem depois das outras alterações, então Recortar e Endireitar mostram a imagem com ele.

## Ajustar ou Limpar?

| Ajustar                                      | [Limpar](./clean-up)                     |
| -------------------------------------------- | ---------------------------------------- |
| Mantém as cores e os cinzas                  | Transforma o documento em preto e branco |
| Para formulários coloridos, carimbos e fotos | Para texto em papel                      |
| Mantém o formato da imagem original          | Gera PNG                                 |

Enquanto Limpar está ligado, Ajustar fica desativado, porque um documento limpo tem tons próprios.

## Pelo código

[`setAdjustments()`](../../reference/methods#setadjustments) aceita valores de -1 a 1, em que 0 não muda nada, e [`getState()`](../../reference/methods#getstate) os retorna em `adjustments`:

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

Enquanto Ajustar está aberto, `setAdjustments()` muda o que o painel dele mostra, e [`confirmTool()`](../../reference/methods#confirmtool) o mantém como uma única alteração.

Na opção [`tools`](../../reference/options#tools), Ajustar é `'adjust'`.
