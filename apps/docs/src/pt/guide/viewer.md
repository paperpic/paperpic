---
title: Visualizador
description: Como dar zoom, mover e ajustar a imagem de um documento no PaperPic, o que a barra de ferramentas oferece e como mostrar uma imagem somente leitura, com uma demo ao vivo.
---

# Visualizador

Letras miúdas e recibos longos são difíceis de ler de relance numa tela. O visualizador ajusta a imagem ao carregá-la e permite dar zoom em qualquer parte.

<Demo src="/samples/receipt.jpg" alt="Um recibo" :editable="false" />

## Zoom e movimento

| Ação                           | Mouse e trackpad           | Toque       | Teclado   |
| ------------------------------ | -------------------------- | ----------- | --------- |
| Dar zoom                       | Roda, ou pinça no trackpad | Pinça       | `+` e `-` |
| Mover                          | Arrastar                   | Arrastar    | Setas     |
| Alternar entre o ajuste e 100% | Clique duplo               | Toque duplo |           |
| Ajustar a imagem inteira       |                            |             | `0`       |

O teclado funciona com o foco no visualizador. A pinça dá zoom em torno do ponto entre os dedos.

O zoom vai do ajuste da imagem inteira, ou 100% para uma imagem pequena, até 800%. Uma imagem que cabe fica centralizada, e uma que passa do limite se move até as bordas.

Ao carregar, a imagem se ajusta inteira ao visualizador, e mantém o ajuste quando o visualizador muda de tamanho, até o usuário dar zoom manualmente.

Numa página longa, a roda daria zoom na imagem em vez de rolar a página. Use ali `wheelZoom: false`: os botões, o teclado e a pinça numa tela sensível ao toque continuam dando zoom.

## A barra de ferramentas

A barra de ferramentas fica à direita do visualizador, e rola quando o visualizador é baixo demais para os botões dela.

| Botão                                       | O que faz                                                             |
| ------------------------------------------- | --------------------------------------------------------------------- |
| Editar                                      | Abre o [modo de edição](./editing). Fica oculto com `editable: false` |
| Ampliar, Reduzir                            | Dão zoom um passo, em torno do centro                                 |
| Ajustar à largura, Ajustar à altura         | Ajustam a largura, bom para documentos longos, ou a altura            |
| Girar para a esquerda, Girar para a direita | Só num visualizador somente leitura: giram a imagem na tela           |
| Baixar                                      | Só com `download: true`: salva a imagem na tela                       |

Com `toolbar: false`, a barra de ferramentas e a barra de edição ficam ocultas, e você pode criar seus próprios controles com os [métodos](../reference/methods).

## Visualizador somente leitura

Com `editable: false`, o botão Editar some, e a barra de ferramentas ganha dois botões que giram a imagem. Esse giro muda só a exibição, e nada é salvo. Use para documentos que devem ser lidos mas não alterados, como os anexos de um registro.

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

Os métodos [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) e [`fit()`](../reference/methods#fit) fazem o mesmo que os botões, e [`getState()`](../reference/methods#getstate) informa o zoom e o ajuste em vigor:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
