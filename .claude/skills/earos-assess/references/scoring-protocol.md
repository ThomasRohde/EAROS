# Scoring Protocol — EAROS Assessment

This file contains the detailed evidence and scoring guidance for EAROS evaluators. Read this before Step 2 (content extraction). Return to it any time scoring feels ambiguous.

---

## The RULERS Protocol — Evidence-Anchored Scoring

RULERS stands for the core principle: **every score must be anchored to a retrievable unit of evidence from the artifact**. This prevents the single most common failure in architecture assessment — scoring from overall impression rather than specific evidence.

### Why it matters

An agent (or human) that scores from impression tends to:
- Over-score well-written artifacts (fluent prose feels like good architecture)
- Under-score technical artifacts (dense notation looks like poor communication)
- Produce unreproducible scores (two reviewers get different results on the same artifact)

RULERS scoring is reproducible because it ties every score to a specific excerpt. If two reviewers disagree, they can compare evidence anchors rather than arguing from impressions.

### The three evidence classes

Before assigning any score, classify the evidence you found:

| Class | Definition | Credibility |
|-------|------------|-------------|
| `observed` | Directly supported by a quote or excerpt from the artifact | Highest — the artifact says it |
| `inferred` | Reasonable interpretation not directly stated, but logically implied | Medium — the artifact implies it |
| `external` | Judgment based on a standard, policy, or pattern outside the artifact | Lowest — you brought the knowledge |

**The discipline:** If you cannot find at least `inferred` evidence, you cannot score the criterion above 1. A score of 0 or 1 with `evidence_class: none` is legitimate — it means the artifact does not address the criterion.

### Evidence extraction steps (for each criterion)

1. Read the criterion's `required_evidence` list in the rubric YAML
2. Search the artifact specifically for each piece of required evidence
3. Record:
   - `evidence_anchor`: where in the artifact (section heading, page number, diagram label, appendix name)
   - `excerpt`: direct quote or very close paraphrase — must be retrievable, not invented
   - `evidence_class`: observed / inferred / external / none

---

## How to Use scoring_guide and decision_tree

The rubric YAML for each criterion contains two fields that tell you exactly what each score means:

### scoring_guide

The `scoring_guide` gives one-sentence level descriptors for scores 0–4. These are the authoritative definitions. Examples from the core rubric:

**STK-01 (stakeholder identification):**
```
"0": Absent or contradicted
"1": Implied only
"2": Explicit but incomplete
"3": Explicit and mostly complete
"4": Explicit, complete, and used consistently
```

**SCP-01 (scope and boundaries):**
```
"0": No scope or boundary
"1": Scope is ambiguous
"2": Basic scope exists but is incomplete
"3": Scope and boundaries are clear
"4": Scope and boundaries are clear, tested, and internally consistent
```

Use these as your first reference. If the artifact clearly matches one level, assign that score.

### decision_tree

The `decision_tree` translates the scoring guide into a sequence of observable conditions. Use this when the scoring guide alone doesn't resolve the case. Example from SCP-01:

```
IF no scope section THEN score 0.
IF scope exists but no exclusions listed THEN max score 2.
IF assumptions not stated THEN max score 3.
```

The decision tree is a ceiling, not a floor. It tells you the maximum score given observable conditions.

**Working together:** Match the artifact against the scoring guide first. If ambiguous, walk the decision tree as a tiebreaker.

---

## Examples of GOOD Scoring

A good criterion result is specific, grounded, and honest about evidence quality.

### Example 1 — Observed evidence, high confidence

```yaml
criterion_id: SCP-01
score: 3
evidence_class: observed
confidence: high
evidence_anchor: "Section 1.2 Scope"
excerpt: >
  "In scope: Payments service, Notification service, upstream Banking Core API.
  Out of scope: Authentication (handled by IAM platform — see IAM-2024-001),
  analytics pipeline, reporting layer. Assumptions: Banking Core API versioned
  contract stable for 12 months."
rationale: >
  Scope is explicitly bounded with named in-scope and out-of-scope elements,
  and a key assumption is stated with a consequence. Assumptions are present
  but no in-scope/out-of-scope boundary diagram or consistency test is provided,
  which would be required for a score of 4.
```

Why this is good:
- The excerpt is a direct quote from a specific section
- The rationale explains both why the score is 3 and why it's not 4
- Evidence class is correctly classified as `observed` (directly stated)

### Example 2 — Inferred evidence, medium confidence

```yaml
criterion_id: TRC-01
score: 2
evidence_class: inferred
confidence: medium
evidence_anchor: "Section 2.1 Drivers and Section 4 Architecture Decisions"
excerpt: >
  "Section 2.1 lists availability and time-to-market as drivers. Section 4
  adopts an event-driven pattern described as 'enabling independent scaling'."
rationale: >
  The connection between the availability driver and the event-driven decision
  is implied by the phrase 'enabling independent scaling', but no explicit
  traceability link is made. The decision does not reference the driver ID
  or requirement number. This is inferred, not observed — the link exists
  but the artifact doesn't draw it explicitly. Score 2 (partial) is appropriate;
  score 3 would require explicit driver-to-decision links.
```

Why this is good:
- Honestly classified as `inferred` rather than `observed`
- The rationale explains the gap clearly and cites the decision tree logic
- Medium confidence correctly reflects the inferential nature of the evidence

