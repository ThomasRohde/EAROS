import { useState, useEffect, useRef, useCallback } from 'react'
import type { DragEvent } from 'react'
import { load as yamlLoad } from 'js-yaml'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QuickTipBanner from './QuickTipBanner'
import AssignmentIcon from '@mui/icons-material/Assignment'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import type { ManifestData } from '../manifest'
import { fetchEvaluations, fetchRepoFile } from '../manifest'
import type { PreloadedAssessment, DimWithSource, ArtifactMeta, CriterionResult } from '../types'
import type { RubricDimension } from './AssessmentSummary'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvalFile {
  path: string
  name: string
}

interface LoadedRubricFile {
  rubric_id: string
  title: string
  kind: string
  dimensions: RubricDimension[]
}

interface EvaluationRecord {
  rubric_id?: string
  artifact_ref?: { title?: string; artifact_version?: string; owner?: string }
  evaluation_date?: string
  criterion_results?: Array<{
    criterion_id: string
    score?: number | string
    confidence?: string
    judgment_type?: string
    rationale?: string
    evidence_refs?: Array<{ excerpt?: string }>
  }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultResult(): CriterionResult {
  return { score: null, confidence: '', evidence_class: '', evidence: '' }
}

function buildInitialResults(dims: RubricDimension[]): Record<string, CriterionResult> {
  const map: Record<string, CriterionResult> = {}
  for (const dim of dims) {
    for (const c of dim.criteria) {
      map[c.id] = defaultResult()
    }
  }
  return map
}

function parseExistingResults(
  criterionResults: EvaluationRecord['criterion_results'],
): Record<string, CriterionResult> {
  const map: Record<string, CriterionResult> = {}
  for (const r of criterionResults ?? []) {
    const rawScore = r.score
    let score: CriterionResult['score'] = null
    if (rawScore === 'N/A' || rawScore === 'na') {
      score = 'N/A'
    } else if (typeof rawScore === 'number') {
      score = rawScore
    } else if (typeof rawScore === 'string' && rawScore !== '') {
      const n = Number(rawScore)
      if (!isNaN(n)) score = n
    }
    map[r.criterion_id] = {
      score,
      confidence: r.confidence ?? '',
      evidence_class: r.judgment_type ?? '',
      evidence: r.evidence_refs?.[0]?.excerpt ?? r.rationale ?? '',
    }
  }
  return map
}

async function loadEvaluationFromData(
  evalData: EvaluationRecord,
  manifest: ManifestData | null,
): Promise<PreloadedAssessment> {
  const rubricId = evalData.rubric_id ?? ''

  // Find rubric in manifest
  const allEntries = [
    ...(manifest?.core ?? []),
    ...(manifest?.profiles ?? []),
    ...(manifest?.overlays ?? []),
  ]
  const matchedEntry = allEntries.find((e) => e.rubric_id === rubricId)

  let dimensions: DimWithSource[] = []
  let primaryTitle = rubricId

  if (matchedEntry) {
    const rubricData = await fetchRepoFile(matchedEntry.path) as LoadedRubricFile | null
    if (rubricData) {
      primaryTitle = rubricData.title ?? rubricId

      // If it's a profile, also load core
      if (rubricData.kind === 'profile' && manifest?.core?.length) {
        const coreEntry = manifest.core[0]
        const coreData = await fetchRepoFile(coreEntry.path) as LoadedRubricFile | null
        if (coreData) {
          dimensions = [
            ...(coreData.dimensions ?? []).map((d) => ({ ...d, source: 'core' as const })),
            ...(rubricData.dimensions ?? []).map((d) => ({ ...d, source: 'profile' as const })),
          ]
        } else {
          dimensions = (rubricData.dimensions ?? []).map((d) => ({ ...d, source: 'profile' as const }))
        }
      } else {
        const source = rubricData.kind === 'core_rubric' ? 'core' : 'profile'
        dimensions = (rubricData.dimensions ?? []).map((d) => ({
          ...d,
          source: source as DimWithSource['source'],
        }))
      }
    }
  }

  // Build results — start from initial, then overlay saved scores
  const initial = buildInitialResults(dimensions)
  const saved = parseExistingResults(evalData.criterion_results)
  const mergedResults: Record<string, CriterionResult> = { ...initial, ...saved }

  const ref = evalData.artifact_ref ?? {}
  const meta: ArtifactMeta = {
    title: ref.title ?? '',
    version: ref.artifact_version ?? '',
    author: ref.owner ?? '',
    date: evalData.evaluation_date ?? new Date().toISOString().slice(0, 10),
    artifactType: '',
  }

  return {
    dimensions,
    primaryRubricId: rubricId,
    primaryTitle,
    meta,
    existingResults: mergedResults,
  }
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFile: (data: EvaluationRecord) => void
  onError: (msg: string) => void
}

function DropZone({ onFile, onError }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
        onError('Please select a .yaml or .yml file')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const data = yamlLoad(text) as EvaluationRecord
          if (!data || typeof data !== 'object') {
            onError('Invalid YAML file — could not parse')
            return
          }
          onFile(data)
        } catch (err) {
          onError(`Failed to parse file: ${(err as Error).message}`)
        }
      }
      reader.readAsText(file)
    },
    [onFile, onError],
  )

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: `2px dashed ${dragging ? '#2e7d32' : '#ccc'}`,
        borderRadius: 3,
        p: 4,
        textAlign: 'center',
        bgcolor: dragging ? '#f1f8e9' : '#fafafa',
        transition: 'border-color 0.15s, background-color 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      <UploadFileIcon sx={{ fontSize: 40, color: dragging ? '#2e7d32' : '#bbb', mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        Drag and drop a <strong>.evaluation.yaml</strong> file here, or click to browse
      </Typography>
    </Box>
  )
}

