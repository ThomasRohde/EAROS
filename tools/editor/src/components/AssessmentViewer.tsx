/**
 * AssessmentViewer — read-only dashboard for completed EaROS evaluation records.
 */

import { useMemo, useState, useCallback } from 'react'
import { getCriterionQuestion, DIMENSION_NAMES } from '../utils/criterion-questions'
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import GavelIcon from '@mui/icons-material/Gavel'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import DescriptionIcon from '@mui/icons-material/Description'
import ArticleIcon from '@mui/icons-material/Article'
import yaml from 'js-yaml'
import { sapphire } from '../theme'
import { STATUS_CONFIG } from './AssessmentSummary'
import { scoreColor, GateBadge, SCORE_LABELS } from '../utils/score-helpers'
import { downloadAsFile } from '../utils/export-markdown'
import ExportMenu from './ExportMenu'
import type { LoadedEvaluation, EvaluationCriterionResult, EvaluationEvidenceRef } from '../types'

interface Props {
  evaluation: LoadedEvaluation
  rawYaml?: string
  onBack: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function evalTitle(ev: LoadedEvaluation): string {
  return ev.artifact_ref?.title ?? ev.artifact_id ?? 'Assessment'
}

function evidenceClassLabel(cr: EvaluationCriterionResult): string {
  return cr.evidence_class ?? cr.judgment_type ?? ''
}

function evidenceGaps(cr: EvaluationCriterionResult): string[] {
  return cr.evidence_gaps ?? cr.missing_information ?? []
}

function formatDate(d?: string): string {
  if (!d) return ''
  try {
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

function progressColor(score: number): string {
  if (score >= 3.2) return 'hsl(125 50% 35%)'
  if (score >= 2.4) return 'hsl(41 95% 46%)'
  return 'hsl(0 65% 51%)'
}

// Group criterion results by dimension (using prefix heuristic + dimension_results)
function groupByDimension(ev: LoadedEvaluation): Array<{ id: string; name: string; score: number | null; weight: number; criteria: EvaluationCriterionResult[] }> {
  // If dimension_results exist, use them as dimension definitions
  const dims = ev.dimension_results ?? []

  // Build dimension map from criterion IDs — group by prefix pattern
  // Core criteria: STK-01, SCP-01, TRC-01, etc. → dimension = prefix
  // Profile criteria: RA-VIEW-01, RA-PAT-01, etc. → dimension = first two parts
  const groups = new Map<string, EvaluationCriterionResult[]>()
  for (const cr of ev.criterion_results) {
    // Heuristic: take the alphabetic prefix as dimension key
    const parts = cr.criterion_id.split('-')
    let dimKey: string
    if (parts.length >= 3 && parts[0].length <= 3) {
      // e.g., RA-VIEW-01 → RA-VIEW
      dimKey = `${parts[0]}-${parts[1]}`
    } else {
      // e.g., STK-01 → STK
      dimKey = parts[0]
    }
    if (!groups.has(dimKey)) groups.set(dimKey, [])
    groups.get(dimKey)!.push(cr)
  }

  // Map dimension_results to groups, falling back to computed groups
  const dimMap = new Map(dims.map((d) => [d.dimension_id, d]))

  const result: Array<{ id: string; name: string; score: number | null; weight: number; criteria: EvaluationCriterionResult[] }> = []
  for (const [key, criteria] of groups) {
    const dimResult = dimMap.get(key)
    // Compute average from criterion scores if no dimension_results
    const scored = criteria.filter((c) => typeof c.score === 'number')
    const avg = scored.length > 0
      ? scored.reduce((acc, c) => acc + (c.score as number), 0) / scored.length
      : null
    result.push({
      id: key,
      name: dimResult?.summary ?? DIMENSION_NAMES[key] ?? key,
      score: dimResult?.weighted_score ?? avg,
      weight: 1.0,
      criteria,
    })
  }
  return result
}

// DIMENSION_NAMES imported from ../utils/criterion-questions

// ─── Main component ─────────────────────────────────────────────────────────

export default function AssessmentViewer({ evaluation: ev, rawYaml, onBack }: Props) {
  const title = evalTitle(ev)
  const statusCfg = STATUS_CONFIG[ev.overall_status ?? ''] ?? STATUS_CONFIG.incomplete
  const dimensions = useMemo(() => groupByDimension(ev), [ev])
  const gateFailures = ev.gate_failures ?? []
  const totalCriteria = ev.criterion_results.length
  const scoredCriteria = ev.criterion_results.filter((c) => c.score !== null && c.score !== undefined).length

  // Aggregate recommended actions
  const allActions = useMemo(() => {
    const actions = new Set<string>()
    for (const cr of ev.criterion_results) {
      for (const a of cr.recommended_actions ?? []) actions.add(a)
    }
    for (const a of ev.recommended_actions ?? []) actions.add(a)
    return [...actions]
  }, [ev])

  // Export handlers
  const handleExportYaml = useCallback(() => {
    const content = rawYaml ?? yaml.dump(ev, { lineWidth: 120, noRefs: true })
    downloadAsFile(content, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.evaluation.yaml`, 'text/yaml')
  }, [ev, rawYaml, title])

  const handleExportWord = useCallback(async () => {
    const res = await fetch('/api/export/docx/evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-assessment.docx`
    a.click()
    URL.revokeObjectURL(url)
  }, [ev, title])

  const exportOptions = [
    { key: 'yaml', label: 'YAML', icon: <DescriptionIcon fontSize="small" />, onClick: handleExportYaml },
    { key: 'docx', label: 'Word (.docx)', icon: <ArticleIcon fontSize="small" />, onClick: handleExportWord },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: (theme) => theme.palette.mode === 'dark' ? sapphire.gray[900] : sapphire.sand[50] }}>
      {/* ── AppBar ────────────────────────────────────────────────────────────── */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: (theme) => theme.palette.mode === 'dark' ? sapphire.gray[800] : '#ffffff',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton onClick={onBack} size="small" sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.05rem', flex: 1, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </Typography>
          {ev.rubric_id && (
            <Chip label={ev.rubric_id} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />
          )}
          <Chip
            icon={statusCfg.icon as React.ReactElement}
            label={statusCfg.label}
            size="small"
            sx={{
              bgcolor: statusCfg.bg,
              color: statusCfg.color,
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 28,
              '& .MuiChip-icon': { color: statusCfg.color },
            }}
          />
          <ExportMenu options={exportOptions} />
        </Toolbar>
      </AppBar>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 960, mx: 'auto', p: { xs: 2, sm: 3 } }}>

        {/* ── Hero Summary ──────────────────────────────────────────────────── */}
        <HeroSummaryCard ev={ev} statusCfg={statusCfg} totalCriteria={totalCriteria} scoredCriteria={scoredCriteria} gateFailureCount={gateFailures.length} />

        {/* ── Dimension Overview ─────────────────────────────────────────────── */}
        {dimensions.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <SectionTitle>Dimension Overview</SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, mt: 2 }}>
              {dimensions.map((dim) => (
                <DimensionCard key={dim.id} dim={dim} />
              ))}
            </Box>
          </Box>
        )}

        {/* ── Gate Check ────────────────────────────────────────────────────── */}
        <Box sx={{ mt: 4 }}>
          <SectionTitle>Gate Check</SectionTitle>
          <GateCheckPanel failures={gateFailures} criteria={ev.criterion_results} />
        </Box>

        {/* ── Criterion Details ─────────────────────────────────────────────── */}
        <Box sx={{ mt: 4 }}>
          <SectionTitle>Criterion Details</SectionTitle>
          {dimensions.map((dim) => (
            <Box key={dim.id} sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{
                fontWeight: 600,
                letterSpacing: '0.06em',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 1.5,
              }}>
                {dim.name} ({dim.id})
              </Typography>
              {dim.criteria.map((cr) => (
                <CriterionDetailCard key={cr.criterion_id} criterion={cr} />
              ))}
            </Box>
          ))}
        </Box>

        {/* ── Decision Summary ──────────────────────────────────────────────── */}
        {ev.decision_summary && (
          <Box sx={{ mt: 4 }}>
            <SectionTitle>Decision Summary</SectionTitle>
            <NarrativeCard text={ev.decision_summary} icon={<GavelIcon sx={{ fontSize: 20, color: 'primary.main' }} />} />
          </Box>
        )}

        {/* ── Challenger Notes ──────────────────────────────────────────────── */}
        {ev.challenger_notes && (
          <Box sx={{ mt: 4 }}>
            <SectionTitle>Challenger Notes</SectionTitle>
            <NarrativeCard text={ev.challenger_notes} accent="copper" icon={<FormatQuoteIcon sx={{ fontSize: 20, color: sapphire.copper[2] }} />} />
          </Box>
        )}

        {/* ── Recommended Actions ───────────────────────────────────────────── */}
        {allActions.length > 0 && (
          <Box sx={{ mt: 4, mb: 6 }}>
            <SectionTitle>Recommended Actions</SectionTitle>
            <Paper variant="outlined" sx={{ p: 2.5, mt: 2 }}>
              {allActions.map((action, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
                  <LightbulbIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>{action}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        )}

      </Box>
    </Box>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem', color: 'text.primary' }}>
      {children}
    </Typography>
  )
}

// ── Hero Summary Card ───────────────────────────────────────────────────────

function HeroSummaryCard({ ev, statusCfg, totalCriteria, scoredCriteria, gateFailureCount }: {
  ev: LoadedEvaluation
  statusCfg: { label: string; color: string; bg: string; icon: React.ReactNode }
  totalCriteria: number
  scoredCriteria: number
  gateFailureCount: number
}) {
  const score = ev.overall_score
  const barColor = score != null ? progressColor(score) : 'hsl(210 26% 85%)'

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      {/* Top row: three key metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Status */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
            Overall Status
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              icon={statusCfg.icon as React.ReactElement}
              label={statusCfg.label}
              sx={{
                bgcolor: statusCfg.bg,
                color: statusCfg.color,
                fontWeight: 700,
                fontSize: '0.9rem',
                height: 36,
                '& .MuiChip-icon': { color: statusCfg.color, fontSize: 20 },
              }}
            />
          </Box>
        </Box>

        {/* Score */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
            Overall Score
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.8rem', lineHeight: 1, color: 'text.primary' }}>
              {score != null ? score.toFixed(2) : '--'}
              <Typography component="span" sx={{ fontSize: '0.9rem', fontWeight: 400, color: 'text.disabled', ml: 0.5 }}>/4.0</Typography>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={score != null ? (score / 4) * 100 : 0}
              sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'hsl(210 26% 85%)', '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 } }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
              Pass threshold: 3.2
            </Typography>
          </Box>
        </Box>

        {/* Gate check */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
            Gate Failures
          </Typography>
          <Box sx={{ mt: 1 }}>
            {gateFailureCount === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ color: 'hsl(125 50% 35%)', fontSize: 28 }} />
                <Typography sx={{ fontWeight: 600, color: 'hsl(125 50% 35%)', fontSize: '0.95rem' }}>All clear</Typography>
              </Box>
            ) : (
              <Typography sx={{ fontWeight: 700, fontSize: '1.8rem', lineHeight: 1, color: 'hsl(0 65% 51%)' }}>
                {gateFailureCount}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Metadata row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, fontSize: '0.82rem' }}>
        <MetaItem label="Date" value={formatDate(ev.evaluation_date)} />
        <MetaItem label="Mode" value={ev.evaluation_mode ?? ''} />
        <MetaItem label="Confidence" value={ev.confidence ?? ''} />
        <MetaItem label="Criteria" value={`${scoredCriteria}/${totalCriteria} scored`} />
        {ev.profiles_applied && ev.profiles_applied.length > 0 && (
          <MetaItem label="Profiles" value={ev.profiles_applied.join(', ')} />
        )}
        {ev.overlays_applied && ev.overlays_applied.length > 0 && (
          <MetaItem label="Overlays" value={ev.overlays_applied.join(', ')} />
        )}
        {ev.evaluated_by && ev.evaluated_by.length > 0 && (
          <MetaItem label="Evaluators" value={ev.evaluated_by.map((e) => `${e.identity ?? e.actor} (${e.role})`).join(', ')} />
        )}
      </Box>

      {/* DAG execution */}
      {ev.dag_execution?.steps_completed && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ev.dag_execution.steps_completed.map((step) => (
            <Chip key={step} label={step.replace(/_/g, ' ')} size="small" variant="outlined"
              sx={{ fontSize: '0.65rem', height: 22, textTransform: 'capitalize' }} />
          ))}
          {ev.dag_execution.calibration_applied && (
            <Chip label="calibrated" size="small" sx={{ fontSize: '0.65rem', height: 22, bgcolor: 'hsl(129 33% 92%)', color: 'hsl(129 41% 23%)' }} />
          )}
        </Box>
      )}
    </Paper>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.62rem', textTransform: 'uppercase', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.82rem', lineHeight: 1.4 }}>
        {value}
      </Typography>
    </Box>
  )
}

