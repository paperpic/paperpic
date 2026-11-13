import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
import { copyDocs } from '../../scripts/copy-docs.ts'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  // The browsers of @paperpic/core, whose styles this package bundles. Its tsdown.config.ts says why
  target: [
    'chrome124',
    'edge124',
    'firefox125',
    'safari17.5',
    'ios17.5',
  ],
  plugins: [
    Vue({ isProduction: true }),
  ],
  dts: {
    tsc: { vue: true },
  },
  clean: true,
  hooks: {
    'build:done': ({ options }) => copyDocs(options.outDir),
  },
  publint: { level: 'error' },
  // style.css has no types to resolve
  attw: {
    profile: 'esm-only',
    level: 'error',
    excludeEntrypoints: ['./style.css'],
  },
})
