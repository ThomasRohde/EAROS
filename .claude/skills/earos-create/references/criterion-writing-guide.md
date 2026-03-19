# Criterion Writing Guide

This guide covers how to write well-calibrated EAROS criteria with all 13 v2 required fields. Use it during Step 4 (draft) and whenever a criterion feels ambiguous or hard to score.

---

## The 13 Required Fields

Every criterion in a v2 rubric must have all of these fields. An incomplete criterion cannot be reliably calibrated.

```yaml
- id: [ARTIFACT-TOPIC-NN]
  question: "[The scoring question]"
  description: "[Why this matters — what goes wrong when it's absent]"
  metric_type: ordinal
  scale: [0, 1, 2, 3, 4, "N/A"]
  gate: false           # or gate: { enabled: true, severity: major, failure_effect: "..." }
  required_evidence:
    - "[observable item 1]"
    - "[observable item 2]"
  scoring_guide:
    "0": "[Absent — what 0 looks like]"
    "1": "[Weak — what 1 looks like]"
    "2": "[Partial — what 2 looks like]"
    "3": "[Good — what 3 looks like]"
    "4": "[Strong — what 4 looks like]"
  anti_patterns:
    - "[common wrong pattern]"
  examples:
    good:
      - "[Direct quote or close paraphrase of a strong version]"
    bad:
      - "[Direct quote or close paraphrase of a weak version]"
  decision_tree: >
    IF [observable condition] THEN score [N].
    IF [observable condition] THEN score [N].
  remediation_hints:
    - "[Specific action to improve the score]"
```

---

## Field-by-Field Guide

### `id`
- Pattern: `[ARTIFACT-ABBREV]-[TOPIC]-[NN]` — e.g., `PM-ROOT-01`, `DC-SCHEMA-02`
- Must be unique across **all** files in `core/`, `profiles/`, and `overlays/`
- Kebab-case topics: `ROOT`, `OWNER`, `VIEW`, `TRACE`, `SCHEMA`, `SLO`, `DEPR`

### `question`
- Must be a yes/no or does-the-artifact question, not an open-ended one
- Bad: "How well does the artifact describe the solution?"
- Good: "Does the artifact include a numbered data flow walkthrough covering all integration points?"
- The question should be answerable from observable evidence in the artifact

### `description`
- Explain **why this criterion matters** — what goes wrong when it's absent
- Two sentences minimum: (1) what it checks, (2) what the failure consequence is
- Avoid restating the question. Add depth: what's the downstream impact on reviewers, delivery teams, or governance?

### `metric_type`
- Always `ordinal` for EAROS rubric criteria

### `scale`
- Always `[0, 1, 2, 3, 4, "N/A"]`

