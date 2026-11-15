import { readFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'
import { copyDocs } from '../../scripts/copy-docs.ts'

/** How the source names its worker, in `src/pipeline/run.ts`. */
const WORKER_SOURCE = '../processing/worker.ts'
let workerUrlRewritten = false

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
      renderStart() {
        workerUrlRewritten = false
      },
      renderChunk(code) {
        if (!code.includes(WORKER_SOURCE)) {
          return null
        }
        workerUrlRewritten = true
        return code.replace(WORKER_SOURCE, './worker.js')
      },
      // A package that still points at worker.ts starts no worker and does the work on the main thread, without a word
      generateBundle() {
        if (!workerUrlRewritten) {
          throw new Error(`No chunk creates the worker from '${WORKER_SOURCE}', so its URL was not rewritten. Update WORKER_SOURCE in tsdown.config.ts to the path in src/pipeline/run.ts.`)
        }
      },
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
