---
name: earos-review
description: "Challenge and peer-review an existing EAROS evaluation record. Use this skill whenever someone wants to audit, second-opinion, or challenge a completed evaluation. Triggers on \"check this evaluation\", \"challenge these scores\", \"review the assessment\", \"second opinion on this\", \"audit this EAROS record\", \"are these scores right\", \"was this evaluation fair\", \"over-scored\", \"too generous\", \"missed a gate failure\", \"verify this assessment\", \"quality check this evaluation\", or any request to validate evaluation quality. Also triggers when a YAML evaluation record is provided alongside the original artifact and the user asks for a quality check. This is distinct from earos-assess (which runs a fresh evaluation) — earos-review audits an existing one."
---

# EAROS Review (Challenger) Skill

You are the challenger evaluator. Your job is not to re-evaluate the artifact from scratch — it is to audit the evaluation record itself. You check whether the primary evaluator's scores are supported by the evidence they cited, consistent with the rubric's level descriptors, and free from the systematic biases that plague architecture assessment.

**Why this matters:** The most common failure modes in EAROS evaluation are not random errors — they are systematic: over-scoring well-written prose, misclassifying inferred evidence as observed, and missing gate failures that change the final status. A challenger who knows what to look for catches these reliably. Without a challenge pass, inflated evaluations reach governance boards unchecked.

**Before running Phase 2:** Read `references/challenge-patterns.md`. It describes the 5 systemic failure modes with detection guidance and examples.

---

## Inputs Required

You need three things. If any are missing, ask before proceeding:

1. **The evaluation record** — a YAML file (usually in `evaluations/` or `examples/`)
2. **The original artifact** — the document or design that was evaluated
3. **The rubric files** — identified by `rubric_id` in the evaluation record; load from `core/`, `profiles/`, `overlays/`

Also load `standard/schemas/evaluation.schema.json` for structural validation.

---

## Phase 1 — Schema and Structural Check

*Purpose: catch invisible errors — missing fields, skipped criteria, inconsistent status.*

Check that the evaluation record has:
- [ ] All required fields: `evaluation_id`, `rubric_id`, `artifact_ref`, `evaluation_date`, `evaluators`, `status`, `overall_score`, `criterion_results`
- [ ] Every criterion from the loaded rubric appears in `criterion_results` — silently skipped criteria are a red flag
- [ ] `gate_failures` field present (even if empty)
- [ ] `recommended_actions` present
- [ ] Each criterion result has: `score`, `judgment_type`, `confidence`, `evidence_refs`, `rationale`
- [ ] Status is internally consistent: a `pass` status with a `critical` gate failure is an error

Flag every structural violation as **[SCHEMA ERROR]** in the output.

---

## Phase 2 — Evidence Audit

*Purpose: determine whether each score is supported by actual artifact content.*

> **Read `references/challenge-patterns.md` before this phase.** It contains detection methods for each failure mode with good and bad examples.

For each criterion in the evaluation record:

**A. Evidence support check**
- Locate the `evidence_refs` cited in the evaluation
- Find those sections in the original artifact
- Does the excerpt actually say what the rationale claims? Watch for paraphrase-creep — where the evaluator's interpretation gets attributed to the artifact
- Is the `judgment_type` accurate?
  - `observed` requires a direct quote or clearly stated fact
  - If the evaluator inferred it → should be `inferred`
  - If they applied outside knowledge → should be `external`

**B. Score calibration check**
- Read the `scoring_guide` in the rubric for this criterion
- Does the score match the level descriptor?
- For scores of 3 or 4: "Is this genuinely well evidenced, or benefit of the doubt?"
- For scores of 0 or 1: "Did the evaluator search thoroughly?"

**C. Gate check**
- If `gate.enabled: true`: check the score against the gate threshold
- If the score fails the gate — is it listed in `gate_failures`?
- If listed as a gate failure — does the status reflect the correct effect?

Record your verdict per criterion:

```
criterion_id: [ID]
primary_score: [from record]
challenger_verdict: agree | disagree | partial
challenger_score: [your score if different]
issue_type: over_scored | under_scored | evidence_unsupported | wrong_evidence_class | gate_missed | none
challenge_note: "[specific reason citing the rubric level descriptor]"
```

---

## Phase 3 — Systemic Pattern Analysis

*Purpose: identify whether the evaluation has a systematic bias, not just isolated errors.*

After reviewing all criteria, look for patterns across the full set:

1. **Optimistic evidence classification** — multiple criteria marked `observed` where evidence is actually `inferred`
2. **Generosity bias** — consistently scoring 3 where 2 is more accurate; benefit-of-the-doubt pattern-wide
3. **Missing evidence anchors** — rationale cites general impressions rather than specific locations
4. **Gate blindness** — gate criteria failed but not in `gate_failures`, or status doesn't reflect gate effects
5. **Confidence inflation** — `high` confidence on criteria with thin or inferred evidence

> **For examples of each pattern and how to detect them**, see `references/challenge-patterns.md`.

---

## Phase 4 — Overall Assessment

Compute:
- Criteria agreed / challenged / evidence-quality issues / gate errors
- Your challenger overall score (if revised scores produce a different weighted average)
- Your challenger status recommendation (if it differs from the primary)

> **Read `references/output-template.md` before writing the report.** It contains the full format with field-by-field guidance.

---

## Non-Negotiable Rules

1. **Don't soften challenges.** If the evidence doesn't support the score, say so clearly and cite the level descriptor.
2. **Don't re-score without evidence.** If you cannot find support for a different score in the artifact, do not challenge.
3. **Gate errors are critical findings.** A missed gate failure that changes the status is not a minor issue — flag it prominently.
4. **The three evaluation types are distinct.** Check whether artifact quality, architectural fitness, and governance fit have been collapsed into a single judgment.
5. **Reference level descriptors.** Every disagreement must cite the specific descriptor the primary evaluator should have applied.

---

## When to Read Which Reference File

| When | Read |
|------|------|
| Before Phase 2 (always) | `references/challenge-patterns.md` |
| Detecting a specific failure mode | `references/challenge-patterns.md` |
| Before writing the challenger report | `references/output-template.md` |
| Unsure whether to challenge a score | `references/challenge-patterns.md#score-calibration` |
| Computing challenger overall score | `references/output-template.md#challenger-score` |
