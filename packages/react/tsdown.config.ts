import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'baseline-widely-available',
  dts: true,
  clean: true,
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
