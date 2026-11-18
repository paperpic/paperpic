---
title: Estado
description: Lo que devuelve getState() y envía el evento change, como el estado de la imagen, el modo, el zoom, los cambios y si hay algo para aplicar, y cómo sincronizar con él tus propios controles.
---

# Estado

El estado es una foto del visor: si hay imagen, el modo, el zoom, la herramienta abierta y si hay cambios para aplicar. Puedes obtenerlo de dos formas, y las dos dan el mismo objeto [`PaperPicState`](./types#paperpicstate):

- [`getState()`](./methods#getstate) lo devuelve cuando se lo pides.
- El evento [`change`](./events#change) lo envía cada vez que el usuario o un método lo cambian.

## Sincronizar tus controles {#in-step}

`change` no avisa de la imagen. Una imagen cargada llega con [`load`](./events#load), y una carga o un Aplicar que fallan llegan con [`error`](./events#error). Para sincronizar tus propios controles, como un botón Aplicar, lee el estado al empezar, tómalo de cada `change` y vuelve a leerlo con `load` y `error`:

:::tabs key:framework
== JavaScript

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const applyButton = document.querySelector<HTMLButtonElement>('#apply')!
const pic = new PaperPic(container, { src: '/receipt.jpg', toolbar: false })

function update({ canApply, busy }: PaperPicState) {
  applyButton.disabled = !canApply || busy
}

update(pic.getState())
pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
applyButton.addEventListener('click', () => pic.apply())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = pic.value?.instance?.getState()
}
</script>

<template>
  <button type="button" :disabled="!state || !state.canApply || state.busy" @click="pic?.instance?.apply()">
    Aplicar
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      :toolbar="false"
      @change="next => (state = next)"
      @load="refresh"
      @error="refresh"
    />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()

  function refresh() {
    setState(picRef.current?.getState())
  }

  return (
    <>
      <button type="button" disabled={!state || !state.canApply || state.busy} onClick={() => picRef.current?.apply()}>
        Aplicar
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

En Vue y React el visor solo existe cuando el componente se monta, así que el estado empieza como `undefined` y llega con el primer `load` o `error`. Hasta entonces no hay nada que aplicar.

## Campos

| Campo         | Tipo                                         | Descripción                                                                                                                                                                            |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | La herramienta abierta, como `'crop'` o `'adjust'`, o `null`                                                                                                                           |
| `adjustments` | `{ brightness, contrast }`                   | El brillo y el contraste, cada uno de -1 a 1. No se aplican mientras Limpiar está activada. Con Ajustar abierta, son los valores de su panel                                           |
| `busy`        | `boolean`                                    | Si Aplicar está en marcha                                                                                                                                                              |
| `canApply`    | `boolean`                                    | Si hay cambios para aplicar. Los giros y volteos que se anulan entre sí no cuentan como cambio                                                                                         |
| `canRedo`     | `boolean`                                    | Si hay un cambio para recuperar                                                                                                                                                        |
| `canUndo`     | `boolean`                                    | Si hay un cambio para deshacer                                                                                                                                                         |
| `fit`         | [`Fit \| null`](./types#fit)                 | El encaje vigente, o `null` en cuanto el usuario hace zoom a mano                                                                                                                      |
| `hint`        | `string \| null`                             | Lo que la herramienta abierta pide al usuario, como lo muestra la barra de edición integrada, por ejemplo "Drag the corners", o `null`. Con `toolbar: false`, muéstralo en tu interfaz |
| `image`       | [`Size \| null`](./types#size)               | El tamaño de la imagen en píxeles, a resolución completa y con los cambios hechos, pero sin el giro de `rotation`, o `null` si no hay imagen                                           |
| `mode`        | `'view' \| 'edit'`                           | Si el usuario está viendo o editando la imagen                                                                                                                                         |
| `rotation`    | [`Rotation`](./types#rotation)               | Cuánto está girada la imagen en pantalla respecto a `image`, en grados en el sentido de las agujas del reloj                                                                           |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` sin `src`, `'loading'` mientras carga, `'ready'` cuando está en pantalla, y `'error'` si no se pudo cargar                                                                   |
| `threshold`   | `{ enabled, sensitivity }`                   | Si Limpiar está activada, y su sensibilidad de 0 a 1. Con Limpiar abierta, son los valores de su panel                                                                                 |
| `zoom`        | `number`                                     | Píxeles de pantalla por cada píxel de la imagen                                                                                                                                        |

Con un `rotation` de 90 o 270, la imagen en pantalla, y el resultado de Aplicar, tienen el ancho y el alto de `image` intercambiados. [`maxOutputSize`](./options#maxoutputsize) puede hacer el resultado más pequeño.
