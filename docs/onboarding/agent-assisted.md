# Agent-Assisted Evaluation

> **Level 3 to 4: Governed to Hybrid**

Your team produces governed, calibrated evaluations. Now you bring AI agents into the process — not to replace human reviewers, but to provide an independent second perspective that strengthens every assessment.

## What Changes at This Level

At Level 3, human reviewers follow the RULERS protocol with calibrated judgment. At Level 4, AI agents evaluate the same artifacts independently, and the two perspectives are reconciled into a single, stronger evaluation. This hybrid model consistently outperforms either approach alone: humans catch nuance that agents miss, while agents catch consistency issues and coverage gaps that humans overlook.

## How AI Evaluation Works in EAROS

Agent evaluations follow an 8-step directed acyclic graph (DAG). Each step must complete before the next begins. No steps may be skipped.

### The 8-Step DAG Evaluation Flow

**Step 1 — Structural Validation.** The agent confirms the artifact conforms to its declared type. Does it have the expected sections? Is it machine-readable or does it require OCR? Can the agent identify the artifact's scope and purpose?

**Step 2 — Content Extraction.** The agent identifies sections, diagrams, traceability elements, and key content areas. This builds a map of the artifact's structure before scoring begins.

**Step 3 — Criterion Scoring.** The agent applies the RULERS protocol to each criterion: extract a direct quote or reference from the artifact as evidence, then match it against the `scoring_guide` level descriptors to assign a 0–4 score. If no evidence can be found, score N/A and explain why.

**Step 4 — Cross-Reference Validation.** The agent checks consistency across views: do component names match across diagrams? Do interface definitions agree between the API contract and the sequence diagram? Are there contradictions between sections?

**Step 5 — Dimension Aggregation.** The agent computes weighted dimension averages using the dimension weights defined in the rubric.

**Step 6 — Challenge Pass.** A second perspective (another agent instance or a human) challenges the evaluator's highest and lowest scores. Are the highest scores supported by strong observed evidence, or are they inflated? Are the lowest scores genuinely that weak, or did the evaluator miss relevant content?

**Step 7 — Calibration.** The agent aligns its score distribution to reference human distributions using the Wasserstein-based method (`rulers_wasserstein`). This prevents systematic over-scoring or under-scoring relative to human reviewers.

**Step 8 — Status Determination.** Gates are checked first (a critical gate failure blocks a passing status — the specific outcome, `Reject` or `Not Reviewable`, is determined by the criterion's `failure_effect`), then the weighted average is computed and applied against the status thresholds.

> **The DAG is not optional.** Skipping steps — particularly the challenge pass (Step 6) — undermines evaluation quality. An agent evaluation without a challenge pass is an unchecked evaluation.

## Setting Up Agent Evaluation

### With Claude Code

The `earos init` command scaffolds agent skills into `.agents/skills/` in your workspace. These are ready to use immediately:

```bash
earos init my-workspace
cd my-workspace
```

The workspace includes 10 EAROS skills. The three most relevant for agent evaluation are:

| Skill | Purpose |
|-------|---------|
| `earos-assess` | Primary evaluation — runs the full 8-step DAG on any artifact |
| `earos-review` | Challenger — audits an existing evaluation for over-scoring and unsupported claims |
| `earos-template-fill` | Author guide — coaches artifact authors through writing assessment-ready documents |

### With Other AI Agents

For Cursor, Copilot, Windsurf, and other AI tools, `earos init` also creates `.agents/skills/` with agent-agnostic skill files and an `AGENTS.md` at the workspace root. These provide the same evaluation capabilities without Claude-specific conventions.

## Running Your First Agent Assessment

To run an agent assessment, provide the artifact and invoke the `earos-assess` skill. The agent will:

1. Read the manifest to discover available profiles and overlays
2. Ask you to confirm the artifact type and applicable overlays (or auto-detect them)
3. Load the matching rubric (core + profile + overlays)
4. Execute the full 8-step DAG
5. Produce an evaluation record conforming to `evaluation.schema.json`

The output includes scores, evidence anchors, evidence classes (observed/inferred/external), confidence levels (high/medium/low), and a status determination. Every score is auditable — you can trace each one back to the evidence that supports it.

## The Hybrid Model

The hybrid model is the defining practice of Level 4. Here is how it works:

1. **Independent evaluation.** The human reviewer and the AI agent evaluate the same artifact independently. Neither sees the other's scores during evaluation.

2. **Score comparison.** After both evaluations are complete, compare results criterion by criterion.

3. **Disagreement resolution.** Any disagreement of 2 or more points on the same criterion must be resolved. Do not split the difference — go back to the `scoring_guide` level descriptors and determine which score more accurately reflects the evidence.

4. **Reconciled record.** The final evaluation record captures both evaluators (mode: human and mode: agent) and notes where reconciliation occurred.

### Why hybrid outperforms either approach alone

- **Agents** excel at consistency checking, exhaustive coverage, and pattern-matching against level descriptors. They do not get fatigued, skip criteria, or let familiarity bias inflate scores.
- **Humans** excel at contextual judgment, organizational knowledge, and assessing whether an architecture genuinely fits the business context. They catch subtleties that level descriptors cannot encode.
- **Together**, they produce evaluations with fewer false positives (over-scoring) and fewer false negatives (missed strengths).

## The Challenge Pass

Step 6 of the DAG — the challenge pass — deserves special attention because it is the most commonly skipped step and the most valuable.

In the challenge pass, a second perspective reviews the evaluation and specifically targets:

- **The highest scores:** Is the evidence truly strong enough for a 4? Or was the agent being generous because the topic was mentioned, even if coverage was thin?
- **The lowest scores:** Did the evaluator genuinely find no evidence, or did they miss relevant content in a different section?
- **Gate-relevant criteria:** Are gate scores accurate? A single incorrect gate score can change the entire outcome.

The challenger records notes directly in the evaluation record. These notes are part of the audit trail.

## Tracking Metrics

At Level 4, you begin tracking quantitative metrics for evaluation quality:

| Metric | Target | What It Tells You |
|--------|--------|------------------|
| **Cohen's kappa** (human-agent) | > 0.70 | Agreement between human and agent after calibration |
| **Spearman's rho** (human-agent) | > 0.80 | Rank-order correlation — do human and agent agree on which criteria are strong vs. weak? |
| **Gate failure rate** | Track trend | How often critical or major gates fail, and for which criteria |
| **Score distribution** | Compare over time | Are scores clustering (suggesting rubber-stamping) or well-distributed? |

Track these metrics per rubric, per team, and over time. A declining kappa suggests calibration drift — time to re-calibrate.

## Checkpoint: You Are at Level 4 When...

- [ ] AI agent evaluations follow the complete 8-step DAG with no steps skipped
- [ ] Every agent evaluation includes a challenge pass (Step 6)
- [ ] Human-agent disagreements of 2 or more points are routinely resolved against level descriptors
- [ ] You track inter-rater reliability metrics (kappa and/or Spearman's rho)
- [ ] Agent evaluations are auditable — evidence anchors, evidence classes, and confidence are captured for every score

## Next Steps

You now have a hybrid evaluation practice that combines human judgment with AI consistency. The final step is to scale this across your organization, integrate it into delivery pipelines, and build a continuous improvement loop.

Continue to [Scaling and Optimization](scaling-optimization.md).
