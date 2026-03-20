import { useEffect, useRef, useState, useCallback } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Button, FormHelperText, Typography } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import mermaid from 'mermaid'

let mermaidInitialized = false

function ensureMermaidInit() {
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    mermaidInitialized = true
  }
}

export const mermaidTester = rankWith(10, scopeEndIs('diagram_source'))

function MermaidRendererComponent({ data, handleChange, path, label, schema }: ControlProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [svg, setSvg] = useState<string>('')
  const [renderError, setRenderError] = useState<string>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`)

  useEffect(() => {
    ensureMermaidInit()
  }, [])

  const renderMermaid = useCallback(async (code: string) => {
    if (!code?.trim()) {
      setSvg('')
      setRenderError('')
      return
    }
    try {
      const { svg: rendered } = await mermaid.render(idRef.current, code)
      setSvg(rendered)
      setRenderError('')
    } catch (err) {
      setRenderError((err as Error).message ?? 'Render error')
      setSvg('')
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => renderMermaid(data ?? ''), 600)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, renderMermaid])

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
          {label || schema?.title || 'Diagram (Mermaid)'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={showPreview ? <VisibilityOffIcon sx={{ fontSize: 14 }} /> : <VisibilityIcon sx={{ fontSize: 14 }} />}
          onClick={() => setShowPreview((v) => !v)}
          sx={{ ml: 'auto', fontSize: '0.7rem', py: 0.25, px: 1, textTransform: 'none', borderColor: 'divider' }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box
          component="textarea"
          value={data ?? ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(path, e.target.value)}
          placeholder="Paste Mermaid diagram code here (e.g., graph TD; A-->B)"
          sx={{
            flex: 1,
            minHeight: 300,
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
        {showPreview && (
          <Box
            sx={{
              flex: 1,
              minHeight: 300,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              bgcolor: 'background.paper',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderError ? (
              <Typography variant="caption" color="error" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {renderError}
              </Typography>
            ) : svg ? (
              <Box dangerouslySetInnerHTML={{ __html: svg }} sx={{ maxWidth: '100%', '& svg': { maxWidth: '100%' } }} />
            ) : (
              <Typography variant="caption" color="text.disabled">
                Preview will appear here
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <FormHelperText>
        {schema?.description ?? 'Mermaid diagram syntax. Supports flowchart, sequence, C4, and more.'}
      </FormHelperText>
    </Box>
  )
}

export const MermaidRenderer = withJsonFormsControlProps(MermaidRendererComponent)
