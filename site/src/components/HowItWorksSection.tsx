import { Box, Typography, useTheme } from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import GradingIcon from '@mui/icons-material/Grading'
import VerifiedIcon from '@mui/icons-material/Verified'
import { sapphire } from '../theme'

interface Step {
  icon: React.ReactNode
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
    number: '1',
    title: 'Select your rubric',
    description: 'Pick the core meta-rubric, add the matching artifact-type profile, and layer on any applicable overlays.',
  },
  {
    icon: <GradingIcon sx={{ fontSize: 28 }} />,
    number: '2',
    title: 'Score against level descriptors',
    description: 'Rate each criterion 0-4 using precise scoring guides. Cite evidence for every score using the RULERS protocol.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 28 }} />,
    number: '3',
    title: 'Get an actionable assessment',
    description: 'Gates checked first, then weighted average. Clear status: Pass, Conditional Pass, Rework Required, Reject, or Not Reviewable.',
  },
]

export default function HowItWorksSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
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
          How It Works
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
          Three steps to consistent review
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {STEPS.map((step) => (
            <Box key={step.number} sx={{ textAlign: 'center' }}>
              {/* Number badge */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  bgcolor: isDark ? 'hsl(218 92% 49% / 0.12)' : sapphire.blue[50],
                  color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                }}
              >
                {step.icon}
              </Box>

              <Typography
                sx={{
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : sapphire.blue[900],
                  mb: 1,
                  fontSize: '1.05rem',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                  lineHeight: 1.6,
                  maxWidth: 300,
                  mx: 'auto',
                }}
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
