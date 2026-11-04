import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const sourceAliases = {
  '@paperpic/vue': source('../../packages/vue/src/index.ts'),
  '@paperpic/core': source('../../packages/core/src/index.ts'),
}

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
  ],
  resolve: {
    // Without aliases, the packages resolve through their `exports`, as they do for a consumer
    alias: mode === 'dist'
      ? undefined
      : sourceAliases,
  },
}))
