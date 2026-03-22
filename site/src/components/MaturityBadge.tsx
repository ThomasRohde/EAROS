import { Box, Typography, useTheme } from '@mui/material'
import { sapphire } from '../theme'

interface MaturityBadgeProps {
  maturityLevel: number
  maturityTransition: string
  maturityLabel: string
}

function getLevelColors(level: number, isDark: boolean) {
  switch (level) {
    case 0:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        text: isDark ? sapphire.gray[300] : sapphire.gray[700],
        dot: isDark ? sapphire.gray[400] : sapphire.gray[500],
      }
    case 2:
      return {
        bg: isDark ? 'hsl(122 39% 49% / 0.08)' : sapphire.green[50],
        text: isDark ? sapphire.green[100] : sapphire.green[700],
        dot: isDark ? sapphire.green[400] : sapphire.green[500],
      }
    case 3:
      return {
        bg: isDark ? 'hsl(216 100% 63% / 0.08)' : sapphire.blue[50],
        text: isDark ? sapphire.blue[100] : sapphire.blue[700],
        dot: isDark ? sapphire.blue[400] : sapphire.blue[500],
      }
    case 4:
      return {
        bg: isDark ? 'hsl(46 97% 65% / 0.08)' : sapphire.yellow[50],
        text: isDark ? sapphire.yellow[100] : sapphire.yellow[700],
        dot: isDark ? sapphire.yellow[300] : sapphire.yellow[500],
      }
    case 5:
      return {
        bg: isDark ? 'hsl(40 57% 62% / 0.08)' : 'hsl(40 57% 62% / 0.1)',
        text: isDark ? sapphire.gold[3] : sapphire.gold[1],
        dot: isDark ? sapphire.gold[3] : sapphire.gold[3],
      }
    default:
      return {
        bg: isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50],
        text: isDark ? sapphire.gray[300] : sapphire.gray[700],
        dot: isDark ? sapphire.gray[400] : sapphire.gray[500],
      }
  }
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
        gap: 1.5,
        px: 1.5,
        py: 0.5,
        borderRadius: '6px',
        bgcolor: colors.bg,
      }}
    >
      {/* Level dot */}
      <Box
        sx={{
          width: 20,
          height: 20,
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
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1,
            color: '#ffffff',
          }}
        >
          {maturityLevel === 0 ? '\u2014' : maturityLevel}
        </Typography>
      </Box>

      {/* Transition text */}
      <Typography
        sx={{
          fontSize: '0.78rem',
          color: isDark ? sapphire.gray[400] : sapphire.gray[600],
          fontWeight: 500,
        }}
      >
        {maturityTransition}
      </Typography>

      {/* Separator */}
      <Box
        sx={{
          width: 1,
          height: 14,
          bgcolor: isDark ? 'hsla(212, 33%, 27%, 0.6)' : 'hsla(212, 63%, 12%, 0.12)',
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <Typography
        sx={{
          fontSize: '0.78rem',
          color: colors.text,
          fontWeight: 600,
        }}
      >
        {maturityLabel}
      </Typography>
    </Box>
  )
}
