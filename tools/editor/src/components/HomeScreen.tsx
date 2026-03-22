import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  useTheme,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import TuneIcon from '@mui/icons-material/Tune'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import EditNoteIcon from '@mui/icons-material/EditNote'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import yaml from 'js-yaml'
import { sapphire } from '../theme'
import { STATUS_CONFIG } from './AssessmentSummary'
import type { AppMode } from '../App'
import type { LoadedEvaluation, EvaluationSummaryEntry } from '../types'
import QuickTipBanner from './QuickTipBanner'

interface Props {
  onSelectMode: (mode: AppMode) => void
  onViewAssessment?: (evaluation: LoadedEvaluation, rawYaml?: string) => void
}

interface CardDef {
  mode: AppMode
  icon: React.ReactNode
  title: string
  description: string
  subtitle: string
  colorKey: 'primary' | 'success' | 'secondary'
}

/* ─── Palette per role ────────────────────────────────────────────────────────
   These map directly to the MUI palette keys used on cards.
   primary  = blue  (Governance)
   success  = green (Reviewers)
   secondary = gold (Architects)
   ──────────────────────────────────────────────────────────────────────────── */

const ROWS: Array<{ label: string; cards: CardDef[] }> = [
  {
    label: 'For Governance Teams',
    cards: [
      {
        mode: 'create-rubric',
        icon: <AddCircleOutlineIcon sx={{ fontSize: 28 }} />,
        title: 'Create Rubric',
        description: 'Design new scoring criteria for an artifact type',
        subtitle: 'Build a new core rubric, profile, or overlay from scratch',
        colorKey: 'primary',
      },
      {
        mode: 'rubric',
        icon: <TuneIcon sx={{ fontSize: 28 }} />,
        title: 'Edit Rubric',
        description: 'Modify existing scoring criteria',
        subtitle: 'Update dimensions, criteria, and scoring guides',
        colorKey: 'primary',
      },
    ],
  },
  {
    label: 'For Reviewers',
    cards: [
      {
        mode: 'new-assessment',
        icon: <PlaylistAddCheckIcon sx={{ fontSize: 28 }} />,
        title: 'New Assessment',
        description: 'Score an architecture document',
        subtitle: 'Start a new evaluation with guided setup',
        colorKey: 'success',
      },
      {
        mode: 'continue-assessment',
        icon: <FolderOpenIcon sx={{ fontSize: 28 }} />,
        title: 'Continue Assessment',
        description: 'Resume a saved evaluation',
        subtitle: 'Open and continue an existing evaluation record',
        colorKey: 'success',
      },
    ],
  },
  {
    label: 'For Architects',
    cards: [
      {
        mode: 'new-artifact',
        icon: <NoteAddIcon sx={{ fontSize: 28 }} />,
        title: 'Create Artifact',
        description: 'Write a new architecture document',
        subtitle: 'Start from a template with built-in EaROS guidance',
        colorKey: 'secondary',
      },
      {
        mode: 'edit-artifact',
        icon: <EditNoteIcon sx={{ fontSize: 28 }} />,
        title: 'Edit Artifact',
        description: 'Improve an existing document',
        subtitle: 'Open an architecture document and see EaROS assessment guidance',
        colorKey: 'secondary',
      },
    ],
  },
]

/* ─── Accent color lookup (resolved, for icon circles) ────────────────────── */
const accentColors = (isDark: boolean) => ({
  primary: isDark ? sapphire.blue[400] : sapphire.blue[500],
  success: isDark ? sapphire.green[400] : sapphire.green[500],
  secondary: isDark ? sapphire.gold[3] : sapphire.gold[2],
})

const subtleBg = (isDark: boolean) => ({
  primary: isDark ? 'hsl(218 92% 49% / 0.12)' : sapphire.blue[50],
  success: isDark ? 'hsl(125 50% 35% / 0.12)' : sapphire.green[50],
  secondary: isDark ? 'hsl(32 47% 48% / 0.12)' : 'hsl(45 57% 73% / 0.18)',
})

