# CLAUDE.md — EAROS Project Guide

**Enterprise Architecture Rubric Operational Standard · Version 2.0**

This file tells Claude how to work effectively in this project.

> **Greenfield project.** There are no published prior versions. Do not worry about backward compatibility — optimize for clarity and consistency over preserving legacy conventions.

---

## 1. Project Overview

EAROS is a structured, extensible framework for evaluating enterprise architecture artifacts. It makes architecture review consistent, explainable, and automatable — for both human reviewers and AI agents.

**The core problem it solves:** Architecture artifacts (solution designs, ADRs, capability maps, reference architectures, roadmaps) are evaluated constantly but rarely consistently. Different reviewers apply different mental models; AI assessments hallucinate quality. EAROS codifies evaluation criteria into governed, machine-readable rubrics with precise level descriptors, mandatory evidence requirements, and unambiguous pass/fail gates.

**Analogy:** EAROS is to architecture review what a marking rubric is to an exam — criteria explicit, scoring reproducible, feedback actionable.

### The Three-Layer Model

```
┌──────────────────────────────────────────────────────────┐
│  OVERLAYS  (cross-cutting concerns)                      │
│  security · data-governance · regulatory                 │
├──────────────────────────────────────────────────────────┤
│  PROFILES  (artifact-specific extensions)                │
│  solution-architecture · reference-architecture · adr    │
│  capability-map · roadmap                                │
├──────────────────────────────────────────────────────────┤
│  CORE  (universal foundation — all artifacts)            │
│  core-meta-rubric.yaml  (EAROS-CORE-002)             │
│  9 dimensions · 0–4 ordinal scale · gate model          │
└──────────────────────────────────────────────────────────┘
```

- **Core** (`core/core-meta-rubric.yaml`, `rubric_id: EAROS-CORE-002`) defines 9 universal dimensions with 10 criteria that apply to every architecture artifact. Always evaluated.
- **Profiles** (`profiles/`) extend the core for specific artifact types (e.g., reference-architecture adds 11 criteria across 6 dimensions). Each profile `inherits: [EAROS-CORE-002]`.
- **Overlays** (`overlays/`) inject cross-cutting concerns (security, data governance, regulatory) on top of any core+profile combination. Applied by context, not by artifact type.

One global rubric is too generic; fully bespoke rubrics are ungovernable. This layered model is the balance.

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

The 0–4 scale is intentional. A 1–10 scale creates false precision and lowers calibration quality. For pure agent evaluation, an optional 0–3 collapse is permitted but must be declared in the metadata.

**N/A policy:** Exclude N/A criteria from the denominator. Every N/A must be justified in the narrative.

**Confidence policy:** Confidence (`high` / `medium` / `low`) is reported separately from the score. It must NOT mathematically modify the score. These are two different things.

### 2.2 Gate Types

Gates prevent bad scores being hidden by weighted averages.

| Gate Type | Effect |
|-----------|--------|
| `none` | Contributes to score only; no gate logic |
| `advisory` | Weak performance triggers a recommendation |
| `major` | Significant weakness may cap the status (e.g., cannot pass above `conditional_pass`) |
| `critical` | Failure blocks pass status entirely; triggers `reject` regardless of average |

Gate fields in YAML:
```yaml
gate:
  enabled: true
  severity: critical          # none | advisory | major | critical
  failure_effect: reject when mandatory control compliance cannot be determined
```

Or simply `gate: false` for no gate.

### 2.3 Status Model

Evaluate gates first, then compute the weighted average.

| Status | Threshold |
|--------|-----------|
| **Pass** | No critical gate failure + overall ≥ 3.2 + no dimension < 2.0 |
| **Conditional Pass** | No critical gate failure + overall 2.4–3.19 (weaknesses containable with named actions) |
| **Rework Required** | Overall < 2.4, or repeated weak dimensions, or insufficient evidence |
| **Reject** | Any critical gate failure, or mandatory control breach |
| **Not Reviewable** | Evidence too incomplete to score responsibly; core gate criteria unresolvable |

### 2.4 Evidence Classes

Every score must cite evidence. Reviewers (human or agent) must classify the evidence type:

