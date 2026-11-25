import type { UserConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { codeContrast } from './code-contrast'
import { cacheHighlight } from './highlight-cache'
import { pageDate, sitemapDate } from './last-updated'
import { locales, searchLocales } from './locales'
import { addDefaultAlternate, hostname, transformHead } from './seo'

type VitePlugins = NonNullable<NonNullable<UserConfig['vite']>['plugins']>

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** The version of the packages as `major.minor`, which the CDN examples pin. */
const pinnedVersion = (JSON.parse(readFileSync(source('../../../../packages/core/package.json'), 'utf8')) as { version: string })
  .version
  .split('.')
  .slice(0, 2)
  .join('.')

export default defineConfig({
  title: 'PaperPic',
  srcDir: 'src',
  rewrites: {
    'en/:rest*': ':rest*',
  },
  locales,
  cleanUrls: true,
  // VitePress would run git log for each page. last-updated.ts reads every date with one instead
  lastUpdated: false,
  transformPageData: ({ filePath }) => ({
    lastUpdated: pageDate(filePath),
  }),
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
    transformItems: items => addDefaultAlternate(items).map(item => ({
      ...item,
      lastmod: sitemapDate(item.url),
    })),
  },
  markdown: {
    codeTransformers: [codeContrast],
    config(md) {
      cacheHighlight(md)
      // VitePress 1 bundles older types of markdown-it than the ones the plugin uses
      md.use(tabsMarkdownPlugin as unknown as Parameters<typeof md.use>[0])
      // The CDN examples show the current version, whatever the pages say, so no release leaves them behind
      md.core.ruler.push('paperpic-version', (state) => {
        for (const token of state.tokens) {
          if (token.type === 'fence') {
            token.content = token.content.replace(/(@paperpic\/(?:core|vue|react))@\d+\.\d+(?![.\d])/g, `$1@${pinnedVersion}`)
          }
        }
      })
    },
  },
  themeConfig: {
    // The same colors as the name on the home
    siteTitle: 'Paper<span class="name-accent">Pic</span>',
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
    // The plugin takes its Vite types from whichever Vite pnpm hoists, which can be newer than the one of VitePress
    plugins: llmstxt({
      // The name on the home has HTML for its colors
      title: 'PaperPic',
      // Coding agents read English, and one language keeps the files small
      workDir: 'en',
      ignoreFiles: ['playground.md'],
    }) as unknown as VitePlugins,
    resolve: {
      alias: {
        '@paperpic/vue': source('../../../../packages/vue/src/index.ts'),
        '@paperpic/core': source('../../../../packages/core/src/index.ts'),
      },
    },
  },
})
