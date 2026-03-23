/**
 * EAROS Manifest CLI
 *
 * Usage (via bin.js):
 *   earos manifest              # regenerate
 *   earos manifest add <file>   # add entry
 *   earos manifest check [--json]  # verify consistency
 *   earos manifest list [--json]   # list manifest contents
 *
 * EAROS_REPO_ROOT env var is set by bin.js to the detected repo root.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = process.env.EAROS_REPO_ROOT ?? resolve(__dir, '../..')
const MANIFEST_PATH = resolve(REPO_ROOT, 'earos.manifest.yaml')

const SCAN_DIRS = {
  core: 'core',
  profiles: 'profiles',
  overlays: 'overlays',
}

function readYaml(absPath) {
  try {
    return yaml.load(readFileSync(absPath, 'utf8'))
  } catch {
    return null
  }
}

function scanDir(dir) {
  const absDir = resolve(REPO_ROOT, dir)
  if (!existsSync(absDir)) return []
  return readdirSync(absDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => {
      const data = readYaml(resolve(absDir, f))
      if (!data) return null
      return {
        path: `${dir}/${f}`,
        rubric_id: data.rubric_id ?? undefined,
        title: data.title ?? undefined,
        artifact_type: data.artifact_type ?? undefined,
        status: data.status ?? undefined,
      }
    })
    .filter(Boolean)
}

function buildManifest() {
  return {
    kind: 'manifest',
    version: '2.0.0',
    generated: new Date().toISOString().slice(0, 10),
    core: scanDir('core'),
    profiles: scanDir('profiles'),
    overlays: scanDir('overlays'),
    schemas: [
      { path: 'standard/schemas/rubric.schema.json', validates: ['core_rubric', 'profile', 'overlay'] },
      { path: 'standard/schemas/evaluation.schema.json', validates: ['evaluation'] },
    ],
    templates: [
      { path: 'templates/new-profile.template.yaml', purpose: 'scaffold for new profiles' },
      { path: 'templates/evaluation-record.template.yaml', purpose: 'blank evaluation record' },
      { path: 'templates/reference-architecture/Reference_Architecture_Template_v2.docx', purpose: 'author template for reference architectures' },
    ],
    scoring_tools: [
      { path: 'tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx', purpose: 'general-purpose manual scoring (current)' },
      { path: 'tools/scoring-sheets/EAROS_Scoring_Sheet.xlsx', purpose: 'general-purpose manual scoring (legacy)' },
      { path: 'tools/scoring-sheets/EAROS_RefArch_Scoring_Sheet.xlsx', purpose: 'reference architecture scoring' },
    ],
  }
}

function writeManifest(manifest) {
  writeFileSync(MANIFEST_PATH, yaml.dump(manifest, { lineWidth: 120 }), 'utf8')
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return null
  return readYaml(MANIFEST_PATH)
}

// ─── CLI dispatch ──────────────────────────────────────────────────────────────

const subArgs = process.argv.slice(2)
const subCmd = subArgs[0]

if (!subCmd || subCmd === 'generate') {
  const manifest = buildManifest()
  writeManifest(manifest)
  const counts = `core:${manifest.core?.length ?? 0} profiles:${manifest.profiles?.length ?? 0} overlays:${manifest.overlays?.length ?? 0}`
  console.log(`✓ earos.manifest.yaml generated (${counts})`)
  process.exit(0)
}

if (subCmd === 'add') {
  const filePath = subArgs[1]
  if (!filePath) {
    console.error('Usage: earos manifest add <path/to/file.yaml>')
    process.exit(1)
  }
  const manifest = loadManifest()
  if (!manifest) {
    console.error('No earos.manifest.yaml found. Run `earos manifest` first.')
    process.exit(1)
  }
  const absPath = resolve(REPO_ROOT, filePath)
  const data = readYaml(absPath)
  if (!data) {
    console.error(`Cannot read or parse: ${filePath}`)
    process.exit(1)
  }
  const entry = {
    path: filePath,
    rubric_id: data.rubric_id,
    title: data.title,
    artifact_type: data.artifact_type,
    status: data.status,
  }
  const kind = data.kind
  if (kind === 'core_rubric') {
    manifest.core = manifest.core ?? []
    const idx = manifest.core.findIndex((e) => e.path === filePath)
    if (idx >= 0) manifest.core[idx] = entry
    else manifest.core.push(entry)
  } else if (kind === 'profile') {
    manifest.profiles = manifest.profiles ?? []
    const idx = manifest.profiles.findIndex((e) => e.path === filePath)
    if (idx >= 0) manifest.profiles[idx] = entry
    else manifest.profiles.push(entry)
  } else if (kind === 'overlay') {
    manifest.overlays = manifest.overlays ?? []
    const idx = manifest.overlays.findIndex((e) => e.path === filePath)
    if (idx >= 0) manifest.overlays[idx] = entry
    else manifest.overlays.push(entry)
  } else {
    console.error(`Unsupported kind: ${kind ?? '(none)'}. Expected core_rubric, profile, or overlay.`)
    process.exit(1)
  }
  manifest.generated = new Date().toISOString().slice(0, 10)
  writeManifest(manifest)
  console.log(`✓ Added ${filePath} (${kind}, ${entry.rubric_id ?? 'no rubric_id'}) to manifest`)
  process.exit(0)
}

if (subCmd === 'check') {
  const manifest = loadManifest()
  if (!manifest) {
    console.error('No earos.manifest.yaml found. Run `earos manifest` first.')
    process.exit(1)
  }
  const jsonMode = subArgs.includes('--json')
  const errors = []
  const warnings = []

  const allEntries = [
    ...(manifest.core ?? []),
    ...(manifest.profiles ?? []),
    ...(manifest.overlays ?? []),
  ]
  for (const entry of allEntries) {
    const absPath = resolve(REPO_ROOT, entry.path)
    if (!existsSync(absPath)) {
      errors.push(`MISSING on disk: ${entry.path}`)
    } else {
      const data = readYaml(absPath)
      if (data?.rubric_id !== entry.rubric_id) {
        warnings.push(`${entry.path}: rubric_id mismatch — manifest: ${entry.rubric_id}, file: ${data?.rubric_id}`)
      }
    }
  }

  for (const [section, dir] of Object.entries(SCAN_DIRS)) {
    const absDir = resolve(REPO_ROOT, dir)
    if (!existsSync(absDir)) continue
    const files = readdirSync(absDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    for (const f of files) {
      const relPath = `${dir}/${f}`
      const sectionData = manifest[section]
      if (!sectionData?.some((e) => e.path === relPath)) {
        errors.push(`NOT IN MANIFEST: ${relPath}`)
      }
    }
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify({ consistent: errors.length === 0, errors, warnings }, null, 2) + '\n')
    process.exit(errors.length > 0 ? 1 : 0)
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ Manifest is consistent with filesystem')
    process.exit(0)
  }
  if (errors.length > 0) {
    console.error(`✗ ${errors.length} error(s):`)
    for (const e of errors) console.error(`  ERROR: ${e}`)
  }
  if (warnings.length > 0) {
    console.warn(`⚠ ${warnings.length} warning(s):`)
    for (const w of warnings) console.warn(`  WARN: ${w}`)
  }
  process.exit(errors.length > 0 ? 1 : 0)
}

if (subCmd === 'list') {
  const manifest = loadManifest()
  if (!manifest) {
    console.error('No earos.manifest.yaml found. Run `earos manifest` first.')
    process.exit(1)
  }
  if (subArgs.includes('--json')) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + '\n')
  } else {
    const sections = ['core', 'profiles', 'overlays']
    for (const section of sections) {
      const entries = manifest[section] ?? []
      if (entries.length === 0) continue
      console.log(`\n${section}:`)
      for (const e of entries) {
        console.log(`  ${e.path}  ${e.rubric_id ?? ''}  ${e.title ?? ''}`)
      }
    }
  }
  process.exit(0)
}

console.error(`Unknown manifest subcommand: ${subCmd}`)
console.error('Usage: earos manifest [generate|add <file>|check|list]')
process.exit(1)
