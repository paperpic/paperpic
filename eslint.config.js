import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  // Only where React lives, so its rules leave the Vue and vanilla code alone
  react: {
    files: ['packages/react/**/*.?([cm])[jt]s?(x)', 'playgrounds/react/**/*.?([cm])[jt]s?(x)'],
  },
  typescript: true,
  formatters: true,
  pnpm: { catalogs: false },
  ignores: [
    '**/dist',
    '**/.vitepress/cache',
    '**/.vitepress/dist',
    '.claude/**',
    '.agents/**',
  ],
}, {
  name: 'paperpic/sorted-types',
  rules: {
    'perfectionist/sort-interfaces': [
      'error',
      { type: 'alphabetical', order: 'asc', ignoreCase: true },
    ],
    'perfectionist/sort-object-types': [
      'error',
      { type: 'alphabetical', order: 'asc', ignoreCase: true },
    ],
  },
}, {
  name: 'paperpic/sorted-labels',
  files: ['packages/core/src/ui/labels.ts', 'apps/docs/.vitepress/theme/components/paperpic-labels.ts'],
  rules: {
    'perfectionist/sort-objects': [
      'error',
      { type: 'alphabetical', order: 'asc', ignoreCase: true },
    ],
  },
}, {
  name: 'paperpic/no-pnpm-catalogs',
  files: ['package.json', '**/package.json', 'pnpm-workspace.yaml'],
  rules: {
    'pnpm/json-enforce-catalog': 'off',
    'pnpm/json-valid-catalog': 'off',
    'pnpm/yaml-no-anonymous-catalog': 'off',
    'pnpm/yaml-no-duplicate-catalog-item': 'off',
    'pnpm/yaml-no-unused-catalog-item': 'off',
  },
})
