# EaROS Terminology Glossary

Definitions of all technical terms used in the EaROS standard and rubric files, organised into three sections.

---

## 1. Statistical & Calibration Terms

**Calibration**
The process of aligning scorer behaviour to a shared standard by comparing scores against reference examples and resolving systematic disagreements. In EaROS, calibration must be completed before a new profile or overlay is used in production, using the artifacts in `calibration/gold-set/`. Used in: Section 7.7, `earos-calibrate` skill, profile creation step 5.

**Cohen's kappa (κ)**
A statistic measuring agreement between two raters beyond what would be expected by chance. Values range from −1 to 1; κ > 0.70 indicates substantial agreement, κ > 0.50 indicates moderate agreement. EaROS uses weighted kappa for ordinal criteria. Used in: Section 7.7, calibration targets.

**Weighted kappa (QWK — quadratic weighted kappa)**
A variant of Cohen's kappa that penalises disagreements proportionally to how far apart the scores are. Disagreeing by two levels is penalised more than disagreeing by one level. EaROS targets QWK > 0.70 for well-defined ordinal criteria. Used in: Section 7.7.

**Intraclass Correlation Coefficient (ICC)**
A reliability statistic used when there are more than two raters or when scores are on a continuous or ordinal scale. ICC quantifies the proportion of total variance attributable to true differences between subjects rather than rater inconsistency. Cited in EaROS as an alternative to weighted kappa for multi-rater scenarios. Used in: Section 7.7.

**Spearman's rho (ρ)**
A rank-order correlation coefficient that measures the monotonic relationship between two ordered variables without assuming normality. EaROS targets Spearman's rho > 0.80 between agent evaluations and expert human reviewers at the overall assessment level. Used in: Section 7.7.

**Wasserstein distance**
A measure of the distance between two probability distributions, sometimes called the "earth mover's distance". The RULERS calibration method uses Wasserstein distance to measure and correct distributional misalignment between an agent's scoring distribution and the reference human-expert distribution. Used in: `calibration_method: rulers_wasserstein`, Section 7 (RULERS framework).

**Inter-rater reliability (IRR)**
The degree of agreement between two or more independent raters assigning scores to the same items. High IRR indicates the scoring criteria are clear and consistently interpreted. EaROS reports IRR using Cohen's kappa and Spearman's rho. Used in: Section 7.7, `earos-calibrate` skill.

**Calibration**
The process of adjusting rubric criteria and scoring guidance until different raters (human or AI) produce consistent results on the same artifacts. In EaROS, calibration uses gold-standard artifacts with known benchmark scores. Used in: Section 7.7, `calibration/gold-set/`, profile step 5.

**Adjacent-score tolerance**
The rule that disagreements of exactly one score level (e.g., 3 vs. 4) are treated as soft disagreements in calibration metrics, while disagreements of two or more levels are treated as hard disagreements. This reflects the ordinal nature of the 0–4 scale. Used in: Section 7.7.

---

## 2. EaROS-Specific Terms

**Core meta-rubric**
The universal evaluation foundation (`core/core-meta-rubric.yaml`, `rubric_id: EAROS-CORE-002`) defining nine dimensions and ten criteria applied to every architecture artifact regardless of type. All profiles inherit from the core. Used in: Section 5.1, all profile `inherits` fields.

**Profile**
An artifact-type extension that inherits the core meta-rubric and adds 5–12 criteria specific to a particular artifact type (e.g., solution architecture, reference architecture, ADR). Profiles use `kind: profile` and must declare `inherits: [EAROS-CORE-002]`. Used in: Section 5.2, `profiles/` directory.

**Overlay**
A set of cross-cutting criteria injected on top of any core+profile combination, independent of artifact type. Overlays address concerns that recur across artifact types (security, data governance, regulatory compliance). They use `kind: overlay`, `artifact_type: any`, and `scoring.method: append_to_base_rubric`. Applied by context, not artifact type; they cannot remove or weaken base gates. Used in: Section 5.3, `overlays/` directory.

**Gate**
A criterion-level enforcement mechanism that prevents a poor score on a critical criterion being masked by high scores elsewhere. Gates are evaluated before any weighted average is computed. Gate severities: `none`, `advisory`, `major`, `critical` — a critical gate failure results in `Reject` regardless of the average. Used in: Section 7.3, all rubric YAML `gate` fields.

