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
import AssessmentViewer from './components/AssessmentViewer'
import HelpDialog from './components/HelpDialog'
import type { PreloadedAssessment, LoadedEvaluation } from './types'

export type AppMode =
  | 'home'
  | 'create-rubric'
  | 'rubric'
  | 'new-assessment'
  | 'continue-assessment'
  | 'assess'
  | 'new-artifact'
  | 'edit-artifact'
  | 'view-assessment'

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [manifest, setManifest] = useState<ManifestData | null>(null)
  const [preloaded, setPreloaded] = useState<PreloadedAssessment | null>(null)
  const [viewEvalData, setViewEvalData] = useState<{ evaluation: LoadedEvaluation; rawYaml?: string } | null>(null)
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

  if (mode === 'view-assessment' && viewEvalData) {
    return (
      <Box sx={{ position: 'relative' }}>
        <AssessmentViewer
          evaluation={viewEvalData.evaluation}
          rawYaml={viewEvalData.rawYaml}
          onBack={() => {
            setViewEvalData(null)
            setMode('home')
          }}
        />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <ThemeToggleButton />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  // Home screen
  return (
    <Box sx={{ position: 'relative' }}>
      <HomeScreen
        onSelectMode={setMode}
        onViewAssessment={(evaluation, rawYaml) => {
          setViewEvalData({ evaluation, rawYaml })
          setMode('view-assessment')
        }}
      />
      <HelpButton onClick={() => setHelpOpen(true)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode="home" />
    </Box>
  )
}

// ─── Floating action button style ─────────────────────────────────────────────

const fabSx = {
  position: 'fixed' as const,
  zIndex: 1300,
  color: (theme: any) => theme.palette.mode === 'dark' ? 'hsl(211 22% 63%)' : 'hsl(212 27% 35%)',
  bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'hsl(213 48% 17%)' : '#ffffff',
  border: (theme: any) => `1px solid ${theme.palette.mode === 'dark' ? 'hsl(212 33% 27% / 0.6)' : 'hsl(212 63% 12% / 0.08)'}`,
  boxShadow: '0px 4px 24px 0px hsl(212 63% 12% / 0.06)',
  '&:hover': {
    color: (theme: any) => theme.palette.mode === 'dark' ? '#ffffff' : 'hsl(210 100% 14%)',
    bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'hsl(212 33% 27%)' : 'hsl(206 33% 96%)',
  },
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
      <IconButton onClick={handleToggle} size="large" sx={{ ...fabSx, bottom: 24, right: 88 }}>
        {getIcon()}
      </IconButton>
    </Tooltip>
  )
}

// ─── Floating action buttons ──────────────────────────────────────────────────

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="Help" placement="left">
      <IconButton onClick={onClick} size="large" sx={{ ...fabSx, bottom: 24, right: 24 }}>
        <HelpOutlineIcon fontSize="medium" />
      </IconButton>
    </Tooltip>
  )
}
