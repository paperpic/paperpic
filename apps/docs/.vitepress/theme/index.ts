import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    // Loaded only on the pages that use them, because they bring the whole component with them
    app.component('Demo', defineAsyncComponent(() => import('./components/Demo.vue')))
    app.component('Playground', defineAsyncComponent(() => import('./components/Playground.vue')))
  },
} satisfies Theme
