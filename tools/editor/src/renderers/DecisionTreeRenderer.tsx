import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, FormHelperText, Typography } from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

export const decisionTreeTester = rankWith(10, scopeEndIs('decision_tree'))

function DecisionTreeRendererComponent({ data, handleChange, path, label, schema }: ControlProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <AccountTreeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
          {label || schema?.title || 'Decision Tree'}
        </Typography>
      </Box>
      <Box
        component="textarea"
        value={data ?? ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(path, e.target.value)}
        placeholder={`IF no [evidence] THEN score 0-1.\nIF [partial evidence] THEN score 2.\nIF [complete evidence] THEN score 3-4.`}
        sx={{
          width: '100%',
          minHeight: 150,
          p: 1.5,
          fontFamily: 'Consolas, "Courier New", monospace',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          bgcolor: '#1e1e2e',
          color: '#cdd6f4',
          border: '1px solid #45475a',
          borderRadius: 1,
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          display: 'block',
          '&:focus': { borderColor: '#89b4fa' },
        }}
      />
      <FormHelperText>
        {schema?.description ??
          'IF/THEN logic for evaluators and AI agents. Count observable features then branch on presence.'}
      </FormHelperText>
    </Box>
  )
}

export const DecisionTreeRenderer = withJsonFormsControlProps(DecisionTreeRendererComponent)
