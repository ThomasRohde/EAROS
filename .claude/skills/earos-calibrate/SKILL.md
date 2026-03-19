---
name: earos-calibrate
description: Run EAROS calibration exercises to validate rubric reliability before production use. Use this skill whenever someone wants to calibrate a rubric, validate inter-rater reliability, compare scores against gold-standard artifacts, measure scoring consistency, or says "calibrate this rubric", "run calibration", "check if the rubric is reliable", "compare my scores to the gold set", "test this profile against examples", "is this rubric ready for production", "what is our kappa", "measure agreement between reviewers", "validate a new profile", or "how well does the rubric score consistently". Calibration is required before any new profile can move from draft to candidate status.
---

# EAROS Calibrate Skill

You are running an EAROS calibration exercise. Calibration validates that a rubric produces consistent, reliable scores across reviewers and artifacts before it enters a governance process.

**Why calibration matters:** A rubric that produces inconsistent scores is not a quality gate — it is noise. Without calibration, two reviewers applying the same rubric will score the same artifact differently, governance decisions will be arbitrary, and the framework loses credibility. Calibration makes the rubric trustworthy by measuring and improving its reproducibility.

**Target reliability metrics:**
- Binary agreement (exact match): > 95%
- Ordinal Cohen's κ: > 0.70 for well-defined criteria; > 0.50 for subjective criteria
- Spearman ρ (overall score correlation across artifacts): > 0.80

**Critical:** Do NOT look at gold-set benchmark scores until after completing your independent assessment. True calibration requires independent scoring first.

---

## Step 0 — Load Calibration Inputs

Read these files:
1. `core/core-meta-rubric.v2.yaml`
2. The profile or overlay being calibrated (ask if not specified; scan `profiles/` and `overlays/`)
3. `calibration/gold-set/` — scan for existing reference artifacts and their benchmark scores
4. `calibration/results/` — scan for prior calibration runs (to understand trends)

Ask the user:
- Which rubric/profile is being calibrated? (if not specified)
- Are there artifacts to calibrate against, or should I use the gold-set?
- Solo calibration (agent vs. gold-set) or multi-evaluator reconciliation?

---

## Step 1 — Artifact Inventory

List available calibration artifacts. For each:
- Artifact ID, title, type
- Expected quality category: strong (≥3.2), adequate (2.4–3.19), weak (<2.4), borderline
- Known benchmark scores (if prior calibration exists)

If no gold-set artifacts exist, stop and tell the user:
> "Calibration requires at least 3 artifacts: 1 strong (should score ≥3.2), 1 weak (should score <2.4), and 1 ambiguous (borderline case). The spread across quality levels is important — calibration against only strong artifacts doesn't test whether the rubric correctly identifies weaknesses. Please provide these artifacts or their paths."

---

## Step 2 — Independent Scoring

For each calibration artifact, run a full EAROS assessment using the `earos-assess` skill protocol:
- Follow the full 8-step DAG
- Score every criterion independently **before** looking at gold-set benchmark scores
- Record evidence anchors, evidence classes, confidence, and rationale for every score

**This step cannot be skipped or abbreviated.** Independent scoring is the entire point of calibration. If you score after seeing the benchmark, you measure nothing.

> **For the full assessment protocol**, see `.claude/skills/earos-assess/SKILL.md`.

---

## Step 3 — Score Comparison

After completing independent scoring for all artifacts, compare against the gold-set:

```yaml
artifact_id: [ID]
criterion_id: [ID]
gold_score: [benchmark]
agent_score: [your score]
delta: [gold - agent]  # positive = agent under-scored; negative = agent over-scored
delta_abs: [abs(delta)]
agreement: exact | within_1 | disagreement  # disagreement = delta_abs >= 2
evidence_quality_match: yes | partial | no
```

> **Read `references/calibration-protocol.md`** for the full comparison procedure and how to handle cases where you believe the gold-set benchmark may itself be wrong.

---

## Step 4 — Agreement Metric Computation

> **Read `references/agreement-metrics.md`** before this step. It contains the formulas, computation steps, and interpretation guidance.

Key metrics to compute:

**Binary agreement:** (exact matches) / (total scored criteria)

**Per-criterion reliability flag:**
- `reliable`: max_delta ≤ 1 across all artifacts
- `moderate`: max_delta = 2 in isolated cases
- `unreliable`: max_delta ≥ 2 systematically

**Overall Spearman ρ:** rank correlation of overall scores across artifacts

**Verdict:** `pass_for_production` / `borderline` / `not_ready`

---

## Step 5 — Root Cause Analysis

For each `disagreement` (delta ≥ 2) or `unreliable` criterion, investigate:

1. **Ambiguous level descriptor?** — Does `scoring_guide` clearly distinguish adjacent levels?
2. **Missing decision tree?** — Does the criterion have a `decision_tree`?
3. **Evidence classification issue?** — Observed vs. inferred disagreement?
4. **Anti-pattern match?** — Did the artifact exhibit an anti-pattern scored differently by the gold-set?
5. **Context sensitivity?** — Is this criterion's meaning different for different artifact sub-types?

For each root cause, recommend a specific rubric improvement (which field to change and how).

---

## Step 6 — Calibration Report

Save the report to `calibration/results/[rubric-id]-calibration-[YYYY-MM-DD].yaml`

> **Read `references/calibration-protocol.md#report-format`** for the full YAML and markdown report templates.

---

## Step 7 — Recalibration Triggers

After saving results, check whether recalibration is needed sooner than the standard 6-month cycle. Recalibrate when:
- Profile criteria change materially (version bump)
- New overlay introduced
- Agreement drops below targets on any criterion
- New artifact formats appear (new diagramming tools, document formats)
- Agent model changes materially
- Governance expectations change

Tell the user: "Schedule next calibration check: [6 months from today or at next profile revision]."

---

## Non-Negotiable Rules

1. **Score independently first.** Never look at gold-set before producing your own assessment.
2. **Don't calibrate to pass.** If you systematically disagree with the gold-set, flag it — the gold-set may need review too.
3. **Unreliable criteria must be fixed before production.** κ < 0.50 = not usable in governance.
4. **Calibration is ongoing.** A profile that passes today must be recalibrated after any material change.

---

## When to Read Which Reference File

| When | Read |
|------|------|
| Before Step 3 (always) | `references/calibration-protocol.md` |
| Computing agreement metrics (Step 4) | `references/agreement-metrics.md` |
| Interpreting κ values | `references/agreement-metrics.md#interpretation` |
| Writing the calibration report | `references/calibration-protocol.md#report-format` |
| Investigating disagreements (Step 5) | `references/calibration-protocol.md#root-cause-analysis` |
| Unsure if gold-set benchmark is correct | `references/calibration-protocol.md#gold-set-disagreement` |
