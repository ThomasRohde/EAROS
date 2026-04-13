import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
  CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CodeIcon from '@mui/icons-material/Code'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import ArticleIcon from '@mui/icons-material/Article'
import DescriptionIcon from '@mui/icons-material/Description'
import { customRenderers } from '../renderers'
import QuickTipBanner from './QuickTipBanner'
import YamlPreviewPane from './YamlPreviewPane'
import StatusBar from './StatusBar'
import { toJson, toYaml } from '../utils/yaml'
import { validateData } from '../utils/validate'
import type { ValidationResult } from '../utils/validate'
import ExportMenu from './ExportMenu'
import type { ExportOption } from './ExportMenu'
import { exportArtifactToMarkdown, downloadAsFile } from '../utils/export-markdown'
import { saveRepoFile } from '../manifest'
import {
  ARTIFACT_TYPE_TO_SCHEMA,
  loadArtifactSchema,
  loadArtifactUiSchema,
  SUPPORTED_ARTIFACT_TYPES,
  type ArtifactType,
} from '../utils/schemaLoader'
import {
  extractMermaidDiagrams,
  inlineLocalMermaidImagesInSource,
  inlineLocalMermaidImagesInSvg,
  rasterizeSvgToPng,
  renderMermaidSvg,
} from '../utils/mermaid'
import type { RenderedDiagramPng } from '../utils/mermaid'

const allRenderers = [...materialRenderers, ...customRenderers]

// Paper wrapping <JsonForms> — the selector rewrites the Typography h6 that
// material-renderers uses for every auto-generated object label (nested
// objects, Labels, array toolbars) into a compact uppercase overline, so
// nested sections stop shouting while the user is editing.
export const compactFormPaperSx = {
  flex: 1,
  overflow: 'auto' as const,
  p: 2,
  '& .MuiTypography-h6': {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: 'text.secondary',
    lineHeight: 1.4,
    mb: 0.75,
    pb: 0.5,
    borderBottom: (theme: any) => `1px solid ${theme.palette.divider}`,
  },
}

function buildInitialArtifact(artifactType: ArtifactType): Record<string, any> {
  const base: Record<string, any> = {
    kind: 'artifact',
    artifact_type: artifactType,
    metadata: {
      title: '',
      version: '1.0.0',
      status: 'draft',
      owner: '',
      purpose: '',
    },
    sections: {},
  }

  if (artifactType === 'architecture_decision_record') {
    base.metadata = {
      id: '',
      title: '',
      status: 'proposed',
      date: new Date().toISOString().slice(0, 10),
      owner: '',
      version: '1.0.0',
    }
    base.sections = {
      decision: {
        statement: '',
        scope: '',
        context: '',
        consequences: { positive: [], negative: [] },
      },
    }
  } else if (artifactType === 'solution_architecture') {
    base.sections = {
      scope: { statement: '' },
      drivers_and_principles: {},
      solution_options: { chosen_option: '', rationale: '' },
      // Seed with one empty-object placeholder so the form renders a row AND
      // AJV reports "attribute/target/architectural_mechanism required" per
      // field — actionable errors for the SOL-02 critical evidence slot.
      // An empty array would satisfy the new minItems:1 at the UI layer but
      // hide the per-field guidance from the author.
      quality_attributes: [{}],
      operational_model: {},
    }
  } else {
    base.sections = { scope: { statement: '' } }
  }

  return base
}

async function renderWordExportDiagrams(artifactData: object): Promise<Record<string, RenderedDiagramPng>> {
  const renderedDiagrams: Record<string, RenderedDiagramPng> = {}
  const diagramRefs = extractMermaidDiagrams(artifactData)

  for (const diagramRef of diagramRefs) {
    try {
      const prefix = `word-export-${diagramRef.key.replace(/[^a-z0-9]+/gi, '-')}`
      const exportSource = `%%{init: {"htmlLabels": false}}%%\n${diagramRef.source}`
      const inlinedSource = await inlineLocalMermaidImagesInSource(exportSource)
      const svg = await renderMermaidSvg(inlinedSource, prefix)
      const inlinedSvg = await inlineLocalMermaidImagesInSvg(svg, { rasterizeSvgAssets: true })
      const pngRender = await rasterizeSvgToPng(inlinedSvg)
      renderedDiagrams[diagramRef.key] = pngRender
    } catch (error) {
      console.warn(`[ArtifactEditor] Browser render failed for "${diagramRef.label}"`, error)
    }
  }

  return renderedDiagrams
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
        border: `2px dashed ${dragging ? 'hsl(32 47% 48%)' : 'hsl(45 57% 73%)'}`,
        borderRadius: 3,
        bgcolor: dragging ? 'hsl(53 100% 92%)' : 'hsl(60 9% 96%)',
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
      <NoteAddIcon sx={{ fontSize: 56, color: 'hsl(32 47% 48%)', opacity: 0.7 }} />
      <Typography variant="h6" sx={{ color: 'hsl(32 59% 28%)', fontWeight: 600 }}>
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
          bgcolor: 'hsl(32 47% 48%)',
          '&:hover': { bgcolor: 'hsl(32 59% 28%)' },
          mt: 1,
        }}
      >
        Import YAML
      </Button>
      <Alert severity="info" sx={{ maxWidth: 480, mt: 1 }}>
        Artifact files are YAML documents with <code>kind: artifact</code>. Their <code>artifact_type</code>
        selects one of the per-type schemas in <code>standard/schemas/</code> — reference architecture,
        solution architecture, or ADR.
      </Alert>
    </Box>
  )
}

