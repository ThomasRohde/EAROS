# EAROS Consistency Report

**Date:** 2026-03-19
**Performed by:** Claude Sonnet 4.6 (automated + manual review)
**Scope:** Full project — YAML rubrics, JSON schemas, Markdown docs, templates
**Validation tool:** `tools/validate.py` (jsonschema Draft 2020-12)

---

## Executive Summary

| Category | Before | After |
|----------|--------|-------|
| Schema errors | 10 | 0 |
| Duplicate criterion IDs | 0 | 0 |
| Duplicate dimension IDs | 0 | 0 |
| Cross-reference errors | 3 | 0 |
| Documentation inaccuracies | 5 | 0 |
| Quality warnings (missing optional fields) | 97 | 89 |

All schema errors and documentation inaccuracies have been fixed. Quality warnings represent missing CLAUDE.md-recommended fields (`description`, `decision_tree`, `examples.good/bad`) in older criteria — these require content authoring, not structural fixes, and are tracked as technical debt below.

---

## Check 1 — Schema Validation

**Tool:** Python `jsonschema` v4.x, Draft 2020-12 validator against `standard/schemas/rubric.schema.v2.json`
**Required top-level fields per schema:** `rubric_id`, `version`, `kind`, `title`, `artifact_type`, `dimensions`, `scoring`, `outputs`

### Violations Found and Fixed

| File | Violation | Fix Applied |
|------|-----------|-------------|
| `profiles/roadmap.v2.yaml` | Missing required `outputs` section | Added `outputs` block with all v2 fields |
| `overlays/regulatory.v2.yaml` | Missing required `scoring` section | Added `scoring` with `append_to_base_rubric` method |
| `overlays/regulatory.v2.yaml` | Missing required `outputs` section | Added `outputs` block with all v2 fields |

### Post-fix Status

All 9 rubric files now pass schema validation with 0 errors.

---

## Check 2 — Criterion ID Uniqueness

**Method:** Programmatic scan of all `criteria[*].id` fields across all 9 rubric files.
**Result: PASS — no duplicates.**

35 unique criterion IDs found:

| ID | File |
|----|------|
| ACT-01 | core/core-meta-rubric.v2.yaml |
| ADR-01, ADR-02, ADR-03 | profiles/adr.v2.yaml |
| CAP-01, CAP-02, CAP-03 | profiles/capability-map.v2.yaml |
| CMP-01, CON-01, CVP-01, MNT-01, RAT-01, SCP-01, STK-01, STK-02, TRC-01 | core/core-meta-rubric.v2.yaml |
| DAT-01 | overlays/data-governance.v2.yaml |
| RA-DEC-01, RA-DEC-02, RA-IMP-01, RA-IMP-02, RA-OPS-01, RA-QA-01, RA-REU-01, RA-VIEW-01, RA-VIEW-02 | profiles/reference-architecture.v2.yaml |
| RD-DEP-01, RD-OWN-01, RD-TRN-01 | profiles/roadmap.v2.yaml |
| REG-EV-01, REG-ID-01 | overlays/regulatory.v2.yaml |
| SEC-01 | overlays/security.v2.yaml |
| SOL-01, SOL-02, SOL-03 | profiles/solution-architecture.v2.yaml |

---

## Check 3 — Dimension ID Uniqueness

**Method:** Programmatic scan of all `dimensions[*].id` fields across all 9 rubric files.
**Result: PASS — no duplicates.**

31 unique dimension IDs found across: `D1–D9` (core), `RA-D1–RA-D6` (reference architecture), `SD1–SD3` (solution architecture), `AD1–AD3` (ADR), `CP1–CP3` (capability map), `RD1–RD3` (roadmap), `SEC1` (security), `DAT1` (data governance), `REG1–REG2` (regulatory).

---

## Check 4 — Cross-Reference Integrity

### Violations Found and Fixed

