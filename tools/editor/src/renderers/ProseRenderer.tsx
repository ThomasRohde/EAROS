import { rankWith, scopeEndIs, or, and, schemaTypeIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps, UISchemaElement } from '@jsonforms/core'
import { TextField, Box } from '@mui/material'

const PROSE_FIELDS = ['narrative', 'description', 'purpose', 'rationale', 'summary', 'context']

const PLACEHOLDERS: Record<string, string> = {
  narrative: 'Describe the data flow step by step...',
  description: 'Explain what this means and why it matters...',
  purpose: 'What decision does this artifact support?',
  rationale: 'Explain why this option was chosen over alternatives...',
  summary: 'Provide a concise summary of the key points...',
  context: 'Describe the business and technical context...',
}

function getFieldName(scope: string): string {
  return scope.split('/').pop() ?? ''
}

export const proseTester = rankWith(
  8,
  or(...PROSE_FIELDS.map((name) => and(scopeEndIs(name), schemaTypeIs('string')))) as (uischema: UISchemaElement, schema: any, context: any) => boolean,
)

function ProseRendererComponent({ data, handleChange, path, label, schema, uischema }: ControlProps) {
  const scope = (uischema as any).scope ?? path
  const fieldName = getFieldName(scope)
  const placeholder = PLACEHOLDERS[fieldName] ?? `Enter ${fieldName}...`

  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        fullWidth
        multiline
        minRows={4}
        maxRows={12}
        label={label || schema?.title || fieldName}
        value={data ?? ''}
        onChange={(e) => handleChange(path, e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        helperText={schema?.description}
      />
    </Box>
  )
}

export const ProseRenderer = withJsonFormsControlProps(ProseRendererComponent)
