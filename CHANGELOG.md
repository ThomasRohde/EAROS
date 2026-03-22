# Changelog

All notable changes to the EaROS standard are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [2.0.0] — 2026-03-19

### Summary

Initial release of the standard, establishing a three-layer rubric architecture (core + profiles + overlays), first-class support for AI-agent evaluation, and formalised calibration and governance requirements.

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

## Pre-release — 2025 (Internal Draft — Never Published)

Internal draft that explored the initial rubric concept and scoring model. Never formally published or deployed. No files from this draft exist in the repository — the current standard is a clean implementation.
