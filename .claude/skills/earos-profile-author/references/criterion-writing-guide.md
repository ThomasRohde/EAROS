# Criterion Writing Guide — EAROS Profile Author

This file explains how to write well-formed EAROS criteria with all 13 required v2 fields. Read this before drafting any criteria.

---

## Why Criterion Quality Determines Profile Reliability

A criterion is not just a question — it is an assessment instruction. A well-written criterion tells the evaluator exactly what to look for, how to classify what they find, and what each score level means. A poorly written criterion leaves the evaluator guessing, which leads to inconsistent scores, low inter-rater reliability, and a profile that cannot be used in governance.

The 13 required v2 fields exist because each one has been found to reduce ambiguity. Missing any of them is not just a schema violation — it is a reliability risk.

---

## The 13 Required Fields

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier for cross-referencing in evaluation records |
| `question` | The scoring question — what the evaluator is asking about the artifact |
| `description` | Why this matters — the quality concern this criterion encodes |
| `metric_type` | Always `ordinal` in EAROS |
| `scale` | Always `[0, 1, 2, 3, 4, "N/A"]` |
| `gate` | Gate configuration or `false` |
| `required_evidence` | List of specific things to look for in the artifact |
| `scoring_guide` | One-sentence level descriptors for scores 0–4 |
| `anti_patterns` | Common failure modes to watch for |
| `examples.good` | What strong evidence looks like (score 3–4) |
| `examples.bad` | What absent or weak evidence looks like (score 0–1) |
| `decision_tree` | Observable conditions that resolve ambiguous scoring |
| `remediation_hints` | Specific improvements that would raise the score |

---

## Field-by-Field Guidance

### `question`

The question should be:
- Specific to this artifact type (not generic)
- Answerable from artifact content (not requiring external research)
- Focused on a single quality concern (not compound)

**Good:** "Does the reference architecture include context, functional, deployment, and data flow views?"
**Bad:** "Is the architecture complete and well-documented?"

The bad example fails because "complete" and "well-documented" are two different concerns, and "complete" is vague.

---

### `scoring_guide`

Write one sentence per level that describes what the artifact contains at that level — not what the evaluator should do.

**Pattern:**
```yaml
scoring_guide:
  "0": "[Absent description — criterion entirely missing or directly contradicted]"
  "1": "[Weak description — acknowledged or implied but inadequate]"
  "2": "[Partial description — present but incomplete, inconsistent, or weakly evidenced]"
  "3": "[Good description — clearly addressed with adequate evidence and only minor gaps]"
  "4": "[Strong description — fully addressed, well evidenced, internally consistent, decision-ready]"
```

**Common mistake:** Writing what the evaluator should do, not what the artifact shows.

**Wrong:**
```yaml
"3": "Check whether the artifact covers most of the required views."
```

**Correct:**
```yaml
"3": "Three or more views present with adequate detail; data flow view exists but lacks narrative."
```

The key test: could an evaluator read the level descriptor and know immediately which score to assign without needing to interpret?

---

### `decision_tree`

The decision tree translates the scoring guide into observable conditions. It is especially important when:
- The scoring guide levels are close together (2 vs. 3 is often ambiguous)
- Scoring requires counting specific features
- There are compound conditions (A AND B = score 3; A OR B = score 2)

**Pattern:** Start with the lowest score condition and work upward. Use IF/THEN structure.

**Good example:**
```yaml
decision_tree: >
  Count distinct architectural views (context, component, deployment, data flow, security):
  IF 0 views THEN score 0.
  IF 1 view only THEN score 1.
  IF 2-3 views present THEN score 2.
  IF 4+ views AND data flow narrative exists THEN score 3.
  IF 4+ views AND all cross-referenced AND security view included THEN score 4.
```

**Bad example:**
```yaml
decision_tree: >
  Evaluate the completeness of the architectural views and assign a score based on quality.
```

This is not a decision tree — it just restates the criterion question.

---

### `required_evidence`

List the specific artifact elements an evaluator should search for. These become the RULERS evidence anchors.

**Good:**
```yaml
required_evidence:
  - context diagram (C4 Level 1 or equivalent) showing system boundaries
  - deployment diagram showing infrastructure topology
  - data flow walkthrough (numbered steps or annotated sequence diagram)
  - component diagram showing service decomposition
```

**Bad:**
```yaml
required_evidence:
  - architectural documentation
  - diagrams
```

The bad example gives the evaluator no guidance on what specifically to find.

---

### `examples.good` and `examples.bad`

These are the most important fields for calibration. Include direct quotes or realistic paraphrases from the artifact — not descriptions of what good looks like.

**Good examples:**
```yaml
examples:
  good:
    - >
      "Section 3 provides C4 Level 1 context diagram. Section 4 shows container decomposition.
      Section 5 includes AWS deployment topology with AZ distribution. Section 6 contains
      a 12-step numbered data flow for the payment processing path."
  bad:
    - "See architecture diagram on page 3."
    - >
      "Figure 1: System Overview. [Single box-and-arrow diagram with no explanatory text,
      no deployment details, no data flows.]"
```

**Why quotes matter:** During calibration, reviewers compare their scores to the examples. If the examples are descriptions rather than quotes, reviewers cannot determine whether their artifact matches.

