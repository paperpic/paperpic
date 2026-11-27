---
title: Endireitar
description: Como a ferramenta Endireitar do PaperPic transforma a foto de um documento tirada em ângulo numa página plana, como estima as proporções e quando usar aspectRatio, com uma demo ao vivo.
---

# Endireitar

Um documento fotografado em ângulo parece um trapézio: a borda mais distante fica mais curta e o texto se inclina. Endireitar o devolve a uma página plana e retangular, como se tivesse sido escaneada. O id dela na API é `perspective`.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :tools="['perspective']" />

## Como usar

1. Toque em Editar e depois em Endireitar. Aparece uma alça para cada canto, sobre o documento se o visualizador [o encontrar](#finding-the-document).
2. Arraste cada alça fora do lugar até o seu canto do documento. Dê zoom com os botões do painel dele para posicioná-las com precisão.
3. Se você conhece o papel, escolha o [tamanho](#paper-size) dele: A4, Carta ou Cartão. Auto o estima.
4. Toque em Concluído, ou `Enter`. O visualizador mostra a página plana, recortada nos quatro cantos. Concluído só fica ativo quando o visualizador encontra o documento ou quando você move um canto.

As alças funcionam como em [Recortar](./crop): uma lupa em telas sensíveis ao toque, pressionar e tocar em vez de arrastar, e Tab e as setas no teclado. Os quatro cantos sempre formam uma figura convexa, então a página sempre pode ficar plana.

Endireitar mostra a foto sem o preto e branco de [Limpar](./clean-up), porque numa página limpa é difícil achar as bordas do papel. O preto e branco volta ao tocar em Concluído, e o cinza fica.

## Encontrar o documento {#finding-the-document}

Quando Endireitar abre, o visualizador procura o documento na foto e posiciona os quatro cantos sobre ele, então você pode tocar em Concluído na hora. A busca acontece no navegador em uma fração de segundo, e não muda nada até você tocar em Concluído.

O visualizador só propõe aquilo de que tem certeza suficiente. Se o papel se confunde com a mesa, ou a foto não tem documento, os cantos começam dentro da imagem e esperam o usuário. Um canto que o usuário já tocou nunca se move sozinho.

## Tamanho do papel {#paper-size}

O painel de Endireitar oferece tamanhos de papel, que dão ao resultado as proporções exatas desse papel:

| Opção  | Proporções                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------- |
| Auto   | [`aspectRatio`](../../reference/options#aspectratio) ou, senão, uma [estimativa](#proportions) |
| A4     | 210 × 297 mm, as mesmas de A3 e A5                                                             |
| Carta  | 8,5 × 11 polegadas, Carta dos EUA                                                              |
| Cartão | 85,6 × 53,98 mm, um documento de identidade ou cartão bancário                                 |

Um tamanho define apenas as proporções: não move os cantos. O papel fica em retrato ou em paisagem conforme os cantos, então não há orientação para escolher. Um tamanho que não é o do documento o deforma, então Endireitar começa em Auto cada vez que abre.

Com os quatro cantos nos cantos da imagem, Auto não muda nada, e um tamanho dá à imagem inteira as proporções desse papel.

## Proporções {#proportions}

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

Para uma folha em paisagem, inverta os números, como `297 / 210`. As proporções valem para a página como ela aparece na tela, então, se a foto estiver de lado, gire-a com [Girar para a esquerda](./rotate-and-flip) antes de endireitá-la.

## Cantos cortados pela foto

Às vezes um canto do documento fica fora da foto. As alças ficam dentro da imagem, então coloque essa alça na borda da foto, ao longo do lado do documento que mantém o conteúdo. As últimas linhas se inclinam um pouco e as proporções estimadas pioram, o que [`aspectRatio`](../../reference/options#aspectratio) pode corrigir.

No [playground](../../playground) há um recibo de exemplo com um canto cortado para testar isso.

## Pelo código

Endireitar abre com [`openTool('perspective')`](../../reference/methods#opentool) e fecha com [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')
pic.setPaper({ size: 'a4' })

// Depois, a partir de um botão seu
pic.confirmTool()
```

Escolha o tamanho do papel com [`setPaper()`](../../reference/methods#setpaper) enquanto a ferramenta está aberta. `confirmTool()` espera que o visualizador encontre o documento ou que um canto se mova, e o `canConfirm` do [estado](../../reference/state) diz quando pode.
