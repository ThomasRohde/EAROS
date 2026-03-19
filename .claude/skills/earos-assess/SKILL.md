---
name: earos-assess
description: Run a full EAROS evaluation on an architecture artifact. Triggers when the user wants to assess, evaluate, score, or review an architecture document using the EAROS framework. Also triggers for "score this architecture", "evaluate this ADR", "run EAROS on this", "assess this capability map", "review this solution design", "is this architecture any good", "quality check this design", "grade this document", "what score would this get", or any request to evaluate, rate, or assess the quality of an architecture artifact.
---

# EAROS Assessment Skill

You are running a governed architecture quality evaluation. The output must be **auditable** — every score needs a cited evidence anchor from the artifact, not an impression. The most common failure mode in architecture assessment (human and AI alike) is scoring from vibes rather than evidence. This skill prevents that.

**Before anything else:** Read `references/scoring-protocol.md` to understand the RULERS evidence-anchoring protocol. Do this before Step 2.

---

## Step 0 — Load the Rubric Files

Read these files before scoring anything. The rubric files contain the `scoring_guide` and `decision_tree` fields that define what each score level means. Do not score from memory — read the rubric.

**Always load:**
- `core/core-meta-rubric.v2.yaml` — 9 dimensions, 10 criteria, applies to every artifact

**Load the matching profile (if one exists):**
- Solution architecture → `profiles/solution-architecture.v2.yaml`
- Reference architecture → `profiles/reference-architecture.v2.yaml`
- Architecture Decision Record → `profiles/adr.v2.yaml`
- Capability map → `profiles/capability-map.v2.yaml`
- Roadmap → `profiles/roadmap.v2.yaml`
- No match → core only

**Ask the user which overlays apply (if not specified):**
- `overlays/security.v2.yaml` — apply when the artifact touches auth, authorization, personal data, or external integrations
- `overlays/data-governance.v2.yaml` — apply when the artifact describes data flows, retention, or classification
- `overlays/regulatory.v2.yaml` — apply when the artifact is in a regulated domain (payments, healthcare, financial reporting)

---

## The 8-Step Evaluation DAG

The evaluation follows a directed acyclic graph. Steps must run in order — you cannot aggregate before scoring, cannot determine status before checking gates.

```
structural_validation → content_extraction → criterion_scoring
  → cross_reference_validation → dimension_aggregation
    → challenge_pass → calibration → status_determination
```

---

### Step 1 — Structural Validation

Binary gate: is the artifact reviewable at all?

Check whether these five elements are present:
- Title and version identifier
- Named owner or author
- Purpose or scope statement
- Diagrams or structural representations
- Stakeholder or audience section

**If 3 or more are absent:** stop. Flag **Not Reviewable**. Explain exactly which elements are missing and what must be added before assessment can proceed. Do not assign criterion scores for an un-reviewable artifact.

---

### Step 2 — Content Extraction (RULERS Protocol)

> **Read `references/scoring-protocol.md` before this step.** It contains the full RULERS protocol, evidence classification rules, and examples of correct vs. incorrect evidence extraction.

For every criterion in the loaded rubric files:
1. Read the criterion's `required_evidence` list
2. Search the artifact for direct quotes, references, or sections that address it
3. Record an `evidence_anchor` (section heading, page, diagram label) and an `excerpt` (direct quote or close paraphrase)
4. Classify: `observed` (directly stated) / `inferred` (reasonable interpretation) / `external` (judgment based on a standard outside the artifact)

If you cannot find evidence → record `evidence_class: none`. The absence of evidence is data. Never score from impression.

---

### Step 3 — Criterion Scoring

For each criterion:
- Use the `scoring_guide` level descriptors from the rubric YAML — these are the authoritative definitions of each score level
- Use the `decision_tree` field to resolve ambiguous cases (it translates the scoring guide into observable conditions)
- Score 0–4. Use `N/A` only when the criterion genuinely cannot apply, with a written justification
- Report `confidence` (high / medium / low) separately — it does **not** change the numerical score
- If you find contradicting evidence after assigning a score, revise the score down

Minimum output per criterion:
```
criterion_id: [ID]
score: [0-4 or N/A]
evidence_class: [observed/inferred/external/none]
confidence: [high/medium/low]
evidence_anchor: "[section or location in artifact]"
excerpt: "[direct quote or close paraphrase]"
rationale: "[1-3 sentences citing the evidence]"
```

> **If scoring feels ambiguous**, see `references/scoring-protocol.md` for worked examples of good and bad scoring, and how to use `decision_tree` fields.

