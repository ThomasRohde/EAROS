import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'

const DemoPage = lazy(() => import('./pages/DemoPage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const DocViewPage = lazy(() => import('./pages/DocViewPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const OnboardingViewPage = lazy(() => import('./pages/OnboardingViewPage'))

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress size={32} />
    </Box>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/EAROS">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="demo" element={<DemoPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="docs/:slug" element={<DocViewPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="onboarding/:slug" element={<OnboardingViewPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
