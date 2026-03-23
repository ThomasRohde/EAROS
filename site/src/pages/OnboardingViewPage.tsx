import { useParams, Link } from 'react-router-dom'
import { Box, Typography, Button, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { onboardingGuides, getOnboardingBySlug } from '../content/onboarding'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MaturityBadge from '../components/MaturityBadge'
import MaturityAssessment from '../components/MaturityAssessment'
import TerminalDemo from '../components/TerminalDemo'
import { sapphire } from '../theme'
import { getLevelColor } from '../utils/maturityColors'

/* ── Content injection helper ─────────────────────────────────── */

interface ContentInjection {
  /** Markdown heading to inject AFTER (heading renders first, then component) */
  marker: string
  component: React.ReactNode
}

/**
 * Split markdown content at each marker heading and interleave React components.
 * Markers that are not found in the content are silently skipped.
 */
function renderContentWithInjections(
  content: string,
  injections: ContentInjection[],
): React.ReactNode {
  if (!injections.length) return <MarkdownRenderer content={content} />

  // Locate each marker and filter out any that aren't found
  const located = injections
    .map((inj) => ({ ...inj, idx: content.indexOf(inj.marker) }))
    .filter((inj) => inj.idx >= 0)
    .sort((a, b) => a.idx - b.idx)

  if (!located.length) return <MarkdownRenderer content={content} />

  const segments: React.ReactNode[] = []
  let cursor = 0

  for (let i = 0; i < located.length; i++) {
    const { marker, component, idx } = located[i]
    // Find the end of the heading line so the heading is included in "before"
    const headingEnd = content.indexOf('\n', idx)
    const splitPos = headingEnd >= 0 ? headingEnd + 1 : idx + marker.length

    // Text from cursor up to (and including) the heading line
    const before = content.slice(cursor, splitPos)
    if (before) segments.push(<MarkdownRenderer key={`md-${i}`} content={before} />)
    segments.push(<Box key={`inj-${i}`}>{component}</Box>)
    cursor = splitPos
  }

  // Remaining content after the last injection
  const tail = content.slice(cursor)
  if (tail) segments.push(<MarkdownRenderer key="md-tail" content={tail} />)

  return <>{segments}</>
}

/* ── Demo configurations per slug ─────────────────────────────── */

function getDemoConfig(slug: string): ContentInjection[] {
  switch (slug) {
    case 'overview':
      return [{
        marker: '## How to Use This Guide',
        component: <MaturityAssessment />,
      }]
    case 'first-assessment':
      return [{
        marker: '## Understanding the Workspace',
        component: (
          <TerminalDemo
            key="first-assessment-demo"
            title="terminal"
            lines={[
              { type: 'input', value: 'npm install -g @trohde/earos' },
              { type: 'progress' },
              { value: 'added 147 packages in 8s' },
              { type: 'input', value: 'earos init my-workspace' },
              { value: '\u2713 EaROS workspace initialized at: ./my-workspace' },
              { value: '' },
              { value: 'Contents:' },
              { value: '  core/                  Core meta-rubric (universal foundation)' },
              { value: '  profiles/              Artifact-specific profiles (5 included)' },
              { value: '  overlays/              Cross-cutting concern overlays (3 included)' },
              { value: '  standard/schemas/      JSON schemas for validation' },
              { value: '  templates/             Blank templates for new profiles and evaluations' },
              { value: '  evaluations/           Your evaluation records go here' },
              { value: '  calibration/           Calibration artifacts and results' },
              { value: '  .agents/skills/        All 10 EaROS skills for any AI coding agent' },
              { value: '  earos.manifest.yaml    File inventory (single source of truth)' },
              { value: '  AGENTS.md              Project guide for AI agents (agent-agnostic)' },
              { value: '' },
              { value: 'Next steps:' },
              { value: '  cd my-workspace' },
              { value: '  earos                  Open the editor' },
              { value: '  earos validate core/core-meta-rubric.yaml   Validate a file' },
              { value: '  earos manifest check   Verify manifest integrity' },
              { type: 'input', value: 'cd my-workspace' },
              { type: 'input', value: 'earos' },
              { value: 'EaROS Editor \u2192 http://localhost:<port>' },
            ]}
          />
        ),
      }]
    case 'governed-review':
      return [{
        marker: '## Calibrating with Your Team',
        component: (
          <TerminalDemo
            key="governed-review-demo"
            title="terminal — calibration exercise"
            lines={[
              { type: 'input', value: '# 1. Each reviewer scores the same artifact independently' },
              { type: 'input', value: 'earos validate artifact.evaluation.yaml' },
              { value: '✓ artifact.evaluation.yaml is valid (kind: evaluation)' },
              { type: 'input', value: '# 2. Compare reviewer scores and compute agreement' },
              { value: "Cohen's κ = 0.74 (substantial agreement)" },
              { type: 'input', value: '# 3. Resolve disagreements against level descriptors' },
              { value: '2 criteria had >1-point disagreement → resolved' },
            ]}
          />
        ),
      }]
    case 'agent-assisted':
      return [{
        marker: '## Running Your First Agent Assessment',
        component: (
          <TerminalDemo
            key="agent-demo"
            title="AI agent assessment — via earos-assess skill"
            lines={[
              { type: 'input', value: '# Agents discover and run the earos-assess skill automatically' },
              { type: 'input', value: '"Assess artifact.yaml using EAROS"' },
              { value: '\u280b Reading rubric files...' },
              { value: '\u280b Running structural validation...' },
              { value: '\u280b Scoring 19 criteria with RULERS protocol...' },
              { value: '\u2713 Evaluation complete' },
              { value: 'Status: Pass (3.73 / 4.0)' },
              { value: '  No critical gate failures \u2022 All dimensions \u2265 2.0' },
              { value: 'Output: artifact.evaluation.yaml' },
              { type: 'input', value: '"Run EAROS assessment on solution-design.yaml"' },
              { value: 'Loading earos-assess skill from .agents/skills/...' },
              { value: 'Applying EAROS-CORE-002 + EAROS-SOL-001...' },
              { value: '\u2713 13 criteria scored, 0 gate failures' },
              { value: 'Status: Conditional Pass (2.8 / 4.0)' },
              { value: 'Output: solution-design.evaluation.yaml' },
            ]}
          />
        ),
      }]
    default:
      return []
  }
}

export default function OnboardingViewPage() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const guide = slug ? getOnboardingBySlug(slug) : undefined

  const currentIndex = onboardingGuides.findIndex((g) => g.slug === slug)
  const prevGuide = currentIndex > 0 ? onboardingGuides[currentIndex - 1] : undefined
  const nextGuide = currentIndex < onboardingGuides.length - 1 ? onboardingGuides[currentIndex + 1] : undefined

  if (!guide) {
    return (
      <Box sx={{ py: { xs: 8, md: 12 }, px: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#ffffff' : sapphire.blue[900] }}>
          Guide not found
        </Typography>
        <Button component={Link} to="/onboarding" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Onboarding
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: 3 }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: 'auto',
          display: 'flex',
          gap: 4,
        }}
      >
        {/* Sidebar nav */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 200,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
          }}
        >
          <Button
            component={Link}
            to="/onboarding"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              mb: 2,
              color: isDark ? sapphire.gray[400] : sapphire.gray[600],
              fontSize: '0.8rem',
              justifyContent: 'flex-start',
              px: 1,
            }}
          >
            All guides
          </Button>
          {onboardingGuides.map((g) => (
            <Button
              key={g.slug}
              component={Link}
              to={`/onboarding/${g.slug}`}
              size="small"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textAlign: 'left',
                width: '100%',
                px: 1,
                py: 0.5,
                fontSize: '0.85rem',
                fontWeight: g.slug === slug ? 600 : 400,
                color:
                  g.slug === slug
                    ? isDark
                      ? sapphire.blue[400]
                      : sapphire.blue[500]
                    : isDark
                      ? sapphire.gray[300]
                      : sapphire.gray[600],
                borderRadius: 1,
                bgcolor:
                  g.slug === slug
                    ? isDark
                      ? 'hsla(218, 92%, 49%, 0.08)'
                      : sapphire.blue[50]
                    : 'transparent',
                '&:hover': {
                  bgcolor: isDark ? 'hsla(218, 92%, 49%, 0.06)' : 'hsla(218, 92%, 49%, 0.04)',
                },
                justifyContent: 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getLevelColor(g.maturityLevel, isDark),
                  flexShrink: 0,
                }}
              />
              {g.title}
            </Button>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Mobile back link */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <Button
              component={Link}
              to="/onboarding"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: isDark ? sapphire.gray[400] : sapphire.gray[600] }}
            >
              All guides
            </Button>
          </Box>

          {/* Maturity badge */}
          <Box sx={{ mb: 3 }}>
            <MaturityBadge
              maturityLevel={guide.maturityLevel}
              maturityTransition={guide.maturityTransition}
              maturityLabel={guide.maturityLabel}
            />
          </Box>

          {/* Markdown content with injected interactive demos */}
          {renderContentWithInjections(
            guide.content,
            getDemoConfig(slug || ''),
          )}

          {/* Prev / Next navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 6,
              pt: 3,
              borderTop: `1px solid ${isDark ? 'hsla(212, 33%, 27%, 0.6)' : 'hsla(212, 63%, 12%, 0.08)'}`,
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              {prevGuide && (
                <Button
                  component={Link}
                  to={`/onboarding/${prevGuide.slug}`}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {prevGuide.title}
                </Button>
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {nextGuide && (
                <Button
                  component={Link}
                  to={`/onboarding/${nextGuide.slug}`}
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {nextGuide.title}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
