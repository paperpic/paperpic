---
title: Estilos
description: Como encaixar o PaperPic na aparência do seu app, com a folha de estilo, os tokens CSS, o modo escuro, os seus próprios ícones e uma camada de cascata que deixa o seu CSS vencer.
---

# Estilos

O PaperPic deve parecer parte do seu app. Ele traz uma única folha de estilo, pega cores e cantos de poucos tokens CSS, segue o esquema de cores da sua página e guarda as regras numa camada de cascata, então o seu CSS sempre vence.

## Importar a folha de estilo

Importe-a uma vez no seu app:

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

## Dar um tamanho

O visualizador preenche o contêiner e não tem altura própria, então o contêiner precisa de uma. Qualquer CSS que dê altura a ele funciona:

```css
.document-viewer {
  height: 70dvh;
}
```

O visualizador segue o tamanho do contêiner, não o da tela. Ele reage quando o contêiner muda, por exemplo quando um painel lateral abre.

## Cores e cantos

Cinco [tokens CSS](../reference/css-tokens) definem o fundo, o texto, a cor de destaque, o raio dos cantos e a duração das transições. Defina-os em `:root`, num ancestral do visualizador ou em `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

Os tokens são herdados, então uma classe no contêiner de um visualizador, ou no componente Vue ou React, muda só esse visualizador:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Usar as cores do seu design system {#design-system}

Se o seu app guarda as cores em variáveis CSS, aponte os tokens para elas em vez de copiar os valores. Assim o visualizador segue o seu tema, com o modo escuro incluído:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Defina-os em `.paperpic`, como aqui. Um token que usa `var()` lê a variável no elemento onde você o define, então em `:root` ele não veria um tema que você troca em uma parte da página.

Qualquer design system com variáveis CSS funciona, como as variáveis do tema do Tailwind CSS 4: `var(--color-blue-600)` ou `var(--radius-md)`.

## Modo escuro {#dark-mode}

As cores seguem o `color-scheme` da sua página, como fazem os controles de formulário do navegador:

- Com `color-scheme: light dark`, elas ficam escuras quando o sistema do usuário prefere um esquema de cores escuro.
- Com `color-scheme: dark`, elas são sempre escuras. Isso também funciona em uma parte da página.
- Sem `color-scheme`, elas continuam claras, então uma página sem tema escuro mantém um visualizador claro.

Se o seu site segue o sistema, declare isso uma vez:

```css
:root {
  color-scheme: light dark;
}
```

Se o seu site troca de tema com uma classe, como em `<html>`, defina `color-scheme` junto com essa classe. As barras de rolagem e os controles de formulário do navegador também o seguem:

```css
:root.dark {
  color-scheme: dark;
}
```

Para escolher as suas próprias cores escuras, dê a um token os dois valores com `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Os tokens que apontam para as variáveis do seu [design system](#design-system) seguem o seu tema no lugar disso.

## Ícones {#icons}

A opção [`icons`](../reference/options#icons) substitui qualquer ícone pela sua própria marcação, em geral um `<svg>` do conjunto de ícones do seu app:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- Cada chave nomeia um ícone, e alguns ícones aparecem em dois botões: `apply` também está em Concluído, e `cancel` também fecha uma ferramenta. [Opções](../reference/options#icons) lista todas as chaves.
- O PaperPic dá ao ícone a classe `paperpic-icon`, que define o tamanho dele, e o esconde dos leitores de tela, porque o botão já tem nome.
- Desenhe o ícone com `currentColor`, para que ele pegue a cor do botão em qualquer tema.
- A marcação entra na página como HTML, então passe apenas marcação confiável.
- Com o Vite, `import zoomIn from './zoom-in.svg?raw'` dá a marcação de um arquivo `.svg`.

Para mudar todos os ícones de uma vez, como o tamanho ou a espessura das linhas, estilize a classe:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## O seu CSS vence

As regras do PaperPic ficam na camada de cascata `paperpic`, e qualquer CSS fora de uma camada as sobrescreve, seja qual for a especificidade. Isso facilita personalizar, mas um reset global fora de uma camada, como uma regra em `button`, também atinge os botões do visualizador.

Se o seu reset quebrar o visualizador, mova-o para uma camada que venha antes de `paperpic`. A primeira declaração que nomeia as camadas fixa a ordem delas, então coloque-a num CSS que carregue antes da folha de estilo do PaperPic:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

O Tailwind CSS 4 também guarda as regras em camadas de cascata. Nomeie todas as camadas, em ordem, antes de importar o Tailwind e o PaperPic, para que o reset do Tailwind venha antes de `paperpic` e os utilitários dele venham depois:

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

Importe a folha de estilo do PaperPic aqui, no seu CSS, e não pelo JavaScript. Em outra ordem, o reset do Tailwind tira espaçamentos internos e bordas do visualizador, ou o visualizador sobrescreve utilitários como `h-96` no componente.

## Nomes de classe {#class-names}

A [referência de CSS](../reference/css-tokens#classes) lista as classes que você pode usar nos seus seletores, como `paperpic-toolbar` e `paperpic-button`, e os nomes delas são estáveis. As outras classes sustentam a disposição e podem mudar em qualquer versão. Prefira os tokens quando eles cobrirem o que você precisa.

Cada botão, régua e alça de canto também leva `data-paperpic-control`, com a chave do seu [rótulo](../reference/labels). Selecione-o para estilizar um único controle:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Disposição

A interface se adapta sozinha ao contêiner:

- A barra de ferramentas fica à direita e rola quando o visualizador é baixo demais para os botões dela. Ela se esconde durante a edição.
- A barra de edição é um cartão embaixo com duas linhas de altura fixa, ou uma linha num visualizador com pelo menos 28rem de largura, então a imagem fica no lugar quando uma ferramenta abre.
- Em telas sensíveis ao toque, botões e alças de canto medem pelo menos 44 pixels.

## Os seus próprios controles

Quando os estilos não bastam, esconda a barra de ferramentas e a barra de edição com `toolbar: false`, e conduza o visualizador com controles seus. [Barra de ferramentas própria](../examples/custom-toolbar) mostra como.
