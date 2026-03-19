# Validation Checks — EAROS Validate

Detailed procedures for each of the 7 validation checks. Run in order — schema conformance first, documentation accuracy last.

---

## Check 1 — Schema Conformance

**Purpose:** Verify all YAML files satisfy `standard/schemas/rubric.schema.v2.json` (for rubrics) and `standard/schemas/evaluation.schema.v2.json` (for evaluation records).

**Files to check:**
- `core/core-meta-rubric.v2.yaml`
- `profiles/*.yaml`
- `overlays/*.yaml`
- `examples/*.evaluation.yaml` (against evaluation schema)

**Required top-level fields for rubric/profile/overlay:**

| Field | Required | Notes |
|-------|----------|-------|
| `rubric_id` | Yes | Pattern: `EAROS-[A-Z]+-[0-9]{3}` |
| `version` | Yes | Semver: `X.Y.Z` |
| `kind` | Yes | `core_rubric` \| `profile` \| `overlay` |
| `title` | Yes | Non-empty string |
| `artifact_type` | Yes | `any` for overlays; specific type for profiles |
| `dimensions` | Yes | Non-empty array |
| `scoring` | Yes | Must have `method` and `thresholds` |
| `outputs` | Yes | Must have `require_evidence_refs`, `require_confidence`, `require_actions`, `require_evidence_class`, `require_evidence_anchors` |

**Additional rules by kind:**

| Kind | Additional Requirements |
|------|------------------------|
| `profile` | Must have `inherits: [EAROS-CORE-002]` |
| `overlay` | Must NOT have `inherits`; `scoring.method` must be `append_to_base_rubric` |
| `core_rubric` | No `inherits`; `scoring.method` must be `gates_first_then_weighted_average` |

**Per-dimension required fields:** `id`, `name`, `description`, `weight`, `criteria`

**Per-criterion required fields (v2 completeness — see Check 2):** 13 fields total.

**Error format:**
```
[SCHEMA] profiles/capability-map.v2.yaml
  MISSING: outputs.require_evidence_anchors
  MISSING: dimensions[1].criteria[0].examples
  INVALID: version "1" — must be semver (X.Y.Z)
```

---

## Check 2 — Criterion v2 Completeness

**Purpose:** Verify every criterion has all 13 required v2 fields.

**The 13 required fields:**

| # | Field | What to check |
|---|-------|---------------|
| 1 | `id` | Non-empty, unique within file |
| 2 | `question` | Non-empty string |
| 3 | `description` | Non-empty string |
| 4 | `metric_type` | Must be `ordinal` |
| 5 | `scale` | Must be `[0, 1, 2, 3, 4, "N/A"]` |
| 6 | `gate` | Either `gate: false` or object with `enabled`, `severity`, `failure_effect` |
| 7 | `required_evidence` | Non-empty list |
| 8 | `scoring_guide` | Must have keys `"0"`, `"1"`, `"2"`, `"3"`, `"4"` — all non-empty |
| 9 | `anti_patterns` | Non-empty list |
| 10 | `examples` | Must have sub-keys `good` (non-empty list) and `bad` (non-empty list) |
| 11 | `decision_tree` | Non-empty string — must contain IF/THEN branching language |
| 12 | `remediation_hints` | Non-empty list |
| 13 | `weight` (on dimension, not criterion) | Numeric, typically 0.5–2.0 |

**Common v2 gaps to check specifically:**
- `examples` key exists but has no `good` or `bad` sub-keys
- `scoring_guide` missing `"0"` or `"4"` (authors skip extremes)
- `decision_tree` is a placeholder like "See scoring guide" (not acceptable)
- `gate: false` written as `gate: {enabled: false}` (style violation, not error, but flag it)

**Error format:**
```
[V2-COMPLETENESS] profiles/solution-architecture.v2.yaml
  Criterion SCP-01:
    MISSING: examples.bad
    INCOMPLETE: scoring_guide missing key "4"
  Criterion TRD-01:
    MISSING: decision_tree (placeholder detected: "Apply scoring guide")
```

---

## Check 3 — ID Uniqueness

**Purpose:** Verify that criterion IDs are unique across the file AND (for profiles) do not conflict with core criterion IDs.

**Core criterion IDs (from `core-meta-rubric.v2.yaml`):** Load the core YAML first; extract all criterion IDs. These are reserved and must not be reused in profiles or overlays.

