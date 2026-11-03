import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { locales } from './locales'
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
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/paperpic/paperpic' },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@paperpic/vue': source('../../../../packages/vue/src/index.ts'),
        '@paperpic/core': source('../../../../packages/core/src/index.ts'),
      },
    },
  },
})
