import { useCallback } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

// Rank 12 — must beat the built-in MaterialOneOfRenderer (rank 5) which
// otherwise shows unusable "oneOf-0 / oneOf-1" tabs.
export const gateTester = rankWith(12, scopeEndIs('gate'))

interface GateObject {
  enabled: boolean
  severity: 'advisory' | 'major' | 'critical'
  failure_effect?: string
}

function GateRendererComponent({ data, handleChange, path }: ControlProps) {
  const isObject = data !== null && typeof data === 'object' && !Array.isArray(data)
  const isBool = typeof data === 'boolean'
  const enabled = isObject ? (data as GateObject).enabled : isBool ? data : false

  const toggleEnabled = useCallback(() => {
    if (!enabled) {
      // Switching on → promote to object form with defaults
      handleChange(path, { enabled: true, severity: 'major' })
    } else {
      // Switching off → collapse to simple boolean
      handleChange(path, false)
    }
  }, [enabled, handleChange, path])

  const updateField = useCallback(
    (field: string, value: string) => {
      const current: GateObject = isObject
        ? (data as GateObject)
        : { enabled: true, severity: 'major' }
      handleChange(path, { ...current, [field]: value })
    },
    [data, handleChange, isObject, path],
  )

  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.72rem' }}
      >
        Gate
      </Typography>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={toggleEnabled} size="small" />}
        label={
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            {enabled ? 'Gate enabled' : 'No gate'}
          </Typography>
        }
        sx={{ ml: 0 }}
      />

      {enabled && isObject && (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Severity</InputLabel>
            <Select
              value={(data as GateObject).severity ?? 'major'}
              label="Severity"
              onChange={(e) => updateField('severity', e.target.value)}
              sx={{ fontSize: '0.85rem' }}
            >
              <MenuItem value="advisory">Advisory</MenuItem>
              <MenuItem value="major">Major</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Failure effect"
            multiline
            minRows={1}
            maxRows={4}
            value={(data as GateObject).failure_effect ?? ''}
            onChange={(e) => updateField('failure_effect', e.target.value)}
            variant="outlined"
            sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
          />
        </Box>
      )}
    </Box>
  )
}

export const GateRenderer = withJsonFormsControlProps(GateRendererComponent)
