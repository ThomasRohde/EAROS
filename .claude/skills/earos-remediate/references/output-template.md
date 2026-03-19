# Output Template — EAROS Remediation Plan

This file defines the structure and formatting for the remediation plan output. Read this before Step 5 (output).

---

## Prioritization Logic

Before writing the plan, compute the following and display it in the Status Summary:

1. **Current weighted overall score** (from the evaluation record `overall_score`)
2. **Current status** (from the evaluation record `status`)
3. **Score needed for next status tier:**
   - To reach `conditional_pass` from `rework_required`: need overall ≥ 2.4, no critical gate failures
   - To reach `pass` from `conditional_pass`: need overall ≥ 3.2, no dimension < 2.0, no critical gate failures
   - To reach `conditional_pass` from `reject`: must first fix the critical gate failure, then meet the conditional_pass threshold
4. **Gap:** how many average points needed across criteria — identify the specific criteria where improvement is most achievable given the rubric's level descriptors

Show this calculation explicitly in the status summary so the author understands exactly what they are working toward.

### How to identify status-tipping criteria

To find score-2 criteria that tip the status:
1. Take current overall score
2. For each score-2 criterion, compute: what would the overall score be if this criterion became a 3?
   - Delta per criterion = (score improvement × criterion weight) / total weight
3. If the resulting score crosses a threshold (2.4 or 3.2), flag this criterion as "status-tipping"

This makes the remediation plan strategic, not just a list of things to fix.

---

## Full Remediation Plan Template

```markdown
# EAROS Remediation Plan

**Artifact:** [title from evaluation record]
**Artifact Type:** [type]
**Evaluation Record:** [evaluation_id]
**Evaluation Date:** [date]
**Current Status:** [status — use traffic light: 🔴 Reject / 🟠 Rework Required / 🟡 Conditional Pass]
**Current Score:** [overall_score] / 4.0

---

## What Needs to Change

[1–2 sentence summary of what is holding this artifact back, in plain language for the author.
Not criterion IDs — synthesize. E.g.: "The artifact scores well on scope and stakeholder
identification, but lacks decision rationale and compliance traceability, which are the
primary blockers for a Conditional Pass."]

**Score needed for [target status]:** [X.X] / 4.0 (current: [Y.Y])
**Gap:** [+Z.Z points] — achievable by [brief description of where the points come from]

---

## Priority 1 — Fix Gate Failures First

> ⚠️ These block passing regardless of your overall score. Fix these before anything else.

[If no gate failures:]
No gate failures identified. Proceed to Priority 2.

[For each gate failure:]

### [criterion_id]: [criterion question]
**Gate severity:** CRITICAL / MAJOR
**Effect:** [what this gate failure causes — e.g., "Status = Reject regardless of overall score"]
**Current score:** [0–1] — [evaluator's rationale from the evaluation record]
**Evidence gap:** [what the evaluator found missing]

**What a passing score (≥ 2) looks like:**
> [Quote or paraphrase the scoring_guide "2" level descriptor from the rubric YAML]

**Good examples (from the rubric):**
- [examples.good item 1 from the rubric YAML]
- [examples.good item 2]

**What to avoid:**
- [anti_patterns item 1 from the rubric YAML]

**Action:** [Specific, verb-first instruction. Reference the artifact section. Specify format.]

**Effort:** [quick fix / moderate / significant rework]

---

## Priority 2 — Lift Low Scores (0–1)

> These are the biggest drag on your overall score. Address in order of dimension weight.

[For each score-0 or score-1 criterion, ordered by dimension weight descending:]

### [criterion_id]: [criterion question]
**Dimension:** [dimension name] (weight: [X.X])
**Current score:** [0 or 1] — [evaluator's rationale]
**Evidence gap:** [missing information from evaluation record]

**What score 3 looks like:**
> [Quote the scoring_guide "3" level descriptor from the rubric YAML]

**Good examples (from the rubric):**
- [examples.good from rubric YAML]

**What to avoid:**
- [anti_patterns from rubric YAML]

**Action:** [Specific instruction]

**Effort:** [quick fix / moderate / significant rework]

---

## Priority 3 — Status-Tipping Improvements

> Improving these score-2 criteria would push your overall score across the [target status] threshold.

[For each status-tipping score-2 criterion:]

### [criterion_id]: [criterion question]
**Current score:** 2
**Impact:** Improving to 3 adds [+Z.Z] to overall score → new overall = [X.X] ([status change if applicable])
**Evidence gap:** [what is present vs. what is missing]

**What score 3 looks like:**
> [scoring_guide "3" descriptor from rubric YAML]

**Good examples (from the rubric):**
- [examples.good from rubric YAML]

**Action:** [Specific instruction]

**Effort:** [quick fix / moderate / significant rework]

---

## Priority 4 — Incremental Improvements

> These score-2 criteria improve the overall score but do not change the status tier on their own.
> Address after Priority 1–3 if you are targeting a higher score within the same status tier.

[Collapsed summary — offer to expand if user wants detail:]

| Criterion | Current | Target | Estimated Effort |
|-----------|---------|--------|-----------------|
| [ID] | 2 | 3 | [effort] |
| [ID] | 2 | 3 | [effort] |

[Say: "Ask me to expand any of these and I'll provide the same detail as the sections above."]

---

## Effort Summary

| Priority | Actions | Estimated Effort |
|----------|---------|-----------------|
| P1 — Gate failures | [N] | [effort range] |
| P2 — Low scores (0–1) | [N] | [effort range] |
| P3 — Status-tipping (score 2) | [N] | [effort range] |
| P4 — Incremental (score 2) | [N] | [effort range] |
| **Total to reach [target status]** | **[P1+P2+P3]** | **[range]** |

---

## Next Step

Once these changes are made, re-run `earos-assess` on the updated artifact to verify the score improvement.

For help writing specific sections, use the `earos-template-fill` skill.
For help creating a new artifact from scratch, use the `earos-artifact-gen` skill.

*Remediation plan generated from evaluation record [evaluation_id] using EAROS [rubric_ids].*
```

