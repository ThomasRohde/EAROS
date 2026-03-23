# Enterprise Architecture Rubric Operational Standard (EAROS)

*Status: Draft for review
Audience: Enterprise architects, architecture boards, design authorities, reviewers, and LLM/automation teams*

> See [docs/terminology.md](../docs/terminology.md) for definitions of all technical terms used in this standard.

## 1. Purpose

This document defines an operational standard for creating, governing, extending, and applying rubrics to enterprise architecture artifacts and related architecture work products.

The goal is to make architecture evaluation more consistent, more explainable, and more automatable. The standard is designed for both human review and agentic application. It standardizes:

* what a rubric is
* how a rubric is structured
* how criteria are scored
* how evidence is recorded
* how artifact-specific profiles are added
* how results are documented and governed
* how agents can help develop and apply rubrics safely

This standard assumes a simple but important distinction:

1. **Artifact quality** — whether the artifact is complete, coherent, clear, traceable, and fit for its stated purpose
2. **Architectural fitness** — whether the architecture described appears sound relative to business drivers, quality attributes, risks, and tradeoffs
3. **Governance fit** — whether the artifact and/or proposed design complies with mandatory principles, standards, controls, and review expectations

These must not be collapsed into one opaque score. They are related but distinct judgments.


### Research foundations

This standard incorporates findings from a comprehensive research programme covering 63 sources across academic literature, industry frameworks, and emerging AI evaluation methods. Key foundations include alignment to Microsoft's LLM-Rubric (ACL 2024), the RULERS framework, and the CARO confusion-aware rubric optimization approach.

## 2. Design foundations

This standard is intentionally aligned to widely used architecture and evaluation concepts:

* ISO/IEC/IEEE 42010 frames architecture descriptions around stakeholders, concerns, viewpoints, and architecture descriptions rather than generic documentation alone. [R1]
* The Open Group describes architecture compliance review as a scrutiny of a project against established architectural criteria, spirit, and business objectives. [R2]
* SEI’s ATAM treats architecture evaluation as an explicit examination of quality attribute goals, tradeoffs, and risks that may inhibit business goals. [R3]
* NIST’s AI RMF Playbook is useful as an operational pattern because it combines governance, mapping, measurement, and management in an iterative, non-checklist way and is also available in structured formats such as JSON and CSV. [R4]
* ISO/IEC 25010:2023 provides a reference model in which quality characteristics are defined so they can be specified, measured, and evaluated. [R5]

* Microsoft's LLM-Rubric (ACL 2024) demonstrates that multidimensional, calibrated rubric evaluation using LLMs can achieve 2x improvement in alignment with human judges when scoring is decomposed per dimension and combined through a learned aggregation function. [R7]
* The RULERS framework (2026) addresses three failure modes of LLM judges — instability under prompt variations, unverifiable reasoning, and distributional misalignment — through rubric locking, evidence-anchored scoring, and Wasserstein-based calibration. [R8]
* Snorkel AI's rubric engineering methodology treats rubrics as models that should be co-developed with domain experts, calibrated until inter-rater reliability stabilizes, and measured using the same agreement statistics (Cohen’s kappa, QWK, ICC) as human annotators. [R9]
* The CARO framework (Confusion-Aware Rubric Optimization, 2026) demonstrates that rubric ambiguity can be systematically identified and resolved through targeted rule patches that address specific misclassification patterns without degrading global performance. [R10]
* AWS's Well-Architected AI assessment using Amazon Bedrock provides a production-validated pattern for automated architecture review against structured pillar-based frameworks. [R11]
* A 2024 ACM Computing Surveys systematic literature review of 109 EA evaluation methods confirms that automation of assessment and architecture modeling processes is the critical factor for widespread adoption. [R12]

The standard below is therefore not just a scorecard template. It is an operating model for architecture evaluation.

## 3. Core principles

### 3.1 Principle 1 — Concern-driven, not document-driven

Rubrics evaluate whether an artifact answers the stakeholder concerns it exists to address. A beautiful artifact that does not answer the decision at hand should not score well.

### 3.2 Principle 2 — Evidence first

Every score must point to evidence in the artifact or explicitly state that evidence is missing.

### 3.3 Principle 3 — Gates before averages

Mandatory failures must not be hidden by weighted averages.

### 3.4 Principle 4 — Explainability over fake precision

Prefer a disciplined ordinal scale with clear guidance over false numerical granularity.

### 3.5 Principle 5 — Separate observation from inference

Reviewers and agents must distinguish:

* **Observed**: directly supported by artifact evidence
* **Inferred**: reasonable interpretation not directly stated
* **External**: judgment based on a standard, policy, or source outside the artifact

### 3.6 Principle 6 — Rubrics are governed assets

Rubrics, profiles, and overlays are versioned, reviewed, calibrated, and changed under governance.

### 3.7 Principle 7 — Agentic use must remain auditable

An agent may propose, score, summarize, and challenge, but the evaluation record must remain inspectable by a human reviewer.

### 3.8 Principle 8 — Machine-readable where possible

Architecture artifacts should be structured in machine-parseable formats to enable reliable automated extraction, validation, and assessment. This includes structured metadata (YAML frontmatter), schema-validated models (ArchiMate exchange format, OpenAPI), diagram-as-code representations, and consistent section markers. Machine-readability is not an end in itself but a prerequisite for consistent, scalable, and reproducible evaluation.

## 4. Scope

This standard can be applied to any architecture artifact, including but not limited to:

* enterprise capability maps
* business architecture views
* application and integration architecture diagrams
* target-state architectures
* transition architectures
* solution architectures
* architecture decision records (ADRs)
* principle sets
* technology standards profiles
* roadmaps
* data architecture artifacts
* security architecture artifacts
* operating model and platform strategy documents

## 5. Operating model

The standard uses a three-layer composition model.

### 5.1 Layer 1 — Core meta-rubric

The core meta-rubric applies to **all** architecture artifacts. It standardizes the base dimensions and scoring model.

### 5.2 Layer 2 — Artifact profile

Each artifact type has a profile that adds or specializes criteria for that artifact class.

Examples:

* Capability Map Profile
* Solution Architecture Profile
* Target State Profile
* ADR Profile
* Roadmap Profile

### 5.3 Layer 3 — Context overlay

Overlays add criteria or gates required by a specific context.

Examples:

* Security Overlay
* Data Governance Overlay
* Regulatory Overlay
* Cloud Platform Overlay
* Critical Production Change Overlay

