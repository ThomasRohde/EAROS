import { cpSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitWorkspaceOptions {
  downloadIcons?: boolean
}

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
`)
}
