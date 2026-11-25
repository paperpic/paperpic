import type { MarkdownRenderer } from 'vitepress'

const highlighted = new Map<string, string>()

/**
 * Highlights each distinct code block once. VitePress renders every page again for the search index of each bundle,
 * with a renderer of its own, and the languages share many blocks.
 */
export function cacheHighlight(md: MarkdownRenderer) {
  const highlight = md.options.highlight!

  md.options.highlight = (code, lang, attrs) => {
    const key = JSON.stringify([code, lang, attrs])
    const html = highlighted.get(key) ?? highlight(code, lang, attrs)
    highlighted.set(key, html)

    return html
  }
}
