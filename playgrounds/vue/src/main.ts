import { createPlayground, initialValues } from 'playground-shared'
import { createApp, h, reactive } from 'vue'
import App from './App.vue'

const props = reactive({ ...initialValues })

const stage = createPlayground({
  title: 'Vue playground',
  panelTitle: 'Props',
  onChange: values => Object.assign(props, values),
})

createApp(() => h(App, { ...props })).mount(stage)
