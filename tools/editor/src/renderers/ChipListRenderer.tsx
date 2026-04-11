import { useCallback, useMemo, useState } from 'react'
import { and, isControl, rankWith, schemaMatches } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Chip, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

type ChipConfig = {
  label: string
  chipColor: 'primary' | 'error' | 'success' | 'default'
  bgColor: string
  borderColor: string
}

const CHIP_CONFIG: Record<string, ChipConfig> = {
  required_evidence: {
    label: 'Required Evidence',
    chipColor: 'primary',
    bgColor: 'hsl(219 100% 95%)',
    borderColor: 'hsl(214 100% 83%)',
  },
  anti_patterns: {
    label: 'Anti-Patterns',
    chipColor: 'error',
    bgColor: 'hsl(0 82% 96%)',
    borderColor: 'hsl(4 100% 92%)',
  },
  remediation_hints: {
    label: 'Remediation Hints',
    chipColor: 'success',
    bgColor: 'hsl(129 33% 92%)',
    borderColor: 'hsl(125 46% 84%)',
  },
}

const DEFAULT_CHIP_CONFIG: ChipConfig = {
  label: '',
  chipColor: 'default',
  bgColor: 'hsl(206 33% 96%)',
  borderColor: 'hsl(210 26% 85%)',
}

function getFieldName(scope: string): string {
  return scope.split('/').pop() ?? ''
}

// Does an items sub-schema allow primitive strings? True for `{type: 'string'}`
// and for `{oneOf: [..., {type: 'string'}, ...]}`. The latter is the shape used
// by rubric `required_evidence`, which accepts either plain strings or object
// evidence entries — we render it with chips but preserve any object entries
// unchanged (see passthrough handling below).
function itemsAllowString(items: any): boolean {
  if (!items || Array.isArray(items)) return false
  if (items.type === 'string') return true
  if (Array.isArray(items.oneOf)) {
    return items.oneOf.some((o: any) => o?.type === 'string')
  }
  if (Array.isArray(items.anyOf)) {
    return items.anyOf.some((o: any) => o?.type === 'string')
  }
  return false
}

// Match any array control whose items allow primitive strings. Uses
// `schemaMatches` so the tester sees the resolved sub-schema (not the root).
// Enum-constrained arrays are deferred to the default multi-select renderer.
export const chipListTester = rankWith(
  6,
  and(
    isControl,
    schemaMatches((sub: any) => {
      if (!sub || sub.type !== 'array') return false
      if (!itemsAllowString(sub.items)) return false
      if (sub.items?.type === 'string' && Array.isArray(sub.items.enum) && sub.items.enum.length > 0) return false
      return true
    }),
  ),
)

function summarizeEntry(entry: any): string {
  try {
    const json = JSON.stringify(entry)
    if (!json) return '{…}'
    return json.length > 48 ? `${json.slice(0, 45)}…` : json
  } catch {
    return '{…}'
  }
}

function ChipListRendererComponent({ data, handleChange, path, label, schema, uischema }: ControlProps) {
  const [inputValue, setInputValue] = useState('')
  const scope = (uischema as any).scope ?? path
  const fieldName = getFieldName(scope)
  const config = CHIP_CONFIG[fieldName] ?? DEFAULT_CHIP_CONFIG
  const headerLabel = label || schema?.title || config.label || fieldName.replace(/_/g, ' ')

  // Operate on the raw underlying array so edits can never silently reorder
  // a mixed string/object list. Each display entry keeps its raw index, so
  // removal by index splices the raw array in place; new chips are always
  // appended at the tail. Structured (non-string) entries are rendered in
  // their true positions as read-only chips so authors can see them.
  const rawItems: any[] = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const stringChipValues = useMemo(
    () => rawItems.filter((e): e is string => typeof e === 'string'),
    [rawItems],
  )

  const commitRaw = useCallback(
    (next: any[]) => {
      handleChange(path, next)
    },
    [handleChange, path],
  )

  const addItem = useCallback(() => {
    const trimmed = inputValue.trim()
    setInputValue('')
    if (!trimmed) return
    if (stringChipValues.includes(trimmed)) return
    commitRaw([...rawItems, trimmed])
  }, [commitRaw, inputValue, rawItems, stringChipValues])

  const removeAt = useCallback(
    (rawIndex: number) => {
      if (rawIndex < 0 || rawIndex >= rawItems.length) return
      commitRaw(rawItems.filter((_, i) => i !== rawIndex))
    },
    [commitRaw, rawItems],
  )

  return (
    <Box sx={{ mb: 1 }}>
      {headerLabel && (
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.72rem', textTransform: 'capitalize' }}
        >
          {headerLabel}
        </Typography>
      )}
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
        {rawItems.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center', fontSize: '0.72rem' }}>
            No items yet — add below
          </Typography>
        )}
        {rawItems.map((entry, rawIndex) => {
          if (typeof entry === 'string') {
            return (
              <Chip
                key={`s-${rawIndex}`}
                label={entry}
                size="small"
                color={config.chipColor}
                variant="outlined"
                onDelete={() => removeAt(rawIndex)}
                sx={{ fontSize: '0.72rem', maxWidth: 320, '.MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.3 } }}
              />
            )
          }
          // Structured entry — shown in its true position as a read-only pill
          // with the underlying JSON in the tooltip. Deletable so authors can
          // remove stale object entries, but not editable from the form path.
          return (
            <Tooltip key={`o-${rawIndex}`} title={`Structured entry (edit YAML to modify): ${summarizeEntry(entry)}`}>
              <Chip
                label={summarizeEntry(entry)}
                size="small"
                variant="filled"
                onDelete={() => removeAt(rawIndex)}
                sx={{
                  fontSize: '0.68rem',
                  fontStyle: 'italic',
                  maxWidth: 320,
                  bgcolor: 'action.disabledBackground',
                  color: 'text.secondary',
                  '.MuiChip-label': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                }}
              />
            </Tooltip>
          )
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
        <TextField
          size="small"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addItem()
            }
          }}
          // Commit pending input on blur so authors who tab out or click Save
          // without pressing Enter don't silently lose their text. Empty /
          // whitespace-only / duplicate inputs are discarded by addItem().
          onBlur={addItem}
          placeholder="Type and press Enter to add"
          helperText={schema?.description}
          variant="outlined"
        />
        <Tooltip title="Add">
          <span>
            <IconButton
              size="small"
              onClick={addItem}
              disabled={inputValue.trim().length === 0}
              sx={{ mt: 0.5 }}
              aria-label="Add chip"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}

export const ChipListRenderer = withJsonFormsControlProps(ChipListRendererComponent)
