import { useState, useCallback, useEffect, useRef } from 'react'
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
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import QuickTipBanner from './QuickTipBanner'
import YamlPreview from './YamlPreview'
import StatusBar from './StatusBar'
import { toJson, toYaml } from '../utils/yaml'
import { validateData } from '../utils/validate'
import type { ValidationResult } from '../utils/validate'
import { saveRepoFile } from '../manifest'
import { loadSchema } from '../utils/schemaLoader'

const ARTIFACT_UISCHEMA = {
  type: 'Categorization',
  elements: [
    {
      type: 'Category',
      label: 'Metadata',
      elements: [
        { type: 'Control', scope: '#/properties/kind' },
        { type: 'Control', scope: '#/properties/artifact_type' },
        { type: 'Control', scope: '#/properties/metadata' },
      ],
    },
    {
      type: 'Category',
      label: 'Sections',
      elements: [
        { type: 'Control', scope: '#/properties/sections' },
      ],
    },
  ],
}

const INITIAL_ARTIFACT = {
  kind: 'artifact',
  artifact_type: 'reference_architecture',
  metadata: {
    title: '',
    version: '1.0.0',
    status: 'draft',
    owner: '',
    purpose: '',
  },
  sections: {},
}

// ─── Import Drop Zone ──────────────────────────────────────────────────────────

