import { Box, Typography, Card, CardContent, useTheme } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { sapphire } from '../theme'

export default function DemoPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 2,
          }}
        >
          Interactive Demos
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Interactive browser demos are coming soon. In the meantime, install the CLI to explore the full editor experience.
        </Typography>

        <Card sx={{ bgcolor: isDark ? sapphire.gray[800] : '#ffffff' }}>
          <CardContent sx={{ py: 8 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: isDark ? 'hsl(218 92% 49% / 0.12)' : sapphire.blue[50],
                color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 500,
                color: isDark ? '#ffffff' : sapphire.blue[900],
                mb: 1,
                fontSize: '1.1rem',
              }}
            >
              Install the CLI
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                maxWidth: 400,
                mx: 'auto',
                mb: 2,
              }}
            >
              The EAROS CLI includes a local editor with artifact editing, rubric browsing, and assessment workflows.
            </Typography>
            <Typography
              variant="body2"
              component="code"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                borderRadius: '8px',
                bgcolor: isDark ? sapphire.gray[900] : sapphire.gray[50],
                color: isDark ? sapphire.gray[300] : sapphire.gray[700],
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}
            >
              npm install -g @trohde/earos
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
