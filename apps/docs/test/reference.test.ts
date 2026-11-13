import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { translations } from '../.vitepress/config/locales'

const src = fileURLToPath(new URL('../src/', import.meta.url))
const reference = `${src}en/reference/`
const packages = fileURLToPath(new URL('../../../packages/', import.meta.url))
const core = `${packages}core/src/`

const program = ts.createProgram([`${core}index.ts`], {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
})
const checker = program.getTypeChecker()
const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(`${core}index.ts`)!)!)

/** What an export of `index.ts` stands for, past its `export { … } from` alias. */
function declaredOf(symbol: ts.Symbol) {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol
}

/** The members of an exported interface or class, as the public API declares them. */
function membersOf(name: string) {
  const symbol = exports.find(candidate => candidate.name === name)!
  return checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(declaredOf(symbol)))
}

type TypeDeclaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration

function isTypeDeclaration(node: ts.Node): node is TypeDeclaration {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)
}

/** The exported interfaces and type aliases, by name. The class `PaperPic` has its own page, Methods. */
const types = new Map(exports.flatMap((symbol) => {
  const declaration = declaredOf(symbol).declarations?.[0]
  return declaration && isTypeDeclaration(declaration)
    ? [
        [symbol.name, declaration] as const,
      ]
    : []
}))

/** The interfaces and type aliases that the `types.ts` of a wrapper declares, by name. */
function wrapperTypesOf(name: string) {
  const path = `${packages}${name}/src/types.ts`
  return new Map(ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
    .statements
    .filter(isTypeDeclaration)
    .map(declaration => [declaration.name.text, declaration] as const))
}

const vueTypes = wrapperTypesOf('vue')
const reactTypes = wrapperTypesOf('react')

/** The types that the Types page declares: the ones of the core, then the ones of the components, as React has them. */
const pageTypes = new Map<string, TypeDeclaration>([
  ...types,
  [
    'PaperPicInstance',
    reactTypes.get('PaperPicInstance')!,
  ],
  [
    'PaperPicProps',
    reactTypes.get('PaperPicProps')!,
  ],
])

const printer = ts.createPrinter({ removeComments: true })

/** A declaration as text, without its comments, its `export` or its formatting, so two copies compare equal. */
function printed(declaration: ts.Node) {
  return printer.printNode(ts.EmitHint.Unspecified, declaration, declaration.getSourceFile()).replace(/^export /, '')
}

/** The members of an interface as text, in alphabetical order. */
function printedMembers(declaration: TypeDeclaration) {
  return ts.isInterfaceDeclaration(declaration)
    ? declaration.members.map(printed).sort()
    : []
}

/** What the first `ts` block under each heading written as code declares, such as `` ### `ToolId` ``. */
function blocksOf(path: string) {
  const blocks = new Map<string, string>()
  for (const section of readFileSync(path, 'utf8').split(/^(?=#{2,3} )/m)) {
    const name = /^#{2,3} `([^`]+)`/.exec(section)?.[1]
    const code = /^```ts\n([\s\S]*?)\n```$/m.exec(section)?.[1]
    if (!name || !code) {
      continue
    }
    const declaration = ts.createSourceFile(`${name}.ts`, code, ts.ScriptTarget.Latest, true)
      .statements
      .find((statement): statement is TypeDeclaration => isTypeDeclaration(statement) && statement.name.text === name)
    blocks.set(name, declaration
      ? printed(declaration)
      : code)
  }
  return blocks
}

/** The names that a wrapper exports from `@paperpic/core`. */
function reexportsOf(name: string) {
  const path = `${packages}${name}/src/index.ts`
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest)
    .statements
    .filter(ts.isExportDeclaration)
    .filter(statement => statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === '@paperpic/core')
    .flatMap(statement => statement.exportClause && ts.isNamedExports(statement.exportClause)
      ? statement.exportClause.elements.map(element => element.name.text)
      : [])
    .sort()
}

function namesOf(name: string) {
  return membersOf(name).map(member => member.name).sort()
}

const methods = membersOf('PaperPic')
  .filter(member => member.flags & ts.SymbolFlags.Method)
  .filter(member => !(ts.getCombinedModifierFlags(member.valueDeclaration!) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)))
  .map(member => member.name)
  .sort()

function pageOf(name: string) {
  return readFileSync(`${reference}${name}.md`, 'utf8')
}

/** The names in headings written as code, such as `` ### `zoomTo()` ``, without the parentheses. */
function codeHeadingsOf(page: string) {
  return [
    ...pageOf(page).matchAll(/^#{2,3} `([^`]+)`/gm),
  ]
    .map(([, name]) => name!.replace(/\(\)$/, ''))
    .sort()
}

function codeSpansOf(page: string) {
  // Code blocks would pair their fences with the backticks of the spans
  const text = pageOf(page).replace(/^```.*\n[\s\S]*?\n```$/gm, '')
  return new Set([
    ...text.matchAll(/`([^`]+)`/g),
  ].map(([, code]) => code))
}

describe('the English reference', () => {
  it('has one heading for each option', () => {
    expect(codeHeadingsOf('options')).toEqual(namesOf('PaperPicOptions'))
  })

  it('has one heading for each public method, besides the constructor', () => {
    expect(codeHeadingsOf('methods').filter(name => name !== 'new PaperPic')).toEqual(methods)
  })

  it('has one heading for each event', () => {
    expect(codeHeadingsOf('events')).toEqual(namesOf('PaperPicEvents'))
  })

  it('has one heading for each exported type', () => {
    expect(codeHeadingsOf('types')).toEqual([
      ...pageTypes.keys(),
    ].sort())
  })

  it.each([
    ['state', 'PaperPicState'],
    ['labels', 'PaperPicLabels'],
    ['options', 'PaperPicIcons'],
  ])('names every member of the type in %s', (page, type) => {
    const spans = codeSpansOf(page)
    expect(namesOf(type).filter(name => !spans.has(name))).toEqual([])
  })

  it('names every CSS token', () => {
    const tokens = new Set([
      ...readFileSync(`${core}styles/tokens.css`, 'utf8').matchAll(/(--paperpic-[\w-]+):/g),
    ].map(([, token]) => token!))
    const spans = codeSpansOf('css-tokens')
    expect([...tokens].filter(token => !spans.has(token))).toEqual([])
  })
})

describe('the types page', () => {
  const expected = Object.fromEntries([...pageTypes].map(([name, declaration]) => [
    name,
    printed(declaration),
  ]))
  // English lives in `en` and is served at the root
  const locales = Object.keys(translations).map(key => key === 'root'
    ? 'en'
    : key)

  it.each(locales)('declares each type as the code does, in %s', (locale) => {
    expect(Object.fromEntries(blocksOf(`${src}${locale}/reference/types.md`))).toEqual(expected)
  })

  it.each(['vue', 'react'])('is right that @paperpic/%s exports every type of the core', (name) => {
    expect(reexportsOf(name)).toEqual([
      ...types.keys(),
    ].sort())
  })

  it('is right that PaperPicInstance is the same in Vue and React', () => {
    expect(printed(vueTypes.get('PaperPicInstance')!)).toBe(printed(reactTypes.get('PaperPicInstance')!))
  })

  it('is right that the props of Vue have the fields of PaperPicOptions', () => {
    expect(printedMembers(vueTypes.get('PaperPicProps')!)).toEqual(printedMembers(types.get('PaperPicOptions')!))
  })
})
