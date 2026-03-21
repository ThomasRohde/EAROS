/**
 * EAROS standalone Express server.
 * Serves the pre-built React app from dist/ and provides the API endpoints.
 */

import express from 'express'
import { createServer } from 'http'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { AddressInfo } from 'net'
import type { RequestHandler } from 'express'
import yaml from 'js-yaml'
import open from 'open'
import { exportToDocx } from './export-docx.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function findRepoRoot(): string {
  const cwd = process.cwd()
  if (existsSync(resolve(cwd, 'earos.manifest.yaml'))) return cwd
  // Dev fallback: two levels above tools/editor/
  const devRoot = resolve(__dirname, '../..')
  if (existsSync(resolve(devRoot, 'earos.manifest.yaml'))) return devRoot
  return cwd
}

function safeRepoPath(repoRoot: string, rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(repoRoot, decoded)
  if (!abs.startsWith(repoRoot)) return null
  return abs
}

function findAvailablePort(preferred: number): Promise<number> {
  return new Promise((resolvePort) => {
    const probe = createServer()
    probe.listen(preferred, () => {
      const port = (probe.address() as AddressInfo).port
      probe.close(() => resolvePort(port))
    })
    probe.on('error', () => {
      // Port in use — let OS assign a random one
      const fallback = createServer()
      fallback.listen(0, () => {
        const port = (fallback.address() as AddressInfo).port
        fallback.close(() => resolvePort(port))
      })
    })
  })
}

export async function startServer(fileArg?: string): Promise<void> {
  const REPO_ROOT = findRepoRoot()
  const distDir = resolve(__dirname, 'dist')

  if (!existsSync(distDir)) {
    console.error('dist/ not found. Run: npm run build')
    process.exit(1)
  }

  const app = express()
  app.use(express.json({ limit: '25mb' }))

  // GET /api/manifest  or  GET /api/files
  const manifestHandler: RequestHandler = (_req, res) => {
    const manifestPath = resolve(REPO_ROOT, 'earos.manifest.yaml')
    if (!existsSync(manifestPath)) {
      res.status(404).json({ error: 'earos.manifest.yaml not found — run: earos manifest' })
    } else {
      res.json(yaml.load(readFileSync(manifestPath, 'utf8')))
    }
  }
  app.get('/api/manifest', manifestHandler)
  app.get('/api/files', manifestHandler)

  // GET /api/evaluations
  app.get('/api/evaluations', (_req, res) => {
    const files: Array<{ path: string; name: string }> = []
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
    res.json({ files })
  })

  // GET /api/file/:path  (path may contain slashes)
  app.get('/api/file/*', (req, res) => {
    const rawPath = (req.params as Record<string, string>)[0]
    const absPath = safeRepoPath(REPO_ROOT, rawPath)
    if (!absPath) { res.status(403).json({ error: 'Path outside repo root' }); return }
    if (!existsSync(absPath)) { res.status(404).json({ error: `File not found: ${rawPath}` }); return }
    try {
      res.json(yaml.load(readFileSync(absPath, 'utf8')))
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })

  // POST /api/file/:path
  app.post('/api/file/*', (req, res) => {
    const rawPath = (req.params as Record<string, string>)[0]
    const absPath = safeRepoPath(REPO_ROOT, rawPath)
    if (!absPath) { res.status(403).json({ error: 'Path outside repo root' }); return }
    try {
      const content = yaml.dump(req.body, { lineWidth: 120, noRefs: true })
      writeFileSync(absPath, content, 'utf8')
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })

  // POST /api/export/docx  — generate a Word document from artifact JSON
  app.post('/api/export/docx', async (req, res) => {
    try {
      const payload = req.body as Record<string, any> | null
      const artifactData = payload?.artifactData ?? payload
      const renderedDiagrams =
        payload?.artifactData && payload.renderedDiagrams && typeof payload.renderedDiagrams === 'object'
          ? payload.renderedDiagrams
          : undefined

      if (!artifactData || typeof artifactData !== 'object') {
        res.status(400).json({ error: 'Request body must be artifact JSON' })
        return
      }
      const buf = await exportToDocx(artifactData, renderedDiagrams)
      const title: string =
        (artifactData as any)?.metadata?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'artifact'
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`)
      res.send(buf)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (message.startsWith('Missing browser-rendered diagrams for export:')) {
        res.status(400).json({ error: message })
        return
      }
      res.status(500).json({ error: message })
    }
  })

  // Unknown API routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Unknown API route' })
  })

  // Workspace icon assets
  app.use('/icons', express.static(resolve(REPO_ROOT, 'icons')))

  // Static files — served after API routes
  app.use(express.static(distDir))

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(resolve(distDir, 'index.html'))
  })

  const port = await findAvailablePort(process.env.PORT ? parseInt(process.env.PORT, 10) : 3000)

  app.listen(port, () => {
    const url = fileArg
      ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
      : `http://localhost:${port}`
    console.log(`EAROS Editor → ${url}`)
    open(url)
  })
}
