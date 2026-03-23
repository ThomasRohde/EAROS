/**
 * EaROS — Export artifact data to a Microsoft Word (.docx) document.
 *
 * Mermaid diagrams are rendered in the browser for the editor export flow and
 * passed to the server as PNGs. Kroki remains as a fallback for CLI/server-only
 * exports or any diagram the browser did not pre-render.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  SectionType,
  SimpleField,
  TableOfContents,
  type IRunOptions,
} from 'docx'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArtifactData {
  kind?: string
  artifact_type?: string
  metadata?: Record<string, any>
  sections?: Record<string, any>
  glossary?: any[]
  [key: string]: any
}

interface BrowserRenderedDiagram {
  pngBase64?: string
  svgText?: string
  width: number
  height: number
}

interface JsonSchemaNode {
  type?: string | string[]
  title?: string
  description?: string
  properties?: Record<string, JsonSchemaNode>
  items?: JsonSchemaNode
  [key: string]: any
}

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

function loadArtifactSchema(): JsonSchemaNode | null {
  const candidates = [
    resolve(MODULE_DIR, 'schemas', 'artifact.schema.json'),
    resolve(MODULE_DIR, '../schemas', 'artifact.schema.json'),
    resolve(MODULE_DIR, '../../standard/schemas', 'artifact.schema.json'),
  ]

  for (const candidate of candidates) {
    try {
      return JSON.parse(readFileSync(candidate, 'utf8')) as JsonSchemaNode
    } catch {
      // Try next candidate path.
    }
  }

  console.warn('[export-docx] Artifact schema not found; falling back to shape-driven rendering')
  return null
}

let _artifactSchema: JsonSchemaNode | null | undefined
function getArtifactSchema(): JsonSchemaNode | null {
  if (_artifactSchema === undefined) {
    _artifactSchema = loadArtifactSchema()
  }
  return _artifactSchema
}

// ─── Kroki Mermaid rendering ──────────────────────────────────────────────────

const KROKI_URL = 'https://kroki.io/mermaid/png'
const LOCAL_MERMAID_IMAGE_PREFIXES = ['/icons/', '/mermaid-icons/']
const LOCAL_MERMAID_IMAGE_DIRS = [
  resolve(process.cwd()),
  resolve(MODULE_DIR, 'public'),
  resolve(MODULE_DIR, 'dist'),
]
const MERMAID_IMAGE_MIME_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}
const mermaidImageDataUrlCache = new Map<string, string>()

function resolveLocalMermaidImage(assetPath: string): string | null {
  const relativePath = assetPath.replace(/^\/+/, '')
  for (const baseDir of LOCAL_MERMAID_IMAGE_DIRS) {
    const candidate = resolve(baseDir, relativePath)
    if (!candidate.startsWith(baseDir + sep)) continue
    if (existsSync(candidate)) return candidate
  }
  return null
}

function localImageToDataUrl(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mime = MERMAID_IMAGE_MIME_TYPES[ext] ?? 'application/octet-stream'
  const bytes = readFileSync(filePath)
  return `data:${mime};base64,${bytes.toString('base64')}`
}

function inlineLocalMermaidImages(diagram: string, label: string): string {
  return diagram.replace(/img:\s*(['"])(\/(?:icons|mermaid-icons)\/[^'"]+)\1/g, (match, quote: string, assetPath: string) => {
    const cached = mermaidImageDataUrlCache.get(assetPath)
    if (cached) return `img: ${quote}${cached}${quote}`

    const filePath = resolveLocalMermaidImage(assetPath)
    if (!filePath) {
      console.warn(`[export-docx] Mermaid image asset not found for "${label}": ${assetPath}`)
      return match
    }

    const dataUrl = localImageToDataUrl(filePath)
    mermaidImageDataUrlCache.set(assetPath, dataUrl)
    return `img: ${quote}${dataUrl}${quote}`
  })
}

async function renderMermaidDiagram(diagram: string, label: string): Promise<Buffer | null> {
  try {
    const preparedDiagram = LOCAL_MERMAID_IMAGE_PREFIXES.some((prefix) => diagram.includes(prefix))
      ? inlineLocalMermaidImages(diagram.trim(), label)
      : diagram.trim()
    const response = await fetch(KROKI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: preparedDiagram,
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      console.warn(`[export-docx] Diagram render failed for "${label}": HTTP ${response.status}`)
      return null
    }
    const arr = await response.arrayBuffer()
    const buf = Buffer.from(arr)
    if (buf.length === 0) {
      console.warn(`[export-docx] Diagram render returned empty buffer for "${label}"`)
      return null
    }
    return buf
  } catch (err) {
    console.warn(`[export-docx] Diagram render error for "${label}":`, err)
    return null
  }
}

function isBrowserRenderedDiagram(value: unknown): value is BrowserRenderedDiagram {
  return !!value
    && typeof value === 'object'
    && (
      typeof (value as BrowserRenderedDiagram).pngBase64 === 'string'
      || typeof (value as BrowserRenderedDiagram).svgText === 'string'
    )
    && Number.isFinite((value as BrowserRenderedDiagram).width)
    && Number.isFinite((value as BrowserRenderedDiagram).height)
}

// ─── Diagram extraction ───────────────────────────────────────────────────────

interface DiagramRef {
  key: string   // dotted path used as map key
  source: string
  label: string // human-readable name for error messages
}

function extractDiagrams(obj: any, path = '', label = ''): DiagramRef[] {
  if (!obj || typeof obj !== 'object') return []
  const refs: DiagramRef[] = []

  // Fields that may contain Mermaid source
  const DIAGRAM_FIELDS = new Set(['diagram_source', 'diagram', 'mermaid', 'mermaid_source'])

  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k
    const l = label ? `${label} › ${k}` : k
    if (DIAGRAM_FIELDS.has(k) && typeof v === 'string' && v.trim()) {
      refs.push({ key: p, source: v.trim(), label: l })
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => refs.push(...extractDiagrams(item, `${p}[${i}]`, `${l}[${i}]`)))
    } else if (typeof v === 'object' && v !== null) {
      refs.push(...extractDiagrams(v, p, l))
    }
  }
  return refs
}

// ─── docx helpers ─────────────────────────────────────────────────────────────

const NAVY = '1F3864'
const DARK_GREY = '404040'
const MID_GREY = '777777'
const ORANGE = 'C55A11'
const MAX_DIAGRAM_WIDTH = 580
const MAX_DIAGRAM_HEIGHT = 340
const TRANSPARENT_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9VE3VxkAAAAASUVORK5CYII='

type DiagramImage = Buffer | BrowserRenderedDiagram | null

type Children = Array<Paragraph | Table | TableOfContents>
type RunStyle = Omit<IRunOptions, 'text' | 'children' | 'break'>

// Word ignores raw `\n` inside a text node, so emit explicit line breaks.
function textRuns(text: string, run: RunStyle): TextRun[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
  return lines.map((line, index) =>
    new TextRun({
      ...run,
      text: line === '' && lines.length > 1 ? ' ' : line,
      ...(index > 0 ? { break: 1 } : {}),
    })
  )
}

function h1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    run: { color: NAVY, bold: true, font: 'Arial', size: 28 },
  })
}

function h2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 80 },
    run: { color: NAVY, bold: true, font: 'Arial', size: 24 },
  })
}

function h3(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    run: { color: ORANGE, bold: true, font: 'Arial', size: 22 },
  })
}

function body(text: string, indent = 0): Paragraph {
  return new Paragraph({
    style: 'Normal',
    children: textRuns(text, { font: 'Arial', size: 20, color: DARK_GREY }),
    spacing: { before: 60, after: 60 },
    indent: indent ? { left: indent * 360 } : undefined,
  })
}

function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    children: textRuns(text, { font: 'Arial', size: 20, color: DARK_GREY }),
    bullet: { level },
    spacing: { before: 40, after: 40 },
  })
}

function label(key: string, value: string): Paragraph {
  return new Paragraph({
    style: 'Normal',
    children: [
      new TextRun({ text: `${key}: `, font: 'Arial', size: 20, bold: true, color: DARK_GREY }),
      ...textRuns(value, { font: 'Arial', size: 20, color: DARK_GREY }),
    ],
    spacing: { before: 40, after: 40 },
  })
}

function italicNote(text: string): Paragraph {
  return new Paragraph({
    style: 'Normal',
    children: textRuns(text, { font: 'Arial', size: 18, italics: true, color: MID_GREY }),
    spacing: { before: 60, after: 60 },
  })
}

/** Indented consequence line under an assumption bullet */
function consequence(text: string): Paragraph {
  return new Paragraph({
    style: 'Normal',
    children: textRuns(`→ ${text}`, { font: 'Arial', size: 18, italics: true, color: MID_GREY }),
    indent: { left: 720 },
    spacing: { before: 20, after: 40 },
  })
}

