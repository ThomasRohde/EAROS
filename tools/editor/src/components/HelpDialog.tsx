import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import type { AppMode } from '../App'

// ─── Small layout helpers ──────────────────────────────────────────────────────

function Para({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.75 }}>
      {children}
    </Typography>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0.5 }}>
      {items.map((item, i) => (
        <Box component="li" key={i} sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', px: 1.5, py: 1, borderRadius: 1, mb: 1.5 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}>
        {children}
      </Typography>
    </Box>
  )
}

function ScoreTable() {
  const rows = [
    { score: '4', label: 'Strong', desc: 'Fully addressed, well evidenced, decision-ready' },
    { score: '3', label: 'Good', desc: 'Clearly addressed with adequate evidence and only minor gaps' },
    { score: '2', label: 'Partial', desc: 'Addressed but coverage is incomplete or weakly evidenced' },
    { score: '1', label: 'Weak', desc: 'Acknowledged or implied, but not adequate for decision support' },
    { score: '0', label: 'Absent', desc: 'No meaningful evidence — or evidence contradicts the criterion' },
    { score: 'N/A', label: 'Not applicable', desc: 'Criterion genuinely does not apply — must be justified in the narrative' },
  ]
  const colors: Record<string, string> = {
    '4': '#2e7d32', '3': '#558b2f', '2': '#f57f17', '1': '#bf360c', '0': '#b71c1c', 'N/A': '#607d8b',
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
      {rows.map((r) => (
        <Box key={r.score} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Chip
            label={r.score}
            size="small"
            sx={{
              bgcolor: colors[r.score],
              color: 'white',
              fontWeight: 700,
              minWidth: 38,
              height: 22,
              fontSize: '0.72rem',
              flexShrink: 0,
              '.MuiChip-label': { px: 0.75 },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong style={{ color: '#333' }}>{r.label}</strong> — {r.desc}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ─── Help content types ────────────────────────────────────────────────────────

interface HelpSection {
  title: string
  content: React.ReactNode
}

interface HelpPage {
  heading: string
  badge?: string
  badgeColor?: string
  sections: HelpSection[]
}

// ─── Home help ─────────────────────────────────────────────────────────────────

const HOME_HELP: HelpPage = {
  heading: 'Welcome to EAROS',
  sections: [
    {
      title: 'What is EAROS?',
      content: (
        <>
          <Para>
            EAROS (Enterprise Architecture Rubric Operational Standard) is a structured framework for
            evaluating architecture documents consistently. Instead of leaving quality judgments to
            individual opinion, EAROS provides explicit scoring criteria, evidence requirements, and
            pass/fail rules — so any reviewer, human or AI, reaches the same conclusion from the same
            document.
          </Para>
          <Para>
            Think of it like an exam marking rubric: the criteria are written down, the score levels
            are defined, and the feedback is actionable. You don't need to guess what "good" looks like
            — it's in the rubric.
          </Para>
        </>
      ),
    },
    {
      title: 'Who is EAROS for?',
      content: (
        <>
          <Para>Three groups use EAROS, each with their own row of cards on this screen:</Para>
          <Bullets items={[
            'Governance teams — create and maintain rubrics, the scoring criteria that define what a quality architecture document looks like.',
            'Reviewers — use those rubrics to score architecture documents, recording evidence for each criterion.',
            'Architects — write and improve architecture documents using templates designed to satisfy rubric criteria.',
          ]} />
          <Para>
            If you're not sure which card to use, start with "New Assessment" — it walks you through
            rubric selection step by step.
          </Para>
        </>
      ),
    },
    {
      title: 'Quick start for first-time users',
      content: (
        <>
          <Para>The fastest path depends on your role:</Para>
          <Bullets items={[
            'Reviewing a document? Click "New Assessment", pick a rubric, and score each criterion.',
            'Writing an architecture doc? Click "Create Artifact" to start from a template aligned to EAROS criteria.',
            'Setting up new scoring criteria? Click "Create Rubric" and follow the guided form.',
          ]} />
        </>
      ),
    },
    {
      title: 'The derivation chain',
      content: (
        <>
          <Para>
            EAROS has a deliberate chain: a <strong>Rubric</strong> defines criteria → an{' '}
            <strong>Artifact Schema</strong> describes the document structure needed to satisfy those
            criteria → a <strong>Template</strong> pre-fills that structure so authors don't start
            from a blank page.
          </Para>
          <Para>
            Write your document using the EAROS template, complete every section, and a reviewer
            applying the rubric will find evidence for every criterion. The chain makes quality
            predictable.
          </Para>
        </>
      ),
    },
    {
      title: 'The three-layer rubric model',
      content: (
        <>
          <Para>Rubrics are organised in three layers:</Para>
          <Bullets items={[
            'Core — universal criteria that apply to every architecture artifact (clarity, completeness, decision-readiness, etc.). Always evaluated.',
            'Profile — extends the core for a specific artifact type. A "Solution Architecture" profile adds criteria for solutions; a "Reference Architecture" profile adds criteria for platform blueprints.',
            'Overlay — injects cross-cutting criteria on top of any core+profile combination. A "Security" overlay adds security criteria regardless of artifact type.',
          ]} />
          <Para>
            One global rubric is too generic; fully custom rubrics per project are ungovernable. The
            three-layer model is the balance.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Rubric editor help ────────────────────────────────────────────────────────

const RUBRIC_HELP: HelpPage = {
  heading: 'Rubric Editor Help',
  badge: 'Governance',
  badgeColor: '#1a237e',
  sections: [
    {
      title: 'What is a rubric and why does it matter?',
      content: (
        <>
          <Para>
            A rubric is a set of scored criteria that defines what a high-quality architecture
            document looks like. Each criterion has a question, a 0–4 scale with level descriptors,
            evidence requirements, and examples. Rubrics make quality judgments explicit, consistent,
            and auditable — the same document scored by two different reviewers (or an AI) should
            reach the same result.
          </Para>
        </>
      ),
    },
    {
      title: 'Core rubric, profile, or overlay — when to use each',
      content: (
        <>
          <Bullets items={[
            'Core rubric — defines universal criteria for all artifact types. There is usually just one active core rubric in a repository.',
            'Profile — extends the core for a specific artifact type. Use a profile when the core criteria alone are insufficient. Examples: solution-architecture, reference-architecture, adr, capability-map, roadmap.',
            'Overlay — injects cross-cutting criteria on top of any core+profile combination. Use an overlay for concerns that span multiple artifact types (security, data governance, regulatory). An overlay\'s scoring method is "append to base rubric" — it adds criteria rather than replacing them.',
          ]} />
        </>
      ),
    },
    {
      title: 'How dimensions and criteria work',
      content: (
        <>
          <Para>
            Each rubric is organised into <strong>dimensions</strong> — high-level quality areas
            (e.g. "Clarity and Structure", "Risk and Resilience"). Each dimension contains one or more{' '}
            <strong>criteria</strong> — specific questions a reviewer answers with a score and
            evidence citation.
          </Para>
          <Para>
            Dimensions can have <strong>weights</strong> (default 1.0) that affect how much they
            contribute to the final score. A weight of 1.2 means the dimension counts 20% more than a
            standard one.
          </Para>
        </>
      ),
    },
    {
      title: 'The 0–4 scoring scale',
      content: <ScoreTable />,
    },
    {
      title: 'Gates — what they are and why they matter',
      content: (
        <>
          <Para>
            A gate is a rule that can override the weighted average. Gates prevent a high average
            score from hiding a critical failure elsewhere.
          </Para>
          <Bullets items={[
            'Advisory — flags a weakness but doesn\'t change the outcome.',
            'Major — a significant weakness may cap the status to "Conditional Pass" even if the average is high.',
            'Critical — failure blocks a pass entirely. Any critical gate failure = Reject, regardless of the average score.',
          ]} />
          <Para>
            Don't over-gate. Only the most critical criteria — mandatory controls, fundamental
            showstoppers — should be critical gates. Over-gating produces false rejects.
          </Para>
        </>
      ),
    },
    {
      title: 'What makes a good criterion?',
      content: (
        <>
          <Para>
            A well-written criterion is specific, answerable from the document, and unambiguous at
            each score level. Two reviewers reading the same document should reach the same score.
          </Para>
          <Code>
            Good: "Does the reference architecture include context, functional, deployment, and data
            flow views?"
          </Code>
          <Para>This is specific — it names exactly what to look for.</Para>
          <Bullets items={[
            'Bad: "Is the architecture well-documented?" — too vague; every reviewer interprets it differently.',
            'Good: "Does the document include a C4 context diagram, a deployment diagram, and a data flow walkthrough?" — specific, observable, verifiable.',
          ]} />
          <Para>
            Every criterion needs: a question, description, scoring guide for all 5 levels (0–4),
            required evidence list, anti-patterns, good/bad examples, a decision tree, and remediation
            hints.
          </Para>
        </>
      ),
    },
    {
      title: 'Saving and validating',
      content: (
        <>
          <Para>
            The editor validates your YAML against the rubric schema automatically — errors appear in
            the status bar at the bottom. Use <strong>Save to Repo</strong> to write to the canonical
            EAROS file path. Use <strong>Export</strong> to download a local copy.
          </Para>
          <Para>
            Toggle the YAML preview (code icon) to inspect the raw output before saving. The
            file-name convention is kebab-case — <code>reference-architecture.yaml</code>, not
            camelCase or with version numbers in the filename (version is tracked inside the file via
            the <code>version</code> field).
          </Para>
        </>
      ),
    },
  ],
}

// ─── Assessment wizard help ────────────────────────────────────────────────────

const NEW_ASSESSMENT_HELP: HelpPage = {
  heading: 'New Assessment Help',
  badge: 'Reviewers',
  badgeColor: '#2e7d32',
  sections: [
    {
      title: 'How assessment works in EAROS',
      content: (
        <>
          <Para>
            An EAROS assessment scores an architecture document against a rubric. For each criterion,
            you read the document, find the relevant evidence, and assign a score from 0 to 4. The
            scores are aggregated with gate checks to produce an overall status: Pass, Conditional
            Pass, Rework Required, or Reject.
          </Para>
          <Para>
            Every score must be supported by a specific evidence citation — a direct quote or
            section reference from the artifact. Guessing is not allowed.
          </Para>
        </>
      ),
    },
    {
      title: 'The four wizard steps',
      content: (
        <>
          <Bullets items={[
            'Step 1 — Core Rubric: Select the universal criteria. Usually there\'s only one option. This establishes the foundation every assessment starts from.',
            'Step 2 — Profile: Pick the profile that matches the artifact type you\'re reviewing (e.g. Solution Architecture, Reference Architecture). The profile adds artifact-specific criteria on top of the core.',
            'Step 3 — Overlays: Optionally add cross-cutting concerns. Tick "Security" if the design touches authentication or personal data. Tick "Data Governance" if it describes data flows or retention.',
            'Step 4 — Artifact Details: Enter the document\'s title, author, and version. This metadata is recorded in the evaluation output so the assessment is traceable.',
          ]} />
        </>
      ),
    },
    {
      title: 'After the wizard',
      content: (
        <>
          <Para>
            The wizard builds a combined rubric from your selections and opens the scoring form. All
            criteria from the core, profile, and any overlays appear together, grouped by dimension.
            Core criteria are labelled blue, profile criteria purple, overlay criteria pink.
          </Para>
          <Para>
            Complete as many criteria as you can. You can export a partial evaluation and resume it
            later via "Continue Assessment".
          </Para>
        </>
      ),
    },
  ],
}

// ─── Assessment form help ──────────────────────────────────────────────────────

const ASSESS_HELP: HelpPage = {
  heading: 'Scoring Help',
  badge: 'Reviewers',
  badgeColor: '#2e7d32',
  sections: [
    {
      title: 'How to score: what each level means',
      content: (
        <>
          <Para>
            Open the scoring guide accordion on any criterion to see the level descriptors for that
            specific question. As a general reference:
          </Para>
          <ScoreTable />
        </>
      ),
    },
    {
      title: 'How to write good evidence',
      content: (
        <>
          <Para>
            Evidence should be specific enough that someone else could find the same passage in the
            document and reach the same score.
          </Para>
          <Bullets items={[
            'Good: "Section 3.2 provides a C4 context diagram; Section 5 shows deployment topology with named services and network boundaries."',
            'Bad: "The artifact seems to address this."',
            'Good: "Page 7 states: \'Authentication is handled by OAuth 2.0 with PKCE for all public-facing APIs.\'"',
            'Bad: "The document mentions security."',
          ]} />
          <Para>
            If you cannot find evidence, use N/A and explain in the rationale field why the criterion
            genuinely does not apply. Don't leave it blank.
          </Para>
        </>
      ),
    },
    {
      title: 'Confidence vs. score — they\'re separate',
      content: (
        <>
          <Para>
            Confidence (high / medium / low) is reported separately from the score. It tells the
            reader how certain you are — perhaps the document is ambiguous, or you're evaluating
            outside your area of expertise.
          </Para>
          <Para>
            <strong>Confidence does not change the score.</strong> A "low confidence, score 3" is
            recorded and aggregated as 3. The confidence rating is there so a human reviewer knows
            which judgments to look at more carefully.
          </Para>
        </>
      ),
    },
    {
      title: 'What gate badges mean',
      content: (
        <>
          <Para>Some criteria have a gate badge next to their title:</Para>
          <Bullets items={[
            'Red — Critical gate. If this criterion scores below the threshold, the entire assessment is Reject. No average score can compensate for a critical gate failure.',
            'Orange — Major gate. A low score here may cap the overall status to Conditional Pass even if everything else scores well.',
            'Blue — Advisory gate. A low score here triggers a recommendation in the output but doesn\'t change the pass/fail result.',
          ]} />
        </>
      ),
    },
    {
      title: 'How overall status is computed',
      content: (
        <>
          <Para>
            Gates are checked first. Any critical gate failure → Reject immediately, no average
            computed.
          </Para>
          <Para>If no critical gates fail, the weighted dimension average determines status:</Para>
          <Bullets items={[
            'Pass — no critical gate failure + overall ≥ 3.2 + no dimension average below 2.0',
            'Conditional Pass — no critical gate failure + overall 2.4–3.19',
            'Rework Required — overall below 2.4, or any dimension repeatedly weak',
            'Reject — any critical gate failure, or mandatory control breach',
          ]} />
          <Para>
            N/A criteria are excluded from the denominator. They don't drag down the score, but each
            one must be justified in the rationale.
          </Para>
        </>
      ),
    },
    {
      title: 'The three evaluation types — don\'t mix them',
      content: (
        <>
          <Para>EAROS distinguishes three distinct judgments that must not be collapsed into one:</Para>
          <Bullets items={[
            'Artifact quality — Is the document complete, coherent, clear, and traceable?',
            'Architectural fitness — Does the described architecture appear sound relative to business drivers, quality attributes, and risks?',
            'Governance fit — Does the design comply with mandatory principles, standards, and controls?',
          ]} />
          <Para>
            A beautifully written, complete document can still describe an architecturally unsound
            system. Keep these judgments separate.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Continue assessment help ──────────────────────────────────────────────────

const CONTINUE_ASSESSMENT_HELP: HelpPage = {
  heading: 'Continue Assessment Help',
  badge: 'Reviewers',
  badgeColor: '#2e7d32',
  sections: [
    {
      title: 'Finding and resuming saved evaluations',
      content: (
        <>
          <Para>
            Saved evaluations appear in the list on the left. Click any entry to load it. Your
            previous scores, evidence citations, and confidence ratings are restored so you can pick
            up exactly where you left off.
          </Para>
          <Para>
            Evaluations are stored as <code>.evaluation.yaml</code> files in the EAROS repository
            (typically under <code>examples/</code>). If your file isn't in the list, use Import to
            load it from your local file system.
          </Para>
        </>
      ),
    },
    {
      title: 'Importing evaluation files',
      content: (
        <>
          <Para>
            Click <strong>Import File</strong> or drag and drop a <code>.yaml</code> file onto the
            drop zone to load an evaluation from your computer. The file must be a valid EAROS
            evaluation record — it will be parsed and opened in the scoring form automatically.
          </Para>
          <Para>
            If the file references rubrics that can't be found on the server, you'll see a warning
            but can still view and edit the scores.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Artifact editor help ──────────────────────────────────────────────────────

const ARTIFACT_HELP: HelpPage = {
  heading: 'Artifact Editor Help',
  badge: 'Architects',
  badgeColor: '#e65100',
  sections: [
    {
      title: 'What are architecture artifacts?',
      content: (
        <>
          <Para>
            An architecture artifact is a structured document describing a system design, decision,
            capability, or technology roadmap. In EAROS, artifacts are what gets reviewed —
            solution architectures, reference architectures, ADRs, capability maps, and roadmaps.
          </Para>
          <Para>
            The artifact editor helps you write documents in a format that EAROS can assess reliably
            and consistently. A well-structured artifact is easier to score and produces clearer,
            more actionable feedback.
          </Para>
        </>
      ),
    },
    {
      title: 'How the artifact schema maps to rubric criteria',
      content: (
        <>
          <Para>
            The artifact form is not arbitrary — each section maps directly to evidence that a rubric
            criterion requires. If a criterion asks "Does the document include a deployment diagram?",
            the schema has a section for the deployment view.
          </Para>
          <Para>
            Complete every section in the form and you will automatically satisfy the evidence
            requirements of the matching rubric. Leave sections blank and those criteria will score
            low during review.
          </Para>
        </>
      ),
    },
    {
      title: 'Tips for writing assessment-ready content',
      content: (
        <>
          <Bullets items={[
            'Be explicit. State decisions clearly — don\'t assume the reviewer already knows your context.',
            'Reference diagrams by section: "Figure 3 shows the deployment topology with all external dependencies."',
            'For every architecture decision, name the alternatives considered and explain why you chose the direction you did.',
            'For every risk, name the mitigation and the owner.',
            'Keep metadata current — title, version, author, and date — so reviewers know the document is live.',
          ]} />
        </>
      ),
    },
    {
      title: 'The derivation chain',
      content: (
        <>
          <Para>
            <strong>Rubric → Artifact Schema → Template → Your document.</strong>
          </Para>
          <Para>
            The rubric defines what evidence is needed. The artifact schema captures that as
            structured fields. The template pre-fills those fields with guidance text. Your document
            replaces the guidance with real content.
          </Para>
          <Para>
            Start from the template, fill in every section, and a reviewer applying the rubric will
            find evidence for every criterion. That's the intent of the chain — quality by design,
            not by luck.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Mode → page config ────────────────────────────────────────────────────────

function getHelpPage(mode: AppMode): HelpPage {
  switch (mode) {
    case 'home':               return HOME_HELP
    case 'create-rubric':
    case 'rubric':             return RUBRIC_HELP
    case 'new-assessment':     return NEW_ASSESSMENT_HELP
    case 'assess':             return ASSESS_HELP
    case 'continue-assessment': return CONTINUE_ASSESSMENT_HELP
    case 'new-artifact':
    case 'edit-artifact':      return ARTIFACT_HELP
    default:                   return HOME_HELP
  }
}

// ─── HelpDialog ───────────────────────────────────────────────────────────────

interface HelpDialogProps {
  open: boolean
  onClose: () => void
  mode: AppMode
}

export default function HelpDialog({ open, onClose, mode }: HelpDialogProps) {
  const [expanded, setExpanded] = useState<string | false>(false)
  const page = getHelpPage(mode)

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, pr: 1 }}
      >
        <HelpOutlineIcon sx={{ color: '#1a237e', fontSize: 22, flexShrink: 0 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: '1.05rem' }}>
          {page.heading}
        </Typography>
        {page.badge && (
          <Chip
            label={page.badge}
            size="small"
            sx={{
              bgcolor: page.badgeColor,
              color: 'white',
              fontSize: '0.65rem',
              height: 20,
              '.MuiChip-label': { px: 0.75 },
            }}
          />
        )}
        <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {page.sections.map((section, i) => (
          <Accordion
            key={`${mode}-${i}`}
            expanded={expanded === `panel-${i}`}
            onChange={handleChange(`panel-${i}`)}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: '1px solid #e0e0e0',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
              {section.content}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} size="small" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
