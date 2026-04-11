#!/usr/bin/env node

// Suppress harmless Node.js v25+ localStorage warning triggered by the docx package
// (it accesses localStorage at import time but doesn't actually need it)
const _origEmitWarning = process.emitWarning
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('--localstorage-file')) return
  _origEmitWarning.call(process, warning, ...args)
}

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
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

async function validateFile(filePath, jsonMode) {
  const absPath = resolve(filePath)
  let content
  try {
    content = readFileSync(absPath, 'utf8')
  } catch {
    if (jsonMode) {
      process.stdout.write(JSON.stringify({ valid: false, file: filePath, errors: [{ path: '(root)', message: `Cannot read file: ${absPath}` }] }) + '\n')
    } else {
      console.error(`Cannot read file: ${absPath}`)
    }
    process.exit(1)
  }

  let data
  try {
    data = yaml.load(content)
  } catch (e) {
    if (jsonMode) {
      process.stdout.write(JSON.stringify({ valid: false, file: filePath, errors: [{ path: '(root)', message: `YAML parse error: ${e.message}` }] }) + '\n')
    } else {
      console.error(`YAML parse error: ${e.message}`)
    }
    process.exit(1)
  }

  const kind = data?.kind
  const schemasDir = findSchemasDir()
  const schemaFile =
    kind === 'evaluation'
      ? resolve(schemasDir, 'evaluation.schema.json')
      : kind === 'artifact'
        ? resolve(schemasDir, 'artifact.schema.json')
        : resolve(schemasDir, 'rubric.schema.json')

  const rawSchema = JSON.parse(readFileSync(schemaFile, 'utf8'))
  // Strip $schema/$id so AJV v8 doesn't try to load the draft-2020 meta-schema
  const { $schema: _s, $id: _i, ...schema } = rawSchema
  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid) {
    if (jsonMode) {
      process.stdout.write(JSON.stringify({ valid: true, file: filePath, kind: kind ?? 'unknown' }) + '\n')
    } else {
      console.log(`✓ ${filePath} is valid (kind: ${kind ?? 'unknown'})`)
    }
    process.exit(0)
  } else {
    const result = {
      valid: false,
      file: filePath,
      kind: kind ?? 'unknown',
      errors: validate.errors.map(err => ({
        path: err.instancePath || '(root)',
        message: err.message
      }))
    }
    if (jsonMode) {
      process.stdout.write(JSON.stringify(result) + '\n')
    } else {
      console.error(`✗ ${filePath} — ${validate.errors.length} error(s):`)
      for (const err of validate.errors) {
        console.error(`  ${err.instancePath || '(root)'} ${err.message}`)
      }
    }
    process.exit(1)
  }
}

// ─── list evaluations helper ────────────────────────────────────────────────

function findEvaluationFiles(baseDir, prefix) {
  const found = []
  if (!existsSync(baseDir)) return found
  try {
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        found.push(...findEvaluationFiles(resolve(baseDir, entry.name), `${prefix}${entry.name}/`))
      } else if (entry.name.endsWith('.evaluation.yaml') || entry.name === 'evaluation.yaml') {
        found.push({ path: `${prefix}${entry.name}`, name: entry.name })
      }
    }
  } catch { /* skip unreadable dirs */ }
  return found
}

// ─── CLI dispatch ──────────────────────────────────────────────────────────────

