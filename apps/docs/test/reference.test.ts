import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const reference = fileURLToPath(new URL('../src/en/reference/', import.meta.url))
const core = fileURLToPath(new URL('../../../packages/core/src/', import.meta.url))

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

/** The members of an exported interface or class, as the public API declares them. */
function membersOf(name: string) {
  const symbol = exports.find(candidate => candidate.name === name)!
  const declared = symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol
  return checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(declared))
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

  it.each([
    ['state', 'PaperPicState'],
    ['labels', 'PaperPicLabels'],
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
