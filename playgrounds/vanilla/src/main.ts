import { normalizeRotation } from '@paperpic/core'
import { createPlayground, initialValues } from 'playground-shared'
import './style.css'

const preview = document.createElement('img')
preview.className = 'preview'
preview.src = '/samples/document.svg'
preview.alt = 'Sample document'

function rotate(degrees: number): void {
  preview.style.transform = `rotate(${normalizeRotation(degrees)}deg)`
}

const stage = createPlayground({
  title: 'Vanilla playground',
  panelTitle: 'Options',
  onChange: ({ rotation }) => rotate(rotation),
})

rotate(initialValues.rotation)
stage.append(preview)