if (args[0] === '--version' || args[0] === '-v' || args[0] === '-V') {
  const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'))
  console.log(pkg.version)
  process.exit(0)
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log(`earos — EaROS editor and CLI

Usage:
  earos                             Open the editor in your browser
  earos <file.yaml>                 Open the editor with a file pre-loaded
  earos init [dir] [--icons]        Scaffold a new EaROS workspace (default: current dir)
  earos validate <file.yaml> [--json]  Validate any EaROS YAML (exit 0/1)
  earos export <file.yaml> [--format docx|md]  Export YAML as Word or Markdown (default: docx)
  earos list evaluations [--json]   List evaluation files with summary metadata
  earos manifest                    Regenerate earos.manifest.yaml
  earos manifest add <file>         Add a file to the manifest
  earos manifest check [--json]     Verify manifest matches filesystem
  earos manifest list [--json]      List manifest contents
  earos dev                         Start Vite dev server (development only)

  earos --version                  Show version number

  Environment: EAROS_HOST=0.0.0.0 earos   Bind to all interfaces (default: 127.0.0.1)`)
  process.exit(0)
} else if (args[0] === 'export') {
  // Export YAML → Word document or Markdown
  if (!args[1]) {
    console.error('Usage: earos export <file.yaml> [--format docx|md]')
    process.exit(1)
  }
  const formatArg = args.indexOf('--format')
  const format = formatArg >= 0 && args[formatArg + 1] ? args[formatArg + 1] : 'docx'
  const fileArg = args.find((a, i) => i > 0 && a !== '--format' && (i < formatArg || i > formatArg + 1 || formatArg < 0)) ?? args[1]
  const inputPath = resolve(fileArg)
  if (!existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`)
    process.exit(1)
  }
  let exportContent
  try { exportContent = readFileSync(inputPath, 'utf8') } catch (e) {
    console.error(`Cannot read file: ${e.message}`)
    process.exit(1)
  }
  let exportData
  try { exportData = yaml.load(exportContent) } catch (e) {
    console.error(`YAML parse error: ${e.message}`)
    process.exit(1)
  }

  const kind = exportData?.kind

  if (format === 'md') {
    // Markdown export
    const { exportArtifactToMarkdown, exportRubricToMarkdown } = await import('./utils/export-markdown.js')
    let md
    if (kind === 'artifact' || !kind) {
      md = exportArtifactToMarkdown(exportData)
    } else if (kind === 'core_rubric' || kind === 'profile' || kind === 'overlay') {
      md = exportRubricToMarkdown(exportData)
    } else if (kind === 'evaluation') {
      // Evaluation markdown requires assembled dimensions — export as YAML-derived summary
      md = exportRubricToMarkdown(exportData)
    } else {
      console.error(`Unsupported kind for Markdown export: ${kind}`)
      process.exit(1)
    }
    const outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '.md'
    writeFileSync(outputPath, md, 'utf8')
    console.log(`✓ Exported → ${outputPath}`)
  } else {
    // DOCX export — route by kind
    const { exportToDocx, exportRubricToDocx, exportEvaluationToDocx } = await import('./export-docx.js')
    let buf, outputPath
    if (kind === 'artifact' || !kind) {
      outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '.docx'
      console.log('Rendering diagrams and building Word document…')
      buf = await exportToDocx(exportData)
    } else if (kind === 'evaluation') {
      outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '-assessment.docx'
      console.log('Building evaluation Word document…')
      buf = await exportEvaluationToDocx(exportData)
    } else if (kind === 'core_rubric' || kind === 'profile' || kind === 'overlay') {
      outputPath = inputPath.replace(/\.(yaml|yml)$/i, '') + '.docx'
      console.log('Building rubric Word document…')
      buf = await exportRubricToDocx(exportData)
    } else {
      console.error(`Unsupported kind for export: ${kind}`)
      process.exit(1)
    }
    try {
      writeFileSync(outputPath, buf)
      console.log(`✓ Exported → ${outputPath}`)
    } catch (e) {
      console.error(`Export failed: ${e.message}`)
      process.exit(1)
    }
  }
} else if (args[0] === 'list' && args[1] === 'evaluations') {
  // List evaluation files with summary metadata
  const REPO_ROOT = findRepoRoot()
  const jsonMode = args.includes('--json')
  const files = []
  for (const dir of ['examples', 'evaluations']) {
    files.push(...findEvaluationFiles(resolve(REPO_ROOT, dir), `${dir}/`))
  }
  const summaries = files.map(f => {
    const absPath = resolve(REPO_ROOT, f.path)
    try {
      const data = yaml.load(readFileSync(absPath, 'utf8'))
      return {
        path: f.path,
        overall_status: data?.overall_status ?? undefined,
        overall_score: data?.overall_score ?? undefined,
        evaluation_date: data?.evaluation_date ?? undefined,
        title: data?.artifact_ref?.title ?? data?.artifact_id ?? f.name.replace(/\.evaluation\.yaml$|\.yaml$/, ''),
      }
    } catch {
      return { path: f.path, title: f.name }
    }
  })
  if (jsonMode) {
    process.stdout.write(JSON.stringify({ summaries }, null, 2) + '\n')
  } else {
    if (summaries.length === 0) {
      console.log('No evaluation files found in examples/ or evaluations/')
    } else {
      for (const s of summaries) {
        const score = s.overall_score != null ? ` (${s.overall_score.toFixed(2)})` : ''
        const status = s.overall_status ? ` [${s.overall_status}]` : ''
        console.log(`  ${s.path}  ${s.title}${score}${status}`)
      }
    }
  }
  process.exit(0)
} else if (args[0] === 'init') {
  const initArgs = args.slice(1)
  let targetDir = '.'
  let downloadIcons = false

  for (const arg of initArgs) {
    if (arg === '--icons') {
      downloadIcons = true
      continue
    }
    if (arg.startsWith('--')) {
      console.error(`Unknown init option: ${arg}`)
      process.exit(1)
    }
    if (targetDir === '.') {
      targetDir = arg
      continue
    }
    console.error('Usage: earos init [dir] [--icons]')
    process.exit(1)
  }

  const { initWorkspace } = await import('./init.js')
  await initWorkspace(targetDir, { downloadIcons })
} else if (args[0] === 'validate') {
  const valFile = args.find((a, i) => i > 0 && a !== '--json')
  if (!valFile) {
    console.error('Usage: earos validate <file.yaml> [--json]')
    process.exit(1)
  }
  await validateFile(valFile, args.includes('--json'))
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
