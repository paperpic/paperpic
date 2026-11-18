import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const DEV_PORT = 5180
const PREVIEW_PORT = 5181
/**
 * One address for the servers and the browsers. With `localhost`, Vite can listen on `::1` alone while Firefox tries
 * `127.0.0.1`, and the page fails to load now and then with NS_ERROR_CONNECTION_REFUSED.
 */
const HOST = '127.0.0.1'

/**
 * Smoke tests in real browsers, against the built packages, as a consumer gets them. The unit tests run in happy-dom
 * with a fake Worker, so they cannot see a canvas, a gesture or the bundled worker fail.
 *
 * Each browser runs the page twice: from the development server, and from a production build of it, because Vite
 * handles the URL of the worker differently in each.
 */
const servers = [
  { name: 'dev', port: DEV_PORT },
  { name: 'build', port: PREVIEW_PORT },
]

const browsers = [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'webkit', use: devices['Desktop Safari'] },
]

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI
    ? 1
    : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        [
          'html',
          { open: 'never' },
        ],
      ]
    : 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: servers.flatMap(server => browsers.map(browser => ({
    name: `${browser.name}-${server.name}`,
    use: { ...browser.use, baseURL: `http://${HOST}:${server.port}` },
  }))),
  webServer: [
    {
      command: `vite --mode dist --host ${HOST} --port ${DEV_PORT} --strictPort`,
      url: `http://${HOST}:${DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `vite build --mode dist --outDir dist && vite preview --mode dist --outDir dist --host ${HOST} --port ${PREVIEW_PORT} --strictPort`,
      url: `http://${HOST}:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
