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
  ],
  publint: { level: 'error' },
  // style.css has no types to resolve
  attw: {
    profile: 'esm-only',
    level: 'error',
    excludeEntrypoints: ['./style.css'],
  },
})