function pageBreak(): Paragraph {
  return new Paragraph({ style: 'Normal', children: [new PageBreak()] })
}

function horizontalRule(): Paragraph {
  return new Paragraph({
    style: 'Normal',
    border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { before: 200, after: 200 },
    children: [],
  })
}

function diagImage(image: Exclude<DiagramImage, null>): Paragraph {
  let width = MAX_DIAGRAM_WIDTH
  let height = MAX_DIAGRAM_HEIGHT

  if (Buffer.isBuffer(image)) {
    return new Paragraph({
      style: 'Normal',
      children: [
        new ImageRun({
          data: image,
          transformation: { width, height },
          type: 'png',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
    })
  }

  const scale = Math.min(
    MAX_DIAGRAM_WIDTH / Math.max(image.width, 1),
    MAX_DIAGRAM_HEIGHT / Math.max(image.height, 1),
    1,
  )
  width = Math.max(1, Math.round(image.width * scale))
  height = Math.max(1, Math.round(image.height * scale))

  const pngBuffer = typeof image.pngBase64 === 'string'
    ? Buffer.from(image.pngBase64, 'base64')
    : null
  const fallbackPng = pngBuffer ?? Buffer.from(TRANSPARENT_PNG_BASE64, 'base64')
  const imageRun = pngBuffer
    ? new ImageRun({
      data: pngBuffer,
      transformation: { width, height },
      type: 'png',
    })
    : typeof image.svgText === 'string'
      ? new ImageRun({
        data: Buffer.from(image.svgText, 'utf8'),
        transformation: { width, height },
        type: 'svg',
        fallback: { data: fallbackPng, type: 'png' },
      })
      : new ImageRun({
        data: fallbackPng,
        transformation: { width, height },
        type: 'png',
      })

  return new Paragraph({
    style: 'Normal',
    children: [imageRun],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  })
}

// Simple two-column key-value table
function kvTable(pairs: Array<[string, string]>): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pairs.map(([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ style: 'Normal', children: textRuns(k, { bold: true, font: 'Arial', size: 18 }) })],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ style: 'Normal', children: textRuns(v, { font: 'Arial', size: 18 }) })],
          }),
        ],
      })
    ),
  })
}

// Generic header-row table
function dataTable(headers: string[], rows: string[][]): Table {
  const columnCount = headers.length
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { fill: NAVY },
          children: [
            new Paragraph({
              style: 'Normal',
              children: textRuns(h, { bold: true, font: 'Arial', size: 18, color: 'FFFFFF' }),
            }),
          ],
        })
    ),
  })
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: Array.from({ length: columnCount }, (_, index) => row[index] ?? '').map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  style: 'Normal',
                  children: textRuns(cell ?? '', { font: 'Arial', size: 18 }),
                }),
              ],
            })
        ),
      })
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  })
}

function objectTable(items: Array<Record<string, any>>, schema?: JsonSchemaNode | null): Table | null {
  if (!items.length) return null

  const keys = orderedObjectKeys(items, schema).filter((key) => items.every((item) => isScalarish(item?.[key])))
  if (!keys.length) return null

  return dataTable(
    keys.map((key) => displayLabel(key, propertySchema(schema, key))),
    items.map((item) => keys.map((key) => str(item?.[key])))
  )
}

// ─── Section renderers ────────────────────────────────────────────────────────

