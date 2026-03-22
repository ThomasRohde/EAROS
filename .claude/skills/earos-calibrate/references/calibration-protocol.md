# Calibration Protocol

Step-by-step procedure for running an EAROS calibration exercise. Follow this exactly — shortcuts produce unreliable results.

---

## Phase 1 — Setup

### 1.1 Identify the rubric being calibrated

Confirm:
- `rubric_id` (e.g., `EAROS-POSTMORTEM-001`)
- Current `status` (should be `draft` before calibration; changes to `candidate` after passing)
- Date of last calibration (if any)

### 1.2 Assemble the calibration artifact set

**Minimum set (3 artifacts):**

| Artifact | Expected score range | Purpose |
|----------|---------------------|---------|
| Strong | ≥ 3.2 overall | Confirms the rubric correctly identifies high-quality artifacts |
| Weak | < 2.4 overall | Confirms the rubric correctly identifies poor artifacts |
| Ambiguous | 2.4–3.2 overall | Tests boundary detection — the hardest cases |

**Recommended set (4 artifacts):**
Add a fourth: an artifact with a known gate failure. This verifies the gate logic and its effect on status.

**Requirements for calibration artifacts:**
- Real artifacts (not synthetic examples created to match the rubric)
- Representative of the artifact type in practice
- Diverse: different teams, different systems, different quality levels
- Stored in `calibration/gold-set/[rubric-id]/` with known scores recorded

### 1.3 Record known gold-set scores

For each artifact, the gold-set must contain:
```yaml
artifact_id: [ID]
artifact_title: [title]
known_status: [pass | conditional_pass | rework_required | reject]
known_overall_score: [X.X]
criterion_scores:
  - criterion_id: [ID]
    gold_score: [0-4 or N/A]
    gold_evidence_class: [observed | inferred | external]
    gold_rationale: "[why this score was assigned]"
```

Do NOT share these gold-set scores with the evaluator before they complete their independent assessment.

---

## Phase 2 — Independent Scoring

### 2.1 Read the rubric

Read the full rubric YAML for the profile being calibrated. Read `core/core-meta-rubric.yaml` as well — core criteria are always evaluated.

Do NOT read the gold-set scores. Close any document containing them.

### 2.2 Score each artifact independently

Follow the standard earos-assess 8-step DAG for each artifact:

```
structural_validation
  → content_extraction
    → criterion_scoring
      → cross_reference_validation
        → dimension_aggregation
          → challenge_pass
            → calibration
              → status_determination
```

For each criterion, record:
```yaml
criterion_id: [ID]
score: [0-4 or N/A]
evidence_anchor: "[direct quote or specific section reference]"
evidence_class: [observed | inferred | external]
confidence: [high | medium | low]
rationale: "[why this score was assigned — specific, not vague]"
```

**Critical rules during scoring:**
- Extract an evidence anchor BEFORE assigning a score (RULERS protocol)
- If no evidence can be found, record N/A and explain why — do not score from impression
- Do not look at the gold-set until scoring for all artifacts is complete

### 2.3 Complete the challenge_pass step

Before finalising scores, run the internal challenge:
- For each score of 3 or 4: "What specific evidence in the artifact earns this score?"
- If the answer is vague, revisit the scoring_guide and decision_tree
- Document the challenge outcome in the evaluation record

### 2.4 Determine status for each artifact

Apply the status thresholds:
1. Check gate failures first — any critical gate failure blocks a passing status (outcome per `failure_effect`: `reject` or `not_reviewable`)
2. Check overall score: ≥ 3.2 = pass, 2.4–3.19 = conditional_pass, < 2.4 = rework_required
3. Check dimension floor: no dimension < 2.0 for a pass status

Record the determined status.

---

## Phase 3 — Score Comparison

### 3.1 Access the gold-set scores

Only after completing your independent assessment for all artifacts, read the gold-set scores.

### 3.2 Build the comparison table

For each artifact, for each criterion:
```
artifact_id     | criterion_id | gold_score | agent_score | delta | agreement
[ID]            | [ID]         | [score]    | [score]     | [d]   | exact|within_1|disagreement
```

Where:
- `delta = gold_score - agent_score`
- Positive delta = agent under-scored (too harsh)
- Negative delta = agent over-scored (too generous)
- `agreement = exact` if delta = 0; `within_1` if |delta| = 1; `disagreement` if |delta| ≥ 2

### 3.3 Flag systematic bias

