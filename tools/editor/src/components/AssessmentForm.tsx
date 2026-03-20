import { useState, useCallback } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Divider,
  Snackbar,
  CircularProgress,
  Alert,
  Collapse,
  Button,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import QuickTipBanner from './QuickTipBanner'
import type { ManifestData, ManifestEntry } from '../manifest'
import { fetchRepoFile } from '../manifest'
import CriterionScorer from './CriterionScorer'
import type { CriterionResult } from './CriterionScorer'
import AssessmentSummary from './AssessmentSummary'
import type { RubricDimension } from './AssessmentSummary'
import { toYaml } from '../utils/yaml'
import type { PreloadedAssessment, DimWithSource, ArtifactMeta } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadedRubric {
  rubric_id: string
  version: string
  title: string
  kind: string
  artifact_type: string
  dimensions: RubricDimension[]
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

function exportEvaluation(
  meta: ArtifactMeta,
  primaryRubricId: string,
  dimensions: RubricDimension[],
  results: Record<string, CriterionResult>,
): string {
  const criterionResults = []
  for (const dim of dimensions) {
    for (const c of dim.criteria) {
      const r = results[c.id]
      if (!r || r.score === null) continue
      criterionResults.push({
        criterion_id: c.id,
        score: r.score,
        judgment_type: r.evidence_class || null,
        confidence: r.confidence || null,
        evidence_refs: r.evidence
          ? [{ location: 'see evidence field', excerpt: r.evidence }]
          : [],
        rationale: r.evidence || null,
      })
    }
  }

  const record = {
    kind: 'evaluation',
    evaluation_id: `EVAL-${Date.now()}`,
    rubric_id: primaryRubricId || 'unknown',
    rubric_version: '1.0.0',
    artifact_ref: {
      title: meta.title || 'Untitled',
      artifact_version: meta.version || null,
      owner: meta.author || null,
    },
    evaluation_date: meta.date || new Date().toISOString().slice(0, 10),
    evaluators: [{ role: 'reviewer', mode: 'human' }],
    criterion_results: criterionResults,
  }

  return toYaml(record)
}

// ─── Setup Panel (rubric picker + artifact metadata) ─────────────────────────

interface SetupPanelProps {
  manifest: ManifestData | null
  selectedPath: string
  onSelectPath: (path: string) => void
  meta: ArtifactMeta
  onMetaChange: (meta: ArtifactMeta) => void
  loading: boolean
  loadError: string | null
}

function SetupPanel({
  manifest,
  selectedPath,
  onSelectPath,
  meta,
  onMetaChange,
  loading,
  loadError,
}: SetupPanelProps) {
  const [open, setOpen] = useState(true)

  const rubricOptions: { path: string; label: string; id: string }[] = []
  if (manifest) {
    for (const e of manifest.core ?? []) {
      rubricOptions.push({ path: e.path, label: `${e.title ?? e.rubric_id} (Core)`, id: e.rubric_id ?? e.path })
    }
    for (const e of manifest.profiles ?? []) {
      rubricOptions.push({ path: e.path, label: `${e.title ?? e.rubric_id}`, id: e.rubric_id ?? e.path })
    }
  }

  return (
    <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'action.hover',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: 'action.selected' },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
          Setup — Rubric &amp; Artifact
        </Typography>
        {open ? <ExpandLessIcon fontSize="small" sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
      </Box>
      <Collapse in={open}>
        <Box sx={{ p: 2.5 }}>
          {/* Rubric selector */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 1 }}>
              1. Which rubric are you scoring against?
            </Typography>
            {manifest ? (
              <FormControl size="small" sx={{ minWidth: 380 }}>
                <InputLabel>Select rubric</InputLabel>
                <Select
                  label="Select rubric"
                  value={selectedPath}
                  onChange={(e) => onSelectPath(e.target.value)}
                >
                  <MenuItem value=""><em>— choose a rubric —</em></MenuItem>
                  {rubricOptions.map((opt) => (
                    <MenuItem key={opt.path} value={opt.path}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Start the dev server to load rubrics from the repository.
              </Typography>
            )}
            {loading && <CircularProgress size={16} sx={{ ml: 1, verticalAlign: 'middle' }} />}
            {loadError && (
              <Alert severity="error" sx={{ mt: 1, py: 0 }}>{loadError}</Alert>
            )}
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Artifact metadata */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 1.5 }}>
            2. What artifact are you reviewing?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Document title"
              placeholder="e.g. Payments API Solution Architecture"
              value={meta.title}
              onChange={(e) => onMetaChange({ ...meta, title: e.target.value })}
              sx={{ flex: '2 1 260px' }}
            />
            <TextField
              size="small"
              label="Version"
              placeholder="e.g. v1.2"
              value={meta.version}
              onChange={(e) => onMetaChange({ ...meta, version: e.target.value })}
              sx={{ flex: '0 1 100px' }}
            />
            <TextField
              size="small"
              label="Author / owner"
              placeholder="e.g. Platform Team"
              value={meta.author}
              onChange={(e) => onMetaChange({ ...meta, author: e.target.value })}
              sx={{ flex: '1 1 180px' }}
            />
            <TextField
              size="small"
              label="Review date"
              type="date"
              value={meta.date}
              onChange={(e) => onMetaChange({ ...meta, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: '0 1 150px' }}
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

// ─── Dimension Section ────────────────────────────────────────────────────────

interface DimSectionProps {
  dim: DimWithSource
  results: Record<string, CriterionResult>
  onChange: (id: string, result: CriterionResult) => void
}

function DimensionSection({ dim, results, onChange }: DimSectionProps) {
  const scored = dim.criteria.filter((c) => results[c.id]?.score !== null).length
  const total = dim.criteria.length

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {dim.name}
        </Typography>
        {dim.source === 'core' && (
          <Chip label="Core" size="small" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(21, 101, 192, 0.2)' : '#e3f2fd', color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0', border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#1565c0' : '#90caf9', fontSize: '0.65rem', height: 20 }} />
        )}
        {dim.source === 'profile' && (
          <Chip label="Profile" size="small" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(106, 27, 154, 0.2)' : '#f3e5f5', color: (theme) => theme.palette.mode === 'dark' ? '#ce93d8' : '#6a1b9a', border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#6a1b9a' : '#ce93d8', fontSize: '0.65rem', height: 20 }} />
        )}
        {dim.source === 'overlay' && (
          <Chip label="Overlay" size="small" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(136, 14, 79, 0.2)' : '#fce4ec', color: (theme) => theme.palette.mode === 'dark' ? '#f48fb1' : '#880e4f', border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#880e4f' : '#f48fb1', fontSize: '0.65rem', height: 20 }} />
        )}
        {dim.weight && dim.weight !== 1.0 && (
          <Chip label={`×${dim.weight}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20, color: 'text.disabled' }} />
        )}
        <Typography variant="caption" sx={{ color: 'text.disabled', ml: 'auto' }}>
          {scored}/{total} scored
        </Typography>
      </Box>
      {dim.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic', fontSize: '0.82rem' }}>
          {dim.description}
        </Typography>
      )}
      {dim.criteria.map((c) => (
        <CriterionScorer
          key={c.id}
          criterion={c}
          dimLabel={dim.name}
          result={results[c.id] ?? defaultResult()}
          onChange={(updated) => onChange(c.id, updated)}
        />
      ))}
    </Box>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        py: 8,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, color: '#ccc' }}>
        Select a rubric above to begin scoring
      </Typography>
      <Typography variant="body2" sx={{ color: '#bbb' }}>
        Criteria will appear here once a rubric is loaded
      </Typography>
    </Box>
  )
}

// ─── AssessmentForm ───────────────────────────────────────────────────────────

interface Props {
  manifest: ManifestData | null
  preloaded?: PreloadedAssessment | null
  onBack: () => void
}

export default function AssessmentForm({ manifest, preloaded, onBack }: Props) {
  // When preloaded is provided, initialize state from it
  const initialMeta: ArtifactMeta = preloaded?.meta ?? {
    title: '',
    version: '',
    author: '',
    date: new Date().toISOString().slice(0, 10),
    artifactType: '',
  }
  const initialDims: DimWithSource[] = preloaded?.dimensions ?? []
  const initialResults: Record<string, CriterionResult> = preloaded?.existingResults
    ?? (initialDims.length > 0 ? buildInitialResults(initialDims) : {})

  // Manual-mode rubric selection (only used when preloaded is null)
  const [selectedPath, setSelectedPath] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ManifestEntry | null>(null)
  const [dimensions, setDimensions] = useState<DimWithSource[]>(initialDims)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [meta, setMeta] = useState<ArtifactMeta>(initialMeta)
  const [results, setResults] = useState<Record<string, CriterionResult>>(initialResults)
  const [toast, setToast] = useState<string | null>(null)

  const handleSelectRubric = useCallback(async (path: string) => {
    setSelectedPath(path)
    if (!path) {
      setDimensions([])
      setResults({})
      setSelectedEntry(null)
      return
    }

    setLoading(true)
    setLoadError(null)

    try {
      const rubricData = await fetchRepoFile(path) as LoadedRubric | null
      if (!rubricData) throw new Error('Could not load rubric file')

      const entry: ManifestEntry = {
        path,
        rubric_id: rubricData.rubric_id,
        title: rubricData.title,
        artifact_type: rubricData.artifact_type,
      }
      setSelectedEntry(entry)

      const profileDims: DimWithSource[] = (rubricData.dimensions ?? []).map((d) => ({
        ...d,
        source: rubricData.kind === 'core_rubric' ? 'core' : 'profile',
      }))

      let coreDims: DimWithSource[] = []
      if (rubricData.kind === 'profile' && manifest?.core?.length) {
        const coreEntry = manifest.core[0]
        const coreData = await fetchRepoFile(coreEntry.path) as LoadedRubric | null
        if (coreData) {
          coreDims = (coreData.dimensions ?? []).map((d) => ({ ...d, source: 'core' as const }))
        }
      }

      const allDims = [...coreDims, ...profileDims]
      setDimensions(allDims)
      setResults(buildInitialResults(allDims))
    } catch (e) {
      setLoadError((e as Error).message)
      setDimensions([])
      setResults({})
    } finally {
      setLoading(false)
    }
  }, [manifest])

  const handleResultChange = useCallback((id: string, updated: CriterionResult) => {
    setResults((prev) => ({ ...prev, [id]: updated }))
  }, [])

  const handleExport = useCallback(() => {
    const primaryRubricId = preloaded?.primaryRubricId ?? selectedEntry?.rubric_id ?? 'unknown'
    const yaml = exportEvaluation(meta, primaryRubricId, dimensions, results)
    const filename = meta.title
      ? `${meta.title.replace(/\s+/g, '-').toLowerCase()}.evaluation.yaml`
      : 'evaluation.yaml'
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setToast('Evaluation exported')
  }, [meta, preloaded, selectedEntry, dimensions, results])

  const hasCriteria = dimensions.length > 0
  const displayRubricId = preloaded?.primaryRubricId ?? selectedEntry?.rubric_id
  const displayTitle = preloaded?.primaryTitle ?? selectedEntry?.title ?? selectedEntry?.artifact_type

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ 
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
          boxShadow: 'none',
          flexShrink: 0 
        }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="Back to home">
            <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            {meta.title || 'Assess Artifact'}
          </Typography>
          {displayRubricId && (
            <Chip
              label={displayRubricId}
              size="small"
              sx={{ bgcolor: 'action.selected', color: 'text.primary', fontSize: '0.68rem', height: 20 }}
            />
          )}
          {displayTitle && displayTitle !== displayRubricId && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {displayTitle}
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {hasCriteria && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleExport}
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
                textTransform: 'none',
                fontWeight: 400,
              }}
            >
              Export YAML
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <QuickTipBanner
        tipKey="assessment-form"
        message="RULERS protocol: extract evidence before scoring. Cite sections, quotes, or diagrams. 'The artifact seems to address this' is not evidence. Or use earos-assess in your AI agent."
      />

      {/* Main scrollable area */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
        {/* Setup panel — only shown when NOT pre-loaded via the wizard */}
        {!preloaded && (
          <SetupPanel
            manifest={manifest}
            selectedPath={selectedPath}
            onSelectPath={handleSelectRubric}
            meta={meta}
            onMetaChange={setMeta}
            loading={loading}
            loadError={loadError}
          />
        )}

        {/* Criteria */}
        {!hasCriteria && <EmptyState />}

        {hasCriteria && dimensions.map((dim) => (
          <DimensionSection
            key={dim.id}
            dim={dim}
            results={results}
            onChange={handleResultChange}
          />
        ))}

        <Box sx={{ height: 16 }} />
      </Box>

      {/* Sticky summary bar */}
      {hasCriteria && (
        <AssessmentSummary
          dimensions={dimensions}
          results={results}
          onExport={handleExport}
        />
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  )
}
