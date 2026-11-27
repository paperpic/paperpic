import type { MarkdownRenderer } from 'vitepress'
import { expect, it, vi } from 'vitest'
import { cacheHighlight } from '../.vitepress/config/highlight-cache'

/** What the cache needs of a renderer, with a highlighter that says what it got. */
function renderer() {
  const highlight = vi.fn((code: string, lang: string, attrs: string) => `${lang}|${attrs}|${code}`)
  const md = {
    options: { highlight },
  }
  cacheHighlight(md as unknown as MarkdownRenderer)

  return { highlight, render: md.options.highlight }
}

it('highlights a block once, also for another renderer', () => {
  const first = renderer()
  const second = renderer()

  expect(first.render('const a = 1', 'ts', '')).toBe('ts||const a = 1')
  expect(first.render('const a = 1', 'ts', '')).toBe('ts||const a = 1')
  expect(second.render('const a = 1', 'ts', '')).toBe('ts||const a = 1')
  expect(first.highlight).toHaveBeenCalledOnce()
  expect(second.highlight).not.toHaveBeenCalled()
})

it('highlights again a block with another language or other attributes', () => {
  const { render } = renderer()

  expect(render('const b = 2', 'ts', '')).toBe('ts||const b = 2')
  expect(render('const b = 2', 'js', '')).toBe('js||const b = 2')
  expect(render('const b = 2', 'ts', '{1}')).toBe('ts|{1}|const b = 2')
})
