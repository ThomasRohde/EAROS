/**
 * EAROS API Vite plugin
 *
 * Adds the following routes to the Vite dev server:
 *   GET  /api/manifest        — returns earos.manifest.yaml as JSON
 *   GET  /api/files           — alias for /api/manifest (sidebar listing)
 *   GET  /api/file/:path      — reads a YAML file from the repo root, returns JSON
 *   POST /api/file/:path      — writes JSON data as YAML to a file in the repo root
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))
// src/ is one level inside tools/editor/; repo root is two levels above tools/editor/
const REPO_ROOT = resolve(__dirname, '../../..')

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function readManifest(): unknown | null {
  const manifestPath = resolve(REPO_ROOT, 'earos.manifest.yaml')
  if (!existsSync(manifestPath)) return null
  return yaml.load(readFileSync(manifestPath, 'utf8'))
}

function safeRepoPath(rawPath: string): string | null {
  const decoded = decodeURIComponent(rawPath)
  const abs = resolve(REPO_ROOT, decoded)
  // Prevent path traversal outside repo root
  if (!abs.startsWith(REPO_ROOT)) return null
  return abs
}

export function earosApiPlugin(): Plugin {
  return {
    name: 'earos-api',
    configureServer(server) {
      server.middlewares.use('/api', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '/'

        // GET /api/manifest  or  GET /api/files
        if ((url === '/manifest' || url === '/files') && req.method === 'GET') {
          const data = readManifest()
          if (!data) {
            sendJson(res, 404, { error: 'earos.manifest.yaml not found — run: node bin.js manifest' })
          } else {
            sendJson(res, 200, data)
          }
          return
        }

        // GET /api/file/:path
        if (url.startsWith('/file/') && req.method === 'GET') {
          const rawPath = url.slice('/file/'.length)
          const absPath = safeRepoPath(rawPath)
          if (!absPath) {
            sendJson(res, 403, { error: 'Path outside repo root' })
            return
          }
          if (!existsSync(absPath)) {
            sendJson(res, 404, { error: `File not found: ${rawPath}` })
            return
          }
          try {
            const content = readFileSync(absPath, 'utf8')
            sendJson(res, 200, yaml.load(content))
          } catch (e) {
            sendJson(res, 500, { error: String(e) })
          }
          return
        }

        // POST /api/file/:path
        if (url.startsWith('/file/') && req.method === 'POST') {
          const rawPath = url.slice('/file/'.length)
          const absPath = safeRepoPath(rawPath)
          if (!absPath) {
            sendJson(res, 403, { error: 'Path outside repo root' })
            return
          }
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
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
          return
        }

        next()
      })
    },
  }
}
