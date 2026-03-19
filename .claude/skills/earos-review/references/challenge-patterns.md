# Challenge Patterns — EAROS Review

This file describes the 5 systemic failure modes in EAROS evaluations and how to detect each one. Read this before running the evidence audit (Phase 2).

---

## Why Systematic Patterns Matter

Individual scoring errors are expected and easy to catch — a score that doesn't match the level descriptor. Systematic patterns are harder to spot: they make the evaluation internally consistent (all scores hang together) while being consistently wrong. A generosity-biased evaluator produces scores that each seem plausible in isolation; the problem only surfaces when you apply level descriptors strictly across the whole set.

Knowing the five patterns lets you detect them quickly rather than reviewing every criterion with equal effort.

---

## Failure Mode 1 — Optimistic Evidence Classification

**What it looks like:** The evaluator marks `judgment_type: observed` but the excerpt is a paraphrase, interpretation, or inference — not a direct quote or clearly stated fact.

**Why it happens:** Evaluators unconsciously promote their interpretations to `observed` status to feel more confident. The distinction matters: `observed` evidence is more credible and defensible in governance contexts. Misclassifying `inferred` as `observed` overstates the artifact's quality.

**How to detect:**
- For each `observed` criterion, ask: "Could a skeptic argue this is an interpretation rather than a direct statement?"
- Check whether the excerpt uses quotation marks (direct quote) or paraphrase language ("the section suggests...", "it appears that...")
- Rule of thumb: `observed` + score 3 or 4 means the artifact explicitly and directly makes a strong claim. If it doesn't, the class is wrong.

**Good example (legitimately `observed`):**
```yaml
criterion_id: SCP-01
score: 3
judgment_type: observed
excerpt: >
  "In scope: Payments service, Notification service, upstream Banking Core API.
  Out of scope: Authentication (handled by IAM platform), analytics pipeline."
```
This is a direct quote with named elements — clearly `observed`.

**Bad example (should be `inferred`):**
```yaml
criterion_id: SCP-01
score: 3
judgment_type: observed
excerpt: "The document clearly defines scope boundaries across all relevant components."
rationale: "Scope is comprehensively covered."
```
The excerpt is a generalization, not a quote. This should be `inferred` at most, and the score should probably be 2.

---

## Failure Mode 2 — Generosity Bias

**What it looks like:** Scores of 3 where 2 is more accurate; consistent benefit-of-the-doubt across multiple criteria.

**Why it happens:** Evaluators interpret "this section exists" as "this criterion is addressed." The EAROS 0–4 scale requires progressively stronger evidence for higher scores — existence alone is typically score 2 ("present but incomplete"). Score 3 requires "clearly addressed with adequate evidence."

**How to detect:**
- For every score of 3: "Does the level descriptor for '3' describe what's in the artifact, or what a good version of it would look like?"
- Check the `scoring_guide` level 2 and 3 descriptors — the boundary is usually between "present but incomplete" (2) and "clearly addressed with adequate evidence" (3)
- Pattern check: if 60%+ of criteria score 3, generosity bias is likely

**Score 2 vs. 3 example using STK-01:**

| Score | What the artifact shows |
|-------|------------------------|
| 2 | "Technical stakeholders and business owner listed." — Explicit but incomplete (concerns not mapped) |
| 3 | "Stakeholders listed with their primary concerns mapped to each section." — Explicit and mostly complete |

**Challenge question:** "If I applied the level descriptors strictly, ignoring how well-written the artifact is, what score would this be?"

---

## Failure Mode 3 — Missing Evidence Anchors

**What it looks like:** Rationale cites general impressions ("The architecture appears well-structured for...") rather than specific locations ("Section 3.2 states...").

**Why it happens:** Evaluators write rationale from memory of the artifact rather than from specific citations. The result is unverifiable — a reviewer cannot check the claim against the artifact.

