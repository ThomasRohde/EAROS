import { Box, Card, CardContent, Typography, useTheme } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SecurityIcon from '@mui/icons-material/Security'
import FindInPageIcon from '@mui/icons-material/FindInPage'
import LayersIcon from '@mui/icons-material/Layers'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import TuneIcon from '@mui/icons-material/Tune'
import { sapphire } from '../theme'

const accentColors = (isDark: boolean) => ({
  primary: isDark ? sapphire.blue[400] : sapphire.blue[500],
  success: isDark ? sapphire.green[400] : sapphire.green[500],
  secondary: isDark ? sapphire.gold[3] : sapphire.gold[2],
})

const subtleBg = (isDark: boolean) => ({
  primary: isDark ? 'hsl(218 92% 49% / 0.12)' : sapphire.blue[50],
  success: isDark ? 'hsl(125 50% 35% / 0.12)' : sapphire.green[50],
  secondary: isDark ? 'hsl(32 47% 48% / 0.12)' : 'hsl(45 57% 73% / 0.18)',
})

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  colorKey: 'primary' | 'success' | 'secondary'
}

const FEATURES: Feature[] = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 26 }} />,
    title: 'Machine-Readable Rubrics',
    description: 'Criteria, scoring guides, and gates defined in YAML. One source of truth for human and AI reviewers.',
    colorKey: 'primary',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 26 }} />,
    title: 'Gate-Based Status Model',
    description: 'Critical criteria block passing regardless of average score. Bad scores cannot hide behind weighted means.',
    colorKey: 'primary',
  },
  {
    icon: <FindInPageIcon sx={{ fontSize: 26 }} />,
    title: 'Evidence-Anchored Scoring',
    description: 'Every score requires a cited excerpt or reference. RULERS protocol prevents impression-based scoring.',
    colorKey: 'success',
  },
  {
    icon: <LayersIcon sx={{ fontSize: 26 }} />,
    title: 'Three-Layer Model',
    description: 'Core universal criteria, artifact-type profiles, and cross-cutting overlays. Governed but extensible.',
    colorKey: 'success',
  },
  {
    icon: <SmartToyIcon sx={{ fontSize: 26 }} />,
    title: '10 AI Agent Skills',
    description: 'Assess, create, calibrate, remediate, and more. Works with Claude Code, Cursor, and other AI tools.',
    colorKey: 'secondary',
  },
  {
    icon: <TuneIcon sx={{ fontSize: 26 }} />,
    title: 'Calibration Framework',
    description: 'Inter-rater reliability targets (Cohen\u2019s \u03BA), calibration exercises, and Wasserstein-based drift detection.',
    colorKey: 'secondary',
  },
]

export default function FeaturesSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accents = accentColors(isDark)
  const bgs = subtleBg(isDark)

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
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
          Features
        </Typography>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 6,
          }}
        >
          Architecture review, codified
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {FEATURES.map((feature) => {
            const accent = accents[feature.colorKey]
            const iconBg = bgs[feature.colorKey]
            return (
              <Card
                key={feature.title}
                sx={{
                  bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
                  '&:hover': {
                    borderColor: isDark
                      ? `color-mix(in srgb, ${accent} 40%, transparent)`
                      : `color-mix(in srgb, ${accent} 24%, transparent)`,
                    boxShadow: isDark
                      ? 'none'
                      : '0px 0px 0px 1px hsl(212 63% 12% / 0.06) inset, 0px 8px 32px 0px hsl(212 63% 12% / 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: iconBg,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: accent,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: isDark ? '#ffffff' : sapphire.blue[900],
                      mb: 1,
                      fontSize: '1rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
