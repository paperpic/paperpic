---
title: Traduire l’interface
description: Comment traduire PaperPic ou changer sa formulation avec l’option labels, y compris les textes lus aux lecteurs d’écran, et comment suivre la langue de votre application.
---

# Traduire l’interface

PaperPic affiche ses boutons, ses indications et ses messages en anglais, et les lecteurs d’écran annoncent ce qui change, en anglais aussi. L’option [`labels`](../reference/options#labels) remplace n’importe lequel de ces textes, pour que le composant parle la langue de votre application. Les paquets ne fournissent aucune traduction.

## Remplacer quelques textes

Passez seulement les textes à changer. Les autres gardent leur texte anglais :

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Enregistrer', threshold: 'Noir et blanc' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Enregistrer', threshold: 'Noir et blanc' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Enregistrer', threshold: 'Noir et blanc' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Libellés](../reference/labels) liste toutes les clés, avec leur texte anglais et l’endroit où elles apparaissent.

## Textes avec une valeur

Cinq libellés sont des fonctions, car leur texte contient une valeur : le zoom, la sensibilité de Nettoyer, un coin et sa position, un coin sélectionné, et la règle d’Ajuster. Les lecteurs d’écran les annoncent. Formatez les nombres comme le fait votre langue :

```ts
const signed = new Intl.NumberFormat('fr', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent} %`,
  thresholdLevel: percent => `Sensibilité ${percent} %`,
  cornerMoved: (corner, x, y) => `${corner} : ${x}, ${y}`,
  cornerSelected: corner => `${corner} : touchez son nouvel emplacement`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Suivre la langue de votre application

Quand votre application change de langue, passez les nouveaux libellés, et la visionneuse met ses textes à jour aussitôt. Ne créez l’objet que lorsque la langue change, pour que la visionneuse n’en reçoive pas un nouveau à chaque rendu :

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

Ici, `translations` représente votre propre objet de libellés pour chaque langue.

## Un point de départ

Ce site montre le composant en neuf langues en plus de l’anglais. Leurs libellés se trouvent dans [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), et vous pouvez les copier dans votre application.
