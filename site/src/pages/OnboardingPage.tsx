import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import GavelIcon from '@mui/icons-material/Gavel'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { sapphire } from '../theme'
import { onboardingGuides } from '../content/onboarding'

const ICONS: Record<string, React.ReactNode> = {
  'overview': <MapIcon sx={{ fontSize: 24 }} />,
  'first-assessment': <PlayArrowIcon sx={{ fontSize: 24 }} />,
  'governed-review': <GavelIcon sx={{ fontSize: 24 }} />,
  'agent-assisted': <SmartToyIcon sx={{ fontSize: 24 }} />,
  'scaling-optimization': <RocketLaunchIcon sx={{ fontSize: 24 }} />,
}

const MATURITY_STEPS = ['Ad Hoc', 'Rubric-Based', 'Governed', 'Hybrid', 'Optimized']

const STEP_COLORS = [
  { dot: sapphire.gray[500], dotDark: sapphire.gray[400] },
  { dot: sapphire.green[500], dotDark: sapphire.green[400] },
  { dot: sapphire.blue[500], dotDark: sapphire.blue[400] },
  { dot: sapphire.yellow[500], dotDark: sapphire.yellow[300] },
  { dot: sapphire.gold[3], dotDark: sapphire.gold[3] },
]

function getLevelColor(level: number, isDark: boolean) {
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

function getLevelBg(level: number, isDark: boolean) {
  switch (level) {
    case 0:
      return isDark ? 'hsl(211 19% 49% / 0.12)' : sapphire.gray[50]
    case 2:
      return isDark ? 'hsl(122 39% 49% / 0.12)' : sapphire.green[50]
    case 3:
      return isDark ? 'hsl(216 100% 63% / 0.12)' : sapphire.blue[50]
    case 4:
      return isDark ? 'hsl(46 97% 65% / 0.12)' : sapphire.yellow[50]
    case 5:
      return isDark ? 'hsl(40 57% 62% / 0.12)' : 'hsl(40 57% 62% / 0.1)'
    default:
      return isDark ? 'hsl(211 19% 49% / 0.12)' : sapphire.gray[50]
  }
}

export default function OnboardingPage() {
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
          Onboarding Guide
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 6,
            maxWidth: 560,
            mx: 'auto',
          }}
        >
          A staged adoption path from ad-hoc architecture review to optimized, evidence-driven governance.
        </Typography>

        {/* Maturity model stepper */}
        <Box sx={{ mb: 6 }}>
          <Stepper
            alternativeLabel
            activeStep={-1}
            sx={{
              '& .MuiStepConnector-line': {
                borderColor: isDark ? sapphire.gray[700] : sapphire.gray[200],
                borderTopWidth: 2,
              },
            }}
          >
            {MATURITY_STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: isDark ? STEP_COLORS[index].dotDark : STEP_COLORS[index].dot,
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                      mt: '8px !important',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Card list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {onboardingGuides.map((guide) => {
            const levelColor = getLevelColor(guide.maturityLevel, isDark)
            const levelBg = getLevelBg(guide.maturityLevel, isDark)

            return (
              <Card
                key={guide.slug}
                sx={{
                  bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
                  '&:hover': {
                    borderColor: isDark
                      ? 'hsla(216, 100%, 63%, 0.4)'
                      : 'hsla(218, 92%, 49%, 0.24)',
                    boxShadow: isDark
                      ? 'none'
                      : '0px 0px 0px 1px hsl(212 63% 12% / 0.06) inset, 0px 8px 32px 0px hsl(212 63% 12% / 0.08)',
                  },
                }}
              >
                <CardActionArea component={Link} to={`/onboarding/${guide.slug}`}>
                  <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: levelBg,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: levelColor,
                      }}
                    >
                      {ICONS[guide.slug]}
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
                        {guide.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                          lineHeight: 1.5,
                        }}
                      >
                        {guide.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
