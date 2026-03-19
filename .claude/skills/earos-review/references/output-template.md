# Challenger Report Template — EAROS Review

This file contains the full output format for the challenger report. Read this before writing the report (Phase 4).

---

## Why This Format

The challenger report must serve two audiences:

1. **The primary evaluator** — who needs specific, actionable feedback on which scores to revise and why
2. **The governance reviewer** — who needs to know whether to accept the evaluation, conditional on fixes, or reject it for re-scoring

The format separates these concerns: the summary and critical findings tell the governance reviewer what to do; the criterion-by-criterion section tells the evaluator what to fix.

---

## Full Challenger Report Template

```markdown
# EAROS Challenger Report

**Evaluation ID:** [from evaluation record]
**Artifact:** [artifact title from record]
**Primary Evaluator:** [evaluators from record]
**Primary Status:** [status from record]
**Primary Score:** [overall_score from record]
**Challenger Status:** [your determination, or "Concur"]
**Challenger Score:** [your weighted average if different, or "Concur"]
**Review Date:** [today]

---

## Structural Issues

[List schema errors found in Phase 1, each as:]
**[SCHEMA ERROR]** [field path] — [description of issue]

[Or: "No structural issues found."]

---

## Challenge Summary

| | Count |
|---|---|
| Criteria reviewed | [N] |
| Criteria agreed | [N] |
| Criteria challenged | [N] |
| — Over-scored | [N] |
| — Under-scored | [N] |
| — Evidence quality issues | [N] |
| Gate errors | [N] |

**Overall verdict:** [Accept as-is | Accept with noted reservations | Reject — requires re-scoring | Escalate to human reviewer]

---

## Critical Findings

[Challenges that materially affect the evaluation status — list these first]

**[CRITICAL]** [criterion_id]: [description of the critical finding]

> **Impact:** [what changes if this is corrected — e.g., "Gate failure missed; status should be 'reject' not 'conditional_pass'"]

> **Required action:** [what the primary evaluator must do]

[Or: "No critical findings that affect evaluation status."]

---

## Systemic Patterns Detected

[One paragraph per pattern detected, or "No systemic patterns detected."]

**[Pattern name]** — [description of where it appears and what the effect is]

---

## Criterion-by-Criterion Verdicts

| Criterion | Primary Score | Verdict | Challenger Score | Issue Type |
|-----------|---------------|---------|-----------------|------------|
| [ID] | [score] | Agree | — | none |
| [ID] | [score] | Disagree | [score] | [issue type] |

---

## Detailed Challenge Notes

[For each Disagree or Partial verdict:]

### [criterion_id]: [criterion question]

**Primary score:** [score] | **Challenger score:** [score] | **Issue:** [type]

**What the primary evaluation claimed:**
> "[excerpt from the evaluation record's rationale]"

**What the rubric requires at score [primary_score]:**
> "[level descriptor from scoring_guide]"

**What the artifact actually contains:**
> "[your finding from the artifact]"

**Why this is wrong:**
[1–3 sentences citing the specific mismatch between the evidence and the level descriptor]

**Correct score:** [score] — [1 sentence justification citing the level descriptor]

---

## Recommendation

**[Choose one:]**

- **Accept as-is** — All scores are supported by evidence. No gate errors. Challenger concurs with primary evaluation.
- **Accept with noted reservations** — [N] minor scoring discrepancies noted but none affect the evaluation status. Reservations listed above.
- **Reject — requires re-scoring** — [N] criteria require correction. Specifically: [list criterion IDs with critical issues]. Re-evaluation required before governance use.
- **Escalate to human reviewer** — [N] criteria have conflicting evidence or scope ambiguity requiring domain expertise to resolve.
```

---

## Field Guidance

### Challenger Score {#challenger-score}

Compute the challenger overall score only if you have challenged enough criteria to change the weighted average. The formula is the same as the primary evaluation:

```
challenger_score = sum(revised_dimension_score × weight) / sum(dimension_weights)
```

Where `revised_dimension_score` is the average of your challenger scores for criteria in that dimension (replacing only the criteria you challenged; retaining primary scores for agreed criteria).

If only 1–2 criteria are challenged and the overall score doesn't materially change, write "Concur" for the challenger score.

### Verdict vs. Recommendation

- **Verdict** (per criterion): agree / disagree / partial — whether the specific score is correct
- **Recommendation** (overall): what to do with the evaluation — accept / accept with reservations / reject / escalate

These are different judgments. You can agree with 90% of scores and still recommend rejection if the 10% include a missed critical gate failure.

### Issue Types

| Issue Type | Meaning |
|------------|---------|
| `over_scored` | Score is higher than the evidence supports |
| `under_scored` | Score is lower than the evidence supports |
| `evidence_unsupported` | The cited evidence does not match the rationale claim |
| `wrong_evidence_class` | Classified `observed` when evidence is actually `inferred` or `external` |
| `gate_missed` | Gate threshold breached but not listed in `gate_failures` |
| `none` | No issue — agree with primary evaluation |

### Critical Findings Section

A finding is "critical" if correcting it would change the evaluation status. Examples:
- A missed `critical` gate failure (status should be `reject` not `conditional_pass`)
- A missed `major` gate failure (status should be `conditional_pass` not `pass`)
- Multiple over-scores that bring the overall average below 3.2 (changes `pass` to `conditional_pass`)

Non-critical findings still appear in the criterion detail section but not in Critical Findings.

---

## Examples of Good vs. Bad Challenge Notes

**Good challenge note** (specific, cites level descriptor):
> **What the primary claimed:** "The architecture addresses compliance through GDPR and ISO 27001 requirements."
> **What the rubric requires at score 3:** "Specific controls mapped to specific design elements with named exceptions."
> **What the artifact contains:** Section 6 mentions "GDPR applies" and "ISO 27001 compliant" with no control-to-design mapping found in full document review.
> **Correct score:** 1 — The criterion scoring_guide level 1 states "compliance mentioned without control mapping." The primary score of 3 requires explicit control-to-design mapping which is absent.

**Bad challenge note** (vague, no level descriptor reference):
> "The compliance section seems insufficient. I would score this lower."

This is not a valid challenge — it doesn't cite the level descriptor, doesn't reference specific evidence in the artifact, and gives no guidance on what to fix.
