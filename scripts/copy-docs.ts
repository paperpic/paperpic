import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pages = fileURLToPath(new URL('../apps/docs/src/en/', import.meta.url))
const corePackage = fileURLToPath(new URL('../packages/core/package.json', import.meta.url))
// The home and the playground show components, and say nothing that the other pages do not
const skipped = new Set(['index.md', 'playground.md'].map(name => join(pages, name)))

/** Makes the CDN examples pin the version that ships, as the docs site does when it renders them. */
async function pinVersion(file: string): Promise<void> {
  const { version } = JSON.parse(await readFile(corePackage, 'utf8')) as { version: string }
  const pinned = version.split('.').slice(0, 2).join('.')
  const text = await readFile(file, 'utf8')
  await writeFile(file, text.replace(/(@paperpic\/(?:core|vue|react))@\d+\.\d+(?![.\d])/g, `$1@${pinned}`))
}

/**
 * Copies the English docs into `docs` of the output, so the AI tools that read `node_modules` find the docs of the
 * installed version, without the network. Each package ships them, because strict installs hide the core.
 */
export async function copyDocs(outDir: string): Promise<void> {
  const docs = join(outDir, 'docs')
  await cp(pages, docs, {
    recursive: true,
    filter: source => !skipped.has(source),
  })
  await pinVersion(join(docs, 'guide', 'getting-started.md'))
}