This layered model is important because one global rubric becomes too generic, while fully bespoke rubrics become ungovernable.

## 6. Standard rubric anatomy

Every rubric, profile, and overlay must include the following fields.

### 6.1 Mandatory metadata

* rubric\_id
* title
* version
* status (draft, approved, deprecated)
* owner
* artifact\_type
* review\_purpose
* intended\_decision\_type
* applicable\_stakeholders
* applicable\_viewpoints
* scale\_definition
* status\_rules
* change\_log
* effective\_date

### 6.2 Mandatory criterion fields

Every criterion must define:

* criterion\_id
* name
* dimension
* question
* description
* metric\_type
* score\_scale
* weight
* gate\_type
* required\_evidence
* scoring\_guidance
* anti\_patterns
* dependencies
* applicability\_rule
* rationale

### 6.3 Mandatory evaluation output fields

Every evaluation result must capture:

* artifact\_id
* artifact\_type
* rubric\_id
* rubric\_version
* evaluated\_by
* evaluation\_mode (human, agent, hybrid)
* evaluation\_date
* criterion\_results
* dimension\_results
* gate\_failures
* overall\_status
* overall\_score
* confidence
* evidence\_gaps
* recommended\_actions
* decision\_summary

## 7. Scoring standard

### 7.1 Recommended scale

Use a **0–4 ordinal scale** plus N/A.

* **0 — Absent / contradicted**
  No meaningful evidence, or evidence directly contradicts the criterion
* **1 — Weak**
  Criterion is acknowledged or implied, but inadequate for decision support
* **2 — Partial**
  Criterion is explicitly addressed, but coverage is incomplete, inconsistent, or weakly evidenced
* **3 — Good**
  Criterion is clearly addressed with adequate evidence and only minor gaps
* **4 — Strong**
  Criterion is fully addressed, well evidenced, internally consistent, and decision-ready
* **N/A — Not applicable**
  Criterion genuinely does not apply in the stated scope and context

### 7.2 Why this scale

The 0–4 scale is strong enough to distinguish quality levels but simple enough for humans and agents to apply consistently. A 1–10 scale creates false precision and lowers calibration quality.

### 7.3 Gate types

Use explicit gate categories:

* none — contributes to score only
* advisory — weak performance triggers recommendations
* major — significant weakness may cap status
* critical — failure blocks pass status regardless of average

### 7.4 Status model

