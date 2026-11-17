---
title: Enviar con un formulario
description: Un ejemplo completo donde la foto de un tique va en un campo de un formulario, el usuario la edita en PaperPic y el formulario envía la imagen editada sin código propio, en JavaScript, Vue y React.
---

# Enviar con un formulario

Algunas apps envían documentos con un formulario normal, como un gasto con su tique, y no tienen código propio para subir un archivo. Este ejemplo deja la foto en el campo de archivo del formulario y vuelve a poner en ese campo la imagen editada cuando el usuario aplica los cambios, así que el formulario la envía como cualquier archivo.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Importe
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Tique
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Enviar</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'El tique que adjuntaste',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// El formulario envía la imagen editada en lugar de la foto
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

// El formulario envía la imagen editada en lugar de la foto
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
      Importe
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Tique
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="El tique que adjuntaste" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Enviar
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

  // El formulario envía la imagen editada en lugar de la foto
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
        Importe
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Tique
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="El tique que adjuntaste" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

:::

## Notas

- Aplicar pone la imagen editada en el campo de archivo con un [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), así que el formulario la envía con el mismo nombre. Antes de cualquier Aplicar, el formulario envía la foto tal como la eligió el usuario.
- Cambiar los archivos del campo desde el código no emite su evento `change`, así que el visor mantiene el resultado en pantalla.
- El archivo conserva el nombre de la foto, con la extensión del resultado, como `receipt.png` después de Limpiar.
- Los botones del visor nunca envían el formulario.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantiene ligero el formulario. Las fotos del móvil tienen 12 megapíxeles o más, y los documentos siguen legibles a 3000 píxeles en el lado más largo.
