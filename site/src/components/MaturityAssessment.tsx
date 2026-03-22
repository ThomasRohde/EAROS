import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Collapse,
  useTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { sapphire } from '../theme'

interface LevelData {
  level: number
  name: string
  subtitle: string
  guide?: { label: string; to: string }
  questions: string[]
}

const LEVELS: LevelData[] = [
  {
    level: 1,
    name: 'Ad Hoc',
    subtitle: 'You are here if most answers are "no"',
    questions: [
      'Do you have a written set of criteria for architecture review?',
      'Do two reviewers produce substantially similar feedback on the same artifact?',
      'Can you explain what "good" looks like for an architecture artifact in your organization?',
    ],
  },
  {
    level: 2,
    name: 'Rubric-Based',
    subtitle: 'You have adopted a structured rubric',
    guide: { label: 'Your First Assessment', to: '/onboarding/first-assessment' },
    questions: [
      'You use a defined rubric with explicit criteria and scoring levels',
      'Every score has a cited evidence reference (not just "seems adequate")',
      'You can explain the difference between a score of 2 and 3 for any criterion',
      'You check gates before computing averages',
    ],
  },
  {
    level: 3,
    name: 'Governed',
    subtitle: 'Your team follows a calibrated, evidence-anchored process',
    guide: { label: 'Governed Review', to: '/onboarding/governed-review' },
    questions: [
      'You select profiles matched to artifact types (not just the core rubric)',
      'You apply overlays based on context (security, data governance, regulatory)',
      'Your team has completed a calibration exercise with inter-rater agreement measured',
      'Evidence is classified as observed, inferred, or external',
      'Artifact quality, architectural fitness, and governance fit are reported separately',
    ],
  },
  {
    level: 4,
    name: 'Hybrid',
    subtitle: 'AI agents augment human reviewers',
    guide: { label: 'Agent-Assisted Evaluation', to: '/onboarding/agent-assisted' },
    questions: [
      'AI agents evaluate artifacts using the full 8-step DAG evaluation flow',
      'Human and agent evaluations are compared and reconciled',
      'A challenge pass reviews the highest and lowest scores for every evaluation',
      'You track inter-rater reliability metrics between human and agent evaluators',
    ],
  },
  {
    level: 5,
    name: 'Optimized',
    subtitle: 'Architecture evaluation is continuous and automated',
    guide: { label: 'Scaling and Optimization', to: '/onboarding/scaling-optimization' },
    questions: [
      'Architecture evaluation is integrated into your CI/CD or delivery pipeline',
      'Calibration runs continuously, not just at setup time',
      'You create and maintain custom profiles for your organization\'s artifact types',
      'Executive reporting provides portfolio-level quality visibility',
      'Rubric changes follow a governed process with version bumps and re-calibration',
    ],
  },
]

const STORAGE_KEY = 'earos-maturity-assessment'

function getLevelColor(level: number, isDark: boolean) {
  switch (level) {
    case 1: return isDark ? sapphire.gray[400] : sapphire.gray[500]
    case 2: return isDark ? sapphire.green[400] : sapphire.green[500]
    case 3: return isDark ? sapphire.blue[400] : sapphire.blue[500]
    case 4: return isDark ? sapphire.yellow[300] : sapphire.yellow[500]
    case 5: return isDark ? sapphire.gold[3] : sapphire.gold[2]
    default: return isDark ? sapphire.gray[400] : sapphire.gray[500]
  }
}

function getLevelBg(level: number, isDark: boolean) {
  switch (level) {
    case 1: return isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50]
    case 2: return isDark ? 'hsl(122 39% 49% / 0.08)' : sapphire.green[50]
    case 3: return isDark ? 'hsl(216 100% 63% / 0.08)' : sapphire.blue[50]
    case 4: return isDark ? 'hsl(46 97% 65% / 0.08)' : sapphire.yellow[50]
    case 5: return isDark ? 'hsl(40 57% 62% / 0.08)' : 'hsl(40 57% 62% / 0.08)'
    default: return isDark ? 'hsl(211 19% 49% / 0.08)' : sapphire.gray[50]
  }
}

function computeLevel(checks: Record<string, boolean>): number {
  // Walk levels top-down: the highest level where ALL questions are checked
  // Level 1 is special: it's the baseline. You're at L1 if L1 questions are mostly "no"
  // For L2-5: you've reached that level if all its questions (and all below) are checked
  for (let li = LEVELS.length - 1; li >= 1; li--) {
    const allPriorComplete = LEVELS.slice(0, li + 1).every((lvl) =>
      lvl.questions.every((_, qi) => checks[`${lvl.level}-${qi}`])
    )
    if (allPriorComplete) return LEVELS[li].level
  }
  // Check if at least some L1 questions are answered yes
  const l1Checked = LEVELS[0].questions.filter((_, qi) => checks[`1-${qi}`]).length
  if (l1Checked >= 2) return 1
  return 1
}

