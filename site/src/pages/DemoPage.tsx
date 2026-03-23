import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { sapphire } from '../theme'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type GateSeverity = 'none' | 'major' | 'critical'

interface ScoringLevel {
  score: number
  label: string
}

interface Criterion {
  id: string
  dimensionName: string
  question: string
  gateSeverity: GateSeverity
  gateFailureEffect: string
  gateThreshold: number // score below this triggers gate failure
  levels: ScoringLevel[]
}

type Status =
  | 'pass'
  | 'conditional_pass'
  | 'rework_required'
  | 'reject'
  | 'not_reviewable'

interface GateResult {
  criterionId: string
  severity: GateSeverity
  passed: boolean
  failureEffect: string
}

interface ScoringResult {
  weightedAverage: number | null
  gateResults: GateResult[]
  hasCriticalFailure: boolean
  status: Status | null
  allScored: boolean
  scoredCount: number
}

/* ------------------------------------------------------------------ */
/*  Criteria data (from core/core-meta-rubric.yaml)                    */
/* ------------------------------------------------------------------ */

const CRITERIA: Criterion[] = [
  {
    id: 'STK-01',
    dimensionName: 'Stakeholder & purpose fit',
    question:
      'Does the artifact explicitly identify intended stakeholders, decision purpose, and review context?',
    gateSeverity: 'major',
    gateFailureEffect: 'Cannot pass above Conditional Pass',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'Absent or contradicted' },
      { score: 1, label: 'Implied only' },
      { score: 2, label: 'Explicit but incomplete' },
      { score: 3, label: 'Explicit and mostly complete' },
      { score: 4, label: 'Explicit, complete, and used consistently' },
    ],
  },
  {
    id: 'SCP-01',
    dimensionName: 'Scope & boundary clarity',
    question:
      'Does the artifact define scope, boundaries, assumptions, and exclusions?',
    gateSeverity: 'critical',
    gateFailureEffect: 'Not Reviewable when score < 2',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'No scope or boundary' },
      { score: 1, label: 'Scope is ambiguous' },
      { score: 2, label: 'Basic scope exists but is incomplete' },
      { score: 3, label: 'Scope and boundaries are clear' },
      {
        score: 4,
        label: 'Scope and boundaries are clear, tested, and internally consistent',
      },
    ],
  },
  {
    id: 'TRC-01',
    dimensionName: 'Traceability to drivers',
    question:
      'Are business drivers, objectives, or requirements traceably connected to the architecture content?',
    gateSeverity: 'major',
    gateFailureEffect: 'Cannot pass if score < 2',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'No traceability — no drivers referenced' },
      {
        score: 1,
        label: 'Loose narrative only — drivers mentioned but not connected',
      },
      {
        score: 2,
        label: 'Partial traceability — some decisions linked to drivers',
      },
      {
        score: 3,
        label: 'Clear traceability for most important items',
      },
      {
        score: 4,
        label: 'Consistent traceability — matrix or explicit markup throughout',
      },
    ],
  },
  {
    id: 'ACT-01',
    dimensionName: 'Actionability',
    question:
      'Can delivery and governance teams act on the artifact without major reinterpretation?',
    gateSeverity: 'none',
    gateFailureEffect: '',
    gateThreshold: 0,
    levels: [
      { score: 0, label: 'Not actionable — purely descriptive' },
      {
        score: 1,
        label: 'Heavily ambiguous — "next steps to be determined"',
      },
      {
        score: 2,
        label: 'Partly actionable — some decisions made, significant gaps',
      },
      {
        score: 3,
        label: 'Mostly actionable — key decisions made, most actions owned',
      },
      {
        score: 4,
        label: 'Fully actionable — all decisions explicit, all actions owned and dated',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Sample artifact                                                    */
/* ------------------------------------------------------------------ */

const SAMPLE_ARTIFACT = `Payment Gateway Migration — Solution Architecture

Purpose: This document supports the Architecture Board review of the
Payment Gateway migration from monolithic batch processing to event-driven
real-time settlement. Primary stakeholders: CTO (strategic oversight),
Head of Payments (domain ownership), Security Architecture (compliance
review), Platform Engineering Lead (infrastructure).
Review context: Stage gate review before Q3 2026 implementation begins.

Business Drivers:
  - Reduce settlement latency from T+1 to near real-time
  - Support ISO 20022 messaging standard adoption
  - Improve fraud detection response time

Architecture Overview:
The proposed architecture replaces the existing batch-based settlement
engine with an event-driven pipeline using Apache Kafka for message
streaming and a new Settlement Service that processes payment events in
real-time. The Fraud Detection module will consume the same event stream
to enable sub-second risk scoring.

Technology Stack: Kafka 3.7, Java 21, PostgreSQL 16, Redis 7, AWS EKS.

Compliance: The solution will comply with all applicable PCI-DSS and
PSD2 requirements.

Next Steps:
  - Finalize detailed design
  - Complete security review
  - Begin implementation`

/* ------------------------------------------------------------------ */
/*  Scoring logic                                                      */
/* ------------------------------------------------------------------ */

function computeResults(
  scores: Record<string, number | null>,
): ScoringResult {
  const scored = Object.entries(scores).filter(
    (e): e is [string, number] => e[1] !== null,
  )
  const scoredCount = scored.length
  const allScored = scoredCount === CRITERIA.length

  // Gate evaluation (always first)
  const gateResults: GateResult[] = CRITERIA.filter(
    (c) => c.gateSeverity !== 'none',
  ).map((c) => {
    const s = scores[c.id]
    const passed = s === null || s >= c.gateThreshold
    return {
      criterionId: c.id,
      severity: c.gateSeverity,
      passed,
      failureEffect: c.gateFailureEffect,
    }
  })

  const hasCriticalFailure = gateResults.some(
    (g) => g.severity === 'critical' && !g.passed,
  )
  const hasMajorFailure = gateResults.some(
    (g) => g.severity === 'major' && !g.passed,
  )

  // Weighted average (all weights are 1.0)
  const weightedAverage =
    scoredCount > 0
      ? scored.reduce((sum, [, v]) => sum + v, 0) / scoredCount
      : null

  // Status determination
  let status: Status | null = null
  if (scoredCount > 0) {
    if (hasCriticalFailure) {
      status = 'not_reviewable'
    } else if (weightedAverage !== null) {
      const noScoreBelow2 = scored.every(([, v]) => v >= 2)
      if (
        weightedAverage >= 3.2 &&
        !hasMajorFailure &&
        noScoreBelow2
      ) {
        status = 'pass'
      } else if (weightedAverage >= 2.4 && !hasMajorFailure) {
        status = 'conditional_pass'
      } else {
        status = 'rework_required'
      }
    }
  }

  return {
    weightedAverage,
    gateResults,
    hasCriticalFailure,
    status,
    allScored,
    scoredCount,
  }
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number, isDark: boolean): string {
  const colors: Record<number, string> = {
    0: isDark ? sapphire.red[500] : sapphire.red[700],
    1: isDark ? sapphire.red[500] : sapphire.red[500],
    2: isDark ? sapphire.yellow[300] : sapphire.yellow[700],
    3: isDark ? sapphire.green[400] : sapphire.green[600],
    4: isDark ? sapphire.green[400] : sapphire.green[500],
  }
  return colors[score] ?? (isDark ? sapphire.gray[400] : sapphire.gray[600])
}

function getScoreBg(score: number, isDark: boolean): string {
  const bgs: Record<number, string> = {
    0: isDark ? 'hsl(0 65% 51% / 0.15)' : sapphire.red[50],
    1: isDark ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50],
    2: isDark ? 'hsl(41 95% 46% / 0.15)' : sapphire.yellow[50],
    3: isDark ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50],
    4: isDark ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50],
  }
  return bgs[score] ?? 'transparent'
}

