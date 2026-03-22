/**
 * CLI entry — TypeScript source reference for bin.js
 *
 * Usage (via bin.js, which is the actual executable):
 *   node bin.js [file.yaml]          — starts Vite dev server, opens browser
 *   node bin.js validate file.yaml   — validates file against schema, exits 0/1
 *
 * This file mirrors bin.js with full TypeScript types.
 * The compiled output is NOT used by the bin entry (bin.js is self-contained).
 */

import { createServer } from 'vite'
import open from 'open'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

async function validateFile(filePath: string): Promise<void> {
  const absPath = resolve(filePath)
  const content = readFileSync(absPath, 'utf8')
  const data = yaml.load(content) as Record<string, unknown>

  const kind = data?.kind
  const schemaFile =
    kind === 'evaluation'
      ? resolve(__dirname, '../../../standard/schemas/evaluation.schema.json')
      : resolve(__dirname, '../../../standard/schemas/rubric.schema.json')

  const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))
  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const valid = validate(data) as boolean

  if (valid) {
    console.log(`✓ ${filePath} is valid (kind: ${kind ?? 'unknown'})`)
    process.exit(0)
  } else {
    console.error(`✗ ${filePath} — ${validate.errors!.length} error(s):`)
    for (const err of validate.errors!) {
      console.error(`  ${err.instancePath || '(root)'} ${err.message}`)
    }
    process.exit(1)
  }
}

async function startEditor(fileArg?: string): Promise<void> {
  const port = 3000
  const server = await createServer({
    root: resolve(__dirname, '..'),
    server: { port, open: false },
  })
  await server.listen()
  console.log(`EaROS Editor → http://localhost:${port}`)

  const url = fileArg
    ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
    : `http://localhost:${port}`

  await open(url)
  server.bindCLIShortcuts({ print: true })
}

if (args[0] === 'validate') {
  if (!args[1]) {
    console.error('Usage: earos-editor validate <file.yaml>')
    process.exit(1)
  }
  await validateFile(args[1])
} else {
  await startEditor(args[0])
}
