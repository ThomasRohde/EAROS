import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { sapphire } from '../theme'
import { ThemeModeContext, ThemeMode } from '../ThemeContext'

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <LightModeIcon fontSize="small" />,
  dark: <DarkModeIcon fontSize="small" />,
  system: <SettingsBrightnessIcon fontSize="small" />,
}

const themeLabels: Record<ThemeMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
}

const themeCycle: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Docs', to: '/docs' },
]

export default function Navbar() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const location = useLocation()
  const { mode, setMode } = useContext(ThemeModeContext)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: isDark
          ? 'hsla(211, 64%, 13%, 0.85)'
          : 'hsla(60, 9%, 96%, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Wordmark */}
        <Typography
          component={Link}
          to="/"
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            color: isDark ? '#ffffff' : sapphire.blue[900],
            textDecoration: 'none',
            mr: 4,
            letterSpacing: '-0.01em',
          }}
        >
          Ea<span style={{ color: isDark ? sapphire.blue[400] : sapphire.blue[500] }}>ROS</span>
        </Typography>

        {/* Nav links */}
        <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to))
            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                size="small"
                sx={{
                  color: isActive
                    ? (isDark ? sapphire.blue[400] : sapphire.blue[500])
                    : (isDark ? sapphire.gray[300] : sapphire.gray[600]),
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  minWidth: 'auto',
                  px: 1.5,
                }}
              >
                {link.label}
              </Button>
            )
          })}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={themeLabels[mode]}>
            <IconButton
              size="small"
              onClick={() => setMode(themeCycle[mode])}
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[500] }}
            >
              {themeIcons[mode]}
            </IconButton>
          </Tooltip>
          <Tooltip title="View on GitHub">
            <IconButton
              size="small"
              component="a"
              href="https://github.com/ThomasRohde/EAROS"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[500] }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
