import React, { useMemo, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import './index.css'
import App from './App'
import { lightTheme, darkTheme } from './theme'
import { ThemeModeContext, ThemeMode } from './ThemeContext'

function Root() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('earos-theme-mode')
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })

  useEffect(() => {
    localStorage.setItem('earos-theme-mode', mode)
  }, [mode])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isDark = mode === 'system' ? prefersDarkMode : mode === 'dark'

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
