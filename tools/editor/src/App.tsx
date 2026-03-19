import { useState, useEffect, useContext } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { ThemeModeContext } from './ThemeContext'
import type { ManifestData } from './manifest'
import { fetchManifest } from './manifest'
import HomeScreen from './components/HomeScreen'
import RubricEditor from './components/RubricEditor'
import ArtifactEditor from './components/ArtifactEditor'
import AssessmentForm from './components/AssessmentForm'
import AssessmentWizard from './components/AssessmentWizard'
import ContinueAssessment from './components/ContinueAssessment'
import HelpDialog from './components/HelpDialog'
import type { PreloadedAssessment } from './types'

export type AppMode =
  | 'home'
  | 'create-rubric'
  | 'rubric'
  | 'new-assessment'
  | 'continue-assessment'
  | 'assess'
  | 'new-artifact'
  | 'edit-artifact'

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [manifest, setManifest] = useState<ManifestData | null>(null)
  const [preloaded, setPreloaded] = useState<PreloadedAssessment | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    fetchManifest().then((m) => { if (m) setManifest(m) })
  }, [])

  if (mode === 'create-rubric') {
    return (
      <Box sx={{ position: 'relative' }}>
        <RubricEditor manifest={manifest} onBack={() => setMode('home')} autoNew />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'rubric') {
    return (
      <Box sx={{ position: 'relative' }}>
        <RubricEditor manifest={manifest} onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'new-assessment') {
    return (
      <Box sx={{ position: 'relative' }}>
        <AssessmentWizard
          manifest={manifest}
          onBack={() => setMode('home')}
          onStart={(result) => {
            setPreloaded(result)
            setMode('assess')
          }}
        />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'continue-assessment') {
    return (
      <Box sx={{ position: 'relative' }}>
        <ContinueAssessment
          manifest={manifest}
          onBack={() => setMode('home')}
          onLoad={(result) => {
            setPreloaded(result)
            setMode('assess')
          }}
        />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'assess') {
    return (
      <Box sx={{ position: 'relative' }}>
        <AssessmentForm
          manifest={manifest}
          preloaded={preloaded}
          onBack={() => {
            setPreloaded(null)
            setMode('home')
          }}
        />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'new-artifact') {
    return (
      <Box sx={{ position: 'relative' }}>
        <ArtifactEditor initialMode="new" onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'edit-artifact') {
    return (
      <Box sx={{ position: 'relative' }}>
        <ArtifactEditor initialMode="import" onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  // Home screen
  return (
    <Box sx={{ position: 'relative' }}>
      <HomeScreen onSelectMode={setMode} />
      <HelpButton onClick={() => setHelpOpen(true)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode="home" />
    </Box>
  )
}

function ThemeToggleButton() {
  const { mode, setMode } = useContext(ThemeModeContext)

  const handleToggle = () => {
    if (mode === 'system') setMode('light')
    else if (mode === 'light') setMode('dark')
    else setMode('system')
  }

  const getIcon = () => {
    if (mode === 'light') return <LightModeIcon fontSize="medium" />
    if (mode === 'dark') return <DarkModeIcon fontSize="medium" />
    return <SettingsBrightnessIcon fontSize="medium" />
  }

  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1)

  return (
    <Tooltip title={`Theme: ${modeLabel}`} placement="left">
      <IconButton
        onClick={handleToggle}
        size="large"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 88,
          zIndex: 1300,
          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': { 
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'
          },
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  )
}

// ─── Floating action buttons ──────────────────────────────────────────────────

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="Help" placement="left">
      <IconButton
        onClick={onClick}
        size="large"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': { 
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'
          },
        }}
      >
        <HelpOutlineIcon fontSize="medium" />
      </IconButton>
    </Tooltip>
  )
}