Compute mean delta across all criteria:
- Mean delta near 0 = no systematic bias
- Mean delta > +0.5 = agent consistently under-scores (too harsh)
- Mean delta < -0.5 = agent consistently over-scores (too generous)

Systematic bias is more serious than random disagreement — it indicates a calibration problem that will affect every future evaluation.

---

## Phase 4 — Metric Computation

Read `references/agreement-metrics.md` for computation procedures.

Compute and record:
1. Binary agreement (artifact status match rate)
2. Weighted kappa per criterion
3. Spearman ρ across artifact overall scores
4. Reliability flag per criterion: `reliable` | `moderate` | `unreliable`

---

## Phase 5 — Root Cause Analysis

For each `disagreement` (|delta| ≥ 2) or `unreliable` criterion:

**Five root cause categories:**

1. **Ambiguous level descriptor**
   - Symptom: Both evaluators can justify their score from the current scoring_guide
   - Fix: Sharpen the level descriptors, especially at the 2/3 boundary
   - Example fix: Add a specific observable feature that distinguishes score 2 from score 3

2. **Missing or vague decision_tree**
   - Symptom: The decision_tree doesn't resolve the specific case that caused disagreement
   - Fix: Add an explicit branch for the ambiguous condition
   - Example fix: "IF X present but Y absent THEN score 2 (not 3)"

3. **Evidence classification disagreement**
   - Symptom: Evaluators agree on what the artifact says but classify differently (observed vs. inferred)
   - Fix: Add an `examples.good` entry clarifying what qualifies as `observed` for this criterion
   - Example fix: "Quote must include [specific field] to qualify as observed"

4. **Anti-pattern not captured**
   - Symptom: The artifact exhibits a form of failure the rubric doesn't explicitly call out
   - Fix: Add the new failure mode to `anti_patterns` and update the scoring_guide accordingly

5. **Context sensitivity**
   - Symptom: The criterion means something different for this artifact than the rubric anticipates
   - Fix: Add conditional guidance to the `description` or `decision_tree`
   - Example fix: "For artifacts covering only a single domain, N/A is acceptable for criterion X"

---

## Phase 6 — Calibration Report

Save results to: `calibration/results/[rubric-id]-calibration-[YYYY-MM-DD].yaml`

Report format:

```yaml
calibration_id: CAL-[RUBRIC-ID]-[YYYYMMDD]
rubric_id: [rubric ID]
calibration_date: [today]
artifacts_scored: [N]
evaluator: agent

summary_metrics:
  binary_agreement: "[X%]"
  mean_delta: [X.X]
  spearman_rho: [X.XX]
  overall_verdict: [pass_for_production | borderline | not_ready]

criterion_results:
  - criterion_id: [ID]
    gold_score: [score]
    agent_score: [score]
    delta: [delta]
    agreement: [exact | within_1 | disagreement]
    reliability_flag: [reliable | moderate | unreliable]
    root_cause: "[if disagreement — brief root cause analysis]"
    recommended_rubric_change: "[if unreliable — specific change]"

artifact_results:
  - artifact_id: [ID]
    gold_status: [status]
    agent_status: [status]
    gold_score: [X.X]
    agent_score: [X.X]
    status_match: [true | false]
    notes: "[any notable findings]"

recommendations:
  proceed_to_production: [true | false]
  blocking_issues:
    - "[issue preventing production use, if any]"
  rubric_improvements:
    - criterion_id: [ID]
      field_to_change: [scoring_guide | decision_tree | anti_patterns | examples]
      change_description: "[specific change]"
```

---

## Phase 7 — Post-Calibration Actions

**If verdict is `pass_for_production`:**
1. Change profile `status` from `draft` to `candidate`
2. Update `calibration_date` in the profile YAML
3. Schedule next calibration (6 months or at next major rubric revision)

**If verdict is `borderline`:**
1. Implement recommended rubric improvements
2. Re-run calibration on the same artifacts to verify improvement
3. Do not promote to `candidate` until re-calibration passes

**If verdict is `not_ready`:**
1. Analyse root causes for all unreliable criteria
2. Revise `scoring_guide`, `decision_tree`, and `examples` for each
3. Rebuild calibration artifact set if artifacts were unrepresentative
4. Re-run full calibration from Phase 2

---

## Recalibration Triggers

Recalibrate when any of these occur:
- A criterion's `scoring_guide` or `decision_tree` is materially changed
- New overlay is applied alongside this profile
- Agreement drops below targets in a post-production review
- New artifact formats appear (new diagramming tools, new document templates)
- Agent model is updated and behaviour may differ
- Governance expectations change materially
