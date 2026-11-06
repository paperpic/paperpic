---
title: Начало работы с Vue
description: Установите @paperpic/vue и покажите первое изображение документа с помощью компонента PaperPic в приложении на Vue 3.
---

# Начало работы

PaperPic находится на ранней стадии разработки. Приведённый ниже API временный и будет меняться.

## Установка

```sh
pnpm add @paperpic/vue
```

Для `@paperpic/vue` требуется Vue 3.5 или новее.

## Использование

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Отсканированный документ" :editable="false" />
  </div>
</template>
```

Просмотрщик заполняет родительский элемент, поэтому задайте ему высоту.

Попробуйте в [песочнице](/ru/playground).
