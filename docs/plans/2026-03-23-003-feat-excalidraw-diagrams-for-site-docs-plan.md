---
title: "Add Excalidraw diagrams to site documentation"
type: feat
status: tier1-complete
date: 2026-03-23
---

# Add Excalidraw diagrams to site documentation

## Overview

The EaROS documentation site renders markdown content on GitHub Pages. Several key concepts — evaluation flows, rubric composition, gate logic, maturity levels — are abstract enough that text and tables alone leave readers to build their own mental model. Excalidraw SVG diagrams can make these concepts immediately visual without adding build complexity.

The `excal` CLI workflow is already established (see `docs/solutions/tools/excal-cli-excalidraw-diagrams.md`) and one diagram is live (`site/public/diagrams/earos-layers.svg`). This plan identifies the highest-value opportunities and sequences them.

## Approach

Create `.excalidraw` source files, render to SVG with `excal render --svg --no-background`, place in `site/public/diagrams/`, and embed in the relevant markdown via full GitHub Pages URL. Commit both source and rendered output.

All diagrams follow the established style: `roughness: 1` (handwritten), `fontFamily: 1` (Virgil), pastel fills, transparent backgrounds.

## Diagram Opportunities

### Tier 1 — Highest impact (abstract concepts, most benefit from visualisation)

These five diagrams address the most complex or frequently misunderstood parts of the framework.

#### 1. Eight-step DAG evaluation flow
- **Doc:** `docs/onboarding/agent-assisted.md` (lines 13–33)
- **What:** Eight sequential boxes with arrows showing the evaluation pipeline: Structural Validation → Content Extraction → Criterion Scoring → Cross-Reference Validation → Dimension Aggregation → Challenge Pass → Calibration → Status Determination.
- **Why:** This is the single most abstract concept in the docs. The sequential ordering and the "challenge pass bottleneck" are frequently misunderstood. A Mermaid version exists in the repo README but is not rendered on the site docs page.
- **Elements:** 8 rectangles (numbered), directional arrows, annotation callout on Challenge Pass ("most commonly skipped").
- **File:** `site/public/diagrams/dag-evaluation-flow.excalidraw`

#### 2. Status determination decision tree
- **Docs:** `standard/EAROS.md` (lines 238–259), `docs/getting-started.md` (lines 111–123), `docs/onboarding/first-assessment.md` (lines 111–122)
- **What:** Flowchart showing gate-first logic: check critical gates → if fail, Reject/Not Reviewable (stop). Otherwise compute weighted average → ≥ 3.2 Pass, 2.4–3.19 Conditional Pass, < 2.4 Rework Required.
- **Why:** The two-phase logic (gates first, then thresholds) is the core of the scoring model and is easy to get wrong from text alone.
- **Elements:** Diamond decision nodes for gate checks, rectangle outcome nodes colour-coded by status (green/yellow/orange/red), threshold labels on arrows.
- **File:** `site/public/diagrams/status-determination.excalidraw`
- **Reuse:** Embed in all three docs that describe status determination.

#### 3. Rubric composition model
- **Doc:** `docs/getting-started.md` (lines 33–57)
- **What:** Visual showing how Core + Profile + Overlays stack to form a complete rubric set. Example scenario: "Evaluating a payment service architecture" → Core (always) + Solution-Architecture profile + Security overlay + Regulatory overlay.
- **Why:** The three-layer concept is central to EaROS. The existing `earos-layers.svg` shows the layers but not how a practitioner *assembles* them for a specific evaluation.
- **Elements:** Three layer blocks (core at bottom, profile in middle, overlays on top), example artifact callout on the left, arrows showing selection.
- **File:** `site/public/diagrams/rubric-composition.excalidraw`

#### 4. Maturity progression with capability stacking
- **Doc:** `docs/onboarding/overview.md` (lines 16–64)
- **What:** Five levels shown as ascending blocks. Each level adds capabilities on top of the previous: Level 1 (Ad Hoc) → Level 2 (Rubric-Based: add core rubric, scoring, evidence) → Level 3 (Governed: add profiles, overlays, calibration) → Level 4 (Hybrid: add AI agents, challenge pass) → Level 5 (Optimised: add CI/CD, continuous calibration).
- **Why:** The site renders this as a stepper component, but the capability *accumulation* is invisible. A stacked diagram shows what's new at each level.
- **Elements:** 5 horizontal bars of increasing width, each labelled with what's added, arrow showing progression.
- **File:** `site/public/diagrams/maturity-levels.excalidraw`

#### 5. Three evaluation lenses
- **Doc:** `docs/onboarding/governed-review.md` (lines 78–90)
- **What:** Three overlapping circles (or three columns) showing: Artifact Quality (completeness, coherence, clarity), Architectural Fitness (soundness, quality attributes, risks), Governance Fit (compliance, controls, review expectations).
- **Why:** Reviewers often conflate these perspectives. A diagram showing them as distinct but complementary lenses sharpens evaluation quality.
- **Elements:** Three labelled regions with key concerns listed inside each.
- **File:** `site/public/diagrams/evaluation-lenses.excalidraw`

