# Changelog

All notable changes to the EaROS standard are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [2.0.0] — 2026-03-19

### Summary

Version 2.0 is a major revision of the standard, expanding the rubric architecture from a single monolithic rubric to a three-layer model (core + profiles + overlays), adding first-class support for AI-agent evaluation, and formalising the calibration and governance requirements.

### Added

**Architecture**
- Three-layer model: core meta-rubric + artifact-specific profiles + cross-cutting overlays
- `overlays/` directory with `security.yaml`, `data-governance.yaml`, `regulatory.yaml`
- Three new profiles: `capability-map.yaml`, `roadmap.yaml`, `reference-architecture.yaml`
- JSON Schema definitions for rubric files (`rubric.schema.json`) and evaluation records (`evaluation.schema.json`)

**Standard (Principle 8 — Machine-Readable Where Possible)**
- New design principle requiring artifacts to prefer machine-readable formats (YAML, JSON, ArchiMate, diagram-as-code) for improved assessability
- Guidance on assessing IaC templates, OpenAPI specs, ADRs, and Architecture-as-Code artifacts

**Agentic Evaluation Protocol**
- Formal 8-step DAG evaluation flow: `structural_validation → content_extraction → criterion_scoring → cross_reference_validation → dimension_aggregation → challenge_pass → calibration → status_determination`
- RULERS (Rubric Unification, Locking, and Evidence-anchored Robust Scoring) protocol for mechanically auditable AI scoring
- `agent_evaluation` block in all YAML rubric files specifying DAG, uncertainty flags, and calibration requirements

**Calibration**
- Inter-rater reliability targets: Cohen's κ > 0.70 for well-defined criteria, > 0.50 for contextual criteria
- `calibration/gold-set/` and `calibration/results/` infrastructure
- Minimum calibration requirement: 3+ reference artifacts before production use

**Profiles**
- `reference-architecture.yaml`: 6 dimensions, 9 profile-specific criteria covering views, prescriptiveness, operational readiness, implementation actionability, quality attribute specification, and reusability
- `capability-map.yaml`: criteria for hierarchy integrity, completeness, business alignment, and heat-mapping readiness
- `roadmap.yaml`: criteria for horizon clarity, dependency mapping, investment traceability, and milestone measurability

**Tooling and Templates**
- `templates/new-profile.template.yaml`: scaffold for authoring new profiles
- `templates/evaluation-record.template.yaml`: blank evaluation record
- `docs/profile-authoring-guide.md`: five profile design methods (A–E)
- `examples/example-solution-architecture.evaluation.yaml`: worked evaluation record
- Reference Architecture document template (`templates/reference-architecture/Reference_Architecture_Template_v2.docx`)

**Scoring Sheets**
- `EAROS_Scoring_Sheet_v2.xlsx`: updated Excel tool with all v2 dimensions and dropdown controls
- `EAROS_RefArch_Scoring_Sheet.xlsx`: dedicated scoring sheet for reference architecture assessments

### Changed

- **Core meta-rubric** upgraded from EAROS-CORE-001 to EAROS-CORE-002
- **Scoring thresholds** formalised: Pass ≥ 3.2, Conditional Pass 2.4–3.19, Rework < 2.4, Reject on gate failure
- **Dimension weighting** introduced per profile (previously all dimensions were equal weight)
- **Gate criteria** now explicit in all profiles — gate failures override weighted averages
- **Evidence requirements** made mandatory for every scored criterion (not recommended but not required in v1)
- Standard document restructured from narrative to specification format

### Research Foundation Added

- `research/architecture-assessment-rubrics-research.md`: 39 KB research report on rubric design for AI-agent assessment, covering TOGAF, OMB EAAF, Zachman, cloud well-architected frameworks, RULERS, LLM-Rubric, AutoRubric, and Snorkel AI
- `research/reference-architecture-research.md`: 42 KB research report on reference architecture best practices, golden paths, arc42, C4 model, and machine-readable architecture

---

## [1.0.0] — 2025 (Internal Draft — Never Published)

### Summary

Version 1.0 was an internal draft that established the initial rubric concept and scoring model. It was never formally published or deployed in production. All files from this draft were superseded by the v2.0 release. No v1 files exist in this repository; the v2.0 files (`solution-architecture.yaml`, `adr.yaml`, etc.) are not renames of v1 originals — they are new implementations of the v2 three-layer model.

### What existed in the draft

- Core rubric (EAROS-CORE-001): 9 dimensions, basic 0–4 scoring, preliminary thresholds
- Draft profiles for solution architecture and ADRs (internal, never approved)
- Excel scoring tool for manual assessment (`EAROS_Scoring_Sheet.xlsx`, retained for reference)

### Known limitations addressed in v2.0

- No formal support for AI-agent evaluation
- No overlay mechanism for cross-cutting concerns
- No calibration protocol or inter-rater reliability targets
- No machine-readable format guidance
- No JSON schemas for validation
- Limited profile coverage
- Evidence recording was optional, not enforced by tooling
