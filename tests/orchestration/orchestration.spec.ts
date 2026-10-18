import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the AI orchestration and the docs against drift: personas and their Antigravity
 * pointers stay in sync, every path a doc names exists, and every persona and workflow obeys the
 * operating model. Design briefs and changesets are records of the past: not checked.
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
const HISTORY = /^docs\/design\/(briefs|changes)\//
const ORCHESTRATION_DOCS = [
  'CLAUDE.md',
  'README.md',
  ...markdownFiles('.ai'),
  ...markdownFiles('.agents'),
  ...markdownFiles('.claude'),
  ...markdownFiles('docs'),
]
  .map((path) => path.replaceAll('\\', '/'))
  .filter((path) => !HISTORY.test(path))

/** Backticked repo paths (no placeholders like `<name>`, `[feature]`, globs or variables). */
const PATH_ROOTS =
  /^(\.ai|\.agents|\.claude|\.github|docs|constants|composables|components|utils|types|tests|studio|pages|layouts|plugins|modules|assets|i18n)\//
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

/**
 * The environments are Production, Development and Feature (docs/deployment/DEPLOYMENT.md § 0.1).
 * Their old names (the pre-production name, the shared `-dev` alias) come back in no tracked text file.
 */
const LEGACY_ENVIRONMENT_NAMES = /staging|`-dev`|-dev\.vercel\.app|deploy[ -]dev\b/i
const TEXT_FILES = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter((path) => /\.(md|ts|vue|ya?ml|json|mjs|example)$|^\.env/.test(path))
  // The lockfile is generated; this file holds the pattern itself.
  .filter((path) => !['pnpm-lock.yaml', 'tests/orchestration/orchestration.spec.ts'].includes(path))
  .filter((path) => existsSync(join(ROOT, path)))

describe('environment names', () => {
  it('uses no legacy environment name in any tracked file', () => {
    const legacy = TEXT_FILES.filter((path) => LEGACY_ENVIRONMENT_NAMES.test(read(path)))
    expect(legacy).toEqual([])
  })
})

describe('frontend layer', () => {
  it.each(['server', 'api'])('has no %s/ folder (no server code, CLAUDE.md § 4)', (dir) => {
    expect(existsSync(join(ROOT, dir))).toBe(false)
  })
})
