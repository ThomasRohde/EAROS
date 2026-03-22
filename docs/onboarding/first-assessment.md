# Your First Assessment

> **Level 1 to 2: Ad Hoc to Rubric-Based**

This guide walks you from zero to your first scored architecture evaluation. By the end, you will have installed EAROS, understood the core rubric, and completed a real assessment with evidence-backed scores.

## What You Will Learn

- How to install the EAROS CLI and initialize a workspace
- The 9 dimensions and 10 criteria of the core meta-rubric
- How the 0--4 scoring scale works in practice
- How to find evidence in an artifact, cite it, and assign a score
- How gates work and when they override the average
- How to interpret your evaluation result

## Prerequisites

You need one thing: **an architecture artifact to assess**. This can be any document your organization produces --- a solution design, an ADR, a capability map, a reference architecture, a roadmap. It does not need to be perfect; in fact, a flawed artifact is more instructive for a first assessment.

## Installing the CLI

Install the EAROS CLI globally from npm:

```bash
npm install -g @trohde/earos
```

Then initialize a workspace in your project directory:

```bash
earos init my-workspace
```

This creates a complete EAROS workspace with rubric files, JSON schemas, agent skills, and an `AGENTS.md` file for AI-assisted evaluation. The workspace is self-contained --- everything you need is scaffolded into the directory.

## Understanding the Workspace

![The EAROS editor home screen with workflow options for governance teams, reviewers, and architects](/screenshots/editor-home.png)

The `earos init` command creates a structured directory containing:

- **Rubric files** --- the core meta-rubric and all built-in profiles and overlays (YAML)
- **JSON schemas** --- for validating rubrics, evaluation records, and artifact documents
- **Agent skills** --- 10 pre-configured skills for AI-assisted evaluation (in `.claude/skills/` and `.agents/skills/`)
- **AGENTS.md** --- agent-agnostic instructions for AI tools like Cursor, Copilot, and Windsurf
- **Manifest** --- an inventory of all available rubrics

## The Core Meta-Rubric

The core meta-rubric (`EAROS-CORE-002`) is the universal foundation. It applies to every architecture artifact regardless of type. It defines **9 dimensions** with **10 criteria**:

| Dimension | What It Assesses |
|-----------|-----------------|
| **D1: Stakeholder and purpose fit** | Does the artifact identify who it is for, why it exists, and what decision it supports? |
| **D2: Scope and boundary clarity** | Does it define what is in scope, out of scope, and the assumptions that underpin the design? |
| **D3: Concern coverage and viewpoint appropriateness** | Are the views and diagrams appropriate for the stated audience and purpose? |
| **D4: Traceability to drivers, requirements, and principles** | Can design choices be traced back to the business drivers that motivated them? |
| **D5: Internal consistency and integrity** | Are terms, structures, and interfaces consistent across all sections and views? |
| **D6: Risks, assumptions, constraints, and tradeoffs** | Does the artifact make trade-offs visible and document risks with mitigations? |
| **D7: Standards and policy compliance** | Does the design comply with mandatory organizational standards and controls? |
| **D8: Actionability and implementation relevance** | Can a delivery team act on this artifact without significant guesswork? |
| **D9: Artifact maintainability and stewardship** | Is the artifact versioned, owned, and structured so it can be maintained over time? |

For your first assessment, you will score every criterion in every dimension. The core rubric is intentionally compact --- 10 criteria is manageable for a first pass.

## The 0--4 Scoring Scale

Every criterion uses the same ordinal scale:

| Score | Label | What It Means in Practice |
|-------|-------|--------------------------|
| **4** | Strong | The criterion is fully addressed. You can point to specific, well-evidenced content that directly satisfies the requirement. No meaningful gaps. |
| **3** | Good | Clearly addressed with adequate evidence. Minor gaps exist but do not undermine the artifact's fitness for purpose. |
| **2** | Partial | The artifact explicitly addresses this area, but coverage is incomplete, inconsistent, or weakly evidenced. You can see the intent but not the execution. |
| **1** | Weak | The criterion is acknowledged or implied, but the treatment is inadequate for decision support. A reviewer would need to ask significant clarifying questions. |
| **0** | Absent | No meaningful evidence exists, or the evidence directly contradicts the criterion. |
| **N/A** | Not applicable | The criterion genuinely does not apply in this context. Every N/A must be justified. |

