import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative, resolve, dirname, basename, sep } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { createInterface } from 'readline/promises'
import { stdin as input, stdout as output } from 'process'
import JSZip from 'jszip'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitWorkspaceOptions {
  downloadIcons?: boolean
}

export interface UpdateWorkspaceOptions {
  dryRun?: boolean
  keepMine?: boolean
  overwrite?: boolean
  only?: string
}

type FileClassification =
  | { kind: 'add'; rel: string; src: string; dest: string }
  | { kind: 'identical'; rel: string }
  | { kind: 'conflict'; rel: string; src: string; dest: string }
  | { kind: 'restore'; rel: string; src: string; dest: string }

interface ExtractedIconEntry {
  normalizedPath: string
  outputPath: string
  pathTokens: Set<string>
  fileTokens: Set<string>
}

interface IconAliasSpec {
  alias: string
  tokenVariants: string[][]
  preferredPathTokens: string[]
}

interface IconPackageConfig {
  name: string
  aliasDir: string
  pageUrl: string
  packageUrlEnvVar: string
  aliasSpecs: IconAliasSpec[]
  resolveUrl: () => Promise<string>
  /** Return true to include this ZIP entry in extraction; default: include all */
  filterEntry?: (normalizedPath: string) => boolean
  /** Extra scoring boost for alias candidates */
  extraScore?: (entry: ExtractedIconEntry) => number
}

interface IconDownloadResult {
  name: string
  packageUrl: string
  fileCount: number
  aliasCount: number
  missingAliases: string[]
}

// ─── Alias specs per cloud ────────────────────────────────────────────────────

const AWS_ALIAS_SPECS: IconAliasSpec[] = [
  { alias: 'api-gateway', tokenVariants: [['api', 'gateway']], preferredPathTokens: ['service'] },
  { alias: 'aws-cloud', tokenVariants: [['aws', 'cloud']], preferredPathTokens: ['group'] },
  { alias: 'cloudfront', tokenVariants: [['cloudfront'], ['cloud', 'front']], preferredPathTokens: ['service'] },
  { alias: 'cloudtrail', tokenVariants: [['cloudtrail'], ['cloud', 'trail']], preferredPathTokens: ['service'] },
  { alias: 'cloudwatch', tokenVariants: [['cloudwatch'], ['cloud', 'watch']], preferredPathTokens: ['service'] },
  { alias: 'cognito', tokenVariants: [['cognito']], preferredPathTokens: ['service'] },
  { alias: 'data-firehose', tokenVariants: [['firehose'], ['kinesis', 'data', 'firehose']], preferredPathTokens: ['service'] },
  { alias: 'dynamodb', tokenVariants: [['dynamodb'], ['dynamo', 'db']], preferredPathTokens: ['service'] },
  { alias: 'ecs', tokenVariants: [['ecs'], ['elastic', 'container', 'service']], preferredPathTokens: ['service'] },
  { alias: 'eks', tokenVariants: [['eks'], ['elastic', 'kubernetes']], preferredPathTokens: ['service'] },
  { alias: 'elasticache', tokenVariants: [['elasticache']], preferredPathTokens: ['service'] },
  { alias: 'eventbridge', tokenVariants: [['eventbridge'], ['event', 'bridge']], preferredPathTokens: ['service'] },
  { alias: 'kinesis', tokenVariants: [['kinesis']], preferredPathTokens: ['service'] },
  { alias: 'lambda', tokenVariants: [['lambda']], preferredPathTokens: ['service'] },
  { alias: 'nat-gateway', tokenVariants: [['nat', 'gateway']], preferredPathTokens: ['resource'] },
  { alias: 'private-subnet', tokenVariants: [['private', 'subnet']], preferredPathTokens: ['resource'] },
  { alias: 'rds', tokenVariants: [['rds'], ['relational', 'database']], preferredPathTokens: ['service'] },
  { alias: 'redshift', tokenVariants: [['redshift']], preferredPathTokens: ['service'] },
  { alias: 'route53', tokenVariants: [['route', '53'], ['route53']], preferredPathTokens: ['service'] },
  { alias: 's3', tokenVariants: [['s3'], ['simple', 'storage', 'service']], preferredPathTokens: ['service'] },
  { alias: 'ses', tokenVariants: [['ses'], ['simple', 'email', 'service']], preferredPathTokens: ['service'] },
  { alias: 'sns', tokenVariants: [['sns'], ['simple', 'notification', 'service']], preferredPathTokens: ['service'] },
  { alias: 'sqs', tokenVariants: [['sqs'], ['simple', 'queue', 'service']], preferredPathTokens: ['service'] },
  { alias: 'step-functions', tokenVariants: [['step', 'functions']], preferredPathTokens: ['service'] },
  { alias: 'vpc', tokenVariants: [['vpc'], ['virtual', 'private', 'cloud']], preferredPathTokens: ['service'] },
  { alias: 'waf', tokenVariants: [['waf'], ['web', 'application', 'firewall']], preferredPathTokens: ['service'] },
  { alias: 'xray', tokenVariants: [['xray'], ['x', 'ray']], preferredPathTokens: ['service'] },
]

