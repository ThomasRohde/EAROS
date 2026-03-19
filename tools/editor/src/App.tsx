import { useState, useCallback, useEffect } from 'react'
import { JsonForms } from '@jsonforms/react'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import SaveIcon from '@mui/icons-material/Save'
import KindSelector from './components/KindSelector'
import type { Kind } from './components/KindSelector'
import YamlPreview from './components/YamlPreview'
import FileControls from './components/FileControls'
import StatusBar from './components/StatusBar'
import { toJson, toYaml } from './utils/yaml'
import { validateData } from './utils/validate'
import type { ValidationResult } from './utils/validate'
import rubricSchemaRaw from './schemas/rubric.schema.json'
import evaluationSchemaRaw from './schemas/evaluation.schema.json'
import type { ManifestData, ManifestEntry } from './manifest'
import { fetchManifest, fetchRepoFile, saveRepoFile } from './manifest'

// Strip draft-2020 $schema declaration so JSON Forms' AJV doesn't reject it
function prepareSchema(s: Record<string, unknown>): Record<string, unknown> {
  const result = { ...s }
  delete result.$schema
  delete result.$id
  return result
}

const RUBRIC_SCHEMA = prepareSchema(rubricSchemaRaw as Record<string, unknown>)
const EVAL_SCHEMA = prepareSchema(evaluationSchemaRaw as Record<string, unknown>)

function schemaFor(kind: Kind) {
  return kind === 'evaluation' ? EVAL_SCHEMA : RUBRIC_SCHEMA
}

// Categorization UI schemas for tabbed navigation
const RUBRIC_UISCHEMA = {
  type: 'Categorization',
  elements: [
    {
      type: 'Category',
      label: 'Metadata',
      elements: [
        { type: 'Control', scope: '#/properties/rubric_id' },
        { type: 'Control', scope: '#/properties/version' },
        { type: 'Control', scope: '#/properties/kind' },
        { type: 'Control', scope: '#/properties/title' },
        { type: 'Control', scope: '#/properties/status' },
        { type: 'Control', scope: '#/properties/effective_date' },
        { type: 'Control', scope: '#/properties/next_review_date' },
        { type: 'Control', scope: '#/properties/owner' },
        { type: 'Control', scope: '#/properties/artifact_type' },
        { type: 'Control', scope: '#/properties/design_method' },
        { type: 'Control', scope: '#/properties/inherits' },
        { type: 'Control', scope: '#/properties/purpose' },
        { type: 'Control', scope: '#/properties/stakeholders' },
        { type: 'Control', scope: '#/properties/viewpoints' },
      ],
    },
    {
      type: 'Category',
      label: 'Dimensions & Criteria',
      elements: [
        { type: 'Control', scope: '#/properties/dimensions' },
      ],
    },
    {
      type: 'Category',
      label: 'Scoring & Outputs',
      elements: [
        { type: 'Control', scope: '#/properties/scoring' },
        { type: 'Control', scope: '#/properties/outputs' },
      ],
    },
    {
      type: 'Category',
      label: 'Agent & Calibration',
      elements: [
        { type: 'Control', scope: '#/properties/agent_evaluation' },
        { type: 'Control', scope: '#/properties/calibration' },
      ],
    },
  ],
}

const EVAL_UISCHEMA = {
  type: 'Categorization',
  elements: [
    {
      type: 'Category',
      label: 'Artifact',
      elements: [
        { type: 'Control', scope: '#/properties/kind' },
        { type: 'Control', scope: '#/properties/artifact_id' },
        { type: 'Control', scope: '#/properties/artifact_type' },
        { type: 'Control', scope: '#/properties/artifact_version' },
        { type: 'Control', scope: '#/properties/rubric_id' },
        { type: 'Control', scope: '#/properties/rubric_version' },
        { type: 'Control', scope: '#/properties/profiles_applied' },
        { type: 'Control', scope: '#/properties/overlays_applied' },
      ],
    },
    {
      type: 'Category',
      label: 'Evaluation',
      elements: [
        { type: 'Control', scope: '#/properties/evaluation_mode' },
        { type: 'Control', scope: '#/properties/evaluation_date' },
        { type: 'Control', scope: '#/properties/evaluated_by' },
        { type: 'Control', scope: '#/properties/dag_execution' },
      ],
    },
    {
      type: 'Category',
      label: 'Criterion Results',
      elements: [
        { type: 'Control', scope: '#/properties/criterion_results' },
        { type: 'Control', scope: '#/properties/dimension_results' },
        { type: 'Control', scope: '#/properties/gate_failures' },
      ],
    },
    {
      type: 'Category',
      label: 'Overall',
      elements: [
        { type: 'Control', scope: '#/properties/overall_status' },
        { type: 'Control', scope: '#/properties/overall_score' },
        { type: 'Control', scope: '#/properties/confidence' },
        { type: 'Control', scope: '#/properties/decision_summary' },
        { type: 'Control', scope: '#/properties/evidence_gaps' },
        { type: 'Control', scope: '#/properties/recommended_actions' },
        { type: 'Control', scope: '#/properties/challenger_notes' },
      ],
    },
  ],
}

