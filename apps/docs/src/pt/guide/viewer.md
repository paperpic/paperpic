---
title: Visualizador
description: Como dar zoom, mover e encaixar a imagem de um documento no PaperPic, o que a barra de ferramentas oferece e como mostrar uma imagem somente leitura, com uma demo ao vivo.
---

# Visualizador

Letras miúdas e recibos longos são difíceis de ler de relance numa tela. O visualizador encaixa a imagem ao carregá-la e permite dar zoom em qualquer parte.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :editable="false" />

## Zoom e movimento

| Ação                                     | Mouse e trackpad           | Toque       | Teclado   |
| ---------------------------------------- | -------------------------- | ----------- | --------- |
| Dar zoom                                 | Roda, ou pinça no trackpad | Pinça       | `+` e `-` |
| Mover                                    | Arrastar                   | Arrastar    | Setas     |
| Alternar entre a imagem encaixada e 100% | Clique duplo               | Toque duplo |           |
| Encaixar a imagem inteira                |                            |             | `0`       |

As teclas funcionam enquanto o foco está dentro do visualizador. Num botão, as setas passam de um botão a outro, e enquanto não há nada para mover, rolam a página. A pinça dá zoom em torno do ponto entre os dedos. Numa tela sensível ao toque, um dedo rola a página enquanto a imagem está encaixada, e move a imagem quando ela tem zoom.

O zoom vai do que encaixa a imagem inteira, ou 100% para uma imagem pequena, até 800%. Uma imagem que cabe fica centralizada, e uma que passa do limite se move até as bordas.

Ao carregar, a imagem se encaixa inteira no visualizador, e continua encaixada quando o visualizador muda de tamanho, até o usuário dar zoom manualmente.

Numa página longa, a roda daria zoom na imagem em vez de rolar a página. Use ali `wheelZoom: false`: os botões, o teclado e a pinça numa tela sensível ao toque continuam dando zoom. A pinça num trackpad deixa de dar zoom na imagem, porque o navegador a trata como a roda.

## A barra de ferramentas

A barra de ferramentas fica à direita do visualizador, e rola quando o visualizador é baixo demais para os botões dela. Ela se esconde durante a edição, então nunca cobre um canto de Recortar ou de Endireitar.

| Botão                                       | O que faz                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Editar                                      | Abre o [modo de edição](./editing). Aparece quando a imagem está pronta, e nunca com `editable: false` |
| Ampliar, Reduzir                            | Dão zoom um passo de 25%, em torno do centro                                                           |
| Ajustar à largura, Ajustar à altura         | Encaixam a imagem na largura, bom para documentos longos, ou na altura                                 |
| Girar para a esquerda, Girar para a direita | Só num visualizador somente leitura: giram a imagem na tela                                            |
| Baixar                                      | Só com `download: true`: salva a imagem na tela                                                        |

Ajustar à largura e Ajustar à altura ficam pressionados enquanto o encaixe deles vale. Nenhum botão volta a encaixar a imagem inteira: pressione `0`, ou reduza o zoom até o fim.

Com `toolbar: false`, a barra de ferramentas e a barra de edição ficam ocultas, e você pode criar seus próprios controles com os [métodos](../reference/methods).

## Visualizador somente leitura {#read-only}

Com `editable: false`, o botão Editar some, e a barra de ferramentas ganha dois botões que giram a imagem. Esse giro muda só a exibição, e nada é salvo: Baixar salva a imagem sem ele. Use para documentos que devem ser lidos mas não alterados, como os anexos de um registro.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'Um recibo',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Um recibo" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Um recibo" editable={false} />
```

:::

## Controlar a visualização pelo código

Os métodos [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) e [`fit()`](../reference/methods#fit) fazem o mesmo que os botões, e [`getState()`](../reference/methods#getstate) informa o zoom e o encaixe em vigor:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
