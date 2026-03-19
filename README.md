# EAROS — Enterprise Architecture Rubric Operational Standard

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![GitHub](https://img.shields.io/badge/GitHub-ThomasRohde%2FEAROS-blue?logo=github)](https://github.com/ThomasRohde/EAROS)

**Version 2.0 · March 2026** · [github.com/ThomasRohde/EAROS](https://github.com/ThomasRohde/EAROS)

EAROS is a structured, extensible framework for evaluating enterprise architecture artifacts. It provides a universal rubric foundation, artifact-specific profiles, and cross-cutting overlays that together enable consistent, evidence-anchored assessment — by human reviewers and AI agents alike.

<p align="center">
  <img src="images/hero-home.png" width="49%" alt="EAROS Home Screen">
  <img src="images/hero-editor.png" width="49%" alt="EAROS Editor Screen">
</p>

> EAROS is to architecture review what a marking rubric is to an exam: it makes the criteria explicit, the scoring reproducible, and the feedback actionable.

---

## What is EAROS?

Architecture artifacts — solution designs, ADRs, capability maps, reference architectures, roadmaps — are evaluated constantly, but rarely consistently. Different reviewers apply different mental models. Review boards drift. AI-generated assessments hallucinate quality where there is none.

EAROS solves this by codifying evaluation criteria into governed, machine-readable rubrics. Each criterion has precise descriptors for every score level, mandatory evidence requirements, and unambiguous pass/fail gates. The result is architecture governance that scales: from a single architect reviewing a colleague's design, to an AI agent running nightly quality checks across hundreds of artifacts.

### Design Principles

1. **Concern-driven, not document-driven** — assess what matters to stakeholders, not just completeness
2. **Evidence first** — every score requires a cited excerpt or reference, not an impression
3. **Gates before averages** — critical failures cannot be hidden by high scores elsewhere
4. **Explainability over false precision** — ordinal scores with verbal anchors beat decimal averages
5. **Separate observation from inference** — what the artifact says vs. what it implies are different things
6. **Rubrics are governed assets** — versioned, owned, calibrated, not ad hoc checklists
7. **Agentic use must remain auditable** — AI evaluations must cite evidence and flag uncertainty
8. **Machine-readable where possible** — artifacts in structured formats are assessed more reliably

---

## The Three-Layer Model

```
┌─────────────────────────────────────────────────────────────────┐
│  OVERLAYS  (cross-cutting concerns)                             │
│  security  ·  data-governance  ·  regulatory                   │
├─────────────────────────────────────────────────────────────────┤
│  PROFILES  (artifact-specific extensions)                       │
│  solution-architecture  ·  reference-architecture  ·  adr       │
│  capability-map  ·  roadmap                                     │
├─────────────────────────────────────────────────────────────────┤
│  CORE  (universal foundation — all artifacts)                   │
│  core-meta-rubric.yaml                                       │
│  9 dimensions · 0–4 ordinal scale · 3 pass thresholds          │
└─────────────────────────────────────────────────────────────────┘
```

**Core** defines the nine dimensions that apply to every architecture artifact: stakeholder fit, scope clarity, concern coverage, traceability, internal consistency, risk coverage, compliance, actionability, and maintainability.

**Profiles** extend the core with artifact-specific dimensions. The solution-architecture profile adds optioning and quality-attribute criteria. The reference-architecture profile adds views, prescriptiveness, golden-path, and reusability criteria. Each profile inherits the core and adds 4–12 additional criteria.

**Overlays** inject cross-cutting criteria on top of any core+profile combination. Apply the security overlay when reviewing a design that touches authentication or data handling, regardless of its artifact type.

---

## Repository Structure

```
EAROS/
├── earos.manifest.yaml              Inventory of all rubric files (single source of truth)
│
├── standard/                        Standard documents and JSON schemas
│   ├── EAROS.md                     The EAROS standard (canonical reference)
│   ├── EAROS_Standard_v2.docx       Word version of the standard
│   └── schemas/
│       ├── rubric.schema.json       JSON Schema for core rubric / profile / overlay files
│       ├── evaluation.schema.json   JSON Schema for evaluation record files
│       └── artifact.schema.json     JSON Schema for architecture artifact documents
│                                    (derived from rubric required_evidence fields)
│
├── core/
│   └── core-meta-rubric.yaml        Universal rubric — applies to all artifacts
│
├── profiles/                        Artifact-specific rubric extensions
│   ├── solution-architecture.yaml
│   ├── reference-architecture.yaml
│   ├── adr.yaml
│   ├── capability-map.yaml
│   └── roadmap.yaml
│
├── overlays/                        Cross-cutting concern injectors
│   ├── security.yaml
│   ├── data-governance.yaml
│   └── regulatory.yaml
│
├── templates/                       Blank templates for assessors and authors
│   ├── new-profile.template.yaml    Scaffold for creating a new profile
│   └── evaluation-record.template.yaml  Blank evaluation record
│
├── tools/
│   ├── scoring-sheets/              Excel-based tools for manual assessment
│   │   └── EAROS_Scoring_Sheet_v2.xlsx
│   └── editor/                      Browser-based YAML editor (React + JSON Forms + Vite)
│       ├── bin.js                   CLI entry point (validate / manifest / start editor)
│       ├── src/
│       │   ├── components/          HomeScreen, AssessmentWizard, ArtifactEditor, …
│       │   └── utils/               schemaLoader, validate, yaml helpers
│       └── README.md
│
├── examples/
│   └── example-solution-architecture.evaluation.yaml  Worked evaluation
│
├── calibration/                     Calibration infrastructure
│   ├── gold-set/                    Reference artifacts with known scores
│   └── results/                     Calibration run outputs
│
├── research/                        Research underpinning the standard
│
├── docs/                            How-to guides
│   ├── getting-started.md
│   └── profile-authoring-guide.md
│
├── presentations/                   Slide decks for rollout and training
│
└── .claude/skills/                  Claude agent skills for EAROS workflows
    ├── earos-assess/                Full artifact assessment (8-step DAG)
    │   ├── SKILL.md
    │   └── references/              scoring-protocol, output-templates, calibration-benchmarks
    ├── earos-review/                Challenger / evaluation auditor
    ├── earos-template-fill/         Author coaching for assessment-ready artifacts
    ├── earos-create/                New rubric creation (profile, overlay, or core)
    ├── earos-profile-author/        YAML authoring guide and field reference
    ├── earos-calibrate/             Calibration exercises and reliability metrics
    ├── earos-report/                Executive reporting and portfolio dashboards
    └── earos-validate/              Repository health check and schema validation
```

### Schema derivation chain

The three schemas form a deliberate derivation chain:

```
rubric.schema.json          ← governs all rubric YAML files (core, profiles, overlays)
    ↓ required_evidence fields drive
artifact.schema.json        ← governs architecture artifact documents
    ↓ sections map to evidence requirements
evaluation-record.template.yaml / evaluation.schema.json
```

A well-completed artifact document satisfies the evidence requirements that rubric criteria require. When a profile adds criteria with new `required_evidence` fields, the artifact schema should be extended to add the corresponding sections. This chain makes EAROS end-to-end: rubric defines what counts as evidence → artifact schema structures how evidence is captured → evaluation schema records how it is scored.

---

## Quick Start

### Human Assessment

1. **Identify the artifact type** — solution architecture, ADR, capability map, reference architecture, or roadmap.
2. **Select the rubric set:**
   - Always start with [`core/core-meta-rubric.yaml`](core/core-meta-rubric.yaml)
   - Add the matching profile from [`profiles/`](profiles/)
   - Add any applicable overlays from [`overlays/`](overlays/)
3. **Score each criterion** on the 0–4 scale using the level descriptors. Record the evidence for each score.
   - **Option A — Browser editor:** `cd tools/editor && npm install && node bin.js` — guided wizard with criterion-by-criterion scoring
   - **Option B — Spreadsheet:** open `tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx`
4. **Check the gates** — any criterion marked as a gate failure overrides the aggregate score.
5. **Determine the status:**
   - ≥ 3.2 weighted average → **Pass**
   - 2.4–3.19 → **Conditional Pass** (remediation items required)
   - < 2.4 → **Rework Required**
   - Any gate failure → **Reject**

See [`docs/getting-started.md`](docs/getting-started.md) for a full walkthrough.

### AI-Agent Assessment

EAROS is designed for automated evaluation. The YAML rubric files are the machine-readable specification; the evaluation record schema (`standard/schemas/evaluation.schema.json`) defines the output format.

**Minimal agent prompt pattern:**

```
You are an architecture quality assessor. Apply the EAROS rubric defined in
[rubric YAML] to the artifact below. For each criterion:
  1. Extract the relevant evidence from the artifact (direct quote or reference)
  2. Score 0–4 against the level descriptors
  3. If you cannot find evidence, score N/A and explain
  4. Flag any gate criteria that fail
Produce output conforming to evaluation.schema.json.

<artifact>
[artifact content]
</artifact>
```

The rubric files include a `agent_evaluation` section defining an 8-step DAG:
`structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`

Calibrate your agent against the gold-set artifacts in [`calibration/gold-set/`](calibration/gold-set/) before using in production. Target inter-rater reliability of Cohen's κ > 0.70.

See [`standard/EAROS.md`](standard/EAROS.md) for the full specification of the agentic evaluation protocol.

---

## Tools

### EAROS Editor

A browser-based tool for creating and editing EAROS rubrics, running assessments, and authoring artifact documents. Built with React + JSON Forms + Material UI + Vite.

```bash
cd tools/editor
npm install
node bin.js                              # open home screen in browser (http://localhost:3000)
node bin.js ../../profiles/adr.yaml     # open editor with a file pre-loaded
node bin.js validate path/to/file.yaml  # validate a file, exit 0 (valid) / 1 (errors)
node bin.js manifest                    # regenerate earos.manifest.yaml from filesystem
node bin.js manifest add <path>         # add a single file to the manifest
node bin.js manifest check              # check manifest matches filesystem; exits non-zero on drift
```

**Home screen — 3×2 card layout:**

| Row | Card 1 | Card 2 |
|-----|--------|--------|
| For Governance Teams | Create Rubric | Edit Rubric |
| For Reviewers | New Assessment | Continue Assessment |
| For Architects | Create Artifact | Edit Artifact |

**Key features:**
- **Assessment wizard** — guided criterion-by-criterion scoring with evidence capture, gate tracking, and automatic status determination
- **Artifact editor** — structured document editor driven by `artifact.schema.json`; shows EAROS evidence requirements inline
- **Rubric editor** — tabbed JSON Forms view: Metadata / Dimensions & Criteria / Scoring & Outputs / Agent & Calibration
- **Schemas loaded via API** — schemas are served from the canonical `standard/schemas/` paths at runtime; no local copies to keep in sync
- **Manifest CLI** — `node bin.js manifest` regenerates `earos.manifest.yaml` by scanning `core/`, `profiles/`, `overlays/`
- **Live YAML preview** — right panel updates in real time; copy-to-clipboard button
- **Real-time validation** — status bar shows error count and first errors as you type

See [`tools/editor/README.md`](tools/editor/README.md) for full documentation.

---

## Scoring Reference

| Score | Label | Meaning |
|-------|-------|---------|
| 4 | Strong | Fully addressed, well evidenced, internally consistent, decision-ready |
| 3 | Good | Clearly addressed with adequate evidence and only minor gaps |
| 2 | Partial | Explicitly addressed but coverage incomplete, inconsistent, or weakly evidenced |
| 1 | Weak | Acknowledged or implied, but inadequate for decision support |
| 0 | Absent | No meaningful evidence, or evidence directly contradicts the criterion |
| N/A | Not applicable | Criterion genuinely does not apply to this artifact |

**Pass thresholds (weighted dimension average):**

| Status | Threshold |
|--------|-----------|
| Pass | ≥ 3.2 |
| Conditional Pass | 2.4 – 3.19 |
| Rework Required | < 2.4 |
| Reject | Any gate failure, regardless of average |

---

## Extending EAROS

### Creating a New Profile

Use [`templates/new-profile.template.yaml`](templates/new-profile.template.yaml) as your scaffold. The [`docs/profile-authoring-guide.md`](docs/profile-authoring-guide.md) describes five design methods:

- **Method A: Decision-Centred** — for ADRs, investment reviews
- **Method B: Viewpoint-Centred** — for capability maps, reference architectures
- **Method C: Lifecycle-Centred** — for transitions, roadmaps, handover docs
- **Method D: Risk-Centred** — for security, regulatory, resilience architecture
- **Method E: Pattern-Library** — for recurring platform services

Validate new profiles against [`standard/schemas/rubric.schema.json`](standard/schemas/rubric.schema.json).

### Calibrating an Agent or Reviewer

Before using EAROS in a governance process:
1. Score the artifacts in `calibration/gold-set/` independently
2. Compare against the reference scores using `calibration/results/`
3. Resolve disagreements against the level descriptors
4. Iterate until κ > 0.70 on well-defined criteria

---

## Claude Agent Skills

The `.claude/skills/` directory contains Claude agent skills for working with EAROS. Skills are auto-triggered by matching the user's request — no slash command needed:

| Skill | Purpose |
|-------|---------|
| `earos-assess` | Run a full EAROS evaluation on any architecture artifact (8-step DAG, RULERS protocol) |
| `earos-review` | Challenge an existing evaluation record — check for over-scoring and unsupported claims |
| `earos-template-fill` | Guide an artifact author through writing an assessment-ready document |
| `earos-profile-author` | Create a new profile or overlay with full v2 field completeness |
| `earos-calibrate` | Run calibration exercises and compute inter-rater reliability metrics |
| `earos-report` | Generate executive reports and portfolio dashboards from evaluation records |
| `earos-validate` | Health-check the repository — schema validation, ID uniqueness, cross-reference checks |

Each skill reads the actual YAML rubric files at runtime, so assessments always use the latest rubric version.

---

## Author

Thomas Rohde · [rohde.thomas@gmail.com](mailto:rohde.thomas@gmail.com) · [github.com/ThomasRohde](https://github.com/ThomasRohde)

---

## Contributing

Contributions to profiles, overlays, calibration artifacts, and documentation are welcome. When contributing:

- Use `<artifact-type>.yaml` for rubric files (no version number in filename)
- Validate YAML files against the JSON schemas in `standard/schemas/`
- Include level descriptors (0–4) and evidence requirements for every new criterion
- Add worked examples to `examples/` when introducing new profiles
- Document changes in `CHANGELOG.md`

---

## Standards and Research Foundation

EAROS draws on and extends:

- **TOGAF** Architecture Content Framework and governance practices
- **arc42** template structure and quality criteria
- **C4 Model** viewpoint hierarchy
- **RULERS** protocol for evidence-anchored rubric scoring
- **LLM-Rubric** and **AutoRubric** research on AI-agent evaluation reliability
- AWS/Azure/Google Well-Architected Frameworks

Full research documentation is in [`research/`](research/).

---

## License

This work is licensed under the [Creative Commons Attribution 4.0 International License](LICENSE) (CC BY 4.0).

You are free to use, adapt, and build upon EAROS for any purpose, including commercial, provided you give appropriate credit.
