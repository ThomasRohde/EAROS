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

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { resolve, dirname, join, relative } from 'path'
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

// Keep in sync with tools/editor/src/export-docx.ts and src/utils/schemaLoader.ts.
// Maps canonical artifact_type → filename prefix used by
// <prefix>.artifact.schema.json / <prefix>.artifact.uischema.json.
const ARTIFACT_TYPE_TO_SCHEMA_PREFIX = {
  reference_architecture: 'reference-architecture',
  solution_architecture: 'solution-architecture',
  architecture_decision_record: 'adr',
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

function readJson(absPath) {
  try {
    return JSON.parse(readFileSync(absPath, 'utf8'))
  } catch {
    return null
  }
}

function relPath(absPath) {
  return relative(REPO_ROOT, absPath).replace(/\\/g, '/')
}

function walkDir(absDir, predicate) {
  const results = []
  if (!existsSync(absDir)) return results
  const stack = [absDir]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(abs)
      } else if (entry.isFile() && predicate(entry.name, abs)) {
        results.push(abs)
      }
    }
  }
  return results.sort()
}

function scanSchemas(previousByPath) {
  const schemasDir = resolve(REPO_ROOT, 'standard/schemas')
  if (!existsSync(schemasDir)) return []
  const files = readdirSync(schemasDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
  const entries = []
  for (const name of files) {
    const path = `standard/schemas/${name}`
    const prior = previousByPath.get(path) ?? {}
    if (name === 'rubric.schema.json') {
      entries.push({ path, validates: ['core_rubric', 'profile', 'overlay'] })
      continue
    }
    if (name === 'evaluation.schema.json') {
      entries.push({ path, validates: ['evaluation'] })
      continue
    }
    // <prefix>.artifact.schema.json — data schema
    const dataMatch = name.match(/^(.+)\.artifact\.schema\.json$/)
    if (dataMatch) {
      const schema = readJson(resolve(schemasDir, name))
      const constType = schema?.properties?.artifact_type?.const
      const enumType = Array.isArray(schema?.properties?.artifact_type?.enum)
        ? schema.properties.artifact_type.enum[0]
        : undefined
      const artifact_type = typeof constType === 'string' ? constType : enumType
      entries.push({
        path,
        validates: ['artifact'],
        artifact_type: artifact_type ?? prior.artifact_type,
      })
      continue
    }
    // <prefix>.artifact.uischema.json — UI schema
    const uiMatch = name.match(/^(.+)\.artifact\.uischema\.json$/)
    if (uiMatch) {
      const prefix = uiMatch[1]
      const artifact_type =
        Object.entries(ARTIFACT_TYPE_TO_SCHEMA_PREFIX).find(([, p]) => p === prefix)?.[0] ??
        prior.artifact_type
      const entry = {
        path,
        purpose: prior.purpose ?? `JSON Forms UI schema for the ${prefix.replace(/-/g, ' ')} editor`,
      }
      if (artifact_type) entry.artifact_type = artifact_type
      entries.push(entry)
      continue
    }
    // Unknown schema — keep a bare entry so it's discoverable
    entries.push({ path, ...(prior.purpose ? { purpose: prior.purpose } : {}) })
  }
  return entries
}

function isCanonicalArtifactType(value) {
  return typeof value === 'string' && value in ARTIFACT_TYPE_TO_SCHEMA_PREFIX
}

function scanTemplates(previousByPath) {
  const templatesDir = resolve(REPO_ROOT, 'templates')
  const absFiles = walkDir(templatesDir, (name) => {
    return name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.docx')
  })
  return absFiles.map((abs) => {
    const path = relPath(abs)
    const prior = previousByPath.get(path) ?? {}
    // Only emit artifact_type for concrete templates; scaffolds use placeholders
    // like `[artifact_type]` that should not leak into the manifest.
    let artifact_type = isCanonicalArtifactType(prior.artifact_type) ? prior.artifact_type : undefined
    if (!artifact_type && (path.endsWith('.yaml') || path.endsWith('.yml'))) {
      const data = readYaml(abs)
      if (isCanonicalArtifactType(data?.artifact_type)) artifact_type = data.artifact_type
    }
    const entry = {
      path,
      purpose: prior.purpose ?? defaultTemplatePurpose(path),
    }
    if (artifact_type) entry.artifact_type = artifact_type
    return entry
  })
}

function defaultTemplatePurpose(path) {
  if (path.endsWith('new-profile.template.yaml')) return 'scaffold for new profiles'
  if (path.endsWith('evaluation-record.template.yaml')) return 'blank evaluation record'
  if (path.endsWith('.docx')) return 'authoring template (Word)'
  if (/\/artifact\.template\.yaml$/.test(path)) return 'blank YAML artifact template'
  return 'template'
}

function scanExamples(previousByPath) {
  const examplesDir = resolve(REPO_ROOT, 'examples')
  const absFiles = walkDir(examplesDir, (name) => {
    return name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.md')
  })
  const entries = []
  for (const abs of absFiles) {
    const path = relPath(abs)
    const prior = previousByPath.get(path) ?? {}
    if (path.endsWith('.md')) {
      // Reports — preserve any existing metadata but always emit the entry
      entries.push({
        path,
        kind: prior.kind ?? 'report',
        ...(prior.artifact_type ? { artifact_type: prior.artifact_type } : {}),
        ...(prior.description ? { description: prior.description } : {}),
      })
      continue
    }
    const data = readYaml(abs) ?? {}
    const kind = data.kind ?? prior.kind ?? (path.endsWith('.evaluation.yaml') ? 'evaluation' : 'artifact')
    const entry = {
      path,
      kind,
    }
    const artifact_type = data.artifact_type ?? prior.artifact_type
    if (artifact_type) entry.artifact_type = artifact_type
    // Prefer the manually-curated rubric_id from the existing manifest — eval
    // files may cite a sub-rubric (e.g. the core meta-rubric) while the
    // semantic owner is the profile the eval targets.
    const rubric_id = prior.rubric_id ?? data.rubric_id ?? data.primary_rubric_id
    if (rubric_id) entry.rubric_id = rubric_id
    if (prior.description) entry.description = prior.description
    const status = data.status ?? prior.status
    if (status) entry.status = status
    const overall_score = data.overall_score ?? prior.overall_score
    if (overall_score !== undefined) entry.overall_score = overall_score
    const overall_status = data.overall_status ?? prior.overall_status
    if (overall_status) entry.overall_status = overall_status
    entries.push(entry)
  }
  return entries
}

function scanScoringTools(previousByPath) {
  const dir = resolve(REPO_ROOT, 'tools/scoring-sheets')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => /\.(xlsx|xlsm|ods)$/i.test(f))
    .sort()
    .map((f) => {
      const path = `tools/scoring-sheets/${f}`
      const prior = previousByPath.get(path) ?? {}
      return { path, purpose: prior.purpose ?? 'manual scoring sheet' }
    })
}