function ImportDropZone({ onImport }: { onImport: (content: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => onImport(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        border: `2px dashed ${dragging ? '#f57c00' : '#ffcc80'}`,
        borderRadius: 3,
        bgcolor: dragging ? '#fff8e1' : '#fffde7',
        transition: 'all 0.2s',
        p: 6,
        m: 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <NoteAddIcon sx={{ fontSize: 56, color: '#ffb300', opacity: 0.7 }} />
      <Typography variant="h6" sx={{ color: '#e65100', fontWeight: 600 }}>
        Open an architecture document
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
        Drag and drop a YAML artifact file here, or click Import to browse for one.
      </Typography>
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
        sx={{
          bgcolor: '#f57c00',
          '&:hover': { bgcolor: '#e65100' },
          mt: 1,
        }}
      >
        Import YAML
      </Button>
      <Alert severity="info" sx={{ maxWidth: 480, mt: 1 }}>
        Artifact files are YAML documents with <code>kind: artifact</code>. They follow the
        artifact.schema.json structure derived from EAROS rubric required_evidence fields.
      </Alert>
    </Box>
  )
}

// ─── File Info Bar ─────────────────────────────────────────────────────────────

function ArtifactInfoBar({
  data,
  currentFile,
  onSave,
}: {
  data: object
  currentFile: string | null
  onSave: () => void
}) {
  const d = data as any
  const filename = currentFile ? currentFile.split('/').pop() : null
  const title = d.metadata?.title ?? null
  const version = d.metadata?.version ?? null
  const status = d.metadata?.status ?? null
  const artifactType = d.artifact_type ?? null
  const chipSx = { height: 18, fontSize: '0.65rem', '.MuiChip-label': { px: 0.75 } }

  return (
    <Box
      sx={{
        px: 2,
        py: 0.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#fff3e0',
        borderBottom: '1px solid #ffcc80',
        minHeight: 30,
        flexShrink: 0,
      }}
    >
      {filename ? (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#e65100' }}>
            {filename}
          </Typography>
          {artifactType && (
            <Chip label={artifactType} size="small" sx={{ ...chipSx, bgcolor: '#ffe0b2', color: '#e65100' }} />
          )}
          {title && (
            <Typography variant="caption" sx={{ color: '#444', fontSize: '0.72rem' }}>
              {title}
            </Typography>
          )}
          {version && (
            <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
              v{version}
            </Typography>
          )}
          {status && (
            <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
              · {status}
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={`Save to ${currentFile}`}>
            <IconButton size="small" onClick={onSave} sx={{ color: '#e65100', p: 0.25 }}>
              <SaveIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem', fontStyle: 'italic' }}>
            unsaved
          </Typography>
          {artifactType && (
            <Chip label={artifactType} size="small" sx={{ ...chipSx, bgcolor: '#e0e0e0', color: '#666' }} />
          )}
          <Box sx={{ flexGrow: 1 }} />
        </>
      )}
    </Box>
  )
}

// ─── ArtifactEditor ────────────────────────────────────────────────────────────

export type ArtifactInitialMode = 'new' | 'import'

interface Props {
  initialMode: ArtifactInitialMode
  onBack: () => void
}

export default function ArtifactEditor({ initialMode, onBack }: Props) {
  const [data, setData] = useState<object>(INITIAL_ARTIFACT)
  const [hasContent, setHasContent] = useState(initialMode === 'new')
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [] })
  const [toast, setToast] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [artifactSchema, setArtifactSchema] = useState<Record<string, unknown> | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSchema('artifact').then((s) => { if (s) setArtifactSchema(s) })
  }, [])

  useEffect(() => {
    if (!artifactSchema) return
    setValidation(validateData(data, artifactSchema))
  }, [data, artifactSchema])

  const loadYaml = useCallback((content: string) => {
    try {
      const parsed = toJson(content) as any
      if (parsed?.kind !== 'artifact') {
        setToast('Not an artifact file — expected kind: artifact')
        return
      }
      setData(parsed ?? {})
      setCurrentFile(null)
      setHasContent(true)
      setToast('Artifact imported')
    } catch (e) {
      setToast(`Import failed: ${(e as Error).message}`)
    }
  }, [])

  const saveToRepo = useCallback(async () => {
    if (!currentFile) return
    const ok = await saveRepoFile(currentFile, data)
    setToast(ok ? `Saved → ${currentFile.split('/').pop()}` : 'Save failed')
  }, [currentFile, data])

  const handleExport = useCallback(() => {
    const d = data as any
    const filename = d.metadata?.title?.replace(/\s+/g, '-').toLowerCase() ?? 'artifact'
    const content = toYaml(data)
    const blob = new Blob([content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.artifact.yaml`
    a.click()
    URL.revokeObjectURL(url)
    setToast('Exported')
  }, [data])

  const handleImportClick = () => importRef.current?.click()

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => loadYaml(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  const toolbarBtnSx = {
    color: 'white',
    borderColor: 'rgba(255,255,255,0.4)',
    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
    textTransform: 'none' as const,
    fontWeight: 400,
  }

  const title = initialMode === 'new' ? 'Create Artifact' : 'Edit Artifact'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#e65100' }}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <Tooltip title="Back to home">
            <IconButton size="small" onClick={onBack} sx={{ color: 'rgba(255,255,255,0.8)', mr: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5, mr: 0.5 }}>
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <input
            ref={importRef}
            type="file"
            accept=".yaml,.yml"
            style={{ display: 'none' }}
            onChange={handleImportChange}
          />
          <Tooltip title="Import a YAML artifact file">
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={handleImportClick}
              sx={toolbarBtnSx}
            >
              Import
            </Button>
          </Tooltip>
          {hasContent && (
            <>
              <Tooltip title="Export as YAML">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{ ...toolbarBtnSx, mr: 0.5 }}
                >
                  Export
                </Button>
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
            </>
          )}
        </Toolbar>
      </AppBar>

      <ArtifactInfoBar data={data} currentFile={currentFile} onSave={saveToRepo} />

      <QuickTipBanner
        tipKey="artifact-editor"
        message="Each section maps to an EAROS criterion. Fill them all to maximize your assessment score."
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 1, gap: 1 }}>
        {hasContent ? (
          <>
            {/* Form panel */}
            <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <JsonForms
                schema={(artifactSchema ?? {}) as any}
                uischema={ARTIFACT_UISCHEMA as any}
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
          </>
        ) : (
          <ImportDropZone onImport={loadYaml} />
        )}
      </Box>

      <StatusBar validation={validation} kind="artifact" />

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