function uischemaFor(kind: Kind) {
  return kind === 'evaluation' ? EVAL_UISCHEMA : RUBRIC_UISCHEMA
}

const INITIAL: Record<Kind, object> = {
  core_rubric: {
    kind: 'core_rubric',
    rubric_id: 'EAROS-CORE-001',
    version: '1.0.0',
    title: '',
    artifact_type: 'any',
    dimensions: [],
    scoring: {
      scale: '0-4 ordinal plus N/A',
      method: 'gates_first_then_weighted_average',
      thresholds: { pass: 'overall >= 3.2', conditional_pass: 'overall 2.4–3.19', rework_required: 'overall < 2.4', reject: 'any critical gate failure' },
    },
    outputs: { require_evidence_refs: true, require_confidence: true, require_actions: true },
  },
  profile: {
    kind: 'profile',
    rubric_id: 'EAROS-PROF-001',
    version: '1.0.0',
    title: '',
    artifact_type: '',
    inherits: ['EAROS-CORE-002'],
    dimensions: [],
    scoring: {
      scale: '0-4 ordinal plus N/A',
      method: 'gates_first_then_weighted_average',
      thresholds: { pass: 'overall >= 3.2', conditional_pass: 'overall 2.4–3.19', rework_required: 'overall < 2.4', reject: 'any critical gate failure' },
    },
    outputs: { require_evidence_refs: true, require_confidence: true, require_actions: true },
  },
  overlay: {
    kind: 'overlay',
    rubric_id: 'EAROS-OVR-001',
    version: '1.0.0',
    title: '',
    artifact_type: 'any',
    dimensions: [],
    scoring: {
      scale: '0-4 ordinal plus N/A',
      method: 'append_to_base_rubric',
      thresholds: {},
    },
    outputs: { require_evidence_refs: true, require_confidence: true, require_actions: true },
  },
  evaluation: {
    kind: 'evaluation',
    artifact_id: '',
    artifact_type: '',
    rubric_id: '',
    rubric_version: '1.0.0',
    evaluated_by: [{ role: 'evaluator', actor: 'human' }],
    evaluation_mode: 'human',
    evaluation_date: new Date().toISOString().slice(0, 10),
    criterion_results: [],
    overall_status: 'rework_required',
    overall_score: 0,
  },
}

// ─── Manifest Sidebar ─────────────────────────────────────────────────────────

interface SidebarSection {
  label: string
  entries: ManifestEntry[]
}

