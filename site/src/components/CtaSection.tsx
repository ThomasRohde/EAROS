import { Box, Typography, Button, useTheme } from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { sapphire } from '../theme'

export default function CtaSection() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: 3,
        bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 400,
            color: isDark ? '#ffffff' : sapphire.blue[900],
            mb: 2,
          }}
        >
          Ready to standardize your architecture reviews?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            mb: 4,
          }}
        >
          Install the CLI to get the editor, all 10 agent skills, and the full rubric framework.
        </Typography>

        {/* Install command */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isDark ? sapphire.gray[900] : sapphire.gray[50],
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            mb: 4,
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: '0.9rem',
            color: isDark ? sapphire.blue[400] : sapphire.blue[600],
          }}
        >
          <TerminalIcon sx={{ fontSize: 18, opacity: 0.6 }} />
          npm install -g @trohde/earos
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component="a"
            href="https://github.com/ThomasRohde/EAROS/blob/master/standard/EAROS.md"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<MenuBookIcon />}
            sx={{ px: 3 }}
          >
            Read the Standard
          </Button>
          <Button
            component="a"
            href="https://github.com/ThomasRohde/EAROS/blob/master/docs/getting-started.md"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<MenuBookIcon />}
            sx={{ px: 3 }}
          >
            Getting Started
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
