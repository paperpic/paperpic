import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const sourceAliases = {
  '@paperpic/core': source('../../packages/core/src/index.ts'),
}

export default defineConfig(({ mode }) => ({
  publicDir: '../shared/public',
  resolve: {
    // Without aliases, the package resolves through its `exports`, as it does for a consumer
    alias: mode === 'dist'
      ? undefined
      : sourceAliases,
  },
}))
