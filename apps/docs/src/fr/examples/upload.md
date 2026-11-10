---
title: Envoyer à un serveur
description: Un exemple complet qui envoie à votre serveur l’image modifiée dans PaperPic et indique à l’utilisateur si elle a été enregistrée, en JavaScript, Vue et React.
---

# Envoyer à un serveur

La visionneuse affiche aussitôt le résultat d’Appliquer, mais l’enregistrer revient à votre application. Cet exemple envoie l’image modifiée à votre serveur et indique à l’utilisateur comment cela s’est passé.

Cette fonction envoie l’image comme fichier dans un formulaire, et échoue quand le serveur ne l’accepte pas :

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

La visionneuse l’appelle à l’application, et une ligne d’état indique le résultat :

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: 'Facture 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Enregistrement…'
  try {
    await upload(blob, type)
    status.textContent = 'Enregistré'
  }
  catch {
    status.textContent = 'Le document n’a pas pu être enregistré'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = 'Enregistrement…'
  try {
    await upload(blob, type)
    status.value = 'Enregistré'
  }
  catch {
    status.value = 'Le document n’a pas pu être enregistré'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Facture 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('Enregistrement…')
    try {
      await upload(blob, type)
      setStatus('Enregistré')
    }
    catch {
      setStatus('Le document n’a pas pu être enregistré')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Facture 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Remarques

- `role="status"` fait annoncer le résultat de l’envoi par les lecteurs d’écran.
- [`maxOutputSize`](../reference/options#maxoutputsize) garde le fichier léger. Les documents restent lisibles avec 3000 pixels sur le plus grand côté.
- Après Appliquer, l’historique est vide, donc l’utilisateur ne peut pas revenir à l’ancienne image. Pour proposer un bouton Réessayer, gardez le dernier `blob` et `type` et rappelez `upload`.
- Le serveur reçoit du PNG pour un document nettoyé, et sinon le format de l’image source. Voir [Enregistrer le résultat](../guide/saving) pour en choisir un autre.
