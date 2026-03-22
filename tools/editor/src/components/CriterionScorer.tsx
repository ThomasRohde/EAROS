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
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { scoreColor, getGateSeverity, GateBadge } from '../utils/score-helpers'

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

// scoreColor, getGateSeverity, GateBadge imported from utils/score-helpers

export default function CriterionScorer({ criterion, dimLabel, result, onChange }: Props) {
  const [guideOpen, setGuideOpen] = useState(false)
  const gateSeverity = getGateSeverity(criterion.gate)
  const hasGuide = criterion.scoring_guide && Object.keys(criterion.scoring_guide).length > 0
  const scoreKeys = hasGuide ? ['4', '3', '2', '1', '0'] : []

  const isScored = result.score !== null
  const borderColor = gateSeverity === 'critical'
    ? 'hsl(4 100% 92%)'
    : gateSeverity === 'major'
      ? 'hsl(51 90% 88%)'
      : undefined

  return (
    <Card
      sx={{
        mb: 1.5,
        ...(borderColor ? { border: `1px solid ${borderColor}` } : {}),
        borderRadius: 2,
        '&:hover': { boxShadow: '0 2px 12px hsl(212 63% 12% / 0.08)' },
        transition: 'box-shadow 0.2s cubic-bezier(0.7, 0, 0.2, 1)',
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
                sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 1, color: 'text.secondary', fontSize: '0.7rem' }}
              >
                {criterion.id}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                {dimLabel}
              </Typography>
              {gateSeverity && <GateBadge severity={gateSeverity} />}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6, color: 'text.primary' }}>
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
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'hsl(213 48% 17% / 0.5)' : 'hsl(60 9% 96%)',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              '& .MuiAccordionSummary-root': { minHeight: 36, px: 1.5, py: 0 },
              '& .MuiAccordionSummary-content': { my: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 0.3 }}>
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
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, pt: 0.25 }}>
                      {criterion.scoring_guide![key]}
                    </Typography>
                  </Box>
                )
              })}
              {criterion.required_evidence && criterion.required_evidence.length > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Required evidence to look for:
                  </Typography>
                  {criterion.required_evidence.map((ev, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', pl: 1, lineHeight: 1.6 }}>
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