**Evidence anchor**
A direct pointer to the specific excerpt, diagram, section, or reference in the artifact that supports a score. Required for every scored criterion under the RULERS protocol. Anchors are classified as `observed`, `inferred`, or `external`. "The artifact seems to address this" is not a valid evidence anchor. Used in: Section 10.1, all evaluation record `evidence_anchor` fields.

**Evidence class**
The type of evidence behind a score: `observed` (directly quoted from the artifact), `inferred` (reasonably interpreted but not explicitly stated), or `external` (based on a standard or policy outside the artifact). Observed > inferred > external in credibility. Evidence class is mandatory in every evaluation record. Used in: Section 10.3, `outputs.require_evidence_class`.

**RULERS protocol**
An evidence-anchoring scoring procedure from the RULERS framework (2026) that requires extracting a direct quote or reference from the artifact before assigning any score. If no evidence can be found, the criterion is recorded as N/A with a written explanation — never scored from impression alone. Addresses three LLM evaluation failure modes: instability under prompt variations, unverifiable reasoning, and distributional misalignment. Used in: Section 7 (agent mode), `earos-assess` skill.

**DAG evaluation flow**
The directed acyclic graph of eight ordered steps that agents must follow when evaluating an artifact: `structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`. Steps cannot be skipped or reordered. Used in: Section 15 (agent operating pattern), `earos-assess` skill.

**Challenge pass**
Step 6 of the DAG evaluation flow in which a second agent instance (or a second review pass) challenges the primary evaluator's scores. Its purpose is to detect over-scoring, unsupported claims, and evidence gaps before the status is finalised. The most common agent failure is over-scoring — the challenge pass is the primary defence against it. Used in: DAG step 6, `earos-review` skill.

**Rubric locking**
The rule that a rubric's scoring model, gate structure, and level descriptors must not be modified during an active evaluation. Changes require a version bump and owner approval. Represented by `rubric_locked: true` in the `agent_evaluation` metadata block. Prevents interpretation drift across evaluation runs. Used in: Section 3.6 (Principle 6), evaluation record metadata.

**Decision tree**
A structured branching logic field (`decision_tree`) within each criterion that disambiguates edge cases by expressing scoring rules as observable feature counts and presence checks. Example: "IF < 2 views THEN score 0–1. IF 4+ views AND data flow narrative THEN score 3." Decision trees are the primary tool for reducing inter-rater disagreement on ambiguous criteria. Used in: Section 32.5, all rubric criterion `decision_tree` fields.

**`kind` field**
The universal type discriminator in every EaROS YAML file. Valid values: `core_rubric`, `profile`, `overlay` (rubric definitions); `evaluation` (assessment records); `artifact` (architecture documents). The `kind` field is required at the top level of every YAML file and determines which JSON schema it must validate against. Used in: Section 6.1, all EaROS YAML files.

**Manifest (`earos.manifest.yaml`)**
The authoritative inventory at the repo root listing every core rubric, profile, and overlay with their paths, IDs, titles, artifact types, and statuses. Skills use the manifest as a single discovery point rather than hardcoding paths. Updated by `node tools/editor/bin.js manifest`. Used in: `earos-assess`, `earos-create`, `earos-validate` skills.

**Status model**
The five possible outcomes of an EaROS evaluation: `Pass` (no critical gate failure, overall ≥ 3.2, no dimension < 2.0), `Conditional Pass` (overall 2.4–3.19), `Rework Required` (overall < 2.4 or repeated weak dimensions), `Reject` (critical gate failure or mandatory control breach), `Not Reviewable` (insufficient evidence to score). Gates are evaluated first; averages are computed second. Used in: Section 7.4.

**Three evaluation types**
The three distinct judgments that must never be collapsed into a single score: (1) **artifact quality** — is the artifact complete, coherent, and fit for purpose? (2) **architectural fitness** — does the described architecture appear sound relative to business drivers and quality attributes? (3) **governance fit** — does it comply with mandatory standards and controls? A complete, well-written artifact can describe an architecturally unsound system. Used in: Section 1 (Purpose), all evaluation outputs.

**N/A policy**
The rule that a criterion may be scored N/A only when it genuinely does not apply in the artifact's scope or context, and that every N/A must be accompanied by a written justification. N/A criteria are excluded from the score denominator. N/A cannot be used to avoid a hard criterion. Used in: Section 7.1, all evaluation records.