// ─── Artifact Type Picker ──────────────────────────────────────────────────────

function ArtifactTypePicker({ onSelect }: { onSelect: (type: ArtifactType) => void }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 6,
        m: 1,
      }}
    >
      <NoteAddIcon sx={{ fontSize: 56, color: 'hsl(32 47% 48%)', opacity: 0.7 }} />
      <Typography variant="h5" sx={{ color: 'hsl(32 59% 28%)', fontWeight: 600 }}>
        Create a new architecture document
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 560 }}>
        Pick the artifact type you want to author. Each type loads a dedicated schema and form layout
        derived from its EaROS profile rubric.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 560 }}>
        {SUPPORTED_ARTIFACT_TYPES.map((t) => (
          <Button
            key={t.type}
            variant="outlined"
            onClick={() => onSelect(t.type)}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              p: 2,
              borderColor: 'hsl(45 57% 73%)',
              color: 'text.primary',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'hsl(32 47% 48%)',
                bgcolor: 'hsl(53 100% 92% / 0.5)',
              },
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'hsl(32 59% 28%)' }}>
                {t.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.description}
              </Typography>
            </Box>
          </Button>
        ))}
      </Box>
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
        bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'hsl(32 47% 48% / 0.08)' : 'hsl(45 57% 73% / 0.18)',
        borderBottom: (theme: any) => `1px solid ${theme.palette.divider}`,
        minHeight: 30,
        flexShrink: 0,
      }}
    >
      {filename ? (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'secondary.main' }}>
            {filename}
          </Typography>
          {artifactType && (
            <Chip label={artifactType} size="small" sx={{ ...chipSx, bgcolor: 'hsl(45 57% 73% / 0.25)', color: 'secondary.main' }} />
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
            <IconButton size="small" onClick={onSave} sx={{ color: 'secondary.main', p: 0.25 }}>
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
            <Chip label={artifactType} size="small" sx={{ ...chipSx, bgcolor: 'action.hover', color: 'text.secondary' }} />
          )}
          <Box sx={{ flexGrow: 1 }} />
        </>
      )}
    </Box>
  )
}

// ─── ArtifactEditor ────────────────────────────────────────────────────────────

type ArtifactInitialMode = 'new' | 'import'

interface Props {
  initialMode: ArtifactInitialMode
  onBack: () => void
  initialArtifactType?: ArtifactType
}

function isSupportedArtifactType(value: unknown): value is ArtifactType {
  return typeof value === 'string' && SUPPORTED_ARTIFACT_TYPES.some((t) => t.type === value)
}

