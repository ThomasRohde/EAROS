import { createTheme } from '@mui/material/styles'

const commonTypography = {
  fontFamily: '"Outfit", "Inter", sans-serif',
  h4: { fontWeight: 700, letterSpacing: '-0.5px' },
  h5: { fontWeight: 700, letterSpacing: '-0.5px' },
  h6: { fontWeight: 600, letterSpacing: '-0.3px' },
  subtitle1: { fontWeight: 600 },
}

const glassComponents = (mode: 'light' | 'dark') => ({
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 16,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease',
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        background: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: 12,
        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none' as const,
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(6, 249, 249, 0.3)' : '0 4px 12px rgba(2, 132, 199, 0.2)',
        }
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        background: mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        color: mode === 'dark' ? '#f8fafc' : '#0f172a',
        fontSize: '0.8rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: 6,
      }
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#020617', paper: '#0f172a' },
    primary: { main: '#06f9f9', contrastText: '#020617' }, // Glowing Cyan
    secondary: { main: '#8b5cf6', contrastText: '#ffffff' }, // Purple
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: commonTypography,
  components: glassComponents('dark'),
})

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#f8fafc', paper: '#ffffff' },
    primary: { main: '#0284c7', contrastText: '#ffffff' }, // Vivid Blue
    secondary: { main: '#6366f1', contrastText: '#ffffff' }, // Indigo
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    text: { primary: '#0f172a', secondary: '#475569' },
  },
  typography: commonTypography,
  components: glassComponents('light'),
})
