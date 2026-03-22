import { useParams, Link } from 'react-router-dom'
import { Box, Typography, Button, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { onboardingGuides, getOnboardingBySlug } from '../content/onboarding'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MaturityBadge from '../components/MaturityBadge'
import MaturityAssessment from '../components/MaturityAssessment'
import { sapphire } from '../theme'

function getSidebarDotColor(level: number, isDark: boolean) {
  switch (level) {
    case 0:
      return isDark ? sapphire.gray[400] : sapphire.gray[500]
    case 2:
      return isDark ? sapphire.green[400] : sapphire.green[500]
    case 3:
      return isDark ? sapphire.blue[400] : sapphire.blue[500]
    case 4:
      return isDark ? sapphire.yellow[300] : sapphire.yellow[500]
    case 5:
      return isDark ? sapphire.gold[3] : sapphire.gold[3]
    default:
      return isDark ? sapphire.gray[400] : sapphire.gray[500]
  }
}

export default function OnboardingViewPage() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const guide = slug ? getOnboardingBySlug(slug) : undefined

  const currentIndex = onboardingGuides.findIndex((g) => g.slug === slug)
  const prevGuide = currentIndex > 0 ? onboardingGuides[currentIndex - 1] : undefined
  const nextGuide = currentIndex < onboardingGuides.length - 1 ? onboardingGuides[currentIndex + 1] : undefined

  if (!guide) {
    return (
      <Box sx={{ py: { xs: 8, md: 12 }, px: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#ffffff' : sapphire.blue[900] }}>
          Guide not found
        </Typography>
        <Button component={Link} to="/onboarding" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Onboarding
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: 3 }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: 'auto',
          display: 'flex',
          gap: 4,
        }}
      >
        {/* Sidebar nav */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 200,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
          }}
        >
          <Button
            component={Link}
            to="/onboarding"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              mb: 2,
              color: isDark ? sapphire.gray[400] : sapphire.gray[600],
              fontSize: '0.8rem',
              justifyContent: 'flex-start',
              px: 1,
            }}
          >
            All guides
          </Button>
          {onboardingGuides.map((g) => (
            <Button
              key={g.slug}
              component={Link}
              to={`/onboarding/${g.slug}`}
              size="small"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textAlign: 'left',
                width: '100%',
                px: 1,
                py: 0.5,
                fontSize: '0.85rem',
                fontWeight: g.slug === slug ? 600 : 400,
                color:
                  g.slug === slug
                    ? isDark
                      ? sapphire.blue[400]
                      : sapphire.blue[500]
                    : isDark
                      ? sapphire.gray[300]
                      : sapphire.gray[600],
                borderRadius: 1,
                bgcolor:
                  g.slug === slug
                    ? isDark
                      ? 'hsla(218, 92%, 49%, 0.08)'
                      : sapphire.blue[50]
                    : 'transparent',
                '&:hover': {
                  bgcolor: isDark ? 'hsla(218, 92%, 49%, 0.06)' : 'hsla(218, 92%, 49%, 0.04)',
                },
                justifyContent: 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getSidebarDotColor(g.maturityLevel, isDark),
                  flexShrink: 0,
                }}
              />
              {g.title}
            </Button>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Mobile back link */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <Button
              component={Link}
              to="/onboarding"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}
            >
              All guides
            </Button>
          </Box>

          {/* Maturity badge */}
          <Box sx={{ mb: 3 }}>
            <MaturityBadge
              maturityLevel={guide.maturityLevel}
              maturityTransition={guide.maturityTransition}
              maturityLabel={guide.maturityLabel}
            />
          </Box>

          {/* Markdown content — for overview, inject assessment between sections */}
          {slug === 'overview' ? (() => {
            const marker = '## How to Use This Guide'
            const idx = guide.content.indexOf(marker)
            const before = idx >= 0 ? guide.content.slice(0, idx) : guide.content
            const after = idx >= 0 ? guide.content.slice(idx) : ''
            return (
              <>
                <MarkdownRenderer content={before} />
                <MaturityAssessment />
                {after && <MarkdownRenderer content={after} />}
              </>
            )
          })() : (
            <MarkdownRenderer content={guide.content} />
          )}

          {/* Prev / Next navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 6,
              pt: 3,
              borderTop: `1px solid ${isDark ? 'hsla(212, 33%, 27%, 0.6)' : 'hsla(212, 63%, 12%, 0.08)'}`,
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              {prevGuide && (
                <Button
                  component={Link}
                  to={`/onboarding/${prevGuide.slug}`}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {prevGuide.title}
                </Button>
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {nextGuide && (
                <Button
                  component={Link}
                  to={`/onboarding/${nextGuide.slug}`}
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {nextGuide.title}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