// ─── ContinueAssessment ───────────────────────────────────────────────────────

interface Props {
  manifest: ManifestData | null
  onBack: () => void
  onLoad: (result: PreloadedAssessment) => void
}

export default function ContinueAssessment({ manifest, onBack, onLoad }: Props) {
  const [evalFiles, setEvalFiles] = useState<EvalFile[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvaluations()
      .then(setEvalFiles)
      .finally(() => setLoadingList(false))
  }, [])

  const handleOpenFile = useCallback(
    async (path: string) => {
      setOpening(path)
      setError(null)
      try {
        const data = await fetchRepoFile(path) as EvaluationRecord | null
        if (!data) throw new Error(`Could not load file: ${path}`)
        const result = await loadEvaluationFromData(data, manifest)
        onLoad(result)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setOpening(null)
      }
    },
    [manifest, onLoad],
  )

  const handleDroppedFile = useCallback(
    async (data: EvaluationRecord) => {
      setError(null)
      try {
        const result = await loadEvaluationFromData(data, manifest)
        onLoad(result)
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [manifest, onLoad],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#e65100', flexShrink: 0 }}>
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
            Continue Assessment
          </Typography>
        </Toolbar>
      </AppBar>

      <QuickTipBanner
        tipKey="continue-assessment"
        message="Select an evaluation from the list or import a .evaluation.yaml file. Use earos-report in your AI agent to generate executive reports from completed evaluations."
      />

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
        <Box sx={{ width: '100%', maxWidth: 640 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Saved evaluations */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: '#fff3e0',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100' }}>
                Saved evaluations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                .evaluation.yaml files found in examples/ and evaluations/
              </Typography>
            </Box>

            {loadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : evalFiles.length === 0 ? (
              <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No saved evaluations found.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed evaluations exported from the assessment form will appear here.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {evalFiles.map((file, idx) => (
                  <Box key={file.path}>
                    {idx > 0 && <Divider />}
                    <ListItemButton
                      onClick={() => handleOpenFile(file.path)}
                      disabled={!!opening}
                      sx={{ px: 2.5, py: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {opening === file.path ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AssignmentIcon sx={{ color: '#e65100', fontSize: 20 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name.replace('.evaluation.yaml', '').replace(/-/g, ' ')}
                        secondary={file.path}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            )}
          </Paper>

          {/* Import from file */}
          <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 1.5, letterSpacing: 1.2 }}>
            Or import a file
          </Typography>
          <DropZone onFile={handleDroppedFile} onError={setError} />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              onClick={onBack}
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
