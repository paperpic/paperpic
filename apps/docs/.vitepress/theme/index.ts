import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent, h } from 'vue'
import HomeComparison from './components/HomeComparison.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // The before and after comparison of the home goes under the hero, where it has the full width
  Layout: () => h(DefaultTheme.Layout, null, {
    'home-hero-after': () => h(HomeComparison),
  }),
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    // Loaded only on the pages that use them, because they bring the whole component with them
    app.component('Demo', defineAsyncComponent(() => import('./components/Demo.vue')))
    app.component('Playground', defineAsyncComponent(() => import('./components/Playground.vue')))
  },
} satisfies Theme
