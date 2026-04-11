# Changelog

All notable changes to the EaROS standard are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.7.0] — 2026-04-11

### Added

- **`earos update` command** — smart in-place update of a scaffolded EaROS workspace. Reconciles governed assets (core, profiles, overlays, schemas, templates, skills, root docs, shipped examples) against the installed `@trohde/earos` version without touching user artifacts (evaluations, calibration, custom docs).
  - Classifies each governed file as identical, added, conflict, or user-deleted via CRLF-safe SHA-256 hashes.
  - Interactive per-file resolution by default: `[k]eep mine / [o]verwrite / [d]iff / [s]kip`.
  - Batch flags for CI: `--dry-run`, `--yes-keep-mine`, `--yes-overwrite` (alias `--force`).
  - `--only <path>` restricts the scan to a single governed sub-path.
  - Non-TTY invocations without a batch flag fail fast (no silent hangs).
  - Auto-regenerates `earos.manifest.yaml` after applying changes.
- `.earos-version` workspace marker — records which `@trohde/earos` version last wrote the governed files. Written by `earos init` on scaffold and refreshed by `earos update` on every run. Future updates can diff against it to show "Updating from vA → vB".
- `tools/editor/scripts/test-update.mjs` — integration test for the update flow covering dry-run, batch modes, non-TTY refusal, flag exclusivity, and manifest consistency.

## [1.6.0] — 2026-04-11

### Added

- **Per-type artifact schemas.** Split the unified `artifact.schema.json` into one data/UI schema pair per artifact type under `standard/schemas/`:
  - `reference-architecture.artifact.schema.json` + `.uischema.json` (7 tabs, derived from EAROS-REFARCH-001)
  - `solution-architecture.artifact.schema.json` + `.uischema.json` (5 tabs, derived from EAROS-SOL-001)
  - `adr.artifact.schema.json` + `.uischema.json` (2 tabs, derived from EAROS-ADR-001)
- Architects can now author Solution Architecture and ADR documents in the EaROS editor. A new-artifact picker prompts for the type, and the editor loads the matching schema pair.
- New artifact templates: `templates/solution-architecture/artifact.template.yaml` and `templates/adr/artifact.template.yaml`.
- New worked examples: `examples/example-solution-architecture/artifact.yaml` and `examples/example-adr/artifact.yaml`.
- `earos validate` now resolves the correct schema automatically from the document's `kind` and `artifact_type` fields.
- Markdown export now renders nested arrays/objects recursively instead of dumping `[object Object]` for decision evidence and similar structured sections.
- Manifest generator (`tools/editor/manifest-cli.mjs`) now scans schemas, templates, and examples too, preserves curated metadata across regenerations, and detects filesystem drift in both directions.

### Changed

- The editor (`tools/editor/`) now uses a central `ARTIFACT_TYPE_TO_SCHEMA` resolver in `src/utils/schemaLoader.ts`, mirrored in `bin.js` and `src/export-docx.ts`. New profile types require updating the map plus authoring a matching schema pair.
- The `artifact_type` field in each schema is now a `const` (not an enum) — one file governs one artifact type unambiguously.
- ADR schema now requires `decision.scope` (`minLength: 1`) to match ADR-01's major gate — an ADR without explicit scope cannot pass above `conditional_pass`, so the schema enforces it structurally.
- Solution-architecture schema now requires `sections.quality_attributes` to contain at least one entry (`minItems: 1`) so SOL-02's critical evidence slot can never be silently empty.
- DOCX export and the `/api/export/docx` endpoint now fail closed on unknown `artifact_type` instead of emitting an unvalidated document.
- Editor now fails closed when a per-type schema pair can't be loaded: the form is replaced with a blocking error panel and export/save are disabled until the schema resolves.
- Editor schema loading is race-safe — rapid artifact-type switches no longer render a form keyed to the previous type's schema.
- `earos validate` and the editor server now prefer the canonical `standard/schemas/` directory over the bundled npm-install copy during in-repo development, so live schema edits are picked up without re-running `postbuild`.
- CLAUDE.md refactored from 688 → 162 lines, keeping only information that Claude would get wrong without it.

### Removed

- `standard/schemas/artifact.schema.json` and `artifact.uischema.json` (replaced by per-type files; greenfield, no back-compat shim).

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
