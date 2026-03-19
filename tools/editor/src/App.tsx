import { useState, useEffect } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
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
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'rubric') {
    return (
      <Box sx={{ position: 'relative' }}>
        <RubricEditor manifest={manifest} onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
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
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'new-artifact') {
    return (
      <Box sx={{ position: 'relative' }}>
        <ArtifactEditor initialMode="new" onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} mode={mode} />
      </Box>
    )
  }

  if (mode === 'edit-artifact') {
    return (
      <Box sx={{ position: 'relative' }}>
        <ArtifactEditor initialMode="import" onBack={() => setMode('home')} />
        <HelpButton onClick={() => setHelpOpen(true)} />
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

// ─── Floating help button (fixed, top-right) ──────────────────────────────────

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="Help" placement="left">
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          position: 'fixed',
          top: 8,
          right: 12,
          zIndex: 1300,
          color: 'rgba(255,255,255,0.75)',
          '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
        }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}