// ── Dimension Card ──────────────────────────────────────────────────────────

function DimensionCard({ dim }: { dim: { id: string; name: string; score: number | null; weight: number; criteria: EvaluationCriterionResult[] } }) {
  const barColor = dim.score != null ? progressColor(dim.score) : 'hsl(210 26% 85%)'
  const scored = dim.criteria.filter((c) => typeof c.score === 'number').length
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Tooltip title={dim.name}>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary', mb: 0.5 }}>
          {dim.name}
        </Typography>
      </Tooltip>
      <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: 'text.primary', lineHeight: 1.2 }}>
        {dim.score != null ? dim.score.toFixed(1) : '--'}
        <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.disabled' }}>/4.0</Typography>
      </Typography>
      <LinearProgress
        variant="determinate"
        value={dim.score != null ? (dim.score / 4) * 100 : 0}
        sx={{ mt: 1, height: 5, borderRadius: 3, bgcolor: 'hsl(210 26% 85%)', '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 } }}
      />
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
        <Chip label={dim.id} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }} />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>{scored}/{dim.criteria.length} scored</Typography>
      </Box>
    </Paper>
  )
}

// ── Gate Check Panel ────────────────────────────────────────────────────────

function GateCheckPanel({ failures, criteria }: { failures: LoadedEvaluation['gate_failures']; criteria: EvaluationCriterionResult[] }) {
  const safeFailures = failures ?? []
  if (safeFailures.length === 0) {
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mt: 2 }}>
        All gate criteria passed. No critical or major gate failures detected.
      </Alert>
    )
  }

  return (
    <Paper variant="outlined" sx={{ mt: 2, border: '1px solid hsl(0 65% 80%)' }}>
      {safeFailures.map((g, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, borderBottom: i < safeFailures.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
          {g.gate_severity && <GateBadge severity={g.gate_severity} />}
          <Chip label={g.criterion_id ?? '?'} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontFamily: 'monospace', height: 22 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {getCriterionQuestion(g.criterion_id ?? '', g.criterion_question) && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getCriterionQuestion(g.criterion_id ?? '', g.criterion_question)}
              </Typography>
            )}
            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
              {g.failure_effect ?? 'Gate failed'}
            </Typography>
          </Box>
          <Chip
            label={`Score: ${g.actual_score ?? '?'}`}
            size="small"
            sx={{ bgcolor: 'hsl(0 82% 96%)', color: 'hsl(0 65% 51%)', fontSize: '0.7rem', height: 22 }}
          />
        </Box>
      ))}
    </Paper>
  )
}

