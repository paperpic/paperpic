---
title: Envoyer avec un formulaire
description: Un exemple complet où la photo d’un ticket va dans un champ de formulaire, l’utilisateur la modifie dans PaperPic, et le formulaire envoie l’image modifiée sans code propre, en JavaScript, Vue et React.
---

# Envoyer avec un formulaire

Certaines applications envoient des documents avec un simple formulaire, comme une dépense avec son ticket, et n’ont pas de code propre pour envoyer un fichier. Cet exemple garde la photo dans le champ de fichier du formulaire, et y remet l’image modifiée quand l’utilisateur applique les changements, pour que le formulaire l’envoie comme n’importe quel fichier.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Montant
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Ticket
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Envoyer</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Le ticket que vous avez joint',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// Le formulaire envoie l’image modifiée à la place de la photo
pic.on('apply', ({ blob, type }) => {
  const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  input.files = files.files
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const input = useTemplateRef('input')
const photo = shallowRef<File>()

function choose() {
  photo.value = input.value?.files?.[0]
}

// Le formulaire envoie l’image modifiée à la place de la photo
function applied({ blob, type }: ExportedImage) {
  const field = input.value
  if (!field) {
    return
  }
  const name = field.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  field.files = files.files
}
</script>

<template>
  <form action="/api/expenses" method="post" enctype="multipart/form-data">
    <label>
      Montant
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Ticket
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="Le ticket que vous avez joint" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Envoyer
    </button>
  </form>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function ExpenseForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File>()

  // Le formulaire envoie l’image modifiée à la place de la photo
  function applied({ blob, type }: ExportedImage) {
    const input = inputRef.current
    if (!input) {
      return
    }
    const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
    const files = new DataTransfer()
    files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
    input.files = files.files
  }

  return (
    <form action="/api/expenses" method="post" encType="multipart/form-data">
      <label>
        Montant
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Ticket
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="Le ticket que vous avez joint" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Envoyer</button>
    </form>
  )
}
```

:::

## Remarques

- Appliquer met l’image modifiée dans le champ de fichier avec un [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), pour que le formulaire l’envoie sous le même nom. Avant tout Appliquer, le formulaire envoie la photo telle que l’utilisateur l’a choisie.
- Changer les fichiers du champ depuis le code ne déclenche pas son événement `change`, donc la visionneuse garde le résultat affiché.
- Le fichier garde le nom de la photo, avec l’extension du résultat, comme `receipt.png` après Nettoyer.
- Les boutons de la visionneuse n’envoient jamais le formulaire.
- [`maxOutputSize`](../reference/options#maxoutputsize) garde le formulaire léger. Les photos de téléphone ont 12 mégapixels ou plus, et les documents restent lisibles à 3000 pixels sur le plus grand côté.
