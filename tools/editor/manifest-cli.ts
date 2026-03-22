/**
 * EaROS Manifest CLI — Node.js only (not bundled by Vite).
 *
 * Usage (via bin.js):
 *   node bin.js manifest              # regenerate
 *   node bin.js manifest add <file>   # add entry
 *   node bin.js manifest check        # verify consistency
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

interface ManifestEntry {
  path: string
  rubric_id?: string
  title?: string
  artifact_type?: string
  status?: string
}

interface ManifestData {
  kind: 'manifest'
  version: string
  generated: string
  core?: ManifestEntry[]
  profiles?: ManifestEntry[]
  overlays?: ManifestEntry[]
  [key: string]: unknown
}

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dir, '../..')
const MANIFEST_PATH = resolve(REPO_ROOT, 'earos.manifest.yaml')

const SCAN_DIRS: Record<string, string> = {
  core: 'core',
  profiles: 'profiles',
  overlays: 'overlays',
}

function readYaml(absPath: string): Record<string, unknown> | null {
  try {
    return yaml.load(readFileSync(absPath, 'utf8')) as Record<string, unknown>
  } catch {
    return null
  }
}

function scanDir(dir: string): ManifestEntry[] {
  const absDir = resolve(REPO_ROOT, dir)
  if (!existsSync(absDir)) return []
  return readdirSync(absDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => {
      const data = readYaml(resolve(absDir, f))
      if (!data) return null
      return {
        path: `${dir}/${f}`,
        rubric_id: (data.rubric_id as string) ?? undefined,
        title: (data.title as string) ?? undefined,
        artifact_type: (data.artifact_type as string) ?? undefined,
        status: (data.status as string) ?? undefined,
      }
    })
    .filter(Boolean) as ManifestEntry[]
}

function buildManifest(): ManifestData {
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

function writeManifest(manifest: ManifestData): void {
  writeFileSync(MANIFEST_PATH, yaml.dump(manifest, { lineWidth: 120 }), 'utf8')
}

function loadManifest(): ManifestData | null {
  if (!existsSync(MANIFEST_PATH)) return null
  return readYaml(MANIFEST_PATH) as unknown as ManifestData | null
}

// ─── CLI dispatch ─────────────────────────────────────────────────────────────

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
    console.error('Usage: manifest add <path/to/file.yaml>')
    process.exit(1)
  }
  const manifest = loadManifest()
  if (!manifest) {
    console.error('No earos.manifest.yaml found. Run `manifest` first.')
    process.exit(1)
  }
  const absPath = resolve(REPO_ROOT, filePath)
  const data = readYaml(absPath)
  if (!data) {
    console.error(`Cannot read or parse: ${filePath}`)
    process.exit(1)
  }
  const entry: ManifestEntry = {
    path: filePath,
    rubric_id: data.rubric_id as string | undefined,
    title: data.title as string | undefined,
    artifact_type: data.artifact_type as string | undefined,
    status: data.status as string | undefined,
  }
  const kind = data.kind as string
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
    console.error('No earos.manifest.yaml found. Run `manifest` first.')
    process.exit(1)
  }
  const errors: string[] = []
  const warnings: string[] = []

  const allEntries: ManifestEntry[] = [
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
      const sectionData = (manifest as Record<string, unknown>)[section] as ManifestEntry[] | undefined
      if (!sectionData?.some((e) => e.path === relPath)) {
        errors.push(`NOT IN MANIFEST: ${relPath}`)
      }
    }
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

console.error(`Unknown manifest subcommand: ${subCmd}`)
console.error('Usage: manifest [generate|add <file>|check]')
process.exit(1)
