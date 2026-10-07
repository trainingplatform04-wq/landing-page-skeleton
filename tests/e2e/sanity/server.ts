/**
 * Local stand-in for the Sanity Content Lake, used by every E2E run (CI and local).
 *
 * The app keeps its real Sanity client and its real GROQ queries; only the API host
 * points here (`fixtureCms.ts`, used by playwright.config.ts and the build-time sitemap
 * of `pnpm build:e2e`). Queries are executed by groq-js, Sanity's own
 * GROQ engine, against the documents of fixtures.ts. E2E is therefore deterministic
 * and never depends on what editors published. Live Sanity is checked by the
 * post-deploy smoke test (tests/e2e/smoke.spec.ts), which doesn't depend on content.
 *
 * It also stands in for the contact form service (`POST /form`, NUXT_PUBLIC_CONTACT_FORM_ACTION):
 * like the real one, it accepts the message and answers JSON.
 *
 * Run by Playwright and tests/e2e/build.ts: `node tests/e2e/sanity/server.ts` (Node strips the types).
 */
import { createServer, type IncomingMessage } from 'node:http'
import { evaluate, parse } from 'groq-js'

import { SANITY_MOCK_PORT } from './fixtureCms.ts'
import { CMS_ERROR_SLUG, documents } from './fixtures.ts'

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

/** `?query=…&$locale="de"` (GET) or `{ query, params }` (POST) → GROQ query and params. */
async function readQuery(request: IncomingMessage, url: URL) {
  if (request.method === 'POST') {
    const body = JSON.parse(await readBody(request))
    return { query: String(body.query), params: body.params ?? {} }
  }
  const params = Object.fromEntries(
    [...url.searchParams]
      .filter(([name]) => name.startsWith('$'))
      .map(([name, value]) => [name.slice(1), JSON.parse(value)]),
  )
  return { query: url.searchParams.get('query') ?? '', params }
}

createServer(async (request, response) => {
  // The browser queries Sanity directly after hydration: allow it like the real API does.
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Content-Type', 'application/json')
  if (request.method === 'OPTIONS') return response.writeHead(204).end()

  const url = new URL(request.url ?? '/', 'http://localhost')
  if (url.pathname === '/health') return response.end('{"ok":true}')
  if (url.pathname === '/form' && request.method === 'POST') {
    await readBody(request)
    return response.end('{"ok":true}')
  }
  if (!url.pathname.includes('/data/query/')) return response.writeHead(404).end('{}')

  try {
    const { query, params } = await readQuery(request, url)
    if (params.slug === CMS_ERROR_SLUG) throw new Error('Simulated CMS failure')
    const value = await evaluate(parse(query, { params }), { dataset: documents(), params })
    response.end(JSON.stringify({ query, result: await value.get(), ms: 0 }))
  } catch (error) {
    response.writeHead(400).end(JSON.stringify({ error: String(error) }))
  }
}).listen(SANITY_MOCK_PORT, '127.0.0.1')