---

### Step 4 — Cross-Reference Validation

Check for internal consistency issues that affect scores:
- Do component names match across all diagrams and sections?
- Do interface definitions agree between API specs and sequence diagrams?
- Is the scope boundary consistent across all views?
- Do narrative claims match the diagrams?

Inconsistencies reduce scores on `CON-01` (internal consistency) in the core rubric. Note specific mismatches as evidence.

> **For cross-reference patterns**, see `references/scoring-protocol.md#cross-reference-validation`.

---

### Step 5 — Dimension Aggregation

For each dimension:
1. Average criterion scores — exclude N/A criteria from the denominator (they don't count for or against)
2. Apply the dimension weight from the rubric YAML
3. Report the weighted dimension score

A dimension score of 0.0 is not neutralized by a dimension score of 4.0. Report each dimension separately.

---

### Step 6 — Challenge Pass

Before finalizing, challenge your three highest and three lowest scores:
- "What interpretation of the evidence would justify a higher score?"
- "What interpretation would justify a lower score?"
- "Am I labelling as `observed` something that is actually `inferred`?"

Revise scores where the challenge reveals weak reasoning. Flag revised scores with `revised: true`.

The purpose of this step is to catch over-scoring (the most common agent failure) and under-scoring (harsh treatment of well-evidenced but incomplete artifacts).

> **For detailed challenge methodology**, see `references/scoring-protocol.md#challenge-pass`.

---

### Step 7 — Calibration Check

> **Read `references/calibration-benchmarks.md` before this step** to sanity-check your score distribution.

Quick self-checks:
- An overall score > 3.5 should be genuinely exceptional — evidence-rich, decision-ready. If you're scoring above 3.5, confirm it's warranted.
- An overall score < 2.0 is a serious, near-unusable artifact. Confirm this is warranted before finalizing.
- Flag any criterion where `confidence: low` — these warrant independent human review.

---

### Step 8 — Status Determination

**Gates first** — check gate criteria before computing any weighted average. A single critical gate failure = Reject, no matter how high the average is.

| Gate type | Effect |
|-----------|--------|
| `critical` failure | Status = `reject` regardless of average |
| `major` failure | Status cannot exceed `conditional_pass` |

Then compute the weighted overall average and apply thresholds:

| Status | Threshold |
|--------|-----------|
| **Pass** | No critical gate failure + overall ≥ 3.2 + no dimension < 2.0 |
| **Conditional Pass** | No critical gate failure + overall 2.4–3.19 |
| **Rework Required** | Overall < 2.4 or repeated weak dimensions |
| **Reject** | Any critical gate failure |
| **Not Reviewable** | Evidence too incomplete to score gate criteria |

---

## Output

Produce **two outputs**: a YAML evaluation record and a markdown report.

> **Read `references/output-templates.md`** for full templates with field-by-field explanations before producing output. Mirror the structure of `examples/example-solution-architecture.evaluation.yaml`.

**YAML evaluation record** key fields:
`evaluation_id`, `rubric_id`, `artifact_ref`, `evaluation_date`, `status`, `overall_score`, `gate_failures`, `criterion_results`, `dimension_scores`, `narrative_summary`, `recommended_actions`

**Markdown report** key sections:
Traffic-light status, overall score, dimension table, gate failures, key findings (3–5 bullets), top 5 prioritized recommended actions with criterion references.

---

## Non-Negotiable Rules

1. **Evidence first.** Every score requires a cited excerpt or reference. "The artifact seems to address this" is not evidence.
2. **Gates override averages.** One critical gate failure = Reject regardless of the overall score.
3. **Confidence ≠ score.** Low confidence lowers the weight a human reviewer places on your output. It does not lower the numerical score.
4. **N/A requires justification.** One sentence explaining why the criterion genuinely cannot apply.
5. **Do not modify the rubric** during evaluation. It is locked. Changes require a version bump.
6. **Never collapse the three evaluation types** — artifact quality, architectural fitness, and governance fit are distinct judgments. Keep them separate in the narrative.

---

## When to Read Which Reference File

| When | Read |
|------|------|
| Before Step 2 (always) | `references/scoring-protocol.md` |
| When scoring is ambiguous | `references/scoring-protocol.md` |
| Before the challenge pass (Step 6) | `references/scoring-protocol.md` — section: Challenge Pass |
| Before Step 7 (calibration check) | `references/calibration-benchmarks.md` |
| Before producing output | `references/output-templates.md` |
| Unsure what a score distribution should look like | `references/calibration-benchmarks.md` |
