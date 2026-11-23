---
title: Métodos
description: Todos os métodos da classe PaperPic, para controlar o visualizador pelo seu código, como dar zoom, encaixar, girar, editar, aplicar, baixar e recarregar.
---

# Métodos

Os métodos controlam o visualizador pelo seu código, por exemplo a partir de botões seus com [`toolbar: false`](./options#toolbar). Com o core, chame-os no `PaperPic` que você cria. Em Vue, o componente expõe o visualizador como `instance`, e em React, `ref` o recebe. Os dois são `null` até o componente ser montado:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Ampliar
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Ampliar</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

Em Vue e React, o componente cria e destrói o visualizador, e recebe as opções como props e os eventos como eventos próprios. Então ali não chame [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions) nem [`on()`](#on).

## Criar e destruir

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Cria o visualizador dentro de `container`, que ele preenche. Defina uma altura para o contêiner, senão o visualizador fica na altura mínima. [Opções](./options) explica o que `options` aceita.

Lança um `TypeError` se `container` não for um elemento. Crie o visualizador quando o elemento já existir, por exemplo na montagem. Lança um `RangeError` se uma opção estiver fora do seu intervalo.

Só com o core: os componentes de Vue e React criam o visualizador ao serem montados.

### `destroy()`

```ts
function destroy(): void
```

Remove o visualizador e libera tudo o que ele ocupa, como o worker e a memória das imagens. Chamá-lo duas vezes não causa problemas.

Só com o core: os componentes de Vue e React o chamam ao serem desmontados. Chamado no visualizador deles, deixaria o componente vazio.

## Opções e estado

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Muda as opções que você passa e mantém as outras. `undefined` devolve uma opção ao seu valor padrão. Nunca emite `change`, então vínculos bidirecionais não entram em loop. Lança um `RangeError` se uma opção estiver fora do seu intervalo, e nesse caso nenhuma opção muda.

Em Vue e React, mude as props em vez disso. A próxima mudança de qualquer prop envia todas as opções de novo, o que desfaria uma mudança feita com `setOptions()`.

### `getState()`

```ts
function getState(): PaperPicState
```

Retorna o estado atual do visualizador, como o zoom, o modo e se há alterações para aplicar. Para saber de cada mudança sem perguntar, escute [`change`](./events#change). [Estado](./state) descreve cada campo, e como os dois se combinam.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Escuta um evento e retorna uma função que para de escutar. [Eventos](./events) descreve cada evento.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

Em Vue e React, escute os eventos do componente em vez disso, como `@apply` ou `onApply`.

## Visualização

### `zoomIn()`

```ts
function zoomIn(): void
```

Amplia um passo, em torno do centro do visualizador.

### `zoomOut()`

```ts
function zoomOut(): void
```

Reduz um passo, em torno do centro do visualizador.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

Define o zoom, em que `1` mostra um pixel da imagem por pixel da tela. [`point`](./types#viewpoint) fica no lugar: ele é dado em pixels CSS a partir do canto superior esquerdo do visualizador, e por padrão é o centro dele.

O zoom vai do que encaixa a imagem inteira, ou `1` se for menor, até `8`. Um valor fora desse intervalo é limitado.

Lança um `RangeError` se `zoom` for `NaN` ou se uma coordenada de `point` não for um número finito, e o zoom então não muda.

### `fit()`

```ts
function fit(fit: Fit): void
```

Encaixa no visualizador a imagem inteira, a largura ou a altura dela. `fit` é um [`Fit`](./types#fit): `'image'`, `'width'` ou `'height'`.

## Edição

### `edit()`

```ts
function edit(): void
```

Começa a edição. Não faz nada se a imagem não estiver pronta ou se [`editable`](./options#editable) for `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Gira a imagem um quarto de volta: no sentido horário com `1`, o padrão, e no anti-horário com `-1`. Durante a edição, adiciona uma alteração que [`apply()`](#apply) torna permanente, e não faz nada com uma ferramenta aberta ou enquanto o Aplicar roda. Num visualizador somente leitura, muda só a exibição. Nos outros casos, não faz nada.

### `flip()`

```ts
function flip(): void
```

Espelha a imagem da esquerda para a direita como ela aparece, então depois de um quarto de volta ainda espelha da esquerda para a direita. Para espelhar a imagem de cima para baixo, espelhe-a e gire-a duas vezes. É uma alteração, e não faz nada fora do modo de edição ou com uma ferramenta aberta.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Abre uma ferramenta com painel: Recortar (`'crop'`), Endireitar (`'perspective'`), Ajustar (`'adjust'`) ou Limpar (`'finish'`), que ao abrir escolhe preto e branco quando o acabamento é o original. A ferramenta fica aberta até [`confirmTool()`](#confirmtool) ou [`cancelTool()`](#canceltool). Enquanto isso, nenhuma outra alteração pode começar, e Desfazer, Refazer e Aplicar não fazem nada. Não faz nada fora do modo de edição, com outra ferramenta aberta, para Ajustar em preto e branco, nem para Recortar e Endireitar enquanto uma pré-visualização está a caminho.

Ocultar (`'redact'`) também abre com cantos, como Recortar.

### `confirmTool()`

```ts
function confirmTool(): void
```

Fecha a ferramenta aberta e adiciona o que ela escolheu às alterações, como faz o `Enter`: a seleção de Recortar ou de Endireitar, ou os valores de Ajustar ou de Limpar, como uma única alteração. Em Endireitar não faz nada até que um canto se mova, e o `canConfirm` do [estado](./state) diz quando pode.

### `cancelTool()`

```ts
function cancelTool(): void
```

Fecha a ferramenta aberta e descarta as alterações dela, como faz o `Esc`.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

Escolhe o acabamento de [Limpar](../guide/tools/clean-up): `'original'`, `'gray'` ou `'mono'` para preto e branco. Também muda a sensibilidade do preto e branco, de 0 a 1. O acabamento sempre vem depois das outras alterações. Enquanto Limpar está aberto, muda o que Limpar mostra, e [`confirmTool()`](#confirmtool) o mantém como uma única alteração. Não faz nada fora do modo de edição ou com outra ferramenta aberta.

Lança um `RangeError` se `mode` não for um [`FinishMode`](./types#finishmode), ou se `sensitivity` não estiver entre 0 e 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Muda o brilho ou o contraste, cada um de -1 a 1, em que 0 deixa a imagem como está. Eles vêm depois das outras alterações, e antes do cinza. Enquanto Ajustar está aberto, muda o que Ajustar mostra, e [`confirmTool()`](#confirmtool) o mantém como uma única alteração. Não faz nada fora do modo de edição, com outra ferramenta aberta ou em preto e branco: o preto e branco compara cada pixel com o que está em volta, então o brilho e o contraste quase não mudariam o resultado.

Lança um `RangeError` se um valor não estiver entre -1 e 1.

### `setPaper()`

```ts
function setPaper(setting: { size?: PaperSize }): void
```

Escolhe o papel que dá suas proporções ao resultado de [Endireitar](../guide/tools/straighten#paper-size): `'a4'`, `'letter'`, `'card'` para um documento de identidade ou cartão bancário, ou `'auto'`, o padrão, que usa [`aspectRatio`](./options#aspectratio) ou, senão, uma estimativa. O papel fica em retrato ou em paisagem conforme os cantos. Não faz nada se Endireitar não está aberto, e cada abertura começa em `'auto'`.

Lança um `RangeError` se `size` não for um [`PaperSize`](./types#papersize).

### `setRedaction()`

```ts
function setRedaction(setting: { color?: RedactColor }): void
```

Escolhe a cor com que [Ocultar](../guide/tools/redact) cobre: `'black'`, o padrão, ou `'white'`. Enquanto Ocultar está aberto, muda a área na tela, e [`confirmTool()`](#confirmtool) a mantém. Senão, é a cor da próxima área. Funciona em qualquer modo.

Lança um `RangeError` se `color` não for uma [`RedactColor`](./types#redactcolor).

### `undo()`

```ts
function undo(): void
```

Desfaz a última alteração. Não faz nada fora do modo de edição, com uma ferramenta aberta ou enquanto o Aplicar roda.

### `redo()`

```ts
function redo(): void
```

Traz de volta a última alteração desfeita. Não faz nada fora do modo de edição, com uma ferramenta aberta ou enquanto o Aplicar roda.

### `apply()`

```ts
function apply(): Promise<void>
```

Aplica as alterações na resolução completa, ou em [`maxOutputSize`](./options#maxoutputsize). O resultado vira a imagem na tela, o histórico se esvazia, o visualizador volta ao modo de visualização, e o evento [`apply`](./events#apply) entrega o resultado. Aplicar não pode ser interrompido, e bloqueia os controles enquanto roda. Não faz nada fora do modo de edição, com uma ferramenta aberta, ou quando não há nada para aplicar.

Se falhar, o evento [`error`](./events#error) informa, e a edição continua aberta. A promise se resolve quando o Aplicar termina, mesmo se falhar: escute `error`, porque um `try/catch` não o detecta.

### `cancel()`

```ts
function cancel(): void
```

Descarta as alterações e volta ao modo de visualização. Não pergunta antes: quem pergunta são o botão Cancelar integrado e o `Esc`. Não faz nada enquanto o Aplicar roda.

## Imagem

### `download()`

```ts
function download(): void
```

Salva a imagem na tela como arquivo: o resultado do último Aplicar, ou então a imagem original. Funciona sem a opção [`download`](./options#download), que só mostra um botão. O evento [`download`](./events#download) vem antes e pode impedir o salvamento. Não faz nada durante a edição, porque as alterações ainda não foram aplicadas. Antes do primeiro Aplicar, um `src` de outra origem abre no navegador: veja [Salvar o resultado](../guide/saving#download).

### `reload()`

```ts
function reload(): void
```

Carrega de novo o [`src`](./options#src) atual, o que traz de volta a original depois de um Aplicar. Durante a edição, descarta as alterações. Sem `src`, não faz nada.