### Tier 2 — Medium impact (process flows, relationships)

#### 6. Calibration workflow loop
- **Doc:** `docs/onboarding/governed-review.md` (lines 94–122)
- **What:** 7-step calibration process with a feedback loop: Select artifacts → Score independently → Compare → Identify disagreements → Resolve → Compute κ → Update decision trees → (loop back).
- **File:** `site/public/diagrams/calibration-workflow.excalidraw`

#### 7. Hybrid evaluation model
- **Doc:** `docs/onboarding/agent-assisted.md` (lines 71–87)
- **What:** Side-by-side comparison: Human path (contextual judgment) ↔ AI path (consistency, coverage) → Reconciliation centre → Final evaluation record.
- **File:** `site/public/diagrams/hybrid-model.excalidraw`

#### 8. CI/CD integration pipeline
- **Doc:** `docs/onboarding/scaling-optimization.md` (lines 11–31)
- **What:** Pipeline diagram: Architecture artifact modified → PR/MR → EAROS evaluation triggered → colour-coded outcomes (red: blocked, yellow: conditional, green: clean merge).
- **File:** `site/public/diagrams/cicd-pipeline.excalidraw`

#### 9. Profile selection matrix
- **Doc:** `docs/onboarding/governed-review.md` (lines 17–33)
- **What:** Artifact type → profile mapping with visual callouts showing what each profile adds.
- **File:** `site/public/diagrams/profile-selection.excalidraw`

#### 10. Continuous calibration feedback loop
- **Doc:** `docs/onboarding/scaling-optimization.md` (lines 33–48)
- **What:** Circular flow: Evaluations → Score distribution tracking → Wasserstein distance → Threshold check → Recalibration (if needed) → (loop).
- **File:** `site/public/diagrams/continuous-calibration.excalidraw`

### Tier 3 — Clarification (helpful but lower priority)

#### 11. Nine dimensions grid
- **Doc:** `docs/onboarding/first-assessment.md` (lines 48–64)
- **What:** 3×3 visual grid of the 9 core dimensions, with gate indicators.
- **File:** `site/public/diagrams/nine-dimensions.excalidraw`

#### 12. Gate severity hierarchy
- **Doc:** `docs/onboarding/first-assessment.md` (lines 97–109)
- **What:** Three-level severity stack: Advisory → Major → Critical, with effects.
- **File:** `site/public/diagrams/gate-hierarchy.excalidraw`

#### 13. Evidence extraction workflow
- **Doc:** `docs/getting-started.md` (lines 81–99)
- **What:** 5-box flow: Find evidence → Record citation → Match to scoring guide → Assign score → Flag uncertainty.
- **File:** `site/public/diagrams/evidence-workflow.excalidraw`

#### 14. Overlay selection triggers
- **Doc:** `docs/onboarding/governed-review.md` (lines 35–49)
- **What:** Decision tree for when to apply each overlay (Security, Data Governance, Regulatory).
- **File:** `site/public/diagrams/overlay-selection.excalidraw`

#### 15. Profile creation workflow
- **Doc:** `docs/onboarding/scaling-optimization.md` (lines 51–69), `docs/profile-authoring-guide.md` (lines 14–22)
- **What:** 6-step design method selection with decision points.
- **File:** `site/public/diagrams/profile-creation.excalidraw`

## Acceptance Criteria

- [ ] Tier 1 diagrams (5) created, validated, rendered, and embedded in their docs
- [ ] Each diagram follows style conventions: roughness 1, Virgil font, pastel fills, transparent background
- [ ] Both `.excalidraw` source and `.svg` output committed for every diagram
- [ ] SVGs embedded via full GitHub Pages URL for cross-platform rendering
- [ ] Site deployed and diagrams verified on live pages
- [ ] Tier 2 diagrams (5) created and embedded
- [ ] Tier 3 diagrams (5) created and embedded (stretch)

## Implementation Notes

- All diagrams live in `site/public/diagrams/` so the Deploy Site workflow picks them up automatically.
- The status determination diagram (#2) is reused across 3 docs — embed the same SVG URL in each.
- The Deploy Site workflow triggers on `site/**` and `docs/**` changes, so pushing diagrams + updated docs in the same commit triggers a single deploy.
- For complex diagrams (DAG flow, decision tree), consider using frames in Excalidraw to group related elements.
- Run `excal validate` on every `.excalidraw` file before rendering.

## Sequencing

Start with Tier 1 in order (DAG flow first — highest value, most complex). Each diagram is independent, so they can be done in parallel if needed. Tier 2 and 3 follow once Tier 1 is verified on the live site.

## Sources

- Excal CLI learning: `docs/solutions/tools/excal-cli-excalidraw-diagrams.md`
- Existing example: `site/public/diagrams/earos-layers.excalidraw` / `.svg`
- Style conventions: roughness 1, fontFamily 1, `--no-background`, pastel palette (#a5d8ff, #b2f2bb, #ffec99, #fcc2d7, #dee2e6)
