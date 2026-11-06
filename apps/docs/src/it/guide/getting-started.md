---
title: Primi passi con Vue
description: Installa @paperpic/vue e mostra la tua prima immagine di un documento con il componente PaperPic in un'applicazione Vue 3.
---

# Primi passi

PaperPic è in una fase iniziale di sviluppo. L'API riportata qui sotto è provvisoria e cambierà.

## Installazione

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` richiede Vue 3.5 o versioni successive.

## Utilizzo

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Documento scansionato" :editable="false" />
  </div>
</template>
```

Il visualizzatore riempie il suo elemento genitore, quindi assegnagli un’altezza.

Provalo dal vivo nel [playground](/it/playground).
