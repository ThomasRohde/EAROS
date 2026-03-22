import { Box, Typography, Button, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GitHubIcon from '@mui/icons-material/GitHub'
import { sapphire } from '../theme'

export default function HeroSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        px: 3,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(218 92% 49% / 0.08) 0%, transparent 70%)`
            : `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(218 92% 49% / 0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 300,
            fontSize: { xs: '3rem', md: '4.5rem' },
            color: isDark ? '#ffffff' : sapphire.blue[900],
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Ea<span style={{ fontWeight: 500, color: isDark ? sapphire.blue[400] : sapphire.blue[500] }}>ROS</span>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            color: isDark ? sapphire.gray[300] : sapphire.gray[600],
            mb: 1.5,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
          }}
        >
          Enterprise Architecture Rubric Operational Standard
        </Typography>

        <Typography
          sx={{
            fontStyle: 'italic',
            color: isDark ? sapphire.gray[500] : sapphire.gray[500],
            mb: 5,
            fontSize: '1rem',
          }}
        >
          Making architecture review irresistible
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/docs"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.25 }}
          >
            Get Started
          </Button>
          <Button
            component="a"
            href="https://github.com/ThomasRohde/EAROS"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="large"
            startIcon={<GitHubIcon />}
            sx={{ px: 4, py: 1.25 }}
          >
            View on GitHub
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