---

## Formatting Rules

1. **Gate failures always appear first** — even if they seem minor. Status is determined by gates before averages.
2. **Show the math** — display the score delta calculation for status-tipping criteria. Authors need to see that fixing criterion X adds 0.3 to their overall score.
3. **Verb-first actions** — every action starts with a verb: Add, Create, Replace, Extend, Document, Remove, Restructure. Not "You should consider adding".
4. **Reference sections** — every action references where in the artifact to make the change. If the section doesn't exist yet, say "Add a new section titled X after Section Y".
5. **Source from the rubric, not from general knowledge** — the `scoring_guide`, `examples.good`, `anti_patterns`, and `remediation_hints` fields in the rubric YAML are the authoritative source for what good looks like. Quote them.
6. **Collapse Priority 4** — offer to expand rather than dumping all score-2 criteria at once. The most common mistake is overwhelming the author with 10 actions when they should focus on 3.
7. **Traffic lights for status** — use 🔴 Reject, 🟠 Rework Required, 🟡 Conditional Pass, 🟢 Pass in the header.

---

## Tone Guidelines

Write for the **artifact author**, not the evaluator. The evaluation record speaks the evaluator's language (criterion IDs, evidence classes, scores). The remediation plan speaks the author's language (sections, content, formats).

- Evaluate → Remediate: "TRC-01 scored 1 due to absent driver-component mapping" → "Add a table in Section 3 that maps each business driver to the components that realize it"
- Frame actions as achievable, not as indictments. "Add X" not "You failed to include X"
- Be direct about gate failures — they genuinely block passing, and the author needs to understand that urgency

The plan should feel like advice from a senior peer who has read the evaluation, read the rubric, and knows exactly what needs to change. Not a list of scores, and not generic architectural advice.
