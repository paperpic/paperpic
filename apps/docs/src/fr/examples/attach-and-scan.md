---
title: Joindre et numériser
description: Un exemple complet où l’utilisateur photographie un document ou choisit un fichier, le redresse et le nettoie dans PaperPic, puis envoie le résultat à votre serveur, en JavaScript, Vue et React.
---

# Joindre et numériser

La plupart des applications qui reçoivent des documents demandent une photo à l’utilisateur, comme un ticket de caisse pour une note de frais ou un formulaire signé. Cet exemple permet à l’utilisateur de prendre la photo ou de choisir un fichier, de le modifier dans PaperPic et d’envoyer le résultat à votre serveur.

`upload` est la fonction de [Envoyer à un serveur](./upload), qui envoie l’image et échoue quand le serveur ne l’accepte pas.

:::tabs key:framework
== JavaScript

```html
<label>
  Photo du document
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Le document que vous avez joint',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// La modification commence dès que la photo est affichée
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Ce fichier n’est pas une image que le navigateur peut ouvrir'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Envoi…'
  try {
    await upload(blob, type)
    status.textContent = 'Envoyé'
  }
  catch {
    status.textContent = 'Le document n’a pas pu être envoyé'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'Ce fichier n’est pas une image que le navigateur peut ouvrir'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Envoi…'
  try {
    await upload(blob, type)
    status.value = 'Envoyé'
  }
  catch {
    status.value = 'Le document n’a pas pu être envoyé'
  }
}
</script>

<template>
  <label>
    Photo du document
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="Le document que vous avez joint"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ''
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('Ce fichier n’est pas une image que le navigateur peut ouvrir')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Envoi…')
    try {
      await upload(blob, type)
      setStatus('Envoyé')
    }
    catch {
      setStatus('Le document n’a pas pu être envoyé')
    }
  }

  return (
    <>
      <label>
        Photo du document
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target)} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="Le document que vous avez joint"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Remarques

- `capture="environment"` ouvre la caméra arrière sur les téléphones, et les ordinateurs l’ignorent. Sans lui, les téléphones proposent la caméra et la photothèque, ce qui convient aux documents que l’utilisateur a déjà.
- Vider le champ après chaque choix permet de choisir à nouveau la même photo, par exemple pour recommencer après Appliquer.
- La visionneuse ouvre le mode d’édition dès que la photo est chargée, si bien que l’utilisateur passe directement à Redresser ou Nettoyer. Retirez l’écouteur de `load` pour montrer d’abord la photo.
- `phase: 'load'` distingue un fichier que le navigateur ne peut pas ouvrir, comme une photo HEIC hors de Safari, d’une modification qui échoue. [Charger des images](../guide/loading#formats) liste les formats.
- La photo reste dans le navigateur jusqu’à ce que Appliquer appelle `upload`. PaperPic n’envoie rien de lui-même.
- [`maxOutputSize`](../reference/options#maxoutputsize) garde l’envoi léger. Les photos de téléphone font 12 mégapixels ou plus, et les documents restent lisibles à 3000 pixels sur le plus grand côté.
