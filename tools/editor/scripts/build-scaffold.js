/**
 * Build step: bundle EAROS framework files into scaffold/ so they ship with the npm package.
 * Run via: npm run build:scaffold
 */
import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..', '..')
const scaffoldDir = resolve(__dirname, '..', 'scaffold')

// Clean and recreate
if (existsSync(scaffoldDir)) {
  rmSync(scaffoldDir, { recursive: true })
}
mkdirSync(scaffoldDir, { recursive: true })

// Copy framework directories
for (const dir of ['core', 'profiles', 'overlays', 'templates']) {
  const src = join(repoRoot, dir)
  if (existsSync(src)) {
    cpSync(src, join(scaffoldDir, dir), { recursive: true })
    console.log(`  copied ${dir}/`)
  } else {
    console.warn(`  warning: ${src} not found, skipping`)
  }
}

// Copy schemas
const schemasSrc = join(repoRoot, 'standard', 'schemas')
if (existsSync(schemasSrc)) {
  cpSync(schemasSrc, join(scaffoldDir, 'standard', 'schemas'), { recursive: true })
  console.log('  copied standard/schemas/')
}

// Copy manifest
const manifestSrc = join(repoRoot, 'earos.manifest.yaml')
if (existsSync(manifestSrc)) {
  cpSync(manifestSrc, join(scaffoldDir, 'earos.manifest.yaml'))
  console.log('  copied earos.manifest.yaml')
}

// Copy skills to .agents/skills/ (agent-agnostic location, works with any AI coding agent)
const skillsSrc = join(repoRoot, '.claude', 'skills')
if (existsSync(skillsSrc)) {
  cpSync(skillsSrc, join(scaffoldDir, '.agents', 'skills'), { recursive: true })
  console.log('  copied skills → .agents/skills/')
}

