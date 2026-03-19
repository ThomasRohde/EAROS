import { useState, useEffect } from 'react'
import type { ManifestData } from './manifest'
import { fetchManifest } from './manifest'
import HomeScreen from './components/HomeScreen'
import RubricEditor from './components/RubricEditor'
import AssessmentForm from './components/AssessmentForm'

export type AppMode = 'home' | 'rubric' | 'assessment'

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [manifest, setManifest] = useState<ManifestData | null>(null)

  useEffect(() => {
    fetchManifest().then((m) => { if (m) setManifest(m) })
  }, [])

  if (mode === 'rubric') {
    return <RubricEditor manifest={manifest} onBack={() => setMode('home')} />
  }
  if (mode === 'assessment') {
    return <AssessmentForm manifest={manifest} onBack={() => setMode('home')} />
  }
  return <HomeScreen onSelectMode={setMode} />
}