---

### Gate Guidance {#gate-guidance}

Gates prevent bad scores being hidden by weighted averages. But every gate is a potential false reject — a criterion that rejects a genuinely good artifact because it misses one element.

**When to use `gate: false`:**
- The criterion contributes to the score but a low score here doesn't invalidate the whole artifact
- Most criteria should be `gate: false` or `severity: advisory`

**When to use `severity: major`:**
- The criterion covers the most important quality dimension for this artifact type
- A score below 2 here means the artifact cannot serve its primary purpose
- Example: missing views in a viewpoint-centred profile

**When to use `severity: critical`:**
- The criterion covers a compliance-level concern — mandatory control, regulatory requirement, or minimum governance standard
- A failure here means the artifact cannot proceed in any state
- Reserve this for absolute must-haves: usually 0–1 per profile

**Target gate distribution per profile:**
```
gate: false              → 60-70% of criteria
severity: advisory       → 10-20% of criteria
severity: major          → 1-2 criteria
severity: critical       → 0-1 criteria
```

**Over-gating example (bad):**
```yaml
# 5 major gates in a 10-criterion profile
# Result: almost any artifact with a weak section fails the whole review
# This defeats the purpose of the weighted average
```

**Under-gating example (bad):**
```yaml
# 0 gates in a security profile
# Result: an artifact with no security controls at all can still "pass" on a high average
# Gates exist precisely to prevent this
```

---

## Complete Criterion Example

**Incomplete (bad) — will fail schema validation and produce unreliable scores:**
```yaml
- id: PM-ROOT-01
  question: "Does the post-mortem identify the root cause?"
  scoring_guide:
    "0": "No root cause"
    "3": "Root cause identified"
  gate: false
```

Missing 9 of 13 required fields. Evaluators have no guidance on scores 1, 2, 4; no evidence to look for; no examples; no decision tree.

**Complete (good) — all 13 fields present:**
```yaml
- id: PM-ROOT-01
  question: "Does the post-mortem identify the root cause with supporting evidence?"
  description: >
    Root cause identification is the primary purpose of a post-mortem. Without a
    specific, evidenced root cause, the post-mortem cannot drive effective prevention.
    "Human error" and "process failure" are not root causes — they are proxies for
    the conditions that enabled the failure.
  metric_type: ordinal
  scale: [0, 1, 2, 3, 4, "N/A"]
  gate:
    enabled: true
    severity: major
    failure_effect: Cannot pass if the post-mortem does not identify a specific root cause
  required_evidence:
    - explicit root cause statement (not just a timeline)
    - contributing factors (conditions that enabled the root cause)
    - evidence supporting the root cause conclusion (data, logs, timeline analysis)
  scoring_guide:
    "0": "No root cause section, or root cause stated as 'human error' / 'process failure' without further analysis."
    "1": "Root cause implied or mentioned superficially with no supporting evidence."
    "2": "Specific root cause stated but supporting evidence absent or limited to timeline."
    "3": "Specific root cause stated with supporting evidence and at least one contributing factor identified."
    "4": "Specific root cause with full evidence chain, multiple contributing factors, and causal relationships mapped."
  anti_patterns:
    - "Root cause: Human error" — this is a contributing factor, not a root cause
    - "Root cause: TBD" — post-mortem cannot be used for prevention without this
    - Root cause stated but no evidence provided for why this was the cause
  examples:
    good:
      - >
        "Root cause: Race condition in payment state machine between the timeout handler
        and the confirmation webhook processor. Contributing factors: (1) Missing mutex on
        shared payment state object (2) Timeout threshold (30s) shorter than downstream
        webhook delivery SLA (45s). Evidence: Log analysis shows 47 concurrent state
        transitions in 2.3s during the incident window (Appendix A)."
    bad:
      - "Root cause: Engineering team failed to test edge cases."
      - "Root cause: See timeline above."
  decision_tree: >
    IF no root cause section THEN score 0.
    IF root cause is 'human error' or 'process failure' without further drill-down THEN score 0-1.
    IF specific technical root cause stated but no evidence THEN score 2.
    IF specific root cause with supporting evidence THEN score 3.
    IF specific root cause AND full evidence chain AND contributing factors mapped THEN score 4.
  remediation_hints:
    - Apply the "5 Whys" technique to drill below human error to systemic causes
    - Attach log excerpts or data to support the stated root cause
    - Add a contributing factors section listing the conditions that enabled the root cause
```

---

## Criterion Review Checklist

Before saving a criterion, verify:

- [ ] `question` is specific and answerable from artifact content alone
- [ ] `scoring_guide` uses artifact-content language, not evaluator-action language
- [ ] `scoring_guide` distinguishes clearly between each adjacent pair (0/1, 1/2, 2/3, 3/4)
- [ ] `decision_tree` resolves the most common ambiguous case (usually 2 vs. 3)
- [ ] `required_evidence` lists specific artifact elements, not general categories
- [ ] `examples.good` contains a realistic quote or paraphrase from a strong artifact
- [ ] `examples.bad` contains the actual common failure mode, not just an empty section
- [ ] `gate` assignment is deliberate (not defaulted)
- [ ] `remediation_hints` are specific verb-first actions, not general advice