function str(v: any): string {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function prettyLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function displayLabel(key: string, schema?: JsonSchemaNode | null): string {
  return str(schema?.title) || prettyLabel(key)
}

function heading(level: number, text: string): Paragraph {
  if (level <= 1) return h1(text)
  if (level === 2) return h2(text)
  return h3(text)
}

function isPlainObject(value: any): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isScalarish(value: any): boolean {
  return value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function schemaProperties(schema?: JsonSchemaNode | null): Record<string, JsonSchemaNode> {
  return isPlainObject(schema?.properties) ? schema.properties : {}
}

function propertySchema(schema: JsonSchemaNode | null | undefined, key: string): JsonSchemaNode | undefined {
  return schemaProperties(schema)[key]
}

function itemSchema(schema?: JsonSchemaNode | null): JsonSchemaNode | undefined {
  return isPlainObject(schema?.items) ? schema.items : undefined
}

function sectionSchema(key: string): JsonSchemaNode | undefined {
  const sections = propertySchema(getArtifactSchema(), 'sections')
  return propertySchema(sections, key)
}

function topLevelSchema(key: string): JsonSchemaNode | undefined {
  return propertySchema(getArtifactSchema(), key)
}

function orderedObjectKeys(
  items: Record<string, any> | Array<Record<string, any>>,
  schema?: JsonSchemaNode | null,
): string[] {
  const objects = Array.isArray(items) ? items.filter(isPlainObject) : [items].filter(isPlainObject)
  const keys: string[] = []
  const seen = new Set<string>()

  for (const key of Object.keys(schemaProperties(schema))) {
    if (objects.some((item) => key in item)) {
      seen.add(key)
      keys.push(key)
    }
  }

  for (const item of objects) {
    for (const key of Object.keys(item)) {
      if (seen.has(key)) continue
      seen.add(key)
      keys.push(key)
    }
  }

  return keys
}

function isScalarObject(value: any): value is Record<string, any> {
  return isPlainObject(value) && Object.values(value).every(isScalarish)
}

function primaryObjectField(
  value: Record<string, any>,
  schema?: JsonSchemaNode | null,
): { key: string; text: string } | null {
  const preferred = ['title', 'name', 'id', 'term', 'section', 'control', 'role', 'version']
  for (const key of preferred) {
    const text = str(value[key])
    if (text) return { key, text }
  }

  for (const key of orderedObjectKeys(value, schema)) {
    const text = str(value[key])
    if (text) return { key, text }
  }

  return null
}

function renderStructuredArray(
  items: any[],
  children: Children,
  schema?: JsonSchemaNode | null,
  level = 2,
) {
  if (!items.length) return

  if (items.every(isScalarish)) {
    for (const item of items) children.push(bullet(str(item), Math.max(level - 2, 0)))
    return
  }

  if (items.every(isScalarObject)) {
    const table = objectTable(items, itemSchema(schema))
    if (table) {
      children.push(table)
      return
    }
  }

  const childSchema = itemSchema(schema)
  for (const [index, item] of items.entries()) {
    if (isScalarish(item)) {
      children.push(bullet(str(item), Math.max(level - 2, 0)))
      continue
    }
    if (!isPlainObject(item)) continue

    const primary = primaryObjectField(item, childSchema)
    if (primary) {
      children.push(heading(level, primary.text))
    } else {
      children.push(heading(level, `Item ${index + 1}`))
    }

    if (isScalarObject(item)) {
      const pairs = orderedObjectKeys(item, childSchema)
        .filter((key) => key !== primary?.key && str(item[key]))
        .map((key) => [displayLabel(key, propertySchema(childSchema, key)), str(item[key])] as [string, string])
      if (pairs.length) children.push(kvTable(pairs))
      continue
    }

    renderStructuredObject(item, children, childSchema, Math.min(level + 1, 3), new Set(primary ? [primary.key] : []))
  }
}

function renderStructuredObject(
  value: Record<string, any>,
  children: Children,
  schema?: JsonSchemaNode | null,
  level = 2,
  skipKeys = new Set<string>(),
) {
  for (const key of orderedObjectKeys(value, schema)) {
    if (skipKeys.has(key)) continue
    const child = value[key]
    if (child == null || child === '') continue

    const childSchema = propertySchema(schema, key)
    const title = displayLabel(key, childSchema)
    children.push(heading(level, title))
    renderStructuredValue(child, children, childSchema, Math.min(level + 1, 3))
  }
}

function renderStructuredValue(
  value: any,
  children: Children,
  schema?: JsonSchemaNode | null,
  level = 2,
) {
  if (value == null || value === '') return
  if (isScalarish(value)) {
    children.push(body(str(value)))
    return
  }
  if (Array.isArray(value)) {
    renderStructuredArray(value, children, schema, level)
    return
  }
  if (isPlainObject(value)) {
    renderStructuredObject(value, children, schema, level)
  }
}

function renderStringList(items: any[], children: Children, indent = 1, schema?: JsonSchemaNode | null) {
  if (!Array.isArray(items)) return
  if (items.length && items.every(isScalarObject)) {
    const table = objectTable(items, schema)
    if (table) {
      children.push(table)
      return
    }
  }
  for (const item of items) {
    if (isScalarish(item)) children.push(bullet(str(item), indent - 1))
    else if (item && typeof item === 'object') {
      const text = item.description ?? item.statement ?? item.text ?? JSON.stringify(item)
      children.push(bullet(str(text), indent - 1))
    }
  }
}

function renderMetadata(metadata: Record<string, any>, children: Children) {
  children.push(h1('Metadata'))
  const pairs: Array<[string, string]> = []
  const SKIP = new Set(['stakeholders', 'change_log'])
  for (const [k, v] of Object.entries(metadata)) {
    if (SKIP.has(k)) continue
    if (typeof v === 'string' || typeof v === 'number') {
      pairs.push([k.replace(/_/g, ' '), str(v)])
    }
  }
  if (pairs.length) children.push(kvTable(pairs))

  // Stakeholders table
  const stakeholders = metadata.stakeholders
  if (Array.isArray(stakeholders) && stakeholders.length) {
    children.push(h2('Stakeholders'))
    children.push(
      dataTable(
        ['Role', 'Name / Team', 'Concerns'],
        stakeholders.map((s: any) => [str(s.role), str(s.name), str(s.concerns)])
      )
    )
  }

  // Change log table
  const changeLog = metadata.change_log
  if (Array.isArray(changeLog) && changeLog.length) {
    children.push(h2('Change Log'))
    children.push(
      dataTable(
        ['Version', 'Date', 'Author', 'Changes'],
        changeLog.map((c: any) => [
          str(c.version),
          str(c.date),
          str(c.author),
          Array.isArray(c.changes) ? c.changes.map(str).join('\n') : str(c.changes),
        ])
      )
    )
  }
}

function renderReadingGuide(data: any, children: Children) {
  children.push(h1('Reading Guide'))
  if (data.how_to_use) children.push(body(str(data.how_to_use)))
  const map = data.section_map
  if (Array.isArray(map) && map.length) {
    children.push(h2('Section Map'))
    children.push(
      dataTable(
        ['Section', 'Audience', 'Concern'],
        map.map((m: any) => [str(m.section), str(m.audience), str(m.concern)])
      )
    )
  }
}

function renderScope(data: any, children: Children) {
  children.push(h1('Scope'))
  if (data.statement) children.push(body(str(data.statement)))
  if (Array.isArray(data.in_scope) && data.in_scope.length) {
    children.push(h2('In Scope'))
    renderStringList(data.in_scope, children)
  }
  if (Array.isArray(data.out_of_scope) && data.out_of_scope.length) {
    children.push(h2('Out of Scope'))
    renderStringList(data.out_of_scope, children)
  }
  if (data.boundary_definition) {
    children.push(h2('Boundary Definition'))
    children.push(body(str(data.boundary_definition)))
  }
  if (Array.isArray(data.assumptions) && data.assumptions.length) {
    children.push(h2('Assumptions'))
    for (const a of data.assumptions) {
      const text = typeof a === 'string' ? a : str(a.assumption)
      children.push(bullet(text))
      if (a.consequence_if_violated) children.push(consequence(str(a.consequence_if_violated)))
    }
  }
}

function renderDriversAndPrinciples(data: any, children: Children) {
  children.push(h1('Business Context and Drivers'))
  if (Array.isArray(data.drivers) && data.drivers.length) {
    children.push(h2('Business Drivers'))
    for (const d of data.drivers) {
      children.push(h3(`${str(d.id)} — ${str(d.description).split('\n')[0].substring(0, 80)}`))
      if (d.description) children.push(body(str(d.description)))
      if (d.architecture_response) {
        children.push(body('Architecture response:'))
        children.push(body(str(d.architecture_response), 1))
      }
    }
  }
  if (Array.isArray(data.principles) && data.principles.length) {
    children.push(h2('Architecture Principles'))
    children.push(
      dataTable(
        ['ID', 'Principle', 'How Applied'],
        data.principles.map((p: any) => [str(p.id), str(p.name), str(p.how_applied)])
      )
    )
  }
}

function renderView(
  viewLabel: string,
  data: any,
  children: Children,
  diagramImages: Map<string, DiagramImage>,
  diagramKey: string,
) {
  children.push(h2(viewLabel))
  const desc = data.description ?? data.narrative ?? data.overview
  if (desc) children.push(body(str(desc)))

  // Render diagram if available
  const imgBuf = diagramImages.get(diagramKey)
  if (imgBuf && (Buffer.isBuffer(imgBuf) ? imgBuf.length > 0 : !!imgBuf.pngBase64)) {
    children.push(diagImage(imgBuf))
  } else if (data.diagram_source || data.diagram || data.mermaid || data.mermaid_source) {
    children.push(italicNote(`[${viewLabel} diagram could not be rendered for export]`))
  }

  // Narrative steps (data flow view)
  if (Array.isArray(data.narrative_steps)) {
    for (const step of data.narrative_steps) {
      children.push(bullet(`Step ${step.step ?? ''}: ${str(step.description)}`))
    }
  }
}

function renderArchitectureViews(data: any, children: Children, diagramImages: Map<string, DiagramImage>) {
  children.push(h1('Architecture Views'))
  const VIEW_LABELS: Record<string, string> = {
    context: 'Context View (C4 Level 1)',
    functional: 'Functional / Container View',
    deployment: 'Deployment View',
    data_flow: 'Data Flow View',
    security: 'Security View',
  }
  for (const [key, viewData] of Object.entries(data)) {
    if (typeof viewData !== 'object' || viewData === null) continue
    const viewLabel = VIEW_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const diagramKey = `sections.architecture_views.${key}.diagram_source`
    renderView(viewLabel, viewData, children, diagramImages, diagramKey)
  }
}

function renderCrosscuttingConcerns(data: any, children: Children) {
  children.push(h1('Crosscutting Concerns'))
  for (const [key, value] of Object.entries(data)) {
    children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())))
    if (typeof value === 'string') {
      children.push(body(value))
    } else if (Array.isArray(value)) {
      renderStringList(value, children)
    } else if (typeof value === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value as Record<string, any>)) {
        children.push(h3(k.replace(/_/g, ' ')))
        if (typeof v === 'string') children.push(body(v))
        else if (Array.isArray(v)) renderStringList(v, children)
      }
    }
  }
}

