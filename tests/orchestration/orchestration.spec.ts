import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the AI orchestration (.ai/, .agents/, .claude/, docs) against drift:
 * personas and their Antigravity pointers stay in sync, every path the docs tell
 * agents to use exists, and every persona/workflow obeys the operating model.
 */
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')
const list = (dir: string) => readdirSync(join(ROOT, dir))

function markdownFiles(dir: string): string[] {
  return list(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(join(ROOT, path)).isDirectory()) return markdownFiles(path)
    return path.endsWith('.md') ? [path] : []
  })
}

function frontmatter(path: string): string {
  return read(path).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
}

const PERSONAS = list('.ai/shared/agents')
const WORKFLOWS = list('.ai/shared/workflows')
const ORCHESTRATION_DOCS = [
  'CLAUDE.md',
  ...markdownFiles('.ai'),
  ...markdownFiles('.agents'),
  ...markdownFiles('.claude'),
  ...markdownFiles('docs/conventions'),
  ...markdownFiles('docs/tasks'),
].map((path) => path.replaceAll('\\', '/'))

/** Backticked repo paths (no placeholders like `<name>`, `[feature]`, globs or variables). */
const PATH_ROOTS =
  /^(\.ai|\.agents|\.claude|\.github|docs|constants|composables|components|queries|utils|types|tests|studio|pages|layouts|i18n)\//
function referencedPaths(markdown: string): string[] {
  return [...markdown.matchAll(/`([^`\s]+)`/g)]
    .map(([, token]) => token!.replace(/[#:].*$/, ''))
    .filter((token) => PATH_ROOTS.test(token) && !/[<>[\]*${}]/.test(token))
}

describe('agent personas', () => {
  it.each(PERSONAS)('%s declares name (= file name) and description', (file) => {
    const meta = frontmatter(`.ai/shared/agents/${file}`)
    expect(meta).toMatch(new RegExp(`^name: ${file.replace('.md', '')}$`, 'm'))
    expect(meta).toMatch(/^description: /m)
  })

  it.each(PERSONAS)('%s has an Antigravity pointer with identical frontmatter', (file) => {
    const pointer = `.agents/agents/${file}`
    expect(existsSync(join(ROOT, pointer))).toBe(true)
    expect(frontmatter(pointer)).toBe(frontmatter(`.ai/shared/agents/${file}`))
    expect(read(pointer)).toContain(`.ai/shared/agents/${file}`)
  })

  it('has no orphan pointer', () => {
    expect(list('.agents/agents').sort()).toEqual([...PERSONAS].sort())
  })
})

describe('operating model', () => {
  it.each([
    ...PERSONAS.map((file) => `.ai/shared/agents/${file}`),
    ...WORKFLOWS.filter((file) => file !== 'operating-model.md').map(
      (file) => `.ai/shared/workflows/${file}`,
    ),
  ])('%s defers to the operating model', (path) => {
    expect(read(path)).toContain('operating-model.md')
  })
})

describe('orchestration docs', () => {
  it.each(ORCHESTRATION_DOCS)('%s only references paths that exist', (path) => {
    const missing = referencedPaths(read(path)).filter((ref) => !existsSync(join(ROOT, ref)))
    expect(missing).toEqual([])
  })

  it.each(ORCHESTRATION_DOCS)('%s never points agents at the old tasks/ directory', (path) => {
    expect(read(path)).not.toMatch(/`tasks\//)
  })
})

describe('frontend layer', () => {
  it.each(['server', 'api'])('has no %s/ folder (no server code, CLAUDE.md § 4)', (dir) => {
    expect(existsSync(join(ROOT, dir))).toBe(false)
  })
})