### Example 3 — Absent evidence, scoring 0

```yaml
criterion_id: RAT-01
score: 0
evidence_class: none
confidence: high
evidence_anchor: "Entire document reviewed"
excerpt: "No risks, assumptions, constraints, or trade-offs section found."
rationale: >
  The artifact contains no RAID log, no risk section, and no trade-off discussion.
  The word 'risk' appears once in passing ('we need to consider operational risk')
  but with no specific identification, owner, or mitigation. This does not meet
  the scoring_guide level 1 threshold ('mentioned superficially'). Score 0.
```

Why this is good:
- Confidence is high because the absence is certain
- The one occurrence of "risk" is acknowledged but correctly scored as below level 1
- Evidence anchor notes that the whole document was reviewed

---

## Examples of BAD Scoring

### Bad Example 1 — Impression-based scoring

```yaml
criterion_id: CMP-01
score: 3
evidence_class: observed
confidence: high
evidence_anchor: "Section 5"
excerpt: "The architecture appears to be well-aligned with enterprise standards."
rationale: "The document seems to address compliance comprehensively."
```

Problems:
- "appears to be well-aligned" is the evaluator's impression, not a quote from the artifact
- The excerpt is a vague paraphrase, not specific evidence
- No specific standard or control is named
- `evidence_class: observed` is wrong — nothing is directly quoted
- This scores CMP-01 as 3 without evidence of any control mapping; it should score 1 or 2 at most

### Bad Example 2 — Evidence class mismatch

```yaml
criterion_id: STK-01
score: 4
evidence_class: observed
confidence: high
evidence_anchor: "Section 1"
excerpt: "Section 1 contains a list of stakeholders."
rationale: "Stakeholders are identified and the document is clearly structured for them."
```

Problems:
- Score 4 requires stakeholders to be "explicit, complete, and used consistently throughout"
- "clearly structured for them" is an inference, not an observation — evidence class should be `inferred`
- The excerpt doesn't quote what stakeholders are listed or how they're used consistently
- A correct score here is probably 2 or 3 depending on actual content

### Bad Example 3 — Conflating confidence with score

```yaml
criterion_id: ACT-01
score: 1
evidence_class: observed
confidence: low
rationale: "I'm not confident about this score, so I've scored it lower to be safe."
```

Problems:
- Confidence must not modify the score — this is an explicit rule in EAROS
- If the evidence supports score 3 but you're uncertain about interpretation, score 3 with `confidence: low`
- Low confidence tells the human reviewer to apply independent judgment; it doesn't change the number

---

## Challenge Pass Methodology

The challenge pass is Step 6. It exists because agents (and humans) are systematically biased in specific ways:

**Common over-scoring patterns:**
- Rewarding presence over quality (something is mentioned → score 2, regardless of depth)
- Treating fluent prose as evidence of good architecture
- Accepting assertions without checking for evidence backing
- Scoring the intent rather than the artifact as written

**Common under-scoring patterns:**
- Penalizing technically dense artifacts that are well-reasoned
- Requiring explicit labels for things that are clearly present
- Applying a standard that was not in the rubric

### How to run the challenge pass

For each of your three highest and three lowest scores:

1. **Higher challenge:** "What in the artifact would justify scoring this one level higher? Does that evidence exist?"
   - If yes and you missed it → revise up, flag as `revised: true`
   - If no → score confirmed

2. **Lower challenge:** "What would need to be true for this score to be one level lower? Is that condition actually met?"
   - If yes and you overclaimed → revise down, flag as `revised: true`
   - If no → score confirmed

3. **Evidence class check:** "Is my evidence classification honest?"
   - `observed` should be a direct quote or highly specific reference
   - If you're paraphrasing liberally → downgrade to `inferred`
   - If you're applying outside knowledge → classify as `external`

Mark any score that changes as `revised: true` in the output. This is not a sign of weakness — it's the protocol working correctly.

---

## Cross-Reference Validation

Cross-reference validation (Step 4) finds inconsistencies that reduce the reliability of the artifact and directly affect `CON-01` (internal consistency criterion in the core rubric).

### What to check

**Component naming:** Does the context diagram call it "Payment Service" while the sequence diagram calls it "PaymentProcessor" and the deployment view shows "payment-svc"? These may or may not be the same thing — the artifact should make this explicit.

**Interface consistency:** Does the API spec show a `POST /payments/initiate` endpoint, but the sequence diagram shows `createPayment()` with a different parameter shape? One of them is wrong or they're different things.

**Scope boundary drift:** Does the context diagram show the mobile app as out of scope, but the data flow section describes data flowing through the mobile app? The scope boundary shifted between sections without notice.

**Narrative-diagram agreement:** Does the text say "all traffic passes through the API gateway" but the deployment diagram shows a direct database connection from a service?

### How to score inconsistencies

Each inconsistency found is evidence for `CON-01`. Use the `decision_tree` for CON-01:
```
IF direct contradictions between sections THEN score 0.
IF same entity has different names or interfaces in multiple views THEN score 1.
IF minor naming inconsistencies only THEN score 2.
IF terminology and interfaces consistent across main views THEN score 3.
IF glossary present AND entities reconciled AND cross-references verified THEN score 4.
```

Note each specific inconsistency as a separate evidence item in the CON-01 result.
