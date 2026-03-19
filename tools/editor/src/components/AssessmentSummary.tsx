import { useMemo } from 'react'
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  Button,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import DownloadIcon from '@mui/icons-material/Download'
import type { CriterionResult, RubricCriterion } from './CriterionScorer'

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
}

function getGateSeverity(gate: RubricCriterion['gate']): string | null {
  if (!gate) return null
  if (typeof gate === 'boolean') return null
  if (!gate.enabled) return null
  return gate.severity ?? null
}

function computeSummary(
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
        gateFailures.push({ criterion_id: c.id, question: c.question, severity: sev, score: r.score as number })
      }
    }
  }

  const criticalFailures = gateFailures.filter((g) => g.severity === 'critical')

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
      status = 'reject'
    } else if (overallScore >= 3.2 && noLowDimension) {
      status = 'pass'
    } else if (overallScore >= 2.4) {
      status = 'conditional_pass'
    } else {
      status = 'rework_required'
    }
  }

  return { dimSummaries, gateFailures, criticalFailures, overallScore, scoredCriteria, totalCriteria, status }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pass: { label: 'Pass', color: '#1b5e20', bg: '#e8f5e9', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  conditional_pass: { label: 'Conditional Pass', color: '#e65100', bg: '#fff8e1', icon: <InfoIcon sx={{ fontSize: 16 }} /> },
  rework_required: { label: 'Rework Required', color: '#b71c1c', bg: '#ffebee', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
  reject: { label: 'Reject', color: '#4a0000', bg: '#ffcdd2', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
  incomplete: { label: 'Scoring in progress…', color: '#455a64', bg: '#eceff1', icon: null },
}

interface Props {
  dimensions: RubricDimension[]
  results: Record<string, CriterionResult>
  onExport: () => void
}

export default function AssessmentSummary({ dimensions, results, onExport }: Props) {
  const { dimSummaries, gateFailures, overallScore, scoredCriteria, totalCriteria, status } =
    useMemo(() => computeSummary(dimensions, results), [dimensions, results])

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.incomplete
  const progress = totalCriteria > 0 ? (scoredCriteria / totalCriteria) * 100 : 0

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: '#fff',
        borderTop: '2px solid #e0e0e0',
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
              sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#1a237e' } }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#666', whiteSpace: 'nowrap' }}>
            {scoredCriteria} / {totalCriteria} scored
          </Typography>
        </Box>

        {/* Overall score */}
        {overallScore !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>
              {overallScore.toFixed(1)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#888' }}>/4.0</Typography>
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
                <Typography variant="caption" sx={{ color: '#888', fontSize: '0.65rem', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.name.split(' ').slice(0, 2).join(' ')}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: d.avgScore === null
                      ? '#e0e0e0'
                      : d.avgScore >= 3.2
                        ? '#66bb6a'
                        : d.avgScore >= 2.4
                          ? '#ffa726'
                          : '#ef5350',
                  }}
                />
                {d.avgScore !== null && (
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.68rem', minWidth: 20 }}>
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
              sx={{ bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', fontSize: '0.7rem', height: 22 }}
            />
          </Tooltip>
        )}

        {/* Status chip */}
        <Chip
          icon={statusCfg.icon as any}
          label={statusCfg.label}
          size="small"
          sx={{
            bgcolor: statusCfg.bg,
            color: statusCfg.color,
            border: `1px solid ${statusCfg.color}33`,
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 26,
          }}
        />

        {/* Export */}
        <Button
          size="small"
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          disabled={scoredCriteria === 0}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            textTransform: 'none',
            fontWeight: 500,
            ml: 'auto',
          }}
        >
          Export YAML
        </Button>
      </Box>
    </Box>
  )
}
