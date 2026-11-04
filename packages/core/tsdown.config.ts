import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  target: 'baseline-widely-available',
  dts: true,
  clean: true,
  publint: { level: 'error' },
  attw: { profile: 'esm-only', level: 'error' },
})
