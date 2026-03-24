import { useMemo, useState } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps, useJsonForms } from '@jsonforms/react'
import type { ControlProps, UISchemaElement } from '@jsonforms/core'
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material'
import type { ManifestData } from '../manifest'

interface InheritsOption {
  rubric_id: string
  title: string
  category: string
}

export const inheritsTester = rankWith(
  10,
  scopeEndIs('inherits') as (uischema: UISchemaElement, schema: any, context: any) => boolean,
)

function InheritsRendererComponent({ data, handleChange, path, schema, config }: ControlProps) {
  const ctx = useJsonForms()
  const currentRubricId = (ctx.core?.data as any)?.rubric_id ?? ''
  const manifest: ManifestData | null = (config as any)?.manifest ?? null

  const items: string[] = Array.isArray(data) ? data.filter((i): i is string => typeof i === 'string') : []

  const options: InheritsOption[] = useMemo(() => {
    if (!manifest) return []
    const entries: InheritsOption[] = []
    for (const [category, list] of [
      ['Core', manifest.core],
      ['Profiles', manifest.profiles],
      ['Overlays', manifest.overlays],
    ] as const) {
      for (const entry of list ?? []) {
        if (entry.rubric_id && entry.rubric_id !== currentRubricId) {
          entries.push({
            rubric_id: entry.rubric_id,
            title: entry.title ?? '',
            category: category as string,
          })
        }
      }
    }
    return entries
  }, [manifest, currentRubricId])

  // Map selected IDs to option objects (or create placeholders for unknown IDs)
  const selectedOptions: InheritsOption[] = items.map(
    (id) => options.find((o) => o.rubric_id === id) ?? { rubric_id: id, title: '', category: 'Other' },
  )

  // Fallback: no manifest — basic text input with chips
  const [inputValue, setInputValue] = useState('')
  if (!manifest) {
    const addItem = () => {
      const trimmed = inputValue.trim()
      if (!trimmed || items.includes(trimmed)) {
        setInputValue('')
        return
      }
      handleChange(path, [...items, trimmed])
      setInputValue('')
    }
    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: '0.75rem' }}
        >
          Inherits
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            mb: 1,
            minHeight: 40,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'hsl(219 100% 95%)',
          }}
        >
          {items.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center', fontSize: '0.72rem' }}>
              No inherited rubrics — add below
            </Typography>
          )}
          {items.map((item, index) => (
            <Chip
              key={index}
              label={item}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={() => handleChange(path, items.filter((_, i) => i !== index))}
              sx={{ fontSize: '0.72rem' }}
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
          placeholder="Type a rubric ID and press Enter"
          helperText={schema?.description}
          variant="outlined"
        />
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: '0.75rem' }}
      >
        Inherits
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        options={options}
        value={selectedOptions}
        onChange={(_, newValue) => {
          const ids = newValue.map((v) => (typeof v === 'string' ? v : v.rubric_id))
          handleChange(path, ids)
        }}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.rubric_id)}
        renderOption={(props, option) => (
          <li {...props} key={typeof option === 'string' ? option : option.rubric_id}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {typeof option === 'string' ? option : option.rubric_id}
              </Typography>
              {typeof option !== 'string' && option.title && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                  {option.title}
                </Typography>
              )}
            </Box>
          </li>
        )}
        groupBy={(option) => (typeof option === 'string' ? '' : option.category)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return (
              <Chip
                key={key}
                {...tagProps}
                label={typeof option === 'string' ? option : option.rubric_id}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.72rem' }}
              />
            )
          })
        }
        isOptionEqualToValue={(option, value) => option.rubric_id === value.rubric_id}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={items.length === 0 ? 'Select rubric IDs to inherit...' : ''}
            helperText={schema?.description}
            variant="outlined"
          />
        )}
      />
    </Box>
  )
}

export const InheritsRenderer = withJsonFormsControlProps(InheritsRendererComponent)
