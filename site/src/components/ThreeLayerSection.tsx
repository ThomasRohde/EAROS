import { Box, Typography, useTheme } from '@mui/material'
import { sapphire } from '../theme'

interface LayerDef {
  label: string
  sublabel: string
  color: string
  bg: string
  darkBg: string
}

const LAYERS: LayerDef[] = [
  {
    label: 'Overlays',
    sublabel: 'Security, data governance, regulatory',
    color: sapphire.gold[2],
    bg: 'hsl(45 57% 73% / 0.18)',
    darkBg: 'hsl(32 47% 48% / 0.15)',
  },
  {
    label: 'Profiles',
    sublabel: 'Solution architecture, reference architecture, ADR, capability map, roadmap',
    color: sapphire.blue[500],
    bg: sapphire.blue[50],
    darkBg: 'hsl(218 92% 49% / 0.12)',
  },
  {
    label: 'Core',
    sublabel: '9 dimensions, 10 criteria, 0-4 ordinal scale, gate model',
    color: sapphire.green[500],
    bg: sapphire.green[50],
    darkBg: 'hsl(125 50% 35% / 0.12)',
  },
]

export default function ThreeLayerSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: 3,
        bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: isDark ? sapphire.gray[400] : sapphire.gray[500],
            mb: 2,
          }}
        >
          Architecture
        </Typography>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 2,
          }}
        >
          The three-layer model
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          One global rubric is too generic. Fully bespoke rubrics are ungovernable. This layered model is the balance.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LAYERS.map((layer) => (
            <Box
              key={layer.label}
              sx={{
                bgcolor: isDark ? layer.darkBg : layer.bg,
                border: '1px solid',
                borderColor: isDark
                  ? `color-mix(in srgb, ${layer.color} 25%, transparent)`
                  : `color-mix(in srgb, ${layer.color} 20%, transparent)`,
                borderRadius: 2,
                px: 4,
                py: 3,
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 0.5, sm: 3 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: isDark
                    ? `color-mix(in srgb, ${layer.color} 100%, white)`
                    : layer.color,
                  fontSize: '1rem',
                  minWidth: 100,
                  flexShrink: 0,
                }}
              >
                {layer.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? sapphire.gray[300] : sapphire.gray[700],
                }}
              >
                {layer.sublabel}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
