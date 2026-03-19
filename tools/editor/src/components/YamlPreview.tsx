import { useMemo } from 'react'
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { toYaml } from '../utils/yaml'

interface Props {
  data: unknown
}

export default function YamlPreview({ data }: Props) {
  const yamlText = useMemo(() => {
    try {
      return toYaml(data)
    } catch (e) {
      return `# Error generating YAML\n# ${(e as Error).message}`
    }
  }, [data])

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlText).catch(() => {})
  }

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
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', flexGrow: 1 }}>
          YAML Preview
        </Typography>
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={handleCopy}>
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
          bgcolor: '#1e1e2e',
          color: '#cdd6f4',
        }}
      >
        {yamlText}
      </Box>
    </Paper>
  )
}