### `gate`
- See the [Gate Guidance](#gate-guidance) section below
- Either `gate: false` or `gate: { enabled: true, severity: [type], failure_effect: "[text]" }`
- Valid severities: `none`, `advisory`, `major`, `critical`

### `required_evidence`
- List observable, concrete items — not abstract properties
- Bad: `- quality evidence` or `- relevant content`
- Good: `- named data retention policy with owner and review date`
- Good: `- deployment diagram showing network zone boundaries`
- Good: `- exception log with approver and expiry for each non-compliant item`

### `scoring_guide`
The most critical field for calibration. All five levels must be distinct and observable.

**The cardinal rule:** each level descriptor must be distinguishable from adjacent levels by observable features — not by degree words like "somewhat" or "mostly".

Level patterns that work:
- Level 0: "Absent or directly contradicted"
- Level 1: "Present but [specific limitation]"
- Level 2: "Present with [specific limitation] — [what's still missing]"
- Level 3: "Addressed for most [X], with [specific remaining gap]"
- Level 4: "Complete, consistent, and [specific discriminating feature that 3 lacks]"

**Level 2–3 is where calibration breaks down most often.** Make these descriptions as specific as possible. The difference between 2 and 3 should be observable, not a matter of opinion.

### `anti_patterns`
- List 2–4 common failures you've actually seen for this criterion
- These are the most valuable field for AI disambiguation — they provide negative examples that help agents avoid false positives
- Be specific: not "incomplete diagram" but "deployment diagram that shows application tier only, with no network zone boundaries or external dependencies"

### `examples`
- Both `good` and `bad` are required
- Use direct quotes or close paraphrases from real artifacts (anonymised if needed)
- Good examples should demonstrate level 3–4 evidence
- Bad examples should demonstrate level 0–1 evidence
- Do not use placeholder text like "[Strong evidence example]"

### `decision_tree`
A series of IF/THEN conditions that operationalise the scoring_guide for AI agents.

Structure:
```
IF [observable condition A] THEN score 0.
IF [observable condition B] THEN score 1.
IF [observable condition C] AND [observable condition D] THEN score 2.
IF [observable condition E] THEN score 3.
IF [observable condition E] AND [observable condition F] THEN score 4.
```

Rules:
- Conditions must be **observable from the artifact** — not judgment-dependent
- Cover all five score levels
- Use count-based conditions where possible: "IF less than 2 [X]", "IF 3+ [X]"
- Avoid "adequate", "sufficient", "thorough" — replace with observable counts or presence/absence

### `remediation_hints`
- 2–4 specific actions the author can take to improve the score
- Each hint should be actionable within a week, not aspirational
- Bad: "Improve the quality of the traceability"
- Good: "Add a traceability matrix linking each business driver to the specific design section that addresses it"

---

## Gate Guidance {#gate-guidance}

Gates prevent weak scores on important criteria from being hidden by weighted averages. The key design principle: **gate deliberately, not reflexively**.

### Gate Types and Effects

| Severity | Effect | When to use |
|----------|--------|-------------|
| `none` | Contributes to score only | No governance consequence for weakness |
| `advisory` | Weakness triggers a recommendation | Important but not blocking |
| `major` | Caps status at `conditional_pass` | Important enough that weakness prevents full approval |
| `critical` | Forces `reject` status regardless of average | Compliance-level failures; no-go conditions |

### Gate Quotas per Profile

| Gate type | Target count | Absolute max |
|-----------|-------------|--------------|
| `critical` | 0–1 | 1 |
| `major` | 1–2 | 3 |
| `advisory` | 0–3 | — |

If you're assigning more than 3 major gates, you're over-gating. Ask: "Would I really reject an otherwise excellent artifact because this one criterion is weak?"

### Gate Failure Effects — Wording Patterns

```yaml
# Critical gate
gate:
  enabled: true
  severity: critical
  failure_effect: reject when [the specific condition that cannot be ignored]

# Major gate
gate:
  enabled: true
  severity: major
  failure_effect: Cannot pass above conditional_pass if score < 2
```

### Gate Decision Heuristics

**Use critical when:**
- The artifact is completely un-reviewable without this (scope/boundary is an example)
- A mandatory regulatory or compliance control is at stake
- The failure mode is "we're approving something we literally cannot evaluate"

**Use major when:**
- The concern is important enough to cap approval even if the rest is strong
- Weakness here creates concrete delivery or governance risk
- The concern is the core quality signal for this artifact type

**Use advisory or none when:**
- Weakness is annoying but survivable
- The criterion is secondary or supplementary to the main quality signal
- You're adding it because it's sometimes relevant, not because it's always critical

### Common Over-Gating Patterns to Avoid

- Gating every criterion in a profile (dilutes the gate signal)
- Critical-gating criteria that are actually style preferences
- Gating criteria that duplicate core meta-rubric gates
- Gating criteria where "absent" is not actually a blocking failure

---

## Worked Example: Complete v2 Criterion

This is a full criterion from a hypothetical post-mortem profile, demonstrating all 13 fields at the expected quality level.

```yaml
- id: PM-ROOT-01
  question: Does the post-mortem identify the root cause(s) of the incident, distinguished from contributing factors and symptoms?
  description: >
    A post-mortem that describes only symptoms or contributing factors without identifying
    the root cause provides no basis for systemic remediation. Teams will implement surface
    fixes that leave the underlying cause in place, and the incident will recur. Root cause
    analysis must distinguish between what triggered the incident (symptom), what enabled
    it to occur (contributing factors), and what must change to prevent recurrence (root cause).
    Without this distinction, remediation actions are likely to be ineffective.
  metric_type: ordinal
  scale: [0, 1, 2, 3, 4, "N/A"]
  gate:
    enabled: true
    severity: major
    failure_effect: Cannot pass above conditional_pass — post-mortems without root cause analysis cannot drive systemic improvement
  required_evidence:
    - root cause statement (explicitly labelled, not implied)
    - distinction between root cause, contributing factors, and trigger/symptoms
    - causal chain or 5-whys analysis
  scoring_guide:
    "0": No root cause analysis — incident described as a sequence of events only
    "1": Root cause mentioned but not distinguished from symptoms or contributing factors
    "2": Root cause identified but causal chain is missing or assumed — why the root cause exists is not explained
    "3": Root cause identified with causal chain — contributing factors distinguished — remediation plausibly addresses root cause
    "4": Root cause identified with validated causal chain, distinguished from all contributing factors and symptoms, and remediation actions directly address root cause with acceptance criteria
  anti_patterns:
    - "Root cause: human error — no further analysis" (symptom, not root cause)
    - Listing 8 root causes (usually means contributing factors were not separated)
    - Root cause section absent; narrative describes "what happened" only
    - Remediation actions that address symptoms rather than the root cause
  examples:
    good:
      - >
        "Root cause: Database connection pool was not configurable at runtime; configuration
        was compiled into the service image. Contributing factors: (1) No alerting on
        connection exhaustion — only on query failure. (2) Load test did not simulate
        connection-heavy bursts. Trigger: Black Friday traffic spike. [Causal chain, 5 sections,
        remediation: add runtime configurability with separate alerting threshold.]"
    bad:
      - >
        "Root cause: The database ran out of connections during the sale event.
        [This is a symptom. No causal chain. No contributing factor separation.
        Remediation: increase connection pool size — addresses the trigger, not the cause.]"
  decision_tree: >
    IF no root cause section or root cause not labelled THEN score 0.
    IF root cause labelled but indistinguishable from symptom or contributing factor THEN score 1.
    IF root cause identified but no causal chain explaining why it exists THEN score 2.
    IF root cause with causal chain AND contributing factors distinguished THEN score 3.
    IF root cause validated, causal chain complete, all factors distinguished, AND remediation directly addresses root cause with acceptance criteria THEN score 4.
  remediation_hints:
    - Apply 5-whys or fishbone analysis to find the systemic cause behind the immediate trigger
    - Explicitly label and separate: trigger (what set it off), contributing factors (what enabled it), root cause (what must change)
    - Verify that each remediation action addresses the root cause, not just the trigger
    - Add acceptance criteria to remediation actions so you can verify the root cause has been addressed
```

---

## Common Criterion Writing Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Scoring guide uses "somewhat", "mostly", "adequately" | Not observable; different reviewers interpret differently | Replace with observable features: counts, presence/absence, named sections |
| Decision tree mirrors scoring guide word-for-word | Provides no additional disambiguation | Add IF/THEN logic with countable conditions the scoring guide doesn't have |
| Required evidence is abstract ("relevant content") | Evaluators can't know what to look for | List specific observable items: "named owner", "diagram with X", "table with Y columns" |
| Examples are placeholder text | Evaluator has no real reference | Use real quotes (anonymised if needed) — even invented but realistic examples are better than placeholders |
| anti_patterns are too generic ("missing information") | Doesn't help AI agents avoid false positives | Be specific about what the wrong version looks like |
| All criteria have critical gates | Dilutes gate signal; too many false rejects | Reserve critical for compliance-level no-gos; use major for quality caps |
