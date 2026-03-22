import { Box, Typography, Card, CardContent, CardActionArea, useTheme } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import DescriptionIcon from '@mui/icons-material/Description'
import AbcIcon from '@mui/icons-material/Abc'
import { sapphire } from '../theme'

interface DocLink {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

const DOCS: DocLink[] = [
  {
    icon: <SchoolIcon sx={{ fontSize: 24 }} />,
    title: 'Getting Started',
    description: 'Quick introduction to EaROS concepts and first steps for reviewers and architects.',
    href: 'https://github.com/ThomasRohde/EAROS/blob/master/docs/getting-started.md',
  },
  {
    icon: <MenuBookIcon sx={{ fontSize: 24 }} />,
    title: 'The Standard',
    description: 'The canonical EAROS v2 standard document. Complete reference for the scoring model, gates, and evaluation flow.',
    href: 'https://github.com/ThomasRohde/EAROS/blob/master/standard/EAROS.md',
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
    title: 'Profile Authoring Guide',
    description: 'How to create new artifact-type profiles. Design methods, calibration, and YAML structure.',
    href: 'https://github.com/ThomasRohde/EAROS/blob/master/docs/profile-authoring-guide.md',
  },
  {
    icon: <AbcIcon sx={{ fontSize: 24 }} />,
    title: 'Terminology',
    description: 'Glossary of all EAROS-specific, statistical, and architecture terms used across the framework.',
    href: 'https://github.com/ThomasRohde/EAROS/blob/master/docs/terminology.md',
  },
]

export default function DocsPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 2,
          }}
        >
          Documentation
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 6,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Learn about the EaROS framework, scoring model, and how to create your own rubrics.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DOCS.map((doc) => (
            <Card
              key={doc.title}
              sx={{
                bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
                '&:hover': {
                  borderColor: isDark
                    ? `color-mix(in srgb, ${sapphire.blue[400]} 40%, transparent)`
                    : `color-mix(in srgb, ${sapphire.blue[500]} 24%, transparent)`,
                  boxShadow: isDark
                    ? 'none'
                    : '0px 0px 0px 1px hsl(212 63% 12% / 0.06) inset, 0px 8px 32px 0px hsl(212 63% 12% / 0.08)',
                },
              }}
            >
              <CardActionArea
                component="a"
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: isDark ? 'hsl(218 92% 49% / 0.12)' : sapphire.blue[50],
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                    }}
                  >
                    {doc.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: isDark ? '#ffffff' : sapphire.blue[900],
                        mb: 0.5,
                        fontSize: '1rem',
                      }}
                    >
                      {doc.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                        lineHeight: 1.5,
                      }}
                    >
                      {doc.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
