import { rankWith, scopeEndIs, and, schemaTypeIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, TextField, Typography } from '@mui/material'

const LEVELS = [
  { key: '0', label: '0 — Absent', headerColor: 'hsl(0 65% 51%)', bgColor: 'hsl(0 82% 96%)' },
  { key: '1', label: '1 — Weak', headerColor: 'hsl(359 57% 36%)', bgColor: 'hsl(0 82% 96%)' },
  { key: '2', label: '2 — Partial', headerColor: 'hsl(31 94% 33%)', bgColor: 'hsl(53 100% 92%)' },
  { key: '3', label: '3 — Good', headerColor: 'hsl(127 47% 30%)', bgColor: 'hsl(129 33% 92%)' },
  { key: '4', label: '4 — Strong', headerColor: 'hsl(129 41% 23%)', bgColor: 'hsl(129 33% 92%)' },
]

export const scoringGuideTester = rankWith(
  10,
  and(scopeEndIs('scoring_guide'), schemaTypeIs('object')),
)

function ScoringGuideRendererComponent({ data, handleChange, path }: ControlProps) {
  const guide: Record<string, string> = data ?? {}

  const handleLevelChange = (key: string, value: string) => {
    handleChange(path, { ...guide, [key]: value })
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block', fontSize: '0.75rem' }}
      >
        Scoring Guide — describe what each level looks like for this criterion
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
        {LEVELS.map(({ key, label, headerColor, bgColor }) => (
          <Box
            key={key}
            sx={{ flex: '1 1 0', minWidth: 140, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}
          >
            <Box sx={{ bgcolor: headerColor, px: 1, py: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                {label}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: bgColor, p: 0.75 }}>
              <TextField
                multiline
                minRows={3}
                maxRows={8}
                fullWidth
                size="small"
                value={guide[key] ?? ''}
                onChange={(e) => handleLevelChange(key, e.target.value)}
                placeholder={`What does score ${key} look like?`}
                variant="standard"
                InputProps={{
                  disableUnderline: false,
                  sx: { fontSize: '0.75rem', bgcolor: 'transparent' },
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export const ScoringGuideRenderer = withJsonFormsControlProps(ScoringGuideRendererComponent)
