# EAROS — Enterprise Architecture Rubric Operational Standard

**Version 2.0 · March 2026**

EAROS is a structured, extensible framework for evaluating enterprise architecture artifacts. It provides a universal rubric foundation, artifact-specific profiles, and cross-cutting overlays that together enable consistent, evidence-anchored assessment — by human reviewers and AI agents alike.

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
│  security.v2  ·  data-governance.v2  ·  regulatory.v2          │
├─────────────────────────────────────────────────────────────────┤
│  PROFILES  (artifact-specific extensions)                       │
│  solution-architecture  ·  reference-architecture  ·  adr       │
│  capability-map  ·  roadmap                                     │
├─────────────────────────────────────────────────────────────────┤
│  CORE  (universal foundation — all artifacts)                   │
│  core-meta-rubric.v2.yaml                                       │
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
├── standard/                        Standard documents and JSON schemas
│   ├── EAROS_v2.md                  The EAROS standard (canonical reference)
│   ├── EAROS_Standard_v2.docx       Word version of the standard
│   └── schemas/
│       ├── rubric.schema.v2.json    JSON Schema for rubric/profile/overlay files
│       └── evaluation.schema.v2.json JSON Schema for evaluation record files
│
├── core/
│   └── core-meta-rubric.v2.yaml    Universal rubric — applies to all artifacts
│
├── profiles/                        Artifact-specific rubric extensions
│   ├── solution-architecture.v2.yaml
│   ├── reference-architecture.v2.yaml
│   ├── adr.v2.yaml
│   ├── capability-map.v2.yaml
│   └── roadmap.v2.yaml
│
├── overlays/                        Cross-cutting concern injectors
│   ├── security.v2.yaml
│   ├── data-governance.v2.yaml
│   └── regulatory.v2.yaml
│
├── templates/                       Blank templates for assessors and authors
│   ├── new-profile.template.yaml   Scaffold for creating a new profile
│   ├── evaluation-record.template.yaml  Blank evaluation record
│   └── reference-architecture/
│       └── Reference_Architecture_Template_v2.docx
│
├── tools/
│   └── scoring-sheets/             Excel-based tools for manual assessment
│       ├── EAROS_Scoring_Sheet_v2.xlsx
│       ├── EAROS_Scoring_Sheet.xlsx
│       └── EAROS_RefArch_Scoring_Sheet.xlsx
│
├── examples/
│   └── example-solution-architecture.evaluation.yaml  Worked evaluation
│
├── calibration/                     Calibration infrastructure
│   ├── gold-set/                   Reference artifacts with known scores
│   └── results/                    Calibration run outputs
│
├── research/                        Research underpinning the standard
│   ├── architecture-assessment-rubrics-research.md
│   ├── reference-architecture-research.md
│   └── architecture-assessment-rubrics-research.docx
│
├── docs/                            How-to guides
│   ├── getting-started.md
│   └── profile-authoring-guide.v2.md
│
├── presentations/                   Slide decks for rollout and training
│   ├── EAROS_v2_Part1_Overview.pptx
│   ├── EAROS_v2_Part2_Scoring.pptx
│   └── EAROS_v2_Part3_Implementation.pptx
│
└── .claude/skills/                  Claude agent skills for EAROS workflows
    ├── earos-assess/SKILL.md        Full artifact assessment (8-step DAG)
    ├── earos-review/SKILL.md        Challenger / evaluation auditor
    ├── earos-template-fill/SKILL.md Author coaching for assessment-ready artifacts
    ├── earos-profile-author/SKILL.md New profile and overlay creation
    ├── earos-calibrate/SKILL.md     Calibration exercises and reliability metrics
    ├── earos-report/SKILL.md        Executive reporting and portfolio dashboards
    └── earos-validate/SKILL.md      Repository health check and schema validation
```

---

## Quick Start

### Human Assessment

1. **Identify the artifact type** — solution architecture, ADR, capability map, reference architecture, or roadmap.
2. **Select the rubric set:**
   - Always start with [`core/core-meta-rubric.v2.yaml`](core/core-meta-rubric.v2.yaml)
   - Add the matching profile from [`profiles/`](profiles/)
   - Add any applicable overlays from [`overlays/`](overlays/)
3. **Open the scoring sheet** in [`tools/scoring-sheets/`](tools/scoring-sheets/) — `EAROS_Scoring_Sheet_v2.xlsx` for most artifacts, `EAROS_RefArch_Scoring_Sheet.xlsx` for reference architectures.
4. **Score each criterion** on the 0–4 scale using the level descriptors. Record the evidence for each score.
5. **Check the gates** — any criterion marked as a gate failure overrides the aggregate score.
6. **Determine the status:**
   - ≥ 3.2 weighted average → **Pass**
   - 2.4–3.19 → **Conditional Pass** (remediation items required)
   - < 2.4 → **Rework Required**
   - Any gate failure → **Reject**

See [`docs/getting-started.md`](docs/getting-started.md) for a full walkthrough.

### AI-Agent Assessment

EAROS is designed for automated evaluation. The YAML rubric files are the machine-readable specification; the evaluation record schema (`standard/schemas/evaluation.schema.v2.json`) defines the output format.

**Minimal agent prompt pattern:**

```
You are an architecture quality assessor. Apply the EAROS rubric defined in
[rubric YAML] to the artifact below. For each criterion:
  1. Extract the relevant evidence from the artifact (direct quote or reference)
  2. Score 0–4 against the level descriptors
  3. If you cannot find evidence, score N/A and explain
  4. Flag any gate criteria that fail
Produce output conforming to evaluation.schema.v2.json.

<artifact>
[artifact content]
</artifact>
```

The rubric files include a `agent_evaluation` section defining an 8-step DAG:
`structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`

Calibrate your agent against the gold-set artifacts in [`calibration/gold-set/`](calibration/gold-set/) before using in production. Target inter-rater reliability of Cohen's κ > 0.70.

See [`standard/EAROS_v2.md`](standard/EAROS_v2.md) for the full specification of the agentic evaluation protocol.

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

Use [`templates/new-profile.template.yaml`](templates/new-profile.template.yaml) as your scaffold. The [`docs/profile-authoring-guide.v2.md`](docs/profile-authoring-guide.v2.md) describes five design methods:

- **Method A: Decision-Centred** — for ADRs, investment reviews
- **Method B: Viewpoint-Centred** — for capability maps, reference architectures
- **Method C: Lifecycle-Centred** — for transitions, roadmaps, handover docs
- **Method D: Risk-Centred** — for security, regulatory, resilience architecture
- **Method E: Pattern-Library** — for recurring platform services

Validate new profiles against [`standard/schemas/rubric.schema.v2.json`](standard/schemas/rubric.schema.v2.json).

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

## Contributing

Contributions to profiles, overlays, calibration artifacts, and documentation are welcome. When contributing:

- Follow the naming convention `<artifact-type>.v<major>.yaml`
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
