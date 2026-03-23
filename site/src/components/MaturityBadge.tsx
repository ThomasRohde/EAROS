import { Box, Typography, useTheme } from '@mui/material'
import { getLevelColors } from '../utils/maturityColors'

interface MaturityBadgeProps {
  maturityLevel: number
  maturityTransition: string
  maturityLabel: string
}

export default function MaturityBadge({ maturityLevel, maturityTransition, maturityLabel }: MaturityBadgeProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colors = getLevelColors(maturityLevel, isDark)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: '8px',
        bgcolor: colors.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Level circle */}
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: colors.dot,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            lineHeight: 1,
            color: '#ffffff',
          }}
        >
          {maturityLevel === 0 ? '\u2014' : maturityLevel}
        </Typography>
      </Box>

      {/* Combined label */}
      <Typography
        sx={{
          fontSize: '0.82rem',
          color: colors.text,
          fontWeight: 600,
        }}
      >
        {maturityTransition}
        <Box
          component="span"
          sx={{
            mx: 0.75,
            color: isDark ? 'hsla(212, 33%, 77%, 0.4)' : 'hsla(212, 63%, 12%, 0.2)',
          }}
        >
          /
        </Box>
        {maturityLabel}
      </Typography>
    </Box>
  )
}
