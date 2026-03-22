# Getting Started with EaROS

This guide walks you through your first architecture artifact assessment using EaROS. By the end, you will have scored an artifact, produced a structured evaluation record, and know how to interpret the results.

---

## Before You Start

**What you need:**
- The artifact you want to assess (document, YAML, or structured text)
- About 30–60 minutes for a first assessment (subsequent assessments take 15–20 minutes once you know the rubric)

**What EaROS provides:**
- A rubric specifying exactly what to look for and how to score it
- A scoring sheet to record your evidence and scores
- Clear pass/fail thresholds

---

## Step 1: Identify the Artifact Type

EaROS has profiles for the most common enterprise architecture artifact types:

| Artifact Type | Profile to Use |
|--------------|----------------|
| Solution architecture document | `profiles/solution-architecture.yaml` |
| Reference architecture | `profiles/reference-architecture.yaml` |
| Architecture Decision Record (ADR) | `profiles/adr.yaml` |
| Capability map | `profiles/capability-map.yaml` |
| Architecture roadmap | `profiles/roadmap.yaml` |
| Other / unknown | Core only: `core/core-meta-rubric.yaml` |

If your artifact does not match any profile, apply only the core rubric. The core dimensions are universal.

---

## Step 2: Select Your Rubric Set

Every assessment starts with the core and adds a profile, plus any applicable overlays.

**Minimum (core only):**
```
core/core-meta-rubric.yaml
```

**Typical (core + profile):**
```
core/core-meta-rubric.yaml
profiles/solution-architecture.yaml
```

**Full (core + profile + overlay):**
```
core/core-meta-rubric.yaml
profiles/solution-architecture.yaml
overlays/security.yaml         ← if the design touches auth, secrets, or data handling
overlays/data-governance.yaml  ← if the design involves data flows or storage
overlays/regulatory.yaml       ← if the design is subject to compliance requirements
```

Apply overlays selectively. Not every artifact needs every overlay.

---

## Step 3: Open the Scoring Sheet

Open the Excel scoring sheet from `tools/scoring-sheets/`:

- **`EAROS_Scoring_Sheet_v2.xlsx`** — general-purpose, works for all artifact types

The scoring sheet has:
- One tab per rubric section (core dimensions + profile dimensions)
- Dropdown menus for scores (0, 1, 2, 3, 4, N/A)
- Evidence fields for recording your cited text or reference
- An automatic aggregation tab that calculates the weighted score and indicates the pass threshold

---

## Step 4: Read the Rubric, Then Read the Artifact

Open the relevant YAML rubric files. For each criterion, familiarise yourself with:
- The `description` — what the criterion is asking
- The `scoring_guide` — what each score level (0–4) means for this specific criterion
- The `required_evidence` — what kind of evidence counts
- The `gate` field — if enabled with severity `critical`, a failure triggers a Reject; severity `major` caps the status at Conditional Pass

**Then read the artifact end-to-end** before scoring. Do not score as you read on the first pass. Form an overall impression first, then return to score criterion by criterion.

---

## Step 5: Score Each Criterion

For each criterion:

1. **Find the evidence.** Locate the section, statement, diagram, or table in the artifact that addresses this criterion. If you cannot find any evidence, that is a 0 (Absent) or N/A, not a 1.

2. **Match the level descriptor.** Compare what you found to the descriptor for each score level. The score is the *highest level where the artifact fully satisfies the descriptor*. If it partially meets level 3 but not fully, score 2.

3. **Record the evidence.** In the scoring sheet evidence field, write a brief reference: section number, page, or a short direct quote. This is mandatory — unsubstantiated scores are not valid under EaROS.

4. **Flag uncertainty.** If you genuinely cannot assess the criterion (for example, the artifact references external documents you do not have access to), mark it N/A and note the reason.

### Example Scoring Decision

**Criterion:** Scope and boundary clarity
**Descriptor for score 3:** "Scope is defined with boundaries; assumptions are stated but some exclusions are implicit rather than explicit."
**Descriptor for score 4:** "Scope is precisely defined with explicit boundaries, exclusions, assumptions, and constraints; no ambiguity about what is in or out."

