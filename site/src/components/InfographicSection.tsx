import { Box, Typography, useTheme } from '@mui/material'
import { sapphire } from '../theme'

export default function InfographicSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: 3,
        bgcolor: isDark ? sapphire.gray[900] : sapphire.sand[50],
      }}
    >
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
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
          The Big Picture
        </Typography>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 1.5,
          }}
        >
          How EaROS works, end to end
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 5,
            maxWidth: 560,
            mx: 'auto',
          }}
        >
          From YAML rubrics to actionable assessments — the three-layer model, eight-step evaluation pipeline, and ecosystem at a glance.
        </Typography>

        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isDark
              ? 'hsla(212, 33%, 27%, 0.6)'
              : 'hsla(212, 63%, 12%, 0.08)',
            boxShadow: isDark
              ? 'none'
              : '0px 4px 32px 0px hsl(212 63% 12% / 0.06)',
          }}
        >
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}screenshots/EaROS.webp`}
            alt="EaROS infographic — the three-layer rubric model, eight-step evaluation pipeline, 0–4 scoring scale, and ecosystem icons for YAML, Markdown, GitHub, AI Agents, and CLI tooling"
            loading="lazy"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
