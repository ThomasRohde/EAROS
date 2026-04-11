/**
 * EaROS — Markdown export utilities for artifacts, rubrics, and evaluations.
 *
 * Pure client-side functions that convert structured data objects to Markdown strings.
 */

// ─── Shared helpers ──────────────────────────────────────────────────────────

function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function str(v: any): string {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function mdTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return ''
  const sep = headers.map(() => '---')
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`),
  ]
  return lines.join('\n')
}

function mdList(items: string[]): string {
  return items.map((i) => `- ${i}`).join('\n')
}

function isPlainObject(v: any): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function isScalar(v: any): boolean {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
}

function scalarStr(v: any): string {
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function hasNestedStructure(items: any[]): boolean {
  return items.some((item) =>
    isPlainObject(item) &&
    Object.values(item).some((v) => {
      if (Array.isArray(v)) return v.length > 0
      return isPlainObject(v)
    }),
  )
}

function unionKeys(items: any[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const item of items) {
    if (!isPlainObject(item)) continue
    for (const k of Object.keys(item)) {
      if (!seen.has(k)) {
        seen.add(k)
        ordered.push(k)
      }
    }
  }
  return ordered
}

function itemHeading(item: Record<string, any>, idx: number): string {
  // Prefer a human-readable label over an opaque id
  const labelKeys = ['name', 'title', 'label', 'option_name', 'id', 'key', 'version']
  for (const k of labelKeys) {
    const s = scalarStr(item[k])
    if (s) return s
  }
  // Fall back to the first scalar value so the heading still carries signal
  for (const v of Object.values(item)) {
    if (isScalar(v)) {
      const s = scalarStr(v)
      if (s) return s
    }
  }
  return `Item ${idx + 1}`
}

function renderObjectItemMd(item: Record<string, any>, level: number): string {
  const lines: string[] = []
  const hl = '#'.repeat(Math.min(level, 6))
  for (const [key, child] of Object.entries(item)) {
    if (child == null) continue
    if (isScalar(child)) {
      const s = scalarStr(child)
      if (s) lines.push(`- **${humanize(key)}:** ${s}`)
    } else if (Array.isArray(child)) {
      if (child.length === 0) continue
      if (child.every(isScalar)) {
        lines.push(`- **${humanize(key)}:**`)
        for (const v of child) lines.push(`  - ${scalarStr(v)}`)
      } else if (child.every(isPlainObject)) {
        lines.push(`\n${hl} ${humanize(key)}\n`)
        lines.push(renderObjectArrayMd(child, level + 1))
      } else {
        lines.push(`- **${humanize(key)}:**`)
        for (const v of child) {
          if (isScalar(v)) lines.push(`  - ${scalarStr(v)}`)
          else if (isPlainObject(v)) lines.push(renderObjectItemMd(v, level + 1))
        }
      }
    } else if (isPlainObject(child)) {
      lines.push(`\n${hl} ${humanize(key)}\n`)
      for (const [ck, cv] of Object.entries(child)) {
        if (cv == null) continue
        if (isScalar(cv)) {
          const s = scalarStr(cv)
          if (s) lines.push(`- **${humanize(ck)}:** ${s}`)
        } else if (Array.isArray(cv) && cv.length > 0) {
          if (cv.every(isScalar)) {
            lines.push(`- **${humanize(ck)}:**`)
            for (const v of cv) lines.push(`  - ${scalarStr(v)}`)
          } else {
            lines.push(`\n${'#'.repeat(Math.min(level + 2, 6))} ${humanize(ck)}\n`)
            lines.push(renderValueMd(cv, level + 2))
          }
        } else if (isPlainObject(cv)) {
          lines.push(`\n${'#'.repeat(Math.min(level + 2, 6))} ${humanize(ck)}\n`)
          lines.push(renderObjectItemMd(cv, level + 2))
        }
      }
    }
  }
  return lines.join('\n')
}

function renderObjectArrayMd(items: any[], level: number): string {
  const hl = '#'.repeat(Math.min(level, 6))
  const lines: string[] = []
  items.forEach((item, idx) => {
    if (!isPlainObject(item)) return
    lines.push(`\n${hl} ${itemHeading(item, idx)}\n`)
    lines.push(renderObjectItemMd(item, level + 1))
  })
  return lines.join('\n')
}

export function downloadAsFile(content: string, filename: string, mimeType: string): void {
  if (typeof document === 'undefined') return // Node.js — no browser download
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Artifact Markdown ───────────────────────────────────────────────────────

// Per-artifact-type canonical section order. Keys not listed are appended
// in their original object order.
const SECTION_ORDER_BY_TYPE: Record<string, string[]> = {
  reference_architecture: [
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
  ],
  solution_architecture: [
    'reading_guide',
    'scope',
    'drivers_and_principles',
    'solution_options',
    'quality_attributes',
    'operational_model',
    'raid',
    'governance',
    'decisions_and_actions',
    'glossary',
  ],
  architecture_decision_record: [
    'decision',
    'stakeholders',
    'governance',
    'glossary',
  ],
}

function sectionOrderFor(artifactType: string | undefined): string[] {
  if (artifactType && SECTION_ORDER_BY_TYPE[artifactType]) return SECTION_ORDER_BY_TYPE[artifactType]
  return SECTION_ORDER_BY_TYPE.reference_architecture
}

function renderMetadataMd(meta: Record<string, any>): string {
  const lines: string[] = []
  const skip = new Set(['title', 'artifact_type'])
  for (const [key, value] of Object.entries(meta)) {
    if (skip.has(key)) continue
    if (value == null) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      if (isPlainObject(value[0])) {
        lines.push(`\n**${humanize(key)}:**\n`)
        if (hasNestedStructure(value)) {
          lines.push(renderObjectArrayMd(value, 4))
        } else {
          const keys = unionKeys(value)
          lines.push(mdTable(keys.map(humanize), value.map((item) => keys.map((k) => str(item[k])))))
        }
      } else {
        lines.push(`**${humanize(key)}:** ${value.map(str).join(', ')}`)
      }
    } else if (isPlainObject(value)) {
      lines.push(`**${humanize(key)}:**`)
      for (const [k, v] of Object.entries(value)) {
        lines.push(`- ${humanize(k)}: ${str(v)}`)
      }
    } else {
      lines.push(`**${humanize(key)}:** ${str(value)}`)
    }
  }
  return lines.join('\n')
}

function renderValueMd(value: any, level: number): string {
  const lines: string[] = []
  const hl = '#'.repeat(Math.min(level, 6))

  if (typeof value === 'string') {
    // Check for Mermaid diagram source
    if (value.trim().startsWith('graph ') || value.trim().startsWith('flowchart ') ||
        value.trim().startsWith('sequenceDiagram') || value.trim().startsWith('classDiagram') ||
        value.trim().startsWith('stateDiagram') || value.trim().startsWith('erDiagram') ||
        value.trim().startsWith('gantt') || value.trim().startsWith('pie') ||
        value.trim().startsWith('journey') || value.trim().startsWith('C4') ||
        value.trim().startsWith('mindmap') || value.trim().startsWith('timeline') ||
        value.trim().startsWith('block-beta') || value.trim().startsWith('architecture-beta')) {
      lines.push('```mermaid', value.trim(), '```')
    } else {
      lines.push(value)
    }
  } else if (Array.isArray(value)) {
    if (value.length === 0) return ''
    if (value.every(isScalar)) {
      lines.push(mdList(value.map((v) => scalarStr(v))))
    } else if (value.every(isPlainObject)) {
      if (hasNestedStructure(value)) {
        lines.push(renderObjectArrayMd(value, level))
      } else {
        const keys = unionKeys(value)
        lines.push(mdTable(keys.map(humanize), value.map((item) => keys.map((k) => str(item[k])))))
      }
    } else {
      // Mixed array — render each item safely
      value.forEach((item, idx) => {
        if (isScalar(item)) {
          lines.push(`- ${scalarStr(item)}`)
        } else if (isPlainObject(item)) {
          lines.push(`\n${hl} ${itemHeading(item, idx)}\n`)
          lines.push(renderObjectItemMd(item, level + 1))
        }
      })
    }
  } else if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (child == null) continue
      if (key === 'diagram_source' || key === 'mermaid_source') {
        lines.push('```mermaid', str(child), '```')
      } else if (typeof child === 'string') {
        lines.push(`**${humanize(key)}:** ${child}`)
      } else if (Array.isArray(child)) {
        if (child.length === 0) continue
        lines.push(`\n${hl}# ${humanize(key)}\n`)
        lines.push(renderValueMd(child, level + 1))
      } else if (isPlainObject(child)) {
        lines.push(`\n${hl}# ${humanize(key)}\n`)
        lines.push(renderValueMd(child, level + 1))
      }
    }
  }

  return lines.join('\n')
}

