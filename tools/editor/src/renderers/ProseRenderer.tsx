import { rankWith, schemaTypeIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps, UISchemaElement } from '@jsonforms/core'
import { TextField, Box } from '@mui/material'

const PROSE_FIELDS = [
  'narrative',
  'description',
  'purpose',
  'rationale',
  'summary',
  'context',
  'statement',
  'scope',
  'background',
  'justification',
  'consequences',
  'notes',
  'how_to_use',
  'decision_context',
]

const PLACEHOLDERS: Record<string, string> = {
  narrative: 'Describe the data flow step by step...',
  description: 'Explain what this means and why it matters...',
  purpose: 'What decision does this artifact support?',
  rationale: 'Explain why this option was chosen over alternatives...',
  summary: 'Provide a concise summary of the key points...',
  context: 'Describe the business and technical context...',
  statement: 'State the decision or scope in one declarative sentence...',
  background: 'What situation led to this decision or document?',
  justification: 'Why is this the right approach now?',
  consequences: 'List the positive and negative consequences...',
  notes: 'Additional notes, caveats, or open questions...',
  how_to_use: 'Guide readers through the document structure...',
  decision_context: 'Governance or programme context — review board, milestone, ...',
}

function getFieldName(scope: string): string {
  return scope.split('/').pop() ?? ''
}

function deriveMinRows(schema: any, uischemaOptions: any): number {
  if (typeof uischemaOptions?.rows === 'number') return uischemaOptions.rows
  const maxLength: number | undefined = schema?.maxLength
  if (typeof maxLength === 'number') {
    if (maxLength >= 2000) return 12
    if (maxLength >= 1000) return 10
    if (maxLength >= 500) return 8
  }
  return 6
}

// Accepts the renderer whenever:
//   - uischema sets options.multi === true (explicit opt-in wins), OR
//   - the field name is in the PROSE_FIELDS list, OR
//   - the data schema declares format: "prose" or format: "markdown", OR
//   - the data schema has maxLength >= 500 (implicit long-form).
// Rank 8 keeps us above the default string control (rank 3).
export const proseTester = rankWith(8, ((uischema: UISchemaElement, schema: any) => {
  if (!schema || schema.type !== 'string') return false
  const ui = uischema as any
  if (ui?.options?.multi === true) return true
  if (schema.format === 'prose' || schema.format === 'markdown') return true
  if (typeof schema.maxLength === 'number' && schema.maxLength >= 500) return true
  const scope: string | undefined = ui?.scope
  if (typeof scope === 'string') {
    const name = scope.split('/').pop() ?? ''
    if (PROSE_FIELDS.includes(name)) return true
  }
  return false
}) as any)

function ProseRendererComponent({ data, handleChange, path, label, schema, uischema }: ControlProps) {
  const scope = (uischema as any).scope ?? path
  const fieldName = getFieldName(scope)
  const placeholder = PLACEHOLDERS[fieldName] ?? `Enter ${fieldName}...`
  const minRows = deriveMinRows(schema, (uischema as any)?.options)
  const maxRows = Math.max(minRows + 4, 14)

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        multiline
        minRows={minRows}
        maxRows={maxRows}
        label={label || schema?.title || fieldName}
        value={data ?? ''}
        onChange={(e) => handleChange(path, e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        helperText={schema?.description}
      />
    </Box>
  )
}

export const ProseRenderer = withJsonFormsControlProps(ProseRendererComponent)
