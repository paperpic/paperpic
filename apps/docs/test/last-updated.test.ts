import { beforeEach, expect, it, vi } from 'vitest'

const { git } = vi.hoisted(() => ({
  git: vi.fn(),
}))

vi.mock('node:child_process', () => ({ execFileSync: git }))

/** Two commits as git prints them, newest first. The second one changed a page that the first changed again. */
const LOG = [
  '\x00200',
  '',
  'en/index.md',
  'es/guide/viewer.md',
  '\x00100',
  '',
  'en/guide/viewer.md',
  'es/guide/viewer.md',
  'es/index.md',
  '',
].join('\n')

/** The module without the dates that it keeps from another test. */
async function lastUpdated() {
  vi.resetModules()

  return import('../.vitepress/config/last-updated')
}

beforeEach(() => {
  git.mockReset().mockReturnValue(LOG)
})

it('dates a page by its last commit', async () => {
  const { pageDate } = await lastUpdated()

  expect(pageDate('es/guide/viewer.md')).toBe(200_000)
  expect(pageDate('en/guide/viewer.md')).toBe(100_000)
})

it('has no date for a page without commits', async () => {
  const { pageDate } = await lastUpdated()

  expect(pageDate('en/new.md')).toBeUndefined()
})

it.each([
  ['', 200_000],
  ['guide/viewer', 100_000],
  ['es/', 100_000],
  ['es/guide/viewer', 200_000],
  ['guide/new', undefined],
])('dates the sitemap URL "%s"', async (url, date) => {
  const { sitemapDate } = await lastUpdated()

  expect(sitemapDate(url)).toBe(date)
})

it('asks git once for every page', async () => {
  const { pageDate, sitemapDate } = await lastUpdated()
  pageDate('en/index.md')
  pageDate('es/index.md')
  sitemapDate('guide/viewer')

  expect(git).toHaveBeenCalledOnce()
})

it('has no dates outside a repository', async () => {
  git.mockImplementation(() => {
    throw new Error('fatal: not a git repository')
  })
  const { pageDate, sitemapDate } = await lastUpdated()

  expect(pageDate('en/index.md')).toBeUndefined()
  expect(sitemapDate('guide/viewer')).toBeUndefined()
})
