import { useState, useCallback } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ManifestData, ManifestEntry } from '../manifest'
import { fetchRepoFile } from '../manifest'
import type { PreloadedAssessment, DimWithSource, ArtifactMeta } from '../types'
import type { RubricDimension } from './AssessmentSummary'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadedRubricFile {
  rubric_id: string
  version: string
  title: string
  kind: string
  artifact_type: string
  dimensions: RubricDimension[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Core Rubric', 'Profile', 'Overlays', 'Artifact Details']

// ─── Step sub-components ──────────────────────────────────────────────────────

interface StepCoreRubricProps {
  options: ManifestEntry[]
  selected: string
  onSelect: (path: string) => void
}

function StepCoreRubric({ options, selected, onSelect }: StepCoreRubricProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>Select Core Rubric</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The core rubric defines universal criteria that apply to every architecture artifact —
        fundamentals like clarity, completeness, and decision-readiness. All assessments start here.
      </Typography>
      {options.length === 0 ? (
        <Alert severity="info">
          No core rubrics found. Make sure the dev server is running and the manifest is up to date
          (<code>node bin.js manifest</code>).
        </Alert>
      ) : (
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup value={selected} onChange={(e) => onSelect(e.target.value)}>
            {options.map((opt) => (
              <Paper
                key={opt.path}
                variant="outlined"
                sx={{
                  mb: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: selected === opt.path ? '#2e7d32' : 'divider',
                  bgcolor: selected === opt.path ? '#f1f8e9' : 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
                onClick={() => onSelect(opt.path)}
              >
                <FormControlLabel
                  value={opt.path}
                  control={
                    <Radio
                      size="small"
                      sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }}
                    />
                  }
                  label={
                    <Box sx={{ ml: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {opt.title ?? opt.rubric_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opt.rubric_id} · 9 universal dimensions · always applied
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
                />
              </Paper>
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  )
}

interface StepProfileProps {
  options: ManifestEntry[]
  selected: string
  onSelect: (path: string) => void
}

function StepProfile({ options, selected, onSelect }: StepProfileProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Select Profile{' '}
        <Typography component="span" variant="body2" color="text.secondary">
          (optional)
        </Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Profiles add criteria specific to your artifact type. Choose the one that best matches
        what you are reviewing, or select "Core only" if your artifact doesn't fit a specific category.
      </Typography>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup value={selected} onChange={(e) => onSelect(e.target.value)}>
          {/* No profile option */}
          <Paper
            variant="outlined"
            sx={{
              mb: 1.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              borderColor: selected === 'none' ? '#1565c0' : 'divider',
              bgcolor: selected === 'none' ? '#e3f2fd' : 'white',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            onClick={() => onSelect('none')}
          >
            <FormControlLabel
              value="none"
              control={<Radio size="small" />}
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Core only — no profile
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evaluate using only the 10 universal criteria. Best when no profile fits.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
            />
          </Paper>

          {options.map((opt) => (
            <Paper
              key={opt.path}
              variant="outlined"
              sx={{
                mb: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                borderColor: selected === opt.path ? '#1565c0' : 'divider',
                bgcolor: selected === opt.path ? '#e3f2fd' : 'white',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onClick={() => onSelect(opt.path)}
            >
              <FormControlLabel
                value={opt.path}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ ml: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {opt.title ?? opt.rubric_id}
                      </Typography>
                      {opt.artifact_type && (
                        <Chip
                          label={opt.artifact_type.replace(/_/g, ' ')}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {opt.rubric_id}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

interface StepOverlaysProps {
  options: ManifestEntry[]
  selected: Set<string>
  onToggle: (path: string) => void
}

function StepOverlays({ options, selected, onToggle }: StepOverlaysProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Select Overlays{' '}
        <Typography component="span" variant="body2" color="text.secondary">
          (optional)
        </Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overlays add cross-cutting criteria for concerns like security, data governance, or
        regulatory compliance. Apply an overlay when your artifact touches these areas — they
        stack on top of the core and profile.
      </Typography>
      {options.length === 0 ? (
        <Alert severity="info">No overlays available in the manifest.</Alert>
      ) : (
        <Box>
          {options.map((opt) => (
            <Paper
              key={opt.path}
              variant="outlined"
              sx={{
                mb: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                borderColor: selected.has(opt.path) ? '#6a1b9a' : 'divider',
                bgcolor: selected.has(opt.path) ? '#f3e5f5' : 'white',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onClick={() => onToggle(opt.path)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selected.has(opt.path)}
                    onChange={() => onToggle(opt.path)}
                    sx={{ color: '#6a1b9a', '&.Mui-checked': { color: '#6a1b9a' } }}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label={
                  <Box sx={{ ml: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {opt.title ?? opt.rubric_id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {opt.rubric_id}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          ))}
        </Box>
      )}
      {selected.size === 0 && options.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          No overlays selected — you can skip this if security or compliance criteria don't apply.
        </Typography>
      )}
    </Box>
  )
}

interface StepArtifactDetailsProps {
  meta: ArtifactMeta
  onChange: (meta: ArtifactMeta) => void
  inferredArtifactType: string
}

function StepArtifactDetails({ meta, onChange, inferredArtifactType }: StepArtifactDetailsProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>Artifact Details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tell us about the document you're evaluating. These details will appear in the exported
        evaluation record — you can fill them in now or after scoring.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Document title"
          placeholder="e.g. Payments API Solution Architecture"
          value={meta.title}
          onChange={(e) => onChange({ ...meta, title: e.target.value })}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Version"
            placeholder="e.g. v1.2"
            value={meta.version}
            onChange={(e) => onChange({ ...meta, version: e.target.value })}
            sx={{ flex: '0 1 150px' }}
          />
          <TextField
            label="Author / owner"
            placeholder="e.g. Platform Team"
            value={meta.author}
            onChange={(e) => onChange({ ...meta, author: e.target.value })}
            sx={{ flex: '1 1 200px' }}
          />
          <TextField
            label="Review date"
            type="date"
            value={meta.date}
            onChange={(e) => onChange({ ...meta, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: '0 1 170px' }}
          />
        </Box>
        <TextField
          label="Artifact type"
          placeholder={inferredArtifactType || 'e.g. solution_architecture'}
          value={meta.artifactType}
          onChange={(e) => onChange({ ...meta, artifactType: e.target.value })}
          helperText={
            inferredArtifactType
              ? `Inferred from profile: "${inferredArtifactType.replace(/_/g, ' ')}" — override if needed`
              : 'Optional — describe the type of artifact being evaluated'
          }
          fullWidth
        />
      </Box>
    </Box>
  )
}

// ─── AssessmentWizard ─────────────────────────────────────────────────────────

interface Props {
  manifest: ManifestData | null
  onBack: () => void
  onStart: (result: PreloadedAssessment) => void
}

export default function AssessmentWizard({ manifest, onBack, onStart }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedCorePath, setSelectedCorePath] = useState<string>(
    manifest?.core?.[0]?.path ?? '',
  )
  const [selectedProfilePath, setSelectedProfilePath] = useState<string>('none')
  const [selectedOverlayPaths, setSelectedOverlayPaths] = useState<Set<string>>(new Set())
  const [meta, setMeta] = useState<ArtifactMeta>({
    title: '',
    version: '',
    author: '',
    date: new Date().toISOString().slice(0, 10),
    artifactType: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coreOptions = manifest?.core ?? []
  const profileOptions = manifest?.profiles ?? []
  const overlayOptions = manifest?.overlays ?? []

  const handleToggleOverlay = (path: string) => {
    setSelectedOverlayPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const canProceedFromStep = [
    !!selectedCorePath, // step 0 — core must be selected
    true,              // step 1 — profile is optional
    true,              // step 2 — overlays are optional
    true,              // step 3 — metadata is optional
  ]

  const handleStartAssessment = useCallback(async () => {
    if (!selectedCorePath) {
      setError('Please select a core rubric')
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Load core
      const coreData = await fetchRepoFile(selectedCorePath) as LoadedRubricFile | null
      if (!coreData) throw new Error('Could not load core rubric file')

      const coreDims: DimWithSource[] = (coreData.dimensions ?? []).map((d) => ({
        ...d,
        source: 'core' as const,
      }))

      // Load profile if selected
      let profileDims: DimWithSource[] = []
      let primaryTitle = coreData.title
      let primaryRubricId = coreData.rubric_id

      if (selectedProfilePath !== 'none') {
        const profileData = await fetchRepoFile(selectedProfilePath) as LoadedRubricFile | null
        if (!profileData) throw new Error('Could not load profile file')
        profileDims = (profileData.dimensions ?? []).map((d) => ({
          ...d,
          source: 'profile' as const,
        }))
        primaryTitle = profileData.title
        primaryRubricId = profileData.rubric_id
      }

      // Load overlays
      let overlayDims: DimWithSource[] = []
      for (const path of selectedOverlayPaths) {
        const overlayData = await fetchRepoFile(path) as LoadedRubricFile | null
        if (overlayData) {
          overlayDims = overlayDims.concat(
            (overlayData.dimensions ?? []).map((d) => ({
              ...d,
              source: 'overlay' as const,
            })),
          )
        }
      }

      const allDims = [...coreDims, ...profileDims, ...overlayDims]

      // Auto-populate artifactType from profile if user left it blank
      const inferredType =
        selectedProfilePath !== 'none'
          ? manifest?.profiles?.find((p) => p.path === selectedProfilePath)?.artifact_type ?? ''
          : ''
      const resolvedArtifactType = meta.artifactType || inferredType

      onStart({
        dimensions: allDims,
        primaryRubricId,
        primaryTitle,
        meta: { ...meta, artifactType: resolvedArtifactType },
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [selectedCorePath, selectedProfilePath, selectedOverlayPaths, meta, manifest, onStart])

  const inferredArtifactType =
    selectedProfilePath !== 'none'
      ? manifest?.profiles?.find((p) => p.path === selectedProfilePath)?.artifact_type ?? ''
      : ''

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#2e7d32', flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="Back to home">
            <IconButton
              size="small"
              onClick={onBack}
              sx={{ color: 'rgba(255,255,255,0.8)', mr: 0.5 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            New Assessment
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          py: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 680 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step content */}
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            {activeStep === 0 && (
              <StepCoreRubric
                options={coreOptions}
                selected={selectedCorePath}
                onSelect={setSelectedCorePath}
              />
            )}
            {activeStep === 1 && (
              <StepProfile
                options={profileOptions}
                selected={selectedProfilePath}
                onSelect={setSelectedProfilePath}
              />
            )}
            {activeStep === 2 && (
              <StepOverlays
                options={overlayOptions}
                selected={selectedOverlayPaths}
                onToggle={handleToggleOverlay}
              />
            )}
            {activeStep === 3 && (
              <StepArtifactDetails
                meta={meta}
                onChange={setMeta}
                inferredArtifactType={inferredArtifactType}
              />
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={activeStep === 0 ? onBack : () => setActiveStep((s) => s - 1)}
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setActiveStep((s) => s + 1)}
                variant="contained"
                disabled={!canProceedFromStep[activeStep]}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleStartAssessment}
                variant="contained"
                disabled={loading || !selectedCorePath}
                startIcon={
                  loading ? <CircularProgress size={16} color="inherit" /> : undefined
                }
                sx={{
                  textTransform: 'none',
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
              >
                {loading ? 'Loading…' : 'Start Assessment'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
