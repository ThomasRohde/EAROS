# Agreement Metrics — EAROS Calibration

This file explains the agreement metrics used in EAROS calibration, how to compute them, and how to interpret the results. Read this before Step 4 (agreement metric computation).

---

## Why These Metrics?

EAROS uses three complementary metrics because each answers a different question:

- **Binary agreement** answers: "How often do we get the exact same score?"
- **Cohen's κ (ordinal/weighted)** answers: "Is our agreement better than random chance, accounting for the ordinal scale?"
- **Spearman ρ** answers: "Do we agree on which artifacts are better than which others?"

A rubric that passes all three is reliable. A rubric that passes only one may have a specific problem (e.g., good rank-ordering but systematic score inflation).

---

## Metric 1 — Binary Agreement (Exact Match Rate)

**What it measures:** Percentage of criteria where agent score = gold-set score exactly.

**Formula:**
```
binary_agreement = (count of exact matches) / (total scored criteria) × 100%
```

**Target:** > 95%

**Computation:**
1. For each criterion in each artifact, compare `agent_score` to `gold_score`
2. Count exact matches (delta = 0)
3. Divide by total scored criteria (exclude N/A criteria from both sets)

**Example:**
```
Criteria scored: 30 (3 artifacts × 10 criteria)
Exact matches: 24
Binary agreement: 24/30 = 80%  ← BELOW TARGET — investigate
```

**Interpretation:**
- > 95%: Excellent — rubric is highly reproducible
- 85–95%: Acceptable — minor rubric refinements may help
- < 85%: Concerning — systematic disagreements; investigate root causes

---

## Metric 2 — Ordinal Cohen's κ (Weighted Kappa) {#interpretation}

**What it measures:** Agreement corrected for chance, using linear weights that give partial credit for near-misses (delta = 1 counts as partial agreement).

**Why weighted (not simple) kappa:** EAROS uses a 0–4 ordinal scale. Disagreeing by 1 point (scoring 2 vs. 3) is less serious than disagreeing by 2 points (scoring 1 vs. 3). Weighted kappa captures this.

**Linear weight matrix (5-point scale):**
```
          Gold 0  Gold 1  Gold 2  Gold 3  Gold 4
Agent 0:   1.00    0.75    0.50    0.25    0.00
Agent 1:   0.75    1.00    0.75    0.50    0.25
Agent 2:   0.50    0.75    1.00    0.75    0.50
Agent 3:   0.25    0.50    0.75    1.00    0.75
Agent 4:   0.00    0.25    0.50    0.75    1.00
```

**Computing kappa without a statistics library (simplified):**

Step 1: Build the confusion matrix (rows = agent scores, columns = gold scores, cells = count).

Step 2: Compute observed weighted agreement:
```
P_obs = sum(weight[i,j] × n[i,j]) / N
  where n[i,j] = count at row i, col j; N = total observations
```

Step 3: Compute expected weighted agreement (if random based on marginals):
```
P_exp = sum(weight[i,j] × row_marginal[i] × col_marginal[j]) / N²
```

Step 4: κ = (P_obs - P_exp) / (1 - P_exp)

**Simplified approximation for small samples (3 artifacts):**
- All deltas ≤ 1: κ likely > 0.70 (reliable)
- Some deltas = 2: κ likely 0.50–0.70 (moderate)
- Any delta = 3–4: κ likely < 0.50 (unreliable)

**Target thresholds:**
- κ > 0.70: Substantial agreement — criterion reliable for governance use
- κ 0.50–0.70: Moderate — acceptable for subjective criteria; sharpen level descriptors
- κ < 0.50: Poor — criterion needs revision before production use

**EAROS-specific expectations:**
- Criteria with clear observable conditions (SCP-01, MNT-01): typically κ > 0.75
- Criteria requiring judgment (RAT-01 trade-off quality): typically κ 0.55–0.70
- Criteria evaluating depth (CMP-01 compliance treatment): hardest — target κ > 0.50

---

## Metric 3 — Spearman Rank Correlation (ρ)

**What it measures:** Whether agent and gold-set agree on the rank ordering of artifacts by quality.

**Why it matters:** Even if absolute scores differ, a rubric is useful if it reliably distinguishes strong artifacts from weak ones. Good rank correlation means the rubric correctly identifies which artifacts need more work.

**Formula:**
```
ρ = 1 - (6 × Σd²) / (n × (n² - 1))
  where d = rank difference for each artifact; n = number of artifacts
```

**Example (3 artifacts, perfect ordering):**
```
Artifact    Gold_rank  Agent_rank  d   d²
Strong           1          1      0    0
Adequate         2          2      0    0
Weak             3          3      0    0
ρ = 1 - (6×0)/(3×8) = 1.00
```

**Example with rank reversal:**
```
Artifact    Gold_rank  Agent_rank  d   d²
Strong           1          2     -1    1
Adequate         2          1      1    1
Weak             3          3      0    0
ρ = 1 - (6×2)/(3×8) = 1 - 0.5 = 0.50  ← Moderate
```

**Target:** ρ > 0.80

**Interpretation:**
- ρ > 0.80: Good ordering — rubric reliably distinguishes quality levels
- ρ 0.60–0.80: Moderate — some rank reversals; investigate the reversed artifacts
- ρ < 0.60: Concerning — systematic misclassification of quality levels

---

## Per-Criterion Reliability Flags

After computing metrics, flag each criterion:

```
criterion_id | mean_delta | max_delta | binary_agreement | reliability_flag
CRITERION-01 |   0.2      |    1      |      93%         | reliable
CRITERION-02 |   0.8      |    2      |      67%         | moderate
CRITERION-03 |   1.5      |    3      |      33%         | unreliable
```

**Flag definitions:**
- `reliable`: max_delta ≤ 1 across all artifacts; binary agreement ≥ 90%
- `moderate`: max_delta = 2 in some cases; binary agreement 70–90%
- `unreliable`: max_delta ≥ 2 systematically; binary agreement < 70%

Criteria flagged `unreliable` must be revised before production use.

---

## Overall Calibration Verdict

| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| Binary agreement | X% | > 95% | pass/warn/fail |
| Criteria with κ > 0.70 | X of N | > 80% | pass/warn/fail |
| Criteria with κ < 0.50 | N | 0 | pass/warn/fail |
| Spearman ρ | X.XX | > 0.80 | pass/warn/fail |

**Verdict rules:**
- `pass_for_production`: All metrics pass; no unreliable criteria
- `borderline`: One metric borderline or 1–2 unreliable criteria; review before production
- `not_ready`: Multiple metrics fail or 3+ unreliable criteria; rubric revision required

---

## What to Do with Results

### Pass
Profile ready for candidate status. Update `status: draft` → `status: candidate`.

### Borderline
Review the specific criteria that missed targets:
1. Is the `decision_tree` present and branches clear?
2. Does the `scoring_guide` distinguish between levels 2 and 3 specifically?
3. Are `examples.good` and `examples.bad` realistic and quotable?

Update flagged criteria and re-run calibration on those criteria only.

### Not Ready
Do not advance to candidate. Revise the rubric per root cause analysis in `references/calibration-protocol.md#root-cause-analysis`, then re-run full calibration.
