import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'

export interface CriterionResult {
  score: number | 'N/A' | null
  confidence: string
  evidence_class: string
  evidence: string
}

export interface RubricCriterion {
  id: string
  question: string
  description?: string
  gate?: { enabled: boolean; severity: string; failure_effect?: string } | false | null
  scoring_guide?: Record<string, string>
  required_evidence?: string[]
  anti_patterns?: string[]
}

interface Props {
  criterion: RubricCriterion
  dimLabel: string
  result: CriterionResult
  onChange: (updated: CriterionResult) => void
}

const SCORE_OPTIONS = [
  { value: 0, label: '0 – Absent' },
  { value: 1, label: '1 – Weak' },
  { value: 2, label: '2 – Partial' },
  { value: 3, label: '3 – Good' },
  { value: 4, label: '4 – Strong' },
  { value: 'N/A', label: 'N/A – Not Applicable' },
]

const CONFIDENCE_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const EVIDENCE_OPTIONS = [
  { value: 'observed', label: 'Observed – direct quote from artifact' },
  { value: 'inferred', label: 'Inferred – reasonable interpretation' },
  { value: 'external', label: 'External – based on a standard or policy' },
]

function getGateSeverity(gate: RubricCriterion['gate']): string | null {
  if (!gate) return null
  if (typeof gate === 'boolean') return null
  if (!gate.enabled) return null
  return gate.severity ?? null
}

function GateBadge({ severity }: { severity: string }) {
  if (severity === 'critical') {
    return (
      <Tooltip title="Critical gate: failure immediately rejects the artifact regardless of other scores">
        <Chip
          icon={<ReportProblemIcon sx={{ fontSize: '14px !important' }} />}
          label="CRITICAL GATE"
          size="small"
          sx={{
            bgcolor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
          }}
        />
      </Tooltip>
    )
  }
  if (severity === 'major') {
    return (
      <Tooltip title="Major gate: a score below 2 may cap the evaluation status at Conditional Pass">
        <Chip
          icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
          label="MAJOR GATE"
          size="small"
          sx={{
            bgcolor: '#fff8e1',
            color: '#e65100',
            border: '1px solid #ffcc02',
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
          }}
        />
      </Tooltip>
    )
  }
  if (severity === 'advisory') {
    return (
      <Chip
        label="ADVISORY"
        size="small"
        sx={{
          bgcolor: '#e3f2fd',
          color: '#1565c0',
          border: '1px solid #90caf9',
          fontWeight: 600,
          fontSize: '0.65rem',
          height: 22,
        }}
      />
    )
  }
  return null
}

// Color for score chips in the scoring guide
function scoreColor(scoreKey: string) {
  switch (scoreKey) {
    case '4': return { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' }
    case '3': return { bg: '#f1f8e9', color: '#33691e', border: '#c5e1a5' }
    case '2': return { bg: '#fff8e1', color: '#e65100', border: '#ffe082' }
    case '1': return { bg: '#fbe9e7', color: '#bf360c', border: '#ffab91' }
    case '0': return { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' }
    default: return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' }
  }
}

export default function CriterionScorer({ criterion, dimLabel, result, onChange }: Props) {
  const [guideOpen, setGuideOpen] = useState(false)
  const gateSeverity = getGateSeverity(criterion.gate)
  const hasGuide = criterion.scoring_guide && Object.keys(criterion.scoring_guide).length > 0
  const scoreKeys = hasGuide ? ['4', '3', '2', '1', '0'] : []

  const isScored = result.score !== null
  const borderColor = gateSeverity === 'critical'
    ? '#ef9a9a'
    : gateSeverity === 'major'
      ? '#ffe082'
      : '#e0e0e0'

  return (
    <Card
      sx={{
        mb: 1.5,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
        transition: 'box-shadow 0.15s',
        opacity: isScored ? 1 : 0.85,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', px: 0.75, py: 0.25, borderRadius: 1, color: '#555', fontSize: '0.7rem' }}
              >
                {criterion.id}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', fontSize: '0.7rem' }}>
                {dimLabel}
              </Typography>
              {gateSeverity && <GateBadge severity={gateSeverity} />}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6, color: '#1a1a2e' }}>
              {criterion.question}
            </Typography>
          </Box>
        </Box>

        {/* Scoring guide accordion */}
        {hasGuide && (
          <Accordion
            expanded={guideOpen}
            onChange={() => setGuideOpen((v) => !v)}
            disableGutters
            elevation={0}
            sx={{
              mb: 2,
              bgcolor: '#fafafa',
              border: '1px solid #eeeeee',
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              '& .MuiAccordionSummary-root': { minHeight: 36, px: 1.5, py: 0 },
              '& .MuiAccordionSummary-content': { my: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', letterSpacing: 0.3 }}>
                Scoring Guide — what each level means for this criterion
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>
              {scoreKeys.map((key) => {
                const colors = scoreColor(key)
                const levelLabel = { '4': 'Strong', '3': 'Good', '2': 'Partial', '1': 'Weak', '0': 'Absent' }[key]
                return (
                  <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.75, alignItems: 'flex-start' }}>
                    <Chip
                      label={`${key} – ${levelLabel}`}
                      size="small"
                      sx={{
                        bgcolor: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                        fontSize: '0.65rem',
                        height: 20,
                        flexShrink: 0,
                        minWidth: 80,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#444', lineHeight: 1.5, pt: 0.25 }}>
                      {criterion.scoring_guide![key]}
                    </Typography>
                  </Box>
                )
              })}
              {criterion.required_evidence && criterion.required_evidence.length > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #eeeeee' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', display: 'block', mb: 0.5 }}>
                    Required evidence to look for:
                  </Typography>
                  {criterion.required_evidence.map((ev, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', color: '#555', pl: 1, lineHeight: 1.6 }}>
                      · {ev}
                    </Typography>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Scoring controls */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Score</InputLabel>
            <Select
              label="Score"
              value={result.score ?? ''}
              onChange={(e) => onChange({ ...result, score: e.target.value as any })}
            >
              <MenuItem value=""><em>— not scored yet —</em></MenuItem>
              {SCORE_OPTIONS.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Confidence</InputLabel>
            <Select
              label="Confidence"
              value={result.confidence}
              onChange={(e) => onChange({ ...result, confidence: e.target.value })}
            >
              <MenuItem value=""><em>—</em></MenuItem>
              {CONFIDENCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Evidence type</InputLabel>
            <Select
              label="Evidence type"
              value={result.evidence_class}
              onChange={(e) => onChange({ ...result, evidence_class: e.target.value })}
            >
              <MenuItem value=""><em>—</em></MenuItem>
              {EVIDENCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          multiline
          minRows={2}
          fullWidth
          size="small"
          label="Evidence and rationale"
          placeholder="Paste a quote from the artifact, or note what was found / missing…"
          value={result.evidence}
          onChange={(e) => onChange({ ...result, evidence: e.target.value })}
          sx={{ '& .MuiInputBase-root': { fontSize: '0.85rem' } }}
        />
      </CardContent>
    </Card>
  )
}