export default function MaturityAssessment() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    // Start with all levels expanded
    const init: Record<number, boolean> = {}
    LEVELS.forEach((l) => { init[l.level] = true })
    return init
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checks))
    } catch { /* ignore */ }
  }, [checks])

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const resetAll = () => {
    setChecks({})
  }

  const currentLevel = computeLevel(checks)
  const totalChecked = Object.values(checks).filter(Boolean).length
  const totalQuestions = LEVELS.reduce((sum, l) => sum + l.questions.length, 0)
  const hasAnyChecks = totalChecked > 0

  // Find the next guide to recommend
  const nextLevel = LEVELS.find((l) => l.level === currentLevel + 1) || LEVELS.find((l) => l.level === currentLevel)

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      {/* Section heading */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 500,
          color: isDark ? '#ffffff' : sapphire.blue[900],
          mb: 1,
        }}
      >
        Where Are You Today?
      </Typography>
      <Typography
        sx={{
          color: isDark ? sapphire.gray[400] : sapphire.gray[600],
          mb: 4,
          fontSize: '0.95rem',
        }}
      >
        Check the statements that are true for your organization. The assessment determines your current maturity level.
      </Typography>

      {/* Result card */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '12px',
          bgcolor: getLevelBg(currentLevel, isDark),
          border: '1px solid',
          borderColor: isDark
            ? `${getLevelColor(currentLevel, isDark)}33`
            : `${getLevelColor(currentLevel, isDark)}22`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: getLevelColor(currentLevel, isDark),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {currentLevel}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, color: isDark ? '#ffffff' : sapphire.blue[900], fontSize: '1.05rem' }}>
                {hasAnyChecks ? `Level ${currentLevel}: ${LEVELS[currentLevel - 1].name}` : 'Start the assessment'}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}>
                {hasAnyChecks
                  ? `${totalChecked} of ${totalQuestions} practices confirmed`
                  : 'Check the statements that apply to your organization'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasAnyChecks && nextLevel?.guide && (
              <Button
                component={Link}
                to={nextLevel.guide.to}
                size="small"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.82rem',
                  bgcolor: getLevelColor(currentLevel, isDark),
                  '&:hover': { bgcolor: getLevelColor(currentLevel, isDark), filter: 'brightness(1.1)' },
                }}
              >
                {currentLevel < 5 ? `Start: ${nextLevel.guide.label}` : nextLevel.guide.label}
              </Button>
            )}
            {hasAnyChecks && (
              <Button
                size="small"
                onClick={resetAll}
                startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  color: isDark ? sapphire.gray[400] : sapphire.gray[500],
                }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>

        {/* Progress bar */}
        {hasAnyChecks && (
          <Box sx={{ mt: 2, display: 'flex', gap: '3px' }}>
            {LEVELS.map((lvl) => {
              const count = lvl.questions.length
              const checked = lvl.questions.filter((_, qi) => checks[`${lvl.level}-${qi}`]).length
              const pct = count > 0 ? checked / count : 0
              return (
                <Box
                  key={lvl.level}
                  sx={{
                    flex: count,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isDark ? 'hsla(211, 19%, 49%, 0.15)' : 'hsla(212, 63%, 12%, 0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${pct * 100}%`,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: getLevelColor(lvl.level, isDark),
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Level sections */}
      {LEVELS.map((lvl) => {
        const isExpanded = expanded[lvl.level] !== false
        const checkedCount = lvl.questions.filter((_, qi) => checks[`${lvl.level}-${qi}`]).length
        const allChecked = checkedCount === lvl.questions.length
        const levelColor = getLevelColor(lvl.level, isDark)

        return (
          <Box
            key={lvl.level}
            sx={{
              mb: 1.5,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: isDark ? 'hsla(212, 33%, 27%, 0.5)' : 'hsla(212, 63%, 12%, 0.08)',
              bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
              overflow: 'hidden',
            }}
          >
            {/* Level header */}
            <Box
              onClick={() => setExpanded((prev) => ({ ...prev, [lvl.level]: !isExpanded }))}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': {
                  bgcolor: isDark ? 'hsla(216, 100%, 63%, 0.04)' : 'hsla(218, 92%, 49%, 0.02)',
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: allChecked ? levelColor : 'transparent',
                  border: allChecked ? 'none' : `2px solid ${levelColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: allChecked ? '#ffffff' : levelColor,
                  }}
                >
                  {lvl.level}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '0.95rem', color: isDark ? '#ffffff' : sapphire.blue[900] }}>
                  {lvl.name}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}>
                  {lvl.subtitle}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  color: allChecked ? levelColor : isDark ? sapphire.gray[500] : sapphire.gray[400],
                  fontWeight: allChecked ? 600 : 400,
                  mr: 0.5,
                }}
              >
                {checkedCount}/{lvl.questions.length}
              </Typography>
              {isExpanded ? (
                <ExpandLessIcon sx={{ fontSize: 20, color: isDark ? sapphire.gray[500] : sapphire.gray[400] }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 20, color: isDark ? sapphire.gray[500] : sapphire.gray[400] }} />
              )}
            </Box>

            {/* Questions */}
            <Collapse in={isExpanded}>
              <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                {lvl.questions.map((q, qi) => {
                  const key = `${lvl.level}-${qi}`
                  return (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={!!checks[key]}
                          onChange={() => toggleCheck(key)}
                          size="small"
                          sx={{
                            color: isDark ? sapphire.gray[600] : sapphire.gray[300],
                            '&.Mui-checked': { color: levelColor },
                            p: 0.75,
                          }}
                        />
                      }
                      label={q}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mx: 0,
                        mb: 0.5,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                          color: checks[key]
                            ? isDark ? sapphire.gray[300] : sapphire.gray[700]
                            : isDark ? sapphire.gray[400] : sapphire.gray[600],
                          pt: '2px',
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Collapse>
          </Box>
        )
      })}
    </Box>
  )
}
