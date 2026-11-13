import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pages = fileURLToPath(new URL('../apps/docs/src/en/', import.meta.url))
// The home and the playground show components, and say nothing that the other pages do not
const skipped = new Set(['index.md', 'playground.md'].map(name => join(pages, name)))

/**
 * Copies the English docs into `docs` of the output, so the AI tools that read `node_modules` find the docs of the
 * installed version, without the network. Each package ships them, because strict installs hide the core.
 */
export async function copyDocs(outDir: string): Promise<void> {
  await cp(pages, join(outDir, 'docs'), {
    recursive: true,
    filter: source => !skipped.has(source),
  })
}
