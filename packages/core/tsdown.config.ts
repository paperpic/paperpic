import { readFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'
import { copyDocs } from '../../scripts/copy-docs.ts'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    worker: 'src/processing/worker.ts',
  },
  format: 'esm',
  platform: 'neutral',
  // Baseline Widely Available on 2026-11-14, as browserslist resolves it: the first such browsers with light-dark(),
  // which the tokens use. tsdown's 'baseline-widely-available' is an older list (Chrome 111, Safari 16.4), for which
  // Lightning CSS rewrites light-dark() into variables that only work with a color-scheme of its own
  target: [
    'chrome124',
    'edge124',
    'firefox125',
    'safari17.5',
    'ios17.5',
  ],
  dts: true,
  clean: true,
  hooks: {
    'build:done': ({ options }) => copyDocs(options.outDir),
  },
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
