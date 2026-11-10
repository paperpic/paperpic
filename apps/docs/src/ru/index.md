---
layout: home
title: PaperPic
titleTemplate: Просмотр и редактирование изображений документов
description: Инструмент с открытым исходным кодом для просмотра и редактирования изображений документов. Масштабирование, поворот, коррекция перспективы, яркость и контраст, чёрно-белый режим и удаление теней.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Изображения документов — как надо
  tagline: Просматривайте и редактируйте фотографии документов. Масштабируйте, поворачивайте, исправляйте перспективу, настраивайте яркость и контраст, преобразуйте в чистое чёрно-белое изображение и удаляйте тени.
  actions:
    - theme: brand
      text: Начать
      link: /ru/guide/getting-started
    - theme: alt
      text: Песочница
      link: /ru/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Просмотрщик"
    details: "Масштабируйте кнопками, колесом или щипком, перемещайте изображение и подгоняйте длинные чеки по ширине. При необходимости только для чтения."
    link: /ru/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Выравнивание и обрезка"
    details: "Перетащите четыре угла, чтобы превратить снятую под углом фотографию в ровную страницу, с оценёнными или заданными пропорциями."
    link: /ru/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Очистка"
    details: "Превратите фотографию с тенями в чёткое чёрно-белое изображение, а для цветных документов настройте яркость и контрастность."
    link: /ru/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Полное разрешение"
    details: "Применение передаёт вашему коду отредактированное изображение как Blob, обработанное в Web Worker, чтобы страница оставалась отзывчивой."
    link: /ru/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Доступность"
    details: "Сочетания клавиш, угловые маркеры, которые двигаются стрелками, и объявления для программ чтения с экрана."
    link: /ru/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Любой фреймворк"
    details: "Ядро для чистого JavaScript, лёгкие обёртки для Vue и React и никаких зависимостей во время выполнения."
    link: /ru/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Сравните фотографию и результат"
  beforeLabel: "Фото"
  afterLabel: "PaperPic"
  beforeAlt: "Фотография чека на столе, снятая под углом и частично в тени"
  afterAlt: "Тот же чек, выровненный и очищенный до чёрно-белого"
---
