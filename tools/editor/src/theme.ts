import { createTheme } from '@mui/material/styles'

/* ─── Sapphire Design Tokens (resolved) ─────────────────────────────────────── */

const sapphire = {
  blue: {
    950: 'hsl(210 100% 9%)',
    900: 'hsl(210 100% 14%)',
    800: 'hsl(211 100% 21%)',
    700: 'hsl(211 100% 28%)',
    600: 'hsl(212 100% 37%)',
    500: 'hsl(218 92% 49%)',
    400: 'hsl(216 100% 63%)',
    300: 'hsl(215 100% 74%)',
    200: 'hsl(214 100% 83%)',
    100: 'hsl(214 100% 90%)',
    50: 'hsl(219 100% 95%)',
  },
  gray: {
    900: 'hsl(211 64% 13%)',
    800: 'hsl(213 48% 17%)',
    700: 'hsl(212 33% 27%)',
    600: 'hsl(212 27% 35%)',
    500: 'hsl(211 19% 49%)',
    400: 'hsl(211 22% 63%)',
    300: 'hsl(211 22% 77%)',
    200: 'hsl(210 26% 85%)',
    100: 'hsl(208 29% 91%)',
    50: 'hsl(206 33% 96%)',
  },
  sand: {
    100: 'hsl(60 11% 91%)',
    50: 'hsl(60 9% 96%)',
  },
  green: {
    700: 'hsl(129 41% 23%)',
    600: 'hsl(127 47% 30%)',
    500: 'hsl(125 50% 35%)',
    400: 'hsl(122 39% 49%)',
    100: 'hsl(125 46% 84%)',
    50: 'hsl(129 33% 92%)',
  },
  red: {
    700: 'hsl(359 57% 36%)',
    500: 'hsl(0 65% 51%)',
    100: 'hsl(4 100% 92%)',
    50: 'hsl(0 82% 96%)',
  },
  yellow: {
    700: 'hsl(31 94% 33%)',
    500: 'hsl(41 95% 46%)',
    300: 'hsl(46 97% 65%)',
    100: 'hsl(51 90% 88%)',
    50: 'hsl(53 100% 92%)',
  },
  copper: {
    2: 'hsl(18 52% 49%)',
    1: 'hsl(20 64% 27%)',
  },
  gold: {
    3: 'hsl(40 57% 62%)',
    2: 'hsl(32 47% 48%)',
    1: 'hsl(32 59% 28%)',
  },
}

export { sapphire }

/* ─── Shared typography ──────────────────────────────────────────────────────── */

const commonTypography = {
  fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
  h3: { fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h4: { fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h5: { fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h6: { fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 },
  subtitle1: { fontWeight: 500 },
  body1: { lineHeight: 1.5 },
  body2: { lineHeight: 1.5 },
  button: { textTransform: 'none' as const, fontWeight: 500 },
}

/* ─── Component overrides ────────────────────────────────────────────────────── */

const sapphireComponents = (mode: 'light' | 'dark') => ({
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        background: mode === 'dark' ? sapphire.gray[800] : '#ffffff',
        border: mode === 'dark'
          ? `1px solid hsl(212 33% 27% / 0.6)`
          : `1px solid hsl(212 63% 12% / 0.08)`,
        borderRadius: 8,
        boxShadow: mode === 'dark'
          ? 'none'
          : '0px 0px 0px 1px hsl(212 63% 12% / 0.04) inset, 0px 2px 12px 0px hsl(212 63% 12% / 0.03)',
        transition: 'box-shadow 0.2s cubic-bezier(0.7, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.7, 0, 0.2, 1)',
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        background: mode === 'dark' ? sapphire.gray[800] : '#ffffff',
        borderRadius: 8,
        border: mode === 'dark'
          ? `1px solid hsl(212 33% 27% / 0.6)`
          : `1px solid hsl(212 63% 12% / 0.06)`,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 100, // pill-shaped
        textTransform: 'none' as const,
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        background: mode === 'dark' ? sapphire.gray[700] : '#ffffff',
        border: mode === 'dark'
          ? `1px solid hsl(212 33% 27% / 0.6)`
          : `1px solid hsl(212 63% 12% / 0.1)`,
        color: mode === 'dark' ? '#ffffff' : sapphire.blue[900],
        fontSize: '0.8rem',
        boxShadow: '0px 4px 24px 0px hsl(212 63% 12% / 0.08)',
        borderRadius: 6,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        letterSpacing: 0,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
      fullWidth: true,
      size: 'medium' as const,
    },
  },
  MuiFormControl: {
    defaultProps: {
      margin: 'dense' as const,
      fullWidth: true,
    },
    styleOverrides: {
      marginDense: {
        marginTop: 6,
        marginBottom: 6,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: mode === 'dark' ? sapphire.gray[900] : sapphire.gray[50],
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        '&.Mui-focused': {
          backgroundColor: mode === 'dark' ? sapphire.gray[800] : '#ffffff',
          boxShadow: `0 0 0 3px ${mode === 'dark' ? sapphire.blue[800] : sapphire.blue[100]}`,
        },
        '&.Mui-error': {
          boxShadow: `0 0 0 3px ${mode === 'dark' ? 'hsl(359 57% 36% / 0.35)' : sapphire.red[50]}`,
        },
      },
      input: {
        padding: '14px 16px',
        lineHeight: 1.6,
      },
      multiline: {
        padding: '14px 16px',
      },
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        color: mode === 'dark' ? '#ffffff' : sapphire.blue[900],
        '&.Mui-focused': {
          color: mode === 'dark' ? sapphire.blue[400] : sapphire.blue[500],
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontWeight: 600,
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: '0.78rem',
        lineHeight: 1.45,
        marginTop: 6,
      },
    },
  },
})

/* ─── Light theme ────────────────────────────────────────────────────────────── */

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#ffffff', paper: '#ffffff' },
    primary: { main: sapphire.blue[500], contrastText: '#ffffff' },
    secondary: { main: sapphire.gold[2], contrastText: '#ffffff' },
    success: { main: sapphire.green[500], contrastText: '#ffffff' },
    warning: { main: sapphire.yellow[500], contrastText: sapphire.yellow[700] },
    error: { main: sapphire.red[500], contrastText: '#ffffff' },
    text: {
      primary: sapphire.blue[900],
      secondary: `color-mix(in srgb, ${sapphire.blue[900]} 64%, transparent)`,
    },
    divider: `hsl(212 63% 12% / 0.08)`,
  },
  typography: commonTypography,
  components: sapphireComponents('light'),
})

/* ─── Dark theme ─────────────────────────────────────────────────────────────── */

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: sapphire.gray[900], paper: sapphire.gray[800] },
    primary: { main: sapphire.blue[400], contrastText: sapphire.blue[950] },
    secondary: { main: sapphire.gold[3], contrastText: '#ffffff' },
    success: { main: sapphire.green[400], contrastText: sapphire.green[700] },
    warning: { main: sapphire.yellow[300], contrastText: sapphire.yellow[700] },
    error: { main: sapphire.red[500], contrastText: '#ffffff' },
    text: {
      primary: '#ffffff',
      secondary: sapphire.gray[400],
    },
    divider: `hsl(212 33% 27% / 0.6)`,
  },
  typography: commonTypography,
  components: sapphireComponents('dark'),
})
