import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
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
import { getLevelColor, getLevelBg, getLevelBorder } from '../utils/maturityColors'

/* ------------------------------------------------------------------ */
/*  Data types                                                        */
/* ------------------------------------------------------------------ */

interface Question {
  id: string
  text: string
  options: string[] // 4 options, index position determines score (1–4)
}

interface Dimension {
  id: string
  name: string
  description: string
  questions: Question[]
  recommendations: Record<number, string> // level → what to do next
}

/* ------------------------------------------------------------------ */
/*  Maturity levels                                                   */
/* ------------------------------------------------------------------ */

const LEVEL_NAMES: Record<number, string> = {
  1: 'Ad Hoc',
  2: 'Rubric-Based',
  3: 'Governed',
  4: 'Hybrid',
  5: 'Optimized',
}

const LEVEL_GUIDES: Record<number, { label: string; to: string }> = {
  2: { label: 'Your First Assessment', to: '/onboarding/first-assessment' },
  3: { label: 'Governed Review', to: '/onboarding/governed-review' },
  4: { label: 'Agent-Assisted Evaluation', to: '/onboarding/agent-assisted' },
  5: { label: 'Scaling & Optimization', to: '/onboarding/scaling-optimization' },
}

/* ------------------------------------------------------------------ */
/*  Assessment dimensions (5 × 3 questions = 15 diagnostic questions) */
/* ------------------------------------------------------------------ */

