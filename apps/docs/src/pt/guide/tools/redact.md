---
title: Ocultar
description: Como a ferramenta Ocultar do PaperPic cobre parte de uma foto com preto ou branco sólidos, como um número de conta ou uma assinatura, para que o resultado deixe de contê-la.
---

# Ocultar

A foto de um documento pode mostrar mais do que deveria: um número de conta, uma assinatura, um rosto ao fundo. Ocultar cobre um retângulo, reto ou inclinado, com preto ou branco sólidos, e o resultado deixa de conter o que estava por baixo.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['redact']" />

## Como usar

1. Toque em Editar e depois em Ocultar. Uma faixa aparece no meio da imagem, com uma alça em cada canto.
2. Desenhe a área sobre o que quer ocultar: arraste de um dos seus cantos até o oposto, em qualquer parte da imagem, inclusive sobre a faixa. Depois arraste a área para movê-la, gire-a pela alça acima dela, para que acompanhe uma linha de texto inclinada, e arraste os seus cantos para mudar o tamanho. A área mostra a sua cor, ainda transparente, para que a possa pôr sobre as palavras certas.
3. Escolha Preto ou Branco no painel.
4. Toque em Concluído, ou `Enter`, para adicionar a área às alterações. Cancelar esta ferramenta, ou `Esc`, fecha Ocultar sem mudar nada.

Só é possível desenhar até posicionar a área. Assim que a desenha, move, gira ou muda o seu tamanho, arrastar no resto da imagem volta a movê-la, para que nada substitua a área por acidente. Antes disso, mova uma imagem ampliada com dois dedos, ou com as setas enquanto o foco está na imagem. Sem arrastar, a faixa é a área: mova-a com o teclado, ou toque nela e depois no destino.

Cada Concluído adiciona uma área, por isso abra Ocultar de novo para cobrir outra parte. Desfazer remove a última área, e a cor fica para a seguinte. As alças de canto funcionam como em [Recortar](./crop): arraste-as, toque numa e depois no destino, ou mova-as com o teclado. Na alça acima da área, as setas a giram 1 grau, ou 10 com Shift. Ao arrastá-la, ela se ajusta na horizontal.

## O que garante {#guarantees}

- As áreas são cobertas depois de todas as outras alterações, por isso Ajustar e Limpar nunca clareiam o seu preto ou branco.
- Uma área segue as alterações posteriores: uma rotação, um espelhamento ou um recorte movem-na com a imagem, e Endireitar deforma-a com a página.
- Cobre cada pixel que as suas bordas tocam, mesmo em parte, e é opaca também num PNG transparente.
- Aplicar escreve pixels sólidos no resultado, por isso o arquivo não guarda nada do que eles cobrem.

Até Aplicar, o visualizador guarda a imagem original, por isso Desfazer traz de volta o que uma área cobre. Partilhe o resultado de Aplicar, nunca a imagem original.

## Pelo código

Ocultar está na barra de edição por padrão, com o id `'redact'` em [`tools`](../../reference/options#tools). Com `toolbar: false`, abra-o com [`openTool()`](../../reference/methods#opentool), escolha a cor com [`setRedaction()`](../../reference/methods#setredaction) e feche-o com [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Mais tarde, a partir de um botão seu
pic.confirmTool()
```

O `redaction` do [estado](../../reference/state) guarda a cor em uso.
