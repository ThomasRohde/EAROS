# Output Templates — EAROS Assessment

This file contains the full templates for EAROS evaluation outputs. Read this before producing output in Step 8.

The canonical schema is `standard/schemas/evaluation.schema.v2.json`. The worked example is `examples/example-solution-architecture.evaluation.yaml`. When in doubt, mirror the worked example.

---

## Output 1 — YAML Evaluation Record

The YAML record is the machine-readable, archivable output. It is the authoritative record of the evaluation — the markdown report is derived from it.

### Full Template

```yaml
evaluation_id: EVAL-[TYPE]-[NNNN]
# Format: EVAL-SOL-0001 (solution), EVAL-REF-0001 (reference arch), EVAL-ADR-0001, etc.
# Use a sequential number within the artifact type.

rubric_id: [rubric IDs used, comma-separated]
# Example: EAROS-CORE-002, EAROS-REFARCH-001
# If overlays applied: EAROS-CORE-002, EAROS-SOL-001, EAROS-OVR-SEC-001

rubric_version: [version of the profile used]
# Example: 2.0.0

artifact_ref:
  id: [artifact identifier if one exists, or omit]
  title: [full title of the artifact as it appears in the document]
  artifact_type: [solution_architecture | reference_architecture | adr | capability_map | roadmap]
  owner: [team or individual named as owner in the artifact]
  uri: [repo path, URL, or file path — omit if not available]

evaluation_date: '[YYYY-MM-DD]'

evaluators:
  - name: EAROS evaluator
    role: rubric-evaluator
    mode: agent
# If human also evaluated, add:
#  - name: [name]
#    role: domain architect
#    mode: human

status: [pass | conditional_pass | rework_required | reject | not_reviewable]

overall_score: [weighted average to 1 decimal place — e.g. 2.8]
# Compute: sum(dimension_score × weight) / sum(weights)
# Exclude N/A criteria from all calculations

gate_failures:
  - criterion_id: [ID]
    severity: [critical | major]
    effect: [what the gate failure causes]
# If no gate failures: gate_failures: []

criterion_results:
  - criterion_id: [ID]
    # Use IDs from the rubric YAML, e.g. STK-01, SCP-01, TRC-01
    score: [0 | 1 | 2 | 3 | 4 | "N/A"]
    judgment_type: [observed | inferred | external | mixed | none]
    # 'mixed' when evidence combines observed and inferred
    confidence: [high | medium | low]
    evidence_sufficiency: [sufficient | partial | absent]
    # sufficient: evidence supports the score without reservation
    # partial: evidence exists but is incomplete or ambiguous
    # absent: no evidence found; score is 0 or N/A
    evidence_refs:
      - location: "[section heading, page number, or diagram label]"
        excerpt: "[direct quote or very close paraphrase from the artifact]"
      # Add more refs if multiple evidence sources support the score
    rationale: >
      [1-3 sentences explaining why the evidence maps to this score level.
      Cite the specific evidence. Explain why it is not one level higher
      if the score is below 4.]
    missing_information:
      - "[specific piece of information that would improve this score]"
      # Leave empty if score is 4 or N/A
    recommended_actions:
      - "[specific, actionable remediation step — verb-first, e.g. 'Add a stakeholder-concern table']"
    revised: false
    # Set to true if this score was revised during the challenge pass (Step 6)

  # Repeat for every criterion in core + profile + overlays

dimension_scores:
  - dimension_id: [D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | RA-D1 | etc.]
    dimension_name: [name from rubric]
    score: [weighted average of criteria in this dimension, 1 decimal place]
    weight: [weight from rubric YAML — default 1.0]
    summary: "[1 sentence summary of why this dimension scored this way]"

  # Repeat for every dimension in core + profile

narrative_summary: |
  [2-3 paragraphs for a governance reviewer. Cover:
  1. What the artifact is, who it is for, and the overall verdict
  2. The most significant strengths (what was well done)
  3. The most significant weaknesses (what holds it back)
  Do NOT restate the criterion scores — synthesize them into a judgment.]

summary:
  strengths:
    - "[Key strength — specific, not generic]"
    - "[Second strength]"
  weaknesses:
    - "[Key weakness — specific, not generic]"
    - "[Second weakness]"
  risks:
    - "[Risk that follows from a weakness — what could go wrong in delivery/governance]"
  next_actions:
    - "[Top-priority action]"
    - "[Second priority action]"
  decision_narrative: >
    [1-2 sentences on what happens next — should this go to governance board as-is,
    conditional on specific fixes, or returned for rework?]

recommended_actions:
  - priority: 1
    criterion_id: [ID of the criterion this addresses]
    action: "[Specific, actionable step — verb-first]"
    owner_suggestion: "[Who should own this — team role, not individual]"
  - priority: 2
    criterion_id: [ID]
    action: "[Action]"
    owner_suggestion: "[Role]"
  # Top 5 actions, ordered by impact on overall status
```

---

## Field-by-Field Guidance

### evaluation_id

Use a sequential ID within the artifact type. If you don't have a numbering system, use the date: `EVAL-SOL-20260319-001`. The ID must be unique within the organization's evaluation records.

### status

The status is determined by gates first, then thresholds (Step 8 in SKILL.md). Do not set status until all gate checks and aggregation are complete. Common error: setting `conditional_pass` when a critical gate has failed — critical gate failure always = `reject`.

### overall_score

This is the weighted average across all dimensions. The formula:
```
overall_score = sum(dimension_score × dimension_weight) / sum(dimension_weights)
```

Round to 1 decimal place. A score of 2.35 rounds to 2.4, which is the `conditional_pass` threshold — be precise.

### judgment_type

This is the evidence class for the criterion as a whole. If all evidence is `observed`, use `observed`. If you used a mix of observed and inferred evidence to reach the score, use `mixed`. `none` means no evidence was found (score must be 0 or 1).

### evidence_sufficiency

This is your assessment of whether the evidence you found is adequate to confidently assign the score:
- `sufficient` — the evidence clearly matches one level; you wouldn't expect a reviewer to disagree
- `partial` — evidence exists but is ambiguous; a different reviewer might score differently
- `absent` — no evidence was found; score is based on absence

### narrative_summary

This is the most important text in the record for human reviewers. Write it for a governance board member who will skim the criterion table but read the narrative carefully. The narrative should:
- Name what the artifact is and its governance context
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
| Evidence Class | [observed / inferred / external / none] |
| Confidence | [high / medium / low] |
| Evidence Sufficiency | [sufficient / partial / absent] |

**Evidence:** [Section/location] — "[Direct quote or close paraphrase]"

**Rationale:** [1-3 sentences explaining the score]

**Missing:** [What would improve this score, or "Nothing — criterion fully satisfied"]

**Action:** [Specific remediation step, or "No action required"]

---

[Continue for all criteria]

---

## Narrative Summary

[2-3 paragraphs — synthesized judgment for a governance reviewer.
Copy from the YAML narrative_summary field.]

---

*Evaluated using EAROS [rubric IDs]. Schema: evaluation.schema.v2.json.*
```

---

## Validation

Before submitting the YAML evaluation record, check:

1. Every criterion in the loaded rubric files has a result entry
2. Every score has at least one `evidence_refs` entry (unless `evidence_class: none`)
3. `gate_failures` matches the gate criteria that failed (not just any low score)
4. `overall_score` is the weighted average, not a simple average
5. `status` was determined by gates first, then thresholds
6. The `narrative_summary` does not just list criterion scores — it synthesizes them

The full JSON Schema for validation is at `standard/schemas/evaluation.schema.v2.json`. If you have access to a YAML validator, validate the output before delivery.
