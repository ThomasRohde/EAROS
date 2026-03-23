import { Box, Typography, Link as MuiLink, useTheme } from '@mui/material'
import { sapphire } from '../theme'

export default function Footer() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 3,
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: sapphire.gray[500],
          mb: 0.5,
        }}
      >
        Enterprise Architecture Rubric Operational Standard v2.0
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: isDark ? sapphire.gray[600] : sapphire.gray[400],
        }}
      >
        Licensed under{' '}
        <MuiLink
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'inherit', textDecoration: 'underline' }}
        >
          CC BY 4.0
        </MuiLink>
        {' | '}
        <MuiLink
          href="https://github.com/ThomasRohde/EAROS"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'inherit', textDecoration: 'underline' }}
        >
          GitHub
        </MuiLink>
      </Typography>
    </Box>
  )
}
