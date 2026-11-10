import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { translations } from '../.vitepress/config/locales'
import { sidebar } from '../.vitepress/config/sidebar'

const docs = fileURLToPath(new URL('..', import.meta.url))

function pagesOf(locale: string) {
  return readdirSync(`${docs}/src/${locale}`, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('.md'))
    .map(file => file.replaceAll('\\', '/'))
    .sort()
}

const english = pagesOf('en')
const locales = Object.keys(translations).filter(key => key !== 'root')

describe.each(locales)('%s', (locale) => {
  it('has the same pages as English', () => {
    expect(pagesOf(locale)).toEqual(english)
  })

  it('has a glossary', () => {
    expect(existsSync(`${docs}/glossary/${locale}.md`)).toBe(true)
  })
})

it('links the sidebar to existing pages', () => {
  const missing = sidebar
    .flatMap(({ pages }) => pages)
    .filter(page => !english.includes(`${page}.md`))

  expect(missing).toEqual([])
})