**Confidence**
A qualitative indicator (`high`, `medium`, `low`) of how certain the evaluator is about a score. Reported alongside the numerical score but mathematically independent from it — low confidence does not lower the score; it flags uncertainty for human review. These are two different things; conflating them is a design error. Used in: Section 7.5, `outputs.require_confidence`.

**Design method (EaROS)**
One of five approaches used to organise criteria when creating a new rubric profile: A — Decision-Centred (for ADRs and investment reviews), B — Viewpoint-Centred (for capability maps and reference architectures), C — Lifecycle-Centred (for roadmaps and transition designs), D — Risk-Centred (for security and resilience architectures), E — Pattern-Library (for recurring reference patterns). Stored in the `design_method` field of a profile. Used in: CLAUDE.md Section 5, `templates/new-profile.template.yaml`.

---

## 3. Architecture Terms as Used in EaROS

**Architecture artifact**
Any document or model produced by an architecture practice for the purpose of communicating, deciding, or governing architecture. EaROS applies rubrics to five specific artifact types: solution architectures, reference architectures, ADRs, capability maps, and roadmaps. Each type has a matching profile. Used in: throughout EaROS.

**Viewpoint**
A specification of the conventions for constructing and using a view to address one or more stakeholder concerns (ISO/IEC/IEEE 42010). In EaROS, a viewpoint corresponds to a perspective from which an architecture is described — context, functional, deployment, data flow, security, etc. Rubric criteria check that appropriate viewpoints are present and sufficient. Used in: Section 2 (ISO 42010 alignment), dimension 8.3.

**Concern**
A matter of interest to a stakeholder regarding the system or the architecture artifact (ISO/IEC/IEEE 42010). Examples: "Can the system handle 10× growth?", "Does it comply with PCI-DSS?", "Can teams deploy independently?" EaROS Principle 1 states that rubrics evaluate whether artifacts answer stakeholder concerns, not just completeness. Used in: Sections 3.1, 8.3.

**Quality attribute**
A measurable or testable property of a system that indicates how well it satisfies stakeholder needs (e.g., availability, performance, security, modifiability). Quality attributes are central to architectural fitness evaluation. Distinguished from vague adjectives ("performant", "scalable") by having concrete numerical targets. EaROS references ISO/IEC 25010:2023 as the reference model. Used in: Sections 2, 8.6.

**Quality attribute scenario**
A structured specification of a quality attribute requirement in the form: source → stimulus → artifact → environment → response → response measure. Scenarios make quality attributes testable and comparable across design options. Referenced in EaROS as the preferred format for specifying QA requirements in architecture artifacts. Used in: profile criteria, `examples/` artifacts.

**Fitness function**
An automated test or metric that continuously validates whether an architecture meets a specific quality attribute target (e.g., a load test verifying P99 latency < 200ms, a chaos test confirming failover within RTO). Borrowed from evolutionary architecture. In EaROS, fitness functions are referenced as a mechanism for making quality attribute requirements testable and automatable. Used in: Section 2 (SEI ATAM alignment), quality attribute criteria.

**Architecture Decision Record (ADR)**
A document that captures an architecture decision, the context in which it was made, the options considered, the rationale for the choice, and expected consequences. EaROS includes a dedicated `adr` profile (`profiles/adr.yaml`) with criteria for decision quality, alternatives documentation, and consequence traceability. Used in: `profiles/adr.yaml`, dimension 8.4 (traceability).

**Golden path**
A recommended, opinionated implementation path within a reference architecture that reduces decision paralysis for consuming teams. A reference architecture that defines a golden path is more actionable than one that presents multiple alternatives without guidance. Originated at Spotify: the supported way to build something, with pre-configured CI/CD, observability, and security. Used in: `profiles/reference-architecture.yaml` criterion RA-IMP-02.

**Prescriptiveness spectrum**
The axis from fully descriptive (describes a pattern without mandating implementation choices) to fully prescriptive (specifies exact technology choices, configurations, and templates). Where a reference architecture sits on this spectrum determines how much decision latitude consuming teams retain. EaROS evaluates whether the level of prescriptiveness is appropriate for the artifact's audience and stated purpose. Used in: `profiles/reference-architecture.yaml` criterion RA-DEC-02.

**ATAM (Architecture Tradeoff Analysis Method)**
A structured method from the Software Engineering Institute (SEI) for evaluating an architecture against quality attribute requirements by identifying sensitivity points, tradeoff points, risks, and non-risks. EaROS draws on ATAM's approach to tradeoff documentation and risk identification in dimension 8.6. Used in: Section 2.
