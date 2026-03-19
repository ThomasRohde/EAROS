---
name: earos-remediate
description: Generate a prioritized improvement plan from an EAROS evaluation. Triggers on "how do I fix this", "improve this artifact", "remediation plan", "how to pass EAROS", "fix the assessment", "improvement plan", "what's wrong with my architecture", "how to get a better score", or any request to improve an artifact based on evaluation results.
---

# SKILL: earos-remediate

Generate a prioritized, actionable improvement plan from an EAROS evaluation record.

## References

- Patterns and before/after examples: `references/remediation-patterns.md`
- Output template: `references/output-template.md`
- Rubric files: discovered at runtime via `earos.manifest.yaml`
- Evaluation schema: `standard/schemas/evaluation.schema.json`

---

## Workflow

### Step 1 — Load the evaluation record

Ask the user to provide the evaluation record (file path or paste content).

- Read the file if a path is given.
- Identify: `rubric_id`, `profile_id`, `overlay_ids`, `status`, all criterion scores, gate results, dimension scores, and the narrative fields (`evidence`, `rationale`, `actions`).
- If the record is missing required fields, note which ones and proceed with what is available.

### Step 2 — Load the rubric files

Read `earos.manifest.yaml` to locate the rubric(s) referenced by the evaluation record.

For each referenced rubric (core + profile + overlays):
- Load the YAML file.
- Extract for every criterion: `id`, `question`, `gate`, `scoring_guide`, `examples.good`, `examples.bad`, `anti_patterns`, `remediation_hints`, `decision_tree`.

This is the authoritative source for what "good" looks like. Do not rely on training data for rubric content.

### Step 3 — Classify and prioritize issues

Read `references/remediation-patterns.md` before this step.

Triage every criterion that scored below 3 (or triggered a gate failure):

**Tier 1 — Blockers** (fix these first; evaluation cannot pass until resolved)
- Any criterion with a `critical` gate that failed (status = Reject)
- Any criterion with a `major` gate that scored < 2 (caps status at Conditional Pass)

**Tier 2 — High Impact** (most likely to change the overall status)
- Criteria scored 0 or 1 (Absent / Weak)
- Criteria in high-weight dimensions (weight >= 1.1)
- The criterion closest to tipping a dimension above the 2.0 floor threshold

**Tier 3 — Incremental** (polish, turn Conditional Pass into Pass)
- Criteria scored 2 (Partial) — especially those where the gap to 3 is narrow
- Dimension average between 2.4 and 3.2 (one bump in a criterion could cross the Pass threshold)

**Tier 4 — N/A review** (challenge whether N/A was correctly applied)
- Any criterion marked N/A — check the justification is sound

Within each tier, order by: gate severity descending → weight descending → score ascending.

### Step 4 — Generate remediation items

For each prioritized criterion, produce a structured remediation entry using the rubric's own content:

```
Criterion: <id> — <question>
Current score: <score>/4   Gate: <severity or none>
What score 3 looks like: <scoring_guide["3"]>
What score 4 looks like: <scoring_guide["4"]>
Good example: <examples.good[0]>
Anti-patterns to avoid: <anti_patterns>
Decision path: <decision_tree excerpt>
Specific fixes:
  - <remediation_hints item 1>
  - <remediation_hints item 2>
  - [context-specific fix derived from the evaluation's rationale]
Effort estimate: <Low | Medium | High>  (see references/remediation-patterns.md)
```

Derive effort from the gap and criterion complexity:
- Score 3→4: Low (usually evidence and cross-referencing)
- Score 2→3: Medium (content gaps to fill)
- Score 0–1→3: High (structural rework required)
- Gate failure on critical: High (non-negotiable)

### Step 5 — Compute projected impact

After fixing Tier 1 and Tier 2 items, estimate what the new status would be:
- Recalculate dimension averages assuming target scores (conservative: assume score reaches the minimum needed, not the maximum possible).
- Check gate conditions.
- State the projected status: Pass / Conditional Pass / Rework Required.

If the current status is Reject due to a critical gate, state clearly: fixing the gate failure is the prerequisite for any other improvements to matter.

### Step 6 — Output the remediation plan

Read `references/output-template.md` before producing output.

Structure:
1. Summary (current status, projected status after fixes, number of issues by tier)
2. Tier 1 — Blockers (gate failures)
3. Tier 2 — High Impact items
4. Tier 3 — Incremental improvements
5. Tier 4 — N/A review (if any)
6. Quick wins (Tier 3 items that are Low effort — do these first)
7. Next step: offer to run `earos-assess` on the revised artifact

---

## Operating Principles

- **Rubric-anchored.** Every fix recommendation must cite the rubric's own `scoring_guide`, `examples.good`, or `remediation_hints`. Do not invent criteria or guidance not in the rubric.
- **Triage ruthlessly.** A plan with 15 equal-priority items is useless. The output must be prioritized so the architect knows exactly where to start.
- **Feasibility-aware.** Flag if a Tier 1 item requires organizational change (e.g., a governance decision) vs. document change.
- **Evidence anchored.** Where the evaluation record includes evidence anchors, quote them back to the architect so they know exactly what text triggered the low score.
- **Status awareness.** If the artifact is already a Conditional Pass and the architect's goal is Pass, focus on Tier 3. If it is Reject, Tier 1 is the only thing that matters.
