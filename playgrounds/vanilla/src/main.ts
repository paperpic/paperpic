import { PaperPic } from '@paperpic/core'
import { createPlayground } from 'playground-shared'

createPlayground({
  name: 'Vanilla',
  mount(stage, options) {
    const pic = new PaperPic(stage, options)

    return changed => pic.setOptions(changed)
  },
})
