---
title: Zustand
description: Was getState() zurückgibt und das Ereignis change liefert, etwa den Status des Bildes, den Modus, den Zoom, die Änderungen und ob es etwas zu übernehmen gibt, und wie du eigene Bedienelemente damit synchron hältst.
---

# Zustand

Der Zustand ist eine Momentaufnahme des Viewers: ob es ein Bild gibt, der Modus, der Zoom, das offene Werkzeug und ob es Änderungen zum Übernehmen gibt. Du bekommst ihn auf zwei Wegen, und beide liefern dasselbe Objekt [`PaperPicState`](./types#paperpicstate):

- [`getState()`](./methods#getstate) gibt ihn zurück, wann immer du fragst.
- Das Ereignis [`change`](./events#change) sendet ihn jedes Mal, wenn der Nutzer oder eine Methode ihn ändert.

## Bedienelemente synchron halten {#in-step}

`change` meldet das Bild nicht. Ein geladenes Bild kommt mit [`load`](./events#load), und ein Laden oder Übernehmen, das fehlschlägt, mit [`error`](./events#error). Um eigene Bedienelemente synchron zu halten, etwa eine Schaltfläche Übernehmen, lies den Zustand am Anfang, nimm ihn aus jedem `change` und lies ihn bei `load` und `error` erneut:

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
    Übernehmen
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
        Übernehmen
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

In Vue und React gibt es den Viewer erst, wenn die Komponente gemountet ist. Der Zustand beginnt also als `undefined` und kommt mit dem ersten `load` oder `error`. Bis dahin gibt es nichts zu übernehmen.

## Felder

| Feld          | Typ                                          | Beschreibung                                                                                                                                                                          |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | Das offene Werkzeug, etwa `'crop'` oder `'adjust'`, oder `null`                                                                                                                       |
| `adjustments` | `{ brightness, contrast }`                   | Helligkeit und Kontrast, jeweils von -1 bis 1. Sie wirken nicht in Schwarzweiß. Solange Anpassen offen ist, die Werte in seinem Bedienfeld                                            |
| `busy`        | `boolean`                                    | Ob Übernehmen gerade läuft                                                                                                                                                            |
| `canApply`    | `boolean`                                    | Ob es Änderungen zum Übernehmen gibt. Drehungen und Spiegelungen, die sich aufheben, zählen nicht                                                                                     |
| `canRedo`     | `boolean`                                    | Ob es eine Änderung zum Wiederherstellen gibt                                                                                                                                         |
| `canUndo`     | `boolean`                                    | Ob es eine Änderung zum Rückgängigmachen gibt                                                                                                                                         |
| `finish`      | `{ mode, sensitivity }`                      | Das Finish von Bereinigen, ein [`FinishMode`](./types#finishmode), und die Empfindlichkeit von Schwarzweiß, von 0 bis 1. Solange Bereinigen offen ist, die Werte in seinem Bedienfeld |
| `fit`         | [`Fit \| null`](./types#fit)                 | Die aktive Einpassung, oder `null`, sobald der Nutzer von Hand gezoomt hat                                                                                                            |
| `hint`        | `string \| null`                             | Was das offene Werkzeug vom Nutzer verlangt, wie es die eingebaute Bearbeitungsleiste zeigt, etwa „Drag the corners“, oder `null`. Mit `toolbar: false` zeige es in deiner Oberfläche |
| `image`       | [`Size \| null`](./types#size)               | Die Größe des Bildes in Pixeln, in voller Auflösung und mit den bisherigen Änderungen, aber ohne die Drehung von `rotation`, oder `null` ohne Bild                                    |
| `mode`        | `'view' \| 'edit'`                           | Ob der Nutzer das Bild ansieht oder bearbeitet                                                                                                                                        |
| `rotation`    | [`Rotation`](./types#rotation)               | Wie weit das angezeigte Bild gegenüber `image` gedreht ist, in Grad im Uhrzeigersinn                                                                                                  |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` ohne `src`, `'loading'` während des Ladens, `'ready'`, sobald es angezeigt wird, und `'error'`, wenn es nicht geladen werden konnte                                         |
| `zoom`        | `number`                                     | Bildschirmpixel pro Bildpixel                                                                                                                                                         |

Mit einer `rotation` von 90 oder 270 haben das angezeigte Bild und das Ergebnis von Übernehmen die Breite und die Höhe von `image` vertauscht. [`maxOutputSize`](./options#maxoutputsize) kann das Ergebnis verkleinern.