| Class | Meaning |
|-------|---------|
| `observed` | Directly supported by a quote or excerpt from the artifact |
| `inferred` | Reasonable interpretation not directly stated |
| `external` | Judgment based on a standard, policy, or source outside the artifact |

This separation is a design principle, not optional annotation. Observed > inferred > external in credibility.

### 2.5 The Three Evaluation Types (Never Collapse)

The standard distinguishes three distinct judgment types that must not be merged into a single score:

1. **Artifact quality** — Is the artifact complete, coherent, clear, traceable, and fit for its stated purpose?
2. **Architectural fitness** — Does the described architecture appear sound relative to business drivers, quality attributes, risks, and tradeoffs?
3. **Governance fit** — Does the artifact/design comply with mandatory principles, standards, controls, and review expectations?

These are related but distinct. A beautiful, complete artifact can describe an architecturally unsound system.

### 2.6 DAG Evaluation Flow (Agent Mode)

Agents must follow this 8-step directed acyclic graph:

```
structural_validation
    → content_extraction
        → criterion_scoring
            → cross_reference_validation
                → dimension_aggregation
                    → challenge_pass
                        → calibration
                            → status_determination
```

The rubric is locked during evaluation (`rubric_locked: true`). Calibration uses the RULERS Wasserstein-based method (`calibration_method: rulers_wasserstein`).

**RULERS protocol** (evidence-anchored scoring): For each criterion, extract a direct quote or reference from the artifact before assigning a score. If no evidence can be found, record N/A and explain — never score from impression alone.

---

## 3. Project Structure

```
EAROS/
├── earos.manifest.yaml          Inventory of all EAROS rubric files (auto-generated; keep up to date)
│
├── standard/
│   ├── EAROS.md                  Canonical standard (read this first for deep understanding)
│   ├── EAROS_Standard_v2.docx       Word version
│   └── schemas/
│       ├── rubric.schema.json    JSON Schema for all rubric/profile/overlay YAML files
│       ├── evaluation.schema.json JSON Schema for evaluation record output files
│       └── artifact.schema.json  JSON Schema for architecture artifact documents (NEW)
│
├── core/
│   └── core-meta-rubric.yaml    The universal foundation (EAROS-CORE-002)
│                                   9 dimensions, 10 criteria, always applied
│
├── profiles/                        Artifact-type extensions (inherit core)
│   ├── solution-architecture.yaml
│   ├── reference-architecture.yaml   ← First full profile; model for others
│   ├── adr.yaml
│   ├── capability-map.yaml
│   └── roadmap.yaml
│
├── overlays/                        Cross-cutting injectors (applied by context)
│   ├── security.yaml            (EAROS-OVR-SEC-001)
│   ├── data-governance.yaml
│   └── regulatory.yaml
│
├── templates/
│   ├── new-profile.template.yaml   Scaffold for new profiles
│   └── evaluation-record.template.yaml  Blank evaluation record
│
├── tools/scoring-sheets/
│   └── EAROS_Scoring_Sheet_v2.xlsx         General-purpose manual scoring
│
├── examples/
│   └── example-solution-architecture.evaluation.yaml   Worked evaluation record
│
├── calibration/
│   ├── gold-set/       Reference artifacts with known scores (calibrate against these)
│   └── results/        Calibration run outputs
│
├── docs/
│   ├── getting-started.md
│   └── profile-authoring-guide.md   How to create profiles
│
└── research/           Research underpinning the standard (63 sources)
```

---

## 4. Working with Rubric YAML Files

### Structure: Core Meta-Rubric and Profiles

