import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { locales, searchLocales } from './locales'
import { hostname, transformHead } from './seo'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  title: 'PaperPic',
  srcDir: 'src',
  rewrites: {
    'en/:rest*': ':rest*',
  },
  locales,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/logo-mark.svg',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '48x48',
        href: '/favicon.png',
      },
    ],
  ],
  transformHead,
  sitemap: {
    hostname,
  },
  markdown: {
    config(md) {
      // VitePress 1 bundles older types of markdown-it than the ones the plugin uses
      md.use(tabsMarkdownPlugin as unknown as Parameters<typeof md.use>[0])
    },
  },
  themeConfig: {
    logo: {
      src: '/logo-mark.svg',
      width: 24,
      height: 24,
      alt: '',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/paperpic/paperpic' },
    ],
    search: {
      provider: 'local',
      options: {
        locales: searchLocales,
        miniSearch: {
          options: {
            // Chinese and Japanese do not separate words with spaces, which the default tokenizer splits on.
            // VitePress sends this function to the browser as text, so it cannot use anything outside itself.
            tokenize: (text: string) => Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text))
              .filter(segment => segment.isWordLike)
              .map(segment => segment.segment),
          },
        },
      },
    },
  },
  vite: {
    plugins: [
      llmstxt({
        // The name on the home has HTML for its colors
        title: 'PaperPic',
        // Coding agents read English, and one language keeps the files small
        workDir: 'en',
        ignoreFiles: ['playground.md'],
      }),
    ],
    resolve: {
      alias: {
        '@paperpic/vue': source('../../../../packages/vue/src/index.ts'),
        '@paperpic/core': source('../../../../packages/core/src/index.ts'),
      },
    },
  },
})
