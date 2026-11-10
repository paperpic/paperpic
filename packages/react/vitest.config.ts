import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    alias: {
      '@paperpic/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
})
