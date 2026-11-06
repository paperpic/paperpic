import { PaperPic } from '@paperpic/vue'
import { createPlayground } from 'playground-shared'
import { createApp, h, reactive } from 'vue'

createPlayground({
  name: 'Vue',
  mount(stage, options, onApply) {
    const props = reactive(options)

    createApp(() => h(PaperPic, { ...props, onApply })).mount(stage)

    return changed => Object.assign(props, changed)
  },
})
