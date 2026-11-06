import { PaperPic } from '@paperpic/core'
import { createPlayground } from 'playground-shared'

createPlayground({
  name: 'Vanilla',
  mount(stage, options, onApply) {
    const pic = new PaperPic(stage, options)
    pic.on('apply', onApply)

    return changed => pic.setOptions(changed)
  },
})