const DIMENSIONS: Dimension[] = [
  {
    id: 'criteria',
    name: 'Criteria & Standards',
    description: 'How well-defined are your review criteria?',
    questions: [
      {
        id: 'crit-def',
        text: 'How are your architecture review criteria defined?',
        options: [
          'Each reviewer applies their own mental model',
          'We have a shared rubric with explicit criteria and scoring levels',
          'We use artifact-specific profiles with calibrated scoring guides',
          'Criteria are machine-readable, versioned, and governed through change control',
        ],
      },
      {
        id: 'crit-lvl',
        text: 'How do you distinguish between score levels?',
        options: [
          'It\'s implicit \u2014 reviewers know quality when they see it',
          'Written level descriptors define what each score means',
          'Decision trees resolve ambiguous cases between adjacent scores',
          'Scoring guides are refined continuously based on calibration data',
        ],
      },
      {
        id: 'crit-gate',
        text: 'How do you handle criteria that can block a passing review?',
        options: [
          'No formal blocking criteria \u2014 everything is advisory',
          'Some criteria are marked as must-pass gates',
          'Gates have graded severity (advisory / major / critical) with defined effects',
          'Gate violations trigger automated workflow actions',
        ],
      },
    ],
    recommendations: {
      1: 'Start by documenting your review criteria in a shared rubric with explicit scoring levels.',
      2: 'Adopt artifact-specific profiles and add decision trees to resolve scoring ambiguity.',
      3: 'Introduce version control and governed change processes for your rubric definitions.',
      4: 'Integrate rubric governance into your CI/CD pipeline with automated validation.',
    },
  },
  {
    id: 'evidence',
    name: 'Evidence & Scoring',
    description: 'How rigorous is your evidence gathering?',
    questions: [
      {
        id: 'evid-cite',
        text: 'How do reviewers substantiate their scores?',
        options: [
          'Based on overall impression without specific citations',
          'By citing specific sections, quotes, or diagrams from the artifact',
          'Evidence is classified by type (observed / inferred / external)',
          'Evidence extraction is automated with agents identifying and classifying references',
        ],
      },
      {
        id: 'evid-persp',
        text: 'How do you distinguish document quality from architecture soundness?',
        options: [
          'They\'re treated as one thing',
          'Reviewers know they\'re different but score them together',
          'The evaluation addresses artifact quality, architectural fitness, and governance fit',
          'All three perspectives are addressed in every evaluation narrative and tracked over time',
        ],
      },
      {
        id: 'evid-na',
        text: 'What happens when a criterion doesn\'t apply?',
        options: [
          'Skip it or give a default score',
          'Mark N/A with a brief note',
          'N/A requires written justification and is excluded from score calculations',
          'N/A patterns are tracked across evaluations to refine criteria applicability',
        ],
      },
    ],
    recommendations: {
      1: 'Require reviewers to cite specific evidence for every score they assign.',
      2: 'Classify evidence as observed, inferred, or external to strengthen scoring transparency.',
      3: 'Introduce AI-assisted evidence extraction to scale evidence-anchored scoring.',
      4: 'Track evidence patterns across evaluations to continuously improve criteria relevance.',
    },
  },
  {
    id: 'process',
    name: 'Process & Governance',
    description: 'How structured is your review process?',
    questions: [
      {
        id: 'proc-trig',
        text: 'How is architecture review triggered?',
        options: [
          'Ad hoc \u2014 when someone thinks to request one',
          'At defined milestones (e.g., before major decisions or releases)',
          'Through a governed review cadence with entry and exit criteria',
          'Automatically \u2014 artifact changes trigger evaluation in CI/CD pipelines',
        ],
      },
      {
        id: 'proc-rec',
        text: 'How are review results recorded?',
        options: [
          'In meeting notes, emails, or informal documents',
          'In a structured scoring sheet or template',
          'In machine-readable evaluation records conforming to a schema',
          'Records are versioned, stored centrally, and feed portfolio reporting',
        ],
      },
      {
        id: 'proc-chg',
        text: 'How are rubric changes managed?',
        options: [
          'Criteria evolve informally based on reviewer preference',
          'Changes are discussed and agreed before adoption',
          'Rubrics are versioned (semver) with owner approval required',
          'Changes trigger automated re-calibration and impact analysis',
        ],
      },
    ],
    recommendations: {
      1: 'Establish a regular review cadence and record results in a structured template.',
      2: 'Move to schema-conformant evaluation records and version your rubrics.',
      3: 'Integrate evaluation into your delivery pipeline for automated review triggers.',
      4: 'Add automated impact analysis when rubric definitions change.',
    },
  },
  {
    id: 'people',
    name: 'People & Calibration',
    description: 'How consistent are reviews across reviewers?',
    questions: [
      {
        id: 'ppl-cons',
        text: 'How consistent are reviews across different reviewers?',
        options: [
          'We don\'t measure \u2014 results depend heavily on who reviews',
          'We\'ve compared informally and noticed reasonable consistency',
          'We run calibration exercises and measure inter-rater reliability (Cohen\u2019s \u03BA)',
          'Calibration is continuous \u2014 drift is detected and triggers re-calibration',
        ],
      },
      {
        id: 'ppl-disagree',
        text: 'How are disagreements between reviewers resolved?',
        options: [
          'The senior reviewer\'s opinion prevails',
          'Discussion until consensus is reached',
          'Resolved against the rubric\'s level descriptors and decision trees',
          'Persistent disagreements trigger rubric refinement to reduce future ambiguity',
        ],
      },
      {
        id: 'ppl-onboard',
        text: 'How do new reviewers learn to evaluate?',
        options: [
          'By shadowing experienced reviewers',
          'Using written guidance and example evaluations',
          'Through calibration exercises with reference artifacts and structured feedback',
          'Self-service onboarding with gold-standard examples and automated scoring comparison',
        ],
      },
    ],
    recommendations: {
      1: 'Run your first calibration exercise: two reviewers independently score the same artifact.',
      2: 'Measure inter-rater reliability and resolve disagreements against the rubric.',
      3: 'Introduce AI evaluators alongside human reviewers and calibrate continuously.',
      4: 'Build a self-service calibration program with automated drift detection.',
    },
  },
  {
    id: 'tooling',
    name: 'Tooling & Automation',
    description: 'What level of tooling supports your reviews?',
    questions: [
      {
        id: 'tool-plat',
        text: 'What tools support your architecture review?',
        options: [
          'Email, documents, and meetings',
          'A structured scoring spreadsheet or form',
          'A dedicated evaluation tool with schema validation',
          'An integrated platform with AI-assisted scoring and pipeline integration',
        ],
      },
      {
        id: 'tool-ai',
        text: 'How do AI agents participate in architecture review?',
        options: [
          'They don\'t participate',
          'We\'ve experimented informally with AI-assisted review',
          'AI agents evaluate using a defined protocol, with human reconciliation',
          'AI and human evaluations run in parallel with continuous calibration',
        ],
      },
      {
        id: 'tool-report',
        text: 'How do you report on architecture quality across your portfolio?',
        options: [
          'No portfolio-level visibility',
          'Manual compilation when requested',
          'Regular reports aggregate results by team, artifact type, or dimension',
          'Real-time dashboards with automated alerts on quality degradation',
        ],
      },
    ],
    recommendations: {
      1: 'Adopt a structured scoring tool \u2014 the EAROS editor or scoring spreadsheet.',
      2: 'Introduce AI agent evaluation with human reconciliation.',
      3: 'Build portfolio-level reporting with automated quality dashboards.',
      4: 'Achieve full pipeline integration with real-time quality monitoring.',
    },
  },
]

