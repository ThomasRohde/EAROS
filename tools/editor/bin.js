#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

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

// ─── CLI dispatch ──────────────────────────────────────────────────────────────

if (args[0] === '--help' || args[0] === '-h') {
  console.log(`earos — EAROS editor and CLI

Usage:
  earos                             Open the editor in your browser
  earos <file.yaml>                 Open the editor with a file pre-loaded
  earos init [dir]                  Scaffold a new EAROS workspace (default: current dir)
  earos validate <file.yaml>        Validate a rubric or evaluation YAML (exit 0/1)
  earos export <file.yaml>          Export artifact YAML as Word document (.docx)
  earos manifest                    Regenerate earos.manifest.yaml
  earos manifest add <file>         Add a file to the manifest
  earos manifest check              Verify manifest matches filesystem
  earos dev                         Start Vite dev server (development only)`)
  process.exit(0)
} else if (args[0] === 'export') {
  // Export artifact YAML → Word document
  if (!args[1]) {
    console.error('Usage: earos export <file.yaml>')
    process.exit(1)
  }
  const inputPath = resolve(args[1])
  if (!existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`)
    process.exit(1)
  }
  let exportContent
  try { exportContent = readFileSync(inputPath, 'utf8') } catch (e) {
    console.error(`Cannot read file: ${e.message}`)
    process.exit(1)
  }
  let artifactData
  try { artifactData = yaml.load(exportContent) } catch (e) {
    console.error(`YAML parse error: ${e.message}`)
    process.exit(1)
  }
  if (artifactData?.kind !== 'artifact') {
    console.error('File does not appear to be an artifact (expected kind: artifact)')
    process.exit(1)
  }
  const { exportToDocx } = await import('./export-docx.js')
  const outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '.docx'
  console.log('Rendering diagrams and building Word document…')
  try {
    const { writeFileSync } = await import('fs')
    const buf = await exportToDocx(artifactData)
    writeFileSync(outputPath, buf)
    console.log(`✓ Exported → ${outputPath}`)
  } catch (e) {
    console.error(`Export failed: ${e.message}`)
    process.exit(1)
  }
} else if (args[0] === 'init') {
  const targetDir = args[1] || '.'
  const { initWorkspace } = await import('./init.js')
  initWorkspace(targetDir)
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
} else if (args[0] === 'dev') {
  // Development only — starts Vite HMR server (requires devDependencies)
  const result = spawnSync('npx', ['vite'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true,
  })
  if (result.error) {
    console.error('Failed to start Vite. Ensure devDependencies are installed: npm install')
    process.exit(1)
  }
  process.exit(result.status ?? 0)
} else {
  // Default: start the standalone Express server
  const { startServer } = await import('./serve.js')
  await startServer(args[0])
}
