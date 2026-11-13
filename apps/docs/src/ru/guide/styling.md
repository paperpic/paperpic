---
title: Оформление
description: Как вписать PaperPic во внешний вид вашего приложения с помощью его таблицы стилей, CSS-токенов, тёмной темы, ваших иконок и каскадного слоя, который даёт вашему CSS приоритет.
---

# Оформление

PaperPic должен выглядеть частью вашего приложения. Он поставляет одну таблицу стилей, берёт цвета и углы из нескольких CSS-токенов, следует цветовой схеме вашей страницы и держит свои правила в каскадном слое, поэтому ваш CSS всегда побеждает.

## Импорт таблицы стилей

Импортируйте её в приложении один раз:

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

## Задать размер

Просмотрщик заполняет свой контейнер и не имеет собственной высоты, поэтому высота нужна контейнеру. Подойдёт любой CSS, который её задаёт:

```css
.document-viewer {
  height: 70dvh;
}
```

Просмотрщик следует размеру контейнера, а не экрана. Он реагирует, когда контейнер меняется, например при открытии боковой панели.

## Цвета и углы

Пять [CSS-токенов](../reference/css-tokens) задают фон, текст, акцентный цвет, радиус углов и длительность переходов. Задавайте их на `:root`, на предке просмотрщика или на `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

Токены наследуются, поэтому класс на контейнере одного просмотрщика или на компоненте Vue или React меняет только этот просмотрщик:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Цвета вашей дизайн-системы {#design-system}

Если ваше приложение хранит цвета в CSS-переменных, направьте токены на них, а не копируйте значения. Тогда просмотрщик следует вашей теме, включая тёмную:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Задавайте их на `.paperpic`, как здесь. Токен с `var()` читает переменную на том элементе, где вы его задали, поэтому на `:root` он пропустит тему, которую вы переключаете в части страницы.

Подойдёт любая дизайн-система с CSS-переменными, например переменные темы Tailwind CSS 4: `var(--color-blue-600)` или `var(--radius-md)`.

## Тёмная тема {#dark-mode}

Цвета следуют `color-scheme` вашей страницы, как это делают элементы форм браузера:

- С `color-scheme: light dark` они становятся тёмными, когда система пользователя предпочитает тёмную цветовую схему.
- С `color-scheme: dark` они всегда тёмные. Это работает и в части страницы.
- Без `color-scheme` они остаются светлыми, поэтому страница без тёмной темы сохраняет светлый просмотрщик.

Если ваш сайт следует системе, объявите это один раз:

```css
:root {
  color-scheme: light dark;
}
```

Если ваш сайт переключает тему классом, например на `<html>`, задавайте `color-scheme` вместе с этим классом. Полосы прокрутки и элементы форм браузера тоже ему следуют:

```css
:root.dark {
  color-scheme: dark;
}
```

Чтобы выбрать свои тёмные цвета, задайте токену оба значения через `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Токены, которые указывают на переменные вашей [дизайн-системы](#design-system), вместо этого следуют вашей теме.

## Иконки {#icons}

Опция [`icons`](../reference/options#icons) заменяет любую иконку вашей разметкой, обычно `<svg>` из набора иконок вашего приложения:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
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

- Каждый ключ называет иконку, и некоторые иконки есть на двух кнопках: `apply` также на кнопке Готово, а `cancel` также закрывает инструмент. [Опции](../reference/options#icons) перечисляют все ключи.
- PaperPic добавляет иконке класс `paperpic-icon`, который задаёт её размер, и скрывает её от программ чтения с экрана, потому что у кнопки уже есть имя.
- Рисуйте иконку через `currentColor`, чтобы она брала цвет кнопки в любой теме.
- Разметка попадает на страницу как HTML, поэтому передавайте только разметку, которой доверяете.
- В Vite `import zoomIn from './zoom-in.svg?raw'` даёт разметку файла `.svg`.

Чтобы изменить все иконки сразу, например их размер или толщину линий, задайте стиль классу:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## Ваш CSS побеждает

Правила PaperPic лежат в каскадном слое `paperpic`, и любой CSS вне слоя их переопределяет, какой бы ни была его специфичность. Это упрощает настройку, но глобальный сброс вне слоя, например правило для `button`, тоже затрагивает кнопки просмотрщика.

Если ваш сброс ломает просмотрщик, перенесите его в слой, который идёт перед `paperpic`. Первое объявление со списком слоёв задаёт их порядок, поэтому разместите его в CSS, который загружается раньше таблицы стилей PaperPic:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Tailwind CSS 4 тоже держит свои правила в каскадных слоях. Перечислите все слои по порядку до импорта Tailwind и PaperPic, чтобы сброс Tailwind шёл перед `paperpic`, а его утилиты после:

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

Импортируйте таблицу стилей PaperPic здесь, в вашем CSS, а не из JavaScript. При другом порядке сброс Tailwind убирает внутренние отступы и рамки просмотрщика, или просмотрщик переопределяет утилиты вроде `h-96` на компоненте.

## Имена классов {#class-names}

[Справочник по CSS](../reference/css-tokens#classes) перечисляет классы, которые можно использовать в селекторах, например `paperpic-toolbar` и `paperpic-button`, и их имена стабильны. Остальные классы держат расположение и могут измениться в любой версии. Если токенов хватает для задачи, используйте их.

Каждая кнопка, шкала и угловой маркер также несёт `data-paperpic-control` с ключом своей [подписи](../reference/labels). Выберите его, чтобы оформить один элемент управления:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Расположение

Интерфейс сам подстраивается под контейнер:

- Панель инструментов находится справа и прокручивается, если просмотрщик слишком низкий для её кнопок. Во время редактирования она скрывается.
- Панель редактирования — карточка внизу с двумя строками фиксированной высоты или одной строкой в просмотрщике шириной от 28rem, поэтому изображение не сдвигается, когда открывается инструмент.
- На сенсорных экранах кнопки и угловые маркеры не меньше 44 пикселей.

## Свои элементы управления

Если оформления мало, скройте панель инструментов и панель редактирования с `toolbar: false` и управляйте просмотрщиком своими элементами. Как это сделать, показывает [Своя панель инструментов](../examples/custom-toolbar).
