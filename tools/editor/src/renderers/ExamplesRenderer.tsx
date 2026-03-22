import { useState } from 'react'
import { rankWith, scopeEndIs, and, schemaTypeIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Chip, TextField, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

export const examplesTester = rankWith(
  10,
  and(scopeEndIs('examples'), schemaTypeIs('object')),
)

interface ExamplesPanelProps {
  title: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  type: 'good' | 'bad'
}

function ExamplesPanel({ title, items, onAdd, onRemove, type }: ExamplesPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const isGood = type === 'good'
  const headerBg = isGood ? 'hsl(127 47% 30%)' : 'hsl(0 65% 51%)'
  const bodyBg = isGood ? 'hsl(129 33% 92%)' : 'hsl(0 82% 96%)'
  const borderColor = isGood ? 'hsl(125 46% 84%)' : 'hsl(4 100% 92%)'
  const chipColor = isGood ? ('success' as const) : ('error' as const)
  const placeholder = isGood
    ? 'Example of strong evidence for this criterion'
    : 'Example of weak or missing evidence'

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInputValue('')
  }

  return (
    <Box sx={{ flex: 1, minWidth: 200, border: `1px solid ${borderColor}`, borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: headerBg, px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {isGood ? (
          <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 15 }} />
        ) : (
          <HighlightOffIcon sx={{ color: 'white', fontSize: 15 }} />
        )}
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.73rem' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ bgcolor: bodyBg, p: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1, minHeight: 44 }}>
          {items.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center', fontSize: '0.72rem' }}>
              No examples yet
            </Typography>
          )}
          {items.map((item, index) => (
            <Chip
              key={index}
              label={item}
              size="small"
              color={chipColor}
              variant="outlined"
              onDelete={() => onRemove(index)}
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
              handleAdd()
            }
          }}
          onBlur={handleAdd}
          placeholder={placeholder}
          variant="outlined"
          sx={{ '& .MuiInputBase-input': { fontSize: '0.78rem' } }}
        />
      </Box>
    </Box>
  )
}

function ExamplesRendererComponent({ data, handleChange, path }: ControlProps) {
  const examples = (data ?? {}) as { good?: string[]; bad?: string[] }
  const good = examples.good ?? []
  const bad = examples.bad ?? []

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block', fontSize: '0.75rem' }}
      >
        Examples — good evidence vs. weak/missing evidence
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <ExamplesPanel
          title="Good Examples"
          items={good}
          onAdd={(v) => handleChange(path, { ...examples, good: [...good, v] })}
          onRemove={(i) => handleChange(path, { ...examples, good: good.filter((_, idx) => idx !== i) })}
          type="good"
        />
        <ExamplesPanel
          title="Bad Examples"
          items={bad}
          onAdd={(v) => handleChange(path, { ...examples, bad: [...bad, v] })}
          onRemove={(i) => handleChange(path, { ...examples, bad: bad.filter((_, idx) => idx !== i) })}
          type="bad"
        />
      </Box>
    </Box>
  )
}

export const ExamplesRenderer = withJsonFormsControlProps(ExamplesRendererComponent)
