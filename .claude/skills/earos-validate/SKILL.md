---
name: earos-validate
description: Run a project health check on the EAROS repository. Validates all YAML rubric files against schemas, checks ID uniqueness, verifies cross-references, detects missing v2 fields, and reports on documentation accuracy. Triggers when the user wants to validate the EAROS repo, check rubric health, run a consistency check, verify schemas, find missing fields, or says "validate the rubrics", "check the EAROS repo", "run a health check", "check for schema errors", "find inconsistencies", or "is the rubric set valid".
---

# EAROS Validate — Repository Health Check

You run a systematic health check on the EAROS repository. This catches errors that accumulate silently during development: ID conflicts across files, missing required fields added in v2, documentation claims that no longer match the YAML, gate configurations that contradict the status logic.

**Why this matters:** A rubric with a duplicate criterion ID will produce ambiguous evaluation records. A profile with a missing `decision_tree` field will calibrate unreliably. Documentation that says "10 criteria" when there are 11 creates confusion for authors and reviewers. These errors compound. A weekly or pre-commit health check prevents this.

## What to Load First

Read before running any checks:
1. `standard/schemas/rubric.schema.json` — schema for all rubric/profile/overlay YAML files
2. `standard/schemas/evaluation.schema.json` — schema for evaluation record files

Then read all YAML files in: `core/`, `profiles/`, `overlays/`, `examples/`

## The Seven Checks

Run all seven. Do not stop at the first error.

**Check 1 — Schema conformance**
For each rubric YAML, verify required top-level fields, `scoring` and `outputs` sub-fields, and kind-specific requirements (profiles must have `inherits`, overlays must not, overlays must use `append_to_base_rubric`).

**Check 2 — Criterion v2 field completeness**
Every criterion must have all 13 v2 fields: `id`, `question`, `description`, `metric_type`, `scale`, `gate`, `required_evidence`, `scoring_guide` (keys "0"–"4"), `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, `remediation_hints`.

**Check 3 — ID uniqueness**
Collect all rubric IDs, dimension IDs, and criterion IDs. No duplicates allowed across any files. Criterion ID conflicts across profiles cause ambiguity in evaluation records.

**Check 4 — Cross-reference validation**
Profile `inherits` references must resolve to real rubric IDs. Gate configurations must have valid `severity` values and non-empty `failure_effect`. Dimension weights outside 0.5–2.0 should be flagged.

**Check 5 — Evaluation record schema check**
For each evaluation record in `examples/`: required fields, valid `status` values, valid `judgment_type` and `confidence` values per criterion. Status must match the gate failures and overall score.

**Check 6 — Documentation accuracy**
Check CLAUDE.md claims ("9 dimensions", "10 criteria", profile lists) against actual YAML content. Check README.md profile and overlay lists against actual files.

**Check 7 — YAML style conventions**
Two-space indentation, quoted numeric keys in `scoring_guide`, kebab-case filenames, no version number in filename (version is tracked inside the file only).

> Read `references/validation-checks.md` for the complete check procedures with exact field paths and error message formats. Read it before running any checks — it contains the precision needed to produce actionable error messages.

## Severity Classification

| Severity | Meaning |
|----------|---------|
| **ERROR** | Missing required field, schema violation, duplicate ID, gate-status contradiction |
| **WARNING** | Style issue, extreme dimension weight, advisory-level inconsistency |

Errors must be fixed before the repository can be used in production. Warnings should be reviewed.

## Output Format

```markdown
# EAROS Repository Validation Report
Date: [today]
Files checked: [N rubric files] + [N evaluation records]

## Summary
| Check | Errors | Warnings |
|-------|--------|---------|
| Schema conformance | [N] | [N] |
| Criterion v2 completeness | [N] | [N] |
| ID uniqueness | [N] | [N] |
| Cross-references | [N] | [N] |
| Evaluation records | [N] | [N] |
| Documentation accuracy | [N] | [N] |
| YAML style | [N] | [N] |
| TOTAL | [N] | [N] |

Overall health: [Clean / Warnings only / Errors found]

## Errors (must fix)
[FILE] [DESCRIPTION] — each with exact field path and criterion ID where applicable

## Warnings (should review)
[FILE] [DESCRIPTION]

## Recommended Actions
[Numbered list, prioritised by severity]
```

> For common issues and how to fix them, read `references/fix-patterns.md`.

## Non-Negotiable Rules

1. **Report, don't auto-fix.** Flag problems; do not silently correct them. The user reviews and approves all changes.
2. **Be precise.** "profiles/reference-architecture.yaml CRITERION RA-VIEW-01 MISSING: decision_tree" is useful. "Some criteria have missing fields" is not.
3. **Count accurately.** Verify documentation claims against actual YAML — do not rely on memory or prior knowledge.
4. **Errors vs. warnings.** Missing required fields are errors. Style deviations are warnings. Never downgrade an error to a warning.

## When to Read References

| When | Read |
|------|------|
| Before running any checks | `references/validation-checks.md` |
| Check field paths for scoring and outputs | `references/validation-checks.md` |
| After finding errors — how to fix | `references/fix-patterns.md` |
| User asks how to fix a specific error | `references/fix-patterns.md` |