export default function ArtifactEditor({ initialMode, onBack, initialArtifactType }: Props) {
  // 'new' without a pre-chosen type → show picker first.
  const [artifactType, setArtifactType] = useState<ArtifactType | null>(() => {
    if (initialArtifactType) return initialArtifactType
    return initialMode === 'import' ? null : null
  })
  // Imports start in ValidateAndShow — the document already has real content
  // so any errors should be surfaced immediately. New artifacts start with
  // ValidateAndHide so authors aren't flooded with red on an empty seed.
  const [hasInteracted, setHasInteracted] = useState(initialMode === 'import')
  // JsonForms fires a synthetic onChange on mount / when the data prop is
  // reassigned (e.g. type picker → buildInitialArtifact). That first call
  // must NOT flip hasInteracted, otherwise fresh artifacts immediately jump
  // into ValidateAndShow. Track the JSON string of the data we last pushed
  // *into* JsonForms — only flip when the new payload differs.
  const lastPushedDataJsonRef = useRef<string>('')
  const jsonFormsConfig = useMemo(
    () => ({
      showUnfocusedDescription: true,
      hideRequiredAsterisk: false,
      restrict: false,
      earosShowErrors: hasInteracted,
    }),
    [hasInteracted],
  )
  const [data, setData] = useState<object>(() =>
    artifactType ? buildInitialArtifact(artifactType) : { kind: 'artifact', metadata: {}, sections: {} },
  )
  const [hasContent, setHasContent] = useState(initialMode === 'new' && artifactType !== null)
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [] })
  const [toast, setToast] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [artifactSchema, setArtifactSchema] = useState<Record<string, unknown> | null>(null)
  const [artifactUiSchema, setArtifactUiSchema] = useState<object | null>(null)
  const [schemasLoading, setSchemasLoading] = useState(false)
  const [schemaLoadError, setSchemaLoadError] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Always clear stale per-type schemas first so the editor never renders
    // a form keyed to the previous artifact_type while the new one loads.
    setArtifactSchema(null)
    setArtifactUiSchema(null)
    setSchemaLoadError(null)
    if (!artifactType) {
      setSchemasLoading(false)
      return
    }
    let cancelled = false
    const requestedType = artifactType
    setSchemasLoading(true)
    Promise.all([loadArtifactSchema(requestedType), loadArtifactUiSchema(requestedType)])
      .then(([schema, uiSchema]) => {
        if (cancelled) return
        // Fail closed: a null on either side means the per-type schema pair
        // failed to resolve (missing file, 404, parse error). We must NOT
        // silently render an unvalidated form — the editor blocks until the
        // user retries or picks a different type.
        if (!schema || !uiSchema) {
          const missing = [!schema && 'data schema', !uiSchema && 'UI schema'].filter(Boolean).join(' and ')
          setArtifactSchema(null)
          setArtifactUiSchema(null)
          setSchemaLoadError(`Could not load ${missing} for "${requestedType}". Check that standard/schemas/${ARTIFACT_TYPE_TO_SCHEMA[requestedType] ?? requestedType}.artifact.schema.json is reachable.`)
          setSchemasLoading(false)
          return
        }
        setArtifactSchema(schema)
        setArtifactUiSchema(uiSchema as object)
        setSchemasLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[ArtifactEditor] Schema load failed for', requestedType, err)
        setArtifactSchema(null)
        setArtifactUiSchema(null)
        setSchemaLoadError(`Schema fetch failed for "${requestedType}": ${(err as Error).message ?? 'unknown error'}`)
        setSchemasLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [artifactType])

  const handleSelectType = useCallback((type: ArtifactType) => {
    const seed = buildInitialArtifact(type)
    setArtifactType(type)
    setData(seed)
    lastPushedDataJsonRef.current = JSON.stringify(seed)
    setHasContent(true)
    setHasInteracted(false)
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
      const importedType = parsed?.artifact_type
      if (!isSupportedArtifactType(importedType)) {
        setToast(
          `Unsupported artifact_type: ${importedType ?? '(missing)'}. Expected one of: ${SUPPORTED_ARTIFACT_TYPES.map((t) => t.type).join(', ')}`,
        )
        return
      }
      setArtifactType(importedType)
      setData(parsed ?? {})
      lastPushedDataJsonRef.current = JSON.stringify(parsed ?? {})
      setCurrentFile(null)
      setHasContent(true)
      setHasInteracted(true)
      setToast('Artifact imported')
    } catch (e) {
      setToast(`Import failed: ${(e as Error).message}`)
    }
  }, [])

  const saveToRepo = useCallback(async () => {
    if (!currentFile) return
    if (schemaLoadError || !artifactSchema) {
      setToast('Cannot save: schema not loaded')
      return
    }
    const ok = await saveRepoFile(currentFile, data)
    setToast(ok ? `Saved → ${currentFile.split('/').pop()}` : 'Save failed')
  }, [currentFile, data, schemaLoadError, artifactSchema])

  const handleExport = useCallback(() => {
    if (schemaLoadError || !artifactSchema) {
      setToast('Cannot export: schema not loaded')
      return
    }
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
  }, [data, schemaLoadError, artifactSchema])

  const handleExportWord = useCallback(async () => {
    if (schemaLoadError || !artifactSchema) {
      setToast('Cannot export: schema not loaded')
      return
    }
    try {
      const renderedDiagrams = await renderWordExportDiagrams(data)
      const resp = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactData: data, renderedDiagrams }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }))
        setToast(`Word export failed: ${err.error ?? resp.statusText}`)
        return
      }
      const blob = await resp.blob()
      const d = data as any
      const filename = d.metadata?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'artifact'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.docx`
      a.click()
      URL.revokeObjectURL(url)
      setToast('Word document exported')
    } catch (e) {
      setToast(`Word export failed: ${(e as Error).message}`)
    }
  }, [data, schemaLoadError, artifactSchema])

  const handleExportMarkdown = useCallback(() => {
    if (schemaLoadError || !artifactSchema) {
      setToast('Cannot export: schema not loaded')
      return
    }
    const d = data as any
    const filename = d.metadata?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'artifact'
    const md = exportArtifactToMarkdown(data)
    downloadAsFile(md, `${filename}.md`, 'text/markdown')
    setToast('Markdown exported')
  }, [data, schemaLoadError, artifactSchema])

  const exportOptions: ExportOption[] = [
    { key: 'yaml', label: 'YAML', icon: <DownloadIcon fontSize="small" />, onClick: handleExport },
    { key: 'word', label: 'Word (.docx)', icon: <ArticleIcon fontSize="small" />, onClick: handleExportWord },
    { key: 'markdown', label: 'Markdown (.md)', icon: <DescriptionIcon fontSize="small" />, onClick: handleExportMarkdown },
  ]

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
    color: 'text.primary',
    borderColor: 'divider',
    '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
    textTransform: 'none' as const,
    fontWeight: 500,
  }

  const title = initialMode === 'new' ? 'Create Artifact' : 'Edit Artifact'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'hsl(213 48% 17%)' : '#ffffff', borderBottom: (theme) => `1px solid ${theme.palette.divider}`, color: 'text.primary', boxShadow: 'none' }}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <Tooltip title="Back to home">
            <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 0.5 }}>
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
              <ExportMenu options={exportOptions} buttonSx={{ ...toolbarBtnSx, mr: 0.5 }} />
              <Tooltip title={previewOpen ? 'Hide YAML preview' : 'Show YAML preview'}>
                <IconButton
                  size="small"
                  onClick={() => setPreviewOpen((v) => !v)}
                  sx={{ color: previewOpen ? 'primary.main' : 'text.disabled' }}
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
        tipKey={initialMode === 'new' ? 'create-artifact' : 'edit-artifact'}
        message={
          initialMode === 'new'
            ? 'Each section maps to an EaROS criterion. The more sections you complete thoroughly, the higher your assessment score. Or use earos-artifact-gen in your AI agent.'
            : 'Check the EaROS assessment mapping — each section supports specific criteria. Use earos-remediate in your AI agent to get a prioritized fix list from an evaluation record.'
        }
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 1, gap: 1 }}>
        {hasContent && artifactType ? (
          <>
            {/* Form panel */}
            <Paper sx={compactFormPaperSx}>
              {schemasLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 2 }}>
                  <CircularProgress size={24} sx={{ color: 'secondary.main' }} />
                  <Typography variant="body2" color="text.secondary">Loading schemas…</Typography>
                </Box>
              ) : schemaLoadError || !artifactSchema || !artifactUiSchema ? (
                // Fail-closed: without a validated schema pair the editor will
                // not render an unvalidated form. Export/save are also blocked.
                <Alert severity="error" sx={{ m: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Schema unavailable — editor is locked
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {schemaLoadError ?? `No schema loaded for "${artifactType}".`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fix the schema source and reload the page, or pick a different artifact type.
                  </Typography>
                </Alert>
              ) : (
                <JsonForms
                  schema={artifactSchema as any}
                  uischema={artifactUiSchema as any}
                  data={data}
                  renderers={allRenderers}
                  cells={materialCells}
                  config={jsonFormsConfig}
                  validationMode={hasInteracted ? 'ValidateAndShow' : 'ValidateAndHide'}
                  additionalErrors={[]}
                  onChange={({ data: d }) => {
                    if (d === undefined) return
                    setData(d)
                    if (!hasInteracted) {
                      const incoming = JSON.stringify(d)
                      if (incoming !== lastPushedDataJsonRef.current) {
                        lastPushedDataJsonRef.current = incoming
                        setHasInteracted(true)
                      }
                    }
                  }}
                />
              )}
            </Paper>

            {/* YAML preview panel */}
            <YamlPreviewPane
              data={data}
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              storageKey="earos-artifact-preview-width"
            />
          </>
        ) : initialMode === 'new' ? (
          <ArtifactTypePicker onSelect={handleSelectType} />
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
