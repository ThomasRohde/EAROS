import { useState } from 'react'
import { rankWith, scopeEndIs, or } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps, UISchemaElement } from '@jsonforms/core'
import { Box, Chip, TextField, Typography } from '@mui/material'

const CHIP_CONFIG = {
  required_evidence: {
    label: 'Required Evidence',
    chipColor: 'primary' as const,
    bgColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  anti_patterns: {
    label: 'Anti-Patterns',
    chipColor: 'error' as const,
    bgColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  remediation_hints: {
    label: 'Remediation Hints',
    chipColor: 'success' as const,
    bgColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
}

type ChipFieldName = keyof typeof CHIP_CONFIG

function getFieldName(scope: string): string {
  return scope.split('/').pop() ?? ''
}

export const chipListTester = rankWith(
  10,
  or(
    scopeEndIs('required_evidence'),
    scopeEndIs('anti_patterns'),
    scopeEndIs('remediation_hints'),
  ) as (uischema: UISchemaElement, schema: any, context: any) => boolean,
)

function ChipListRendererComponent({ data, handleChange, path, schema, uischema }: ControlProps) {
  const [inputValue, setInputValue] = useState('')
  const scope = (uischema as any).scope ?? path
  const fieldName = getFieldName(scope) as ChipFieldName
  const config = CHIP_CONFIG[fieldName]
  const items: string[] = Array.isArray(data) ? data.filter((i): i is string => typeof i === 'string') : []

  const addItem = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || items.includes(trimmed)) {
      setInputValue('')
      return
    }
    handleChange(path, [...items, trimmed])
    setInputValue('')
  }

  const removeItem = (index: number) => {
    handleChange(path, items.filter((_, i) => i !== index))
  }

  if (!config) return null

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: '0.75rem' }}
      >
        {config.label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          mb: 1,
          minHeight: 40,
          p: 1,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 1,
          bgcolor: config.bgColor,
        }}
      >
        {items.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center', fontSize: '0.72rem' }}>
            No items yet — add below
          </Typography>
        )}
        {items.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size="small"
            color={config.chipColor}
            variant="outlined"
            onDelete={() => removeItem(index)}
            sx={{ fontSize: '0.72rem', maxWidth: 320, '.MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.3 } }}
          />
        ))}
      </Box>
      <TextField
        size="small"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addItem()
          }
        }}
        onBlur={addItem}
        placeholder="Type and press Enter to add"
        helperText={schema?.description}
        variant="outlined"
      />
    </Box>
  )
}

export const ChipListRenderer = withJsonFormsControlProps(ChipListRendererComponent)
