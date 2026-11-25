import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const srcDir = fileURLToPath(new URL('../../src/', import.meta.url))

let dates: Map<string, number> | undefined

// One git log reads the last commit of every page. With lastUpdated: true, VitePress runs git log for each page,
// and on Windows once more for the sitemap, because its cache misses paths with backslashes
function readDates() {
  // Each commit prints a NUL and its date, then the files it changed, newest first.
  // core.quotePath=false keeps file names with non-ASCII characters as they are
  const log = execFileSync('git', [
    '-c',
    'core.quotePath=false',
    'log',
    '--format=%x00%at',
    '--name-only',
    '--relative',
    '--',
    '.',
  ], {
    cwd: srcDir,
    encoding: 'utf8',
    // The log grows with the history, and Node.js stops at 1 MB
    maxBuffer: Infinity,
  })
  const result = new Map<string, number>()
  let date = 0

  for (const line of log.split('\n')) {
    if (line.startsWith('\0')) {
      date = Number(line.slice(1)) * 1000
    }
    // The first date of a file is the one of its last commit
    else if (line && !result.has(line)) {
      result.set(line, date)
    }
  }

  return result
}

/** The date of the last commit of a page, from its path in `src`, such as `es/guide/viewer.md`. */
export function pageDate(file: string) {
  dates ??= readDates()

  return dates.get(file)
}

/** The date of the last commit of the page at a sitemap URL, such as `es/guide/viewer`. */
export function sitemapDate(url: string) {
  const file = `${url.replace(/(^|\/)$/, '$1index')}.md`

  // The root locale publishes the pages of en/ without the prefix
  return pageDate(file) ?? pageDate(`en/${file}`)
}