function renderSectionMd(key: string, value: any): string {
  const lines: string[] = []
  lines.push(`## ${humanize(key)}`)
  lines.push('')
  lines.push(renderValueMd(value, 3))
  lines.push('')
  return lines.join('\n')
}

export function exportArtifactToMarkdown(data: any): string {
  const lines: string[] = []
  const meta = data?.metadata ?? {}
  const sections = data?.sections ?? {}

  // Title
  const title = str(meta.title) || 'Architecture Artifact'
  const artifactType = str(data?.artifact_type ?? meta?.artifact_type ?? '')
  lines.push(`# ${title}`)
  if (artifactType) {
    lines.push(`\n*${humanize(artifactType)}*`)
  }
  lines.push('')

  // Metadata
  const metaMd = renderMetadataMd(meta)
  if (metaMd) {
    lines.push(metaMd)
    lines.push('\n---\n')
  }

  // Sections in type-specific preferred order
  const sectionOrder = sectionOrderFor(artifactType || undefined)
  const rendered = new Set<string>()
  for (const key of sectionOrder) {
    if (key in sections) {
      lines.push(renderSectionMd(key, sections[key]))
      rendered.add(key)
    }
  }

  // Unknown sections
  for (const [key, value] of Object.entries(sections)) {
    if (!rendered.has(key)) {
      lines.push(renderSectionMd(key, value))
      rendered.add(key)
    }
  }

  // Top-level keys outside sections
  const TOP_SKIP = new Set(['kind', 'artifact_type', 'metadata', 'sections'])
  for (const [key, value] of Object.entries(data)) {
    if (TOP_SKIP.has(key) || rendered.has(key)) continue
    lines.push(renderSectionMd(key, value))
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

// ─── Rubric Markdown ─────────────────────────────────────────────────────────

export function exportRubricToMarkdown(data: any): string {
  const lines: string[] = []

  // Title & metadata
  const title = str(data?.title) || 'EaROS Rubric'
  lines.push(`# ${title}`)
  lines.push('')

  const metaFields: [string, any][] = [
    ['Rubric ID', data?.rubric_id],
    ['Version', data?.version],
    ['Kind', data?.kind],
    ['Status', data?.status],
    ['Artifact Type', data?.artifact_type],
    ['Design Method', data?.design_method],
    ['Owner', data?.owner],
    ['Effective Date', data?.effective_date],
  ]
  if (data?.inherits?.length) metaFields.push(['Inherits', data.inherits.join(', ')])

  const validMeta = metaFields.filter(([, v]) => v != null && v !== '')
  if (validMeta.length) {
    lines.push(mdTable(['Field', 'Value'], validMeta.map(([k, v]) => [k, str(v)])))
    lines.push('\n---\n')
  }

  // Dimensions & criteria
  const dimensions = data?.dimensions ?? []
  for (const dim of dimensions) {
    const weight = dim.weight != null ? ` (weight: ${dim.weight})` : ''
    lines.push(`## ${str(dim.name)}${weight}`)
    lines.push('')
    if (dim.description) lines.push(`*${str(dim.description)}*\n`)

    const criteria = dim.criteria ?? []
    for (const c of criteria) {
      lines.push(`### ${str(c.id)}: ${str(c.question)}`)
      lines.push('')
      if (c.description) lines.push(str(c.description) + '\n')

      // Gate
      if (c.gate && typeof c.gate === 'object' && c.gate.enabled) {
        lines.push(`**Gate:** ${c.gate.severity ?? 'unknown'}${c.gate.failure_effect ? ` — ${c.gate.failure_effect}` : ''}`)
      } else {
        lines.push('**Gate:** None')
      }
      lines.push('')

      // Required evidence
      if (c.required_evidence?.length) {
        lines.push('**Required Evidence:**\n')
        lines.push(mdList(c.required_evidence.map(str)))
        lines.push('')
      }

      // Scoring guide
      if (c.scoring_guide) {
        lines.push('**Scoring Guide:**\n')
        const sgRows = Object.entries(c.scoring_guide).map(([level, desc]) => [level, str(desc)])
        lines.push(mdTable(['Level', 'Description'], sgRows))
        lines.push('')
      }

      // Anti-patterns
      if (c.anti_patterns?.length) {
        lines.push('**Anti-patterns:**\n')
        lines.push(mdList(c.anti_patterns.map(str)))
        lines.push('')
      }

      // Examples
      if (c.examples) {
        if (c.examples.good?.length) {
          lines.push('**Good Examples:**\n')
          lines.push(mdList(c.examples.good.map(str)))
          lines.push('')
        }
        if (c.examples.bad?.length) {
          lines.push('**Bad Examples:**\n')
          lines.push(mdList(c.examples.bad.map(str)))
          lines.push('')
        }
      }

      // Decision tree
      if (c.decision_tree) {
        lines.push('**Decision Tree:**\n')
        lines.push(`> ${str(c.decision_tree).replace(/\n/g, '\n> ')}`)
        lines.push('')
      }

      // Remediation hints
      if (c.remediation_hints?.length) {
        lines.push('**Remediation Hints:**\n')
        lines.push(mdList(c.remediation_hints.map(str)))
        lines.push('')
      }

      lines.push('---\n')
    }
  }

  // Scoring section
  if (data?.scoring) {
    lines.push('## Scoring Model\n')
    if (data.scoring.scale) lines.push(`**Scale:** ${str(data.scoring.scale)}`)
    if (data.scoring.method) lines.push(`**Method:** ${str(data.scoring.method)}`)
    if (data.scoring.thresholds) {
      lines.push('\n**Thresholds:**\n')
      for (const [k, v] of Object.entries(data.scoring.thresholds)) {
        lines.push(`- **${humanize(k)}:** ${str(v)}`)
      }
    }
    lines.push('')
  }

  // Outputs section
  if (data?.outputs) {
    lines.push('## Outputs\n')
    for (const [k, v] of Object.entries(data.outputs)) {
      lines.push(`- **${humanize(k)}:** ${str(v)}`)
    }
    lines.push('')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

// ─── Evaluation Markdown ─────────────────────────────────────────────────────

interface EvalDimension {
  id: string
  name: string
  weight?: number
  criteria: Array<{
    id: string
    question: string
    gate?: { enabled: boolean; severity: string; failure_effect?: string } | false | null
  }>
}

interface EvalResult {
  score: number | 'N/A' | null
  confidence: string
  evidence_class: string
  evidence: string
}

function scoreEmoji(score: number | 'N/A' | null): string {
  if (score === null || score === 'N/A') return ''
  if (score >= 3) return '🟢'
  if (score >= 2) return '🟡'
  if (score >= 1) return '🟠'
  return '🔴'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pass: 'Pass',
    conditional_pass: 'Conditional Pass',
    rework_required: 'Rework Required',
    reject: 'Reject',
    not_reviewable: 'Not Reviewable',
    incomplete: 'Incomplete',
  }
  return map[status] ?? humanize(status)
}

export function exportEvaluationToMarkdown(
  meta: { title?: string; version?: string; author?: string; date?: string },
  primaryRubricId: string,
  dimensions: EvalDimension[],
  results: Record<string, EvalResult>,
): string {
  const lines: string[] = []

  // Compute summary inline (same logic as computeSummary in AssessmentSummary)
  const dimSummaries = dimensions.map((dim) => {
    const scored = dim.criteria.filter((c) => {
      const r = results[c.id]
      return r && r.score !== null && r.score !== 'N/A'
    })
    const sum = scored.reduce((acc, c) => acc + (results[c.id].score as number), 0)
    const avg = scored.length > 0 ? sum / scored.length : null
    return { id: dim.id, name: dim.name, weight: dim.weight ?? 1.0, avgScore: avg }
  })

  const gateFailures: Array<{ id: string; question: string; severity: string; score: number; failure_effect: string }> = []
  for (const dim of dimensions) {
    for (const c of dim.criteria) {
      if (!c.gate || typeof c.gate !== 'object' || !c.gate.enabled) continue
      const sev = c.gate.severity
      if (!sev || sev === 'none') continue
      const r = results[c.id]
      if (!r || r.score === null || r.score === 'N/A') continue
      if ((r.score as number) < 2) {
        gateFailures.push({ id: c.id, question: c.question, severity: sev, score: r.score as number, failure_effect: c.gate.failure_effect ?? '' })
      }
    }
  }
  const criticalFailures = gateFailures.filter((g) => g.severity === 'critical')
  const majorFailures = gateFailures.filter((g) => g.severity === 'major')

  const scoredDims = dimSummaries.filter((d) => d.avgScore !== null)
  const weightedSum = scoredDims.reduce((acc, d) => acc + (d.avgScore as number) * d.weight, 0)
  const totalWeight = scoredDims.reduce((acc, d) => acc + d.weight, 0)
  const overallScore = scoredDims.length > 0 ? weightedSum / totalWeight : null

  const totalCriteria = dimensions.reduce((acc, d) => acc + d.criteria.length, 0)
  const scoredCriteria = dimensions.reduce(
    (acc, d) => acc + d.criteria.filter((c) => results[c.id]?.score !== null).length, 0)

  let status = 'incomplete'
  if (overallScore !== null) {
    const noLowDim = dimSummaries.every((d) => d.avgScore === null || d.avgScore >= 2.0)
    if (criticalFailures.length > 0) {
      const hasNotReviewable = criticalFailures.some((g) => {
        const effect = g.failure_effect.toLowerCase()
        return effect.includes('not_reviewable') || effect.includes('not reviewable')
      })
      status = hasNotReviewable ? 'not_reviewable' : 'reject'
    } else if (overallScore >= 3.2 && noLowDim && majorFailures.length === 0) {
      status = 'pass'
    } else if (overallScore >= 2.4 || majorFailures.length > 0) {
      status = 'conditional_pass'
    } else {
      status = 'rework_required'
    }
  }

  // Title
  lines.push('# EaROS Architecture Assessment Report')
  lines.push('')
  if (meta.title) lines.push(`**Artifact:** ${meta.title}`)
  if (meta.version) lines.push(`**Artifact Version:** ${meta.version}`)
  lines.push(`**Rubric:** ${primaryRubricId}`)
  lines.push(`**Evaluation Date:** ${meta.date || new Date().toISOString().slice(0, 10)}`)
  if (meta.author) lines.push(`**Evaluator:** ${meta.author}`)
  lines.push('')
  lines.push('---\n')

  // Executive Summary
  lines.push('## Executive Summary\n')
  lines.push(mdTable(
    ['', ''],
    [
      ['**Overall Status**', `**${statusLabel(status).toUpperCase()}**`],
      ['**Overall Score**', overallScore !== null ? `**${overallScore.toFixed(2)} / 4.0**` : 'N/A'],
      ['**Pass Threshold**', '3.2 / 4.0'],
      ['**Gate Failures**', gateFailures.length > 0 ? `${gateFailures.length} (${criticalFailures.length} critical)` : 'None'],
      ['**Criteria Scored**', `${scoredCriteria} of ${totalCriteria}`],
    ],
  ))
  lines.push('\n---\n')

  // Traffic-Light Dashboard
  lines.push('## Traffic-Light Dashboard\n')
  const dashRows: string[][] = []
  for (const dim of dimensions) {
    for (const c of dim.criteria) {
      const r = results[c.id]
      const score = r?.score
      const scoreStr = score !== null && score !== undefined ? `${score}` : '-'
      const gateLabel = c.gate && typeof c.gate === 'object' && c.gate.enabled
        ? ` ⚠️ ${(c.gate.severity ?? '').toUpperCase()} GATE` : ''
      dashRows.push([
        str(c.id) + gateLabel,
        str(c.question),
        scoreStr === 'N/A' ? 'N/A' : `${scoreStr} / 4`,
        score !== null && score !== 'N/A' ? scoreEmoji(score as number) : '',
      ])
    }
  }
  lines.push(mdTable(['Criterion', 'Name', 'Score', 'Status'], dashRows))
  lines.push('\n**Legend:** 🟢 Score ≥ 3 · 🟡 Score 2–2.9 · 🟠 Score 1–1.9 · 🔴 Score 0 or gate failure\n')
  lines.push('---\n')

  // Dimension Summary
  lines.push('## Dimension Summary\n')
  const dimRows = dimSummaries.map((d) => [
    d.id,
    d.name,
    d.weight.toFixed(1),
    d.avgScore !== null ? d.avgScore.toFixed(1) : '-',
    d.avgScore !== null ? (d.avgScore * d.weight).toFixed(1) : '-',
  ])
  lines.push(mdTable(['Dimension', 'Name', 'Weight', 'Score', 'Weighted'], dimRows))
  if (overallScore !== null) {
    lines.push(`\n**Overall weighted score: ${overallScore.toFixed(2)} / 4.0**`)
  }
  lines.push('\n---\n')

  // Gate Failures
  if (gateFailures.length > 0) {
    lines.push('## Gate Failures\n')
    lines.push(mdTable(
      ['Criterion', 'Question', 'Severity', 'Score', 'Effect'],
      gateFailures.map((g) => [g.id, g.question, g.severity, String(g.score), g.failure_effect || '\u2014']),
    ))
    lines.push('\n---\n')
  }

  // Per-criterion Evidence Details
  const hasEvidence = dimensions.some((d) =>
    d.criteria.some((c) => results[c.id]?.evidence))
  if (hasEvidence) {
    lines.push('## Criterion Details\n')
    for (const dim of dimensions) {
      for (const c of dim.criteria) {
        const r = results[c.id]
        if (!r || r.score === null) continue
        lines.push(`### ${c.id}: ${c.question}\n`)
        lines.push(`- **Score:** ${r.score}`)
        if (r.confidence) lines.push(`- **Confidence:** ${r.confidence}`)
        if (r.evidence_class) lines.push(`- **Evidence Class:** ${r.evidence_class}`)
        if (r.evidence) lines.push(`- **Evidence:** ${r.evidence}`)
        lines.push('')
      }
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
