import { useEffect, useRef, useState, useCallback } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Button, Dialog, DialogContent, FormHelperText, IconButton, Typography } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'
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
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split')
  const [fullscreen, setFullscreen] = useState(false)
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

  const showCode = viewMode === 'split' || viewMode === 'code'
  const showPreview = viewMode === 'split' || viewMode === 'preview'

  const previewContent = renderError ? (
    <Typography variant="caption" color="error" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {renderError}
    </Typography>
  ) : svg ? (
    <Box
      dangerouslySetInnerHTML={{ __html: svg }}
      onClick={() => svg && setFullscreen(true)}
      sx={{ maxWidth: '100%', cursor: svg ? 'zoom-in' : 'default', '& svg': { maxWidth: '100%', height: 'auto' } }}
    />
  ) : (
    <Typography variant="caption" color="text.disabled">
      Preview will appear here
    </Typography>
  )

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
          {label || schema?.title || 'Diagram (Mermaid)'}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
          {(['code', 'split', 'preview'] as const).map((mode) => (
            <Button
              key={mode}
              size="small"
              variant={viewMode === mode ? 'contained' : 'outlined'}
              onClick={() => setViewMode(mode)}
              sx={{ fontSize: '0.65rem', py: 0.15, px: 0.75, textTransform: 'none', minWidth: 0, borderColor: 'divider' }}
            >
              {mode === 'code' ? 'Code' : mode === 'split' ? 'Split' : 'Preview'}
            </Button>
          ))}
          {svg && (
            <IconButton size="small" onClick={() => setFullscreen(true)} title="Fullscreen preview" sx={{ ml: 0.5 }}>
              <FullscreenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {showCode && (
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
        )}
        {showPreview && (
          <Box
            sx={{
              flex: viewMode === 'preview' ? 1 : 1,
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
            {previewContent}
          </Box>
        )}
      </Box>
      <FormHelperText>
        {schema?.description ?? 'Mermaid diagram syntax. Click the preview or fullscreen icon to enlarge.'}
      </FormHelperText>

      {/* Fullscreen dialog */}
      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} maxWidth={false} fullWidth
        PaperProps={{ sx: { maxWidth: '95vw', maxHeight: '95vh', m: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {label || schema?.title || 'Diagram Preview'}
          </Typography>
          <IconButton onClick={() => setFullscreen(false)} size="small"><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, overflow: 'auto' }}>
          {svg ? (
            <Box dangerouslySetInnerHTML={{ __html: svg }}
              sx={{ '& svg': { maxWidth: '100%', height: 'auto', minWidth: '600px' } }} />
          ) : (
            <Typography color="text.disabled">No diagram to display</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export const MermaidRenderer = withJsonFormsControlProps(MermaidRendererComponent)
