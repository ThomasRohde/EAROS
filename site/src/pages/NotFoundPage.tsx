import { Link } from 'react-router-dom'
import { Box, Typography, Button, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { sapphire } from '../theme'

export default function NotFoundPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ py: { xs: 12, md: 20 }, px: 3, textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '4rem', md: '6rem' },
          fontWeight: 800,
          color: isDark ? sapphire.blue[400] : sapphire.blue[500],
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          color: isDark ? '#ffffff' : sapphire.blue[900],
          fontWeight: 600,
        }}
      >
        Page not found
      </Typography>
      <Typography
        sx={{
          mb: 4,
          color: isDark ? sapphire.gray[400] : sapphire.gray[600],
          maxWidth: 400,
          mx: 'auto',
        }}
      >
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="outlined"
        startIcon={<ArrowBackIcon />}
      >
        Back to Home
      </Button>
    </Box>
  )
}