```yaml
rubric_id: EAROS-PROF-XXX         # Unique ID
version: 1.0.0                    # Semver
kind: profile                     # core_rubric | profile | overlay
title: "..."
status: draft                     # draft | candidate | approved | deprecated
effective_date: "YYYY-MM-DD"
owner: enterprise-architecture
artifact_type: reference_architecture
inherits:
  - EAROS-CORE-002                # Profiles always inherit the core
design_method: pattern_library    # See Section 5 below

dimensions:
  - id: RA-D1
    name: Architecture views and completeness
    description: "..."
    weight: 1.2                   # Relative weight for aggregation (default 1.0)
    criteria:
      - id: RA-VIEW-01
        question: "Does the reference architecture include context, functional, deployment, and data flow views?"
        description: "..."
        metric_type: ordinal
        scale: [0, 1, 2, 3, 4, "N/A"]
        gate:
          enabled: true
          severity: major
          failure_effect: Cannot pass if score < 2
        required_evidence:
          - context diagram (C4 Level 1 or equivalent)
          - deployment diagram showing infrastructure topology
        scoring_guide:
          "0": Single diagram only, or no architectural views
          "1": Two views present but incomplete
          "2": Three views present, data flow narrative partial
          "3": All four views present with adequate detail
          "4": All four views, consistent, with security view and cross-references
        anti_patterns:
          - Single box-and-arrow diagram presented as complete architecture
        examples:
          good:
            - "Section 3 provides C4 context diagram. Section 5 shows container decomposition..."
          bad:
            - "See architecture diagram on page 3."
        decision_tree: >
          Count distinct views: IF < 2 THEN score 0-1. IF 2-3 views THEN score 2.
          IF 4+ views AND data flow narrative exists THEN score 3.
          IF all views cross-referenced AND security view included THEN score 4.
        remediation_hints:
          - Add missing views using C4 model levels
          - Add numbered data flow walkthrough

scoring:
  scale: 0-4 ordinal plus N/A
  method: gates_first_then_weighted_average
  thresholds:
    pass: No critical gate failure, overall >= 3.2, and no dimension < 2.0
    conditional_pass: No critical gate failure and overall 2.4-3.19
    rework_required: Overall < 2.4
    reject: Critical gate failure

outputs:
  require_evidence_refs: true
  require_confidence: true
  require_actions: true
  require_evidence_class: true
  require_evidence_anchors: true

calibration:
  required_before_production: true
  minimum_examples: 3
```

### Overlay Structure

Overlays use `kind: overlay` and `artifact_type: any`. Their `scoring.method` is `append_to_base_rubric` — they do not replace the base scoring; they add criteria on top. Overlays typically have at least one `critical` gate.

### Schema Validation

Three JSON Schemas live in `standard/schemas/`:

| Schema | Validates | Kind discriminator |
|--------|-----------|--------------------|
| `rubric.schema.json` | Core rubrics, profiles, overlays | `kind: core_rubric`, `profile`, `overlay` |
| `evaluation.schema.json` | Evaluation records | `kind: evaluation` |
| `artifact.schema.json` | Architecture artifact documents | `kind: artifact` |

**Derivation chain:** Rubric → Artifact Schema → Template. The `artifact.schema.json` is derived directly from the `required_evidence` fields of the core meta-rubric and profiles. Each section in the artifact schema maps to the evidence a rubric criterion requires. When a profile adds criteria with new `required_evidence`, the corresponding artifact schema should be updated to add those sections. This chain means a well-completed artifact document will satisfy the evidence requirements for its rubric criteria.

Rubric YAML files must validate against `rubric.schema.json`. Required top-level fields: `rubric_id`, `version`, `kind`, `title`, `artifact_type`, `dimensions`, `scoring`, `outputs`.

Evaluation records must validate against `evaluation.schema.json`.

Artifact documents must validate against `artifact.schema.json`.

---

## 5. How to Create a New Profile

### Step 1 — Qualify the need
- The artifact type must recur enough to justify standardization.
- The core meta-rubric alone must be insufficient for this artifact type.
- Gather 3–5 representative real artifacts for calibration.

### Step 2 — Choose a design method

| Method | Best For |
|--------|----------|
| A: Decision-Centred | ADRs, investment reviews, exception requests |
| B: Viewpoint-Centred | Capability maps, reference architectures |
| C: Lifecycle-Centred | Transition designs, roadmaps, handover docs |
| D: Risk-Centred | Security, regulatory, resilience architecture |
| E: Pattern-Library | Recurring reference patterns, platform services |

### Step 3 — Copy the template

Start from `templates/new-profile.template.yaml`. Set:
- `kind: profile`
- `inherits: [EAROS-CORE-002]`
- `design_method` from step 2
- `rubric_id` using pattern `EAROS-<ARTIFACT>-<NNN>`

### Step 4 — Write 5–12 criteria