export default function HomeScreen({ onSelectMode, onViewAssessment }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accents = accentColors(isDark)
  const bgs = subtleBg(isDark)

  // Fetch evaluation summaries
  const [evalSummaries, setEvalSummaries] = useState<EvaluationSummaryEntry[]>([])
  useEffect(() => {
    fetch('/api/evaluations/summary')
      .then((r) => r.json())
      .then((data) => { if (data?.summaries) setEvalSummaries(data.summaries) })
      .catch(() => {})
  }, [])

  const handleOpenEval = useCallback(async (path: string) => {
    if (!onViewAssessment) return
    try {
      const res = await fetch(`/api/file/${encodeURIComponent(path)}`)
      if (!res.ok) return
      const data = await res.json()
      onViewAssessment(data as LoadedEvaluation)
    } catch { /* ignore */ }
  }, [onViewAssessment])

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onViewAssessment) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rawYaml = reader.result as string
        const data = yaml.load(rawYaml) as LoadedEvaluation
        if (data?.criterion_results) {
          onViewAssessment(data, rawYaml)
        }
      } catch { /* ignore invalid files */ }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }, [onViewAssessment])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: isDark ? sapphire.gray[900] : sapphire.sand[50],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <QuickTipBanner
        tipKey="home"
        message="EaROS works best with AI agents. Open this project in Claude Code or Cursor to access 10 automated assessment skills — earos-assess, earos-create, earos-artifact-gen, and more."
      />

      {/* Centred content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 400,
              mb: 1,
              color: isDark ? '#ffffff' : sapphire.blue[900],
              letterSpacing: '-0.01em',
              fontSize: '2.5rem',
            }}
          >
            EaROS Editor
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: isDark ? sapphire.gray[400] : `color-mix(in srgb, ${sapphire.blue[900]} 64%, transparent)`,
              fontWeight: 400,
            }}
          >
            Enterprise Architecture Rubric Operational Standard · v2.0
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: isDark ? sapphire.gray[500] : `color-mix(in srgb, ${sapphire.blue[900]} 44%, transparent)`,
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '0.01em',
            }}
          >
            Making architecture review irresistable
          </Typography>
        </Box>

        {/* Card grid */}
        <Box sx={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {ROWS.map((row) => (
            <Box key={row.label}>
              {/* Section header */}
              <Typography
                sx={{
                  display: 'block',
                  mb: 2,
                  color: isDark ? sapphire.gray[400] : `color-mix(in srgb, ${sapphire.blue[900]} 64%, transparent)`,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                {row.label}
              </Typography>

              {/* Two-column row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {row.cards.map((card) => {
                  const accent = accents[card.colorKey]
                  const iconBg = bgs[card.colorKey]

                  return (
                    <Card
                      key={card.mode}
                      sx={{
                        bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
                        '&:hover': {
                          borderColor: isDark
                            ? `color-mix(in srgb, ${accent} 40%, transparent)`
                            : `color-mix(in srgb, ${accent} 24%, transparent)`,
                          boxShadow: isDark
                            ? `0 4px 24px hsl(212 63% 12% / 0.3)`
                            : `0px 0px 0px 1px hsl(212 63% 12% / 0.06) inset, 0px 8px 32px 0px hsl(212 63% 12% / 0.08)`,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => onSelectMode(card.mode)} sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                          {/* Icon circle */}
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: iconBg,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: accent,
                            }}
                          >
                            {card.icon}
                          </Box>

                          {/* Text */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 500,
                                color: accent,
                                mb: 0.5,
                                lineHeight: 1.3,
                                fontSize: '1.05rem',
                              }}
                            >
                              {card.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isDark ? '#ffffff' : sapphire.blue[900],
                                mb: 1,
                                lineHeight: 1.5,
                                fontWeight: 400,
                              }}
                            >
                              {card.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isDark ? sapphire.gray[400] : `color-mix(in srgb, ${sapphire.blue[900]} 52%, transparent)`,
                                lineHeight: 1.4,
                                fontSize: '0.8rem',
                              }}
                            >
                              {card.subtitle}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Completed Assessments strip ──────────────────────────────────── */}
        {onViewAssessment && (
          <Box sx={{ maxWidth: 860, width: '100%', mt: 6 }}>
            {/* Section header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                sx={{
                  color: isDark ? sapphire.gray[400] : `color-mix(in srgb, ${sapphire.blue[900]} 64%, transparent)`,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Completed Assessments
              </Typography>
              <Typography
                component="button"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? sapphire.blue[400] : sapphire.blue[500],
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <FileOpenIcon sx={{ fontSize: 16 }} />
                Open file...
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
            </Box>

            {/* Evaluation list */}
            <Card sx={{ bgcolor: isDark ? sapphire.gray[800] : '#ffffff' }}>
              {evalSummaries.length === 0 ? (
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No completed assessments found. Run an assessment or import an <code>.evaluation.yaml</code> file.
                  </Typography>
                </Box>
              ) : (
                evalSummaries.slice(0, 5).map((entry, i) => {
                  const sCfg = STATUS_CONFIG[entry.overall_status ?? ''] ?? STATUS_CONFIG.incomplete
                  return (
                    <Box
                      key={entry.path}
                      onClick={() => handleOpenEval(entry.path)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 3,
                        py: 1.5,
                        cursor: 'pointer',
                        borderBottom: i < Math.min(evalSummaries.length, 5) - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: isDark ? 'hsl(212 33% 27% / 0.3)' : 'hsl(206 33% 96%)' },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.title}
                      </Typography>
                      <Chip
                        label={sCfg.label}
                        size="small"
                        sx={{
                          bgcolor: sCfg.bg,
                          color: sCfg.color,
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 22,
                          flexShrink: 0,
                        }}
                      />
                      {entry.overall_score != null && (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem', minWidth: 32, textAlign: 'right', flexShrink: 0 }}>
                          {entry.overall_score.toFixed(1)}
                        </Typography>
                      )}
                      {entry.evaluation_date && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem', minWidth: 50, textAlign: 'right', flexShrink: 0 }}>
                          {(() => {
                            try {
                              return new Date(entry.evaluation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            } catch { return entry.evaluation_date }
                          })()}
                        </Typography>
                      )}
                    </Box>
                  )
                })
              )}
            </Card>
          </Box>
        )}

      </Box> {/* end centred content */}
    </Box>
  )
}
