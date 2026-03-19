import { useState, useEffect } from 'react'
import type { ManifestData } from './manifest'
import { fetchManifest } from './manifest'
import HomeScreen from './components/HomeScreen'
import RubricEditor from './components/RubricEditor'
import ArtifactEditor from './components/ArtifactEditor'
import AssessmentForm from './components/AssessmentForm'
import AssessmentWizard from './components/AssessmentWizard'
import ContinueAssessment from './components/ContinueAssessment'
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

  useEffect(() => {
    fetchManifest().then((m) => { if (m) setManifest(m) })
  }, [])

  if (mode === 'create-rubric') {
    return <RubricEditor manifest={manifest} onBack={() => setMode('home')} autoNew />
  }

  if (mode === 'rubric') {
    return <RubricEditor manifest={manifest} onBack={() => setMode('home')} />
  }

  if (mode === 'new-assessment') {
    return (
      <AssessmentWizard
        manifest={manifest}
        onBack={() => setMode('home')}
        onStart={(result) => {
          setPreloaded(result)
          setMode('assess')
        }}
      />
    )
  }

  if (mode === 'continue-assessment') {
    return (
      <ContinueAssessment
        manifest={manifest}
        onBack={() => setMode('home')}
        onLoad={(result) => {
          setPreloaded(result)
          setMode('assess')
        }}
      />
    )
  }

  if (mode === 'assess') {
    return (
      <AssessmentForm
        manifest={manifest}
        preloaded={preloaded}
        onBack={() => {
          setPreloaded(null)
          setMode('home')
        }}
      />
    )
  }

  if (mode === 'new-artifact') {
    return <ArtifactEditor initialMode="new" onBack={() => setMode('home')} />
  }

  if (mode === 'edit-artifact') {
    return <ArtifactEditor initialMode="import" onBack={() => setMode('home')} />
  }

  return <HomeScreen onSelectMode={setMode} />
}
