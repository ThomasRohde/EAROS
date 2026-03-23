import { useMemo } from 'react'
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { CriterionResult, RubricCriterion } from './CriterionScorer'
import { getGateSeverity } from '../utils/score-helpers'

export interface RubricDimension {
  id: string
  name: string
  description?: string
  weight?: number
  criteria: RubricCriterion[]
}

interface DimSummary {
  id: string
  name: string
  weight: number
  avgScore: number | null
  scoredCount: number
  totalCount: number
}

interface GateFailure {
  criterion_id: string
  question: string
  severity: string
  score: number | 'N/A'
  failure_effect: string
}

export function computeSummary(
  dimensions: RubricDimension[],
  results: Record<string, CriterionResult>,
) {
  const dimSummaries: DimSummary[] = dimensions.map((dim) => {
    const naScored = dim.criteria.filter((c) => {
      const r = results[c.id]
      return r && r.score !== null && r.score !== 'N/A'
    })
    const allScored = dim.criteria.filter((c) => {
      const r = results[c.id]
      return r && r.score !== null
    })
    const scoreSum = naScored.reduce((acc, c) => acc + (results[c.id].score as number), 0)
    const avgScore = naScored.length > 0 ? scoreSum / naScored.length : null
    return {
      id: dim.id,
      name: dim.name,
      weight: dim.weight ?? 1.0,
      avgScore,
      scoredCount: allScored.length,
      totalCount: dim.criteria.length,
    }
  })

  // Gate failures: gate-enabled criteria scored < 2
  const gateFailures: GateFailure[] = []
  for (const dim of dimensions) {
    for (const c of dim.criteria) {
      const sev = getGateSeverity(c.gate)
      if (!sev || sev === 'none') continue
      const r = results[c.id]
      if (!r || r.score === null || r.score === 'N/A') continue
      if ((r.score as number) < 2) {
        const gate = c.gate as { enabled: boolean; severity: string; failure_effect?: string }
        gateFailures.push({ criterion_id: c.id, question: c.question, severity: sev, score: r.score as number, failure_effect: gate.failure_effect ?? '' })
      }
    }
  }

  const criticalFailures = gateFailures.filter((g) => g.severity === 'critical')
  const majorFailures = gateFailures.filter((g) => g.severity === 'major')

  // Overall weighted score across dimensions that have any scored criteria
  const scoredDims = dimSummaries.filter((d) => d.avgScore !== null)
  const weightedSum = scoredDims.reduce((acc, d) => acc + (d.avgScore as number) * d.weight, 0)
  const totalWeight = scoredDims.reduce((acc, d) => acc + d.weight, 0)
  const overallScore = scoredDims.length > 0 ? weightedSum / totalWeight : null

  const totalCriteria = dimensions.reduce((acc, d) => acc + d.criteria.length, 0)
  const scoredCriteria = dimensions.reduce(
    (acc, d) => acc + d.criteria.filter((c) => results[c.id]?.score !== null).length,
    0,
  )

  let status = 'incomplete'
  if (overallScore !== null) {
    const noLowDimension = dimSummaries.every((d) => d.avgScore === null || d.avgScore >= 2.0)
    if (criticalFailures.length > 0) {
      // Check failure_effect to distinguish reject vs not_reviewable
      const hasNotReviewable = criticalFailures.some((g) => {
        const effect = g.failure_effect.toLowerCase()
        return effect.includes('not_reviewable') || effect.includes('not reviewable')
      })
      status = hasNotReviewable ? 'not_reviewable' : 'reject'
    } else if (overallScore >= 3.2 && noLowDimension && majorFailures.length === 0) {
      status = 'pass'
    } else if (overallScore >= 2.4 || majorFailures.length > 0) {
      status = 'conditional_pass'
    } else {
      status = 'rework_required'
    }
  }

  return { dimSummaries, gateFailures, criticalFailures, overallScore, scoredCriteria, totalCriteria, status }
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pass: { label: 'Pass', color: 'hsl(129 41% 23%)', bg: 'hsl(129 33% 92%)', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  conditional_pass: { label: 'Conditional Pass', color: 'hsl(31 94% 33%)', bg: 'hsl(53 100% 92%)', icon: <InfoIcon sx={{ fontSize: 16 }} /> },
  rework_required: { label: 'Rework Required', color: 'hsl(0 65% 51%)', bg: 'hsl(0 82% 96%)', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
  reject: { label: 'Reject', color: 'hsl(358 57% 10%)', bg: 'hsl(4 100% 92%)', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
  not_reviewable: { label: 'Not Reviewable', color: 'hsl(212 27% 35%)', bg: 'hsl(206 33% 96%)', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
  incomplete: { label: 'Scoring in progress…', color: 'hsl(212 27% 35%)', bg: 'hsl(206 33% 96%)', icon: null },
}

interface Props {
  dimensions: RubricDimension[]
  results: Record<string, CriterionResult>
  onExport?: () => void
}

export default function AssessmentSummary({ dimensions, results }: Props) {
  const { dimSummaries, gateFailures, overallScore, scoredCriteria, totalCriteria, status } =
    useMemo(() => computeSummary(dimensions, results), [dimensions, results])

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.incomplete
  const progress = totalCriteria > 0 ? (scoredCriteria / totalCriteria) * 100 : 0

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'hsl(213 48% 17%)' : '#ffffff',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
          <Box sx={{ width: 100 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3, bgcolor: 'hsl(210 26% 85%)', '& .MuiLinearProgress-bar': { bgcolor: 'hsl(218 92% 49%)' } }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {scoredCriteria} / {totalCriteria} scored
          </Typography>
        </Box>

        {/* Overall score */}
        {overallScore !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
              {overallScore.toFixed(1)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>/4.0</Typography>
          </Box>
        )}

        {/* Dimension mini-bars */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
          {dimSummaries.map((d) => (
            <Tooltip
              key={d.id}
              title={`${d.name}: ${d.avgScore !== null ? d.avgScore.toFixed(1) : 'not yet scored'} (${d.scoredCount}/${d.totalCount})`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.name.split(' ').slice(0, 2).join(' ')}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: d.avgScore === null
                      ? 'hsl(210 26% 85%)'
                      : d.avgScore >= 3.2
                        ? 'hsl(125 50% 35%)'
                        : d.avgScore >= 2.4
                          ? 'hsl(41 95% 46%)'
                          : 'hsl(0 65% 51%)',
                  }}
                />
                {d.avgScore !== null && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', minWidth: 20 }}>
                    {d.avgScore.toFixed(1)}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Gate failures */}
        {gateFailures.length > 0 && (
          <Tooltip title={gateFailures.map((g) => `${g.criterion_id} (${g.severity}): scored ${g.score}`).join(' · ')}>
            <Chip
              label={`${gateFailures.length} gate failure${gateFailures.length > 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'hsl(0 82% 96%)', color: 'hsl(0 65% 51%)', border: '1px solid hsl(4 100% 92%)', fontSize: '0.7rem', height: 22 }}
            />
          </Tooltip>
        )}


      </Box>
    </Box>
  )
}
