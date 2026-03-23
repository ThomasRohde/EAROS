# EAROS Adoption Maturity Model

## Why Staged Adoption Matters

Organizations that attempt to leap from ad hoc architecture review to fully automated evaluation almost always fail. The gap is too wide: teams lack the shared vocabulary, calibrated judgment, and institutional habits that make structured review work. This is not a technology problem — it is a capability maturity problem.

The EAROS Adoption Maturity Model draws on three decades of maturity research:

- **CMMI** (Capability Maturity Model Integration) established the 5-level progression from initial/ad hoc to optimizing, demonstrating that process maturity is built incrementally.
- **Gartner IT Score for Enterprise Architecture** identified that EA maturity depends on governance discipline, stakeholder engagement, and measurement — not tooling alone.
- **OMB EAAF** (Enterprise Architecture Assessment Framework) showed that federal agencies succeed when they build capability in stages aligned to organizational readiness.
- **TOGAF ACMM** (Architecture Capability Maturity Model) provided the architecture-specific framing: maturity grows from informal practices through defined processes to measured and optimized operations.

EAROS applies these lessons to a specific domain: architecture artifact evaluation. Each level builds on the previous one. Skip a level and you build on sand.

## The Five Levels

### Level 1 — Ad Hoc

No formal review process. Evaluation quality depends entirely on who happens to review the artifact. Different reviewers apply different mental models, and feedback is inconsistent and unreproducible.

- **Key practices:** Informal peer review, tribal knowledge
- **EAROS capabilities:** None (this is the baseline state)
- **You are here when:** You recognize the problem — reviews are inconsistent and reviewer-dependent

### Level 2 — Rubric-Based

The core rubric is adopted. Every assessment uses the same 9 dimensions and 10 criteria with the 0–4 scoring scale. Evidence is cited for every score. Results are reproducible across reviewers.

- **Key practices:** Manual scoring against core meta-rubric, evidence citation for every score, gate checking
- **EAROS capabilities:** Core meta-rubric, scoring sheets, 0–4 scale
- **You are here when:** You have completed at least one assessment using the core rubric with evidence for every score

> **Guide:** [Your First Assessment](first-assessment.md) walks you through this transition.

### Level 3 — Governed

Artifact-specific profiles and context-driven overlays are in use. Teams are calibrated against reference examples. The RULERS protocol ensures evidence-anchored scoring. Evaluation records are structured and auditable.

- **Key practices:** Profile and overlay selection, RULERS protocol, team calibration exercises, structured evaluation records
- **EAROS capabilities:** Profiles, overlays, calibration, RULERS protocol, evidence classes
- **You are here when:** Your team has completed a calibration exercise with Cohen's kappa > 0.70 and profiles are matched to artifact types

> **Guide:** [Governed Review](governed-review.md) walks you through this transition.

### Level 4 — Hybrid

AI agents augment human reviewers. Both evaluate independently and reconcile disagreements against level descriptors. Metrics track inter-rater reliability between human and agent evaluators.

- **Key practices:** Human + AI agent independent evaluation, challenge pass, disagreement resolution, reliability tracking
- **EAROS capabilities:** Agent skills, DAG evaluation flow, challenge pass, hybrid mode
- **You are here when:** Human-agent disagreements are routinely resolved and inter-rater reliability is tracked

> **Guide:** [Agent-Assisted Evaluation](agent-assisted.md) walks you through this transition.

### Level 5 — Optimized

Architecture evaluation is continuous and integrated into delivery workflows. Calibration happens automatically. Executive reporting provides portfolio-level quality visibility. Rubrics are governed assets with version control and change management.

- **Key practices:** CI/CD integration, continuous calibration, custom profile creation, executive reporting, fitness functions
- **EAROS capabilities:** Executive reporting, fitness functions, Wasserstein calibration, custom profiles
- **You are here when:** Evaluation is integrated into pipelines, calibration drift is monitored, and portfolio-level reporting is operational

> **Guide:** [Scaling and Optimization](scaling-optimization.md) walks you through this transition.

## How to Use This Guide

The onboarding guide is organized as four transition guides, one for each level transition:

1. [Your First Assessment](first-assessment.md) — Level 1 to 2: Ad Hoc to Rubric-Based
2. [Governed Review](governed-review.md) — Level 2 to 3: Rubric-Based to Governed
3. [Agent-Assisted Evaluation](agent-assisted.md) — Level 3 to 4: Governed to Hybrid
4. [Scaling and Optimization](scaling-optimization.md) — Level 4 to 5: Hybrid to Optimized

**Sequential reading is recommended.** Each guide builds on concepts introduced in the previous one. However, if you already know your current level from the self-assessment above, you can jump directly to the guide for your next transition.

> **Tip:** If you are new to EAROS entirely, start with [Your First Assessment](first-assessment.md). It walks you through installation, the core rubric, and your first scored evaluation — everything you need to move from ad hoc to rubric-based review.

For deeper reference material, see the [Getting Started guide](../getting-started.md), the [Terminology glossary](../terminology.md), and the full EAROS standard in `standard/EAROS.md`.
