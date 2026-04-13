import { useCallback, useState } from 'react'
import { rankWith, scopeEndIs, and, schemaTypeIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'

export const examplesTester = rankWith(
  10,
  and(scopeEndIs('examples'), schemaTypeIs('object')),
)

interface ExamplesPanelProps {
  title: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  onUpdate: (index: number, value: string) => void
  type: 'good' | 'bad'
}

function ExamplesPanel({ title, items, onAdd, onRemove, onUpdate, type }: ExamplesPanelProps) {
  const [draft, setDraft] = useState('')
  const isGood = type === 'good'
  const headerBg = isGood ? 'hsl(127 47% 30%)' : 'hsl(0 65% 51%)'
  const bodyBg = isGood ? 'hsl(129 33% 92%)' : 'hsl(0 82% 96%)'
  const borderColor = isGood ? 'hsl(125 46% 84%)' : 'hsl(4 100% 92%)'
  const placeholder = isGood
    ? 'Example of strong evidence for this criterion'
    : 'Example of weak or missing evidence'

  const handleAdd = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setDraft('')
  }, [draft, onAdd])

  return (
    <Box sx={{ flex: 1, minWidth: 240, border: `1px solid ${borderColor}`, borderRadius: 1, overflow: 'hidden' }}>
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
      <Box sx={{ bgcolor: bodyBg, p: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {items.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
            No examples yet
          </Typography>
        )}
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={1}
              maxRows={6}
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  py: 0.75,
                  px: 1.5,
                  fontSize: '0.8rem',
                  bgcolor: 'rgba(255,255,255,0.6)',
                },
              }}
            />
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                sx={{ mt: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                aria-label="Remove example"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <TextField
            size="small"
            fullWidth
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
            }}
            onBlur={handleAdd}
            placeholder={placeholder}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', bgcolor: 'rgba(255,255,255,0.6)' } }}
          />
          <Tooltip title="Add">
            <span>
              <IconButton
                size="small"
                onClick={handleAdd}
                disabled={!draft.trim()}
                sx={{ mt: 0.5 }}
                aria-label="Add example"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
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
          onUpdate={(i, v) => handleChange(path, { ...examples, good: good.map((item, idx) => idx === i ? v : item) })}
          type="good"
        />
        <ExamplesPanel
          title="Bad Examples"
          items={bad}
          onAdd={(v) => handleChange(path, { ...examples, bad: [...bad, v] })}
          onRemove={(i) => handleChange(path, { ...examples, bad: bad.filter((_, idx) => idx !== i) })}
          onUpdate={(i, v) => handleChange(path, { ...examples, bad: bad.map((item, idx) => idx === i ? v : item) })}
          type="bad"
        />
      </Box>
    </Box>
  )
}

export const ExamplesRenderer = withJsonFormsControlProps(ExamplesRendererComponent)
