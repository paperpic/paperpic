import { defineConfig } from 'tsdown'
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
  dts: true,
  clean: true,
  hooks: {
    'build:done': ({ options }) => copyDocs(options.outDir),
  },
  // 'use client' stays at the top of the only chunk, which is all React Server Components need
  checks: { moduleLevelDirective: false },
  publint: { level: 'error' },
  // style.css has no types to resolve
  attw: {
    profile: 'esm-only',
    level: 'error',
    excludeEntrypoints: ['./style.css'],
  },
})
