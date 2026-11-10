---
title: O que é o PaperPic?
description: O PaperPic é um visualizador e editor de imagens de documentos para a web. As pessoas dão zoom em fotos de papel, endireitam, recortam e limpam essas fotos antes que o seu app as guarde.
---

# O que é o PaperPic?

Fotos de documentos chegam tortas, com sombras e cheias de fundo. O PaperPic as mostra num visualizador em que dá para dar zoom, e permite endireitar e limpar cada foto antes que o seu app a guarde, como faria um app de scanner.

## O que ele faz

- **Ver.** Dar zoom com os botões, a roda do mouse ou o gesto de pinça, mover a imagem e ajustar a imagem inteira, a largura ou a altura. Um visualizador somente leitura também pode girar a imagem.
- **Editar.** No modo de edição, o usuário pode recortar, endireitar uma foto tirada em ângulo, girar, espelhar, ajustar o brilho e o contraste, e limpar o documento em preto e branco. Cada alteração pode ser desfeita até o usuário aplicar as alterações.
- **Entregar.** Aplicar calcula o resultado na resolução completa e o entrega ao seu código como um `Blob`. Um botão de download também pode salvá-lo.

Cada passo só acontece quando o usuário pede. Nada muda a foto sozinho.

## O que ele não faz

- Não envia nada. O seu app decide o que fazer com o resultado.
- Não abre arquivos PDF, só imagens.
- Não encontra sozinho as bordas do documento: o usuário arrasta os cantos.

## Pacotes

| Pacote            | Use com                                         |
| ----------------- | ----------------------------------------------- |
| `@paperpic/core`  | JavaScript sem framework, ou qualquer framework |
| `@paperpic/vue`   | Vue 3.5 ou mais recente                         |
| `@paperpic/react` | React 19 ou mais recente                        |

Os três têm as mesmas opções, eventos e métodos, e o core não tem dependências em tempo de execução. A edição roda num Web Worker, então a página continua respondendo com fotos grandes.

## Experimente

No [playground](../playground) você pode editar um recibo de exemplo, ou uma foto sua que nunca sai do navegador. Para adicionar o PaperPic ao seu app, vá para [Primeiros passos](./getting-started).
