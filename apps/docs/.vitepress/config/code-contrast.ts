import type { MarkdownOptions } from 'vitepress'

type ShikiTransformer = NonNullable<MarkdownOptions['codeTransformers']>[number]

/**
 * The colors of the GitHub themes of Shiki that stay below 4.5:1 on the background of the code blocks, each with the
 * nearest color of GitHub's own palette that reaches it.
 */
const replacements: Record<'light' | 'dark', Record<string, string>> = {
  light: {
    '#D73A49': '#CF222E', // keywords, 4.24:1
    '#E36209': '#BC4C00', // variables and parameters, 3.23:1
    '#22863A': '#1A7F37', // tags, 4.28:1
    '#6A737D': '#636C76', // comments, 4.46:1
  },
  dark: {
    '#6A737D': '#848D97', // comments, 3.75:1
  },
}

/** Gives the code blocks colors that reach 4.5:1 in both themes, without changing the rest of their look. */
export const codeContrast: ShikiTransformer = {
  name: 'paperpic:code-contrast',
  postprocess(html) {
    return html.replace(/--shiki-(light|dark):(#[0-9a-f]{6})/gi, (match, theme: 'light' | 'dark', color: string) => {
      const replacement = replacements[theme][color.toUpperCase()]

      return replacement
        ? `--shiki-${theme}:${replacement}`
        : match
    })
  },
}
