import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/docs'],
    coverage: {
      // Without include, files no test imports are left out of the report
      include: ['packages/*/src/**/*.{ts,tsx,vue}'],
      // The helpers of the tests are not code that ships
      exclude: ['**/*.d.ts', 'packages/*/src/test/**'],
      reporter: ['text', 'html', 'json-summary'],
      // A little under the current figures, so a pull request with untested code fails and a small refactor does not
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 90,
        lines: 95,
      },
    },
  },
})