function indexByPath(...sections) {
  const map = new Map()
  for (const section of sections) {
    if (!Array.isArray(section)) continue
    for (const entry of section) {
      if (entry?.path) map.set(entry.path, entry)
    }
  }
  return map
}

function buildManifest() {
  const existing = loadManifest() ?? {}
  const previousByPath = indexByPath(
    existing.schemas,
    existing.templates,
    existing.examples,
    existing.scoring_tools,
  )
  return {
    kind: 'manifest',
    version: existing.version ?? '2.0.0',
    generated: new Date().toISOString().slice(0, 10),
    core: scanDir('core'),
    profiles: scanDir('profiles'),
    overlays: scanDir('overlays'),
    schemas: scanSchemas(previousByPath),
    templates: scanTemplates(previousByPath),
    examples: scanExamples(previousByPath),
    scoring_tools: scanScoringTools(previousByPath),
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
  const counts = [
    `core:${manifest.core?.length ?? 0}`,
    `profiles:${manifest.profiles?.length ?? 0}`,
    `overlays:${manifest.overlays?.length ?? 0}`,
    `schemas:${manifest.schemas?.length ?? 0}`,
    `templates:${manifest.templates?.length ?? 0}`,
    `examples:${manifest.examples?.length ?? 0}`,
  ].join(' ')
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
      const relativePath = `${dir}/${f}`
      const sectionData = manifest[section]
      if (!sectionData?.some((e) => e.path === relativePath)) {
        errors.push(`NOT IN MANIFEST: ${relativePath}`)
      }
    }
  }

  // Schemas, templates, examples drift — both directions.
  const driftSections = [
    { name: 'schemas', entries: manifest.schemas ?? [], expected: scanSchemas(new Map()) },
    { name: 'templates', entries: manifest.templates ?? [], expected: scanTemplates(new Map()) },
    { name: 'examples', entries: manifest.examples ?? [], expected: scanExamples(new Map()) },
  ]
  for (const { name, entries, expected } of driftSections) {
    const manifestPaths = new Set(entries.map((e) => e.path))
    const expectedPaths = new Set(expected.map((e) => e.path))
    for (const p of expectedPaths) {
      if (!manifestPaths.has(p)) {
        errors.push(`NOT IN MANIFEST (${name}): ${p}`)
      }
    }
    for (const e of entries) {
      if (!existsSync(resolve(REPO_ROOT, e.path))) {
        errors.push(`MISSING on disk (${name}): ${e.path}`)
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