// ── Criterion Detail Card ───────────────────────────────────────────────────

function CriterionDetailCard({ criterion: cr }: { criterion: EvaluationCriterionResult }) {
  const [open, setOpen] = useState(false)
  const scoreStr = String(cr.score)
  const colors = scoreColor(scoreStr)
  const label = SCORE_LABELS[scoreStr] ?? scoreStr
  const evClass = evidenceClassLabel(cr)
  const gaps = evidenceGaps(cr)
  const refs = cr.evidence_refs ?? []
  const hasDetail = refs.length > 0 || cr.rationale || gaps.length > 0 || (cr.recommended_actions ?? []).length > 0

  return (
    <Paper variant="outlined" sx={{ mb: 1.5, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, cursor: hasDetail ? 'pointer' : 'default', '&:hover': hasDetail ? { bgcolor: 'action.hover' } : {} }}
        onClick={() => hasDetail && setOpen((v) => !v)}
      >
        {/* ID chip */}
        <Chip label={cr.criterion_id} size="small" variant="outlined" sx={{ fontSize: '0.68rem', fontFamily: 'monospace', height: 22, flexShrink: 0 }} />

        {/* Criterion question */}
        <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {getCriterionQuestion(cr.criterion_id, cr.criterion_question)}
        </Typography>

        {/* Score chip */}
        <Chip
          label={`${scoreStr} ${label}`}
          size="small"
          sx={{
            bgcolor: colors.bg,
            color: colors.color,
            border: `1px solid ${colors.border}`,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 22,
            flexShrink: 0,
          }}
        />

        {/* Confidence */}
        {cr.confidence && (
          <Chip label={cr.confidence} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 20, textTransform: 'capitalize' }} />
        )}

        {/* Evidence class */}
        {evClass && (
          <Chip label={evClass} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 20, textTransform: 'capitalize' }} />
        )}

        {/* Sufficiency */}
        {cr.evidence_sufficiency && cr.evidence_sufficiency !== 'sufficient' && (
          <Chip label={cr.evidence_sufficiency} size="small" sx={{ fontSize: '0.62rem', height: 20, bgcolor: 'hsl(53 100% 92%)', color: 'hsl(31 94% 33%)' }} />
        )}

        {hasDetail && (
          <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.disabled', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        )}
      </Box>

      {/* Expanded detail */}
      {open && hasDetail && (
        <Box sx={{ px: 2.5, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {/* Rationale */}
          {cr.rationale && (
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7, fontSize: '0.85rem' }}>
              {cr.rationale}
            </Typography>
          )}

          {/* Evidence refs */}
          {refs.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                Evidence ({refs.length} reference{refs.length > 1 ? 's' : ''})
              </Typography>
              {refs.map((ref, i) => (
                <EvidenceRefBlock key={i} ref_={ref} />
              ))}
            </Box>
          )}

          {/* Evidence gaps */}
          {gaps.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main', display: 'block', mb: 0.5 }}>
                Evidence gaps
              </Typography>
              {gaps.map((g, i) => (
                <Typography key={i} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', pl: 1, lineHeight: 1.6 }}>
                  - {g}
                </Typography>
              ))}
            </Box>
          )}

          {/* Recommended actions */}
          {(cr.recommended_actions ?? []).length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main', display: 'block', mb: 0.5 }}>
                Recommended actions
              </Typography>
              {cr.recommended_actions!.map((a, i) => (
                <Typography key={i} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', pl: 1, lineHeight: 1.6 }}>
                  - {a}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  )
}

function EvidenceRefBlock({ ref_ }: { ref_: EvaluationEvidenceRef | string }) {
  if (typeof ref_ === 'string') {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', pl: 1, lineHeight: 1.6, mb: 0.5 }}>
        {ref_}
      </Typography>
    )
  }
  const source = ref_.section ?? ref_.location ?? ''
  const quote = ref_.quotation ?? ref_.excerpt ?? ''
  return (
    <Box sx={{
      mb: 1,
      pl: 1.5,
      borderLeft: (theme) => `3px solid ${theme.palette.mode === 'dark' ? sapphire.blue[700] : sapphire.blue[200]}`,
    }}>
      {source && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '0.68rem', display: 'block', mb: 0.25 }}>
          {source}
        </Typography>
      )}
      {quote && (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.6, fontStyle: 'italic' }}>
          "{quote.trim()}"
        </Typography>
      )}
    </Box>
  )
}

// ── Narrative Card ──────────────────────────────────────────────────────────

function NarrativeCard({ text, accent, icon }: { text: string; accent?: 'copper'; icon?: React.ReactNode }) {
  const borderColor = accent === 'copper' ? sapphire.copper[2] : undefined
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mt: 2, ...(borderColor ? { borderLeftColor: borderColor, borderLeftWidth: 3 } : {}) }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {text}
        </Typography>
      </Box>
    </Paper>
  )
}
