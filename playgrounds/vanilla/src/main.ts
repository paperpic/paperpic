import { PaperPic } from '@paperpic/core'
import { createPlayground } from 'playground-shared'

createPlayground({
  name: 'Vanilla',
  mount(stage, options, { onChange, onApply }) {
    const pic = new PaperPic(stage, options)
    pic.on('change', onChange)
    pic.on('apply', onApply)

    return changed => pic.setOptions(changed)
  },
})
