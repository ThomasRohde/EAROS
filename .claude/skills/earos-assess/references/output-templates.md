# Output Templates — EAROS Assessment

This file contains the full templates for EAROS evaluation outputs. Read this before producing output in Step 8.

The canonical schema is `standard/schemas/evaluation.schema.json`. The worked example is `examples/example-solution-architecture.evaluation.yaml`. When in doubt, mirror the worked example.

---

## Output 1 — YAML Evaluation Record

The YAML record is the machine-readable, archivable output. It is the authoritative record of the evaluation — the markdown report is derived from it.

### Full Template

```yaml
kind: evaluation

evaluation_id: EVAL-[TYPE]-[NNNN]
# Format: EVAL-SOL-0001 (solution), EVAL-REF-0001 (reference arch), EVAL-ADR-0001, etc.
# Use a sequential number within the artifact type.

rubric_id: [primary rubric ID — e.g. EAROS-CORE-002 or EAROS-SOL-001]
rubric_version: [version of the rubric used — e.g. 2.0.0]

# If profile and/or overlays are applied in addition to the core:
profiles_applied:
  - [profile rubric ID — e.g. EAROS-REFARCH-001]
overlays_applied:
  - [overlay rubric ID — e.g. EAROS-OVR-SEC-001]

artifact_id: [artifact identifier — e.g. SOL-ART-042]
artifact_type: [solution_architecture | reference_architecture | adr | capability_map | roadmap]
artifact_version: [version of the artifact being evaluated — omit if not available]

evaluation_date: '[YYYY-MM-DD]'
evaluation_mode: [human | agent | hybrid]

evaluated_by:
  - role: evaluator
    actor: agent
    identity: EAROS evaluator
# If human also evaluated, add:
#  - role: evaluator
#    actor: human
#    identity: [name or role]
# If a challenge pass was performed:
#  - role: challenger
#    actor: agent

overall_status: [pass | conditional_pass | rework_required | reject | not_reviewable]

overall_score: [weighted average to 1 decimal place — e.g. 2.8]
# Compute: sum(dimension_score × weight) / sum(weights)
# Exclude N/A criteria from all calculations

gate_failures:
  - criterion_id: [ID]
    criterion_question: "[full question text from the rubric]"
    severity: [critical | major]
    effect: [what the gate failure causes]
# If no gate failures: gate_failures: []

criterion_results:
  - criterion_id: [ID]
    criterion_question: "[full question text from the rubric]"
    # Use IDs from the rubric YAML, e.g. STK-01, SCP-01, TRC-01
    score: [0 | 1 | 2 | 3 | 4 | "N/A"]
    evidence_class: [observed | inferred | external]
    # observed: directly supported by a quote from the artifact
    # inferred: reasonable interpretation not directly stated
    # external: judgment based on a standard or source outside the artifact
    confidence: [high | medium | low]
    confidence_reason: "[why confidence is below high — omit if high]"
    evidence_sufficiency: [sufficient | partial | insufficient | none]
    # sufficient: evidence supports the score without reservation
    # partial: evidence exists but is incomplete or ambiguous
    # insufficient: evidence exists but is too weak to confidently score
    # none: no evidence found; score is 0 or N/A
    evidence_refs:
      - section: "[section heading or number]"
        quotation: "[direct quote or very close paraphrase from the artifact]"
      # Add more refs if multiple evidence sources support the score
      # Can also be a simple string: "Section 3.2, paragraph 2"
    rationale: >
      [1-3 sentences explaining why the evidence maps to this score level.
      Cite the specific evidence. Explain why it is not one level higher
      if the score is below 4.]
    evidence_gaps:
      - "[specific piece of information that would improve this score]"
      # Leave empty if score is 4 or N/A
    recommended_actions:
      - "[specific, actionable remediation step — verb-first, e.g. 'Add a stakeholder-concern table']"
    revised: false
    # Set to true if this score was revised during the challenge pass (Step 6)

  # Repeat for every criterion in core + profile + overlays

dimension_results:
  - dimension_id: [D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | RA-D1 | etc.]
    weighted_score: [weighted average of criteria in this dimension, 1 decimal place]

  # Repeat for every dimension in core + profile

decision_summary: >
  [2-3 paragraphs for a governance reviewer. Cover:
  1. What the artifact is, who it is for, and the overall verdict
  2. The most significant strengths (what was well done)
  3. The most significant weaknesses (what holds it back)
  Address all three evaluation perspectives: artifact quality,
  architectural fitness, and governance fit.
  Do NOT restate the criterion scores — synthesize them into a judgment.]

recommended_actions:
  - "[Top-priority action — verb-first, specific]"
  - "[Second priority action]"
  # Top 5 actions, ordered by impact on overall status

challenger_notes: >
  [Findings from the challenge pass (Step 6). Which scores were
  challenged, what was the outcome, and any adjustments made.]
```

---

## Field-by-Field Guidance

### evaluation_id

Use a sequential ID within the artifact type. If you don't have a numbering system, use the date: `EVAL-SOL-20260319-001`. The ID must be unique within the organization's evaluation records.

### overall_status

The status is determined by gates first, then thresholds (Step 8 in SKILL.md). Do not set status until all gate checks and aggregation are complete. Common error: setting `conditional_pass` when a critical gate has failed — critical gate failure always = `reject`.

