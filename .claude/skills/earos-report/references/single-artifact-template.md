# Single-Artifact Report Template

Use this template when generating a report for one EAROS evaluation record. Populate all fields from the evaluation record. Do not omit sections — even if empty, they must appear to confirm they were checked.

---

```markdown
# EAROS Assessment Report

**Artifact:** [artifact_ref.title]
**Artifact Type:** [artifact_ref.artifact_type]
**Owner:** [artifact_ref.owner or "Not specified"]
**Version:** [artifact_ref.version or "Not specified"]
**Evaluation Date:** [evaluation_date]
**Evaluated By:** [evaluators list — names and modes (agent/human/hybrid)]
**Rubric Applied:** [rubric_id, including profile and any overlays]

---

## Status {#status}

| | |
|---|---|
| **Overall Status** | [TRAFFIC LIGHT] [STATUS LABEL] |
| **Overall Score** | [overall_score] / 4.0 |
| **Gate Failures** | [count or "None"] |

**Traffic light assignment:**
- 🟢 **Pass** — No gate failures. Overall ≥ 3.2. No dimension < 2.0.
- 🟡 **Conditional Pass** — No critical gate failures. Overall 2.4–3.19. Named remediation items required.
- 🟠 **Rework Required** — Overall < 2.4, or repeated weak dimensions, or insufficient evidence.
- 🔴 **Reject** — Critical gate failure. Cannot be approved regardless of overall score.
- ⚫ **Not Reviewable** — Evidence too incomplete to score key criteria.

---

## Gate Failures

[If gate_failures list is empty:]
> No gate failures — all gate criteria cleared.

[If gate_failures present:]
> ⚠️ Gate failures override the weighted average. The status below reflects the gate outcome, not just the score.

| Criterion | Gate Severity | Score | Effect |
|-----------|--------------|-------|--------|
| [criterion_id] | [critical/major] | [score] | [failure_effect from rubric] |

---

## Dimension Scorecard

| Dimension | Score | Weight | Status |
|-----------|-------|--------|--------|
| [dimension_name] | [score] / 4.0 | [weight] | [🟢 ≥3.2 / 🟡 2.4–3.19 / 🟠 <2.4] |
| ... | | | |
| **Weighted Overall** | **[overall_score]** | | [status label] |

**Dimension floor check:** [Pass / Fail — any dimension < 2.0?]
If any dimension < 2.0: "⚠️ [Dimension name] scored [score] — below the 2.0 floor required for Pass status."

---

## Key Findings

### Strengths
[3 bullet points. For each: criterion ID, score, and the specific evidence that earns it. One sentence per bullet.]

- **[Criterion ID] — [criterion name]** (score [X]): [Specific evidence that demonstrates strength]
- **[Criterion ID] — [criterion name]** (score [X]): [Specific evidence]
- **[Criterion ID] — [criterion name]** (score [X]): [Specific evidence]

### Critical Gaps
[3–5 bullet points. For each: criterion ID, score, and what specifically is missing. Gate criteria listed first.]

- **[Criterion ID] — [criterion name]** (score [X]) [⚠️ GATE]: [What is missing and why it matters]
- **[Criterion ID] — [criterion name]** (score [X]): [What is missing]
- ...

---

## Recommended Actions

Actions are ordered by priority. Gate-related actions must be addressed before resubmission.

| # | Action | Criterion | Priority | Suggested Owner |
|---|--------|-----------|----------|-----------------|
| 1 | [Specific, verb-first action] | [ID] | Critical — Gate | [role] |
| 2 | [Specific action] | [ID] | High | [role] |
| 3 | [Specific action] | [ID] | Medium | [role] |
| ... | | | | |

**Action quality standard:** "Add a scope section listing in-scope and out-of-scope items explicitly, including at least 3 named assumptions (SCP-01)" is a good action. "Improve scope" is not.

---

## Detailed Criterion Results

| Criterion | Dimension | Score | Conf. | Evidence Class | N/A Reason |
|-----------|-----------|-------|-------|---------------|------------|
| [ID] | [dim] | [0-4/N/A] | [H/M/L] | [obs/inf/ext] | [if N/A: reason] |
| ... | | | | | |

---

## Evidence Quality Summary {#evidence-quality}

*Include for Architecture Board and Audit audiences. Optional for delivery teams.*

| Evidence Type | Count | % of scored criteria |
|--------------|-------|---------------------|
| Observed (direct quote or section reference) | [N] | [%] |
| Inferred (reasonable interpretation) | [N] | [%] |
| External (based on standard or policy) | [N] | [%] |
| N/A (criterion genuinely not applicable) | [N] | [%] |

**Evidence reliability:** [Strong (>80% observed) / Moderate (50–80%) / Low (<50%)]

[If low confidence count > 20%:]
> ⚠️ [N] criteria scored with low confidence. Human reviewer judgment recommended for these before relying on this assessment for governance decisions.

---

## Assessment Notes

[narrative_summary from the evaluation record, if present. Otherwise: synthesise a 2–3 paragraph summary covering:]
1. What the artifact does well and why
2. The primary gaps and their downstream consequences
3. The recommended path forward (resubmit after addressing X, escalate to Y, etc.)

---

## Evaluation Metadata

| Field | Value |
|-------|-------|
| Evaluation ID | [evaluation_id] |
| Rubric version | [rubric version] |
| Evaluation mode | [agent / human / hybrid] |
| Calibration status | [calibrated / uncalibrated — if uncalibrated, note this] |
| Challenger review | [completed / not performed] |
```

---

## Challenger Score {#challenger-score}

If a challenger review was performed (earos-review skill), add this section:

```markdown
## Challenger Review

**Challenger Status:** [Concur with primary / Revised to: (status)]
**Challenger Score:** [Concur / (score) — differs from primary by (delta)]
**Challenging findings:** [N] BLOCKER / [N] MAJOR / [N] MINOR

[For each BLOCKER or MAJOR finding: criterion ID, primary score, challenger score, reason]
```

---

## Formatting Notes

- Gate failures must appear prominently — in their own section immediately after the status, not buried in the criterion table
- Traffic light emoji must be accurate — do not use 🟡 when the status is Reject
- Actions must be specific — verb first, criterion reference included
- Scores like "2.8" mean the weighted average is 2.8, not that each criterion scored 2.8
- For scores of N/A: the criterion is excluded from the denominator — document why
