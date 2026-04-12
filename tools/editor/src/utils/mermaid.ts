import mermaid from 'mermaid'

let mermaidInitialized = false
let mermaidRenderSerial = 0
const LOCAL_MERMAID_IMAGE_PREFIXES = ['/icons/', '/mermaid-icons/', './icons/', './mermaid-icons/']
const LOCAL_ASSET_DATA_URL_CACHE = new Map<string, Promise<string>>()
const MERMAID_IMAGE_MIME_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export interface MermaidDiagramRef {
  key: string
  source: string
  label: string
}

export interface RenderedDiagramPng {
  pngBase64?: string
  svgText?: string
  width: number
  height: number
}

export function ensureMermaidInit() {
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    mermaidInitialized = true
  }
}

export async function renderMermaidSvg(code: string, prefix = 'mermaid'): Promise<string> {
  ensureMermaidInit()
  const renderId = `${prefix}-${Date.now()}-${mermaidRenderSerial++}`
  const { svg } = await mermaid.render(renderId, code)
  return svg
}

export function getSvgIntrinsicSize(svgMarkup: string): { width: number; height: number } {
  const svgDoc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
  const svg = svgDoc.documentElement

  const widthAttr = Number.parseFloat(svg.getAttribute('width') ?? '')
  const heightAttr = Number.parseFloat(svg.getAttribute('height') ?? '')
  if (Number.isFinite(widthAttr) && Number.isFinite(heightAttr) && widthAttr > 0 && heightAttr > 0) {
    return { width: widthAttr, height: heightAttr }
  }

  const viewBox = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number.parseFloat(value))
  if (viewBox.length === 4 && Number.isFinite(viewBox[2]) && Number.isFinite(viewBox[3]) && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] }
  }

  return { width: 580, height: 340 }
}

export function extractMermaidDiagrams(obj: any, path = '', label = ''): MermaidDiagramRef[] {
  if (!obj || typeof obj !== 'object') return []

  const refs: MermaidDiagramRef[] = []
  const DIAGRAM_FIELDS = new Set(['diagram_source', 'diagram', 'mermaid', 'mermaid_source'])

  for (const [key, value] of Object.entries(obj)) {
    const nextPath = path ? `${path}.${key}` : key
    const nextLabel = label ? `${label} › ${key}` : key

    if (DIAGRAM_FIELDS.has(key) && typeof value === 'string' && value.trim()) {
      refs.push({ key: nextPath, source: value.trim(), label: nextLabel })
      continue
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => refs.push(...extractMermaidDiagrams(item, `${nextPath}[${index}]`, `${nextLabel}[${index}]`)))
      continue
    }

    if (value && typeof value === 'object') {
      refs.push(...extractMermaidDiagrams(value, nextPath, nextLabel))
    }
  }

  return refs
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob as data URL'))
    reader.readAsDataURL(blob)
  })
}

function inferMimeType(assetPath: string): string {
  const extension = assetPath.slice(assetPath.lastIndexOf('.')).toLowerCase()
  return MERMAID_IMAGE_MIME_TYPES[extension] ?? 'application/octet-stream'
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to decode image asset: ${src.slice(0, 64)}`))
    img.src = src
  })
}

async function rasterizeSvgAssetToPngDataUrl(bytes: ArrayBuffer): Promise<string> {
  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = await loadImageElement(blobUrl)
    const width = Math.max(1, image.naturalWidth || image.width || 64)
    const height = Math.max(1, image.naturalHeight || image.height || 64)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context is unavailable')

    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

interface LocalAssetDataUrlOptions {
  rasterizeSvg?: boolean
}

function localAssetCacheKey(assetPath: string, options?: LocalAssetDataUrlOptions): string {
  return `${options?.rasterizeSvg ? 'png' : 'raw'}:${assetPath}`
}

async function fetchLocalAssetAsDataUrl(assetPath: string, options?: LocalAssetDataUrlOptions): Promise<string> {
  const response = await fetch(assetPath)
  if (!response.ok) {
    throw new Error(`Failed to load Mermaid asset ${assetPath}: HTTP ${response.status}`)
  }

  const bytes = await response.arrayBuffer()
  const contentType = response.headers.get('content-type')?.split(';', 1)[0] || inferMimeType(assetPath)
  if (!contentType.startsWith('image/')) {
    throw new Error(`Mermaid asset ${assetPath} resolved to non-image content type: ${contentType}`)
  }
  if (options?.rasterizeSvg && contentType === 'image/svg+xml') {
    return rasterizeSvgAssetToPngDataUrl(bytes)
  }
  return blobToDataUrl(new Blob([bytes], { type: contentType }))
}

function getLocalAssetDataUrl(assetPath: string, options?: LocalAssetDataUrlOptions): Promise<string> {
  const cacheKey = localAssetCacheKey(assetPath, options)
  const cached = LOCAL_ASSET_DATA_URL_CACHE.get(cacheKey)
  if (cached) return cached

  const dataUrlPromise = fetchLocalAssetAsDataUrl(assetPath, options)
  LOCAL_ASSET_DATA_URL_CACHE.set(cacheKey, dataUrlPromise)
  return dataUrlPromise
}

export async function inlineLocalMermaidImagesInSource(diagramSource: string): Promise<string> {
  // Match both absolute (/icons/...) and relative (./icons/...) image paths
  const imagePattern = /img:\s*(['"])(\.?\/(?:icons|mermaid-icons)\/[^'"]+)\1/g
  let rebuiltSource = ''
  let lastIndex = 0

  for (const match of diagramSource.matchAll(imagePattern)) {
    const [fullMatch, quote, assetPath] = match
    const matchIndex = match.index ?? 0
    const dataUrl = await getLocalAssetDataUrl(assetPath)

    rebuiltSource += diagramSource.slice(lastIndex, matchIndex)
    rebuiltSource += `img: ${quote}${dataUrl}${quote}`
    lastIndex = matchIndex + fullMatch.length
  }

  if (lastIndex === 0) return diagramSource
  rebuiltSource += diagramSource.slice(lastIndex)
  return rebuiltSource
}

export async function inlineLocalMermaidImagesInSvg(
  svgMarkup: string,
  options?: { rasterizeSvgAssets?: boolean },
): Promise<string> {
  const svgDoc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
  const svg = svgDoc.documentElement
  const XLINK_NS = 'http://www.w3.org/1999/xlink'
  const images = Array.from(svg.querySelectorAll('image'))

  await Promise.all(images.map(async (image) => {
    let href = image.getAttribute('href') ?? image.getAttributeNS(XLINK_NS, 'href') ?? ''
    // Normalize ./icons/ → /icons/ so the prefix check matches both forms
    if (href.startsWith('./')) href = href.slice(1)
    if (!LOCAL_MERMAID_IMAGE_PREFIXES.some((prefix) => href.startsWith(prefix))) return

    const dataUrl = await getLocalAssetDataUrl(href, { rasterizeSvg: options?.rasterizeSvgAssets === true })
    image.setAttribute('href', dataUrl)
    image.setAttributeNS(XLINK_NS, 'xlink:href', dataUrl)
  }))

  return new XMLSerializer().serializeToString(svg)
}

export async function rasterizeSvgToPng(svgMarkup: string): Promise<RenderedDiagramPng> {
  const { width, height } = getSvgIntrinsicSize(svgMarkup)
  const scale = 2
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  const blobUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImageElement(blobUrl)

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.ceil(width * scale))
    canvas.height = Math.max(1, Math.ceil(height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context is unavailable')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.scale(scale, scale)
    context.drawImage(image, 0, 0, width, height)

    const pngBase64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
    return { pngBase64, width, height }
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
