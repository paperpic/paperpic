import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'baseline-widely-available',
  plugins: [
    Vue({ isProduction: true }),
  ],
  dts: {
    vue: true,
  },
  clean: true,
  publint: { level: 'error' },
  // style.css has no types to resolve
  attw: {
    profile: 'esm-only',
    level: 'error',
    excludeEntrypoints: ['./style.css'],
  },
})
