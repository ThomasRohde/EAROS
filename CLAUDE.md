# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**EaROS** — Enterprise Architecture Rubric Operational Standard. A greenfield framework for evaluating architecture artifacts (solution designs, ADRs, reference architectures, capability maps, roadmaps) through governed, machine-readable rubrics.

- **Greenfield.** No published prior versions — optimize for clarity over backward compatibility.
- **Spelling.** Write **EaROS** in all user-facing content (docs, READMEs, site, editor). Lowercase `earos` is fine for code, package names, filenames, and CLI identifiers.
- **External framing.** Present as "the standard" — no version numbers in public-facing content.
- **Full standard.** See `standard/EAROS.md` for the canonical specification and `README.md` for the public overview.

## Three-Layer Model

```
OVERLAYS  (cross-cutting: security, data-governance, regulatory)  ← append_to_base_rubric
PROFILES  (per artifact_type — inherit: [EAROS-CORE-002])
CORE      (core/core-meta-rubric.yaml — EAROS-CORE-002, always applied)
```

## Repository Layout

```
standard/EAROS.md            Canonical standard (read first for deep understanding)
standard/schemas/            JSON Schemas: rubric, evaluation, and per-type artifact schemas
core/core-meta-rubric.yaml   EAROS-CORE-002 — 9 dimensions, 10 criteria
profiles/                    Per artifact_type (inherit core)
overlays/                    Cross-cutting (append)
templates/                   Authoring scaffolds (new-profile, evaluation-record, adr, solution-architecture)
examples/                    Worked artifacts + evaluations (see below for gold-standard)
calibration/gold-set/        Reference artifacts for inter-rater calibration
docs/terminology.md          Authoritative glossary (scoring model, gates, RULERS, DAG, kappa, etc.)
docs/profile-authoring-guide.md  Step-by-step profile creation
tools/editor/                @trohde/earos CLI + React editor (JSON Forms based)
earos.manifest.yaml          Auto-generated inventory of all rubric files
```

## Per-Type Artifact Schemas (important convention)

Each profile has a **pair** of schemas under `standard/schemas/`:

- `<artifact-type-kebab>.artifact.schema.json` — data schema (validation)
- `<artifact-type-kebab>.artifact.uischema.json` — JSON Forms UI layout (tabs)

Naming: filename prefix = profile's `artifact_type` value (e.g. `solution-architecture` ↔ `solution_architecture`).

**Current pairs:** `reference-architecture` (7 tabs), `solution-architecture` (5 tabs), `adr` (2 tabs).

**When adding a new profile, you must author a new pair AND update the resolver in all three places:**
1. `tools/editor/src/utils/schemaLoader.ts` — `ARTIFACT_TYPE_TO_SCHEMA`
2. `tools/editor/bin.js` — mirror of the same map (used by `earos validate`)
3. `tools/editor/src/export-docx.ts` — mirror of the same map (+ `SECTION_ORDER_BY_TYPE`)

After editing TS, recompile the Node-side bundle: `npx tsc -p tools/editor/tsconfig.server.json`.

**Derivation chain:** rubric's `required_evidence` → artifact data schema → UI schema → template. A well-filled artifact satisfies the rubric's evidence requirements.

## Canonical `artifact_type` Values

Use these **exact** strings in artifact YAML — the validator and editor reject aliases:

`reference_architecture` · `solution_architecture` · `architecture_decision_record` · `capability_map` · `roadmap`

Do **not** write `adr` as an `artifact_type` value — the canonical form is `architecture_decision_record`.

## Hard Rules (do not violate)

1. **Never collapse the three evaluation types.** Artifact quality, architectural fitness, and governance fit are distinct — never merged into one score.
2. **Gates before averages.** Check gates first; a critical gate failure blocks a pass regardless of weighted average.
3. **Evidence first (RULERS).** Every score cites a quote or reference. Classify as `observed` / `inferred` / `external`.
4. **Confidence is separate from score.** Low confidence does not lower a score — it flags human review priority.
5. **N/A requires justification.** Never used to dodge a hard criterion.
6. **Rubrics are governed.** Scoring model and gate structure changes require a version bump. `rubric_locked: true` during evaluation.
7. **Calibrate before production.** New profiles/overlays need ≥3 artifacts × 2+ reviewers, target Cohen's κ > 0.70.
8. **No dimension-average premature collapse.** Pass requires overall ≥ 3.2 **and** no dimension < 2.0.
9. **Agent evaluations must be auditable.** Records capture evidence anchors, evidence class, and confidence.
10. **Machine-readable preferred.** YAML/JSON artifacts score more reliably than prose.