![Status determination decision tree](https://thomasrohde.github.io/EAROS/diagrams/status-determination.svg)

A recommended default decision model:

* **Pass**
  + no critical gate failures
  + overall weighted score >= 3.2
  + no dimension score < 2.0
* **Conditional pass**
  + no critical gate failures
  + overall weighted score between 2.4 and 3.19
  + weaknesses are containable with named actions and owners
* **Rework required**
  + overall weighted score < 2.4
  + or repeated weak dimensions
  + or insufficient evidence for decision support
* **Not reviewable / reject**
  + critical gate failure
  + artifact does not match the declared type
  + artifact purpose is unclear
  + evidence is too incomplete to score responsibly

### 7.5 Confidence standard

Confidence must be recorded separately from score.

Use:

* low
* medium
* high

Confidence is driven by:

* completeness of evidence
* clarity of scope
* ambiguity of criterion
* consistency across sections/views
* reviewer certainty

Do **not** multiply score by confidence. A low-confidence evaluation and a poor artifact are different problems.


### 7.6 Scale design tradeoff: 0–3 versus 0–4

Empirical research on LLM-based evaluation suggests that smaller scales (0–3) produce higher inter-rater reliability between AI agents and human reviewers. The 0–3 scale reduces the ambiguous middle zone that plagues wider scales.

However, the 0–4 scale was chosen deliberately to distinguish between "good" (adequate with minor gaps) and "strong" (fully addressed and decision-ready). This distinction matters in architecture governance because the gap between "adequate" and "excellent" is precisely where reviewer judgment adds most value.

**Recommended approach:** Retain the 0–4 scale for human and hybrid evaluation modes. For fully agentic evaluation, organisations may optionally collapse to a 0–3 scale by merging levels 3 and 4, provided the rubric profiles define the mapping explicitly. Any scale collapse must be recorded in the evaluation metadata.

### 7.7 Inter-rater reliability targets

Based on empirical evidence from the RULERS framework, Microsoft's LLM-Rubric, and Snorkel AI's calibration methodology, the following inter-rater reliability targets apply:

* **Binary criteria** (present/absent): target agreement > 95% between agent and human reviewer
* **Ordinal criteria** (0–4 scale): target weighted Cohen’s kappa > 0.70 (substantial agreement) for well-defined criteria; > 0.50 (moderate agreement) for subjective criteria
* **Overall assessment**: target Spearman’s rho > 0.80 correlation with expert human reviewers
* **Adjacent-score tolerance**: for ordinal criteria, disagreements of exactly one level are treated as soft disagreements in calibration metrics

These targets should be validated through calibration exercises during profile development and monitored in production.


## 8. Core meta-rubric dimensions

The core meta-rubric should apply across all architecture artifact types.

### 8.1 Stakeholder and purpose fit

Is the artifact explicit about who it serves, what decision it supports, and why it exists?

### 8.2 Scope and boundary clarity

Does it define scope, exclusions, assumptions, constraints, and boundaries clearly enough to avoid misreading?

### 8.3 Concern coverage and viewpoint appropriateness

Does the artifact address the relevant concerns using views or structures that fit the problem?

### 8.4 Traceability

Can the artifact be traced to business drivers, requirements, principles, policies, and key decisions?

### 8.5 Internal consistency and integrity

Are the claims, models, views, and narratives internally coherent, or do they conflict?

### 8.6 Risk, assumptions, constraints, and tradeoffs

Does it identify meaningful risks, assumptions, constraints, and architectural tradeoffs?

### 8.7 Standards and policy compliance

Does it demonstrate alignment with mandatory standards, controls, and governance expectations?

### 8.8 Actionability and implementation relevance

Can downstream teams act on it? Does it inform design, sequencing, funding, governance, or delivery choices?

### 8.9 Maintainability of the artifact

Is ownership clear? Is the artifact versioned, current enough, and structured so it can be kept useful over time?

## 9. Metric types

Criteria may use different measurement patterns, but they must be declared explicitly.

### 9.1 Ordinal

Used when maturity or adequacy is judged on a defined rubric scale.
Example: “How complete is traceability to business capabilities?”

### 9.2 Binary

Used for hard checks.
Example: “Is the artifact owner named?”

### 9.3 Enumerated categorical

Used when one of a small set of states is appropriate.
Example: none, partial, full, not-applicable

### 9.4 Quantified ratio or count

Used sparingly.
Example: “Percentage of diagrams with legend and scope annotation”

### 9.5 Derived metric

Computed from multiple criterion results.
Example: concern coverage index, evidence sufficiency index, reviewability score

Quantified metrics can be useful, but architecture evaluation is usually strongest when the quantitative element supports rather than replaces reasoned judgment.

## 10. Evidence standard

### 10.1 Evidence anchors

Each criterion must specify what counts as acceptable evidence.

Typical evidence anchors:

* section references
* page numbers
* diagram identifiers
* ADR identifiers
* traceability table rows
* standards mappings
* risk records
* roadmap milestones
* linked source documents

### 10.2 Evidence sufficiency

Record one of:

* sufficient
* partial
* insufficient
* none

### 10.3 Evidence classes

Record each finding as:

* observed
* inferred
* external

### 10.4 Missing evidence is a first-class result

Evaluators must not silently fill gaps. Missing evidence must be visible in the record.

## 11. Documentation standard

Every rubric package must contain five documentation assets.

### 11.1 Rubric specification

The normative definition of dimensions, criteria, scale, gates, weights, applicability, and outputs.

### 11.2 Scoring guidance

A reviewer guide with:

* interpretation notes
* examples
* counterexamples
* anti-patterns
* boundary cases
* tie-break guidance

### 11.3 Calibration pack

A set of sample artifacts with benchmark evaluations and rationale.

### 11.4 Evaluation record template

The format for storing applied scores, evidence, rationale, gaps, and actions.

### 11.5 Decision log template

The format for recording disposition, review outcome, waivers, owners, due dates, and exceptions.

## 12. Agentic operating pattern

### 12.1 Recommended evaluation pattern

Use a **two-pass or three-pass model**.

#### Pass 1 — Extractor

An agent extracts evidence from the artifact, identifies sections, diagrams, traceability elements, and candidate evidence for each criterion.

#### Pass 2 — Evaluator

A second agent applies the rubric and produces criterion scores, rationale, confidence, and gaps.

#### Pass 3 — Challenger

A third agent challenges the evaluation by looking for:

* unsupported claims
* contradictory evidence
* rubric misuse
* over-scoring
* unacknowledged ambiguity
* missing gating issues

This pattern is safer than single-agent scoring because architecture review is vulnerable to confident but weak inference.

### 12.2 Human review threshold

Require human review when:

* any critical gate fails
* confidence is low on a major criterion
* overall status changes because of inference rather than direct evidence
* the challenger disagrees materially with the evaluator
* the artifact is high impact or high risk

### 12.3 Agent output standard

Agent-generated outputs must contain:

* criterion-by-criterion result
* evidence references
* rationale
* confidence
* explicit gaps
* recommended actions
* model/version metadata if required by internal policy


### 12.4 DAG-based evaluation flow

For complex artifacts, structure the agentic evaluation as a Directed Acyclic Graph (DAG) rather than a linear three-pass model. Each node in the DAG is a specialised evaluation step that produces typed outputs consumed by downstream nodes.

Recommended DAG structure:

1. **Structural validation** (binary checks): metadata completeness, section presence, schema conformance, naming conventions
2. **Content extraction**: extract evidence for each criterion from identified sections
3. **Criterion scoring** (parallel): each criterion scored independently with evidence anchoring
4. **Cross-reference validation**: check consistency between criterion scores and between artifact sections
5. **Dimension aggregation**: compute dimension-level scores from criterion results
6. **Challenge pass**: identify unsupported claims, contradictions, over-scoring, and unacknowledged ambiguity
7. **Calibration**: apply post-hoc calibration using the RULERS Wasserstein-based method or LLM-Rubric aggregation network
8. **Status determination**: apply gate logic and threshold rules to determine overall status

This DAG structure is safer than a monolithic three-pass model because each node has a narrow, well-defined scope. It also enables partial re-evaluation when an artifact is updated.

### 12.5 Evidence-anchoring protocol

Following the RULERS framework, every agent-generated score must include:

* **Citation**: a specific reference to the artifact (section, page, paragraph, diagram ID, table row)
* **Quotation**: the relevant text or description from the artifact that supports the score
* **Evidence class**: observed, inferred, or external
* **Sufficiency**: whether the evidence is sufficient, partial, or insufficient for the criterion
* **Confidence**: low, medium, or high, with explicit reasons for anything below high

Scores without evidence anchors must be flagged as unverified and excluded from automated status determination.

### 12.6 Rubric locking for agent evaluation

Rubrics used in agentic evaluation must be compiled into immutable, versioned specifications before use. This prevents interpretation drift across evaluation runs. Changes to rubric wording, examples, or scoring guidance require a new rubric version and recalibration.

The locked rubric specification should include the full criterion text, all level descriptors, all examples and anti-patterns, all gate rules, and the aggregation function. It must be stored in a machine-readable format (YAML or JSON) conforming to the rubric schema.


## 13. Calibration and quality control

### 13.1 Why calibration matters

Without calibration, the same rubric will drift across teams, reviewers, and agents.

### 13.2 Calibration method

For a new rubric or profile:

1. select 10–20 representative artifacts
2. score them independently with at least two reviewers or two review modes
3. compare results
4. identify ambiguous criteria and rewrite scoring guidance
5. repeat until agreement is stable enough for operational use

### 13.3 Agreement metrics

For ordinal scoring, weighted kappa is a useful agreement measure because it accounts for ordered disagreements rather than treating all disagreements equally. [R6]

### 13.4 What to calibrate

Calibrate:

* score distributions
* gate consistency
* treatment of N/A
* confidence usage
* evidence sufficiency judgments
* action recommendations

### 13.5 Recalibration triggers

Recalibrate when:

* a profile changes materially
* a new overlay is introduced
* agreement drops
* new artifact formats appear
* agent behavior changes materially
* governance expectations change

## 14. Profile model

Profiles are the main extension mechanism for different artifact types.

### 14.1 What a profile is

A profile is a rubric extension for a specific artifact class. It inherits the core meta-rubric and adds, removes, constrains, or specializes criteria.

### 14.2 What a profile is not

A profile is not:

* a totally independent scoring system
* a one-off project checklist
* a domain overlay masquerading as an artifact type
* a replacement for the core rubric

### 14.3 Profile composition rules

A valid profile must:

* inherit the core scale and status model unless there is an approved exception
* map every added criterion to a dimension
* define applicability rules
* define evidence anchors
* define gate types explicitly
* explain any profile-specific weights
* include examples and anti-patterns
* include at least one calibration artifact before approval

## 15. Methods for adding profiles

This is the part most teams get wrong. They add profiles by brainstorming criteria. That produces bloated and unstable rubrics. Profiles should be added through a controlled method.

### Method A — Decision-centered profile design

Use this when the artifact exists to support a specific decision type.

**Best for:** ADRs, investment review artifacts, target-state decisions, exception requests

Steps:

1. Identify the decision the artifact is supposed to support
2. Identify the minimum questions decision-makers must answer
3. Map those questions to the core dimensions
4. Add only the profile criteria needed to make the decision responsibly
5. Declare gates for mandatory questions
6. Write examples of good and weak evidence
7. Pilot on 3–5 real artifacts

**Description:**
This method keeps profiles lean and tightly linked to real governance choices. It is the best default method for architecture boards.

### Method B — Viewpoint-centered profile design

Use this when the artifact is primarily a structured architecture description for a viewpoint or stakeholder group.

**Best for:** capability maps, business architecture views, platform reference architectures, integration landscape maps

Steps:

1. Identify stakeholders and concerns
2. Identify the viewpoint or modeling style used
3. Define what good coverage looks like for that viewpoint
4. Add profile criteria for completeness, modeling integrity, scope, and traceability
5. Add profile anti-patterns typical of that view
6. Validate against existing examples

**Description:**
This method is closest to the architecture-description logic behind ISO/IEC/IEEE 42010. It is useful when the question is less “Is this decision right?” and more “Is this architecture view fit for purpose?” [R1]

### Method C — Lifecycle-centered profile design

Use this when the artifact sits at a particular stage of the architecture or delivery lifecycle.

**Best for:** current-state assessments, transition-state designs, roadmap artifacts, operational handover architecture

Steps:

1. Place the artifact in the lifecycle
2. Identify what downstream users need next
3. Define criteria for readiness, sequencing, dependencies, and handoff quality
4. Add stage-specific gates
5. Add evidence rules that prove the artifact is actionable

**Description:**
This method prevents profiles from becoming abstract. It forces the profile to answer: what happens next if this artifact is accepted?

### Method D — Risk-centered profile design

Use this when the artifact is only worth reviewing because it manages a class of risk.

**Best for:** security architecture, regulatory impact architecture, resilience architecture, critical data architecture

Steps:

1. Identify the risk classes and failure modes
2. Identify mandatory controls and review obligations
3. Create hard gates for non-negotiables
4. Add criteria for residual risk visibility, ownership, and tradeoffs
5. Attach the resulting requirements as a profile or, more often, as an overlay

**Description:**
This method is often better implemented as an overlay rather than a pure artifact profile, because the same risk lens may need to apply to multiple artifact types.

### Method E — Pattern-library profile design

Use this when many similar artifacts recur and you want a reusable quality pattern.

**Best for:** recurring reference architectures, recurring integration patterns, recurring platform service definitions

Steps:

1. identify the recurring artifact family
2. extract the recurring success criteria
3. turn them into profile criteria with examples
4. separate mandatory pattern integrity from optional optimization
5. publish and calibrate as a reusable profile pack

**Description:**
This is the best method when you want architecture governance to scale.

## 16. Profile creation workflow

Use this workflow whenever a new profile is proposed.

### Step 1 — Create a profile proposal

The proposal must include:

* candidate profile name
* artifact type
* intended decisions supported
* stakeholders
* why the core rubric alone is insufficient
* candidate dimensions affected
* proposed criteria list
* estimated review frequency
* expected users

### Step 2 — Classify the profile type

Classify whether the proposal is:

* an artifact profile
* a context overlay
* a project-specific checklist
* a one-off temporary review aid

Only the first two should normally become governed assets.

### Step 3 — Choose the profile design method

Use one of Methods A–E above and record the chosen method explicitly.

### Step 4 — Draft the profile

Draft:

* profile scope
* inherited dimensions
* added/specialized criteria
* gating rules
* evidence anchors
* anti-patterns
* examples
* weight rationale

### Step 5 — Build the calibration pack

Select representative artifacts, including:

* at least one strong example
* at least one weak example
* at least one ambiguous example
* at least one incomplete example

### Step 6 — Run a calibration round

Use at least:

* one experienced human reviewer
* one secondary reviewer or agentic reviewer

### Step 7 — Revise

Tighten criteria that produce inconsistent judgments.

### Step 8 — Approve and publish

Approval should include:

* owner assignment
* version number
* effective date
* next review date

### Step 9 — Monitor in production

Track:

* usage frequency
* common failure criteria
* calibration drift
* waiver frequency
* reviewer feedback
* agent disagreement rate

## 17. Profile design rules

A profile should normally add **no more than 5–12 specific criteria** beyond the core meta-rubric. If a team wants to add 20 more criteria, it usually means the profile is mixing concerns that should be overlays or guidance notes instead.

### 17.1 Good profile behavior

A good profile:

* sharpens evaluation for a real artifact class
* improves decision quality
* reduces reviewer ambiguity
* adds explicit evidence requirements
* remains teachable and calibratable

### 17.2 Bad profile behavior

A bad profile:

* duplicates the entire core rubric
* adds vague criteria like “high quality”
* mixes artifact type and domain policy without distinction
* creates project-specific trivia as enterprise standard
* has no examples
* cannot be applied consistently

## 18. Overlays versus profiles

This distinction matters a lot.

### Use a profile when:

* the artifact type itself has unique quality expectations

### Use an overlay when:

* a cross-cutting concern must apply to many artifact types

Examples:

* **ADR** -> profile
* **Capability Map** -> profile
* **Security** -> overlay
* **Regulatory** -> overlay
* **Data retention** -> overlay
* **Cloud landing zone policy** -> overlay

A common failure mode is encoding security or regulatory expectations directly inside every profile. That creates duplication and drift. Keep cross-cutting requirements as overlays unless there is a compelling reason not to.

## 19. Starter profile examples

### 19.1 Capability Map Profile

Likely extra criteria:

* decomposition quality
* non-overlap / non-duplication
* stable capability naming
* ownership clarity
* business outcome linkage
* level consistency
* strategic relevance

Typical anti-patterns:

* organization chart masquerading as capability map
* mixed abstraction levels
* solution names in place of capabilities
* duplicated capabilities

### 19.2 Solution Architecture Profile

Likely extra criteria:

* problem statement clarity
* option analysis
* quality attribute treatment
* integration and dependency treatment
* operational model coverage
* deployment and runtime assumptions
* non-functional requirement traceability

Typical anti-patterns:

* only one option shown
* deployment view missing
* target design contradicts constraints
* security delegated to “later”

### 19.3 ADR Profile

Likely extra criteria:

* decision statement clarity
* options considered
* consequences
* tradeoff visibility
* reversibility
* trigger conditions for revisit
* traceability to broader architecture

Typical anti-patterns:

* decision already implemented before record exists
* only chosen option documented
* no consequences listed
* no context for future readers

### 19.4 Roadmap Profile

Likely extra criteria:

* dependency realism
* sequencing logic
* transition-state clarity
* owner and funding linkage
* risk and contingency treatment
* measurable milestones

Typical anti-patterns:

* date list without dependencies
* no transition architecture
* no ownership
* roadmap not connected to target state

## 20. Governance model

### 20.1 Roles

#### Rubric owner

Owns content, lifecycle, versioning, and quality of a rubric or profile.

#### Review authority

Approves major rubric changes and profile publication.

#### Evaluator

Applies the rubric.

#### Challenger

Reviews evaluation quality and disputes weak reasoning.

#### Calibration lead

Owns benchmark examples and agreement monitoring.

#### Agent steward

Owns prompts, agent workflows, schemas, and automation controls.

### 20.2 Change classes

* **Patch change** — wording clarification, typo, example addition
* **Minor change** — added criterion guidance, anti-pattern updates, non-breaking applicability updates
* **Major change** — new criterion, changed scale, changed gates, changed weights, changed status rules

Major changes require recalibration.

## 21. Metrics for rubric performance

Do not only measure artifact scores. Measure rubric performance itself.

Recommended operational metrics:

* rubric usage count
* profile usage count
* pass / conditional / rework / reject distribution
* critical gate failure frequency
* average evidence sufficiency
* reviewer agreement rate
* agent-human agreement rate
* waiver rate
* time to evaluate
* action closure rate
* defect escape correlation if available
* profile drift incidents
* stale rubric count

These metrics help determine whether the rubric system is actually improving architecture governance.

## 22. Recommended repository structure

architecture-rubrics/
 standard/
 EAROS.md
 rubric.schema.json
 evaluation.schema.json
 profile.schema.json
 overlay.schema.json
 core/
 core-meta-rubric.yaml
 scoring-guidance.md
 profiles/
 capability-map.yaml
 solution-architecture.yaml
 adr.yaml
 roadmap.yaml
 overlays/
 security.yaml
 regulatory.yaml
 data-governance.yaml
 cloud.yaml
 calibration/
 capability-map/
 solution-architecture/
 adr/
 evaluations/
 2026/
 ART-001/
 artifact/
 result.json
 report.md
 decision.md

## 23. Machine-readable templates

### 23.1 Rubric template

rubric\_id: EAROS-SOL-001
title: Solution Architecture Profile
version: 1.0.0
status: approved
owner: enterprise-architecture
artifact\_type: solution\_architecture
review\_purpose: decision\_review
intended\_decision\_type:

 - architecture\_board\_review
 - funding\_gate
applicable\_stakeholders:

 - architecture\_board
 - engineering
 - security
 - operations
scale\_definition:
 type: ordinal\_0\_4\_plus\_na
status\_rules:
 pass:
 min\_weighted\_score: 3.2
 no\_critical\_gate\_failures: true
dimensions:

 - id: stakeholder\_fit
 name: Stakeholder and purpose fit
 criteria:

 - criterion\_id: STK-01
 name: Stakeholders, concerns, viewpoints
 question: Does the artifact explicitly identify stakeholders, concerns, and viewpoints?
 description: Checks whether the artifact is anchored in named stakeholders and their concerns.
 metric\_type: ordinal
 score\_scale: [0,1,2,3,4,"N/A"]
 weight: 1.0
 gate\_type: major
 required\_evidence:

 - stakeholder\_list
 - concern\_list
 - viewpoint\_mapping
 scoring\_guidance:
 "0": absent or contradicted
 "1": implied only
 "2": explicit but incomplete
 "3": explicit and mostly complete
 "4": explicit, complete, and consistently used
 anti\_patterns:

 - generic audience only
 - no concern-to-view mapping
 dependencies: []
 applicability\_rule: always
 rationale: Architecture review should be concern-driven.

### 23.2 Evaluation template

artifact\_id: ART-2026-0042
artifact\_type: solution\_architecture
rubric\_id: EAROS-SOL-001
rubric\_version: 1.0.0
evaluated\_by:

 - role: evaluator
 actor: agent
 - role: challenger
 actor: human
evaluation\_mode: hybrid
evaluation\_date: 2026-03-16
criterion\_results:

 - criterion\_id: STK-01
 score: 2
 confidence: medium
 evidence\_sufficiency: partial
 evidence\_refs:

 - section: Audience
 - page: 3
 evidence\_class: observed
 rationale: Stakeholders are listed but concerns are not systematically mapped to views.
 evidence\_gaps:

 - No explicit viewpoint model
 recommended\_actions:

 - Add stakeholder-concern-view matrix
dimension\_results:

 - dimension\_id: stakeholder\_fit
 weighted\_score: 2.0
gate\_failures: []
overall\_status: conditional\_pass
overall\_score: 2.8
confidence: medium
recommended\_actions:

 - Add viewpoint mapping
 - Clarify decision scope
decision\_summary: Usable with rework before final board review.

## 24. Suggested minimum documentation for every new profile

Before a new profile is considered operational, it should have:

1. the profile YAML/JSON definition
2. a profile guide in prose
3. at least 3 worked examples
4. at least 1 anti-example
5. a calibration record
6. an owner
7. a next review date

If one of those is missing, the profile is not yet mature enough for enterprise use.

## 25. Recommended initial rollout

Do not start with ten profiles. Start with a controlled seed set.

Recommended first set:

* Core Meta-Rubric
* Capability Map Profile
* Solution Architecture Profile
* ADR Profile
* Security Overlay
* Regulatory Overlay

Run these on real artifacts for 6–8 weeks, then tune before wider rollout.

## 26. Anti-patterns to avoid

* one mega-rubric for every artifact
* criteria with no evidence anchors
* too many weighted criteria
* hidden gates inside averages
* policy and artifact-type concerns mixed without structure
* no distinction between missing evidence and low quality
* no calibration
* profile sprawl
* agent-only scoring with no challenger
* no versioning of rubrics
* reviewing artifacts without declaring purpose and decision context

## 27. Practical review workflow

A practical enterprise workflow can be:

1. select artifact type
2. resolve applicable profile
3. resolve applicable overlays
4. assemble composed rubric
5. extract evidence
6. apply scoring
7. challenge scoring
8. finalize status and actions
9. store machine-readable evaluation
10. store human-readable report
11. capture decision and waivers
12. feed results back into calibration

## 28. Decision rules for choosing whether to add a new profile

Before approving a new profile, ask:

* Does this artifact type recur enough to justify standardization?
* Is the core meta-rubric insufficient by itself?
* Are the proposed additions stable across teams and time?
* Would an overlay solve the problem better?
* Can the profile be calibrated with real examples?
* Does the profile improve decision quality enough to justify the governance overhead?

If the answer to several of these is “no”, do not add the profile.

## 29. Summary standard statement

The enterprise standard should be:

All architecture rubrics shall be managed as governed, versioned, evidence-based evaluation assets composed from a common core meta-rubric, artifact-specific profiles, and context overlays. All scoring shall be explainable, evidence-linked, calibrated, and suitable for both human and agent-assisted application.

## 33. Recommended next deliverables

To operationalize this standard, create these next:

1. core-meta-rubric.yaml
2. solution-architecture.yaml
3. adr.yaml
4. capability-map.yaml
5. security.yaml
6. evaluation.schema.json
7. calibration-pack.md
8. review-report-template.md

## 31. Artifact format requirements for AI assessability

This section defines requirements for architecture artifact structure and format that enable reliable automated assessment.

### 31.1 Machine-readable metadata

Every architecture artifact should include a structured metadata block. The recommended format is YAML frontmatter at the beginning of the document:

* document\_type: the artifact type (e.g., solution\_architecture, capability\_map, adr)
* version: semantic version of the artifact
* status: draft, review, approved, deprecated
* author: responsible person
* last\_modified: ISO 8601 date
* classification: information classification level
* domain: business or technical domain
* systems: list of systems in scope
* standards\_compliance: list of applicable standards
* quality\_attributes: key quality targets with measurable values
* related\_artifacts: typed references to connected artifacts
* assessment\_rubric: rubric identifier to apply

### 31.2 Structured templates

Architecture documents should follow a consistent template structure to enable section-level extraction by AI agents. Recommended approaches include:

* **arc42** for software and solution architecture (12 standardised sections)
* **MADR** (Markdown Architectural Decision Records) for decisions
* **Decision Reasoning Format (DRF)** for machine-readable decision records in YAML/JSON

Custom templates are acceptable provided they include mandatory section markers and a documented section catalog.

### 31.3 Diagram formats

Architecture diagrams should be stored in machine-readable formats wherever possible:

* ArchiMate Model Exchange File Format (XML/XSD) for enterprise architecture models
* Structurizr DSL or PlantUML for C4 model diagrams
* Mermaid or D2 for lightweight diagram-as-code
* Dual representation: machine-readable model as authoritative source, rendered diagram as visual aid

Image-only diagrams should be accompanied by a structured element catalog listing components, relationships, and technology annotations.

### 31.4 Section markers and tagging

Use semantic section markers to enable precise extraction by AI agents:

* Consistent heading hierarchy matching the template specification
* Structured tables for traceability matrices and quality attribute scenarios
* Explicit assumption, constraint, and risk markers
* Embedded quality attribute scenarios in parseable format

### 31.5 ArchiMate exchange format

For organisations using ArchiMate, the Open Group Model Exchange File Format provides a validated standard for machine-readable architecture models. The format supports three schema types (model exchange, view exchange, diagram exchange) and includes Dublin Core metadata. This format has been mandatory for certified ArchiMate tools since June 2018 and is directly amenable to automated validation and assessment.

## 32. Rubric design principles for AI agent application

This section codifies empirically grounded principles for designing rubrics that AI agents can reliably apply.

### 32.1 Decompose into atomic criteria

Break holistic quality assessments into the smallest possible independent dimensions. Each criterion should evaluate exactly one aspect. Research shows LLM alignment with human judges improved from 37.3% to 93.95% when rubrics were provided, with further improvements from atomic decomposition.

### 32.2 Use analytic rather than holistic rubrics

Analytic rubrics (separate scores per dimension) consistently outperform holistic rubrics (single overall score) for AI-based evaluation. This is consistent with the EAROS core principle of separating observation from inference.

### 32.3 Define precise level descriptors

Every point on every scale needs a written definition with concrete description of what that level looks like for the specific criterion. Without this, LLMs exhibit significant scoring drift across evaluation runs.

### 32.4 Include positive and negative examples

Anchor criteria with exemplars of good and poor performance. Few-shot examples reduce ambiguity and improve consistency, particularly for subjective criteria. The EAROS anti-pattern fields in criterion definitions serve this purpose and should be populated for all criteria.

### 32.5 Use decision trees for disambiguation

Structure ambiguous criteria as if/then decision trees rather than open-ended questions. This reduces the interpretive load on the agent and produces more consistent scoring.

### 32.6 Separate assessment from aggregation

Score each dimension independently using dedicated prompts, then combine scores using a defined aggregation function. The multi-criteria decomposition approach produces more reliable and explainable results than end-to-end holistic scoring.

### 32.7 Design for calibration

Every rubric should be designed with calibration in mind from the start. This means including boundary-case examples, documenting expected score distributions, and defining the inter-rater reliability targets that the rubric must meet before operational deployment.


## 34. Glossary

This glossary defines terms used throughout the EAROS standard. It is organized into three categories: statistical and calibration terms, EAROS-specific concepts, and architecture terms as used in this standard.

---

### 34.1 Statistical and Calibration Terms

**Calibration**
The process of adjusting rubric criteria, level descriptors, and scoring guidance until different raters (human or AI) produce consistent results on the same artifacts. Calibration is considered complete when inter-rater reliability reaches the target threshold (κ > 0.70 for well-defined criteria). Calibration is a governance requirement in EAROS — no rubric may be used in a live review process without prior calibration.

**Cohen's kappa (κ)**
A statistical measure of inter-rater reliability that corrects for chance agreement. Ranges from 0 (agreement no better than chance) to 1 (perfect agreement). Negative values indicate systematic disagreement. EAROS targets: κ > 0.70 for well-defined criteria, κ > 0.50 for criteria requiring subjective judgment. Named after Jacob Cohen (1960). See also: *weighted kappa*.

**Intraclass Correlation Coefficient (ICC)**
A reliability measure for ordinal or continuous ratings when more than two raters assess the same artifact. Unlike Cohen's kappa (pairwise), ICC captures consistency across the full rater panel. Preferred when a calibration exercise involves three or more reviewers.

**Inter-rater reliability**
The degree to which different raters — human reviewers or AI agents — produce consistent scores when independently evaluating the same artifact against the same rubric criteria. High inter-rater reliability indicates the rubric is unambiguous and the scoring guidance is effective. Measured using Cohen's κ, weighted κ, or ICC depending on the evaluation context.

**Spearman's rho (ρ)**
A rank correlation coefficient measuring how well two sets of rankings agree. Unlike Pearson correlation, it makes no assumption about linear relationships between scores and is robust to outliers. EAROS target: ρ > 0.80 for overall assessment correlation between human and agent evaluators.

**Wasserstein distance**
A metric that measures the difference between two probability distributions — specifically, the minimum "work" needed to transform one distribution into the other (also called the Earth Mover's Distance). Used in the RULERS calibration step to align AI agent score distributions with human reviewer distributions, correcting for systematic over- or under-scoring biases across the 0–4 scale.

**Weighted kappa**
A variant of Cohen's kappa that treats disagreements between adjacent score levels (e.g., 2 vs. 3) as less severe than disagreements between distant levels (e.g., 1 vs. 4). More appropriate than unweighted kappa for ordinal scales where partial agreement is meaningful. Quadratic-weighted kappa (QWK) penalizes larger disagreements proportionally to the square of the distance. EAROS uses weighted kappa as its primary inter-rater reliability metric.

---

### 34.2 EAROS-Specific Terms

**Challenge pass**
Step 6 of the DAG evaluation flow. A deliberate self-review in which the evaluator (human or agent) challenges their own highest and lowest scores, checking for weak evidence, over-scoring relative to the level descriptors, under-cited evidence, or evidence class errors. The challenge pass must be recorded in the evaluation record. It is not optional — skipping it invalidates the evaluation.

**Core meta-rubric**
The universal foundation rubric (`core/core-meta-rubric.yaml`, rubric ID `EAROS-CORE-002`) that defines nine dimensions and ten criteria applying to every architecture artifact regardless of type. All profiles inherit from it. It establishes the scoring model, gate model, and output requirements that govern all EAROS evaluations.

**DAG evaluation flow**
The eight-step Directed Acyclic Graph that structures agentic (and recommended human) evaluation: `structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`. The DAG is sequential and must not be reordered. Each step produces outputs consumed by the next.

**Decision tree**
An IF/THEN disambiguation logic block attached to each rubric criterion to help evaluators (especially AI agents) resolve ambiguous cases consistently. Decision trees reduce interpretive load by converting open-ended judgment into observable feature counts and branches. Example pattern: *"Count distinct views: IF < 2 THEN score 0-1. IF 2-3 views THEN score 2. IF 4+ views AND data flow narrative exists THEN score 3."*

**Evidence anchor**
A specific, traceable reference to content in the artifact that supports a score assignment — for example, a section heading, page number, paragraph ID, or diagram label (e.g., "Section 3.2, deployment diagram on p. 8"). Required by the RULERS protocol for every score. Evidence anchors enable human reviewers to verify, challenge, or override any agent judgment.

**Evidence class**
A mandatory classification of the type of evidence supporting a score:
- `observed` — directly stated or shown in the artifact (highest credibility)
- `inferred` — a reasonable interpretation not explicitly stated
- `external` — judgment based on a standard, policy, or source outside the artifact (lowest credibility, must be declared)

Evidence class must be recorded for every criterion score in an evaluation record.

**Gate**
A criterion-level control that can block a passing status regardless of the overall weighted average. Gates prevent weak scores on critical criteria from being diluted by strong scores elsewhere. Four gate types exist: `none` (no gate), `advisory` (recommendation triggered), `major` (status capped at `conditional_pass`), and `critical` (failure forces `reject` status). Gates are checked before averages are computed.

**Overlay**
A cross-cutting concern extension that appends additional criteria on top of any core+profile combination. Overlays use `scoring.method: append_to_base_rubric` and `artifact_type: any` — they are not tied to a specific artifact type and are applied based on context (e.g., apply the security overlay whenever the artifact touches authentication or personal data). Overlays are additive: they cannot weaken or remove gates from the base rubric.

**Profile**
An artifact-type-specific extension of the core meta-rubric. Profiles add 5–12 criteria for a particular artifact type (e.g., reference architecture adds 9 criteria across 6 dimensions). Every profile declares `inherits: [EAROS-CORE-002]` and is evaluated together with the core. The reference architecture profile (`EAROS-REFARCH-001`) is the reference implementation for how profiles should be constructed.

**RULERS protocol**
**R**ubric **U**nification, **L**ocking, and **E**vidence-anchored **R**obust **S**coring. A framework for preventing LLM scoring drift through three mechanisms: (1) locked rubrics compiled into immutable specifications before evaluation, (2) mandatory evidence citation (evidence anchor per criterion), and (3) Wasserstein-based calibration to align agent score distributions with human reviewer distributions. Defined in arXiv 2601.08654 (January 2026) [R8]. All EAROS agent evaluations implement the RULERS protocol.

**Rubric locking**
The practice of compiling rubrics into fixed, versioned specifications before evaluation begins and preventing any modification during an evaluation run (`rubric_locked: true` in agent metadata). Rubric locking prevents interpretation drift — the tendency for LLM judges to subtly reinterpret criteria across evaluation runs, undermining reproducibility. Changes to a locked rubric require a version bump and governance approval.

---

### 34.3 Architecture Terms (as used in EAROS)

**Architecture artifact**
Any document, model, diagram, or structured record that describes, decides, or governs aspects of an enterprise architecture. Examples: solution architecture document, Architecture Decision Record, capability map, reference architecture, technology roadmap. Each artifact type has a matching EAROS profile that extends the core rubric for that artifact's specific evidence requirements.

**Architecture Decision Record (ADR)**
A document that captures a single architectural decision along with its context, the options considered, the decision made, the rationale, the consequences, and triggers for revisiting the decision. ADRs are a first-class artifact type in EAROS with their own profile (`profiles/adr.yaml`).

**Concern**
A specific interest, requirement, or question that a stakeholder has about the architecture — for example, "Can the system handle 10× traffic growth?" or "How does data leave the trust boundary?" Concerns are the fundamental driver of architecture evaluation in EAROS (Principle 1: concern-driven, not document-driven). A rubric criterion is essentially a concern formalized into a scorable question.

**Fitness function**
An automated test, check, or metric that validates whether an architecture continues to meet a specific quality attribute target. Used in CI/CD pipelines for continuous architecture validation — for example, a latency test that fails if P99 response time exceeds 200ms. Fitness functions make quality attributes measurable and enforceable rather than aspirational.

**Golden path**
An opinionated, fully supported implementation path for a reference architecture pattern. A golden path reduces setup time, ensures teams follow proven patterns, and provides pre-built integrations for the most common use cases. The EAROS reference architecture profile (`EAROS-REFARCH-001`) includes a dedicated criterion for golden path provision.

**Quality attribute**
A measurable characteristic of a system or architecture that is distinct from its functional behaviour — for example, availability (target: 99.95%), latency (P99 < 200ms), or throughput (10,000 req/s). In EAROS, quality attributes must be quantified and scoped, not expressed as adjectives. "The system is highly available" does not constitute a quality attribute statement; "the system achieves 99.95% availability measured monthly" does.

**Quality attribute scenario**
A structured description of a quality requirement using a six-part format: source (who or what generates the stimulus), stimulus (the event), artifact (the system element affected), environment (operating conditions), response (system behaviour), and response measure (quantified target). Derived from the TOGAF and SEI ATAM frameworks. Quality attribute scenarios are the required format for quality attribute claims in EAROS-evaluated artifacts.

**Viewpoint**
A perspective from which an architecture is examined, defined by the concerns of a stakeholder group. Common viewpoints include: context (system boundary and external actors), functional (component decomposition), deployment (infrastructure and topology), data flow (information movement), and security (trust boundaries and controls). The EAROS reference architecture profile requires at least four viewpoints for a passing score.

---

## References

* **[R1] ISO/IEC/IEEE 42010 architecture description overview** — ISO Online Browsing Platform. Describes architecture description in terms of stakeholders, concerns, viewpoints, and model kinds.
  https://www.iso.org/obp/ui/en/
* **[R2] Architecture compliance review overview** — The Open Group, “IT Architecture Compliance.” Describes architecture compliance review as scrutiny against established architectural criteria, spirit, and business objectives.
  https://www.opengroup.org/architecture/togaf7-doc/arch/p4/comp/comp.htm
* **[R3] Architecture Tradeoff Analysis Method (ATAM)** — Carnegie Mellon SEI. Describes ATAM as a method for evaluating software architectures relative to quality attribute goals and exposing architectural risks and tradeoffs.
  https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/
* **[R4] NIST AI RMF Playbook** — NIST AI Resource Center. Describes iterative suggested actions aligned to the AI RMF functions Govern, Map, Measure, and Manage and publishes structured formats such as JSON and CSV.
  https://airc.nist.gov/airmf-resources/playbook/
* **[R5] ISO/IEC 25010:2023 product quality model** — ISO. Defines a product quality model whose characteristics and subcharacteristics provide a reference model for quality to be specified, measured, and evaluated.
  https://www.iso.org/standard/78176.html
* **[R6] Interrater reliability and kappa** — McHugh, *Biochemia Medica* / PMC. Useful background on kappa as an inter-rater reliability statistic; weighted variants are appropriate when disagreement magnitude matters.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3900052/
* **[R7] LLM-Rubric: A Multidimensional, Calibrated Approach to Automated Evaluation of Natural Language Texts** — Microsoft Research, ACL 2024. Demonstrates that decomposed, dimension-specific scoring with learned aggregation achieves 2x improvement over uncalibrated LLM judging.
  https://aclanthology.org/2024.acl-long.745/
* **[R8] RULERS: Locked Rubrics and Evidence-Anchored Scoring for Robust LLM Evaluation** — arXiv 2601.08654, January 2026. Addresses prompt instability, unverifiable reasoning, and distributional misalignment through rubric locking and Wasserstein calibration.
  https://arxiv.org/abs/2601.08654
* **[R9] The Science of Rubric Design** — Snorkel AI, 2025. Treats rubrics as models for goal alignment and inter-rater agreement, measured using Cohen’s kappa, QWK, and ICC.
  https://snorkel.ai/blog/the-science-of-rubric-design/
* **[R10] Confusion-Aware Rubric Optimization (CARO)** — arXiv, March 2026. Systematically identifies and resolves rubric ambiguity through targeted rule patches.
  https://arxiv.org/html/2603.00451
* **[R11] Accelerate AWS Well-Architected Reviews with Generative AI** — AWS Machine Learning Blog. Production-validated pattern for automated architecture assessment using Amazon Bedrock.
  https://aws.amazon.com/blogs/machine-learning/accelerate-aws-well-architected-reviews-with-generative-ai/
* **[R12] A Systematic Literature Review of EA Evaluation Methods** — ACM Computing Surveys, 2024. Analyses 109 articles, concluding that automation is the critical adoption factor.
  https://dl.acm.org/doi/full/10.1145/3706582
* **[R13] AutoRubric: A Unified Framework for Rubric-Based LLM Evaluation** — arXiv, 2026.
  https://arxiv.org/html/2603.00077v1
* **[R14] ArchiMate Model Exchange File Format** — The Open Group. XML-based standard with validating XSD schemas for architecture model exchange.
  https://www.opengroup.org/open-group-archimate-model-exchange-file-format
* **[R15] Demystifying Evals for AI Agents** — Anthropic Engineering Blog. Practical guidance on evaluation methodology for AI agent systems.
  https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
* **[R16] AI for Software Architecture: Literature Review and Road Ahead** — arXiv, April 2025. Confirms that AI-assisted architecture evaluation remains largely manual with promising emerging capabilities.
  https://arxiv.org/html/2504.04334v1