/* ------------------------------------------------------------------ */
/*  Scoring                                                           */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'earos-maturity-assessment-v2'

/**
 * Map a 1.0–4.0 dimension average to a maturity level 1–5.
 * These thresholds are informal heuristics for this self-assessment widget only —
 * they are NOT part of the EAROS standard scoring model (which uses a 0–4 ordinal
 * scale with explicit gate logic, see core/core-meta-rubric.yaml).
 */
function scoreToLevel(score: number): number {
  if (score < 1.5) return 1
  if (score < 2.5) return 2
  if (score < 3.2) return 3
  if (score < 3.7) return 4
  return 5
}


/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface DimScore {
  dim: Dimension
  answered: number
  total: number
  avg: number
  level: number
}

export default function MaturityAssessment() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  /* --- state --- */

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
    } catch { return {} }
  })

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    DIMENSIONS.forEach(d => { init[d.id] = true })
    return init
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)) }
    catch { /* quota exceeded */ }
  }, [answers])

  /* --- derived --- */

  const totalQuestions = DIMENSIONS.reduce((s, d) => s + d.questions.length, 0)
  const answeredCount = Object.keys(answers).length
  const hasAnswers = answeredCount > 0
  const allDone = answeredCount === totalQuestions

  const dimScores: DimScore[] = DIMENSIONS.map(dim => {
    const vals = dim.questions
      .map(q => answers[q.id])
      .filter((v): v is number => v !== undefined)
    const answered = vals.length
    const total = dim.questions.length
    const avg = answered > 0 ? vals.reduce((a, b) => a + b, 0) / answered : 0
    const level = answered > 0 ? scoreToLevel(avg) : 0
    return { dim, answered, total, avg, level }
  })

  const scored = dimScores.filter(d => d.answered > 0)

  let overallLevel = 0
  if (scored.length > 0) {
    const overallAvg = scored.reduce((s, d) => s + d.avg, 0) / scored.length
    const uncapped = scoreToLevel(overallAvg)
    const minLevel = Math.min(...scored.map(d => d.level))
    // Heuristic: overall level can't exceed weakest dimension + 1.
    // This is a self-assessment UX rule, not an EAROS standard rule.
    overallLevel = Math.min(uncapped, minLevel + 1)
  }

  const sorted = [...scored].sort((a, b) => a.avg - b.avg)
  const weakest = sorted[0]
  const strongest = sorted[sorted.length - 1]

  const nextGuideLevel = overallLevel < 5 ? overallLevel + 1 : 5
  const nextGuide = LEVEL_GUIDES[nextGuideLevel]

  /* --- handlers --- */

  const handleAnswer = (qid: string, score: number) =>
    setAnswers(prev => ({ ...prev, [qid]: score }))

  const resetAll = () => setAnswers({})

  /* --- render --- */

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      {/* Heading */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 500, color: isDark ? '#ffffff' : sapphire.blue[900], mb: 1 }}
      >
        Where Are You Today?
      </Typography>
      <Typography sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[600], mb: 4, fontSize: '0.95rem' }}>
        Answer {totalQuestions} questions across {DIMENSIONS.length} dimensions to get an indicative picture of your architecture review maturity.
        Levels are informal guides to help you choose the right onboarding path — they are not formal EAROS scores.
      </Typography>

      {/* ── Results card ── */}
      <Box sx={{
        p: 3, mb: 4, borderRadius: '12px',
        bgcolor: getLevelBg(overallLevel || 1, isDark),
        border: '1px solid',
        borderColor: getLevelBorder(overallLevel || 1, isDark),
      }}>
        {/* Badge + summary row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%',
              bgcolor: overallLevel > 0 ? getLevelColor(overallLevel, isDark) : isDark ? sapphire.gray[700] : sapphire.gray[200],
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background-color 0.3s ease',
            }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {overallLevel > 0 ? overallLevel : '?'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, color: isDark ? '#ffffff' : sapphire.blue[900], fontSize: '1.05rem' }}>
                {hasAnswers ? `Level ${overallLevel}: ${LEVEL_NAMES[overallLevel]}` : 'Start the assessment'}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}>
                {hasAnswers
                  ? `${answeredCount} of ${totalQuestions} questions answered`
                  : `${totalQuestions} questions across ${DIMENSIONS.length} dimensions`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasAnswers && nextGuide && (
              <Button
                component={Link}
                to={nextGuide.to}
                size="small"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textTransform: 'none', fontSize: '0.82rem',
                  bgcolor: getLevelColor(overallLevel, isDark),
                  '&:hover': { bgcolor: getLevelColor(overallLevel, isDark), filter: 'brightness(1.1)' },
                }}
              >
                {overallLevel < 5 ? `Next: ${nextGuide.label}` : nextGuide.label}
              </Button>
            )}
            {hasAnswers && (
              <Button
                size="small" onClick={resetAll}
                startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontSize: '0.78rem', color: isDark ? sapphire.gray[400] : sapphire.gray[500] }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>

        {/* Dimension score bars */}
        {hasAnswers && (
          <Box sx={{ mt: 3 }}>
            {dimScores.map(ds => {
              const barColor = ds.level > 0
                ? getLevelColor(ds.level, isDark)
                : isDark ? sapphire.gray[700] : sapphire.gray[200]
              const barPct = ds.answered > 0 ? (ds.avg / 4) * 100 : 0
              const isWeak = weakest && ds.dim.id === weakest.dim.id && scored.length > 1

              return (
                <Box key={ds.dim.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography sx={{
                    fontSize: '0.78rem', width: 130, flexShrink: 0, textAlign: 'right',
                    color: isDark ? sapphire.gray[400] : sapphire.gray[600],
                    fontWeight: isWeak ? 600 : 400,
                  }}>
                    {ds.dim.name}
                  </Typography>
                  <Box sx={{
                    flex: 1, height: 8, borderRadius: 4,
                    bgcolor: isDark ? 'hsl(211 19% 49% / 0.12)' : 'hsl(212 63% 12% / 0.06)',
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      width: `${barPct}%`, height: '100%', borderRadius: 4,
                      bgcolor: barColor,
                      transition: 'width 0.4s ease, background-color 0.3s ease',
                    }} />
                  </Box>
                  <Typography sx={{
                    fontSize: '0.75rem', width: 28, flexShrink: 0,
                    color: ds.answered > 0 ? barColor : isDark ? sapphire.gray[600] : sapphire.gray[300],
                    fontWeight: 600,
                  }}>
                    {ds.answered > 0 ? ds.avg.toFixed(1) : '\u2014'}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )}

        {/* Gap insight */}
        {scored.length >= 2 && weakest && strongest && weakest.dim.id !== strongest.dim.id && (
          <Typography sx={{
            mt: 2, pt: 2, fontSize: '0.85rem',
            color: isDark ? sapphire.gray[400] : sapphire.gray[600],
            borderTop: '1px solid',
            borderColor: isDark ? 'hsl(212 33% 27% / 0.5)' : 'hsl(212 63% 12% / 0.08)',
          }}>
            <strong style={{ color: isDark ? sapphire.gray[300] : sapphire.gray[700] }}>
              {weakest.dim.name}
            </strong>{' '}
            is your main growth area.{' '}
            {weakest.dim.recommendations[weakest.level] || ''}
          </Typography>
        )}
      </Box>

      {/* ── Dimension sections ── */}
      {DIMENSIONS.map(dim => {
        const ds = dimScores.find(d => d.dim.id === dim.id)!
        const isOpen = expanded[dim.id] !== false
        const dimColor = ds.level > 0
          ? getLevelColor(ds.level, isDark)
          : isDark ? sapphire.gray[500] : sapphire.gray[400]
        const allAnsweredInDim = ds.answered === ds.total

        return (
          <Box key={dim.id} sx={{
            mb: 1.5, borderRadius: '10px', border: '1px solid',
            borderColor: isDark ? 'hsl(212 33% 27% / 0.5)' : 'hsl(212 63% 12% / 0.08)',
            bgcolor: isDark ? sapphire.gray[800] : '#ffffff',
            overflow: 'hidden',
          }}>
            {/* Dimension header */}
            <Box
              onClick={() => setExpanded(p => ({ ...p, [dim.id]: !isOpen }))}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5,
                cursor: 'pointer', userSelect: 'none',
                '&:hover': { bgcolor: isDark ? 'hsl(216 100% 63% / 0.04)' : 'hsl(218 92% 49% / 0.02)' },
              }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: allAnsweredInDim ? dimColor : 'transparent',
                border: allAnsweredInDim ? 'none' : `2px solid ${dimColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                <Typography sx={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: allAnsweredInDim ? '#ffffff' : dimColor,
                }}>
                  {ds.level > 0 ? ds.level : '\u00B7'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '0.95rem', color: isDark ? '#ffffff' : sapphire.blue[900] }}>
                  {dim.name}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}>
                  {dim.description}
                </Typography>
              </Box>
              <Typography sx={{
                fontSize: '0.78rem', mr: 0.5,
                color: allAnsweredInDim ? dimColor : isDark ? sapphire.gray[500] : sapphire.gray[400],
                fontWeight: allAnsweredInDim ? 600 : 400,
              }}>
                {ds.answered}/{ds.total}
              </Typography>
              {isOpen
                ? <ExpandLessIcon sx={{ fontSize: 20, color: isDark ? sapphire.gray[500] : sapphire.gray[400] }} />
                : <ExpandMoreIcon sx={{ fontSize: 20, color: isDark ? sapphire.gray[500] : sapphire.gray[400] }} />
              }
            </Box>

            {/* Questions */}
            <Collapse in={isOpen}>
              <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
                {dim.questions.map((q, qi) => (
                  <Box key={q.id} sx={{ mb: qi < dim.questions.length - 1 ? 3 : 0 }}>
                    <Typography sx={{
                      fontSize: '0.9rem', fontWeight: 500, mb: 1,
                      color: isDark ? sapphire.gray[300] : sapphire.gray[700],
                    }}>
                      {q.text}
                    </Typography>
                    <RadioGroup
                      value={answers[q.id] !== undefined ? String(answers[q.id]) : ''}
                      onChange={(_, v) => handleAnswer(q.id, Number(v))}
                    >
                      {q.options.map((opt, oi) => {
                        const score = oi + 1
                        const selected = answers[q.id] === score
                        const optColor = getLevelColor(scoreToLevel(score), isDark)

                        return (
                          <FormControlLabel
                            key={oi}
                            value={String(score)}
                            control={
                              <Radio size="small" sx={{
                                color: isDark ? sapphire.gray[600] : sapphire.gray[300],
                                '&.Mui-checked': { color: optColor },
                                p: 0.75,
                              }} />
                            }
                            label={opt}
                            sx={{
                              display: 'flex', alignItems: 'flex-start', mx: 0, mb: 0.25,
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.85rem', lineHeight: 1.5, pt: '2px',
                                color: selected
                                  ? isDark ? sapphire.gray[200] : sapphire.gray[800]
                                  : isDark ? sapphire.gray[400] : sapphire.gray[600],
                                fontWeight: selected ? 500 : 400,
                              },
                            }}
                          />
                        )
                      })}
                    </RadioGroup>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )
      })}
    </Box>
  )
}
