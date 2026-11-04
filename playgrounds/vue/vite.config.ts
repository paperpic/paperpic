import vue from '@vitejs/plugin-vue'
import { definePlayground } from '../shared/vite.ts'

export default definePlayground({
  stylesheet: '@paperpic/vue/style.css',
  plugins: [
    vue(),
  ],
})