function renderArchitectureDecisions(data: any, children: Children) {
  children.push(h1('Architecture Decisions (ADRs)'))
  const adrs = Array.isArray(data) ? data : Object.values(data)
  for (const adr of adrs) {
    if (typeof adr !== 'object' || !adr) continue
    const title = `${str(adr.id) || ''} — ${str(adr.title) || str(adr.decision_title) || ''}`
    children.push(h2(title.replace(/^— /, '')))

    const pairs: Array<[string, string]> = []
    if (adr.status) pairs.push(['Status', str(adr.status)])
    if (adr.date) pairs.push(['Date', str(adr.date)])
    if (pairs.length) children.push(kvTable(pairs))

    if (adr.context) { children.push(h3('Context')); children.push(body(str(adr.context))) }
    if (adr.decision) { children.push(h3('Decision')); children.push(body(str(adr.decision))) }
    if (adr.rationale) { children.push(h3('Rationale')); children.push(body(str(adr.rationale))) }
    if (adr.consequences) { children.push(h3('Consequences')); children.push(body(str(adr.consequences))) }

    // Trade-offs (structured or string)
    if (adr.trade_offs) {
      children.push(h3('Trade-offs'))
      if (typeof adr.trade_offs === 'string') {
        children.push(body(str(adr.trade_offs)))
      } else if (typeof adr.trade_offs === 'object') {
        if (Array.isArray(adr.trade_offs.benefits) && adr.trade_offs.benefits.length) {
          children.push(body('Benefits:'))
          renderStringList(adr.trade_offs.benefits, children)
        }
        if (Array.isArray(adr.trade_offs.drawbacks) && adr.trade_offs.drawbacks.length) {
          children.push(body('Drawbacks:'))
          renderStringList(adr.trade_offs.drawbacks, children)
        }
      }
    }

    if (adr.revisit_trigger) { children.push(h3('Revisit Trigger')); children.push(body(str(adr.revisit_trigger))) }

    // Handle both 'alternatives_considered' and 'options' field names
    const alternatives = adr.alternatives_considered ?? adr.options
    if (Array.isArray(alternatives) && alternatives.length) {
      children.push(h3('Options Considered'))
      for (const alt of alternatives) {
        if (typeof alt === 'string') {
          children.push(bullet(alt))
        } else {
          const id = str(alt.id ?? alt.option ?? alt.name ?? '')
          const desc = str(alt.description ?? alt.reason ?? alt.rationale ?? '')
          const optTitle = id && desc ? `Option ${id}: ${desc}` : id || desc
          children.push(bullet(optTitle))
          if (Array.isArray(alt.pros) && alt.pros.length) {
            children.push(body('Pros:', 1))
            for (const p of alt.pros) children.push(bullet(str(p), 1))
          }
          if (Array.isArray(alt.cons) && alt.cons.length) {
            children.push(body('Cons:', 1))
            for (const c of alt.cons) children.push(bullet(str(c), 1))
          }
        }
      }
    }
  }
}

function renderQualityAttributes(data: any, children: Children) {
  children.push(h1('Quality Attributes'))
  const items = Array.isArray(data) ? data : Object.values(data)
  if (!items.length) return
  const table = objectTable(
    items.filter((item: any) => item && typeof item === 'object' && !Array.isArray(item)),
    itemSchema(sectionSchema('quality_attributes'))
  )
  if (table) children.push(table)
}

function renderOperationalModel(data: any, children: Children) {
  children.push(h1('Operational Model'))
  renderStructuredObject(data, children, sectionSchema('operational_model'), 2)
}

