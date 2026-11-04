import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@paperpic/vue': source('../../packages/vue/src/index.ts'),
      '@paperpic/core': source('../../packages/core/src/index.ts'),
    },
  },
})
