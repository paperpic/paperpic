import type { PluginOption } from 'vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

interface PlaygroundConfig {
  plugins?: PluginOption[]
  /** The stylesheet a consumer of this playground's package imports. */
  stylesheet: string
}

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const sourceAliases = {
  '@paperpic/vue': source('../../packages/vue/src/index.ts'),
  '@paperpic/react': source('../../packages/react/src/index.ts'),
  '@paperpic/core': source('../../packages/core/src/index.ts'),
}

const stylesheetModule = 'virtual:playground-stylesheet'

export function definePlayground({ stylesheet, plugins = [] }: PlaygroundConfig) {
  return defineConfig(({ mode }) => {
    const isDist = mode === 'dist'

    return {
      publicDir: '../shared/public',
      plugins: [
        ...plugins,
        {
          // Consumers import the stylesheet themselves. In source mode, the packages inject their styles instead.
          name: 'playground-stylesheet',
          resolveId: id => id === stylesheetModule
            ? `\0${stylesheetModule}`
            : undefined,
          load(id) {
            if (id === `\0${stylesheetModule}`) {
              return isDist
                ? `import '${stylesheet}'`
                : ''
            }
          },
        },
      ],
      resolve: {
        // Without aliases, the packages resolve through their `exports`, as they do for a consumer
        alias: isDist ? undefined : sourceAliases,
      },
    }
  })
}
