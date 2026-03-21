import { useEffect, useRef, useState } from 'react'
import { Paper, Typography, Box, IconButton, Tooltip, Chip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { toYaml } from '../utils/yaml'

interface Props {
  data: unknown
  open: boolean
  onToggle: () => void
  debounceMs?: number
}

export default function YamlPreview({ data, open, onToggle, debounceMs = 700 }: Props) {
  const [yamlText, setYamlText] = useState('')
  const [isUpdating, setIsUpdating] = useState(true)
  const hasRenderedRef = useRef(false)

  useEffect(() => {
    if (!open) return

    const delay = hasRenderedRef.current ? debounceMs : 0
    setIsUpdating(true)

    const timer = window.setTimeout(() => {
      try {
        setYamlText(toYaml(data))
      } catch (e) {
        setYamlText(`# Error generating YAML\n# ${(e as Error).message}`)
      }
      hasRenderedRef.current = true
      setIsUpdating(false)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [data, open, debounceMs])

  const handleCopy = () => {
    navigator.clipboard?.writeText(yamlText).catch(() => {})
  }

  if (!open) return null

  return (
    <Paper
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tooltip title="Collapse preview">
          <IconButton size="small" onClick={onToggle} sx={{ mr: 0.5 }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', flexGrow: 1 }}>
          YAML Preview
        </Typography>
        {isUpdating && (
          <Chip
            label="Updating preview..."
            size="small"
            sx={{ height: 20, mr: 0.5, fontSize: '0.68rem' }}
          />
        )}
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={handleCopy} disabled={!yamlText}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          flex: 1,
          overflow: 'auto',
          m: 0,
          p: 1.5,
          fontFamily: '"Roboto Mono", "Courier New", monospace',
          fontSize: '0.72rem',
          lineHeight: 1.6,
          whiteSpace: 'pre',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f9fa',
          color: (theme) => theme.palette.mode === 'dark' ? '#cdd6f4' : 'text.primary',
        }}
      >
        {yamlText || '# Generating preview…'}
      </Box>
    </Paper>
  )
}