You read the artifact and find a scope statement that defines what is in scope but does not list explicit exclusions. → **Score: 3** → Record: "Section 1.2: scope statement defines in-scope components but exclusions are not listed."

---

## Step 6: Check the Gates

Before calculating the aggregate, check every criterion with a `gate` object (not `gate: false`) in the rubric files. Gate behaviour depends on severity:

- **`critical`** — Any score below the threshold blocks passing. The gate's `failure_effect` determines the outcome: **Reject** (mandatory control breach) or **Not Reviewable** (evidence too incomplete to score).
- **`major`** — A weak score (typically < 2) caps the status at **Conditional Pass** at best; cannot achieve a Pass.
- **`advisory`** — Triggers a recommendation but does not cap the status.

Gate criteria represent non-negotiable minimums on their respective concern. A critical gate failure means the artifact has a fundamental deficiency that makes it unsuitable for its purpose.

---

## Step 7: Determine the Status

The scoring sheet calculates the weighted dimension average automatically. Read the status from the aggregation tab:

| Weighted Average | Status |
|-----------------|--------|
| ≥ 3.2 (no critical gate failure, no dimension < 2.0) | **Pass** |
| 2.4 – 3.19 (no critical gate failure) | **Conditional Pass** |
| < 2.4 | **Rework Required** |
| Critical gate failure (mandatory control breach) | **Reject** |
| Critical gate failure (evidence too incomplete to score) | **Not Reviewable** |

**Conditional Pass** means the artifact is acceptable for use but has identified remediation items that must be addressed before the next formal review. Document each item with the criterion ID, the score, and the specific improvement needed.

---

## Step 8: Write the Evaluation Record

Use `templates/evaluation-record.template.yaml` to produce a structured evaluation record. See `examples/example-solution-architecture.evaluation.yaml` for a completed example.

The evaluation record captures:
- Artifact metadata (name, version, type, author)
- Assessor identity and date
- Rubric set used (core + profile + overlays, with versions)
- Per-criterion scores and evidence references
- Dimension averages and weights
- Gate check results
- Overall status
- Remediation items (for Conditional Pass) or rejection reason (for Reject)

Store completed evaluation records with the artifact or in your architecture governance system.

---

## Interpreting Results

### Pass
The artifact meets the standard. It may still have minor improvement opportunities noted in the assessment — these are recommended, not required.

### Conditional Pass
The artifact is usable but has specific gaps that must be addressed. List each remediation item with the criterion ID and a concrete improvement. Schedule a re-review after remediation.

### Rework Required
The artifact has pervasive or significant gaps. Return it to the author with the full evaluation record. A new assessment is required after rework — do not re-score the same version.

### Reject
The artifact has failed one or more gate criteria, indicating a fundamental deficiency. Reject means the artifact should not be used or progressed until the gate issue is fully resolved. A gate failure is not about quality level — it is about something that makes the artifact unsuitable for its purpose.

---

## Calibrating Your Assessments

If you are introducing EaROS to a team or beginning to use it for formal governance, calibrate before going live:

1. Select 3–5 artifacts of the same type with a range of quality levels
2. Have two or more assessors score them independently using the same rubric set
3. Compare scores criterion by criterion
4. For any criterion where scores differ by more than 1 point, re-read the level descriptors together and reach consensus
5. Document the agreed interpretation in a calibration note stored in `calibration/gold-set/`

Target inter-rater reliability: Cohen's κ > 0.70 for well-defined criteria.

---

## Next Steps

- **Create a profile** for an artifact type not yet covered → [`docs/profile-authoring-guide.md`](profile-authoring-guide.md)
- **Set up AI-agent assessment** → [`README.md`](../README.md#ai-agent-assessment) and [`standard/EAROS.md`](../standard/EAROS.md)
- **Review the research behind EaROS** → `research/` directory in the repository
- **Run a team calibration session** → `calibration/` directory in the repository
