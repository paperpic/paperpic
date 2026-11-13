import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const docs = fileURLToPath(new URL('..', import.meta.url))
const root = join(docs, '../..')
const packages = join(root, 'packages')
// Inside node_modules, so `vue` resolves from here and nothing needs ignoring
const work = join(docs, 'node_modules/.cache/paperpic-examples')

function markdownIn(directory: string): string[] {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => join(entry.parentPath, entry.name))
}

/** The pages that teach the API to people and to agents: the English docs, the READMEs and the agent skills. */
const pages = [
  ...markdownIn(join(docs, 'src/en')),
  join(root, 'README.md'),
  ...['core', 'vue', 'react'].map(name => join(packages, name, 'README.md')),
  ...markdownIn(join(root, 'skills')).filter(path => path.endsWith('SKILL.md')),
]

const extensions: Record<string, string> = { ts: 'ts', tsx: 'tsx', vue: 'vue' }

/**
 * A block that imports something is a complete example, which readers copy as it is. Shorter blocks show one call and
 * lean on the text around them, so only complete examples are compiled.
 */
function examplesOf(path: string) {
  const text = readFileSync(path, 'utf8')
  return [
    ...text.matchAll(/^( *)```(\w+)(?:[^\w\n][^\n]*)?\n([\s\S]*?)\n *```$/gm),
  ]
    .filter(([, , lang, code]) => lang! in extensions && /^ *import /m.test(code!))
    // A block inside a list carries the indent of the list on every line
    .map(([, indent, lang, code], index) => ({
      lang: lang!,
      code: code!.replace(new RegExp(`^${indent}`, 'gm'), ''),
      index,
    }))
}

/**
 * What the pages leave to the reader: `upload` and `translations` stand for their own code, `container` for their
 * element, and vue-i18n for their translation library. Templates in Vue reach `upload` through the component.
 */
const globals = `
declare global {
  function upload(blob: Blob, type?: string): Promise<void>
  const translations: Record<string, Partial<import('@paperpic/core').PaperPicLabels>>
  const container: HTMLElement
}
declare module 'vue' {
  interface ComponentCustomProperties {
    upload: typeof upload
  }
}
export {}
`

// Outside a module, so it declares the library instead of adding to it
const libraries = `
declare module 'vue-i18n' {
  export function useI18n(): { locale: import('vue').Ref<string> }
}
`

it('compiles every complete example of the English docs and the agent skills', { timeout: 120_000 }, () => {
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })

  const files: string[] = []
  for (const page of pages) {
    const name = relative(root, page).replace(/[\\/]/g, '_').replace(/\.md$/, '')
    for (const { lang, code, index } of examplesOf(page)) {
      const file = `${name}_${index}.${extensions[lang]}`
      // Each example is a module, so their declarations do not collide
      writeFileSync(join(work, file), lang === 'vue'
        ? code
        : `${code}\nexport {}\n`)
      files.push(file)
    }
  }
  writeFileSync(join(work, 'globals.d.ts'), globals)
  writeFileSync(join(work, 'libraries.d.ts'), libraries)
  writeFileSync(join(work, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      paths: {
        '@paperpic/core': [
          join(packages, 'core/src/index.ts'),
        ],
        '@paperpic/vue': [
          join(packages, 'vue/src/index.ts'),
        ],
        '@paperpic/react': [
          join(packages, 'react/src/index.ts'),
        ],
        'react': [
          join(packages, 'react/node_modules/@types/react'),
        ],
        'react/*': [
          join(packages, 'react/node_modules/@types/react/*'),
        ],
      },
    },
    // The core declares the imports of stylesheets and icons
    files: [
      join(packages, 'core/src/env.d.ts'),
      'globals.d.ts',
      'libraries.d.ts',
      ...files,
    ],
  }))

  const vueTsc = createRequire(join(docs, 'package.json')).resolve('vue-tsc/bin/vue-tsc.js')
  let output = ''
  try {
    execFileSync(process.execPath, [
      vueTsc,
      '-p',
      join(work, 'tsconfig.json'),
    ], { encoding: 'utf8', stdio: 'pipe' })
  }
  catch (error) {
    output = (error as { stdout: string }).stdout
  }

  expect(files.length).toBeGreaterThan(30)
  expect(output).toBe('')
})
