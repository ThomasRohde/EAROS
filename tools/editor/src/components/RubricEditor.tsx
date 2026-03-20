import { useState, useCallback, useEffect } from 'react'
import { JsonForms } from '@jsonforms/react'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Chip,
  Snackbar,
  IconButton,
  Button,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import QuickTipBanner from './QuickTipBanner'
import type { Kind } from './KindSelector'
import YamlPreview from './YamlPreview'
import FileControls from './FileControls'
import StatusBar from './StatusBar'
import { toJson, toYaml } from '../utils/yaml'
import { validateData } from '../utils/validate'
import type { ValidationResult } from '../utils/validate'
import type { ManifestData, ManifestEntry } from '../manifest'
import { fetchRepoFile, saveRepoFile } from '../manifest'
import { loadSchema } from '../utils/schemaLoader'


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

// ─── Manifest Sidebar ──────────────────────────────────────────────────────────

interface SidebarSection {
  label: string
  entries: ManifestEntry[]
}

function ManifestSidebar({
  manifest,
  currentFile,
  onSelect,
}: {
  manifest: ManifestData | null
  currentFile: string | null
  onSelect: (entry: ManifestEntry) => void
}) {
  if (!manifest) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
          EAROS Files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Start the dev server to browse repo files.
        </Typography>
      </Box>
    )
  }

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
              bgcolor: 'background.paper',
              color: 'text.secondary',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {section.label}
          </ListSubheader>
          {section.entries.length === 0 && (
            <ListItemText
              primary="(none)"
              sx={{ px: 2, py: 0.5, color: 'text.disabled', fontSize: '0.75rem' }}
            />
          )}
          {section.entries.map((entry) => {
            const filename = entry.path.split('/').pop() ?? entry.path
            const isSelected = currentFile === entry.path
            return (
              <ListItemButton
                key={entry.path}
                selected={isSelected}
                onClick={() => onSelect(entry)}
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
                    sx: { fontSize: '0.68rem', color: 'text.disabled' },
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

// ─── File Info Bar ─────────────────────────────────────────────────────────────

function FileInfoBar({
  data,
  currentFile,
  currentEntry,
  onSave,
}: {
  data: object
  currentFile: string | null
  currentEntry: ManifestEntry | null
  onSave: () => void
}) {
  const d = data as any
  const filename = currentFile ? currentFile.split('/').pop() : null
  const rubricId = d.rubric_id ?? d.artifact_id ?? null
  const version = d.version ?? d.rubric_version ?? null
  const artifactType = currentEntry?.artifact_type ?? d.artifact_type ?? null
  const kindLabel = d.kind ?? null
  const chipSx = { height: 18, fontSize: '0.65rem', '.MuiChip-label': { px: 0.75 } }

  return (
    <Box
      sx={{
        px: 2,
        py: 0.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        minHeight: 30,
        flexShrink: 0,
      }}
    >
      {filename ? (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.primary' }}>
            {filename}
          </Typography>
          {kindLabel && (
            <Chip label={kindLabel} size="small" sx={{ ...chipSx, bgcolor: 'action.selected', color: 'text.primary' }} />
          )}
          {rubricId && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {rubricId}
            </Typography>
          )}
          {version && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
              v{version}
            </Typography>
          )}
          {artifactType && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
              · {artifactType}
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={`Save to ${currentFile}`}>
            <IconButton size="small" onClick={onSave} sx={{ color: 'primary.main', p: 0.25 }}>
              <SaveIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem', fontStyle: 'italic' }}>
            unsaved
          </Typography>
          {kindLabel && (
            <Chip label={kindLabel} size="small" sx={{ ...chipSx, bgcolor: 'action.disabledBackground', color: 'text.disabled' }} />
          )}
          <Box sx={{ flexGrow: 1 }} />
        </>
      )}
    </Box>
  )
}

// ─── RubricEditor ─────────────────────────────────────────────────────────────

interface Props {
  manifest: ManifestData | null
  onBack: () => void
  autoNew?: boolean
}

export default function RubricEditor({ manifest, onBack, autoNew = false }: Props) {
  const [kind, setKind] = useState<Kind>('profile')
  const [data, setData] = useState<object>(INITIAL.profile)
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [] })
  const [toast, setToast] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [currentEntry, setCurrentEntry] = useState<ManifestEntry | null>(null)
  const [newDialogOpen, setNewDialogOpen] = useState(autoNew)
  const [dialogKind, setDialogKind] = useState<Kind>('profile')
  const [rubricSchema, setRubricSchema] = useState<Record<string, unknown> | null>(null)
  const [evalSchema, setEvalSchema] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    loadSchema('rubric').then((s) => { if (s) setRubricSchema(s) })
    loadSchema('evaluation').then((s) => { if (s) setEvalSchema(s) })
  }, [])

  useEffect(() => {
    const schema = kind === 'evaluation' ? evalSchema : rubricSchema
    if (!schema) return
    setValidation(validateData(data, schema))
  }, [data, kind, rubricSchema, evalSchema])

  const handleNew = useCallback(() => {
    setNewDialogOpen(true)
  }, [])

  const handleNewConfirm = useCallback(() => {
    setKind(dialogKind)
    setData(INITIAL[dialogKind])
    setCurrentFile(null)
    setCurrentEntry(null)
    setNewDialogOpen(false)
    setToast(`New ${dialogKind}`)
  }, [dialogKind])

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
        setCurrentEntry(null)
        setToast('File imported')
      } catch (e) {
        setToast(`Import failed: ${(e as Error).message}`)
      }
    },
    [kind],
  )

  const loadFromRepo = useCallback(async (entry: ManifestEntry) => {
    const fileData = await fetchRepoFile(entry.path) as any
    if (!fileData) {
      setToast('Failed to load file from repo')
      return
    }
    const k: Kind = fileData?.kind ?? kind
    if (['core_rubric', 'profile', 'overlay', 'evaluation'].includes(k)) {
      setKind(k)
    }
    setData(fileData ?? {})
    setCurrentFile(entry.path)
    setCurrentEntry(entry)
    setToast(`Loaded ${entry.path.split('/').pop()}`)
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

  const toolbarBtnSx = {
    color: 'text.primary',
    borderColor: 'divider',
    '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
    textTransform: 'none' as const,
    fontWeight: 400,
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ 
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
          boxShadow: 'none'
        }}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <Tooltip title="Back to home">
            <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5, mr: 0.5 }}>
            Edit Rubric
          </Typography>
          <Tooltip title="New rubric from template">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNew}
              sx={toolbarBtnSx}
            >
              New
            </Button>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <FileControls onImport={loadYaml} onExport={handleExport} />
          <Tooltip title={previewOpen ? 'Hide YAML preview' : 'Show YAML preview'}>
            <IconButton
              size="small"
              onClick={() => setPreviewOpen((v) => !v)}
              sx={{ color: previewOpen ? 'primary.main' : 'text.disabled' }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <FileInfoBar
        data={data}
        currentFile={currentFile}
        currentEntry={currentEntry}
        onSave={saveToRepo}
      />

      <QuickTipBanner
        tipKey={autoNew ? 'create-rubric' : 'edit-rubric'}
        message={
          autoNew
            ? 'Every criterion needs: scoring guide (all 5 levels), examples (good + bad), decision tree, anti-patterns, and remediation hints. Or use earos-create in your AI agent.'
            : 'Use the YAML preview panel to check your changes. The editor validates against the schema in real-time. Or use earos-profile-author in your AI agent for YAML authoring help.'
        }
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 1, gap: 1 }}>
        {/* Manifest sidebar */}
        <Paper
          sx={{
            width: 220,
            flexShrink: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ManifestSidebar
            manifest={manifest}
            currentFile={currentFile}
            onSelect={loadFromRepo}
          />
        </Paper>

        {/* Form panel */}
        <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <JsonForms
            schema={((kind === 'evaluation' ? evalSchema : rubricSchema) ?? {}) as any}
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

      <Dialog open={newDialogOpen} onClose={() => setNewDialogOpen(false)}>
        <DialogTitle>New Rubric</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={dialogKind}
            onChange={(e) => setDialogKind(e.target.value as Kind)}
          >
            <FormControlLabel value="core_rubric" control={<Radio />} label="Core Rubric" />
            <FormControlLabel value="profile" control={<Radio />} label="Profile" />
            <FormControlLabel value="overlay" control={<Radio />} label="Overlay" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewConfirm} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

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