**Within-file uniqueness:** For each file, collect all criterion IDs under all dimensions. Flag any duplicates.

**Cross-file uniqueness:** IDs in profiles and overlays should not collide with core IDs. Two profile files may use the same ID pattern (e.g., `SCP-01` in two profiles) only if they are genuinely different rubrics — flag these as warnings for human review.

**Rubric ID format check:** All `rubric_id` values must follow `EAROS-[CATEGORY]-[NNN]`:
- Core: `EAROS-CORE-NNN`
- Profiles: `EAROS-[ARTIFACT]-NNN` (e.g., `EAROS-REFARCH-001`)
- Overlays: `EAROS-OVR-[CONCERN]-NNN` (e.g., `EAROS-OVR-SEC-001`)

**Error format:**
```
[ID-UNIQUENESS] profiles/reference-architecture.v2.yaml
  DUPLICATE criterion ID: RA-D1-VIEW-01 appears at dimensions[0].criteria[0] and dimensions[0].criteria[3]

[ID-CONFLICT] profiles/solution-architecture.v2.yaml
  Criterion SCP-01 conflicts with core criterion SCP-01 — use a profile-scoped prefix (e.g., SA-SCP-01)

[ID-FORMAT] overlays/regulatory.v2.yaml
  rubric_id "EAROS-REG-001" does not match overlay pattern EAROS-OVR-[CONCERN]-NNN
```

---

## Check 4 — Cross-Reference Validation

**Purpose:** Verify that `inherits` references and overlay applications are internally consistent.

**Checks to perform:**

1. **Inherits resolution:** Every profile must have `inherits: [EAROS-CORE-002]`. Verify that `EAROS-CORE-002` matches the `rubric_id` in `core/core-meta-rubric.v2.yaml`.

2. **Evaluation record rubric references:** In `examples/*.evaluation.yaml`, the `rubric_id` field must match a rubric that exists in the project. Check that:
   - `rubric_id` in the record matches an actual YAML file's `rubric_id`
   - If `overlays_applied` is listed, each referenced overlay must exist

3. **Dimension weight sum:** Weights don't need to sum to 1.0 (they're relative), but any dimension weight of 0 or negative is a data error.

4. **Gate severity vocabulary:** All `gate.severity` values must be from the allowed set: `none`, `advisory`, `major`, `critical`.

5. **Status threshold consistency:** In `scoring.thresholds`, verify numeric values are consistent with the standard:
   - Pass threshold ≥ 3.2
   - Conditional pass lower bound 2.4
   - Rework threshold < 2.4

**Error format:**
```
[CROSS-REF] profiles/adr.v2.yaml
  inherits references EAROS-CORE-002 but core rubric_id is EAROS-CORE-001 — version mismatch

[CROSS-REF] examples/example-solution-architecture.evaluation.yaml
  overlay_applied "EAROS-OVR-SEC-002" not found in overlays/ directory

[CROSS-REF] profiles/roadmap.v2.yaml
  dimension RM-D3 has weight: 0 — must be positive
```

---

## Check 5 — Evaluation Record Schema

**Purpose:** Verify evaluation record YAML files conform to `standard/schemas/evaluation.schema.v2.json`.

**Required top-level fields:**

| Field | Notes |
|-------|-------|
| `evaluation_id` | Non-empty string |
| `rubric_id` | Must match an existing rubric |
| `evaluation_date` | ISO 8601 date: `YYYY-MM-DD` |
| `artifact_ref` | Must have `title`; `artifact_type`, `owner`, `version` are expected |
| `evaluators` | Non-empty list; each with `name` and `mode` (`agent`/`human`/`hybrid`) |
| `scores` | List of criterion scores |
| `overall_score` | Numeric, 0.0–4.0 |
| `status` | One of: `pass`, `conditional_pass`, `rework_required`, `reject`, `not_reviewable` |

**Per-criterion score required fields:**

| Field | Valid values |
|-------|-------------|
| `criterion_id` | Must match a criterion in the referenced rubric |
| `score` | 0, 1, 2, 3, 4, or "N/A" |
| `evidence_anchor` | Non-empty string (required if score ≠ N/A) |
| `evidence_class` | `observed` \| `inferred` \| `external` |
| `confidence` | `high` \| `medium` \| `low` |
| `rationale` | Non-empty string |

