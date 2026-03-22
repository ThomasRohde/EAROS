# EAROS Adoption Maturity Model

## Why Staged Adoption Matters

Organizations that attempt to leap from ad hoc architecture review to fully automated evaluation almost always fail. The gap is too wide: teams lack the shared vocabulary, calibrated judgment, and institutional habits that make structured review work. This is not a technology problem --- it is a capability maturity problem.

The EAROS Adoption Maturity Model draws on three decades of maturity research:

- **CMMI** (Capability Maturity Model Integration) established the 5-level progression from initial/ad hoc to optimizing, demonstrating that process maturity is built incrementally.
- **Gartner IT Score for Enterprise Architecture** identified that EA maturity depends on governance discipline, stakeholder engagement, and measurement --- not tooling alone.
- **OMB EAAF** (Enterprise Architecture Assessment Framework) showed that federal agencies succeed when they build capability in stages aligned to organizational readiness.
- **TOGAF ACMM** (Architecture Capability Maturity Model) provided the architecture-specific framing: maturity grows from informal practices through defined processes to measured and optimized operations.

EAROS applies these lessons to a specific domain: architecture artifact evaluation. Each level builds on the previous one. Skip a level and you build on sand.

## The Five Levels

| Level | Name | Description | Key Practices | EAROS Capabilities Used | Success Criteria |
|-------|------|-------------|---------------|------------------------|------------------|
| **1** | **Ad Hoc** | No formal review process. Evaluation quality depends entirely on who happens to review the artifact. Different reviewers apply different mental models, and feedback is inconsistent and unreproducible. | Informal peer review, tribal knowledge | None (this is the baseline state) | You recognize the problem: reviews are inconsistent and reviewer-dependent |
| **2** | **Rubric-Based** | The core rubric is adopted. Every assessment uses the same 9 dimensions and 10 criteria with the 0--4 scoring scale. Evidence is cited for every score. Results are reproducible across reviewers. | Manual scoring against core meta-rubric, evidence citation for every score, gate checking | Core meta-rubric, scoring sheets, 0--4 scale | At least one complete assessment using the core rubric with evidence for every score |
| **3** | **Governed** | Artifact-specific profiles and context-driven overlays are in use. Teams are calibrated against reference examples. The RULERS protocol ensures evidence-anchored scoring. Evaluation records are structured and auditable. | Profile and overlay selection, RULERS protocol, team calibration exercises, structured evaluation records | Profiles, overlays, calibration, RULERS protocol, evidence classes | Calibration exercise completed with Cohen's kappa > 0.70; profiles matched to artifact types |
| **4** | **Hybrid** | AI agents augment human reviewers. Both evaluate independently and reconcile disagreements against level descriptors. Metrics track inter-rater reliability between human and agent evaluators. | Human + AI agent independent evaluation, challenge pass, disagreement resolution, reliability tracking | Agent skills, DAG evaluation flow, challenge pass, hybrid mode | Human-agent disagreements routinely resolved; inter-rater reliability tracked |
| **5** | **Optimized** | Architecture evaluation is continuous and integrated into delivery workflows. Calibration happens automatically. Executive reporting provides portfolio-level quality visibility. Rubrics are governed assets with version control and change management. | CI/CD integration, continuous calibration, custom profile creation, executive reporting, fitness functions | Executive reporting, fitness functions, Wasserstein calibration, custom profiles | Evaluation integrated into pipelines; calibration drift monitored; portfolio-level reporting operational |

## Where Are You Today?

Use this self-assessment to identify your current level. Answer each question honestly --- the goal is to find your starting point, not to score well.

### Level 1 -- Ad Hoc (you are here if most answers are "no")

- [ ] Do you have a written set of criteria for architecture review?
- [ ] Do two reviewers produce substantially similar feedback on the same artifact?
- [ ] Can you explain what "good" looks like for an architecture artifact in your organization?

### Level 2 -- Rubric-Based (you are here if you can answer "yes" to these)

- [ ] You use a defined rubric with explicit criteria and scoring levels
- [ ] Every score has a cited evidence reference (not just "seems adequate")
- [ ] You can explain the difference between a score of 2 and 3 for any criterion
- [ ] You check gates before computing averages

### Level 3 -- Governed (you are here if you can answer "yes" to these)

- [ ] You select profiles matched to artifact types (not just the core rubric)
- [ ] You apply overlays based on context (security, data governance, regulatory)
- [ ] Your team has completed a calibration exercise with inter-rater agreement measured
- [ ] Evidence is classified as observed, inferred, or external
- [ ] Artifact quality, architectural fitness, and governance fit are reported separately

### Level 4 -- Hybrid (you are here if you can answer "yes" to these)

- [ ] AI agents evaluate artifacts using the full 8-step DAG evaluation flow
- [ ] Human and agent evaluations are compared and reconciled
- [ ] A challenge pass reviews the highest and lowest scores for every evaluation
- [ ] You track inter-rater reliability metrics between human and agent evaluators

### Level 5 -- Optimized (you are here if you can answer "yes" to these)

- [ ] Architecture evaluation is integrated into your CI/CD or delivery pipeline
- [ ] Calibration runs continuously, not just at setup time
- [ ] You create and maintain custom profiles for your organization's artifact types
- [ ] Executive reporting provides portfolio-level quality visibility
- [ ] Rubric changes follow a governed process with version bumps and re-calibration

## How to Use This Guide

The onboarding guide is organized as five pages, one for each level transition:

1. [Your First Assessment](first-assessment.md) --- Level 1 to 2: Ad Hoc to Rubric-Based
2. [Governed Review](governed-review.md) --- Level 2 to 3: Rubric-Based to Governed
3. [Agent-Assisted Evaluation](agent-assisted.md) --- Level 3 to 4: Governed to Hybrid
4. [Scaling and Optimization](scaling-optimization.md) --- Level 4 to 5: Hybrid to Optimized

**Sequential reading is recommended.** Each guide builds on concepts introduced in the previous one. However, if you already know your current level from the self-assessment above, you can jump directly to the guide for your next transition.

> **Tip:** If you are new to EAROS entirely, start with [Your First Assessment](first-assessment.md). It walks you through installation, the core rubric, and your first scored evaluation --- everything you need to move from ad hoc to rubric-based review.

For deeper reference material, see the [Getting Started guide](../getting-started.md), the [Terminology glossary](../terminology.md), and the full EAROS standard in `standard/EAROS.md`.
