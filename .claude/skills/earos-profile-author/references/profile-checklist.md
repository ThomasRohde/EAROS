# Profile Validation Checklist — EAROS Profile Author

This checklist must be completed before publishing a profile or overlay. Read it before Step 6 (pre-publication checks).

---

## Why a Checklist?

Profiles that skip validation steps cause silent failures in evaluations. A missing field in one criterion might not be caught until the profile is used in production, by which time evaluations have already been produced on a flawed rubric. Running this checklist before publishing catches errors when they are cheap to fix.

---

## Part 1 — Structural Validation

### 1.1 Required Top-Level Fields

Check that each of these is present and correctly typed:

| Field | Required Value |
|-------|---------------|
| `rubric_id` | Unique string, format `EAROS-<ARTIFACT>-<NNN>` |
| `version` | Semver format (e.g., `1.0.0`) |
| `kind` | `profile` or `overlay` |
| `title` | Non-empty string |
| `status` | `draft` (for new profiles) |
| `effective_date` | `YYYY-MM-DD` format |
| `owner` | `enterprise-architecture` |
| `artifact_type` | Snake_case string |
| `inherits` | `[EAROS-CORE-002]` (profiles only; absent for overlays) |
| `design_method` | One of the 5 valid methods |
| `dimensions` | Non-empty list |
| `scoring` | Object with required sub-fields |
| `outputs` | Object with required sub-fields |
| `calibration` | Object with `required_before_production: true` |
| `change_log` | List with at least one entry |

**Overlays specifically:**
- [ ] No `inherits` field
- [ ] `scoring.method: append_to_base_rubric`

### 1.2 Scoring Block

```yaml
scoring:
  scale: 0-4 ordinal plus N/A
  method: gates_first_then_weighted_average  # overlays: append_to_base_rubric
  thresholds:
    pass: No critical gate failure, overall >= 3.2, no dimension < 2.0
    conditional_pass: No critical gate failure, overall 2.4-3.19
    rework_required: Overall < 2.4 or repeated weak dimensions
    reject: Critical gate failure or mandatory control breach
    not_reviewable: Evidence insufficient for core gate criteria
  na_policy: Exclude N/A criteria from denominator; evaluator must justify N/A
  confidence_policy: Confidence reported separately, must not modify score
```

### 1.3 Outputs Block

```yaml
outputs:
  require_evidence_refs: true
  require_confidence: true
  require_actions: true
  require_evidence_class: true
  require_evidence_anchors: true
```

---

## Part 2 — Criterion Completeness

For every criterion, verify all 13 v2 fields are present:

| Field | Check |
|-------|-------|
| `id` | [ ] Present, unique, format `<ARTIFACT>-<AREA>-<NN>` |
| `question` | [ ] Present, specific, single concern |
| `description` | [ ] Present, explains WHY this matters |
| `metric_type` | [ ] Value is exactly `ordinal` |
| `scale` | [ ] Value is exactly `[0, 1, 2, 3, 4, "N/A"]` |
| `gate` | [ ] Either `false` or object with `enabled`, `severity`, `failure_effect` |
| `required_evidence` | [ ] Non-empty list of specific artifact elements |
| `scoring_guide` | [ ] All keys "0" through "4" present with content |
| `anti_patterns` | [ ] Non-empty list |
| `examples.good` | [ ] Non-empty list with realistic quote or paraphrase |
| `examples.bad` | [ ] Non-empty list with the actual common failure mode |
| `decision_tree` | [ ] Non-empty string with IF/THEN branches |
| `remediation_hints` | [ ] Non-empty list of verb-first actions |

---

## Part 3 — ID Uniqueness

Before publishing, verify no ID collisions:

- [ ] Profile `rubric_id` not already used in `core/`, `profiles/`, or `overlays/`
- [ ] All criterion IDs (`id` fields) unique across ALL rubric files in the repo
- [ ] All dimension IDs unique within this profile file

To check: scan `core/core-meta-rubric.v2.yaml`, all files in `profiles/`, and all files in `overlays/` for any matching IDs.

**Common mistake:** Using short IDs like `D1`, `CRT-01` that collide with core rubric dimension IDs.

---

## Part 4 — Gate Distribution Check

Review gate assignments across the profile and verify:

| Gate Type | Target Count | Actual Count |
|-----------|-------------|--------------|
| `critical` | 0–1 | [ ] |
| `major` | 1–2 | [ ] |
| `advisory` | 0–3 | [ ] |
| `gate: false` | Most criteria | [ ] |

**Red flags:**
- More than 2 `major` gates → likely over-gating; review whether all are truly fatal
- 0 gates on a security/compliance-focused profile → likely under-gating
- `critical` gate on a non-compliance criterion → review whether this is warranted

---

## Part 5 — Criterion Count Check

| Check | Target | Actual |
|-------|--------|--------|
| Total profile-specific criteria | 5–12 | [ ] |
| New dimensions | 2–6 | [ ] |
| Criteria that duplicate core criteria | 0 | [ ] |

To verify: read `core/core-meta-rubric.v2.yaml` and compare each new criterion's `question` to ensure it covers a genuinely different concern.

---

## Part 6 — Schema Validation

If you have a YAML validator available, validate against `standard/schemas/rubric.schema.v2.json`.

If not, manually verify the most common schema violations:
- [ ] All string keys are quoted where required (especially numeric keys in `scoring_guide`: `"0":`, `"1":`, etc.)
- [ ] Two-space indentation throughout (not 4-space, not tabs)
- [ ] Lists use `- item` format, not inline `[item1, item2]` for multi-line lists
- [ ] Multi-line descriptions use `>` block scalar, not `|` (unless you need to preserve newlines)
- [ ] File name matches convention: `<artifact-type>.v1.yaml` (kebab-case)

---

## Part 7 — Pre-Calibration Checklist

Before the profile can be used in production:

- [ ] At least 3 real artifacts collected for calibration (1 strong ≥3.2, 1 weak <2.4, 1 ambiguous)
- [ ] Calibration artifacts documented in `calibration/gold-set/` or accessible to reviewers
- [ ] 2+ reviewers identified for independent scoring
- [ ] Profile `status: draft` until calibration is complete

After successful calibration:
- [ ] Profile status changed to `candidate` (then `approved` after governance sign-off)
- [ ] Calibration results saved to `calibration/results/`
- [ ] Worked evaluation example added to `examples/`
- [ ] Profile mentioned in CHANGELOG.md

---

## Final Sign-Off

Before committing the profile:
- [ ] All Part 1–6 checks completed
- [ ] No duplicate IDs found
- [ ] Gate distribution reviewed and approved
- [ ] Criterion count within 5–12
- [ ] `earos-validate` skill run on the full repo (catches cross-file issues)