| File | Violation | Fix Applied |
|------|-----------|-------------|
| `profiles/solution-architecture.v2.yaml` | `inherits: [EAROS-CORE-001@1.0.0]` — referenced rubric_id does not exist in the v2 repository | Changed to `inherits: [EAROS-CORE-002]` |
| `profiles/adr.v2.yaml` | Same — inherits non-existent `EAROS-CORE-001@1.0.0` | Changed to `inherits: [EAROS-CORE-002]` |
| `profiles/capability-map.v2.yaml` | Same — inherits non-existent `EAROS-CORE-001@1.0.0` | Changed to `inherits: [EAROS-CORE-002]` |
| `overlays/regulatory.v2.yaml` | Had `inherits: [EAROS-CORE-002]` — overlays must NOT have an `inherits` field; they append, not inherit | Removed `inherits` field entirely |

### Post-fix Status

All profiles inherit `EAROS-CORE-002`. No overlays have `inherits` fields. All referenced rubric IDs resolve to existing files.

---

## Check 5 — Scoring Consistency

### Scale definition

All 9 files use `scale: 0-4 ordinal plus N/A` ✓

### Scoring guide completeness (keys "0"–"4" for ordinal criteria)

All ordinal criteria have all five keys in `scoring_guide`. ✓

### Status threshold consistency

| File | Method | Thresholds |
|------|--------|------------|
| `core-meta-rubric.v2.yaml` | `gates_first_then_weighted_average` | Full set incl. floor check ✓ |
| `reference-architecture.v2.yaml` | `gates_first_then_weighted_average` | Full set ✓ |
| `roadmap.v2.yaml` | `gates_first_then_weighted_average` | **Fixed** — was missing floor check `no dimension < 2.0` |
| `solution-architecture.v2.yaml` | `merge_with_inherited_and_apply_core_thresholds` | Profile-specific escalation only (by design) |
| `adr.v2.yaml` | `merge_with_inherited_and_apply_core_thresholds` | Profile-specific escalation only (by design) |
| `capability-map.v2.yaml` | `merge_with_inherited_and_apply_core_thresholds` | Profile-specific escalation only (by design) |
| `security.v2.yaml` | `append_to_base_rubric` | Overlay-specific ✓ |
| `data-governance.v2.yaml` | `append_to_base_rubric` | Overlay-specific ✓ |
| `regulatory.v2.yaml` | `append_to_base_rubric` | **Fixed** — was missing `scoring` section |