const AZURE_ALIAS_SPECS: IconAliasSpec[] = [
  { alias: 'api-management', tokenVariants: [['api', 'management']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'app-service', tokenVariants: [['app', 'service'], ['app', 'services']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'application-gateway', tokenVariants: [['application', 'gateway']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'blob-storage', tokenVariants: [['blob', 'block'], ['blob', 'storage']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'cognitive-services', tokenVariants: [['cognitive', 'services']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'container-instances', tokenVariants: [['container', 'instances']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'cosmos-db', tokenVariants: [['cosmos', 'db'], ['cosmosdb']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'entra-id', tokenVariants: [['entra', 'id'], ['active', 'directory']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'event-grid', tokenVariants: [['event', 'grid']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'event-hubs', tokenVariants: [['event', 'hubs']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'front-door', tokenVariants: [['front', 'door']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'functions', tokenVariants: [['functions']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'key-vault', tokenVariants: [['key', 'vaults'], ['key', 'vault']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'kubernetes-service', tokenVariants: [['kubernetes', 'service'], ['aks']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'load-balancer', tokenVariants: [['load', 'balancer']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'logic-apps', tokenVariants: [['logic', 'apps']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'monitor', tokenVariants: [['monitor']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'redis-cache', tokenVariants: [['redis', 'cache'], ['cache', 'redis']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'service-bus', tokenVariants: [['service', 'bus']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'sql-database', tokenVariants: [['sql', 'database']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'storage-accounts', tokenVariants: [['storage', 'accounts']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'synapse-analytics', tokenVariants: [['synapse', 'analytics'], ['synapse']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'virtual-machine', tokenVariants: [['virtual', 'machine']], preferredPathTokens: ['icon', 'service'] },
  { alias: 'virtual-network', tokenVariants: [['virtual', 'network']], preferredPathTokens: ['icon', 'service'] },
]

const GCP_ALIAS_SPECS: IconAliasSpec[] = [
  { alias: 'api-gateway', tokenVariants: [['api', 'gateway']], preferredPathTokens: [] },
  { alias: 'app-engine', tokenVariants: [['app', 'engine']], preferredPathTokens: [] },
  { alias: 'bigquery', tokenVariants: [['bigquery'], ['big', 'query']], preferredPathTokens: [] },
  { alias: 'bigtable', tokenVariants: [['bigtable'], ['big', 'table']], preferredPathTokens: [] },
  { alias: 'cloud-armor', tokenVariants: [['cloud', 'armor']], preferredPathTokens: [] },
  { alias: 'cloud-cdn', tokenVariants: [['cloud', 'cdn']], preferredPathTokens: [] },
  { alias: 'cloud-dns', tokenVariants: [['cloud', 'dns']], preferredPathTokens: [] },
  { alias: 'cloud-functions', tokenVariants: [['cloud', 'functions']], preferredPathTokens: [] },
  { alias: 'cloud-load-balancing', tokenVariants: [['cloud', 'load', 'balancing'], ['load', 'balancing']], preferredPathTokens: [] },
  { alias: 'cloud-logging', tokenVariants: [['cloud', 'logging']], preferredPathTokens: [] },
  { alias: 'cloud-monitoring', tokenVariants: [['cloud', 'monitoring']], preferredPathTokens: [] },
  { alias: 'cloud-run', tokenVariants: [['cloud', 'run']], preferredPathTokens: [] },
  { alias: 'cloud-sql', tokenVariants: [['cloud', 'sql']], preferredPathTokens: [] },
  { alias: 'cloud-storage', tokenVariants: [['cloud', 'storage']], preferredPathTokens: [] },
  { alias: 'compute-engine', tokenVariants: [['compute', 'engine']], preferredPathTokens: [] },
  { alias: 'dataflow', tokenVariants: [['dataflow'], ['data', 'flow']], preferredPathTokens: [] },
  { alias: 'dataproc', tokenVariants: [['dataproc'], ['data', 'proc']], preferredPathTokens: [] },
  { alias: 'firestore', tokenVariants: [['firestore'], ['fire', 'store']], preferredPathTokens: [] },
  { alias: 'gke', tokenVariants: [['kubernetes', 'engine'], ['gke']], preferredPathTokens: [] },
  { alias: 'iam', tokenVariants: [['iam'], ['identity', 'access']], preferredPathTokens: [] },
  { alias: 'memorystore', tokenVariants: [['memorystore'], ['memory', 'store']], preferredPathTokens: [] },
  { alias: 'pub-sub', tokenVariants: [['pub', 'sub'], ['pubsub']], preferredPathTokens: [] },
  { alias: 'spanner', tokenVariants: [['spanner']], preferredPathTokens: [] },
  { alias: 'vpc', tokenVariants: [['virtual', 'private', 'cloud'], ['vpc']], preferredPathTokens: [] },
]

// ─── URL resolution per cloud ─────────────────────────────────────────────────

async function resolveAwsIconPackageUrl(): Promise<string> {
  const envUrl = process.env.EAROS_AWS_ICON_PACKAGE_URL
  if (envUrl) return envUrl

  const pageUrl = process.env.EAROS_AWS_ICON_PAGE_URL ?? 'https://aws.amazon.com/architecture/icons/'
  const response = await fetch(pageUrl, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`Unable to load AWS icon page: HTTP ${response.status}`)
  }

  const html = await response.text()
  const button2UrlMatch = html.match(/"button2URL":"([^"]+\.zip)"/i)
  if (button2UrlMatch?.[1]) {
    return new URL(button2UrlMatch[1], response.url).toString()
  }

  const anchorMatch = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Icon package\s*<\/a>/i)
  if (anchorMatch?.[1]) {
    return new URL(anchorMatch[1], response.url).toString()
  }

  const zipMatches = [...html.matchAll(/https:\/\/d1\.awsstatic\.com\/[^"'\s>]+\.zip/gi)].map((match) => match[0])
  const candidateUrl = zipMatches.find((url) => /asset|icon/i.test(url)) ?? zipMatches[0]
  if (candidateUrl) return candidateUrl

  throw new Error(`Could not find the AWS icon package link on ${response.url}`)
}

async function resolveAzureIconPackageUrl(): Promise<string> {
  const envUrl = process.env.EAROS_AZURE_ICON_PACKAGE_URL
  if (envUrl) return envUrl

  const pageUrl = process.env.EAROS_AZURE_ICON_PAGE_URL ?? 'https://learn.microsoft.com/en-us/azure/architecture/icons/'
  const response = await fetch(pageUrl, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`Unable to load Azure icon page: HTTP ${response.status}`)
  }

  const html = await response.text()

  // Look for the download link — typically an azureedge.net or azure.com hosted ZIP
  const downloadMatch = html.match(/href="([^"]+\.zip)"/i)
  if (downloadMatch?.[1]) {
    return new URL(downloadMatch[1], response.url).toString()
  }

  // Fallback: look for any ZIP URL in the page content
  const zipMatches = [...html.matchAll(/https:\/\/[^"'\s>]+\.zip/gi)].map((match) => match[0])
  const candidateUrl = zipMatches.find((url) => /icon/i.test(url)) ?? zipMatches[0]
  if (candidateUrl) return candidateUrl

  throw new Error(`Could not find the Azure icon package link on ${response.url}`)
}

async function resolveGcpIconPackageUrl(): Promise<string> {
  const envUrl = process.env.EAROS_GCP_ICON_PACKAGE_URL
  if (envUrl) return envUrl

  // GCP's icon page is JS-rendered, so we try the known stable URL first
  const knownUrls = [
    'https://cloud.google.com/static/icons/files/google-cloud-icons.zip',
  ]

  for (const url of knownUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
      if (response.ok) return url
    } catch {
      // try next
    }
  }

  // Fallback: try to scrape the page
  const pageUrl = process.env.EAROS_GCP_ICON_PAGE_URL ?? 'https://cloud.google.com/icons'
  const response = await fetch(pageUrl, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`Unable to load GCP icon page: HTTP ${response.status}`)
  }

  const html = await response.text()
  const zipMatches = [...html.matchAll(/https:\/\/[^"'\s>]+\.zip/gi)].map((match) => match[0])
  const candidateUrl = zipMatches.find((url) => /icon/i.test(url)) ?? zipMatches[0]
  if (candidateUrl) return candidateUrl

  throw new Error(`Could not find the GCP icon package link on ${pageUrl}`)
}

// ─── Cloud package configs ────────────────────────────────────────────────────

const ICON_PACKAGES: IconPackageConfig[] = [
  {
    name: 'AWS',
    aliasDir: 'aws',
    pageUrl: 'https://aws.amazon.com/architecture/icons/',
    packageUrlEnvVar: 'EAROS_AWS_ICON_PACKAGE_URL',
    aliasSpecs: AWS_ALIAS_SPECS,
    resolveUrl: resolveAwsIconPackageUrl,
    extraScore: (entry) => entry.fileTokens.has('arch') ? 5 : 0,
  },
  {
    name: 'Azure',
    aliasDir: 'azure',
    pageUrl: 'https://learn.microsoft.com/en-us/azure/architecture/icons/',
    packageUrlEnvVar: 'EAROS_AZURE_ICON_PACKAGE_URL',
    aliasSpecs: AZURE_ALIAS_SPECS,
    resolveUrl: resolveAzureIconPackageUrl,
  },
  {
    name: 'GCP',
    aliasDir: 'gcp',
    pageUrl: 'https://cloud.google.com/icons',
    packageUrlEnvVar: 'EAROS_GCP_ICON_PACKAGE_URL',
    aliasSpecs: GCP_ALIAS_SPECS,
    resolveUrl: resolveGcpIconPackageUrl,
    filterEntry: (normalizedPath) => {
      // GCP ZIPs contain SVG/, PNG/, and other dirs — only extract SVGs
      const lower = normalizedPath.toLowerCase()
      return lower.endsWith('.svg') || lower.endsWith('.pdf') || lower.endsWith('.txt') || lower.endsWith('.md')
    },
  },
]

// ─── Generic icon download infrastructure ─────────────────────────────────────

function tokenizeForMatch(value: string): Set<string> {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean))
}

function normalizeZipEntryPath(entryName: string): string | null {
  const normalized = entryName.replace(/\\/g, '/').replace(/^\/+/, '')
  const segments = normalized.split('/').filter(Boolean)
  if (!segments.length || segments.some((segment) => segment === '..' || segment.includes(':'))) {
    return null
  }
  return segments.join('/')
}

function buildExtractedIconEntry(normalizedPath: string, outputPath: string): ExtractedIconEntry {
  return {
    normalizedPath,
    outputPath,
    pathTokens: tokenizeForMatch(normalizedPath),
    fileTokens: tokenizeForMatch(basename(normalizedPath)),
  }
}

function matchesVariant(entry: ExtractedIconEntry, tokenVariant: string[]): boolean {
  return tokenVariant.every((token) => entry.pathTokens.has(token) || entry.fileTokens.has(token))
}

function scoreAliasCandidate(entry: ExtractedIconEntry, spec: IconAliasSpec, config: IconPackageConfig): number {
  const matchedVariant = spec.tokenVariants.find((tokenVariant) => matchesVariant(entry, tokenVariant))
  if (!matchedVariant) return Number.NEGATIVE_INFINITY

  let score = matchedVariant.length * 10
  if (spec.preferredPathTokens.length && spec.preferredPathTokens.every((token) => entry.pathTokens.has(token))) {
    score += 40
  }
  if (config.extraScore) score += config.extraScore(entry)
  // Prefer shorter paths (more specific matches)
  score -= entry.normalizedPath.length / 1000
  return score
}

function createIconAliases(
  iconsDir: string,
  extractedEntries: ExtractedIconEntry[],
  config: IconPackageConfig,
): { aliasCount: number; missingAliases: string[] } {
  const aliasDir = join(iconsDir, config.aliasDir)
  mkdirSync(aliasDir, { recursive: true })

  let aliasCount = 0
  const missingAliases: string[] = []

  for (const spec of config.aliasSpecs) {
    let bestScore = Number.NEGATIVE_INFINITY
    let bestEntry: ExtractedIconEntry | null = null
    for (const entry of extractedEntries) {
      const score = scoreAliasCandidate(entry, spec, config)
      if (score > bestScore) {
        bestScore = score
        bestEntry = entry
      }
    }

    if (!bestEntry) {
      missingAliases.push(spec.alias)
      continue
    }

    copyFileSync(bestEntry.outputPath, join(aliasDir, `${spec.alias}.svg`))
    aliasCount += 1
  }

  return { aliasCount, missingAliases }
}

async function downloadIconPackage(targetDir: string, config: IconPackageConfig): Promise<IconDownloadResult> {
  console.log(`Resolving ${config.name} icon package URL...`)
  const packageUrl = await config.resolveUrl()

  console.log(`Downloading ${config.name} icons from ${packageUrl}`)
  const response = await fetch(packageUrl, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`Unable to download ${config.name} icon package: HTTP ${response.status}`)
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer())
  const iconsDir = join(targetDir, 'icons')
  mkdirSync(iconsDir, { recursive: true })

  let fileCount = 0
  const extractedEntries: ExtractedIconEntry[] = []
  for (const [entryName, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue

    const normalizedEntryPath = normalizeZipEntryPath(entryName)
    if (!normalizedEntryPath) continue
    if (config.filterEntry && !config.filterEntry(normalizedEntryPath)) continue

    const outputPath = join(iconsDir, normalizedEntryPath)
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, await zipEntry.async('nodebuffer'))
    fileCount += 1
    if (normalizedEntryPath.toLowerCase().endsWith('.svg')) {
      extractedEntries.push(buildExtractedIconEntry(normalizedEntryPath, outputPath))
    }
  }

  const { aliasCount, missingAliases } = createIconAliases(iconsDir, extractedEntries, config)
  return { name: config.name, packageUrl, fileCount, aliasCount, missingAliases }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function initWorkspace(targetDir: string, options: InitWorkspaceOptions = {}): Promise<void> {
  const target = resolve(process.cwd(), targetDir)
  // When compiled, init.js sits in tools/editor/ alongside assets/
  const assetsDir = join(__dirname, 'assets', 'init')
  const workspaceExists = existsSync(join(target, 'earos.manifest.yaml'))

  if (!existsSync(assetsDir)) {
    console.error('Asset directory not found. Run npm run build first.')
    process.exit(1)
  }

  if (workspaceExists && !options.downloadIcons) {
    console.error(
      `${target} already contains an EaROS workspace (earos.manifest.yaml exists).`
    )
    process.exit(1)
  }

  if (!workspaceExists) {
    mkdirSync(target, { recursive: true })
    cpSync(assetsDir, target, { recursive: true })
    writeVersionMarker(target)
  } else {
    console.log(`EaROS workspace already exists at ${target}; downloading icons only.`)
  }

  let iconDownloadSummary = ''
  if (options.downloadIcons) {
    const results: IconDownloadResult[] = []
    const settled = await Promise.allSettled(
      ICON_PACKAGES.map(config => downloadIconPackage(target, config))
    )
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        results.push(outcome.value)
        if (outcome.value.missingAliases.length) {
          console.warn(`  Missing ${outcome.value.name} icon aliases: ${outcome.value.missingAliases.join(', ')}`)
        }
      } else {
        console.error(`  Failed to download icons: ${outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)}`)
      }
    }

    if (results.length) {
      const totalFiles = results.reduce((sum, r) => sum + r.fileCount, 0)
      const totalAliases = results.reduce((sum, r) => sum + r.aliasCount, 0)
      const aliasLines = results.map((r) => `  icons/${r.name.toLowerCase()}/           ${r.name} Mermaid icon aliases (${r.aliasCount} files)`).join('\n')
      iconDownloadSummary = `  icons/                 Architecture icon packages (${totalFiles} files)\n${aliasLines}\n`
    }
  }

  const isCurrentDir = targetDir === '.' || targetDir === './'
  const cdStep = isCurrentDir ? '' : `  cd ${targetDir}\n`

  console.log(`
✓ EaROS workspace initialized at: ${target}

Contents:
  core/                  Core meta-rubric (universal foundation)
  profiles/              Artifact-specific profiles (5 included)
  overlays/              Cross-cutting concern overlays (3 included)
  standard/schemas/      JSON schemas for validation
  templates/             Blank templates for new profiles and evaluations
  evaluations/           Your evaluation records go here
  calibration/           Calibration artifacts and results
  .agents/skills/        All 10 EaROS skills for any AI coding agent
${iconDownloadSummary}  earos.manifest.yaml    File inventory (single source of truth)
  AGENTS.md              Project guide for AI agents (agent-agnostic)

Next steps:
${cdStep}  earos                  Open the editor
  earos validate core/core-meta-rubric.yaml   Validate a file
  earos manifest check   Verify manifest integrity
  earos update           Pull in newer governed assets from a newer @trohde/earos
`)
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Paths under assets/init/ that `earos update` reconciles against the
 * workspace. Everything else (evaluations/, calibration/, docs/,
 * research/, icons/, user-added examples/) is owned by the user and left
 * alone.
 */
const GOVERNED_PATHS: ReadonlyArray<string> = [
  'core',
  'profiles',
  'overlays',
  'standard/schemas',
  'standard/EAROS.md',
  'templates',
  '.agents/skills',
  '.claude/CLAUDE.md',
  'CLAUDE.md',
  'README.md',
  'AGENTS.md',
  '.gitignore',
  // Shipped worked examples — user can delete them, update will offer to restore.
  'examples/aws-event-driven-order-processing',
  'examples/example-adr',
  'examples/example-solution-architecture',
  'examples/multi-cloud-data-analytics',
]

/** Package metadata, read from bin.js's own package.json. */
function getPackageInfo(): { name: string; version: string } {
  try {
    const pkgPath = resolve(__dirname, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    return { name: pkg.name ?? '@trohde/earos', version: pkg.version ?? '0.0.0' }
  } catch {
    return { name: '@trohde/earos', version: '0.0.0' }
  }
}

/** Write `.earos-version` at the workspace root. */
function writeVersionMarker(target: string): void {
  const { name, version } = getPackageInfo()
  const content =
    `# Auto-generated by earos init/update — do not edit.\n` +
    `# Records which @trohde/earos version last wrote the governed files.\n` +
    `package: "${name}"\n` +
    `version: "${version}"\n` +
    `updated: "${new Date().toISOString()}"\n`
  writeFileSync(join(target, '.earos-version'), content, 'utf8')
}

/** Read the previously recorded package version, or null if missing/unreadable. */
function readVersionMarker(target: string): string | null {
  const markerPath = join(target, '.earos-version')
  if (!existsSync(markerPath)) return null
  try {
    const match = readFileSync(markerPath, 'utf8').match(/^version:\s*"?([^"\n\r]+)"?/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

/**
 * Normalize content before hashing so CRLF/LF and trailing-whitespace drift
 * don't register as "the user modified every file". BOM is stripped too.
 */
function normalizeContent(buf: Buffer): string {
  let s = buf.toString('utf8')
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1)
  return s.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n')
}

function hashFile(path: string): string {
  const normalized = normalizeContent(readFileSync(path))
  return createHash('sha256').update(normalized).digest('hex')
}

/** Recursively walk a directory, yielding file paths relative to `root`. */
function walkFiles(root: string, rel = ''): string[] {
  const abs = join(root, rel)
  if (!existsSync(abs)) return []
  const st = statSync(abs)
  if (st.isFile()) return [rel]
  if (!st.isDirectory()) return []
  const out: string[] = []
  for (const entry of readdirSync(abs)) {
    out.push(...walkFiles(root, rel ? join(rel, entry) : entry))
  }
  return out
}

/**
 * Classify every file under a governed path.
 * `relPath` is the path in assets/init/ (may be a file or a directory).
 */
function classifyGovernedPath(
  relPath: string,
  assetsDir: string,
  target: string,
  workspaceExisted: boolean,
): FileClassification[] {
  const absSrc = join(assetsDir, relPath)
  if (!existsSync(absSrc)) return []
  const isDir = statSync(absSrc).isDirectory()
  const files = isDir ? walkFiles(absSrc).map((f) => join(relPath, f)) : [relPath]

  const out: FileClassification[] = []
  for (const rel of files) {
    const src = join(assetsDir, rel)
    const dest = join(target, rel)
    if (!existsSync(dest)) {
      // If the workspace existed before this run, a missing file under a
      // shipped examples/ path is a user delete — treat as restore-prompt.
      // Otherwise it's a new file.
      const posixRel = rel.split(sep).join('/')
      const isShippedExample = posixRel.startsWith('examples/')
      if (workspaceExisted && isShippedExample) {
        out.push({ kind: 'restore', rel, src, dest })
      } else {
        out.push({ kind: 'add', rel, src, dest })
      }
      continue
    }
    if (hashFile(src) === hashFile(dest)) {
      out.push({ kind: 'identical', rel })
    } else {
      out.push({ kind: 'conflict', rel, src, dest })
    }
  }
  return out
}

/** Print a unified-ish diff between two text files. Minimal, built-in only. */
function printDiff(src: string, dest: string, rel: string): void {
  const srcLines = normalizeContent(readFileSync(src)).split('\n')
  const destLines = normalizeContent(readFileSync(dest)).split('\n')
  console.log(`\n--- ${rel} (your version)`)
  console.log(`+++ ${rel} (package version)`)
  // Tiny line-by-line diff: find first and last differing lines, show
  // context. Sufficient for small schema/profile edits; not LCS-optimal.
  const maxLen = Math.max(srcLines.length, destLines.length)
  let firstDiff = -1
  let lastDiff = -1
  for (let i = 0; i < maxLen; i++) {
    if (srcLines[i] !== destLines[i]) {
      if (firstDiff === -1) firstDiff = i
      lastDiff = i
    }
  }
  if (firstDiff === -1) {
    console.log('  (files are identical after normalization)')
    return
  }
  const start = Math.max(0, firstDiff - 2)
  const end = Math.min(maxLen, lastDiff + 3)
  for (let i = start; i < end; i++) {
    const a = srcLines[i]
    const b = destLines[i]
    if (a === b) {
      console.log(`  ${a ?? ''}`)
    } else {
      if (a !== undefined) console.log(`- ${a}`)
      if (b !== undefined) console.log(`+ ${b}`)
    }
  }
  console.log('')
}

async function promptResolution(
  rel: string,
  src: string,
  dest: string,
  kind: 'conflict' | 'restore',
): Promise<'keep' | 'overwrite' | 'skip'> {
  const display = rel.split(sep).join('/')
  const rl = createInterface({ input, output })
  try {
    while (true) {
      const label = kind === 'restore' ? 'RESTORE' : 'UPDATE'
      const prompt =
        kind === 'restore'
          ? `\n${display}  [${label}]\n  Shipped file is missing from your workspace.\n  [r]estore   [s]kip\n> `
          : `\n${display}  [${label}]\n  Your file and the package version differ.\n  [k]eep mine   [o]verwrite with package   [d]iff   [s]kip\n> `
      const answer = (await rl.question(prompt)).trim().toLowerCase()
      if (kind === 'restore') {
        if (answer === 'r' || answer === 'restore') return 'overwrite'
        if (answer === 's' || answer === 'skip' || answer === '') return 'skip'
      } else {
        if (answer === 'k' || answer === 'keep') return 'keep'
        if (answer === 'o' || answer === 'overwrite') return 'overwrite'
        if (answer === 's' || answer === 'skip') return 'skip'
        if (answer === 'd' || answer === 'diff') {
          printDiff(src, dest, display)
          continue
        }
      }
      console.log('  Unrecognized choice — try again.')
    }
  } finally {
    rl.close()
  }
}

export async function updateWorkspace(
  targetDir: string,
  options: UpdateWorkspaceOptions = {},
): Promise<void> {
  const target = resolve(process.cwd(), targetDir)
  const assetsDir = join(__dirname, 'assets', 'init')
  const workspaceExisted = existsSync(join(target, 'earos.manifest.yaml'))

  if (!existsSync(assetsDir)) {
    console.error('Asset directory not found. Run npm run build first.')
    process.exit(1)
  }
  if (!workspaceExisted) {
    console.error(`${target} is not an EaROS workspace (earos.manifest.yaml not found). Run \`earos init\` first.`)
    process.exit(1)
  }

  // Flag exclusivity
  const modes = [options.dryRun, options.keepMine, options.overwrite].filter(Boolean).length
  if (modes > 1) {
    console.error('Pass at most one of --dry-run, --yes-keep-mine, --yes-overwrite/--force.')
    process.exit(1)
  }

  // Non-interactive guard: if no mode flag and stdin isn't a TTY, refuse.
  const interactive = !options.dryRun && !options.keepMine && !options.overwrite
  if (interactive && !(input as NodeJS.ReadStream).isTTY) {
    console.error(
      'earos update is interactive by default and stdin is not a TTY.\n' +
      'Pass one of --dry-run, --yes-keep-mine, --yes-overwrite (or --force).',
    )
    process.exit(1)
  }

  const { name: pkgName, version: pkgVersion } = getPackageInfo()
  const fromVersion = readVersionMarker(target)

  // Collect classifications across every governed path (optionally filtered by --only).
  const pathsToScan = options.only
    ? GOVERNED_PATHS.filter((p) => p === options.only || p.startsWith(options.only + '/'))
    : GOVERNED_PATHS
  if (options.only && pathsToScan.length === 0) {
    console.error(`--only ${options.only} does not match any governed path.`)
    process.exit(1)
  }

  const classifications: FileClassification[] = []
  for (const rel of pathsToScan) {
    classifications.push(...classifyGovernedPath(rel, assetsDir, target, workspaceExisted))
  }

  const adds = classifications.filter((c): c is Extract<FileClassification, { kind: 'add' }> => c.kind === 'add')
  const identicals = classifications.filter((c) => c.kind === 'identical')
  const conflicts = classifications.filter((c): c is Extract<FileClassification, { kind: 'conflict' }> => c.kind === 'conflict')
  const restores = classifications.filter((c): c is Extract<FileClassification, { kind: 'restore' }> => c.kind === 'restore')

  // ─── Header ───
  console.log(`\nEaROS update plan for ${target}`)
  console.log(`  From: ${pkgName} v${fromVersion ?? '(unknown)'}`)
  console.log(`  To:   ${pkgName} v${pkgVersion}\n`)

  // ─── Summary ───
  if (adds.length) {
    console.log(`${adds.length} new file(s) will be added:`)
    for (const a of adds) console.log(`  + ${a.rel.split(sep).join('/')}`)
  }
  console.log(`${identicals.length} file(s) identical — no change.`)
  if (restores.length) {
    console.log(`${restores.length} shipped file(s) missing from your workspace (candidates for restore):`)
    for (const r of restores) console.log(`  ? ${r.rel.split(sep).join('/')}`)
  }
  if (conflicts.length) {
    console.log(`${conflicts.length} file(s) differ between your workspace and the package:`)
    for (const c of conflicts) console.log(`  ~ ${c.rel.split(sep).join('/')}`)
  }

  if (!adds.length && !conflicts.length && !restores.length) {
    console.log('\n✓ Nothing to do — workspace is already in sync.')
    if (!options.dryRun && fromVersion !== pkgVersion) {
      writeVersionMarker(target)
      console.log(`  Updated .earos-version → ${pkgVersion}`)
    }
    return
  }

  if (options.dryRun) {
    console.log('\nDry run — no files were changed.')
    return
  }

  // ─── Apply adds (always) ───
  for (const a of adds) {
    mkdirSync(dirname(a.dest), { recursive: true })
    copyFileSync(a.src, a.dest)
  }
  if (adds.length) console.log(`\n✓ Added ${adds.length} file(s).`)

  // ─── Resolve conflicts + restores ───
  let overwritten = 0
  let kept = 0
  let skipped = 0

  async function resolveOne(
    c: Extract<FileClassification, { kind: 'conflict' | 'restore' }>,
  ): Promise<void> {
    let choice: 'keep' | 'overwrite' | 'skip'
    if (options.overwrite) choice = 'overwrite'
    else if (options.keepMine) choice = c.kind === 'restore' ? 'skip' : 'keep'
    else choice = await promptResolution(c.rel, c.src, c.dest, c.kind)

    if (choice === 'overwrite') {
      mkdirSync(dirname(c.dest), { recursive: true })
      copyFileSync(c.src, c.dest)
      overwritten++
    } else if (choice === 'keep') {
      kept++
    } else {
      skipped++
    }
  }

  for (const c of restores) await resolveOne(c)
  for (const c of conflicts) await resolveOne(c)

  console.log(`\n✓ Resolution: ${overwritten} overwritten, ${kept} kept, ${skipped} skipped.`)

  // ─── Regenerate manifest ───
  try {
    const { spawnSync } = await import('child_process')
    const manifestCli = resolve(__dirname, 'manifest-cli.mjs')
    const result = spawnSync(process.execPath, [manifestCli, 'generate'], {
      stdio: 'inherit',
      cwd: target,
      env: { ...process.env, EAROS_REPO_ROOT: target },
    })
    if (result.status !== 0) {
      console.warn('  ⚠ Manifest regenerate exited non-zero — run `earos manifest` manually.')
    }
  } catch (e) {
    console.warn(`  ⚠ Manifest regenerate failed: ${(e as Error).message}`)
  }

  // ─── Version marker ───
  writeVersionMarker(target)
  console.log(`✓ Updated .earos-version → ${pkgVersion}`)
}
