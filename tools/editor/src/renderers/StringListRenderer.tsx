import { useCallback, useMemo, useState } from 'react'
import { and, isControl, rankWith, schemaMatches } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'

const LONG_FORM_FIELDS = new Set([
  'positive',
  'negative',
  'downstream_effects',
  'review_triggers',
  'tradeoffs_accepted',
  'changes',
  'pros',
  'cons',
])

function getFieldName(scope: string): string {
  return scope.split('/').pop() ?? ''
}

// Matches string[] arrays whose field name implies long-form prose content.
// Rank 7 beats the generic ChipListRenderer (rank 6) so these fields get a
// stacked TextField layout instead of cramped chips.
export const stringListTester = rankWith(
  7,
  and(
    isControl,
    schemaMatches((sub: any) => {
      if (!sub || sub.type !== 'array') return false
      const items = sub.items
      if (!items || Array.isArray(items)) return false
      return items.type === 'string'
    }),
    (uischema: any) => {
      const scope: string = uischema?.scope ?? ''
      const fieldName = scope.split('/').pop() ?? ''
      return LONG_FORM_FIELDS.has(fieldName)
    },
  ),
)

function StringListRendererComponent({ data, handleChange, path, label, schema, uischema }: ControlProps) {
  const [draft, setDraft] = useState('')
  const scope = (uischema as any).scope ?? path
  const fieldName = getFieldName(scope)
  const headerLabel = label || schema?.title || fieldName.replace(/_/g, ' ')

  const items: string[] = useMemo(
    () => (Array.isArray(data) ? data.filter((e): e is string => typeof e === 'string') : []),
    [data],
  )

  const commitAll = useCallback(
    (next: string[]) => handleChange(path, next),
    [handleChange, path],
  )

  const updateAt = useCallback(
    (index: number, value: string) => {
      const next = [...items]
      next[index] = value
      commitAll(next)
    },
    [commitAll, items],
  )

  const removeAt = useCallback(
    (index: number) => commitAll(items.filter((_, i) => i !== index)),
    [commitAll, items],
  )

  const addItem = useCallback(() => {
    const trimmed = draft.trim()
    setDraft('')
    if (!trimmed) return
    commitAll([...items, trimmed])
  }, [commitAll, draft, items])

  return (
    <Box sx={{ mb: 1 }}>
      {headerLabel && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            mb: 0.5,
            display: 'block',
            fontSize: '0.72rem',
            textTransform: 'capitalize',
          }}
        >
          {headerLabel}
        </Typography>
      )}

      {items.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={1}
            maxRows={4}
            value={item}
            onChange={(e) => updateAt(index, e.target.value)}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { py: 0.75, px: 1.5, fontSize: '0.85rem' } }}
          />
          <Tooltip title="Remove">
            <IconButton
              size="small"
              onClick={() => removeAt(index)}
              sx={{ mt: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
              aria-label="Remove item"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ))}

      {items.length === 0 && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5, fontSize: '0.72rem' }}>
          No items yet
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        <TextField
          fullWidth
          size="small"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              addItem()
            }
          }}
          onBlur={addItem}
          placeholder="Add new item and press Enter"
          variant="outlined"
          helperText={schema?.description}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
        />
        <Tooltip title="Add">
          <span>
            <IconButton
              size="small"
              onClick={addItem}
              disabled={draft.trim().length === 0}
              sx={{ mt: 0.5 }}
              aria-label="Add item"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}

export const StringListRenderer = withJsonFormsControlProps(StringListRendererComponent)
