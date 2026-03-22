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
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import type { AppMode } from '../App'

// ─── Small layout helpers ──────────────────────────────────────────────────────

function Para({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.75 }}>
      {children}
    </Typography>
  )
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0.5 }}>
      {items.map((item, i) => (
        <Box component="li" key={i} sx={{ mb: 0.75 }}>
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
    <Box sx={{ bgcolor: 'action.hover', px: 1.5, py: 1, borderRadius: 1, mb: 1.5 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}>
        {children}
      </Typography>
    </Box>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
      {children}
    </Typography>
  )
}

/** Highlighted callout for AI agent skill tips */
function AgentTip({ skill, description }: { skill: string; description: string }) {
  return (
    <Alert
      icon={<AutoAwesomeIcon fontSize="small" />}
      severity="success"
      sx={{ mt: 2, '& .MuiAlert-message': { width: '100%' } }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Or let an AI agent do this for you
      </Typography>
      <Typography variant="body2">
        <strong>{skill}</strong> — {description}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontSize: '0.78rem' }}>
        Open this project in Claude Code, Cursor, or any AI coding agent — the skill is already installed and ready.
      </Typography>
    </Alert>
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
            <strong style={{ color: 'inherit' }}>{r.label}</strong> — {r.desc}
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
  heading: 'Welcome to EaROS',
  sections: [
    {
      title: 'What is EaROS?',
      content: (
        <>
          <Para>
            EaROS (Enterprise Architecture Rubric Operational Standard) is a structured framework
            for evaluating architecture documents consistently. Think of it like an exam marking rubric:
            the criteria are written down, score levels are defined for each one, and feedback is
            actionable. You don't need to guess what "good" looks like — it's in the rubric. The same
            document scored by two different reviewers — or by an AI agent — should reach the same
            conclusion.
          </Para>
          <Para>
            EaROS solves the consistency problem that plagues every architecture governance function:
            different reviewers apply different mental models, AI assessments hallucinate quality, and
            feedback is rarely actionable. EaROS makes evaluation criteria explicit, scoring reproducible,
            and improvement guidance concrete.
          </Para>
        </>
      ),
    },
    {
      title: 'The three-layer model',
      content: (
        <>
          <Para>Rubrics are organised in three layers that compose together:</Para>
          <Bullets items={[
            <><strong>Core</strong> — universal criteria that apply to every architecture artifact (clarity, completeness, decision-readiness, traceability). Always evaluated. Defined in <code>core/core-meta-rubric.yaml</code>.</>,
            <><strong>Profile</strong> — extends the core for a specific artifact type. A "Solution Architecture" profile adds solution-specific criteria; a "Reference Architecture" profile adds platform blueprint criteria. Each profile inherits the core.</>,
            <><strong>Overlay</strong> — injects cross-cutting criteria on top of any core+profile combination. A "Security" overlay adds security criteria regardless of artifact type. Applied by context, not by artifact type.</>,
          ]} />
          <Para>
            One global rubric is too generic; fully bespoke rubrics per project are ungovernable. The
            three-layer model is the balance.
          </Para>
        </>
      ),
    },
    {
      title: 'The six workflows — which card to use',
      content: (
        <>
          <SectionHeading>For Governance Teams</SectionHeading>
          <Bullets items={[
            <><strong>Create Rubric</strong> — Design new scoring criteria from scratch. Use when you need a new profile for an artifact type, a new overlay for a cross-cutting concern, or want to update the core rubric.</>,
            <><strong>Edit Rubric</strong> — Modify existing rubric files. Use to refine criteria, adjust weights, update scoring guides, or add missing v2 fields (examples, decision trees, anti-patterns).</>,
          ]} />
          <SectionHeading>For Reviewers</SectionHeading>
          <Bullets items={[
            <><strong>New Assessment</strong> — Score an architecture document. The wizard assembles the right rubric set (core + profile + overlays), then the form walks you through each criterion.</>,
            <><strong>Continue Assessment</strong> — Resume a saved evaluation. Load from the repository list or import a <code>.evaluation.yaml</code> file.</>,
          ]} />
          <SectionHeading>For Architects</SectionHeading>
          <Bullets items={[
            <><strong>Create Artifact</strong> — Write a new architecture document from a template. Each section maps to a rubric criterion, so completing it thoroughly produces a document that scores well.</>,
            <><strong>Edit Artifact</strong> — Import and improve an existing document. See how each section maps to EaROS criteria and what evidence is needed.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'AI Agent Skills — the real power of EaROS',
      content: (
        <>
          <Alert icon={<AutoAwesomeIcon fontSize="small" />} severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              The editor is a manual fallback. AI agents are the primary interface.
            </Typography>
            <Typography variant="body2">
              EaROS ships with 10 AI agent skills in <code>.agents/skills/</code> that automate the
              entire lifecycle. Open this project in Claude Code, Cursor, or any AI coding agent and
              the skills are immediately available — no configuration needed.
            </Typography>
          </Alert>
          <Para>The vision is <strong>humans on the loop, not in the loop</strong>: review and approve AI-generated assessments rather than performing them manually. Here's what each skill does:</Para>
          <Bullets items={[
            <><strong>earos-assess</strong> — Runs the full 8-step DAG evaluation automatically. The agent extracts evidence, scores each criterion, checks gates, and produces a conforming evaluation record. No manual scoring needed.</>,
            <><strong>earos-create</strong> — Guides you through an interactive interview to design a new rubric (profile, overlay, or core), then generates the YAML. Better than building from a blank form.</>,
            <><strong>earos-artifact-gen</strong> — Interviews you about your architecture and generates a schema-compliant artifact document. Replaces the manual create artifact flow.</>,
            <><strong>earos-remediate</strong> — Takes an assessment record and produces a prioritized improvement plan: what to fix first, why, and how.</>,
            <><strong>earos-review</strong> — A challenger agent that audits an existing assessment for over-scoring, unsupported claims, or missed evidence. Use it for second opinions.</>,
            <><strong>earos-template-fill</strong> — Coaches an architect through writing an assessment-ready document, section by section.</>,
            <><strong>earos-report</strong> — Generates executive reports and portfolio views from one or more evaluation records.</>,
            <><strong>earos-calibrate</strong> — Runs calibration exercises and computes inter-rater reliability (Cohen's κ) before a rubric goes live.</>,
            <><strong>earos-validate</strong> — Health-checks the entire EaROS repository: schema validation, ID uniqueness, manifest consistency, missing v2 fields.</>,
            <><strong>earos-profile-author</strong> — Technical YAML authoring assistant for profiles and overlays: schema compliance, field requirements, v2 structure.</>,
          ]} />
          <Para>
            To use any skill: open a terminal in this project directory, start your AI agent, and describe what you want. The agent will match your request to the right skill automatically.
          </Para>
        </>
      ),
    },
    {
      title: 'Getting started — first-time users',
      content: (
        <>
          <Para>The fastest path depends on your goal:</Para>
          <Bullets items={[
            'Reviewing a document? Click "New Assessment" to score it manually, or ask your AI agent to run earos-assess.',
            'Writing an architecture document? Click "Create Artifact" to use the guided form, or ask your AI agent to run earos-artifact-gen.',
            'Setting up new scoring criteria? Click "Create Rubric" to build from the form, or ask your AI agent to run earos-create.',
            'Improving an existing document after a review? Ask your AI agent to run earos-remediate with the evaluation record.',
          ]} />
          <Para>
            For full documentation, see <code>standard/EAROS.md</code> in the repository.
            For YAML authoring reference, see <code>docs/profile-authoring-guide.md</code>.
          </Para>
        </>
      ),
    },
    {
      title: 'The derivation chain',
      content: (
        <>
          <Para>
            EaROS has a deliberate chain: a <strong>Rubric</strong> defines what evidence is
            needed → an <strong>Artifact Schema</strong> captures that as structured sections → a{' '}
            <strong>Template</strong> pre-fills those sections with guidance → your{' '}
            <strong>Document</strong> replaces the guidance with real content.
          </Para>
          <Para>
            Complete every section of the template and a reviewer applying the rubric will find
            evidence for every criterion. Quality by design, not by luck.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Create Rubric help ────────────────────────────────────────────────────────

const CREATE_RUBRIC_HELP: HelpPage = {
  heading: 'Create Rubric Help',
  badge: 'Governance',
  badgeColor: '#1a237e',
  sections: [
    {
      title: 'What is a rubric and what kinds are there?',
      content: (
        <>
          <Para>
            A rubric is a set of scored criteria that defines what a quality architecture document
            looks like. Each criterion has a question, a 0–4 scale with level descriptors, evidence
            requirements, and examples. Rubrics make quality judgments explicit, consistent, and
            auditable.
          </Para>
          <Para>There are three kinds — choose based on scope:</Para>
          <Bullets items={[
            <><strong>Core rubric</strong> — universal criteria for all artifact types. There is usually just one active core rubric in a repo. Only create one if you are establishing a new EaROS instance from scratch.</>,
            <><strong>Profile</strong> — extends the core for a specific artifact type (solution-architecture, reference-architecture, adr, capability-map, roadmap). Use a profile when core criteria alone are insufficient for the artifact type.</>,
            <><strong>Overlay</strong> — injects cross-cutting criteria on top of any core+profile combination (security, data governance, regulatory). Use an overlay when a concern spans multiple artifact types and should not be baked into any single profile.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'Choosing a design method (A–E)',
      content: (
        <>
          <Para>
            Each profile should be built around one design method — the lens through which quality
            is judged. The five methods:
          </Para>
          <Bullets items={[
            <><strong>A: Decision-Centred</strong> — Best for ADRs, investment reviews, exception requests. Criteria focus on decision clarity, alternatives considered, and rationale quality.</>,
            <><strong>B: Viewpoint-Centred</strong> — Best for capability maps and reference architectures. Criteria focus on view completeness, consistency across views, and stakeholder coverage.</>,
            <><strong>C: Lifecycle-Centred</strong> — Best for transition designs, roadmaps, handover documents. Criteria focus on phasing, migration paths, and operational readiness.</>,
            <><strong>D: Risk-Centred</strong> — Best for security architectures and regulatory designs. Criteria focus on threat coverage, control completeness, and residual risk documentation.</>,
            <><strong>E: Pattern-Library</strong> — Best for recurring reference patterns and platform services. Criteria focus on reusability, pattern fidelity, and variation guidance.</>,
          ]} />
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
          <Code>Good: "Does the document include a C4 context diagram, a deployment diagram, and a numbered data flow walkthrough?"</Code>
          <Code>Bad: "Is the architecture well-documented?" — too vague; every reviewer interprets differently.</Code>
          <Para>Every criterion <strong>must</strong> include all of these:</Para>
          <Bullets items={[
            'question — a single, specific, answerable question',
            'scoring_guide — level descriptors for all five levels: "0", "1", "2", "3", "4"',
            'required_evidence — list of specific evidence items a reviewer must find',
            'examples.good and examples.bad — real-phrasing examples, not abstract descriptions',
            'decision_tree — observable branching logic: count X → if < 2 then score 0-1, etc.',
            'anti_patterns — common mistakes that produce misleadingly high artifact quality',
            'remediation_hints — actionable advice for improving a low score',
          ]} />
          <Para>Aim for 5–12 criteria per profile. The core already has 10 — adding too many produces reviewer fatigue.</Para>
        </>
      ),
    },
    {
      title: 'Gate types — advisory, major, critical',
      content: (
        <>
          <Para>
            Gates let a single criterion override the weighted average. Use them deliberately — only
            for criteria where a bad score is genuinely disqualifying, not just undesirable.
          </Para>
          <Bullets items={[
            <><strong>Advisory</strong> — flags a weakness but doesn't change the outcome. Use for best-practice criteria that are important but not showstoppers.</>,
            <><strong>Major</strong> — a score below threshold may cap the overall status to "Conditional Pass" even if the average is high. Use for criteria that signal significant structural gaps.</>,
            <><strong>Critical</strong> — failure blocks a pass entirely. Any critical gate failure → Reject, regardless of the average. Reserve for mandatory controls, compliance requirements, and fundamental showstoppers.</>,
          ]} />
          <Para>
            A criterion with <code>gate: false</code> contributes to the score only — no gate logic.
            Not every criterion needs a gate; over-gating produces false rejects.
          </Para>
          <AgentTip
            skill="earos-create"
            description="Instead of building a rubric from this form, ask your AI agent to run earos-create. It will interview you about your artifact type, guide you through design method selection, generate draft criteria with all required fields, and write the YAML — with validation."
          />
        </>
      ),
    },
    {
      title: 'The 0–4 scoring scale',
      content: <ScoreTable />,
    },
    {
      title: 'Saving and publishing',
      content: (
        <>
          <Para>
            Use <strong>Save to Repo</strong> to write to the canonical EaROS file path. Use{' '}
            <strong>Export</strong> to download a local copy. The editor validates against the rubric
            schema — errors appear in the status bar.
          </Para>
          <Para>
            After saving, run <code>node tools/editor/bin.js manifest add &lt;path&gt;</code> to add
            the new rubric to the manifest, or <code>node tools/editor/bin.js manifest</code> to
            regenerate the full manifest. The manifest is required for skills and the editor to
            discover your new rubric.
          </Para>
          <Para>
            Before using a new rubric in production, calibrate it: have 2+ reviewers score 3+
            representative artifacts independently and compute Cohen's κ (target &gt; 0.70). The
            <strong> earos-calibrate</strong> skill automates this.
          </Para>
        </>
      ),
    },
  ],
}

// ─── Edit Rubric help ──────────────────────────────────────────────────────────

const EDIT_RUBRIC_HELP: HelpPage = {
  heading: 'Edit Rubric Help',
  badge: 'Governance',
  badgeColor: '#1a237e',
  sections: [
    {
      title: 'How to load and modify an existing rubric',
      content: (
        <>
          <Para>
            Click <strong>Open from Repo</strong> in the toolbar to browse the manifest and load a
            rubric. Or use <strong>Import File</strong> to load a YAML file from disk. The form
            populates with the existing dimensions and criteria — edit any field in place.
          </Para>
          <Para>
            Use the YAML preview panel (code icon in the toolbar) to inspect the raw output as you
            edit. The editor validates against the schema continuously — errors appear in the status
            bar at the bottom.
          </Para>
        </>
      ),
    },
    {
      title: 'Adding dimensions and criteria',
      content: (
        <>
          <Para>
            Click <strong>Add Dimension</strong> to create a new dimension with a default weight of
            1.0. Within a dimension, click <strong>Add Criterion</strong> to create a new criterion
            scaffold. Fill in all required fields — the schema validator will tell you if anything is
            missing.
          </Para>
          <Para>
            Dimension <strong>weights</strong> affect the weighted average. Default is 1.0. A weight
            of 1.2 means that dimension contributes 20% more to the overall score. Tune weights after
            calibration, not before.
          </Para>
        </>
      ),
    },
    {
      title: 'The v2 required fields — what\'s commonly missing',
      content: (
        <>
          <Para>
            EaROS v2 added fields that older rubrics often lack. Every criterion must have all of these:
          </Para>
          <Bullets items={[
            <><code>scoring_guide</code> — object with keys "0" through "4", each a descriptive string. All five levels must be present.</>,
            <><code>examples.good</code> and <code>examples.bad</code> — lists of actual phrasing examples (what a reviewer would read in an artifact), not abstract descriptions.</>,
            <><code>decision_tree</code> — observable branching logic written in plain language. Pattern: "Count X: IF &lt;2 THEN score 0-1, IF 2-3 THEN score 2, IF 4+ AND Y THEN score 3, IF all + Z THEN score 4."</>,
            <><code>anti_patterns</code> — list of common artifact mistakes that produce misleadingly positive scores on this criterion.</>,
            <><code>remediation_hints</code> — list of actionable steps an architect can take to improve a low score.</>,
          ]} />
          <Para>
            Run <strong>earos-validate</strong> to detect any rubrics with missing v2 fields across
            the entire repository.
          </Para>
          <AgentTip
            skill="earos-profile-author"
            description="For technical YAML authoring help — field structure, v2 schema compliance, ID conventions — ask your AI agent to run earos-profile-author. It provides a technical reference and can review your YAML for issues."
          />
        </>
      ),
    },
    {
      title: 'Versioning and change governance',
      content: (
        <>
          <Para>
            Rubrics are governed assets. Changes require a version bump — tracked inside the file via
            the <code>version</code> field using semver:
          </Para>
          <Bullets items={[
            'MAJOR — breaking change to scoring model, gate structure, or status thresholds',
            'MINOR — new criteria added, existing criteria improved',
            'PATCH — documentation, examples, typo fixes',
          ]} />
          <Para>
            Do not change a rubric's scoring model or gate structure while an assessment using that
            rubric is in progress. The rubric is locked during evaluation (<code>rubric_locked: true</code>).
            Changes require a new version and should be noted in CHANGELOG.md.
          </Para>
        </>
      ),
    },
    {
      title: 'The 0–4 scoring scale (reference)',
      content: <ScoreTable />,
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
      title: 'How EaROS assessment works',
      content: (
        <>
          <Para>
            An EaROS assessment scores an architecture document against a rubric. For each criterion,
            you read the document, extract evidence (a direct quote or section reference), and assign
            a score from 0 to 4 using the criterion's level descriptors. Scores are aggregated with
            gate checks to produce an overall status: Pass, Conditional Pass, Rework Required, or Reject.
          </Para>
          <Para>
            EaROS distinguishes three types of judgment that must not be collapsed into one score:
          </Para>
          <Bullets items={[
            <><strong>Artifact quality</strong> — Is the document complete, coherent, clear, and traceable?</>,
            <><strong>Architectural fitness</strong> — Does the described architecture appear sound relative to business drivers, quality attributes, and risks?</>,
            <><strong>Governance fit</strong> — Does the design comply with mandatory principles, standards, and controls?</>,
          ]} />
        </>
      ),
    },
    {
      title: 'The four wizard steps',
      content: (
        <>
          <Bullets items={[
            <><strong>Step 1 — Core Rubric:</strong> Select the universal criteria. Usually only one option exists. This establishes the foundation every assessment starts from (9 dimensions, 10 criteria).</>,
            <><strong>Step 2 — Profile:</strong> Pick the profile matching the artifact type you're reviewing (Solution Architecture, Reference Architecture, ADR, Capability Map, Roadmap). The profile adds artifact-specific criteria on top of the core. Skip if the artifact type has no profile yet.</>,
            <><strong>Step 3 — Overlays:</strong> Add cross-cutting concerns. Tick "Security" if the design touches authentication, authorization, or personal data. Tick "Data Governance" if it describes data flows, retention, or classification. Tick "Regulatory" if the domain has compliance obligations.</>,
            <><strong>Step 4 — Artifact Details:</strong> Enter the document's title, author, version, and your reviewer name. This metadata is recorded in the evaluation output for traceability.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'After the wizard — the scoring form',
      content: (
        <>
          <Para>
            The wizard assembles a combined rubric from your selections and opens the scoring form.
            All criteria appear together, grouped by dimension. Colour-coded labels show the source:
            core criteria in blue, profile criteria in purple, overlay criteria in pink.
          </Para>
          <Para>
            For each criterion: expand the scoring guide to see level descriptors for that specific
            question, read the relevant section of the artifact, enter the evidence (quote or reference),
            select a score, and optionally record confidence. Gate criteria are labelled — pay
            attention to critical gates, which can trigger Reject immediately.
          </Para>
          <Para>
            You can export a partial evaluation and resume it later via "Continue Assessment."
          </Para>
          <AgentTip
            skill="earos-assess"
            description="Instead of scoring manually, ask your AI agent to run earos-assess. It follows the full 8-step DAG: structural validation → content extraction → criterion scoring → cross-reference validation → dimension aggregation → challenge pass → calibration → status determination. It produces a conforming evaluation record you can review and override."
          />
        </>
      ),
    },
  ],
}

// ─── Assessment form (scoring) help ───────────────────────────────────────────

const ASSESS_HELP: HelpPage = {
  heading: 'Scoring Help',
  badge: 'Reviewers',
  badgeColor: '#2e7d32',
  sections: [
    {
      title: 'The RULERS protocol — evidence first',
      content: (
        <>
          <Para>
            Every score requires a cited evidence anchor — a direct quote or specific section
            reference from the artifact. The RULERS protocol: for each criterion, extract evidence
            before assigning a score. If you cannot find evidence, record N/A and explain why.
            Never score from impression alone.
          </Para>
          <Bullets items={[
            'Good: "Section 3.2 provides a C4 context diagram; Section 5 shows deployment topology with named services and network boundaries."',
            'Bad: "The artifact seems to address this."',
            'Good: "Page 7 states: \'Authentication is handled by OAuth 2.0 with PKCE for all public-facing APIs.\'"',
            'Bad: "The document mentions security."',
          ]} />
          <Para>
            Classify your evidence as <em>observed</em> (direct quote), <em>inferred</em>
            (reasonable interpretation not directly stated), or <em>external</em> (judgment based on
            a standard or source outside the artifact). Observed evidence is most credible.
          </Para>
        </>
      ),
    },
    {
      title: 'The 0–4 scoring scale',
      content: (
        <>
          <Para>Open the scoring guide on any criterion to see level descriptors specific to that question. As a general reference:</Para>
          <ScoreTable />
        </>
      ),
    },
    {
      title: 'Confidence vs. score — they\'re separate',
      content: (
        <>
          <Para>
            Confidence (high / medium / low) is reported separately from the score. It tells the
            reader how certain you are — perhaps the artifact is ambiguous, or you're evaluating
            outside your area of expertise.
          </Para>
          <Para>
            <strong>Confidence does not change the score.</strong> A "low confidence, score 3" is
            recorded and aggregated as 3. Confidence informs how much weight a human reviewer places
            on the judgment; it does not modify the numerical result.
          </Para>
        </>
      ),
    },
    {
      title: 'Gate badges — what they mean',
      content: (
        <>
          <Para>Some criteria show a gate badge next to their title:</Para>
          <Bullets items={[
            <><strong style={{ color: '#b71c1c' }}>Critical (red)</strong> — If this criterion scores below threshold, the entire assessment is Reject. No average score can compensate for a critical gate failure. Evaluate these first.</>,
            <><strong style={{ color: '#e65100' }}>Major (orange)</strong> — A low score here may cap the overall status to Conditional Pass even if everything else scores well.</>,
            <><strong style={{ color: '#1565c0' }}>Advisory (blue)</strong> — A low score here triggers a recommendation in the output but doesn't change the pass/fail result.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'How overall status is determined',
      content: (
        <>
          <Para>Gates are checked first. Any critical gate failure → Reject immediately, no average computed.</Para>
          <Para>If no critical gates fail, the weighted dimension average determines status:</Para>
          <Bullets items={[
            'Pass — no critical gate failure + overall ≥ 3.2 + no dimension average below 2.0',
            'Conditional Pass — no critical gate failure + overall 2.4–3.19',
            'Rework Required — overall below 2.4, or any dimension repeatedly weak',
            'Reject — any critical gate failure or mandatory control breach',
            'Not Reviewable — evidence too incomplete to score responsibly',
          ]} />
          <Para>
            N/A criteria are excluded from the denominator. They don't drag down the score, but each
            must be justified in the rationale field. You cannot use N/A to avoid a hard criterion.
          </Para>
          <AgentTip
            skill="earos-review"
            description="After completing an assessment, ask your AI agent to run earos-review. The challenger agent audits your scores for over-scoring, unsupported claims, and missed evidence — giving you a second opinion before the record is finalised."
          />
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
            Evaluations are stored as <code>.evaluation.yaml</code> files in the EaROS repository
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
            drop zone to load an evaluation from disk. The file must be a valid EaROS evaluation
            record — it will be parsed and opened in the scoring form automatically.
          </Para>
          <Para>
            If the file references rubrics that can't be found on the server, you'll see a warning
            but can still view and edit the scores.
          </Para>
        </>
      ),
    },
    {
      title: 'What the evaluation statuses mean',
      content: (
        <>
          <Bullets items={[
            <><strong>Pass</strong> — No critical gate failures, overall ≥ 3.2, and no dimension average below 2.0. The architecture is ready for governance sign-off.</>,
            <><strong>Conditional Pass</strong> — No critical gate failures, overall 2.4–3.19. Weaknesses are containable with named actions. The evaluation record should list specific conditions that must be met.</>,
            <><strong>Rework Required</strong> — Overall below 2.4, or repeated weak dimensions. The architecture needs substantive revision before re-review.</>,
            <><strong>Reject</strong> — Any critical gate failure, or mandatory control breach. The document cannot advance regardless of its average score.</>,
            <><strong>Not Reviewable</strong> — Evidence too incomplete to score responsibly. Core gate criteria are unresolvable. Return the document for completion before scoring.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'Generating reports from evaluations',
      content: (
        <>
          <Para>
            Export a completed evaluation via the scoring form's <strong>Export</strong> button to
            produce a <code>.evaluation.yaml</code> file. This file is the source record for any
            downstream reporting.
          </Para>
          <AgentTip
            skill="earos-report"
            description="Ask your AI agent to run earos-report with one or more evaluation records. It generates executive summaries, portfolio dashboards, trend views, and status roll-ups — formatted for stakeholder communication."
          />
        </>
      ),
    },
  ],
}

// ─── Create Artifact help ──────────────────────────────────────────────────────

const CREATE_ARTIFACT_HELP: HelpPage = {
  heading: 'Create Artifact Help',
  badge: 'Architects',
  badgeColor: '#e65100',
  sections: [
    {
      title: 'What are architecture artifacts?',
      content: (
        <>
          <Para>
            An architecture artifact is a structured document describing a system design, decision,
            capability, or technology roadmap. In EaROS, artifacts are what gets reviewed —
            solution architectures, reference architectures, ADRs, capability maps, and roadmaps.
          </Para>
          <Para>
            The artifact editor helps you write documents in a format that EaROS can assess reliably.
            A well-structured artifact is easier to score and produces clearer, more actionable
            feedback.
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
            the schema has a deployment view section. This is the <em>derivation chain</em>:
          </Para>
          <Para>
            <strong>Rubric → Artifact Schema → Template → Your document.</strong>
          </Para>
          <Para>
            Complete every section in the form and you will automatically satisfy the evidence
            requirements of the matching rubric criteria. Leave sections blank and those criteria
            will score 0 or 1 during review — the reviewer can't cite evidence that isn't there.
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
            'For every architecture decision, name the alternatives you considered and explain why you chose the direction you did.',
            'For every risk, name the mitigation, the owner, and the residual risk level.',
            'For quality attributes (performance, availability, security), give measurable targets: "P99 latency < 200ms at 1000 RPS."',
            'Keep metadata current — title, version, author, and date — so reviewers know the document is live.',
          ]} />
        </>
      ),
    },
    {
      title: 'The sections explained',
      content: (
        <>
          <Para>The artifact schema sections map to core rubric dimensions:</Para>
          <Bullets items={[
            <><strong>Context and scope</strong> — What problem this solves, who the stakeholders are, what's in and out of scope. Maps to Clarity and Structure criteria.</>,
            <><strong>Business drivers and constraints</strong> — The business case and non-negotiable constraints. Maps to Decision-Readiness criteria.</>,
            <><strong>Architecture views</strong> — Context diagram, functional decomposition, deployment view, data flow. Maps to Completeness and Coherence criteria.</>,
            <><strong>Architecture decisions</strong> — Key choices made, alternatives rejected, reasoning. Maps to Traceability criteria.</>,
            <><strong>Quality attributes</strong> — Performance, availability, security, maintainability targets with measurable thresholds. Maps to Fitness criteria.</>,
            <><strong>Risks and mitigations</strong> — Named risks with likelihood, impact, mitigation, and owner. Maps to Risk criteria.</>,
            <><strong>Governance and compliance</strong> — Applicable standards, mandatory controls, compliance obligations met. Maps to Governance fit criteria.</>,
          ]} />
          <AgentTip
            skill="earos-artifact-gen"
            description="Instead of filling in this form manually, ask your AI agent to run earos-artifact-gen. It interviews you about your architecture, asks the right questions for each section, and generates a schema-compliant document — ready for EaROS assessment."
          />
        </>
      ),
    },
  ],
}

// ─── Edit Artifact help ────────────────────────────────────────────────────────

const EDIT_ARTIFACT_HELP: HelpPage = {
  heading: 'Edit Artifact Help',
  badge: 'Architects',
  badgeColor: '#e65100',
  sections: [
    {
      title: 'How to import and edit an existing document',
      content: (
        <>
          <Para>
            Click <strong>Import File</strong> or drag and drop a <code>.yaml</code> artifact file
            onto the editor to load it. The form populates with the existing content. Edit any section
            in place and save via <strong>Export</strong> (local download) or{' '}
            <strong>Save to Repo</strong> (write to the EaROS repository path).
          </Para>
          <Para>
            You can also open an existing artifact via the YAML preview panel to see the raw structure,
            which helps identify exactly which fields are populated and which are missing.
          </Para>
        </>
      ),
    },
    {
      title: 'Which sections map to which EaROS criteria',
      content: (
        <>
          <Para>
            Each section of the artifact document corresponds to evidence required by specific rubric
            criteria. Improving a weak section directly improves the score for its mapped criteria:
          </Para>
          <Bullets items={[
            <><strong>Context and scope</strong> → Clarity and Structure (core dimension). Thin or absent context = score 0–1 on clarity.</>,
            <><strong>Architecture views</strong> → Completeness and Coherence (core + profile). Missing views = score 0–2 even if other sections are strong.</>,
            <><strong>Architecture decisions</strong> → Traceability (core). Decisions without rationale or alternatives = score 1–2.</>,
            <><strong>Quality attributes</strong> → Fitness for Purpose (core). Vague targets without measurable thresholds = score 1–2.</>,
            <><strong>Risks and mitigations</strong> → Risk Awareness (core). Risks without owners or mitigations = score 1.</>,
            <><strong>Governance and compliance</strong> → Governance Fit (core, often gated). Absent = potential critical gate failure.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'Tips for improving a low score',
      content: (
        <>
          <Para>
            If you've received an assessment with low scores, the evaluation record will contain
            evidence citations and rationale for each criterion. Use these to identify exactly what's
            missing — then edit those specific sections.
          </Para>
          <Bullets items={[
            'A score of 0 or 1 almost always means the section is absent or contains only a sentence. Add substantive content.',
            'A score of 2 usually means the section exists but is incomplete. Add the missing elements named in the reviewer\'s rationale.',
            'A score of 3 can become 4 by adding cross-references between sections and strengthening the evidence — self-referencing within the document matters.',
            'Never address a gate criterion with a placeholder. A gate criterion scored 0 = Reject. Write it properly.',
          ]} />
          <AgentTip
            skill="earos-remediate"
            description="After receiving an assessment, ask your AI agent to run earos-remediate with the evaluation record. It produces a prioritized improvement plan: which criteria to fix first (by impact on the overall score), what to add to each section, and how to address gate failures — saving hours of interpretation work."
          />
        </>
      ),
    },
    {
      title: 'Tips for writing assessment-ready content',
      content: (
        <>
          <Bullets items={[
            'Be explicit. State decisions clearly — don\'t assume the reviewer already knows your context.',
            'Reference diagrams by section: "Figure 3 shows the deployment topology."',
            'For every decision, name the alternatives considered and explain the reasoning.',
            'For every risk, name the mitigation and the owner.',
            'For quality attributes, give measurable targets — not "high availability" but "99.9% uptime, RTO < 4h, RPO < 1h."',
          ]} />
        </>
      ),
    },
  ],
}

// ─── Mode → page config ────────────────────────────────────────────────────────

const VIEW_ASSESSMENT_HELP: HelpPage = {
  heading: 'Assessment Viewer Help',
  badge: 'All Roles',
  badgeColor: '#546e7a',
  sections: [
    {
      title: 'Reading the dashboard',
      content: (
        <>
          <Para>
            This is a <strong>read-only view</strong> of a completed EaROS evaluation record. You cannot
            edit scores here — use "Continue Assessment" from the home screen to modify an evaluation.
          </Para>
          <SectionHeading>Hero summary</SectionHeading>
          <Para>
            The top card shows three key metrics: <strong>Overall Status</strong> (Pass, Conditional Pass,
            Rework Required, or Reject), <strong>Overall Score</strong> (weighted average out of 4.0), and
            <strong> Gate Failures</strong> (critical/major control violations).
          </Para>
          <SectionHeading>Dimension overview</SectionHeading>
          <Para>
            Each dimension card shows its weighted average score with a progress bar. Green means above the
            Pass threshold (3.2), yellow means Conditional Pass range (2.4–3.19), red means below 2.4.
          </Para>
        </>
      ),
    },
    {
      title: 'Understanding gates and status',
      content: (
        <>
          <Bullets items={[
            <><strong>Critical gate failure</strong> — immediately triggers Reject status, regardless of average score.</>,
            <><strong>Major gate failure</strong> — caps status at Conditional Pass; the artifact cannot achieve Pass.</>,
            <><strong>Advisory</strong> — informational only; does not affect status.</>,
          ]} />
          <Para>
            Gates are checked <em>before</em> the weighted average is computed. A single critical failure
            overrides everything else.
          </Para>
        </>
      ),
    },
    {
      title: 'Criterion details and evidence',
      content: (
        <>
          <Para>
            Click any criterion row to expand its evidence, rationale, and recommended actions. Evidence
            references show the exact section and quotation from the artifact (the RULERS protocol).
          </Para>
          <Bullets items={[
            <><strong>Observed</strong> evidence — directly quoted from the artifact. Highest credibility.</>,
            <><strong>Inferred</strong> evidence — reasonable interpretation not directly stated.</>,
            <><strong>External</strong> evidence — based on a standard or policy outside the artifact.</>,
          ]} />
        </>
      ),
    },
    {
      title: 'Exporting',
      content: (
        <>
          <Para>
            Use the export button in the top-right to download the evaluation as YAML or Word. The YAML
            export preserves the full evaluation record for re-import. The Word export produces a
            formatted assessment report suitable for governance review.
          </Para>
        </>
      ),
    },
  ],
}

function getHelpPage(mode: AppMode): HelpPage {
  switch (mode) {
    case 'home':                return HOME_HELP
    case 'create-rubric':       return CREATE_RUBRIC_HELP
    case 'rubric':              return EDIT_RUBRIC_HELP
    case 'new-assessment':      return NEW_ASSESSMENT_HELP
    case 'assess':              return ASSESS_HELP
    case 'continue-assessment': return CONTINUE_ASSESSMENT_HELP
    case 'new-artifact':        return CREATE_ARTIFACT_HELP
    case 'edit-artifact':       return EDIT_ARTIFACT_HELP
    case 'view-assessment':     return VIEW_ASSESSMENT_HELP
    default:                    return HOME_HELP
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, pr: 1 }}>
        <HelpOutlineIcon sx={{ color: 'primary.main', fontSize: 22, flexShrink: 0 }} />
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
              borderBottom: '1px solid',
              borderColor: 'divider',
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
