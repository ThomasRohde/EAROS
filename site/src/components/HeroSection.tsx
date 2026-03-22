import { Box, Typography, Button, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GitHubIcon from '@mui/icons-material/GitHub'
import { sapphire } from '../theme'
import TerminalDemo from './TerminalDemo'

const HERO_LINES = [
  { type: 'input' as const, value: 'npm install -g @trohde/earos' },
  { type: 'progress' as const },
  { value: 'added 147 packages in 8s' },
  { type: 'input' as const, value: 'earos --help' },
  { value: 'earos \u2014 EAROS editor and CLI' },
  { value: '' },
  { value: 'Usage:' },
  { value: '  earos                             Open the editor' },
  { value: '  earos init [dir] [--icons]        Scaffold a workspace' },
  { value: '  earos validate <file.yaml>        Validate a rubric or evaluation' },
  { value: '  earos export <file.yaml>          Export artifact as Word (.docx)' },
  { value: '  earos manifest                    Regenerate manifest' },
  { value: '  earos manifest check              Verify manifest integrity' },
  { type: 'input' as const, value: 'earos init my-project --icons' },
  { value: '\u2713 EAROS workspace initialized at: ./my-project' },
  { value: '  core/              Core meta-rubric (universal foundation)' },
  { value: '  profiles/          Artifact-specific profiles (5 included)' },
  { value: '  overlays/          Cross-cutting overlays (3 included)' },
  { value: '  .agents/skills/    All 10 EAROS skills for any AI agent' },
  { value: '  AGENTS.md          Project guide for AI agents' },
  { value: 'Downloading AWS architecture icons...' },
  { type: 'progress' as const },
  { value: 'Downloading Azure architecture icons...' },
  { type: 'progress' as const },
  { value: '\u2713 Icons downloaded to ./my-project/icons/' },
  { type: 'input' as const, value: 'earos validate core/core-meta-rubric.yaml' },
  { value: '\u2713 core/core-meta-rubric.yaml is valid (kind: core_rubric)' },
  { type: 'input' as const, value: 'earos' },
  { value: 'EAROS Editor \u2192 http://localhost:3000' },
]

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

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
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

        <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'left' }}>
          <TerminalDemo
            title="terminal"
            lines={HERO_LINES}
            height={420}
            startDelay={800}
            lineDelay={800}
          />
        </Box>
      </Box>
    </Box>
  )
}
