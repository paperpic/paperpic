import { readFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    worker: 'src/processing/worker.ts',
  },
  format: 'esm',
  platform: 'neutral',
  target: 'baseline-widely-available',
  dts: true,
  clean: true,
  plugins: [
    {
      // The source points at worker.ts, so Vite finds it in the playgrounds. The package has dist/worker.js
      name: 'paperpic-worker-url',
      renderChunk: code => code.replace('../processing/worker.ts', './worker.js'),
    },
    {
      // Vite reads `?raw` imports as text, in the playgrounds and the tests. The build needs the same
      name: 'paperpic-raw',
      async load(id) {
        if (id.endsWith('?raw')) {
          return `export default ${JSON.stringify(await readFile(id.slice(0, -'?raw'.length), 'utf8'))}`
        }
      },
    },
  ],
  publint: { level: 'error' },
  // style.css has no types to resolve
  attw: {
    profile: 'esm-only',
    level: 'error',
    excludeEntrypoints: ['./style.css'],
  },
})
