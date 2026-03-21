import { useEffect, useRef, useState, useCallback } from 'react'
import { rankWith, scopeEndIs } from '@jsonforms/core'
import { withJsonFormsControlProps } from '@jsonforms/react'
import type { ControlProps } from '@jsonforms/core'
import { Box, Button, Dialog, FormHelperText, IconButton, Tooltip, Typography } from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FitScreenIcon from '@mui/icons-material/FitScreen'
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
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
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

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }
  const openFullscreen = () => { setZoom(1.5); setPan({ x: 0, y: 0 }); setFullscreen(true) }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.1, Math.min(20, z * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  const handleMouseUp = () => setDragging(false)

  const showCode = viewMode === 'split' || viewMode === 'code'
  const showPreview = viewMode === 'split' || viewMode === 'preview'

  const previewContent = renderError ? (
    <Typography variant="caption" color="error" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {renderError}
    </Typography>
  ) : svg ? (
    <Box
      dangerouslySetInnerHTML={{ __html: svg }}
      onClick={openFullscreen}
      sx={{ maxWidth: '100%', cursor: 'zoom-in', '& svg': { maxWidth: '100%', height: 'auto' } }}
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
            <IconButton size="small" onClick={openFullscreen} title="Fullscreen preview" sx={{ ml: 0.5 }}>
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
            {previewContent}
          </Box>
        )}
      </Box>
      <FormHelperText>
        {schema?.description ?? 'Mermaid diagram syntax. Click the preview or fullscreen icon to enlarge.'}
      </FormHelperText>

      {/* True fullscreen dialog with pan/zoom */}
      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: 'background.default', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Toolbar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}>
          <Typography variant="subtitle2" color="text.secondary">
            {label || schema?.title || 'Diagram Preview'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={() => setZoom(z => Math.max(0.1, z * 0.8))} color="inherit">
              <ZoomOutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{
            color: 'text.secondary',
            minWidth: 50,
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
          }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={() => setZoom(z => Math.min(20, z * 1.25))} color="inherit">
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to screen (double-click canvas to reset)">
            <IconButton size="small" onClick={resetView} color="inherit">
              <FitScreenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={() => setFullscreen(false)} color="inherit" sx={{ ml: 1 }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Pan/zoom canvas */}
        <Box
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={resetView}
          sx={{
            flex: 1,
            cursor: dragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            bgcolor: 'background.default',
          }}
        >
          {svg ? (
            <Box
              dangerouslySetInnerHTML={{ __html: svg }}
              sx={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: dragging ? 'none' : 'transform 0.1s',
                '& svg': { display: 'block', maxWidth: 'none', height: 'auto' },
              }}
            />
          ) : (
            <Typography color="text.disabled">No diagram to display</Typography>
          )}
        </Box>
      </Dialog>
    </Box>
  )
}

export const MermaidRenderer = withJsonFormsControlProps(MermaidRendererComponent)