function renderImplementationGuidance(data: any, children: Children) {
  children.push(h1('Implementation'))
  for (const [key, value] of Object.entries(data)) {
    children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())))
    if (typeof value === 'string') children.push(body(value))
    else if (Array.isArray(value)) {
      // If array of objects with name/description, render as sub-items
      for (const item of value) {
        if (typeof item === 'string') {
          children.push(bullet(item))
        } else if (typeof item === 'object' && item !== null) {
          const name = str(item.name ?? item.title ?? item.id ?? '')
          const desc = str(item.description ?? item.purpose ?? '')
          if (name) children.push(h3(name))
          if (desc) children.push(body(desc))
          // Remaining string fields as labels
          for (const [k, v] of Object.entries(item)) {
            if (k === 'name' || k === 'title' || k === 'id' || k === 'description' || k === 'purpose') continue
            if (typeof v === 'string') children.push(label(k.replace(/_/g, ' '), v))
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value as Record<string, any>)) {
        children.push(h3(k.replace(/_/g, ' ')))
        if (typeof v === 'string') children.push(body(v))
        else if (Array.isArray(v)) renderStringList(v, children)
      }
    }
  }
}

function renderGovernance(data: any, children: Children) {
  children.push(h1('Governance and Compliance'))
  const schema = sectionSchema('governance')
  const compliance = data.compliance_mapping
  if (Array.isArray(compliance) && compliance.length) {
    children.push(h2('Compliance Mapping'))
    const table = objectTable(
      compliance.filter((item: any) => item && typeof item === 'object' && !Array.isArray(item)),
      itemSchema(propertySchema(schema, 'compliance_mapping'))
    )
    if (table) children.push(table)
  }
  const risks = data.risk_register
  if (Array.isArray(risks) && risks.length) {
    children.push(h2('Risk Register'))
    children.push(
      dataTable(
        ['Risk', 'Likelihood', 'Impact', 'Mitigation'],
        risks.map((r: any) => [str(r.risk), str(r.likelihood), str(r.impact), str(r.mitigation)])
      )
    )
  }
  if (data.review_cadence) {
    children.push(h2('Review Cadence'))
    children.push(body(str(data.review_cadence)))
  }
  // Remaining object sub-sections
  for (const [key, value] of Object.entries(data)) {
    if (['compliance_mapping', 'risk_register', 'review_cadence'].includes(key)) continue
    children.push(h2(displayLabel(key, propertySchema(schema, key))))
    if (typeof value === 'string') children.push(body(value))
    else if (Array.isArray(value)) renderStringList(value, children, 1, propertySchema(schema, key))
    else if (typeof value === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value as Record<string, any>)) {
        if (typeof v === 'string') children.push(label(displayLabel(k, propertySchema(propertySchema(schema, key), k)), v))
        else if (Array.isArray(v)) renderStringList(v, children, 1, propertySchema(propertySchema(schema, key), k))
      }
    }
  }
}

function renderRaid(data: any, children: Children) {
  children.push(h1('RAID Register'))
  const SECTION_LABELS: Record<string, string> = {
    risks: 'Risks',
    assumptions: 'Assumptions',
    issues: 'Issues',
    dependencies: 'Dependencies',
  }
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value) || !value.length) continue
    const sectionTitle = SECTION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    children.push(h2(sectionTitle))
    for (const item of value) {
      if (typeof item === 'string') {
        children.push(bullet(item))
        continue
      }
      if (typeof item !== 'object' || !item) continue
      const id = str(item.id ?? '')
      const desc = str(item.description ?? item.statement ?? item.text ?? '')
      const heading = id ? `${id}: ${desc.substring(0, 80)}` : desc.substring(0, 80)
      if (heading) children.push(h3(heading))
      if (desc && desc.length > 80) children.push(body(desc))
      const FIELD_LABELS: Record<string, string> = {
        likelihood: 'Likelihood',
        impact: 'Impact',
        owner: 'Owner',
        residual_risk: 'Residual Risk',
        status: 'Status',
        due_date: 'Due Date',
        dependency_type: 'Dependency Type',
        source: 'Source',
      }
      for (const [f, l] of Object.entries(FIELD_LABELS)) {
        if (item[f]) children.push(label(l, str(item[f])))
      }
      if (item.mitigation) {
        children.push(h3('Mitigation'))
        children.push(body(str(item.mitigation), 1))
      }
      if (item.resolution) {
        children.push(h3('Resolution'))
        children.push(body(str(item.resolution), 1))
      }
    }
  }
}

function renderDecisionsAndActions(data: any, children: Children) {
  children.push(h1('Governance Decision'))
  if (data.governance_outcome) {
    children.push(label('Outcome', str(data.governance_outcome)))
  }
  if (data.decision_statement) {
    children.push(h2('Decision Statement'))
    children.push(body(str(data.decision_statement)))
  }
  if (Array.isArray(data.conditions) && data.conditions.length) {
    children.push(h2('Conditions'))
    renderStringList(data.conditions, children)
  }
  if (Array.isArray(data.next_actions) && data.next_actions.length) {
    children.push(h2('Next Actions'))
    children.push(
      dataTable(
        ['Action', 'Owner', 'Target Date'],
        data.next_actions.map((a: any) => [str(a.action), str(a.owner), str(a.target_date)])
      )
    )
  }
}

function renderGettingStarted(data: any, children: Children) {
  children.push(h1('Getting Started'))
  if (data.estimated_time_to_first_deployment) {
    children.push(body(str(data.estimated_time_to_first_deployment)))
  }
  if (Array.isArray(data.prerequisites) && data.prerequisites.length) {
    children.push(h2('Prerequisites'))
    renderStringList(data.prerequisites, children)
  }
  if (Array.isArray(data.steps) && data.steps.length) {
    children.push(h2('Deployment Steps'))
    for (const step of data.steps) {
      if (typeof step === 'string') {
        children.push(bullet(step))
        continue
      }
      if (typeof step !== 'object' || !step) continue
      const stepTitle = str(step.title ?? step.name ?? `Step ${step.step ?? ''}`)
      children.push(h3(stepTitle))
      if (step.description) children.push(body(str(step.description)))
      if (step.command) {
        children.push(italicNote(str(step.command)))
      }
      if (step.validation) {
        children.push(body(`Validation: ${str(step.validation)}`, 1))
      }
    }
  }
  if (Array.isArray(data.troubleshooting) && data.troubleshooting.length) {
    children.push(h2('Troubleshooting'))
    for (const t of data.troubleshooting) {
      if (typeof t === 'string') {
        children.push(bullet(t))
      } else if (typeof t === 'object' && t) {
        children.push(h3(str(t.symptom ?? '')))
        if (t.cause) children.push(label('Cause', str(t.cause)))
        if (t.resolution) children.push(body(str(t.resolution), 1))
      }
    }
  }
  // Any remaining fields
  for (const [key, value] of Object.entries(data)) {
    if (['estimated_time_to_first_deployment', 'prerequisites', 'steps', 'troubleshooting'].includes(key)) continue
    children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())))
    if (typeof value === 'string') children.push(body(value))
    else if (Array.isArray(value)) renderStringList(value, children)
  }
}

