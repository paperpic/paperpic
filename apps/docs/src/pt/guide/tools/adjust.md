---
title: Ajustar
description: Como a ferramenta Ajustar do PaperPic muda o brilho e o contraste da imagem de um documento com dois controles deslizantes ao vivo, e como defini-los pelo código.
---

# Ajustar

Fotos tiradas com pouca luz saem escuras ou acinzentadas. Ajustar muda o brilho e o contraste e mantém as cores, para documentos que não devem virar preto e branco, como formulários coloridos ou fotos.

## Como usar

1. Toque em Editar e depois em Ajustar. Dois controles deslizantes aparecem na barra de edição: Brilho e Contraste.
2. Arraste um controle. A pré-visualização muda enquanto você arrasta, e soltar o controle deixa uma alteração, que Desfazer remove.
3. Toque em Ajustar de novo para esconder os controles.

O meio de cada controle deixa a imagem como está, e um controle que volta ao meio não conta como alteração. Os leitores de tela anunciam o valor de -100 a 100, como "Brilho +30".

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

Na opção [`tools`](../../reference/options#tools), Ajustar é `'adjust'`.
