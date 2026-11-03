import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  title: 'PaperPic',
  description: 'Document image viewer & editor: zoom, rotate, perspective correction, brightness/contrast, black & white and shadow removal.',
  sitemap: {
    hostname: 'https://paperpic.dev',
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Playground', link: '/playground' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/paperpic/paperpic' },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@paperpic/vue': source('../../../packages/vue/src/index.ts'),
        '@paperpic/core': source('../../../packages/core/src/index.ts'),
      },
    },
  },
})