Rules:
- Add **no more than 5–12 criteria** (the core already has 10)
- Every criterion needs: `question`, `description`, `scoring_guide` (all 5 levels 0–4), `required_evidence`, `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, `remediation_hints`
- Assign each criterion to a dimension with an appropriate `weight`
- Designate gate types deliberately — not every criterion needs a gate; over-gating creates false rejects
- Include at least one `major` gate for the most critical dimension

### Step 5 — Calibrate before production
1. Build a calibration pack: 1 strong, 1 weak, 1 ambiguous, 1 incomplete artifact
2. Have 2+ reviewers score independently against the profile
3. Compute Cohen's κ — target > 0.70 for well-defined criteria, > 0.50 for subjective ones
4. Identify disagreements; resolve against the level descriptors
5. Update `decision_tree` and `scoring_guide` where disagreements clustered

### Step 6 — Publish
- Validate YAML against `standard/schemas/rubric.schema.json`
- Add worked examples to `examples/`
- Document in `CHANGELOG.md`
- File naming: `<artifact-type>.v<major>.yaml`

---

## 6. How to Create a New Overlay

### Profile vs. Overlay — the distinction

| Use a **profile** when... | Use an **overlay** when... |
|---------------------------|---------------------------|
| The artifact type is distinct and recurring | The concern cuts across multiple artifact types |
| Criteria only make sense for this artifact type | Criteria apply regardless of artifact type |
| You extend the dimensional structure | You inject additional criteria into any rubric |

### Overlay structure

```yaml
kind: overlay
artifact_type: any              # Not tied to a specific artifact type
# No 'inherits' field — overlays don't inherit, they append
scoring:
  method: append_to_base_rubric  # Key difference from profiles
```

### When to apply an overlay

Apply overlays based on context, not artifact type. Examples:
- **Security overlay** whenever the design touches authentication, authorization, or personal data
- **Data governance overlay** whenever the artifact describes data flows, retention, or classification
- **Regulatory overlay** for artifacts in regulated domains (payments, healthcare, financial reporting)

Overlays are additive — they cannot remove or weaken gates from the base rubric. An overlay's `critical` gate adds to, not replaces, the base gate model.

---

## 7. How to Perform an Assessment

### Human Mode

1. Identify artifact type → select core + matching profile + applicable overlays
2. Open `tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx`
3. Score each criterion 0–4 using the `scoring_guide` level descriptors
4. Record the evidence: quote or reference for each score (observed / inferred / external)
5. Check gates — any critical gate failure → Reject immediately; do not compute average
6. Compute weighted dimension average → apply status thresholds
7. Record the evaluation in an output file conforming to `evaluation.schema.json`

### Agent Mode

Minimal prompt pattern:
```
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
```

Follow the DAG exactly:
`structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`

Do not skip `challenge_pass` — this step has a second agent challenge the primary evaluator's scores.

Calibrate against `calibration/gold-set/` before production use. Target κ > 0.70.

### Hybrid Mode

Human and agent evaluate independently, then reconcile. Disagreements of ≥ 2 points on any criterion must be resolved against the level descriptors before finalizing the record. The evaluation record captures both evaluators (`mode: human` and `mode: agent`).

---

## 8. Conventions

### File Naming

The `kind` field is the universal type discriminator. Version is tracked inside the file (`version: 2.0.0`), not in the filename.

| File type | Pattern | Example |
|-----------|---------|---------|
| Rubric definitions (core, profiles, overlays) | `<name>.yaml` | `reference-architecture.yaml` |
| Evaluation records | `<name>.evaluation.yaml` | `payments-api.evaluation.yaml` |
| Templates | `<name>.template.yaml` | `evaluation-record.template.yaml` |
| JSON schemas | `<name>.schema.json` | `rubric.schema.json` |

- Kebab-case throughout; no spaces in filenames
- Version is tracked inside the file only (`version: 2.0.0`), never in the filename
- The `kind` field distinguishes file purpose: `core_rubric`, `profile`, `overlay`, `evaluation`

### Versioning (Semver)
- `MAJOR` — breaking change to scoring model, gate structure, or status thresholds
- `MINOR` — new criteria added, existing criteria improved
- `PATCH` — documentation, examples, typo fixes

The `rubric_locked: true` flag in `agent_evaluation` means an agent must not modify rubric criteria during evaluation. Changes require a version bump and governance.

### YAML Style
- Two-space indentation
- String keys quoted when they are numeric: `"0": "Absent"`, `"4": "Strong"`
- Multi-line descriptions use `>` block scalar
- Lists of evidence items use `- item` format (one item per line)
- `gate: false` (not `gate: {enabled: false}`) when no gate needed

### Required Fields for Every New Criterion

`id`, `question`, `description`, `metric_type: ordinal`, `scale: [0, 1, 2, 3, 4, "N/A"]`, `gate`, `required_evidence`, `scoring_guide` (keys `"0"` through `"4"`), `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, `remediation_hints`

