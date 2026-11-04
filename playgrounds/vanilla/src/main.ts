import { normalizeRotation } from '@paperpic/core'
import { createPlayground } from 'playground-shared'
import './style.css'

createPlayground({
  name: 'Vanilla',
  mount(stage, { src, alt, rotation }) {
    const preview = document.createElement('img')
    preview.className = 'preview'
    preview.src = src
    preview.alt = alt

    const rotate = (degrees: number) => {
      preview.style.transform = `rotate(${normalizeRotation(degrees)}deg)`
    }

    rotate(rotation)
    stage.append(preview)

    return options => rotate(options.rotation)
  },
})
