---
title: Endireitar
description: Como a ferramenta Endireitar do PaperPic transforma a foto de um documento tirada em ângulo numa página plana, como estima as proporções e quando usar aspectRatio, com uma demo ao vivo.
---

# Endireitar

Um documento fotografado em ângulo parece um trapézio: a borda mais distante fica mais curta e o texto se inclina. Endireitar o devolve a uma página plana e retangular, como se tivesse sido escaneada. O id dela na API é `perspective`.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['perspective']" />

## Como usar

1. Toque em Editar e depois em Endireitar. Aparece uma alça para cada canto.
2. Arraste cada alça até um canto do documento. Dê zoom com os botões do painel dele para posicioná-las com precisão.
3. Toque em Concluído, ou `Enter`. O visualizador mostra a página plana, recortada nos quatro cantos.

As alças funcionam como em [Recortar](./crop): uma lupa em telas sensíveis ao toque, pressionar e tocar em vez de arrastar, e Tab e as setas no teclado. Os quatro cantos sempre formam uma figura convexa, então a página sempre pode ficar plana.

Endireitar mostra a foto sem [Limpar](./clean-up), porque numa página limpa é difícil encontrar as bordas do papel. Limpar volta depois de Concluído.

## Proporções

Uma foto não diz a forma real da página, então Endireitar estima as proporções dela a partir de onde os cantos estão na foto. A estimativa funciona bem para fotos tiradas de uma distância normal, mas não pode ser exata.

A estimativa usa a foto original, mesmo depois de um recorte ou de um giro na mesma edição. Assim que o usuário aplica, o resultado passa a contar como a nova foto, então endireite antes de aplicar.

Quando você conhece o documento, defina em [`aspectRatio`](../../reference/options#aspectratio) a largura dele dividida pela altura, e o resultado assume essas proporções:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Documento                            | `aspectRatio`  |
| ------------------------------------ | -------------- |
| Folha A4, em retrato                 | `210 / 297`    |
| Folha US Letter, em retrato          | `8.5 / 11`     |
| Documento de identidade, em paisagem | `85.6 / 53.98` |

Para uma folha em paisagem, inverta os números, como `297 / 210`.

## Cantos cortados pela foto

Às vezes um canto do documento fica fora da foto. As alças ficam dentro da imagem, então coloque essa alça na borda da foto, ao longo do lado do documento que mantém o conteúdo. As últimas linhas se inclinam um pouco e as proporções estimadas pioram, o que [`aspectRatio`](../../reference/options#aspectratio) pode corrigir.

No [playground](../../playground) há um recibo de exemplo com um canto cortado para testar isso.

## Pelo código

Endireitar abre com [`openTool('perspective')`](../../reference/methods#opentool) e fecha com [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')

// Depois, a partir de um botão seu
pic.confirmTool()
```
