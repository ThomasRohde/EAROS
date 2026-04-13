import { useCallback, useMemo, useState } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Chip, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

// Rank 12 — must beat the built-in MaterialOneOfRenderer (rank 5) which
// otherwise shows unusable "oneOf-0 / oneOf-1 / oneOf-2" tabs.
export const scaleTester = rankWith(12, scopeEndIs('scale'))

function ScaleRendererComponent({ data, handleChange, path }: ControlProps) {
  const [draft, setDraft] = useState('')

  // Normalise: data can be an array (most common), a string reference, or an
  // object map. We always display as chips for the array case and fall back to
  // a plain text field for exotic shapes.
  const isArray = Array.isArray(data)

  const items: (string | number)[] = useMemo(
    () => (isArray ? data : []),
    [data, isArray],
  )

  const commitAll = useCallback(
    (next: (string | number)[]) => handleChange(path, next),
    [handleChange, path],
  )

  const removeAt = useCallback(
    (index: number) => commitAll(items.filter((_, i) => i !== index)),
    [commitAll, items],
  )

  const addItem = useCallback(() => {
    const trimmed = draft.trim()
    setDraft('')
    if (!trimmed) return
    // Keep numeric values as numbers
    const value = /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed
    commitAll([...items, value])
  }, [commitAll, draft, items])

  // Non-array fallback: render as a plain text field with JSON
  if (!isArray && data !== undefined && data !== null) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    return (
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.72rem' }}
        >
          Scale
        </Typography>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={1}
          maxRows={6}
          value={raw}
          onChange={(e) => {
            const v = e.target.value
            try {
              handleChange(path, JSON.parse(v))
            } catch {
              handleChange(path, v)
            }
          }}
          variant="outlined"
          helperText="Non-array scale — edit as JSON or plain text"
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem', fontFamily: 'monospace' } }}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.72rem' }}
      >
        Scale
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5, alignItems: 'center' }}>
        {items.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
            No scale values — add below or use the common ordinal preset
          </Typography>
        )}
        {items.map((item, index) => (
          <Chip
            key={index}
            label={String(item)}
            size="small"
            variant="outlined"
            onDelete={() => removeAt(index)}
            sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TextField
          size="small"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder="Add value (e.g. 0, 1, N/A)"
          variant="outlined"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
        />
        <Tooltip title="Add">
          <span>
            <IconButton size="small" onClick={addItem} disabled={!draft.trim()} aria-label="Add scale value">
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {items.length === 0 && (
        <Chip
          label='Use standard ordinal [0, 1, 2, 3, 4, "N/A"]'
          size="small"
          color="primary"
          variant="outlined"
          onClick={() => commitAll([0, 1, 2, 3, 4, 'N/A'])}
          sx={{ mt: 0.5, cursor: 'pointer', fontSize: '0.72rem' }}
        />
      )}
    </Box>
  )
}

export const ScaleRenderer = withJsonFormsControlProps(ScaleRendererComponent)