// Copy README and patch .claude/skills/ references → .agents/skills/
const readmeSrc = join(repoRoot, 'README.md')
if (existsSync(readmeSrc)) {
  let readme = readFileSync(readmeSrc, 'utf8')
  readme = readme
    .replace(/\.claude\/skills\//g, '.agents/skills/')
    .replace(/## Claude Agent Skills/, '## Agent Skills')
    .replace(
      /The `\.agents\/skills\/` directory contains 10 Claude agent skills/,
      'The `.agents/skills/` directory contains 10 agent skills'
    )
  writeFileSync(join(scaffoldDir, 'README.md'), readme)
  console.log('  copied README.md (patched .agents/skills/)')
}

// Generate AGENTS.md — agent-agnostic project guide (no Claude-specific references)
const agentsMd = `# AGENTS.md — EAROS Project Guide

**Enterprise Architecture Rubric Operational Standard · Version 2.0**

This file tells AI coding agents how to work effectively in this project.

> **Greenfield project.** There are no published prior versions. Do not worry about backward compatibility — optimize for clarity and consistency over preserving legacy conventions.

---

## 1. Project Overview

EAROS is a structured, extensible framework for evaluating enterprise architecture artifacts. It makes architecture review consistent, explainable, and automatable — for both human reviewers and AI agents.

**The core problem it solves:** Architecture artifacts (solution designs, ADRs, capability maps, reference architectures, roadmaps) are evaluated constantly but rarely consistently. Different reviewers apply different mental models; AI assessments hallucinate quality. EAROS codifies evaluation criteria into governed, machine-readable rubrics with precise level descriptors, mandatory evidence requirements, and unambiguous pass/fail gates.

**Analogy:** EAROS is to architecture review what a marking rubric is to an exam — criteria explicit, scoring reproducible, feedback actionable.

### The Three-Layer Model

\`\`\`
┌──────────────────────────────────────────────────────────┐
│  OVERLAYS  (cross-cutting concerns)                      │
│  security · data-governance · regulatory                 │
├──────────────────────────────────────────────────────────┤
│  PROFILES  (artifact-specific extensions)                │
│  solution-architecture · reference-architecture · adr    │
│  capability-map · roadmap                                │
├──────────────────────────────────────────────────────────┤
│  CORE  (universal foundation — all artifacts)            │
│  core-meta-rubric.yaml  (EAROS-CORE-002)                 │
│  9 dimensions · 0–4 ordinal scale · gate model          │
└──────────────────────────────────────────────────────────┘
\`\`\`

- **Core** (\`core/core-meta-rubric.yaml\`, \`rubric_id: EAROS-CORE-002\`) defines 9 universal dimensions with 10 criteria that apply to every architecture artifact. Always evaluated.
- **Profiles** (\`profiles/\`) extend the core for specific artifact types. Each profile \`inherits: [EAROS-CORE-002]\`.
- **Overlays** (\`overlays/\`) inject cross-cutting concerns (security, data governance, regulatory) on top of any core+profile combination. Applied by context, not by artifact type.

---

## 2. Key Concepts

### 2.1 Scoring Model — 0–4 Ordinal + N/A

| Score | Label | Meaning |
|-------|-------|---------|
| 4 | Strong | Fully addressed, well evidenced, internally consistent, decision-ready |
| 3 | Good | Clearly addressed with adequate evidence and only minor gaps |
| 2 | Partial | Explicitly addressed but coverage incomplete, inconsistent, or weakly evidenced |
| 1 | Weak | Acknowledged or implied, but inadequate for decision support |
| 0 | Absent | No meaningful evidence, or evidence directly contradicts the criterion |
| N/A | Not applicable | Criterion genuinely does not apply in this scope/context |

**N/A policy:** Exclude N/A criteria from the denominator. Every N/A must be justified in the narrative.

**Confidence policy:** Confidence (\`high\` / \`medium\` / \`low\`) is reported separately from the score. It must NOT mathematically modify the score.

### 2.2 Gate Types

| Gate Type | Effect |
|-----------|--------|
| \`none\` | Contributes to score only; no gate logic |
| \`advisory\` | Weak performance triggers a recommendation |
| \`major\` | Significant weakness may cap the status |
| \`critical\` | Failure blocks pass status entirely; triggers \`reject\` |

### 2.3 Status Model

Evaluate gates first, then compute the weighted average.

| Status | Threshold |
|--------|-----------|
| **Pass** | No critical gate failure + overall ≥ 3.2 + no dimension < 2.0 |
| **Conditional Pass** | No critical gate failure + overall 2.4–3.19 |
| **Rework Required** | Overall < 2.4, or repeated weak dimensions, or insufficient evidence |
| **Reject** | Any critical gate failure, or mandatory control breach |
| **Not Reviewable** | Evidence too incomplete to score responsibly |

### 2.4 Evidence Classes

| Class | Meaning |
|-------|---------|
| \`observed\` | Directly supported by a quote or excerpt from the artifact |
| \`inferred\` | Reasonable interpretation not directly stated |
| \`external\` | Judgment based on a standard, policy, or source outside the artifact |

### 2.5 The Three Evaluation Types (Never Collapse)

1. **Artifact quality** — Is the artifact complete, coherent, clear, traceable, and fit for its stated purpose?
2. **Architectural fitness** — Does the described architecture appear sound relative to business drivers, quality attributes, risks, and tradeoffs?
3. **Governance fit** — Does the artifact/design comply with mandatory principles, standards, controls, and review expectations?

### 2.6 DAG Evaluation Flow (Agent Mode)

\`\`\`
structural_validation
    → content_extraction
        → criterion_scoring
            → cross_reference_validation
                → dimension_aggregation
                    → challenge_pass
                        → calibration
                            → status_determination
\`\`\`

**RULERS protocol** (evidence-anchored scoring): For each criterion, extract a direct quote or reference from the artifact before assigning a score. If no evidence can be found, record N/A and explain — never score from impression alone.

---

## 3. Project Structure

\`\`\`
<workspace>/
├── earos.manifest.yaml          Inventory of all EAROS rubric files
├── core/
│   └── core-meta-rubric.yaml    Universal foundation (EAROS-CORE-002)
├── profiles/                    Artifact-type extensions
│   ├── solution-architecture.yaml
│   ├── reference-architecture.yaml
│   ├── adr.yaml
│   ├── capability-map.yaml
│   └── roadmap.yaml
├── overlays/                    Cross-cutting injectors
│   ├── security.yaml
│   ├── data-governance.yaml
│   └── regulatory.yaml
├── standard/schemas/            JSON Schemas for validation
│   ├── rubric.schema.json
│   ├── evaluation.schema.json
│   └── artifact.schema.json
├── templates/                   Blank templates
├── evaluations/                 Your evaluation records go here
├── calibration/                 Calibration artifacts and results
└── .agents/skills/              Agent skills for EAROS workflows
    ├── earos-assess/
    ├── earos-review/
    ├── earos-template-fill/
    ├── earos-artifact-gen/
    ├── earos-create/
    ├── earos-profile-author/
    ├── earos-calibrate/
    ├── earos-report/
    ├── earos-validate/
    └── earos-remediate/
\`\`\`

---

## 4. EAROS CLI Usage

\`\`\`bash
earos                                        # Open the web editor
earos validate <file>                        # Validate a rubric/evaluation/artifact YAML
earos manifest                               # Regenerate the manifest
earos manifest add <path>                    # Add a single file to the manifest
earos manifest check                         # Verify manifest matches filesystem
earos init <dir>                             # Scaffold a new EAROS workspace
\`\`\`

After creating a new rubric, always run \`earos manifest add <path>\` to register it in \`earos.manifest.yaml\`.

---

## 5. Agent Skills in \`.agents/skills/\`

Each skill is a self-contained directory with a \`SKILL.md\` that provides instructions for AI agents. Skills read the actual YAML rubric files at runtime — they do not embed rubric content — so they always use the latest rubric version.

| Skill | Purpose |
|-------|---------|
| \`earos-assess\` | Run a full EAROS evaluation on any architecture artifact (8-step DAG, RULERS protocol) |
| \`earos-review\` | Challenge an existing evaluation record — check for over-scoring and unsupported claims |
| \`earos-template-fill\` | Guide an artifact author through writing an assessment-ready document |
| \`earos-artifact-gen\` | Guided interview → produces a schema-compliant artifact YAML document |
| \`earos-create\` | Create a new rubric from scratch — profile, overlay, or core rubric |
| \`earos-profile-author\` | Technical YAML authoring guide — v2 field structure, schema compliance |
| \`earos-calibrate\` | Run calibration exercises and compute inter-rater reliability metrics |
| \`earos-report\` | Generate executive reports and portfolio dashboards from evaluation records |
| \`earos-validate\` | Health-check the repository — schema validation, ID uniqueness, cross-reference checks |
| \`earos-remediate\` | Generate a prioritized improvement plan from an EAROS evaluation record |

### When to use which skill

| Task | Skill |
|------|-------|
| Assess an architecture artifact | \`earos-assess\` |
| Challenge or audit an existing evaluation | \`earos-review\` |
| Help write an artifact that will pass EAROS | \`earos-template-fill\` |
| Create a new architecture artifact through guided interview | \`earos-artifact-gen\` |
| Create a new rubric from scratch | \`earos-create\` |
| Get YAML structure help for an existing rubric design | \`earos-profile-author\` |
| Calibrate a rubric against gold-standard examples | \`earos-calibrate\` |
| Generate an executive report from evaluations | \`earos-report\` |
| Check the repo for schema errors and inconsistencies | \`earos-validate\` |
| Get a prioritized fix list from an evaluation record | \`earos-remediate\` |

---

## 6. How to Perform an Assessment

### Human Mode

1. Identify artifact type → select core + matching profile + applicable overlays
2. Score each criterion 0–4 using the \`scoring_guide\` level descriptors
3. Record the evidence: quote or reference for each score (observed / inferred / external)
4. Check gates — any critical gate failure → Reject immediately; do not compute average
5. Compute weighted dimension average → apply status thresholds
6. Record the evaluation in an output file conforming to \`evaluation.schema.json\`

### Agent Mode

Minimal prompt pattern:
\`\`\`
You are an architecture quality assessor. Apply the EAROS rubric defined in
[rubric YAML] to the artifact below. For each criterion:
  1. Extract the relevant evidence (direct quote or reference) — RULERS protocol
  2. Score 0–4 against the level descriptors in scoring_guide
  3. If you cannot find evidence, score N/A and explain why
  4. Flag any gate criteria that fail
  5. Classify evidence as observed / inferred / external
  6. Report confidence (high/medium/low) separately from the score
Produce output conforming to evaluation.schema.json.

<artifact>
[artifact content]
</artifact>
\`\`\`

Follow the DAG exactly:
\`structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination\`

Do not skip \`challenge_pass\` — this step has a second agent challenge the primary evaluator's scores.

---

## 7. File Naming Conventions

| File type | Pattern | Example |
|-----------|---------|---------|
| Rubric definitions (core, profiles, overlays) | \`<name>.yaml\` | \`reference-architecture.yaml\` |
| Evaluation records | \`<name>.evaluation.yaml\` | \`payments-api.evaluation.yaml\` |
| Templates | \`<name>.template.yaml\` | \`evaluation-record.template.yaml\` |
| JSON schemas | \`<name>.schema.json\` | \`rubric.schema.json\` |

- Kebab-case throughout; no spaces in filenames
- Version tracked inside the file (\`version: 2.0.0\`), never in the filename

---

## 8. Important Rules

1. **Never collapse the three evaluation types.** Artifact quality, architectural fitness, and governance fit are distinct judgments. Never merge them into a single opaque score.

2. **Gates before averages.** Always check gates before computing a weighted average. A single critical gate failure = Reject, no matter how high the average.

3. **Evidence first.** Every score requires a cited excerpt or reference. "Evidence: section 3 states X" is valid. "The artifact seems to address this" is not. Use RULERS anchoring.

4. **Confidence separate from score.** Reporting low confidence does not lower the score. Confidence informs how much weight a human reviewer places on the agent's output; it does not modify the numerical score.

5. **N/A requires justification.** You cannot use N/A to avoid a hard criterion. The narrative must explain why the criterion genuinely does not apply.

6. **Machine-readable formats preferred.** Artifacts in structured formats (YAML frontmatter, ArchiMate exchange, diagram-as-code) are assessed more reliably.

7. **Rubrics are governed assets.** Do not modify a rubric YAML's scoring model or gate structure without a version bump and owner approval. The rubric is locked during evaluation.

8. **Calibrate before production.** Any new profile or overlay must be calibrated against at least 3 representative artifacts with 2+ reviewers before use in a live governance process.

9. **Do not average across dimensions prematurely.** A dimension score of 0 is not neutralized by a dimension score of 4. No dimension < 2.0 is required for a Pass status.

10. **Agentic evaluations must be auditable.** The evaluation record must capture evidence anchors, evidence classes, and confidence so a human can inspect and override any agent judgment.

---

## Quick Reference

| Task | Where to start |
|------|---------------|
| Understand the full standard | \`standard/EAROS.md\` (if present) or \`README.md\` |
| Score any artifact | \`.agents/skills/earos-assess/SKILL.md\` |
| Create a new rubric | \`.agents/skills/earos-create/SKILL.md\` |
| Validate a rubric YAML | \`earos validate <file>\` |
| Regenerate the manifest | \`earos manifest\` |
| Check manifest consistency | \`earos manifest check\` |
`

writeFileSync(join(scaffoldDir, 'AGENTS.md'), agentsMd)
console.log('  generated AGENTS.md')

// Create .claude/ directory with thin CLAUDE.md that points to AGENTS.md
mkdirSync(join(scaffoldDir, '.claude'), { recursive: true })
writeFileSync(
  join(scaffoldDir, '.claude', 'CLAUDE.md'),
  `# EAROS Project

Read \`AGENTS.md\` for complete project documentation, methodology, and evaluation rules.

Skills are in \`.agents/skills/\` — Claude Code will discover them automatically.
`
)
console.log('  created .claude/CLAUDE.md (pointer to AGENTS.md)')

// Create placeholder directories (empty dirs don't survive npm pack)
for (const dir of ['evaluations', 'calibration/gold-set', 'calibration/results']) {
  mkdirSync(join(scaffoldDir, dir), { recursive: true })
  writeFileSync(join(scaffoldDir, dir, '.gitkeep'), '')
}

// Create a .gitignore for new workspaces
writeFileSync(
  join(scaffoldDir, '.gitignore'),
  'node_modules/\ndist/\n*.tgz\n.DS_Store\nThumbs.db\n'
)

console.log(`✓ Scaffold built: ${scaffoldDir}`)
