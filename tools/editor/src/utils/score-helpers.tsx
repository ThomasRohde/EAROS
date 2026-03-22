/**
 * Shared score display utilities — used by CriterionScorer and AssessmentViewer.
 */

import { Chip, Tooltip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'

// ─── Score color mapping (Sapphire tokens) ──────────────────────────────────

export function scoreColor(scoreKey: string) {
  switch (scoreKey) {
    case '4': return { bg: 'hsl(129 33% 92%)', color: 'hsl(129 41% 23%)', border: 'hsl(125 46% 84%)' }
    case '3': return { bg: 'hsl(129 33% 92%)', color: 'hsl(127 47% 30%)', border: 'hsl(124 42% 73%)' }
    case '2': return { bg: 'hsl(53 100% 92%)', color: 'hsl(31 94% 33%)', border: 'hsl(51 90% 88%)' }
    case '1': return { bg: 'hsl(0 82% 96%)', color: 'hsl(359 57% 36%)', border: 'hsl(4 100% 92%)' }
    case '0': return { bg: 'hsl(0 82% 96%)', color: 'hsl(0 65% 51%)', border: 'hsl(4 100% 92%)' }
    default: return { bg: 'hsl(206 33% 96%)', color: 'hsl(212 27% 35%)', border: 'hsl(210 26% 85%)' }
  }
}

// ─── Gate severity helper ───────────────────────────────────────────────────

export function getGateSeverity(gate: { enabled: boolean; severity: string; failure_effect?: string } | false | null | undefined): string | null {
  if (!gate) return null
  if (typeof gate === 'boolean') return null
  if (!gate.enabled) return null
  return gate.severity ?? null
}

// ─── Gate badge component ───────────────────────────────────────────────────

export function GateBadge({ severity }: { severity: string }) {
  if (severity === 'critical') {
    return (
      <Tooltip title="Critical gate: failure immediately rejects the artifact regardless of other scores">
        <Chip
          icon={<ReportProblemIcon sx={{ fontSize: '14px !important' }} />}
          label="CRITICAL GATE"
          size="small"
          sx={{
            bgcolor: 'hsl(0 82% 96%)',
            color: 'hsl(0 65% 51%)',
            border: '1px solid hsl(4 100% 92%)',
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
            bgcolor: 'hsl(53 100% 92%)',
            color: 'hsl(31 94% 33%)',
            border: '1px solid hsl(46 97% 65%)',
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
          bgcolor: 'hsl(219 100% 95%)',
          color: 'hsl(218 92% 49%)',
          border: '1px solid hsl(214 100% 83%)',
          fontWeight: 600,
          fontSize: '0.65rem',
          height: 22,
        }}
      />
    )
  }
  return null
}

// ─── Score label lookup ─────────────────────────────────────────────────────

export const SCORE_LABELS: Record<string, string> = {
  '4': 'Strong',
  '3': 'Good',
  '2': 'Partial',
  '1': 'Weak',
  '0': 'Absent',
  'N/A': 'N/A',
}