**How to detect:**
- For each criterion: "Can I locate the specific evidence in the artifact from what the rationale says?"
- Flag vague `evidence_refs.location`: "Section 3", "Throughout the document", "Various sections"
- Flag rationale using evaluative language without quotes: "appears", "seems", "comprehensive", "well-structured" without a cited excerpt

**Actionable challenge:** "The rationale cites 'Section 3' — which subsection? What does it say? The evidence anchor must be specific enough that an independent reviewer can find it."

**Good anchor:** `"Section 2.3 Scope — page 7: 'In scope: Payments service...'"`
**Bad anchor:** `"Section 2 contains scope information"`

---

## Failure Mode 4 — Gate Blindness

**What it looks like:** A gate criterion fails (score below threshold) but is not listed in `gate_failures`, or is listed but the status doesn't reflect the correct effect.

**Why it happens:** Evaluators compute the weighted average and set status from it, forgetting to check gates first. Or they note the low score in the criterion result but don't escalate it to a gate failure.

**How to detect:**

Step 1: For every criterion with `gate.enabled: true`, read the `failure_effect` field.
Step 2: Check the criterion score against the gate threshold (typically: any `critical` gate fails if score < 2; `major` gates flag if score < 2).
Step 3: If failed → verify it appears in `gate_failures`.
Step 4: Verify the status matches the gate effect:
- Any `critical` gate failure → status MUST be `reject`
- Any `major` gate failure → status CANNOT be `pass` (must be `conditional_pass` at best)

**Common scenario:**
```yaml
# CMP-01 has gate.severity: critical
# Evaluation shows CMP-01 score: 1
# gate_failures: []          ← ERROR
# status: conditional_pass   ← SHOULD BE: reject
```

**Flag format:** `[CRITICAL] Gate missed: CMP-01 scored 1 (below critical threshold) but absent from gate_failures. Status must be 'reject', not 'conditional_pass'.`

---

## Failure Mode 5 — Confidence Inflation

**What it looks like:** `confidence: high` on criteria where the evidence is thin, ambiguous, or heavily inferred.

**Why it matters:** Confidence labels inform human reviewers which agent scores to trust. Inflated confidence misdirects reviewers away from criteria that actually need human scrutiny.

**How to detect:**
- `judgment_type: inferred` + `confidence: high` is almost always wrong
- `evidence_sufficiency: partial` should have `confidence: medium` at most
- Gate criteria with `confidence: low` must be flagged for human review — check that they are

**Correct confidence mapping:**

| Evidence quality | Expected confidence |
|-----------------|---------------------|
| Direct quote, unambiguous level match | high |
| Paraphrase or reasonable inference, clear level match | medium |
| Thin/ambiguous evidence, or heavy inference | low |
| No evidence found (score 0 or N/A) | high (absence is certain) |

---

## Score Calibration Reference {#score-calibration}

When challenging a specific score, use this decision process:

1. Read the rubric's `scoring_guide` for the criterion — what does each level say?
2. Read the `decision_tree` — what observable conditions produce each score?
3. Apply the decision tree to the evidence cited in the evaluation record
4. If your result differs from the primary score by ≥ 1: flag as a challenge
5. If your result differs by ≥ 2: flag as a critical challenge (may affect status)

**The critical boundary is 2.0:**
- Dimensions scoring < 2.0 prevent Pass status
- A criterion at a `major` gate scoring < 2 triggers a gate failure
- Re-examine any criterion sitting at exactly 2.0 — this is where generosity bias appears most frequently

---

## Pattern Summary Table

| Failure Mode | Key Signal | Detection Method |
|--------------|-----------|-----------------|
| Optimistic evidence classification | `observed` on paraphrased content | Can I find a direct quote? |
| Generosity bias | 60%+ criteria at score 3 | Strict level descriptor check |
| Missing evidence anchors | Vague location, evaluative language | Can I find this in the artifact from this anchor? |
| Gate blindness | Low gate criteria not in `gate_failures` | Systematic gate threshold scan |
| Confidence inflation | `inferred` + `confidence: high` | Evidence quality vs. confidence mapping |