function ManifestSidebar({
  manifest,
  currentFile,
  onSelect,
}: {
  manifest: ManifestData
  currentFile: string | null
  onSelect: (path: string) => void
}) {
  const sections: SidebarSection[] = [
    { label: 'Core', entries: manifest.core ?? [] },
    { label: 'Profiles', entries: manifest.profiles ?? [] },
    { label: 'Overlays', entries: manifest.overlays ?? [] },
  ]

  return (
    <List dense disablePadding sx={{ width: '100%' }}>
      {sections.map((section, si) => (
        <Box key={section.label}>
          {si > 0 && <Divider />}
          <ListSubheader
            sx={{
              lineHeight: '28px',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              bgcolor: '#f5f5f5',
              color: '#555',
            }}
          >
            {section.label}
          </ListSubheader>
          {section.entries.length === 0 && (
            <ListItemText
              primary="(none)"
              sx={{ px: 2, py: 0.5, color: '#999', fontSize: '0.75rem' }}
            />
          )}
          {section.entries.map((entry) => {
            const filename = entry.path.split('/').pop() ?? entry.path
            const isSelected = currentFile === entry.path
            return (
              <ListItemButton
                key={entry.path}
                selected={isSelected}
                onClick={() => onSelect(entry.path)}
                sx={{ py: 0.25, px: 1.5 }}
              >
                <ListItemText
                  primary={filename}
                  secondary={entry.rubric_id}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontSize: '0.8rem', fontWeight: isSelected ? 600 : 400 },
                  }}
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.68rem', color: '#888' },
                  }}
                />
              </ListItemButton>
            )
          })}
        </Box>
      ))}
    </List>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [kind, setKind] = useState<Kind>('profile')
  const [data, setData] = useState<object>(INITIAL.profile)
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [] })
  const [toast, setToast] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [manifest, setManifest] = useState<ManifestData | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)

  useEffect(() => {
    setValidation(validateData(data, schemaFor(kind)))
  }, [data, kind])

  // Load manifest from dev-server API on mount
  useEffect(() => {
    fetchManifest().then((m) => {
      if (m) {
        setManifest(m)
        setSidebarOpen(true)
      }
    })
  }, [])

  const handleKindChange = useCallback((k: Kind) => {
    setKind(k)
    setData(INITIAL[k])
    setCurrentFile(null)
  }, [])

  const loadYaml = useCallback(
    (content: string) => {
      try {
        const parsed = toJson(content) as any
        const k: Kind = parsed?.kind ?? kind
        if (['core_rubric', 'profile', 'overlay', 'evaluation'].includes(k)) {
          setKind(k)
        }
        setData(parsed ?? {})
        setCurrentFile(null)
        setToast('File imported')
      } catch (e) {
        setToast(`Import failed: ${(e as Error).message}`)
      }
    },
    [kind],
  )

  const loadFromRepo = useCallback(async (filePath: string) => {
    const fileData = await fetchRepoFile(filePath) as any
    if (!fileData) {
      setToast('Failed to load file from repo')
      return
    }
    const k: Kind = fileData?.kind ?? kind
    if (['core_rubric', 'profile', 'overlay', 'evaluation'].includes(k)) {
      setKind(k)
    }
    setData(fileData ?? {})
    setCurrentFile(filePath)
    setToast(`Loaded ${filePath.split('/').pop()}`)
  }, [kind])

  const saveToRepo = useCallback(async () => {
    if (!currentFile) return
    const ok = await saveRepoFile(currentFile, data)
    setToast(ok ? `Saved → ${currentFile.split('/').pop()}` : 'Save failed')
  }, [currentFile, data])

  const handleExport = useCallback(() => {
    const filename =
      (data as any).rubric_id ??
      (data as any).artifact_id ??
      kind
    const content = toYaml(data)
    const blob = new Blob([content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.yaml`
    a.click()
    URL.revokeObjectURL(url)
    setToast('Exported')
  }, [data, kind])

  // Drag-and-drop on the form panel
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => loadYaml(ev.target?.result as string)
      reader.readAsText(file)
    },
    [loadYaml],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar variant="dense" sx={{ gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            EAROS Editor
          </Typography>
          <KindSelector kind={kind} onChange={handleKindChange} />
          <Box sx={{ flexGrow: 1 }} />
          <FileControls onImport={loadYaml} onExport={handleExport} />
          {currentFile && (
            <Tooltip title={`Save to repo: ${currentFile}`}>
              <IconButton size="small" onClick={saveToRepo} sx={{ color: 'rgba(255,255,255,0.85)' }}>
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={sidebarOpen ? 'Hide file browser' : 'Browse repo files'}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen((v) => !v)}
              sx={{ color: sidebarOpen ? 'white' : 'rgba(255,255,255,0.5)' }}
            >
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={previewOpen ? 'Hide YAML preview' : 'Show YAML preview'}>
            <IconButton
              size="small"
              onClick={() => setPreviewOpen((v) => !v)}
              sx={{ color: previewOpen ? 'white' : 'rgba(255,255,255,0.5)' }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 1, gap: 1 }}>
        {/* Manifest sidebar */}
        {sidebarOpen && (
          <Paper
            sx={{
              width: 220,
              flexShrink: 0,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {manifest ? (
              <ManifestSidebar
                manifest={manifest}
                currentFile={currentFile}
                onSelect={loadFromRepo}
              />
            ) : (
              <Box sx={{ p: 2, color: '#999', fontSize: '0.8rem' }}>
                <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                  EAROS Files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  API unavailable. Start the dev server to browse repo files.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Form panel */}
        <Paper
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            outline: dragOver ? '2px dashed #1a237e' : 'none',
            transition: 'outline 0.1s',
          }}
        >
          {dragOver && (
            <Alert severity="info" sx={{ mb: 1 }}>
              Drop YAML file to import
            </Alert>
          )}
          <JsonForms
            schema={schemaFor(kind) as any}
            uischema={uischemaFor(kind) as any}
            data={data}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={({ data: d }) => { if (d !== undefined) setData(d) }}
          />
        </Paper>

        {/* YAML preview panel */}
        {previewOpen && (
          <Box sx={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <YamlPreview data={data} open={previewOpen} onToggle={() => setPreviewOpen(false)} />
          </Box>
        )}
      </Box>

      <StatusBar validation={validation} kind={kind} />

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