---

## 9. Important Rules

1. **Never collapse the three evaluation types.** Artifact quality, architectural fitness, and governance fit are distinct judgments. Never merge them into a single opaque score.

2. **Gates before averages.** Always check gates before computing a weighted average. A single critical gate failure = Reject, no matter how high the average.

3. **Evidence first.** Every score requires a cited excerpt or reference. "Evidence: section 3 states X" is valid. "The artifact seems to address this" is not. Use RULERS anchoring.

4. **Confidence separate from score.** Reporting low confidence does not lower the score. Confidence informs how much weight a human reviewer places on the agent's output; it does not modify the numerical score.

5. **N/A requires justification.** You cannot use N/A to avoid a hard criterion. The narrative must explain why the criterion genuinely does not apply.

6. **Machine-readable formats preferred.** Artifacts in structured formats (YAML frontmatter, ArchiMate exchange, diagram-as-code) are assessed more reliably. Prefer structured output formats (YAML/JSON) for evaluation records.

7. **Rubrics are governed assets.** Do not modify a rubric YAML's scoring model or gate structure without a version bump and owner approval. The rubric is locked during evaluation.

8. **Calibrate before production.** Any new profile or overlay must be calibrated against at least 3 representative artifacts with 2+ reviewers before being used in a live governance process.

9. **Do not average across dimensions prematurely.** A dimension score of 0 is not neutralized by a dimension score of 4. The status thresholds include a floor check: no dimension < 2.0 for a Pass status.

10. **Agentic evaluations must be auditable.** The evaluation record must capture evidence anchors, evidence classes, and confidence so a human can inspect and override any agent judgment.

---

## 10. The Reference Architecture Profile — Model for Other Profiles

`profiles/reference-architecture.yaml` (`EAROS-REFARCH-001`) is the first full profile in EAROS v2 and serves as the reference implementation for how profiles should be built.

**Why it is a good model:**
- Uses `design_method: pattern_library` (Method E) — appropriate for recurring platform blueprints
- Has 9 criteria across 6 profile-specific dimensions, combined with the 10 core criteria = 19 criteria total
- Every criterion has all required fields including `examples.good`, `examples.bad`, and `decision_tree`
- Gate types are carefully graduated: 4 `major` gates, no `critical` gates (critical gates reserved for compliance-level concerns)
- Dimension weights are tuned: implementation actionability (RA-D4) and views (RA-D1) weighted at 1.2 to reflect their importance; reusability/evolution (RA-D6) at 0.8 as secondary
- Calibration pack is specified explicitly: 1 strong, 1 weak, 1 ambiguous, 1 golden-path artifact

**Paired with an artifact schema:** `standard/schemas/artifact.schema.json` is derived from the rubric's `required_evidence` fields and defines the structure of a compliant reference architecture document. This pattern — rubric + artifact schema — should be replicated for each new profile. The artifact schema is usable by JSON Forms to render an artifact creation form in the editor.

**Illustrative decision tree pattern** (from RA-VIEW-01):
```
Count distinct views:
  IF < 2 THEN score 0-1
  IF 2-3 views THEN score 2
  IF 4+ views AND data flow narrative exists THEN score 3
  IF all views cross-referenced AND security view included THEN score 4
```
This pattern — count observable features, branch on presence — is the right template for `decision_tree` fields throughout the framework.

---

## 11. Agent Skills

The `.claude/skills/` directory contains Claude agent skills for working with EAROS. Each skill lives in its own subdirectory with a `SKILL.md` file. Skills are auto-triggered when their description matches the user's request — no slash command needed.