For full definitions of scoring levels, gate types, status thresholds, and the 8-step DAG, read `docs/terminology.md` and `standard/EAROS.md` §7.

## File Naming & YAML Style

- **Kind is the discriminator**, not the filename. Version lives in the file (`version: 2.0.0`), never in the filename.
- Rubrics: `<name>.yaml` · Evaluations: `<name>.evaluation.yaml` · Schemas: `<name>.schema.json`
- Kebab-case, no spaces, two-space YAML indent, `>` for multi-line descriptions.
- Numeric scoring keys quoted: `"0": "Absent"`.
- Use `gate: false` (not `gate: {enabled: false}`) when there's no gate.

Every new criterion requires: `id`, `question`, `description`, `metric_type: ordinal`, `scale: [0,1,2,3,4,"N/A"]`, `gate`, `required_evidence`, `scoring_guide` (keys `"0"`–`"4"`), `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, `remediation_hints`.

## Skills

Triggered by description, no slash command needed. All skills read rubric YAML at runtime — do not embed rubric content in skill files.

| Task | Skill |
|------|-------|
| Assess an artifact | `earos-assess` |
| Challenge an evaluation | `earos-review` |
| Write a new artifact interactively | `earos-artifact-gen` |
| Coach an author toward a passing artifact | `earos-template-fill` |
| Create a new rubric from scratch | `earos-create` |
| YAML-level profile authoring help | `earos-profile-author` |
| Calibrate a rubric | `earos-calibrate` |
| Generate executive report | `earos-report` |
| Repo health check | `earos-validate` |
| Remediation plan from an evaluation | `earos-remediate` |

## Manifest

`earos.manifest.yaml` is the authoritative rubric inventory. Keep it in sync after creating or deleting rubric files:

```bash
node tools/editor/bin.js manifest              # regenerate by scanning core/, profiles/, overlays/
node tools/editor/bin.js manifest add <file>   # add a single new file
node tools/editor/bin.js manifest check        # verify manifest matches filesystem (exit non-zero on drift)
```

`earos-validate` Check 8 also flags drift.

## Reference Artifacts

- **Reference architecture (gold-standard):** `examples/aws-event-driven-order-processing/` — artifact.yaml (3.73/4.0), evaluation.yaml (full 19-criterion DAG), report.md. Calibration target κ > 0.70; RA-VIEW-02 and RA-IMP-02 are intentionally scored 3 — inflating them is a calibration failure.
- **Solution architecture:** `examples/example-solution-architecture/artifact.yaml`
- **ADR:** `examples/example-adr/artifact.yaml`
- **Reference profile (first full profile, model for others):** `profiles/reference-architecture.yaml` — uses `design_method: pattern_library`, 9 criteria across 6 profile dimensions.

## CLI Validation

```bash
node tools/editor/bin.js validate <file>   # resolves schema by kind + artifact_type automatically
```

## Publishing the CLI (`@trohde/earos`)

When the user says "publish to npm":

1. `git log` — review commits since the last `release:` commit.
2. Choose the bump:
   - **patch** — bug fixes, docs, typo, dep updates, minor UI tweaks
   - **minor** — new commands, new features, new schema fields, new bundled skills
   - **major** — renamed/removed commands, breaking `earos init` scaffold changes, incompatible schema changes
3. Bump + commit + push:
   ```bash
   cd tools/editor && npm run version:patch   # or :minor / :major
   cd ../..
   git add tools/editor/package.json
   git commit -m "release: v<NEW_VERSION>"
   git push origin master
   ```
4. `gh run watch` to confirm CI publish.
5. Report the new version.

GitHub Actions (`.github/workflows/publish-npm.yml`) auto-publishes when `tools/editor/package.json` version changes on `master`. `NPM_TOKEN` is a granular `@trohde` token with Bypass-2FA — rotate on expiry.

`npm run release:*` (without `version:`) bumps + publishes locally, bypassing CI. Prefer the CI path unless asked otherwise.

## Tooling Notes

- **Platform:** Windows 11, bash shell — use Unix paths (`/dev/null`, forward slashes). Editor server runs via `node tools/editor/bin.js` (not bare `node serve.js`).
- **Rebuild editor assets** after changing `tools/editor/assets/init/` or schemas: `cd tools/editor && npm run build:assets`.
- **Browser automation:** use `agent-browser` skill, not `playwright-cli`.
