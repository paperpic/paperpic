---
title: Traducir la interfaz
description: Cómo traducir PaperPic o cambiar sus palabras con la opción labels, incluidos los textos que se leen a los lectores de pantalla, y cómo seguir el idioma de tu app.
---

# Traducir la interfaz

PaperPic muestra sus botones, pistas y mensajes en inglés, y los lectores de pantalla anuncian lo que cambia, también en inglés. La opción [`labels`](../reference/options#labels) sustituye cualquiera de estos textos, para que el componente hable el idioma de tu app. Los paquetes no incluyen traducciones.

## Cambiar algunos textos

Pasa solo los textos que quieras cambiar. Los demás conservan su texto en inglés:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Guardar', threshold: 'Blanco y negro' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Guardar', threshold: 'Blanco y negro' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Guardar', threshold: 'Blanco y negro' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Textos de la interfaz](../reference/labels) recoge todas las claves, con su texto en inglés y dónde aparecen.

## Textos con un valor

Cinco textos son funciones, porque incluyen un valor: el zoom, la sensibilidad de Limpiar, una esquina y su posición, una esquina seleccionada, y un control de Ajustar. Los lectores de pantalla los anuncian. Formatea los números como lo hace tu idioma:

```ts
const signed = new Intl.NumberFormat('es', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent} %`,
  thresholdLevel: percent => `Sensibilidad ${percent} %`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: toca donde va`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Seguir el idioma de tu app

Cuando tu app cambia de idioma, pasa los textos nuevos, y el visor actualiza sus textos al momento. Crea el objeto solo cuando cambia el idioma, para que el visor no reciba uno nuevo en cada renderizado:

:::tabs key:framework
== JavaScript

```ts
function setLanguage(language: string) {
  pic.setOptions({ labels: translations[language] })
}
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const labels = computed(() => translations[locale.value])
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useMemo } from 'react'

export function Receipt({ language }: { language: string }) {
  const labels = useMemo(() => translations[language], [language])
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

Aquí `translations` representa tu propio objeto de textos para cada idioma.

## Un punto de partida

Esta web muestra el componente en nueve idiomas además del inglés. Sus textos están en [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), y puedes copiarlos en tu app.
