import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { pageDate, sitemapDate } from '../.vitepress/config/last-updated'

const src = fileURLToPath(new URL('../src/', import.meta.url))

/** The date of the last commit of one page, as VitePress asks git for it. */
function lastCommit(file: string) {
  return Number(execFileSync('git', [
    'log',
    '-1',
    '--format=%at',
    '--',
    file,
  ], { cwd: src, encoding: 'utf8' })) * 1000
}

it.each([
  'en/index.md',
  'en/guide/tools/clean-up.md',
  'ja/reference/options.md',
])('dates %s by its last commit', (file) => {
  expect(pageDate(file)).toBe(lastCommit(file))
})

it('has no date for a page without commits', () => {
  expect(pageDate('en/not-a-page.md')).toBeUndefined()
})

it.each([
  ['', 'en/index.md'],
  ['guide/viewer', 'en/guide/viewer.md'],
  ['es/', 'es/index.md'],
  ['es/guide/viewer', 'es/guide/viewer.md'],
])('dates the sitemap URL "%s" by %s', (url, file) => {
  expect(sitemapDate(url)).toBe(lastCommit(file))
})