function renderEvolution(data: any, children: Children) {
  children.push(h1('Evolution Roadmap'))
  if (data.version) children.push(label('Current Version', str(data.version)))
  if (Array.isArray(data.known_limitations) && data.known_limitations.length) {
    children.push(h2('Known Limitations'))
    renderStringList(data.known_limitations, children)
  }
  if (Array.isArray(data.roadmap) && data.roadmap.length) {
    children.push(h2('Roadmap'))
    for (const milestone of data.roadmap) {
      if (typeof milestone !== 'object' || !milestone) continue
      const milestoneTitle = `v${str(milestone.version)} — ${str(milestone.planned_date)}`
      children.push(h3(milestoneTitle))
      if (Array.isArray(milestone.planned_changes)) {
        renderStringList(milestone.planned_changes, children)
      }
    }
  }
  // Remaining fields
  for (const [key, value] of Object.entries(data)) {
    if (['version', 'known_limitations', 'roadmap'].includes(key)) continue
    children.push(h2(key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())))
    if (typeof value === 'string') children.push(body(value))
    else if (Array.isArray(value)) renderStringList(value, children)
  }
}

function renderGlossary(data: any, children: Children) {
  children.push(h1('Glossary'))
  const items = Array.isArray(data) ? data : Object.values(data)
  if (!items.length) return
  children.push(
    dataTable(
      ['Term', 'Definition'],
      items.map((g: any) =>
        typeof g === 'object' ? [str(g.term ?? g.name ?? ''), str(g.definition ?? '')] : [str(g), '']
      )
    )
  )
}

// Generic fallback for unknown sections
function renderGenericSection(title: string, data: any, children: Children, schema?: JsonSchemaNode | null) {
  children.push(h1(title))
  renderStructuredValue(data, children, schema, 2)
}

// Component catalog / classification — array of components with name/type/etc.
function renderComponentSection(title: string, data: any, children: Children) {
  children.push(h1(title))
  const items = Array.isArray(data.components ?? data) ? (data.components ?? data) : []
  if (items.length && typeof items[0] === 'object') {
    const headers = ['Name', 'Type', 'Technology', 'Responsibility']
    const rows = items.map((c: any) => [
      str(c.name),
      str(c.type),
      str(c.technology),
      str(c.responsibility),
    ])
    children.push(dataTable(headers, rows))
  }
  if (data.mandatory_components) {
    children.push(h2('Mandatory Components'))
    renderStringList(data.mandatory_components, children)
  }
  if (data.optional_components) {
    children.push(h2('Optional Components'))
    renderStringList(data.optional_components, children)
  }
}

// ─── Document assembly ────────────────────────────────────────────────────────

const KNOWN_SECTIONS: Record<
  string,
  (data: any, children: Children, diagrams: Map<string, DiagramImage>) => void
> = {
  reading_guide: (d, c) => renderReadingGuide(d, c),
  scope: (d, c) => renderScope(d, c),
  drivers_and_principles: (d, c) => renderDriversAndPrinciples(d, c),
  architecture_views: (d, c, imgs) => renderArchitectureViews(d, c, imgs),
  crosscutting_concerns: (d, c) => renderCrosscuttingConcerns(d, c),
  decisions: (d, c) => renderArchitectureDecisions(d, c),
  architecture_decisions: (d, c) => renderArchitectureDecisions(d, c),
  quality_attributes: (d, c) => renderQualityAttributes(d, c),
  operational_model: (d, c) => renderOperationalModel(d, c),
  implementation_guidance: (d, c) => renderImplementationGuidance(d, c),
  implementation_artifacts: (d, c) => renderImplementationGuidance(d, c),
  governance: (d, c) => renderGovernance(d, c),
  raid: (d, c) => renderRaid(d, c),
  decisions_and_actions: (d, c) => renderDecisionsAndActions(d, c),
  getting_started: (d, c) => renderGettingStarted(d, c),
  evolution: (d, c) => renderEvolution(d, c),
  glossary: (d, c) => renderGlossary(d, c),
  component_classification: (d, c) => renderComponentSection('Component Classification', d, c),
  components: (d, c) => renderComponentSection('Components', d, c),
}

// Logical reading order — decisions before quality/operational, RAID after governance
const SECTION_ORDER = [
  'reading_guide',
  'scope',
  'drivers_and_principles',
  'architecture_views',
  'crosscutting_concerns',
  'component_classification',
  'components',
  'decisions',
  'architecture_decisions',
  'quality_attributes',
  'operational_model',
  'implementation_guidance',
  'implementation_artifacts',
  'governance',
  'raid',
  'decisions_and_actions',
  'getting_started',
  'evolution',
  'glossary',
]