**Common issues in evaluation records:**
- `score` stored as integer but "N/A" stored as null instead of string "N/A"
- `evidence_anchor` missing when score is 0 (still requires a "no evidence found" anchor)
- `status` not matching the computed outcome from gates and score thresholds

**Error format:**
```
[EVAL-SCHEMA] examples/example-solution-architecture.evaluation.yaml
  criterion SCP-01: evidence_anchor is empty — required for all scored criteria
  criterion TRD-01: confidence "medium-high" not in allowed set (high/medium/low)
  overall_score 3.4 with status "conditional_pass" — status should be "pass" at this score
```

---

## Check 6 — Documentation Accuracy

**Purpose:** Verify that documentation files accurately describe the current rubric structure.

**Files to check:**

| Documentation file | What to verify |
|-------------------|----------------|
| `CLAUDE.md` (Section 3 project structure) | File paths mentioned still exist |
| `docs/getting-started.md` | Rubric IDs and criteria counts are current |
| `docs/profile-authoring-guide.v2.md` | Required field list matches v2 criterion fields |
| `README.md` (if exists) | Links and file references are valid |

**Specific checks:**
1. Every file path mentioned in documentation exists on disk
2. Criterion counts mentioned in docs match actual counts in YAML files
3. Rubric IDs mentioned in docs match `rubric_id` fields in YAML files
4. Required field lists in docs match the 13 required v2 fields

**Error format:**
```
[DOCS] docs/getting-started.md
  References "profiles/postmortem.v2.yaml" — file does not exist
  States "EAROS-CORE has 8 criteria" — actual count is 10

[DOCS] CLAUDE.md Section 3
  References "calibration/gold-set/[rubric-id]/" — directory structure does not match
```

---

## Check 7 — YAML Style

**Purpose:** Flag style violations that won't cause parse errors but violate EAROS conventions.

**Style rules (from CLAUDE.md conventions):**

| Rule | Violation to detect |
|------|-------------------|
| Two-space indentation | Four-space or tab indentation |
| Numeric scoring_guide keys quoted | `0:` instead of `"0":` |
| Gate false as `gate: false` | `gate:\n  enabled: false` |
| Multi-line descriptions use `>` block scalar | Long inline strings (>120 chars) without block scalar |
| One list item per line | Multiple items on a single line |
| Kebab-case filenames | Underscores or mixed case in filenames |

**How to detect indentation issues:** Count leading spaces on indented lines. Any line with 4-space or tab indentation is a violation.

**How to detect unquoted numeric keys:** Look for `scoring_guide:` sections where child keys are `0:`, `1:`, `2:`, `3:`, `4:` without quotes.

**Error format:**
```
[YAML-STYLE] profiles/capability-map.v2.yaml
  line 47: scoring_guide key "0" is unquoted — should be "0": not 0:
  line 52: gate disabled with verbose syntax — use gate: false not gate:\n  enabled: false
  line 83: description exceeds 120 chars inline — use > block scalar

[YAML-STYLE] profiles/Capability_Map.v2.yaml
  Filename uses underscores and mixed case — should be kebab-case: capability-map.v2.yaml
```

---

## Validation Summary Format

After running all 7 checks, produce:

```
## EAROS Repository Validation Summary — [date]

| Check | Files Checked | Errors | Warnings | Status |
|-------|--------------|--------|----------|--------|
| 1. Schema conformance | N | N | N | ✅ / ⚠️ / ❌ |
| 2. Criterion v2 completeness | N | N | N | ✅ / ⚠️ / ❌ |
| 3. ID uniqueness | N | N | N | ✅ / ⚠️ / ❌ |
| 4. Cross-reference validation | N | N | N | ✅ / ⚠️ / ❌ |
| 5. Evaluation record schema | N | N | N | ✅ / ⚠️ / ❌ |
| 6. Documentation accuracy | N | N | N | ✅ / ⚠️ / ❌ |
| 7. YAML style | N | N | N | ✅ / ⚠️ / ❌ |

**Overall:** ✅ Clean / ⚠️ Warnings only / ❌ Errors present

**Critical issues (blocking):** [list or "None"]
**Warnings (non-blocking):** [list or "None"]
```

Severity classification:
- **Error (blocking):** Schema violations, missing required fields, duplicate IDs — must fix before governance use
- **Warning (non-blocking):** Style violations, documentation drift — should fix but does not block use
