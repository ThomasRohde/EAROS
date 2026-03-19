#!/usr/bin/env node
import { createServer } from 'http'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import open from 'open'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

/** Find the EAROS repo root: cwd if it has earos.manifest.yaml, else dev fallback. */
function findRepoRoot() {
  const cwd = process.cwd()
  if (existsSync(resolve(cwd, 'earos.manifest.yaml'))) return cwd
  const devRoot = resolve(__dirname, '../..')
  if (existsSync(resolve(devRoot, 'earos.manifest.yaml'))) return devRoot
  return cwd
}

/** Find schemas dir: bundled with package first, then repo fallback. */
function findSchemasDir() {
  const bundled = resolve(__dirname, 'schemas')
  if (existsSync(bundled)) return bundled
  return resolve(__dirname, '../../standard/schemas')
}

// ─── validate command ─────────────────────────────────────────────────────────

async function validateFile(filePath) {
  const absPath = resolve(filePath)
  let content
  try {
    content = readFileSync(absPath, 'utf8')
  } catch {
    console.error(`Cannot read file: ${absPath}`)
    process.exit(1)
  }

  let data
  try {
    data = yaml.load(content)
  } catch (e) {
    console.error(`YAML parse error: ${e.message}`)
    process.exit(1)
  }

  const kind = data?.kind
  const schemasDir = findSchemasDir()
  const schemaFile =
    kind === 'evaluation'
      ? resolve(schemasDir, 'evaluation.schema.json')
      : resolve(schemasDir, 'rubric.schema.json')

  const rawSchema = JSON.parse(readFileSync(schemaFile, 'utf8'))
  // Strip $schema/$id so AJV v8 doesn't try to load the draft-2020 meta-schema
  const { $schema: _s, $id: _i, ...schema } = rawSchema
  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid) {
    console.log(`✓ ${filePath} is valid (kind: ${kind ?? 'unknown'})`)
    process.exit(0)
  } else {
    console.error(`✗ ${filePath} — ${validate.errors.length} error(s):`)
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || '(root)'} ${err.message}`)
    }
    process.exit(1)
  }
}

// ─── editor HTTP server ────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

/** Handle /api/* routes. Returns true if handled. */
function handleApi(apiPath, method, req, res) {
  const REPO_ROOT = findRepoRoot()

  function safeRepoPath(rawPath) {
    const decoded = decodeURIComponent(rawPath)
    const abs = resolve(REPO_ROOT, decoded)
    if (!abs.startsWith(REPO_ROOT)) return null
    return abs
  }

  // GET /api/manifest  or  /api/files
  if ((apiPath === '/manifest' || apiPath === '/files') && method === 'GET') {
    const manifestPath = resolve(REPO_ROOT, 'earos.manifest.yaml')
    if (!existsSync(manifestPath)) {
      sendJson(res, 404, { error: 'earos.manifest.yaml not found — run: earos manifest' })
    } else {
      sendJson(res, 200, yaml.load(readFileSync(manifestPath, 'utf8')))
    }
    return true
  }

  // GET /api/evaluations
  if (apiPath === '/evaluations' && method === 'GET') {
    const files = []
    for (const dir of ['examples', 'evaluations']) {
      const dirPath = resolve(REPO_ROOT, dir)
      if (existsSync(dirPath)) {
        try {
          for (const entry of readdirSync(dirPath)) {
            if (entry.endsWith('.evaluation.yaml')) {
              files.push({ path: `${dir}/${entry}`, name: entry })
            }
          }
        } catch { /* skip unreadable dirs */ }
      }
    }
    sendJson(res, 200, { files })
    return true
  }

  // GET /api/file/:path
  if (apiPath.startsWith('/file/') && method === 'GET') {
    const rawPath = apiPath.slice('/file/'.length)
    const absPath = safeRepoPath(rawPath)
    if (!absPath) { sendJson(res, 403, { error: 'Path outside repo root' }); return true }
    if (!existsSync(absPath)) { sendJson(res, 404, { error: `File not found: ${rawPath}` }); return true }
    try {
      sendJson(res, 200, yaml.load(readFileSync(absPath, 'utf8')))
    } catch (e) {
      sendJson(res, 500, { error: String(e) })
    }
    return true
  }

  // POST /api/file/:path
  if (apiPath.startsWith('/file/') && method === 'POST') {
    const rawPath = apiPath.slice('/file/'.length)
    const absPath = safeRepoPath(rawPath)
    if (!absPath) { sendJson(res, 403, { error: 'Path outside repo root' }); return true }
    let body = ''
    req.on('data', (chunk) => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const content = yaml.dump(data, { lineWidth: 120, noRefs: true })
        writeFileSync(absPath, content, 'utf8')
        sendJson(res, 200, { ok: true })
      } catch (e) {
        sendJson(res, 500, { error: String(e) })
      }
    })
    return true
  }

  return false
}

async function startEditor(fileArg) {
  const port = 3747
  const distDir = resolve(__dirname, 'dist')

  if (!existsSync(distDir)) {
    console.error('dist/ not found. Run: npm run build')
    process.exit(1)
  }

  const server = createServer((req, res) => {
    const urlPath = (req.url ?? '/').split('?')[0]
    const method = req.method ?? 'GET'

    // API routes
    if (urlPath.startsWith('/api/')) {
      if (!handleApi(urlPath.slice(4), method, req, res)) {
        sendJson(res, 404, { error: 'Unknown API route' })
      }
      return
    }

    // Static files
    let filePath = resolve(distDir, urlPath === '/' ? 'index.html' : urlPath.slice(1))
    if (!existsSync(filePath)) {
      filePath = resolve(distDir, 'index.html') // SPA fallback
    }
    try {
      const mime = MIME[extname(filePath)] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      res.end(readFileSync(filePath))
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
  })

  server.listen(port, () => {
    const url = fileArg
      ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
      : `http://localhost:${port}`
    console.log(`EAROS Editor → ${url}`)
    open(url)
  })
}

// ─── CLI dispatch ──────────────────────────────────────────────────────────────

if (args[0] === '--help' || args[0] === '-h') {
  console.log(`earos — EAROS editor and CLI

Usage:
  earos                        Open the editor in your browser
  earos <file.yaml>            Open the editor with a file pre-loaded
  earos validate <file.yaml>   Validate a rubric or evaluation YAML (exit 0/1)
  earos manifest               Regenerate earos.manifest.yaml
  earos manifest add <file>    Add a file to the manifest
  earos manifest check         Verify manifest matches filesystem`)
  process.exit(0)
} else if (args[0] === 'validate') {
  if (!args[1]) {
    console.error('Usage: earos validate <file.yaml>')
    process.exit(1)
  }
  await validateFile(args[1])
} else if (args[0] === 'manifest') {
  const manifestCli = resolve(__dirname, 'manifest-cli.mjs')
  const result = spawnSync(process.execPath, [manifestCli, ...args.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, EAROS_REPO_ROOT: findRepoRoot() },
  })
  if (result.error) {
    console.error('Failed to run manifest CLI:', result.error.message)
    process.exit(1)
  }
  process.exit(result.status ?? 0)
} else {
  await startEditor(args[0])
}
