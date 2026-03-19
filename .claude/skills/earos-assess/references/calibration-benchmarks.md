# Calibration Benchmarks — EAROS Assessment

This file supports Step 7 (calibration check). Use it to sanity-check your score distribution before finalizing. The question it answers: "Does my score distribution feel right given what I read?"

---

## What Score Distributions Look Like in Practice

Architecture artifacts cluster into recognizable patterns. Matching your scores to these patterns is a fast calibration check.

### Strong Artifact (Overall ~3.2–3.8)

A strong artifact is rare. It earns high scores across most dimensions through specific, evidence-rich content — not fluent writing.

Characteristics:
- Stakeholders named with specific concerns mapped to sections
- Scope defined with an explicit in/out list and stated assumptions
- Business drivers traceable to specific design decisions (not just listed in an intro)
- Key architectural decisions have context, options, rationale, and revisit triggers
- Risks are specific, owned, mitigated, or explicitly accepted with rationale
- Compliance treatment is concrete: named controls, named exceptions, named owners
- The artifact could be handed to an independent delivery team and acted on

**Score distribution pattern:**
- Most criteria: 3 or 4
- Some criteria: 2 (minor gaps acceptable)
- Zero criteria below 2 (a single score < 2 on a critical dimension drops status to Conditional Pass)
- Gate criteria: all above threshold

**Warning sign:** If you are scoring most criteria 4, stop and challenge. Very few real-world artifacts achieve score 4 across the board. Score 4 requires explicit, consistent, and complete treatment — not just "the section exists."

---

### Adequate Artifact (Overall ~2.4–3.1)

The most common type in practice. Directionally sound but with material gaps. Governance boards can conditionally approve these.

Characteristics:
- Stakeholders listed but concerns not mapped
- Scope exists but assumptions or exclusions are incomplete
- Drivers mentioned in introduction but not connected to specific decisions
- Key decisions have rationale but alternatives not discussed
- Risks listed without mitigations or owners
- Compliance mentioned without specific control mappings

**Score distribution pattern:**
- Some criteria: 3 (the sections that are done well)
- Most criteria: 2 (sections that exist but are incomplete)
- A few criteria: 1 or 0 (notably absent areas)
- Status: Conditional Pass or Rework Required depending on which criteria are low

---

### Weak Artifact (Overall ~1.2–2.3)

Significant work needed before governance review. These should return to the author.

Characteristics:
- Audience or purpose unclear or generic
- Scope not defined or so broad as to be useless
- Drivers listed in bullets with no connection to architecture choices
- Decisions presented as facts with no rationale
- Risks entirely absent or "TBD"
- Compliance by assertion ("the solution will comply with all applicable standards")
- Many diagrams with no explanatory narrative

**Score distribution pattern:**
- Most criteria: 1 or 2
- Several criteria: 0
- Likely gate failures on major criteria
- Status: Rework Required

---

### Not Reviewable Artifact

Some artifacts are so incomplete that meaningful scoring is impossible.

Characteristics:
- No scope or purpose
- Single diagram with no narrative
- Author but no owner, no version, no date
- Gate criteria (especially SCP-01 with `severity: critical`) have `evidence_class: none`

When this applies: stop at Step 1. Flag Not Reviewable. Explain what must be added before assessment can proceed.

---

## Self-Calibration Questions

Ask these before finalizing your scores:

### 1. Am I rewarding presence or quality?

Many artifacts have sections that technically exist but are content-free. A "Risks" section that says "Risks: TBD" scores 0, not 2. A "Stakeholders" section that says "Audience: technical stakeholders" scores 1, not 3.

Ask: "Is this section actually useful to a reviewer, or does it just tick a box?"

### 2. Am I scoring fluency as architecture quality?

Well-written artifacts can be architecturally weak. Dense, technical artifacts can be architecturally strong. The score should reflect the content, not the prose quality.

Ask: "If I stripped the adjectives and presented only the facts, what would the score be?"

### 3. Am I applying external knowledge to the score?

It is legitimate to apply external knowledge as `evidence_class: external`, but you must classify it as such. If you know that the architectural pattern chosen is technically sound, that knowledge is external to the artifact. The artifact still needs to justify the choice.

Ask: "Am I filling in gaps with my own knowledge and crediting the artifact for it?"

### 4. Does my distribution make sense?

Run a quick gut check:
- Average above 3.5: Is this truly an exceptional, decision-ready artifact? Double-check the 3 highest scores.
- Average below 1.5: Is this truly near-unusable? Check whether you've over-applied gate failures.
- All scores the same: Almost certainly wrong — artifacts have uneven coverage. Look for criteria you may have scored from impression.
- Many N/A scores: Each N/A requires justification. If you have more than 3 N/A scores, verify they are genuinely inapplicable, not just hard to evidence.

### 5. Are my confidence levels honest?

- `high`: You found a direct quote and the score level mapping is unambiguous
- `medium`: You found evidence but interpretation required some judgment
- `low`: Evidence is thin, ambiguous, or heavily inferred

If most of your criteria are `confidence: high`, that may indicate you are not applying enough scrutiny. Real artifacts produce genuine ambiguity on several criteria.

---

## When to Flag for Human Review

Flag these situations explicitly in the evaluation output:

**Flag 1: Conflicting evidence**
You found evidence that suggests two different scores. Example: Section 2 claims PCI compliance, but Section 6 shows a design element that violates PCI DSS requirements. Note both pieces of evidence and score conservatively (the lower score). A human reviewer should adjudicate.

**Flag 2: Heavily inferred or external evidence**
If your score depends substantially on `inferred` or `external` evidence — especially on gate criteria — note this explicitly. The human reviewer should determine whether the inference is warranted.

**Flag 3: Low-confidence gate criteria**
If any gate criterion has `confidence: low`, the gate status (pass or fail) is uncertain. Flag this clearly. Gate failures with low-confidence evidence should not automatically trigger Reject without human confirmation.

**Flag 4: Score outliers that don't fit the pattern**
If one dimension scores much higher or lower than the rest, and you don't have a clear evidence-based explanation, flag it. This may indicate a mis-application of the rubric.

**Flag 5: Artifact type uncertainty**
If you are unsure whether to apply a profile (e.g., "is this a solution architecture or a reference architecture?"), flag the uncertainty and explain what the score would be under each interpretation.

---

## Inter-Rater Reliability Context

EAROS targets Cohen's κ > 0.70 (substantial agreement) for well-defined criteria. In practice:

- **Criteria with clear observable conditions** (like SCP-01 or MNT-01) typically achieve κ > 0.75 between trained reviewers
- **Criteria requiring judgment** (like RAT-01 trade-off quality, or ACT-01 actionability) typically achieve κ 0.55–0.70
- **Criteria evaluating depth** (like CMP-01 compliance treatment) are hardest — target κ > 0.50

What this means for agent evaluation: your scores on judgment-heavy criteria should be treated as informed starting points, not definitive judgments. Flag these explicitly for human review.

The goal of calibration benchmarks is not to constrain your scores to expected distributions — it is to help you notice when you may have drifted from evidence-based scoring. Use these as a self-check, not a formula.
