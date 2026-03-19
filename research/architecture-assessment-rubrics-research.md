# Rubrics for AI-Agent Assessment of IT/Enterprise Architecture Artifacts

## Comprehensive Research Report

**Date:** March 2026
**Scope:** Existing assessment frameworks, AI-agent-based evaluation, artifact format requirements, and rubric design principles for automated architecture quality assessment.

---

## Table of Contents

1. [Existing Rubrics and Frameworks](#1-existing-rubrics-and-frameworks)
2. [AI-Agent-Based Assessment of Architecture Quality](#2-ai-agent-based-assessment-of-architecture-quality)
3. [Artifact Structure and Format Requirements for AI Assessability](#3-artifact-structure-and-format-requirements-for-ai-assessability)
4. [Rubric Design Principles for AI Grading](#4-rubric-design-principles-for-ai-grading)
5. [Synthesis: A Proposed Approach](#5-synthesis-a-proposed-approach)
6. [Sources](#6-sources)

---

## 1. Existing Rubrics and Frameworks

### 1.1 TOGAF Architecture Compliance Review

TOGAF provides the most established framework for architecture artifact assessment. The Architecture Compliance Review process (Phase G of the ADM) includes structured checklists organized by discipline:

**Checklist domains:**
- System Engineering / Overall Architecture
- Hardware and Operating System
- Software Services and Middleware
- Applications
- Information Management
- Security
- System Management

Each checklist contains questions that reviewers selectively apply to a given project. TOGAF does not prescribe a numerical scoring system per se; instead, compliance is assessed qualitatively against principles, standards, and guidelines. The review process yields findings classified by severity and type of non-compliance.

**Quality Attribute Scenarios:** TOGAF recommends defining quality attributes using a six-part scenario: source, stimulus, artifact, environment, response, and response measure. This structured decomposition is particularly useful for AI-based assessment because it creates discrete, evaluable units.

**Architecture Maturity Models:** The Architecture Capability Maturity Model (ACMM), developed by the US Department of Commerce, scores nine architecture elements on a maturity scale (typically 1-5): Architecture Process, Business Linkage, Senior Management Involvement, Operating Unit Participation, Architecture Communication, IT Security, Architecture Governance, IT Investment and Acquisition Strategy, and Architecture Scope.

### 1.2 OMB Enterprise Architecture Assessment Framework (EAAF)

The US Office of Management and Budget's EAAF v3.1 is one of the few frameworks that provides explicit scoring criteria. It evaluates EA across three capability areas:

- **Completion** — Are the architectural artifacts complete and up to date?
- **Use** — Is the architecture actually being used to drive decisions?
- **Results** — Is the architecture producing measurable outcomes?

Each capability area uses criteria spanning five maturity levels (1-5). This framework is notable for its emphasis on measurable outcomes rather than just document completeness, making it a useful reference for designing AI-assessable rubrics.

### 1.3 Zachman Framework Assessment

The Zachman Framework uses its 6x6 matrix (interrogatives x perspectives) as an implicit assessment structure. Quality criteria include:

- **Completeness** — Are all relevant cells of the matrix populated? Unpopulated cells represent implicit (undefined) assumptions that increase risk.
- **Explicitness** — Are artifacts in each cell clearly and formally defined?
- **Consistency** — Do artifacts across cells align with each other?
- **Naming conventions and versioning** — Are governance standards established?

The framework supports gap analysis by identifying missing artifacts or misalignments within the architecture. Quality assessment evaluates the completeness and currency of existing representations, identifying missing perspectives and incomplete coverage.

### 1.4 Cloud Well-Architected Frameworks

AWS, Azure, and GitHub have published well-architected frameworks that represent the most operationalized architecture assessment rubrics available today.

**AWS Well-Architected Framework** evaluates across six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability. The AWS Well-Architected Tool provides automated assessment through structured questionnaires. Notably, AWS has built a generative AI solution using Amazon Bedrock that automatically analyzes architecture documents against the framework's pillars, producing solution summaries, pillar-by-pillar evaluations, best-practice adherence analysis, improvement recommendations, and risk assessments.

**Azure Well-Architected Framework** uses five pillars: Reliability, Cost Optimization, Operational Excellence, Performance Efficiency, and Security. The Azure Well-Architected Review Tool poses approximately 60 questions and generates a score per pillar and an overall workload score. Azure Advisor Score provides automated scoring based on resource configuration and usage telemetry.

**GitHub Well-Architected** covers Architecture (scalability, resiliency, modularity), Application Security, and Productivity with structured checklists. Assessment criteria include repository organization, modularity and code design, API management, disaster recovery and resilience, and documentation quality.

These cloud frameworks are significant because they demonstrate that architecture assessment can be decomposed into pillar-based scoring with automated tooling — a pattern directly applicable to AI-agent assessment.

### 1.5 C4 Model Review Checklist

The C4 model provides a concrete review checklist for architecture diagrams with three assessment dimensions:

- **General criteria:** Title, diagram type identification, scope definition, key/legend
- **Elements:** Naming, abstraction level clarity, functional descriptions, technology specifications, acronym handling, visual conventions
- **Relationships:** Labeling, directional accuracy, communication technology specs, visual conventions

This checklist is notable for its specificity and atomicity — each criterion is a discrete yes/no question, making it highly suitable for automated assessment.

### 1.6 Architecture Review Board (ARB) Checklists

Industry ARB checklists typically organize assessment into seven dimensions:

1. **Strategic Alignment** — Does the architecture support organizational objectives?
2. **Compliance and Security** — Does it meet regulatory and security standards?
3. **Cost Management** — Are costs analyzed and optimization opportunities identified?
4. **Technical Feasibility and Risk** — Are risks assessed and mitigated?
5. **Performance and Scalability** — Can the system handle load and growth?
6. **Interoperability and Integration** — Does it work with existing systems?
7. **Documentation and Best Practices** — Is the architecture well-documented?

### 1.7 Harvard EA Design Review Checklist

Harvard's Enterprise Architecture group publishes an Application Architecture Checklist that categorizes applications by deployment model (Developed Solutions, Purchased/Private Cloud, Purchased/Hosted, SaaS) and evaluates against principles, standards, and resources for each layer of the architecture stack, including cross-cutting security requirements.

### 1.8 Academic Literature

A 2024 systematic literature review published in ACM Computing Surveys analyzed 109 articles from 3,644 papers on EA evaluation methods (published since 2005). The key finding: the critical factor for widespread adoption of EA evaluation is automation of the assessment and architecture modeling processes, particularly data collection. The review identified 204 active researchers and 61 publication venues dedicated to this topic, confirming it as a mature research area with a clear gap in automated assessment tooling.

A separate study analyzing software architecture documentation models evaluated frameworks against criteria including: registration of system architecture knowledge, support for incremental documentation, audience-specific descriptions, separation of current and future architectures, support for decision analysis, and modularity support.

---

## 2. AI-Agent-Based Assessment of Architecture Quality

### 2.1 Current State of AI in Architecture Assessment

Despite significant advances in AI-assisted code review and generation, the explicit application of AI to software and enterprise architecture assessment remains relatively under-explored. A 2025 survey on AI for Software Architecture confirmed that the practice of designing and evaluating architecture is still largely manual, though emerging capabilities are promising.

Key developments:

- **AWS Bedrock-based architecture review:** AWS has demonstrated a generative AI solution that analyzes architecture documents against Well-Architected Framework pillars automatically, representing the most production-ready example of AI-agent architecture assessment.

- **LLM-based code review:** Tools like GitHub Copilot, CodeRabbit, and others can detect bugs, code smells, and provide improvement suggestions. Research is extending these to detect architecture-level technical debt including design debt, documentation debt, and infrastructure debt.

- **Reasoning-driven LLMs:** Models like OpenAI o1 and DeepSeek-R1 provide step-by-step justifications for decisions, making AI-driven architectural insights more transparent and actionable.

- **Graph-based AI for architecture:** Graph neural networks can provide structural representations of software architecture, potentially enabling AI to reason about architectural properties like coupling, cohesion, and dependency patterns.

- **C4 model automation:** Research on collaborative LLM agents for C4 software architecture design automation demonstrates AI agents working together to generate and evaluate architecture documentation.

### 2.2 What Works

Based on current evidence, AI-agent architecture assessment works best when:

1. **Criteria are concrete and binary.** Questions like "Does every element have a name?" or "Is the API versioned?" can be reliably assessed by LLMs.

2. **Reference standards exist.** When the assessment involves checking compliance against a well-defined standard (e.g., OpenAPI spec validation, ArchiMate schema conformance), AI can achieve high accuracy.

3. **Structure is consistent.** When artifacts follow a standard template, AI can reliably extract and evaluate specific sections.

4. **Domain context is provided.** RAG (Retrieval-Augmented Generation) or fine-tuning with domain-specific knowledge significantly improves assessment quality.

5. **Scoring is decomposed.** Breaking holistic quality into atomic, independently scorable dimensions dramatically improves reliability (see Section 4).

### 2.3 What Doesn't Work (Yet)

1. **Holistic quality judgments.** Asking an AI to assign a single overall quality score to an architecture document produces inconsistent results. The same document may receive different scores on different runs.

2. **Context-dependent trade-off evaluation.** Architecture decisions often involve trade-offs that only make sense in a specific business context (e.g., choosing eventual consistency for a particular use case). Without deep contextual understanding, AI may misjudge these.

3. **Cross-artifact consistency checking.** Verifying that a data model, API specification, sequence diagram, and deployment diagram are all internally consistent requires reasoning across multiple artifact types simultaneously — a challenge for current LLMs.

4. **Evaluating innovation and creativity.** Novel architectural patterns or unconventional solutions may be penalized by AI systems trained on conventional practices.

5. **Stakeholder-specific quality.** The same architecture may be good for one stakeholder group and poor for another. AI struggles with this multiperspective evaluation.

### 2.4 Key Challenges

**Ambiguity:** Architecture artifacts frequently contain ambiguous language ("the system should be scalable," "appropriate security measures"). AI agents need disambiguation strategies, either through rubric clarification or by flagging ambiguity for human review.

**Subjectivity:** Many quality dimensions are inherently subjective (elegance, simplicity, appropriateness). Research shows LLMs can achieve reasonable inter-rater reliability with human experts when given detailed rubrics, but performance degrades significantly without them.

**Context-dependency:** Architecture quality is deeply contextual. A microservices architecture may be excellent for one scenario and terrible for another. AI agents need access to business context, constraints, and non-functional requirements to make meaningful assessments.

**Hallucination risk:** LLMs may invent technical details or make confident but incorrect claims about architecture quality. Evidence-anchored scoring (requiring the AI to cite specific evidence from the artifact) mitigates this.

**Prompt sensitivity:** Minor changes in how evaluation criteria are phrased can significantly alter AI assessments. The RULERS framework (see Section 4.4) addresses this through "locked rubrics" that eliminate interpretation drift.

---

## 3. Artifact Structure and Format Requirements for AI Assessability

### 3.1 Machine-Readable Architecture Formats

To enable AI-agent assessment, architecture artifacts should leverage machine-readable formats wherever possible.

**ArchiMate Model Exchange File Format:**
The Open Group's ArchiMate exchange format is an XML-based standard backed by validating XSD schemas. It supports three schema types: model exchange, view exchange, and diagram exchange. Models can include Dublin Core metadata. This format has been mandatory for certified ArchiMate tools since June 2018. The structured, schema-validated nature makes it highly amenable to automated assessment — an AI agent can parse the XML, validate against the schema, and evaluate properties like completeness, naming conventions, and relationship integrity.

**OpenAPI Specification:**
For API architecture artifacts, the OpenAPI Specification (OAS) defines a machine-readable standard for HTTP API descriptions. Tools like Spectral provide automated linting and validation. APIMatic's "Score My OpenAPI" tool demonstrates that API specifications can be programmatically scored for standard compliance and quality. This is a mature model for how architecture artifacts can be made automatically assessable.

**Architecture Decision Records (ADRs):**
Traditional ADRs use Markdown templates (e.g., MADR — Markdown Architectural Decision Records). The emerging Decision Reasoning Format (DRF) provides a vendor-neutral, machine-readable YAML/JSON format for representing decisions with explicit reasoning, assumptions, cognitive state, and trade-offs. DRF is particularly valuable for AI assessment because it structures the rationale in a parseable way.

**Infrastructure as Code (IaC):**
Terraform, CloudFormation, Pulumi, and similar IaC formats provide machine-readable architecture descriptions that can be directly analyzed by AI agents. Cloud well-architected tools already leverage this for automated assessment.

### 3.2 Structured Templates and Mandatory Sections

For architecture documents to be reliably assessed by AI agents, they should follow structured templates with mandatory sections. Recommended approaches:

**Arc42 Template:**
Arc42 is a widely used, process-independent template for software architecture documentation. Its 12 sections provide a consistent structure that AI agents can reliably parse and evaluate:

1. Introduction and Goals
2. Constraints
3. Context and Scope
4. Solution Strategy
5. Building Block View
6. Runtime View
7. Deployment View
8. Cross-cutting Concepts
9. Architecture Decisions
10. Quality Requirements
11. Risks and Technical Debt
12. Glossary

**Recommended mandatory sections for AI-assessable architecture documents:**

- **Metadata block** (YAML frontmatter): document type, version, author, date, status, related artifacts, classification
- **Context and scope:** Problem statement, business drivers, constraints, stakeholders
- **Architecture decisions:** Structured ADRs with decision, rationale, alternatives considered, trade-offs
- **Quality attributes:** Explicitly stated with measurable acceptance criteria using TOGAF quality attribute scenarios
- **Component/service catalog:** Structured listing with responsibilities, interfaces, dependencies
- **Risk register:** Identified risks with likelihood, impact, mitigation strategies
- **Compliance mapping:** Explicit mapping to applicable standards, principles, regulations

### 3.3 Metadata and Tagging Conventions

**YAML frontmatter example for architecture documents:**

```yaml
---
document_type: solution_architecture
version: 2.1
status: draft | review | approved | deprecated
author: jane.doe@company.com
last_modified: 2026-03-15
classification: internal
domain: payments
systems:
  - payment-gateway
  - fraud-detection
standards_compliance:
  - PCI-DSS-4.0
  - company-api-standards-v3
quality_attributes:
  - availability: 99.99%
  - latency_p99: 200ms
  - throughput: 10000_tps
related_artifacts:
  - type: data_model
    ref: /artifacts/payments/data-model-v2.yaml
  - type: api_spec
    ref: /artifacts/payments/openapi-v3.yaml
  - type: adr
    refs:
      - /decisions/ADR-042-event-sourcing.md
      - /decisions/ADR-043-cqrs-pattern.md
assessment_rubric: enterprise-architecture-rubric-v2
---
```

**Tagging conventions for assessability:**

- Use semantic section markers (e.g., `<!-- SECTION:quality_attributes -->`) to enable precise extraction
- Tag architecture decisions with categories: `[DECISION:technology]`, `[DECISION:pattern]`, `[DECISION:trade-off]`
- Mark assumptions explicitly: `[ASSUMPTION]`, `[CONSTRAINT]`, `[RISK]`
- Use structured tables for traceability matrices
- Embed quality attribute scenarios in a parseable format (YAML code blocks within Markdown)

### 3.4 Diagram Assessability

Architecture diagrams present a particular challenge for AI assessment. Approaches to improve assessability:

- **Model-based diagrams:** Use ArchiMate, UML, or C4 models stored in machine-readable formats (XML, JSON) rather than image-only diagrams
- **Diagram-as-code:** Tools like Structurizr (C4), PlantUML, Mermaid, and D2 generate diagrams from text descriptions that AI can parse
- **Dual representation:** Store both the machine-readable model and the rendered diagram, with the model as the authoritative source
- **Embedded metadata:** Include element catalogs, relationship tables, and technology tags alongside diagrams

---

## 4. Rubric Design Principles for AI Grading

### 4.1 Core Design Principles

Research from Snorkel AI, Microsoft, and recent academic work converges on several key principles for designing rubrics that AI agents can reliably apply:

**Principle 1: Decompose into atomic criteria.**
Break holistic quality assessments into the smallest possible independent dimensions. Each criterion should evaluate exactly one aspect. Research shows LLM-as-judge alignment improved from 37.3% to 93.95% when rubrics were provided, and further improvements come from atomic decomposition.

**Principle 2: Use analytic rather than holistic rubrics.**
Analytic rubrics (separate scores per dimension) consistently outperform holistic rubrics (single overall score) for AI-based evaluation. Education research confirms sharper inter-rater agreement when analytic rubrics replace holistic judgments.

**Principle 3: Define precise level descriptors.**
Every point on every scale needs a written definition. For example, instead of "1=Poor, 5=Excellent," each level should have a concrete description of what that level looks like for that specific criterion. Without this, LLMs exhibit significant scoring drift.

**Principle 4: Include positive and negative examples.**
Anchor criteria with exemplars of good and bad performance. Research on few-shot examples in LLM grading shows they reduce ambiguity and improve consistency, particularly for subjective criteria.

**Principle 5: Require evidence citation.**
The AI should be required to cite specific evidence from the artifact for every score. The RULERS framework calls this "evidence-anchored scoring" and demonstrates it produces mechanically auditable assessments.

**Principle 6: Use deterministic protocols, not generative prompts.**
Frame rubric evaluation as executing a deterministic protocol rather than generating a creative response. This reduces prompt sensitivity and scoring variability.

**Principle 7: Separate assessment dimensions from aggregation.**
Score each dimension independently, then combine scores using a defined aggregation function. The multi-criteria approach "decomposes relevance into interpretable subcriteria, with each criterion independently graded via dedicated prompts, with an additional prompt aggregating these scores."

### 4.2 Scoring Scales

Research and practice suggest the following for AI-applied rubrics:

- **Preferred scale: 0-3 or 1-4.** Smaller scales reduce ambiguity and improve inter-rater reliability. A 1-5 scale is common in industry but introduces a muddled middle.
- **Include "Not Applicable" and "Cannot Assess."** Architecture artifacts may not always contain information relevant to every criterion. The AI should be able to indicate when a criterion doesn't apply or when the artifact lacks sufficient information for assessment.
- **Binary where possible.** For structural/compliance criteria (e.g., "Does the document include a quality attributes section?"), use Yes/No rather than graded scales.
- **Ordinal with clear boundaries.** For qualitative criteria, define each level so that the boundary between levels is unambiguous:
  - 0 = Absent or fundamentally inadequate
  - 1 = Present but significantly incomplete or flawed
  - 2 = Adequate with minor gaps
  - 3 = Comprehensive and well-executed

### 4.3 Disambiguation Strategies

Specific strategies for reducing ambiguity in AI-applied rubrics:

- **Decision trees:** Structure criteria as if/then decision trees rather than open-ended questions. For example: "IF the document includes quality attributes, THEN check: are they measurable? Are acceptance criteria defined? Is a test strategy included?"
- **DAG-based evaluation:** Structure evaluation as a Directed Acyclic Graph where each node is an LLM judge handling a specific decision. This reduces ambiguity by breaking interactions into fine-grained, atomic units.
- **Confusion-aware optimization (CARO):** Recent research (2026) proposes isolating specific misclassification patterns and generating targeted rule patches that resolve ambiguities without degrading global performance.
- **Negative criteria:** Explicitly state what does NOT qualify for each score level. This is often more informative than positive descriptions alone.
- **Boundary cases:** Provide examples of artifacts that fall on the boundary between score levels, with explanations of why they receive the higher or lower score.

### 4.4 Key Frameworks for AI-Based Rubric Evaluation

**RULERS (Rubric Unification, Locking, and Evidence-anchored Robust Scoring):**
Published in January 2026, RULERS addresses three failure modes of LLM judges: instability under prompt variations, unverifiable reasoning, and distributional misalignment. It implements a three-phase pipeline:
- Phase I: Compile rubrics into immutable, versioned specifications to eliminate runtime interpretation drift
- Phase II: Enforce evidence-anchored protocol requiring mechanically auditable citations
- Phase III: Apply lightweight Wasserstein-based post-hoc calibration to map outputs to human distributions

RULERS operates without updating model parameters, making it practical for enterprise deployment.

**LLM-Rubric (Microsoft Research, ACL 2024):**
A multidimensional, calibrated approach where a manually constructed rubric describes how to assess multiple dimensions. For each dimension, an LLM produces a distribution over potential responses. A small feed-forward neural network combines these distributions (with judge-specific and judge-independent parameters) to predict human judge annotations. Demonstrated 2x improvement in RMS error over uncalibrated baselines for dialogue system evaluation.

**AutoRubric (2026):**
A unified framework for rubric-based LLM evaluation that aims to standardize how rubrics are constructed and applied across different evaluation domains.

**Snorkel AI's Rubric Framework:**
Treats rubrics as models to maximize goal alignment and inter-rater agreement. Key practices:
- Co-develop rubrics with domain experts
- Validate and calibrate by aligning interpretations between experts and LLM-as-Judge until inter-rater reliability stabilizes
- Use the same inter-annotator agreement statistics (Cohen's kappa, QWK, ICC) to measure LLM-human alignment
- Require LLMs to explain ratings, which consistently improves correlation with human labels

### 4.5 Practical Rubric Structure for Architecture Assessment

Based on synthesizing all research, a rubric for AI-agent architecture assessment should be structured as follows:

```
RUBRIC: [Name and Version]
ARTIFACT_TYPE: [e.g., solution_architecture_document]
APPLICABLE_STANDARDS: [list]

DIMENSION: [e.g., Completeness]
  CRITERION: [e.g., Quality Attributes Defined]
    QUESTION: "Does the document explicitly state quality attributes
               with measurable acceptance criteria?"
    SCALE: 0-3
    LEVEL_0: "No quality attributes section exists."
    LEVEL_1: "Quality attributes are mentioned but vague
              (e.g., 'the system should be fast')."
    LEVEL_2: "Quality attributes are stated with some measurable criteria
              but coverage is incomplete."
    LEVEL_3: "All relevant quality attributes are explicitly stated with
              measurable acceptance criteria and test strategies."
    EVIDENCE_REQUIRED: true
    EXAMPLE_GOOD: "Availability: 99.99% uptime measured monthly,
                   excluding planned maintenance windows.
                   Monitored via synthetic probes every 30 seconds."
    EXAMPLE_BAD: "The system should be highly available."
    WEIGHT: 0.8
    PREREQUISITE: null

  CRITERION: [next criterion...]
    ...

DIMENSION: [next dimension...]
  ...

AGGREGATION:
  METHOD: weighted_average
  THRESHOLDS:
    pass: 2.0
    conditional_pass: 1.5
    fail: < 1.5
  MANDATORY_CRITERIA: [list of criteria that must score >= 2]
```

### 4.6 Inter-Rater Reliability Targets

Based on research, the following reliability targets are reasonable for AI-agent architecture assessment:

- **Binary criteria** (present/absent): Target > 95% agreement with human reviewers
- **Ordinal criteria** (0-3 scale): Target Cohen's kappa > 0.7 (substantial agreement) for well-defined criteria; > 0.5 (moderate agreement) for more subjective criteria
- **Overall assessment:** Target correlation (Spearman's rho) > 0.8 with expert human reviewers

These targets should be validated through calibration exercises comparing AI assessments against human expert panels, using the same methodology described in the Snorkel AI and RULERS frameworks.

---

## 5. Synthesis: A Proposed Approach

### 5.1 Architecture for an AI-Agent Assessment System

Based on the research, an effective AI-agent architecture assessment system would combine:

1. **Structured artifact ingestion:** Parse artifacts using format-specific handlers (OpenAPI validator, ArchiMate schema validator, Markdown section extractor, YAML frontmatter parser)

2. **Multi-dimensional rubric engine:** Apply atomic criteria independently, organized into dimensions, with evidence-anchored scoring

3. **DAG-based evaluation flow:** Structure the assessment as a directed acyclic graph where:
   - Structural/compliance checks run first (binary criteria)
   - Content quality checks run second (ordinal criteria)
   - Cross-reference checks run third (consistency between artifact sections)
   - Contextual quality checks run last (requiring business context)

4. **Calibrated aggregation:** Use the LLM-Rubric approach to calibrate AI scores against human expert baselines, with lightweight feed-forward networks for score combination

5. **Evidence-anchored reporting:** Every score accompanied by specific citations from the artifact, following the RULERS protocol

### 5.2 Recommended Rubric Dimensions for Architecture Artifacts

Based on the frameworks reviewed, architecture assessment rubrics should cover:

| Dimension | Description | Assessment Type |
|-----------|-------------|-----------------|
| **Structural Completeness** | Are all required sections present? | Binary checklist |
| **Content Adequacy** | Is each section substantively populated? | Ordinal (0-3) |
| **Quality Attribute Specification** | Are NFRs explicit and measurable? | Ordinal (0-3) |
| **Decision Documentation** | Are architectural decisions recorded with rationale? | Ordinal (0-3) |
| **Standards Compliance** | Does the artifact conform to applicable standards? | Binary + ordinal |
| **Internal Consistency** | Are components, relationships, and decisions consistent? | Ordinal (0-3) |
| **Risk Identification** | Are risks identified, assessed, and mitigated? | Ordinal (0-3) |
| **Stakeholder Appropriateness** | Is the artifact appropriate for its target audience? | Ordinal (0-3) |
| **Traceability** | Can decisions be traced to requirements and constraints? | Ordinal (0-3) |
| **Clarity and Communication** | Is the artifact clear, unambiguous, and well-organized? | Ordinal (0-3) |

### 5.3 Implementation Roadmap

**Phase 1: Structural assessment (highest confidence)**
- Template compliance (mandatory sections present)
- Metadata completeness
- Format validation (schema compliance for machine-readable artifacts)
- Naming convention adherence
- Cross-reference integrity

**Phase 2: Content quality assessment (moderate confidence)**
- Quality attribute specification quality
- Decision documentation completeness
- Risk assessment coverage
- Stakeholder coverage

**Phase 3: Contextual assessment (requires human-in-the-loop)**
- Appropriateness of architectural decisions for the business context
- Trade-off evaluation
- Innovation and creativity
- Long-term maintainability and evolvability

### 5.4 Key Success Factors

1. **Start with machine-readable formats.** Enforce structured templates and machine-parseable formats for all architecture artifacts before attempting AI assessment.

2. **Begin with binary criteria.** Build confidence and calibrate the system on structural/compliance checks before moving to qualitative assessment.

3. **Invest in rubric engineering.** Treat rubric development as a first-class engineering activity, with version control, calibration testing, and iterative refinement.

4. **Maintain human-in-the-loop for subjective dimensions.** Use AI to handle objective and semi-objective criteria, flag issues for human review, and produce draft assessments that humans validate.

5. **Build calibration datasets.** Collect expert-annotated architecture artifacts to serve as calibration benchmarks for the AI assessment system.

6. **Version and lock rubrics.** Following the RULERS approach, compile rubrics into immutable specifications to prevent interpretation drift across assessments.

---

## 6. Sources

### Frameworks and Standards

- [TOGAF Standard v9.2 — Architecture Compliance](https://pubs.opengroup.org/architecture/togaf9-doc/arch/chap42.html)
- [TOGAF Standard v9.2 — Architecture Deliverables](https://pubs.opengroup.org/architecture/togaf9-doc/arch/chap32.html)
- [TOGAF Standard v9.2 — Architecture Maturity Models](https://pubs.opengroup.org/architecture/togaf9-doc/arch/chap45.html)
- [TOGAF Architecture Compliance Review Process](https://pubs.opengroup.org/architecture/togaf8-doc/arch/chap24.html)
- [TOGAF Architecture Review Checklists (System Engineering)](https://www.opengroup.org/architecture/togaf7-doc/arch/p4/comp/clists/syseng.htm)
- [TOGAF Standard — Architecture Compliance Introduction](https://pubs.opengroup.org/togaf-standard/ea-capability-and-governance/chap06.html)
- [OMB Enterprise Architecture Assessment Framework (EAAF)](https://obamawhitehouse.archives.gov/omb/E-Gov/eaaf)
- [EAAF Guide — CIO Portal](https://cioindex.com/reference/enterprise-architecture-assessment-framework-eaaf-guide/)
- [Zachman Framework — Wikipedia](https://en.wikipedia.org/wiki/Zachman_Framework)
- [Zachman Framework — LeanIX](https://www.leanix.net/en/wiki/ea/zachman-framework)

### Cloud Well-Architected Frameworks

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [Accelerate AWS Well-Architected Reviews with Generative AI](https://aws.amazon.com/blogs/machine-learning/accelerate-aws-well-architected-reviews-with-generative-ai/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/)
- [Azure Well-Architected Framework Pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars)
- [GitHub Well-Architected — Architecture Checklist](https://wellarchitected.github.com/library/architecture/checklist/)

### C4 Model and Architecture Documentation

- [C4 Model Review Checklist](https://c4model.com/diagrams/checklist)
- [C4 Model Introduction](https://c4model.com/introduction)
- [Collaborative LLM Agents for C4 Software Architecture Design Automation (arXiv)](https://arxiv.org/pdf/2510.22787)
- [Arc42 — Software Architecture Documentation](https://www.workingsoftware.dev/software-architecture-documentation-the-ultimate-guide/)

### Architecture Review Checklists

- [Harvard Application Architecture Checklist](https://enterprisearchitecture.harvard.edu/application-architecture-checklist)
- [Harvard EA Design Review Checklist (Excel)](https://enterprisearchitecture.harvard.edu/files/enterprise/files/ea_design_review_checklist_2_2.xlsx)
- [Architecture Review Board Checklist — Hava.io](https://www.hava.io/blog/architecture-review-board-checklist)
- [Info-Tech EA Assessment Checklist Template](https://www.infotech.com/research/ea-assessment-checklist-template)

### Machine-Readable Formats

- [ArchiMate Model Exchange File Format](https://www.opengroup.org/open-group-archimate-model-exchange-file-format)
- [ArchiMate Exchange File Format Guide](https://pubs.opengroup.org/architecture/archimate31-exchange-file-format-guide/)
- [ArchiMate XSD Schemas](https://www.opengroup.org/xsd/archimate/)
- [OpenAPI Specification v3.1](https://swagger.io/specification/)
- [Score My OpenAPI — APIMatic](https://www.apimatic.io/solution/score-my-openapi)
- [Architecture Decision Records](https://adr.github.io/)
- [MADR — Markdown Architectural Decision Records](https://adr.github.io/madr/)
- [ADR Templates](https://adr.github.io/adr-templates/)
- [Azure ADR Guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
- [AWS ADR Process](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)
- [Google Cloud ADR Overview](https://cloud.google.com/architecture/architecture-decision-records)

### AI-Agent Assessment and LLM-as-Judge

- [RULERS: Locked Rubrics and Evidence-Anchored Scoring for Robust LLM Evaluation (arXiv 2601.08654)](https://arxiv.org/abs/2601.08654)
- [LLM-Rubric: A Multidimensional, Calibrated Approach — ACL 2024](https://aclanthology.org/2024.acl-long.745/)
- [LLM-Rubric — Microsoft Research](https://www.microsoft.com/en-us/research/publication/llm-rubric-a-multidimensional-calibrated-approach-to-automated-evaluation-of-natural-language-texts/)
- [LLM-Rubric — GitHub Repository](https://github.com/microsoft/LLM-Rubric)
- [The Science of Rubric Design — Snorkel AI](https://snorkel.ai/blog/the-science-of-rubric-design/)
- [Data Quality and Rubrics — Snorkel AI](https://snorkel.ai/blog/data-quality-and-rubrics-how-to-build-trust-in-your-models/)
- [Scaling Trust: Rubrics in Snorkel's Quality Process](https://snorkel.ai/blog/scaling-trust-rubrics-in-snorkels-quality-process/)
- [LLM-as-Judge for Enterprises — Snorkel AI](https://snorkel.ai/llm-as-judge-for-enterprises/)
- [Demystifying Evals for AI Agents — Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [LLM-as-a-Judge Guide — Evidently AI](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [LLM-as-Judge Best Practices — Monte Carlo Data](https://www.montecarlodata.com/blog-llm-as-judge/)
- [AutoRubric: A Unified Framework for Rubric-Based LLM Evaluation (arXiv)](https://arxiv.org/html/2603.00077v1)
- [Confusion-Aware Rubric Optimization for LLM-based Grading (arXiv)](https://arxiv.org/html/2603.00451)

### Rubric Design and AI Grading

- [Designing Transparent Rubrics for AI-Based Evaluation — The Case HQ](https://thecasehq.com/designing-transparent-rubrics-for-ai-based-evaluation-a-practical-guide-for-educators/)
- [AI in Grading Rubrics — The Case HQ](https://thecasehq.com/how-ai-in-grading-rubrics-ensures-unmatched-consistency-and-fairness-in-education/)
- [Rubric Development for AI-Enabled Scoring — Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2022.983055/full)
- [Implementation Considerations for Automated AI Grading (arXiv)](https://arxiv.org/html/2506.07955v2)
- [LLM-as-Judge Done Right: Calibrating, Guarding & Debiasing — Kinde](https://www.kinde.com/learn/ai-for-software-engineering/best-practice/llm-as-a-judge-done-right-calibrating-guarding-debiasing-your-evaluators/)

### AI for Software Architecture

- [AI for Software Architecture: Literature Review and Road Ahead (arXiv 2504.04334)](https://arxiv.org/html/2504.04334v1)
- [Evaluation and Benchmarking of LLM Agents: A Survey (arXiv)](https://arxiv.org/html/2507.21504v1)
- [AI-powered Code Review with LLMs: Early Results (arXiv)](https://arxiv.org/html/2404.18496v2)
- [vFunction — AI-Driven Architecture Analysis](https://vfunction.com/blog/software-architecture-tools/)

### EA Evaluation Academic Literature

- [A Systematic Literature Review of EA Evaluation Methods — ACM Computing Surveys 2024](https://dl.acm.org/doi/full/10.1145/3706582)
- [EA Framework Evaluation Criteria — Springer](https://dl.acm.org/doi/abs/10.1007/s11761-020-00294-x)
- [Systematic Literature Review on EA Evaluation Models — BEEI](https://beei.org/index.php/EEI/article/view/6943)
- [Analyzing Software Architecture Documentation Models (SCITEPRESS 2023)](https://www.scitepress.org/Papers/2023/118523/118523.pdf)

### Enterprise Architecture Maturity

- [EA Maturity Model — Ardoq](https://www.ardoq.com/knowledge-hub/enterprise-architecture-maturity-model)
- [EA Maturity Stages — LeanIX](https://www.leanix.net/en/wiki/ea/enterprise-architecture-maturity-stages-and-assessment)