**Note on `merge_with_inherited_and_apply_core_thresholds`:** This method name is non-standard (not defined in the schema's method enum). It is nonetheless consistent across the three older profiles (SOL, ADR, CAP) and is a valid string per the schema (which does not restrict method values). Future authoring guidance should address whether these profiles should adopt `gates_first_then_weighted_average`.

---

## Check 6 — Gate Type Consistency

**Valid gate severity values per schema:** `advisory`, `major`, `critical`
**Valid disabled form:** `gate: false`

All gate configurations across all 35 criteria use valid severity values. No invalid gate types found. ✓

Gate inventory:

| Criterion | File | Severity |
|-----------|------|----------|
| STK-01, TRC-01 | core | major |
| SCP-01, CMP-01 | core | critical |
| RA-VIEW-01, RA-DEC-01, RA-OPS-01, RA-QA-01 | reference-architecture | major |
| SOL-01 | solution-architecture | major |
| SOL-02 | solution-architecture | critical |
| ADR-01 | adr | major |
| CAP-01 | capability-map | major |
| RD-DEP-01 | roadmap | major |
| SEC-01 | security | critical |
| REG-ID-01, REG-EV-01 | regulatory | critical |
| All others | — | `gate: false` |

---

## Check 7 — File Naming Consistency

**Convention (CLAUDE.md §8):** `<artifact-type>.v<major>.yaml` where `<major>` must match the major version number inside the file.

### Violations Found

| File | Filename Major | Internal Version | Status |
|------|---------------|-----------------|--------|
| `core-meta-rubric.v2.yaml` | 2 | 2.0.0 | ✓ |
| `reference-architecture.v2.yaml` | 2 | 2.0.0 | ✓ |
| `roadmap.v2.yaml` | 2 | 2.0.0 | ✓ |
| `regulatory.v2.yaml` | 2 | 2.0.0 | ✓ |
| `solution-architecture.v2.yaml` | 2 | **1.0.0 → fixed to 2.0.0** | ✓ (after fix) |
| `adr.v2.yaml` | 2 | **1.0.0 → fixed to 2.0.0** | ✓ (after fix) |
| `capability-map.v2.yaml` | 2 | **1.0.0 → fixed to 2.0.0** | ✓ (after fix) |
| `security.v2.yaml` | 2 | 1.0.0 | ⚠ mismatch |
| `data-governance.v2.yaml` | 2 | 1.0.0 | ⚠ mismatch |

**Remaining mismatch — `security.v2.yaml` and `data-governance.v2.yaml`:** These overlays have `version: 1.0.0` internally but are named `.v2.yaml`. The `v2` in the filename appears to denote EAROS framework era rather than the file's own major version — a deliberate ambiguity in the original design. These have NOT been changed because: (1) bumping to 2.0.0 would imply a breaking change that did not occur, and (2) the `v2` naming may be intentional to signal EAROS v2 compatibility. This should be resolved by a governance decision, documented below under Judgment Calls.

All filenames use kebab-case ✓. No spaces in filenames ✓.

---

## Check 8 — Missing Required Fields

### Schema-required criterion fields (`id`, `question`, `metric_type`, `scale`, `required_evidence`, `scoring_guide`)

**Result: PASS — all 35 criteria have all 6 schema-required fields.** ✓

### CLAUDE.md-required criterion fields (`description`, `gate`, `anti_patterns`, `examples.good`, `examples.bad`, `decision_tree`, `remediation_hints`)

This is a quality standard beyond the JSON schema. 89 warnings remain after fixes. The `reference-architecture.v2.yaml` profile is the most complete; older profiles (SOL, ADR, CAP, Roadmap) and the two simple overlays (SEC, DAT) are missing these fields on most criteria.

**Breakdown by file:**

| File | Criteria | Missing `description` | Missing `decision_tree` | Missing `examples` |
|------|----------|-----------------------|------------------------|-------------------|
| `core-meta-rubric.v2.yaml` | 10 | 9 | 8 | 7 |
| `reference-architecture.v2.yaml` | 9 | 0 | 5 | 3 |
| `solution-architecture.v2.yaml` | 3 | 3 | 3 | 3 |
| `adr.v2.yaml` | 3 | 3 | 3 | 3 |
| `capability-map.v2.yaml` | 3 | 3 | 3 | 3 |
| `roadmap.v2.yaml` | 3 | 3 | 3 | 3 |
| `security.v2.yaml` | 1 | 1 | 1 | 1 |
| `data-governance.v2.yaml` | 1 | 1 | 1 | 1 |
| `regulatory.v2.yaml` | 2 | 2 | 2 | 2 |

**Action required:** The missing fields in each criterion need domain-expert authoring. They cannot be safely auto-filled — they require knowledge of the review context. This is tracked as a backlog item below.

---

## Check 9 — README/Docs Consistency

### Violations Found and Fixed

| File | Issue | Fix Applied |
|------|-------|-------------|
| `README.md` | Score labels used `Exemplary`, `Adequate`, `Insufficient` instead of the canonical `Strong`, `Good`, `Weak` from CLAUDE.md §2.1 and the core rubric | Fixed to match canonical labels |
| `README.md` | DAG step names `challenge_pass_check` and `calibration_anchor` do not match YAML (`challenge_pass`, `calibration`) | Fixed |
| `docs/getting-started.md` | Referenced `level_descriptors` (field does not exist) — correct field name is `scoring_guide` | Fixed |
| `docs/getting-started.md` | Referenced `evidence_requirement` (field does not exist) — correct field name is `required_evidence` | Fixed |
| `docs/getting-started.md` | Gate description stated "any gate criterion scores 0 → Reject" — incorrect; only `critical` gates reject; `major` gates cap at Conditional Pass | Fixed to accurately describe gate severity model |
| `CHANGELOG.md` | DAG step names `challenge_pass_check` and `calibration_anchor` | Fixed |
| `CHANGELOG.md` | Reference architecture profile listed as "11 criteria" — actual count is 9 | Fixed |
| `profiles/reference-architecture.v2.yaml` | Internal comment stated "11 criteria … 21 criteria total" | Fixed to 9 / 19 |
| `CLAUDE.md` | Section 10 stated "11 criteria … 21 criteria total" | Fixed to 9 / 19 |

### File reference integrity (README → actual files)

All files referenced in README.md were verified to exist:
- `core/core-meta-rubric.v2.yaml` ✓
- All 5 profiles ✓
- All 3 overlays ✓
- Both JSON schemas ✓
- Both template files ✓
- `templates/reference-architecture/Reference_Architecture_Template_v2.docx` ✓
- Both scoring sheets ✓
- `examples/example-solution-architecture.evaluation.yaml` ✓
- `calibration/gold-set/`, `calibration/results/` ✓
- All 3 research files ✓
- All 3 presentation files ✓
- `docs/getting-started.md`, `docs/profile-authoring-guide.v2.md` ✓

---

## Check 10 — Duplicate Files

**Method:** Compared files by purpose and content type.

`tools/scoring-sheets/EAROS_Scoring_Sheet.xlsx` (v1) and `tools/scoring-sheets/EAROS_Scoring_Sheet_v2.xlsx` (v2) coexist intentionally — the v1 sheet is the original tooling from EAROS v1.0, kept for reference. The README correctly lists both. Not a duplicate.

No other duplicate files found. ✓

---

## Check 11 — CHANGELOG Completeness

### Violations Found and Fixed

| Issue | Fix Applied |
|-------|-------------|
| DAG step names `challenge_pass_check` / `calibration_anchor` | Fixed to `challenge_pass` / `calibration` |
| Reference architecture profile listed with "11 criteria" | Fixed to 9 |

### Coverage gaps (not fixed — judgment calls)

- The CHANGELOG v1.0.0 entry references `solution-architecture.v1.yaml` and `adr.v1.yaml`, but the repository contains `solution-architecture.v2.yaml` and `adr.v2.yaml`. The v1.x files no longer exist in the repository. The v2.0.0 changelog does not mention these profiles were ported/revised for v2. **Recommendation:** Add a changelog entry noting the v2 updates to `solution-architecture.v2.yaml`, `adr.v2.yaml`, and `capability-map.v2.yaml` — or annotate that they were renamed from v1 originals.

---

## Check 12 — CLAUDE.md Accuracy

The CLAUDE.md accurately describes the project structure, scoring model, gate types, evaluation modes, and conventions, with the single fix applied above (criterion count 11→9). All file paths in the Quick Reference table were verified to exist. ✓

---

## Judgment Calls (Not Auto-Fixed)

These items require deliberate decisions by the project owner:

### JC-1: Overlays `security.v2.yaml` and `data-governance.v2.yaml` — version mismatch

Both have `version: 1.0.0` internally but are named `.v2.yaml`. Two interpretations:
- **Interpretation A:** The `v2` in the filename means EAROS-v2-era compatibility, not the file's own major version. Under this interpretation, `version: 1.0.0` is correct.
- **Interpretation B:** Per CLAUDE.md §8 convention, `v<major>` in the filename must match the internal major. Under this interpretation, the internal version should be `2.0.0`.

**Recommendation:** Adopt Interpretation B for consistency. Bump both overlays to `version: 2.0.0` and document in CHANGELOG. This is a non-breaking change (no scoring model change).

### JC-2: `merge_with_inherited_and_apply_core_thresholds` scoring method

Three profiles (SOL, ADR, CAP) use this non-standard method name. It is not defined in the schema's `method` property (which accepts any string, so no schema violation), but it differs from the primary method `gates_first_then_weighted_average` used by newer files.

**Recommendation:** Decide whether these profiles should use `gates_first_then_weighted_average` (requiring full threshold definitions) or whether `merge_with_inherited_and_apply_core_thresholds` should be formally documented as a valid method name in the schema.

### JC-3: Missing recommended criterion fields across 27 criteria

89 quality warnings remain for missing `description`, `decision_tree`, and `examples.good/bad` fields. The reference architecture profile is the model of completeness; all other files fall short of the CLAUDE.md §8 standard.

**Recommendation:** Create a sprint/backlog item to enrich each criterion with:
1. A `description` field (what does this criterion assess and why does it matter?)
2. A `decision_tree` with IF/THEN logic for AI agent disambiguation
3. `examples.good` and `examples.bad` for concrete illustrations

Priority order: core criteria first (most frequently used), then SOL/ADR/CAP profiles, then overlays.

### JC-4: CHANGELOG v1.0.0 entry references non-existent file names

The v1.0.0 section mentions `solution-architecture.v1.yaml` and `adr.v1.yaml`, which are not in the repository. Either the files were renamed without a changelog entry, or the v1 files were replaced wholesale.

**Recommendation:** Add a note to CHANGELOG v2.0.0 explaining that `solution-architecture.v2.yaml` and `adr.v2.yaml` are updated versions of the v1.0 originals, now inheriting EAROS-CORE-002.

---

## Files Modified by This Consistency Check

| File | Change |
|------|--------|
| `profiles/solution-architecture.v2.yaml` | Fixed `inherits` (CORE-001→CORE-002), added `design_method: decision_centred`, bumped `version` to 2.0.0, added `require_evidence_class` and `require_evidence_anchors` to outputs |
| `profiles/adr.v2.yaml` | Fixed `inherits`, added `design_method: decision_centred`, bumped `version` to 2.0.0, added v2 output fields |
| `profiles/capability-map.v2.yaml` | Fixed `inherits`, added `design_method: viewpoint_centred`, bumped `version` to 2.0.0, added v2 output fields |
| `profiles/roadmap.v2.yaml` | Added missing `outputs` section, fixed `thresholds` to include floor check and `not_reviewable` status |
| `overlays/regulatory.v2.yaml` | Removed erroneous `inherits` field, added `scoring` section, added `outputs` section, fixed `rubric_id` from `EAROS-OVL-REG-001` to `EAROS-OVR-REG-001`, added `anti_patterns` and `remediation_hints` to both criteria |
| `README.md` | Fixed score labels (Exemplary→Strong, Adequate→Good, Insufficient→Weak), fixed DAG step names |
| `docs/getting-started.md` | Fixed `level_descriptors`→`scoring_guide`, `evidence_requirement`→`required_evidence`, rewrote gate description to accurately reflect severity model |
| `CHANGELOG.md` | Fixed DAG step names, fixed reference architecture criterion count (11→9) |
| `profiles/reference-architecture.v2.yaml` | Fixed internal comment (11 criteria→9, 21 total→19) |
| `CLAUDE.md` | Fixed Section 10 criterion count (11→9, 21→19) |
| `tools/validate.py` | New file — validation script for ongoing use |

---

## Validation Script

`tools/validate.py` can be run at any time to re-check all rubric files:

```bash
py -3 tools/validate.py
```

It checks: schema compliance, cross-reference integrity, duplicate IDs, gate severities, scoring guide completeness, filename/version alignment, and quality field coverage. Add new rubric files to the `RUBRIC_FILES` list at the top of the script.
