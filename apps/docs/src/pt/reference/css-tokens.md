---
title: Tokens CSS
description: As propriedades personalizadas CSS que estilizam o PaperPic, com os valores claros e escuros, além da folha de estilo, da camada de cascata e dos nomes de classe.
---

# Tokens CSS

Os tokens são propriedades personalizadas CSS que mudam a aparência do componente sem sobrescrever as regras dele. Defina-os em `:root`, num ancestral do visualizador ou em `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Padrão    | Escuro    | Descrição                           |
| -------------------------------- | --------- | --------- | ----------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Fundo da interface                  |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Texto da interface                  |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Cor de destaque da interface        |
| `--paperpic-radius`              | `6px`     | `6px`     | Raio dos cantos da interface        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Duração das transições da interface |

## Modo escuro

Os valores escuros valem quando o sistema do usuário prefere um esquema de cores escuro. Se o seu site troca de tema de outro jeito, como com uma classe em `<html>`, defina você mesmo as cores de cada tema:

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

## Folha de estilo

Cada pacote traz uma folha de estilo. Importe-a uma vez no seu app:

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

As regras dela ficam na camada de cascata `paperpic`, então qualquer CSS seu fora de uma camada as sobrescreve, seja qual for a especificidade. Isso inclui resets globais, como uma regra em `button`.

## Nomes de classe

`.paperpic` é a raiz do visualizador, e `.paperpic-host` é o elemento que os componentes Vue e React criam em volta dele. Todas as classes do componente começam com `paperpic`, e os nomes são estáveis. Prefira os tokens quando eles cobrirem o que você precisa.
