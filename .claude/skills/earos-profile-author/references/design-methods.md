# Design Methods — EAROS Profile Author

This file describes the 5 design methods for EAROS profiles. Read this before choosing a method (Step 2).

---

## Why Design Methods Matter

A profile's design method shapes its dimensional structure and criterion types. Choosing the wrong method produces criteria that feel disconnected from the artifact type — assessors struggle to apply them, calibration fails, and the profile is abandoned.

The five methods are not about the content of the architecture — they are about the primary *evaluative lens* the profile applies.

---

## Method A — Decision-Centred

**Best for:** ADRs, investment reviews, exception requests, approval documents

**Core question:** "Is this document adequate to support a governance decision?"

**Why:** Decision-focused artifacts are evaluated primarily on whether they enable a clear, informed decision. The architecture content matters less than the decision structure: was the context clear, were alternatives considered, is the rationale sound, is the decision reversible or final?

**Dimension structure typically includes:**
- Decision context and framing (why is a decision needed?)
- Options analysis (what was considered, why rejected)
- Decision statement and rationale
- Reversibility and revisit conditions
- Stakeholder alignment

**Signature criteria:**
- Options presented with comparative analysis (not just the chosen option)
- Decision consequences made explicit
- Revisit/escalation conditions named

**Example profile:** `profiles/adr.yaml`

**Key indicator to choose Method A:** The primary artifact purpose is to get approval or record a governance decision — not to describe an architecture in full.

---

## Method B — Viewpoint-Centred

**Best for:** Capability maps, reference architectures, solution architectures, platform blueprints

**Core question:** "Does this artifact address the concerns of all relevant stakeholders through appropriate architectural views?"

**Why:** Viewpoint-centred artifacts are evaluated on their completeness across multiple perspectives (context, functional, deployment, data, security) and how well those views address the stated stakeholder concerns. The presence and quality of views is the primary quality signal.

**Dimension structure typically includes:**
- Views and diagrams coverage
- Stakeholder concern coverage
- Cross-view consistency
- Notation and annotation quality

**Signature criteria:**
- Multiple views present (minimum: context, component, deployment)
- Views explicitly mapped to stakeholder concerns
- Consistent terminology and component naming across views

**Example profiles:** `profiles/reference-architecture.yaml`, `profiles/solution-architecture.yaml`

**Key indicator to choose Method B:** The artifact is expected to contain multiple diagrams and the audience needs different perspectives on the same system.

---

## Method C — Lifecycle-Centred

**Best for:** Transition designs, roadmaps, handover documents, migration plans

**Core question:** "Does this artifact support the full lifecycle — current state, future state, and the path between them?"

**Why:** Lifecycle artifacts are evaluated on whether they adequately describe the journey, not just the destination. Current state, future state, transition steps, dependencies, and rollback conditions are all essential. An artifact that only describes the target state fails because it leaves delivery teams without a path.

**Dimension structure typically includes:**
- Current state description
- Future/target state description
- Transition pathway (phases, milestones, dependencies)
- Risk and rollback
- Ownership across lifecycle phases

**Signature criteria:**
- Current state explicitly described (not just assumed)
- Transition steps sequenced with dependencies
- Rollback or abort conditions named

**Example profile:** `profiles/roadmap.yaml`

**Key indicator to choose Method C:** The artifact describes a change over time, not just a static design.

---

## Method D — Risk-Centred

**Best for:** Security architectures, regulatory compliance designs, resilience architectures, threat models

**Core question:** "Does this artifact identify, mitigate, and accept risks at a level appropriate for the risk domain?"

**Why:** Risk-centred artifacts are evaluated on completeness of risk identification and adequacy of mitigations, not just architectural soundness. The primary failure mode is incomplete risk coverage — threats not considered, mitigations not proportionate, residual risk not accepted by a named authority.

**Dimension structure typically includes:**
- Risk identification scope and completeness
- Mitigation design and proportionality
- Residual risk acceptance
- Control implementation evidence
- Compliance coverage

**Signature criteria:**
- Threat model or risk register covering defined scope
- Mitigations proportionate to risk likelihood × impact
- Named authority accepting residual risks
- Control-to-requirement traceability

**Key indicator to choose Method D:** The primary purpose of the artifact is to demonstrate that risks have been identified and managed — not just to describe the architecture.

**Note:** The security and regulatory overlays (`overlays/security.yaml`, `overlays/regulatory.yaml`) often apply alongside Method D profiles but are not substitutes for a D-method profile when the artifact is primarily risk-focused.

---

## Method E — Pattern-Library

**Best for:** Recurring reference patterns, platform blueprints, golden-path designs

**Core question:** "Is this pattern sufficiently defined, validated, and reusable that teams can adopt it without extensive customization?"

**Why:** Pattern-library artifacts are evaluated on their reusability and adoption-readiness, not just their technical correctness. A pattern that is architecturally sound but undocumented at the decision point level isn't reusable — teams have to recreate the design rationale each time. The primary failure mode is an artifact that is a good architecture but a poor pattern.

**Dimension structure typically includes:**
- Pattern definition and applicability conditions
- Implementation completeness (is there enough to act on?)
- Reuse guidance (when to use, when not to use, variants)
- Evolution and versioning
- Validation evidence (is this proven in production?)

**Signature criteria:**
- Named applicability conditions ("use this when X, don't use when Y")
- Canonical implementation example
- Known variants documented
- Adoption metrics or proven instances

**Example profile:** `profiles/reference-architecture.yaml` (uses Method E)

**Key indicator to choose Method E:** Teams are expected to adopt this pattern repeatedly — it needs to work as a template, not just a one-time design.

---

## Choosing Between Methods — Decision Guide

| Situation | Method |
|-----------|--------|
| "We need to approve a specific decision" | A — Decision-Centred |
| "We need multiple teams to understand this system from different angles" | B — Viewpoint-Centred |
| "We're describing how to get from A to B over time" | C — Lifecycle-Centred |
| "The primary purpose is to show risks are controlled" | D — Risk-Centred |
| "Teams will use this repeatedly as a template" | E — Pattern-Library |

**When in doubt:** Method B (Viewpoint-Centred) is the most general and works well for most architecture artifacts that don't fit a more specific method.

**Combinations:** Some artifacts have secondary concerns from another method. Handle this by choosing the primary method and adding criteria from the secondary concern to relevant dimensions, rather than trying to combine two methods.