### overall_score

This is the weighted average across all dimensions. The formula:
```
overall_score = sum(dimension_score × dimension_weight) / sum(dimension_weights)
```

Round to 1 decimal place. A score of 2.35 rounds to 2.4, which is the `conditional_pass` threshold — be precise.

### evidence_class

This is the evidence class for the criterion as a whole — `observed`, `inferred`, or `external`. Use the highest-credibility class that applies. If the primary evidence is a direct quote from the artifact, use `observed`. If you are interpreting content that is not directly stated, use `inferred`. If your judgment relies on a standard or source outside the artifact, use `external`.

### evidence_sufficiency

This is your assessment of whether the evidence you found is adequate to confidently assign the score:
- `sufficient` — the evidence clearly matches one level; you wouldn't expect a reviewer to disagree
- `partial` — evidence exists but is ambiguous; a different reviewer might score differently
- `insufficient` — evidence exists but is too weak to support the score with confidence
- `none` — no evidence was found; score is based on absence

### decision_summary

This is the most important text in the record for human reviewers. Write it for a governance board member who will skim the criterion table but read the narrative carefully. The narrative should:
- Name what the artifact is and its governance context
- Address all three evaluation perspectives: artifact quality, architectural fitness, and governance fit
- Identify the 2-3 things that most determine the outcome
- Give a clear recommendation (proceed, fix X first, rework)

Avoid repeating individual scores. Synthesize.

---

## Output 2 — Markdown Report

The markdown report is the human-readable deliverable. It should be self-contained — a governance reviewer should be able to read it without the YAML.

### Full Template

```markdown
# EAROS Assessment Report

**Artifact:** [full title from artifact]
**Artifact Type:** [type]
**Owner:** [owner from artifact]
**Evaluation Date:** [YYYY-MM-DD]
**Rubric:** [rubric IDs used]

---

## Overall Status

**Status:** [traffic-light emoji + label]
- 🟢 Pass
- 🟡 Conditional Pass
- 🟠 Rework Required
- 🔴 Reject
- ⚪ Not Reviewable

**Overall Score:** [X.X / 4.0]

[1 sentence verdict: what the status means for this artifact]

---

## Dimension Summary

| Dimension | Score | Status | Key Finding |
|-----------|-------|--------|-------------|
| [Dimension name] | [X.X] | [🟢/🟡/🟠/🔴] | [1-phrase summary] |
| [Dimension name] | [X.X] | [🟢/🟡/🟠/🔴] | [1-phrase summary] |

Traffic light per dimension:
- 🟢 ≥ 3.2
- 🟡 2.4–3.19
- 🟠 2.0–2.39
- 🔴 < 2.0

---

## Gate Failures

[If none:]
No gate failures. The artifact passes all gate checks.

[If failures:]
| Criterion | Severity | Effect |
|-----------|----------|--------|
| [criterion_id] | [CRITICAL / MAJOR] | [what it causes] |

---

## Key Findings

**Strengths:**
- [Specific strength with evidence reference]
- [Second strength]

**Weaknesses:**
- [Specific weakness with criterion reference]
- [Second weakness]

**Risks:**
- [Risk that follows from a weakness]

---

## Recommended Actions

| Priority | Criterion | Action | Suggested Owner |
|----------|-----------|--------|-----------------|
| 1 | [ID] | [Specific action] | [Role] |
| 2 | [ID] | [Specific action] | [Role] |
| 3 | [ID] | [Specific action] | [Role] |
| 4 | [ID] | [Specific action] | [Role] |
| 5 | [ID] | [Specific action] | [Role] |

---

## Criterion Detail

[For each criterion, in dimension order:]

### [Dimension Name] (Score: X.X)

#### [criterion_id]: [criterion question]

| Field | Value |
|-------|-------|
| Score | [0-4 or N/A] |
| Evidence Class | [observed / inferred / external] |
| Confidence | [high / medium / low] |
| Evidence Sufficiency | [sufficient / partial / insufficient / none] |

**Evidence:** [Section/location] — "[Direct quote or close paraphrase]"

**Rationale:** [1-3 sentences explaining the score]

**Missing:** [What would improve this score, or "Nothing — criterion fully satisfied"]

**Action:** [Specific remediation step, or "No action required"]

---

[Continue for all criteria]

---

## Narrative Summary

[2-3 paragraphs — synthesized judgment for a governance reviewer.
Copy from the YAML decision_summary field.]

---

*Evaluated using EAROS [rubric IDs]. Schema: evaluation.schema.json.*
```

---

## Validation

Before submitting the YAML evaluation record, check:

1. Every criterion in the loaded rubric files has a result entry
2. Every score has at least one `evidence_refs` entry (unless `evidence_sufficiency: none`)
3. `gate_failures` matches the gate criteria that failed (not just any low score)
4. `overall_score` is the weighted average, not a simple average
5. `overall_status` was determined by gates first, then thresholds
6. The `decision_summary` does not just list criterion scores — it synthesizes them
7. All required schema fields are present: `kind`, `artifact_id`, `artifact_type`, `evaluated_by`, `evaluation_mode`, `overall_status`, `overall_score`

The full JSON Schema for validation is at `standard/schemas/evaluation.schema.json`. If you have access to a YAML validator, validate the output before delivery.