function titlePage(meta: Record<string, any>): Paragraph[] {
  const title = str(meta.title) || 'Architecture Artifact'
  const subtitle = str(meta.artifact_type ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return [
    new Paragraph({ style: 'Normal', children: [], spacing: { before: 2000 } }),
    new Paragraph({
      style: 'Title',
      children: [new TextRun({ text: title, font: 'Arial', size: 56, bold: true, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [new TextRun({ text: subtitle, font: 'Arial', size: 28, color: MID_GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [
        new TextRun({ text: `Version ${str(meta.version) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [new TextRun({ text: `Status: ${str(meta.status) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [new TextRun({ text: `Owner: ${str(meta.owner) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [
        new TextRun({
          text: str(meta.effective_date) ? `Effective: ${str(meta.effective_date)}` : '',
          font: 'Arial',
          size: 20,
          color: MID_GREY,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    pageBreak(),
  ]
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportToDocx(
  artifactData: ArtifactData,
  browserRenderedDiagrams?: Record<string, unknown>,
): Promise<Buffer> {
  const meta = artifactData.metadata ?? {}
  const sections = artifactData.sections ?? {}
  const isBrowserExport = browserRenderedDiagrams !== undefined

  // 1. Extract all diagram references
  const diagRefs = extractDiagrams(artifactData)

  // 2. Load browser-rendered diagrams first, then fall back to Kroki when needed.
  const diagramImages = new Map<string, DiagramImage>()
  for (const diagRef of diagRefs) {
    const browserRendered = browserRenderedDiagrams?.[diagRef.key]
    if (isBrowserRenderedDiagram(browserRendered)) {
      diagramImages.set(diagRef.key, browserRendered)
    }
  }

  const missingDiagRefs = diagRefs.filter((diagRef) => !diagramImages.has(diagRef.key))

  if (isBrowserExport && missingDiagRefs.length) {
    throw new Error(
      `Missing browser-rendered diagrams for export: ${missingDiagRefs.map((diagRef) => diagRef.label).join(', ')}`,
    )
  }

  if (!isBrowserExport) {
    const BATCH = 10
    for (let i = 0; i < missingDiagRefs.length; i += BATCH) {
      const batch = missingDiagRefs.slice(i, i + BATCH)
      const results = await Promise.all(batch.map((r) => renderMermaidDiagram(r.source, r.label)))
      batch.forEach((r, idx) => diagramImages.set(r.key, results[idx]))
    }
  }

  // 3. Build document body
  const children: Children = []

  // Title page
  for (const p of titlePage(meta)) children.push(p)

  // Metadata block
  if (Object.keys(meta).length) {
    renderMetadata(meta, children)
    children.push(horizontalRule())
  }

  // Table of Contents (after metadata, before content)
  children.push(pageBreak())
  children.push(
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-3',
    })
  )
  children.push(pageBreak())

  // Sections — known first (in preferred order), then unknowns
  const rendered = new Set<string>()

  for (const key of SECTION_ORDER) {
    if (key in sections) {
      const renderer = KNOWN_SECTIONS[key]
      if (renderer) {
        children.push(pageBreak())
        renderer(sections[key], children, diagramImages)
        rendered.add(key)
      }
    }
  }

  // Unknown sections (anything not in SECTION_ORDER or KNOWN_SECTIONS)
  for (const [key, value] of Object.entries(sections)) {
    if (!rendered.has(key)) {
      children.push(pageBreak())
      const renderer = KNOWN_SECTIONS[key]
      if (renderer) {
        renderer(value, children, diagramImages)
      } else {
        const schema = sectionSchema(key)
        const title = displayLabel(key, schema)
        renderGenericSection(title, value, children, schema)
      }
      rendered.add(key)
    }
  }

  // Top-level keys outside of sections (e.g. glossary in some artifact formats)
  const TOP_LEVEL_SKIP = new Set(['kind', 'artifact_type', 'metadata', 'sections'])
  for (const [key, value] of Object.entries(artifactData)) {
    if (TOP_LEVEL_SKIP.has(key) || rendered.has(key)) continue
    children.push(pageBreak())
    const renderer = KNOWN_SECTIONS[key]
    if (renderer) {
      renderer(value, children, diagramImages)
    } else {
      const schema = topLevelSchema(key)
      const title = displayLabel(key, schema)
      renderGenericSection(title, value, children, schema)
    }
  }

  // 4. Assemble the Word document
  const title = str(meta.title) || 'Architecture Artifact'
  const doc = new Document({
    title,
    creator: str(meta.owner) || 'EaROS',
    description: str(meta.purpose),
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                style: 'Normal',
                children: [
                  new TextRun({ text: title, font: 'Arial', size: 16, color: MID_GREY }),
                  new TextRun({ text: '\t', font: 'Arial', size: 16 }),
                  new TextRun({ text: 'EaROS Architecture Document', font: 'Arial', size: 16, color: MID_GREY }),
                ],
                border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                style: 'Normal',
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: MID_GREY }),
                  new SimpleField('PAGE'),
                  new TextRun({ text: ' of ', font: 'Arial', size: 16, color: MID_GREY }),
                  new SimpleField('NUMPAGES'),
                ],
                border: { top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
              }),
            ],
          }),
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

// ─── Rubric Word Export ──────────────────────────────────────────────────────

function rubricTitlePage(data: Record<string, any>): Paragraph[] {
  const title = str(data.title) || 'EaROS Rubric'
  const kind = str(data.kind ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return [
    new Paragraph({ style: 'Normal', children: [], spacing: { before: 2000 } }),
    new Paragraph({
      style: 'Title',
      children: [new TextRun({ text: title, font: 'Arial', size: 56, bold: true, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [new TextRun({ text: kind, font: 'Arial', size: 28, color: MID_GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
    }),
    new Paragraph({
      style: 'Normal',
      children: [
        new TextRun({ text: `${str(data.rubric_id)} · v${str(data.version) || '—'}`, font: 'Arial', size: 22, color: DARK_GREY }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
  ]
}

export async function exportRubricToDocx(rubricData: Record<string, any>): Promise<Buffer> {
  const children: Children = []

  // Title page
  for (const p of rubricTitlePage(rubricData)) children.push(p)

  // Metadata
  const metaPairs: Array<[string, string]> = []
  if (rubricData.rubric_id) metaPairs.push(['Rubric ID', str(rubricData.rubric_id)])
  if (rubricData.version) metaPairs.push(['Version', str(rubricData.version)])
  if (rubricData.kind) metaPairs.push(['Kind', str(rubricData.kind)])
  if (rubricData.status) metaPairs.push(['Status', str(rubricData.status)])
  if (rubricData.artifact_type) metaPairs.push(['Artifact Type', str(rubricData.artifact_type)])
  if (rubricData.design_method) metaPairs.push(['Design Method', str(rubricData.design_method)])
  if (rubricData.owner) metaPairs.push(['Owner', str(rubricData.owner)])
  if (rubricData.effective_date) metaPairs.push(['Effective Date', str(rubricData.effective_date)])
  if (rubricData.inherits?.length) metaPairs.push(['Inherits', rubricData.inherits.join(', ')])
  if (metaPairs.length) {
    children.push(kvTable(metaPairs))
    children.push(horizontalRule())
  }

  // Table of Contents
  children.push(pageBreak())
  children.push(new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }))

  // Dimensions & criteria
  const dimensions = rubricData.dimensions ?? []
  for (const dim of dimensions) {
    children.push(pageBreak())
    const weight = dim.weight != null ? ` (weight: ${dim.weight})` : ''
    children.push(h1(`${str(dim.name)}${weight}`))
    if (dim.description) children.push(italicNote(str(dim.description)))

    const criteria = dim.criteria ?? []
    for (const c of criteria) {
      children.push(h2(`${str(c.id)}: ${str(c.question)}`))
      if (c.description) children.push(body(str(c.description)))

      // Gate
      if (c.gate && typeof c.gate === 'object' && c.gate.enabled) {
        const gateText = `${c.gate.severity ?? 'unknown'}${c.gate.failure_effect ? ` — ${c.gate.failure_effect}` : ''}`
        children.push(label('Gate', gateText))
      } else {
        children.push(label('Gate', 'None'))
      }

      // Required evidence
      if (c.required_evidence?.length) {
        children.push(h3('Required Evidence'))
        for (const ev of c.required_evidence) children.push(bullet(str(ev)))
      }

      // Scoring guide
      if (c.scoring_guide) {
        children.push(h3('Scoring Guide'))
        const sgRows = Object.entries(c.scoring_guide).map(([level, desc]) => [level, str(desc)])
        children.push(dataTable(['Level', 'Description'], sgRows))
      }

      // Anti-patterns
      if (c.anti_patterns?.length) {
        children.push(h3('Anti-patterns'))
        for (const ap of c.anti_patterns) children.push(bullet(str(ap)))
      }

      // Examples
      if (c.examples?.good?.length) {
        children.push(h3('Good Examples'))
        for (const ex of c.examples.good) children.push(bullet(str(ex)))
      }
      if (c.examples?.bad?.length) {
        children.push(h3('Bad Examples'))
        for (const ex of c.examples.bad) children.push(bullet(str(ex)))
      }

      // Decision tree
      if (c.decision_tree) {
        children.push(h3('Decision Tree'))
        children.push(body(str(c.decision_tree), 1))
      }

      // Remediation hints
      if (c.remediation_hints?.length) {
        children.push(h3('Remediation Hints'))
        for (const hint of c.remediation_hints) children.push(bullet(str(hint)))
      }

      children.push(horizontalRule())
    }
  }

  // Scoring section
  if (rubricData.scoring) {
    children.push(pageBreak())
    children.push(h1('Scoring Model'))
    const scoring = rubricData.scoring
    if (scoring.scale) children.push(label('Scale', str(scoring.scale)))
    if (scoring.method) children.push(label('Method', str(scoring.method)))
    if (scoring.thresholds) {
      children.push(h2('Thresholds'))
      const thPairs = Object.entries(scoring.thresholds).map(([k, v]) =>
        [prettyLabel(k), str(v)] as [string, string])
      children.push(kvTable(thPairs))
    }
  }

  // Outputs
  if (rubricData.outputs) {
    children.push(pageBreak())
    children.push(h1('Outputs'))
    const outPairs = Object.entries(rubricData.outputs).map(([k, v]) =>
      [prettyLabel(k), str(v)] as [string, string])
    children.push(kvTable(outPairs))
  }

  const title = str(rubricData.title) || 'EaROS Rubric'
  const doc = new Document({
    title,
    creator: str(rubricData.owner) || 'EaROS',
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            style: 'Normal',
            children: [
              new TextRun({ text: title, font: 'Arial', size: 16, color: MID_GREY }),
              new TextRun({ text: '\t', font: 'Arial', size: 16 }),
              new TextRun({ text: 'EaROS Rubric Document', font: 'Arial', size: 16, color: MID_GREY }),
            ],
            border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            style: 'Normal',
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: MID_GREY }),
              new SimpleField('PAGE'),
              new TextRun({ text: ' of ', font: 'Arial', size: 16, color: MID_GREY }),
              new SimpleField('NUMPAGES'),
            ],
            border: { top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
          })],
        }),
      },
      children,
    }],
  })

  return Packer.toBuffer(doc)
}

// ─── Evaluation Word Export ──────────────────────────────────────────────────

export async function exportEvaluationToDocx(evalData: Record<string, any>): Promise<Buffer> {
  const children: Children = []

  const artifactTitle = str(evalData.artifact_ref?.title ?? evalData.artifact_title ?? 'Architecture Assessment')
  const rubricId = str(evalData.rubric_id ?? '')
  const evalDate = str(evalData.evaluation_date ?? '')

  // Title page
  children.push(new Paragraph({ style: 'Normal', children: [], spacing: { before: 2000 } }))
  children.push(new Paragraph({
    style: 'Title',
    children: [new TextRun({ text: 'EaROS Architecture Assessment Report', font: 'Arial', size: 56, bold: true, color: NAVY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }))
  children.push(new Paragraph({
    style: 'Normal',
    children: [new TextRun({ text: artifactTitle, font: 'Arial', size: 28, color: MID_GREY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  }))
  if (rubricId || evalDate) {
    children.push(new Paragraph({
      style: 'Normal',
      children: [new TextRun({ text: `${rubricId}${evalDate ? ` · ${evalDate}` : ''}`, font: 'Arial', size: 22, color: DARK_GREY })],
      alignment: AlignmentType.CENTER,
    }))
  }

  // Metadata
  const metaPairs: Array<[string, string]> = []
  if (evalData.evaluation_id) metaPairs.push(['Evaluation ID', str(evalData.evaluation_id)])
  if (rubricId) metaPairs.push(['Rubric', rubricId])
  if (evalData.rubric_version) metaPairs.push(['Rubric Version', str(evalData.rubric_version)])
  if (artifactTitle) metaPairs.push(['Artifact', artifactTitle])
  if (evalData.artifact_ref?.artifact_version) metaPairs.push(['Artifact Version', str(evalData.artifact_ref.artifact_version)])
  if (evalDate) metaPairs.push(['Evaluation Date', evalDate])
  if (evalData.evaluators?.length) {
    metaPairs.push(['Evaluators', evalData.evaluators.map((e: any) => `${str(e.role)} (${str(e.mode)})`).join(', ')])
  }
  if (metaPairs.length) {
    children.push(kvTable(metaPairs))
    children.push(horizontalRule())
  }

  // Table of Contents
  children.push(pageBreak())
  children.push(new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }))

  // Criterion results
  const criterionResults = evalData.criterion_results ?? []
  if (criterionResults.length > 0) {
    children.push(pageBreak())
    children.push(h1('Score Dashboard'))

    const dashHeaders = ['Criterion', 'Score', 'Confidence', 'Evidence Class']
    const dashRows = criterionResults.map((cr: any) => [
      str(cr.criterion_id),
      cr.score != null ? String(cr.score) : '-',
      str(cr.confidence),
      str(cr.evidence_class ?? cr.judgment_type),
    ])
    children.push(dataTable(dashHeaders, dashRows))

    // Per-criterion details
    children.push(pageBreak())
    children.push(h1('Criterion Details'))

    for (const cr of criterionResults) {
      children.push(h2(str(cr.criterion_id)))
      children.push(label('Score', cr.score != null ? String(cr.score) : '-'))
      if (cr.confidence) children.push(label('Confidence', str(cr.confidence)))
      const evClass = cr.evidence_class ?? cr.judgment_type
      if (evClass) children.push(label('Evidence Class', str(evClass)))
      if (cr.rationale) children.push(body(str(cr.rationale)))
      if (cr.evidence_refs?.length) {
        children.push(h3('Evidence'))
        for (const ref of cr.evidence_refs) {
          if (typeof ref === 'string') {
            children.push(bullet(str(ref)))
            continue
          }
          const quote = ref.quotation ?? ref.excerpt
          const source = ref.section ?? ref.location
          if (quote) children.push(bullet(str(quote)))
          if (source && source !== 'see evidence field') children.push(italicNote(`Location: ${str(source)}`))
        }
      }
      children.push(horizontalRule())
    }
  }

  const title = `EaROS Assessment — ${artifactTitle}`
  const doc = new Document({
    title,
    creator: 'EaROS',
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            style: 'Normal',
            children: [
              new TextRun({ text: artifactTitle, font: 'Arial', size: 16, color: MID_GREY }),
              new TextRun({ text: '\t', font: 'Arial', size: 16 }),
              new TextRun({ text: 'EaROS Assessment Report', font: 'Arial', size: 16, color: MID_GREY }),
            ],
            border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            style: 'Normal',
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: MID_GREY }),
              new SimpleField('PAGE'),
              new TextRun({ text: ' of ', font: 'Arial', size: 16, color: MID_GREY }),
              new SimpleField('NUMPAGES'),
            ],
            border: { top: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 } },
          })],
        }),
      },
      children,
    }],
  })

  return Packer.toBuffer(doc)
}