```
.claude/skills/
├── earos-assess/SKILL.md        Core assessment — runs the full 8-step DAG evaluation on any artifact
├── earos-review/SKILL.md        Challenger — audits an existing evaluation record for over-scoring and unsupported claims
├── earos-template-fill/SKILL.md Author guide — coaches artifact authors through writing assessment-ready documents
├── earos-create/SKILL.md        Rubric creation — guided interview + YAML generation for profiles, overlays, and core rubrics
├── earos-profile-author/SKILL.md Profile YAML authoring — technical reference for v2 field structure and schema compliance
├── earos-calibrate/SKILL.md     Calibration — runs calibration exercises and computes inter-rater reliability
├── earos-report/SKILL.md        Reporting — generates executive reports from evaluation records
└── earos-validate/SKILL.md      Health check — validates all YAML rubrics against schemas and checks consistency
```

### When to use which skill

| Task | Skill |
|------|-------|
| Assess an architecture artifact | `earos-assess` |
| Challenge or audit an existing evaluation | `earos-review` |
| Help write an artifact that will pass EAROS | `earos-template-fill` |
| Create a new rubric from scratch (profile, overlay, or core) | `earos-create` |
| Get YAML structure help after criteria are defined | `earos-profile-author` |
| Calibrate a rubric against gold-standard examples | `earos-calibrate` |
| Generate an executive report from evaluation(s) | `earos-report` |
| Check the repo for schema errors and inconsistencies | `earos-validate` |

**Key design principle for all skills:** Every skill instructs Claude to read the actual YAML rubric files at runtime. The skills do not embed rubric content — they load it dynamically. This means skills automatically use the latest rubric version without needing updates.

---

## 12. Manifest (earos.manifest.yaml)

`earos.manifest.yaml` (at the repo root) is the authoritative inventory of all EAROS rubric files. It lists every core rubric, profile, and overlay with their paths, rubric IDs, titles, artifact types, and statuses.

**Purpose:**
- Gives skills a single source of truth for discovering available profiles and overlays — no hardcoded paths
- Powers the editor's file sidebar (browse and load rubrics directly)
- Enables `earos-validate` to detect drift between the manifest and the filesystem

**CLI commands** (from `tools/editor/`):
```
node bin.js manifest             # Regenerate manifest by scanning core/, profiles/, overlays/
node bin.js manifest add <file>  # Add a single file to the manifest
node bin.js manifest check       # Verify manifest matches filesystem; exits non-zero on drift
```

**Keeping it current:**
- After creating a new rubric with `earos-create`: run `node bin.js manifest add <path>` (or manually add the entry)
- After deleting a rubric: re-run `node bin.js manifest` to regenerate
- `earos-validate` Check 8 reports any manifest-filesystem inconsistency as an ERROR

**Skills that use the manifest:**
- `earos-assess` — reads manifest first to discover available profiles and overlays
- `earos-create` — updates manifest as the final step of rubric creation
- `earos-validate` — Check 8 validates manifest-filesystem consistency

---

## Quick Reference

| Task | Where to start |
|------|---------------|
| Understand the full standard | `standard/EAROS.md` |
| Score a reference architecture | `earos-assess` skill or `tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx` |
| Score any other artifact | `earos-assess` skill or `tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx` |
| Create a new rubric (profile, overlay, or core) | `earos-create` skill |
| Get YAML authoring help for an existing rubric design | `earos-profile-author` skill or `templates/new-profile.template.yaml` + `docs/profile-authoring-guide.md` |
| See a worked evaluation | `examples/example-solution-architecture.evaluation.yaml` |
| Validate a rubric YAML | `earos-validate` skill or `standard/schemas/rubric.schema.json` |
| Validate an evaluation record | `standard/schemas/evaluation.schema.json` |
| Validate an artifact document | `standard/schemas/artifact.schema.json` |
| Calibrate | `earos-calibrate` skill or `calibration/gold-set/` |
| Generate an executive report | `earos-report` skill |
| Regenerate the manifest | `node tools/editor/bin.js manifest` |
| Add a new rubric to the manifest | `node tools/editor/bin.js manifest add <path>` |
| Check manifest-filesystem consistency | `node tools/editor/bin.js manifest check` |