> **Key insight:** The difference between a 2 and a 3 is the difference between "they tried" and "they succeeded." A score of 2 means the author addressed the topic but left material gaps. A score of 3 means the content is adequate for its purpose with only minor improvements possible.

## Walkthrough: Scoring Your First Artifact

![The New Assessment wizard — select the core rubric, then choose a profile and overlays](/screenshots/editor-new-assessment.png)

Follow these steps for each of the 10 criteria:

1. **Read the criterion question and scoring guide.** Open the core rubric YAML and find the criterion. Read the `question`, the `description`, and all five levels of the `scoring_guide`.

2. **Search the artifact for evidence.** Look for the specific content the criterion requires. The `required_evidence` field tells you exactly what to look for (e.g., "purpose statement," "stakeholder list," "risk list with mitigations").

3. **Record the evidence reference.** Write down where you found it: section number, page, diagram ID, or a direct quote. "Section 3 states: 'Primary stakeholders are the CTO and Head of Payments'" is valid evidence. "The artifact seems to address this" is not.

4. **Assign the score.** Match what you found against the level descriptors in the `scoring_guide`. Use the `decision_tree` if you are unsure --- it provides IF/THEN logic for resolving ambiguous cases.

5. **Move to the next criterion.** Repeat for all 10 criteria.

## Understanding Gates

Not all criteria are equal. Some have **gates** --- threshold controls that can block a passing status regardless of how well you score on everything else.

| Gate Severity | What Happens |
|---------------|-------------|
| **Critical** | If the score is below the gate threshold, the artifact is automatically **Rejected**. No amount of high scores elsewhere can override this. |
| **Major** | A low score caps the maximum achievable status (e.g., cannot pass above Conditional Pass). |
| **Advisory** | A low score triggers a recommendation but does not block any status. |

In the core rubric, **SCP-01** (Scope and boundary clarity) has a **critical** gate: if the scope is so unclear that the artifact cannot be reviewed (score < 2), the result is "Not Reviewable" regardless of all other scores. **STK-01** (Stakeholder and purpose fit) and **TRC-01** (Traceability) have **major** gates.

> **Rule: Gates before averages.** Always check gate criteria first. If a critical gate fails, stop --- the result is Reject. Only then compute the weighted average for the remaining status thresholds.

## Interpreting Your Results

After scoring all criteria and checking gates, compute the weighted average across dimensions and apply the status thresholds:

| Status | Threshold |
|--------|-----------|
| **Pass** | No critical gate failure, overall average >= 3.2, and no dimension average < 2.0 |
| **Conditional Pass** | No critical gate failure, overall average 2.4--3.19 (weaknesses are containable with named actions) |
| **Rework Required** | Overall average < 2.4, or repeated weak dimensions, or insufficient evidence |
| **Reject** | Any critical gate failure, or mandatory control breach |
| **Not Reviewable** | Evidence too incomplete to score responsibly |

![Scoring a criterion — the editor shows the question, scoring guide, evidence fields, and assigned score](/screenshots/editor-evaluation-result.png)

A Conditional Pass is not a failure --- it means the artifact is close but needs specific, named improvements before it is decision-ready. Record those improvements as actions in the evaluation record.

## Checkpoint: You Are at Level 2 When...

- [ ] You have completed at least one assessment using the core meta-rubric
- [ ] Every score has a cited evidence reference --- not "seems adequate" but a specific section, page, or quote
- [ ] You can explain the difference between a score of 2 and a score of 3 for any criterion
- [ ] You understand which gates would block a Pass status and why
- [ ] Your evaluation result includes a status determination (Pass, Conditional Pass, Rework Required, Reject, or Not Reviewable)

## Next Steps

You now have a reproducible, evidence-backed architecture evaluation. The next step is to scale this from an individual practice to a team-wide governed process --- with artifact-specific profiles, cross-cutting overlays, and calibrated scoring.

Continue to [Governed Review](governed-review.md).
