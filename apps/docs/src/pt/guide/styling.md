---
title: Estilos
description: Como encaixar o PaperPic na aparência do seu app, com a folha de estilo, os tokens CSS, o modo escuro e uma camada de cascata que deixa o seu CSS vencer.
---

# Estilos

O PaperPic deve parecer parte do seu app. Ele traz uma única folha de estilo, pega cores e cantos de poucos tokens CSS e guarda as regras numa camada de cascata, então o seu CSS sempre vence.

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

## Modo escuro {#dark-mode}

As cores mudam para as escuras quando o sistema do usuário prefere um esquema de cores escuro. Se o seu site troca de tema de outro jeito, como com uma classe em `<html>`, defina você mesmo as cores de cada tema:

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

## Disposição

A interface se adapta sozinha ao contêiner:

- A barra de ferramentas fica à direita e rola quando o visualizador é baixo demais para os botões dela.
- A barra de edição fica embaixo, numa linha, ou em duas num visualizador mais estreito que 28rem.
- Em telas sensíveis ao toque, botões e alças de canto medem pelo menos 44 pixels.

## Nomes de classe

Todas as classes do componente começam com `paperpic`, e os nomes são estáveis, então você pode usá-las nos seus seletores. Prefira os tokens quando eles cobrirem o que você precisa, porque continuam funcionando se a estrutura interna mudar.