function getGateChipProps(
  severity: GateSeverity,
  isDark: boolean,
): { bg: string; color: string; label: string } {
  switch (severity) {
    case 'critical':
      return {
        bg: isDark ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50],
        color: isDark ? sapphire.red[500] : sapphire.red[700],
        label: 'Critical gate',
      }
    case 'major':
      return {
        bg: isDark ? 'hsl(41 95% 46% / 0.12)' : sapphire.yellow[50],
        color: isDark ? sapphire.yellow[300] : sapphire.yellow[700],
        label: 'Major gate',
      }
    default:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        color: isDark ? sapphire.gray[400] : sapphire.gray[600],
        label: 'No gate',
      }
  }
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; colorFn: (isDark: boolean) => string; bgFn: (isDark: boolean) => string }
> = {
  pass: {
    label: 'Pass',
    colorFn: (d) => (d ? sapphire.green[400] : sapphire.green[700]),
    bgFn: (d) => (d ? 'hsl(125 50% 35% / 0.15)' : sapphire.green[50]),
  },
  conditional_pass: {
    label: 'Conditional Pass',
    colorFn: (d) => (d ? sapphire.yellow[300] : sapphire.yellow[700]),
    bgFn: (d) => (d ? 'hsl(41 95% 46% / 0.15)' : sapphire.yellow[50]),
  },
  rework_required: {
    label: 'Rework Required',
    colorFn: (d) => (d ? sapphire.red[500] : sapphire.red[700]),
    bgFn: (d) => (d ? 'hsl(0 65% 51% / 0.12)' : sapphire.red[50]),
  },
  reject: {
    label: 'Reject',
    colorFn: (d) => (d ? sapphire.red[500] : sapphire.red[700]),
    bgFn: (d) => (d ? 'hsl(0 65% 51% / 0.18)' : sapphire.red[100]),
  },
  not_reviewable: {
    label: 'Not Reviewable',
    colorFn: (d) => (d ? sapphire.gray[400] : sapphire.gray[600]),
    bgFn: (d) => (d ? 'hsl(211 19% 49% / 0.1)' : sapphire.gray[50]),
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [scores, setScores] = useState<Record<string, number | null>>({
    'STK-01': null,
    'SCP-01': null,
    'TRC-01': null,
    'ACT-01': null,
  })

  const results = computeResults(scores)

  const handleScore = (criterionId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: prev[criterionId] === score ? null : score,
    }))
  }

  const handleReset = () => {
    setScores({ 'STK-01': null, 'SCP-01': null, 'TRC-01': null, 'ACT-01': null })
  }

  /* ---- Score bar position helper ---- */
  const barPercent =
    results.weightedAverage !== null
      ? (results.weightedAverage / 4) * 100
      : null

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* ── Header ── */}
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: isDark ? sapphire.gray[400] : sapphire.gray[500],
            mb: 2,
          }}
        >
          Interactive Demo
        </Typography>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 2,
          }}
        >
          Scoring Simulator
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 6,
            maxWidth: 640,
            mx: 'auto',
          }}
        >
          Read the sample architecture excerpt below, then score it against four
          EaROS core criteria. Watch how gates, weighted averages, and status
          determination work in real time.
        </Typography>

        {/* ── Sample Artifact ── */}
        <Card
          sx={{
            mb: 4,
            bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
            border: isDark
              ? `1px solid hsl(212 33% 27% / 0.6)`
              : `1px solid hsl(212 63% 12% / 0.08)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: 3 } }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem',
                color: isDark ? sapphire.gray[400] : sapphire.gray[500],
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 2,
              }}
            >
              Sample Architecture Excerpt
            </Typography>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '6px',
                bgcolor: isDark ? sapphire.gray[900] : sapphire.gray[50],
                border: isDark
                  ? `1px solid hsl(212 33% 27% / 0.4)`
                  : `1px solid hsl(212 63% 12% / 0.06)`,
                fontFamily:
                  "'Fira Mono', Consolas, Menlo, Monaco, 'Courier New', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.65,
                color: isDark ? sapphire.gray[300] : sapphire.gray[700],
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              {SAMPLE_ARTIFACT}
            </Box>
          </CardContent>
        </Card>

        {/* ── Scoring Cards ── */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '0.85rem',
              color: isDark ? sapphire.gray[400] : sapphire.gray[500],
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Score Each Criterion (0-4)
          </Typography>
          <Tooltip title="Reset all scores">
            <IconButton
              onClick={handleReset}
              size="small"
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[500] }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
            mb: 4,
          }}
        >
          {CRITERIA.map((criterion) => {
            const selected = scores[criterion.id]
            const gate = getGateChipProps(criterion.gateSeverity, isDark)
            const gateResult = results.gateResults.find(
              (g) => g.criterionId === criterion.id,
            )

            return (
              <Card
                key={criterion.id}
                sx={{ bgcolor: isDark ? sapphire.gray[800] : '#ffffff' }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  {/* Header: ID + dimension + gate */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={criterion.id}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                        bgcolor: isDark
                          ? 'hsl(218 92% 49% / 0.12)'
                          : sapphire.blue[50],
                        color: isDark
                          ? sapphire.blue[400]
                          : sapphire.blue[600],
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: isDark
                          ? sapphire.gray[400]
                          : sapphire.gray[500],
                        flex: 1,
                      }}
                    >
                      {criterion.dimensionName}
                    </Typography>
                    <Chip
                      label={gate.label}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.68rem',
                        height: 20,
                        bgcolor: gate.bg,
                        color: gate.color,
                      }}
                    />
                  </Box>

                  {/* Question */}
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: isDark ? '#ffffff' : sapphire.blue[900],
                      mb: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {criterion.question}
                  </Typography>

                  {/* Score buttons */}
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
                    {criterion.levels.map((level) => {
                      const isSelected = selected === level.score
                      return (
                        <Tooltip
                          key={level.score}
                          title={level.label}
                          placement="top"
                          arrow
                        >
                          <Box
                            onClick={() =>
                              handleScore(criterion.id, level.score)
                            }
                            sx={{
                              flex: 1,
                              py: 1,
                              textAlign: 'center',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              transition:
                                'background 0.15s, color 0.15s, box-shadow 0.15s',
                              bgcolor: isSelected
                                ? getScoreBg(level.score, isDark)
                                : isDark
                                  ? 'hsl(211 19% 49% / 0.06)'
                                  : sapphire.gray[50],
                              color: isSelected
                                ? getScoreColor(level.score, isDark)
                                : isDark
                                  ? sapphire.gray[500]
                                  : sapphire.gray[400],
                              border: isSelected
                                ? `1.5px solid ${getScoreColor(level.score, isDark)}`
                                : `1.5px solid transparent`,
                              '&:hover': {
                                bgcolor: getScoreBg(level.score, isDark),
                                color: getScoreColor(level.score, isDark),
                              },
                            }}
                          >
                            {level.score}
                          </Box>
                        </Tooltip>
                      )
                    })}
                  </Box>

                  {/* Selected score label */}
                  <Box sx={{ minHeight: 24 }}>
                    {selected !== null && (
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          color: getScoreColor(selected, isDark),
                          fontWeight: 500,
                        }}
                      >
                        {
                          criterion.levels.find((l) => l.score === selected)
                            ?.label
                        }
                      </Typography>
                    )}
                  </Box>

                  {/* Gate result */}
                  {gateResult && selected !== null && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        mt: 1,
                        pt: 1,
                        borderTop: isDark
                          ? `1px solid hsl(212 33% 27% / 0.4)`
                          : `1px solid hsl(212 63% 12% / 0.06)`,
                      }}
                    >
                      {gateResult.passed ? (
                        <>
                          <CheckCircleIcon
                            sx={{
                              fontSize: 16,
                              color: isDark
                                ? sapphire.green[400]
                                : sapphire.green[500],
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: isDark
                                ? sapphire.green[400]
                                : sapphire.green[600],
                            }}
                          >
                            Gate passed
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CancelIcon
                            sx={{
                              fontSize: 16,
                              color: isDark
                                ? sapphire.red[500]
                                : sapphire.red[700],
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: isDark
                                ? sapphire.red[500]
                                : sapphire.red[700],
                            }}
                          >
                            Gate failed — {gateResult.failureEffect}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </Box>

        {/* ── Results Panel ── */}
        <Card
          sx={{
            mb: 4,
            bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
            border: isDark
              ? `1px solid hsl(212 33% 27% / 0.6)`
              : `1px solid hsl(212 63% 12% / 0.08)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: 3 } }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem',
                color: isDark ? sapphire.gray[400] : sapphire.gray[500],
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 3,
              }}
            >
              Results
            </Typography>

            {/* Score bar */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: isDark ? sapphire.gray[400] : sapphire.gray[500],
                  }}
                >
                  Weighted Average
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color:
                      results.weightedAverage !== null
                        ? getScoreColor(
                            Math.round(results.weightedAverage),
                            isDark,
                          )
                        : isDark
                          ? sapphire.gray[500]
                          : sapphire.gray[400],
                  }}
                >
                  {results.weightedAverage !== null
                    ? `${results.weightedAverage.toFixed(2)} / 4.00`
                    : '— / 4.00'}
                  {results.scoredCount > 0 &&
                    !results.allScored &&
                    ` (${results.scoredCount}/${CRITERIA.length} scored)`}
                </Typography>
              </Box>

              {/* Bar track */}
              <Box
                sx={{
                  position: 'relative',
                  height: 28,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  bgcolor: isDark
                    ? 'hsl(211 19% 49% / 0.08)'
                    : sapphire.gray[50],
                  border: isDark
                    ? `1px solid hsl(212 33% 27% / 0.4)`
                    : `1px solid hsl(212 63% 12% / 0.06)`,
                }}
              >
                {/* Colored zones */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                  }}
                >
                  {/* Red zone: 0 - 2.4 = 60% */}
                  <Box
                    sx={{
                      width: '60%',
                      bgcolor: isDark
                        ? 'hsl(0 65% 51% / 0.08)'
                        : 'hsl(0 65% 51% / 0.06)',
                    }}
                  />
                  {/* Yellow zone: 2.4 - 3.2 = 20% */}
                  <Box
                    sx={{
                      width: '20%',
                      bgcolor: isDark
                        ? 'hsl(41 95% 46% / 0.08)'
                        : 'hsl(41 95% 46% / 0.06)',
                    }}
                  />
                  {/* Green zone: 3.2 - 4 = 20% */}
                  <Box
                    sx={{
                      width: '20%',
                      bgcolor: isDark
                        ? 'hsl(125 50% 35% / 0.08)'
                        : 'hsl(125 50% 35% / 0.06)',
                    }}
                  />
                </Box>

                {/* Threshold markers */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '60%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    bgcolor: isDark
                      ? 'hsl(212 33% 27% / 0.5)'
                      : 'hsl(212 63% 12% / 0.12)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '80%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    bgcolor: isDark
                      ? 'hsl(212 33% 27% / 0.5)'
                      : 'hsl(212 63% 12% / 0.12)',
                  }}
                />

                {/* Score marker */}
                {barPercent !== null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${barPercent}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: getScoreColor(
                        Math.round(results.weightedAverage!),
                        isDark,
                      ),
                      border: `2px solid ${isDark ? sapphire.gray[800] : '#ffffff'}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.3s ease',
                      zIndex: 1,
                    }}
                  />
                )}
              </Box>

              {/* Threshold labels */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  mt: 0.5,
                }}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    left: '60%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.65rem',
                    color: isDark ? sapphire.gray[500] : sapphire.gray[400],
                  }}
                >
                  2.4
                </Typography>
                <Typography
                  sx={{
                    position: 'absolute',
                    left: '80%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.65rem',
                    color: isDark ? sapphire.gray[500] : sapphire.gray[400],
                  }}
                >
                  3.2
                </Typography>
              </Box>
            </Box>

            {/* Gate summary */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: isDark ? sapphire.gray[400] : sapphire.gray[500],
                  mb: 1,
                }}
              >
                Gate Checks
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {results.gateResults.map((g) => {
                  const scored = scores[g.criterionId] !== null
                  const chipProps = getGateChipProps(g.severity, isDark)
                  return (
                    <Box
                      key={g.criterionId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {!scored ? (
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: `1.5px solid ${isDark ? sapphire.gray[600] : sapphire.gray[300]}`,
                          }}
                        />
                      ) : g.passed ? (
                        <CheckCircleIcon
                          sx={{
                            fontSize: 14,
                            color: isDark
                              ? sapphire.green[400]
                              : sapphire.green[500],
                          }}
                        />
                      ) : (
                        <CancelIcon
                          sx={{
                            fontSize: 14,
                            color: isDark
                              ? sapphire.red[500]
                              : sapphire.red[700],
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          color: isDark
                            ? sapphire.gray[300]
                            : sapphire.gray[700],
                        }}
                      >
                        {g.criterionId}
                      </Typography>
                      <Chip
                        label={g.severity}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.62rem',
                          fontWeight: 500,
                          bgcolor: chipProps.bg,
                          color: chipProps.color,
                        }}
                      />
                      {scored && !g.passed && (
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            color: isDark
                              ? sapphire.red[500]
                              : sapphire.red[700],
                            fontStyle: 'italic',
                          }}
                        >
                          {g.failureEffect}
                        </Typography>
                      )}
                    </Box>
                  )
                })}
              </Box>
            </Box>

            {/* Status badge */}
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                textAlign: 'center',
                bgcolor: results.status
                  ? STATUS_CONFIG[results.status].bgFn(isDark)
                  : isDark
                    ? 'hsl(211 19% 49% / 0.06)'
                    : sapphire.gray[50],
                border: results.status
                  ? `1px solid ${STATUS_CONFIG[results.status].colorFn(isDark)}33`
                  : isDark
                    ? `1px solid hsl(212 33% 27% / 0.4)`
                    : `1px solid hsl(212 63% 12% / 0.06)`,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: results.status
                    ? STATUS_CONFIG[results.status].colorFn(isDark)
                    : isDark
                      ? sapphire.gray[500]
                      : sapphire.gray[400],
                }}
              >
                {results.status
                  ? STATUS_CONFIG[results.status].label
                  : 'Score criteria above to see the result'}
              </Typography>
            </Box>

            {/* Educational callouts */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '6px',
                  bgcolor: isDark
                    ? 'hsl(218 92% 49% / 0.06)'
                    : sapphire.blue[50],
                }}
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 16,
                    mt: 0.25,
                    color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: isDark ? sapphire.blue[300] : sapphire.blue[700],
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Gates before averages.</strong> EaROS checks gate
                  criteria first. A single critical gate failure blocks a
                  passing status — regardless of how high the weighted
                  average is.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '6px',
                  bgcolor: isDark
                    ? 'hsl(218 92% 49% / 0.06)'
                    : sapphire.blue[50],
                }}
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 16,
                    mt: 0.25,
                    color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: isDark ? sapphire.blue[300] : sapphire.blue[700],
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Try it:</strong> Give SCP-01 a score of 0 or 1 and
                  watch the status change to "Not Reviewable" — even if
                  every other criterion scores a 4.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ── CLI Install CTA ── */}
        <Card sx={{ bgcolor: isDark ? sapphire.gray[800] : '#ffffff' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: isDark
                  ? 'hsl(218 92% 49% / 0.12)'
                  : sapphire.blue[50],
                color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 500,
                color: isDark ? '#ffffff' : sapphire.blue[900],
                mb: 1,
                fontSize: '1.1rem',
              }}
            >
              Want the full experience?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                maxWidth: 440,
                mx: 'auto',
                mb: 2,
              }}
            >
              The EaROS CLI includes a local editor with artifact editing,
              rubric browsing, full 19-criterion assessments, and AI agent
              skills.
            </Typography>
            <Typography
              variant="body2"
              component="code"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                borderRadius: '8px',
                bgcolor: isDark ? sapphire.gray[900] : sapphire.gray[50],
                color: isDark ? sapphire.gray[300] : sapphire.gray[700],
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}
            >
              npm install -g @trohde/earos
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
