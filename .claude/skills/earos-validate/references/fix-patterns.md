# Fix Patterns -- EAROS Validate

Common validation errors, root causes, and fixes. Read this after finding errors with earos-validate.

---

## How to Use This File

Each section corresponds to an error type from references/validation-checks.md.
Find your error, apply the fix, then re-run the relevant check to confirm.

**Rule:** earos-validate reports; it does not auto-fix. Present fixes to the user for review.

---

## Fix Pattern 1 -- Missing Required Top-Level Fields

Root cause: Profile authored before v2 or copied from an older template without the new fields.

Add missing outputs sub-fields:

    outputs:
      require_evidence_refs: true
      require_confidence: true
      require_actions: true
      require_evidence_class: true
      require_evidence_anchors: true

Add missing calibration block:

    calibration:
      required_before_production: true
      minimum_examples: 3

Add missing change_log:

    change_log:
      - version: 1.0.0
        date: "YYYY-MM-DD"
        author: enterprise-architecture
        notes: "Initial draft"

---

## Fix Pattern 2 -- Wrong scoring.method for Kind

Root cause: Overlay created by copying a profile without updating the scoring method.

Overlays must use:

    scoring:
      method: append_to_base_rubric

Profiles and core rubric must use:

    scoring:
      method: gates_first_then_weighted_average

---

## Fix Pattern 3 -- Missing inherits on Profile

Root cause: Profile created without the inherits declaration. Without this, core criteria are not applied.

Add after the header fields, before design_method:

    inherits:
      - EAROS-CORE-002

---

## Fix Pattern 4 -- Missing Criterion v2 Fields

The 13 required v2 fields must all be present. Common missing fields and fixes:

**decision_tree** -- must have IF/THEN branching logic. Placeholder text is not acceptable:

    decision_tree: >
      IF X absent: score 0.
      IF X present but incomplete: score 1-2 depending on coverage.
      IF X and Y both present with basic detail: score 3.
      IF X and Y present with explicit rationale and evidence: score 4.

**examples.bad** -- must show the actual failure mode text (quotable), not a description of the failure:

    examples:
      good:
        - "Section 4.2 explicitly lists A, B, C as in-scope and D, E as out-of-scope."
      bad:
        - "The scope of this project covers the relevant systems."

**scoring_guide** -- all 5 levels ("0" through "4") must be present and non-empty. Authors most
commonly skip "0" or "4". Level descriptors must be criterion-specific, not generic:

    scoring_guide:
      "0": "No [criterion-specific evidence] present."
      "1": "Mentioned but too vague for decision support."
      "2": "Addressed but incomplete; key elements missing."
      "3": "Clearly addressed with adequate evidence; only minor gaps."
      "4": "Fully addressed, well evidenced, internally consistent."

---

## Fix Pattern 5 -- Invalid gate Configuration

Valid severity values: critical, major, advisory. Other values (high, low, warn, blocker) are invalid.

Disabled gate must use the canonical form:

    gate: false

Not the verbose form (style violation, causes YAML-STYLE warnings):

    gate:
      enabled: false

Enabled gate must have failure_effect explaining what happens when the gate fails:

    gate:
      enabled: true
      severity: major
      failure_effect: >
        Cannot achieve Pass status. Status caps at Conditional Pass
        until this criterion scores >= 2.

Gate distribution targets for a well-designed profile:
- gate: false -- most criteria (60-70%)
- severity: advisory -- 0-3 criteria
- severity: major -- 1-2 criteria
- severity: critical -- 0-1 criteria (reserved for mandatory compliance controls only)

---

## Fix Pattern 6 -- Duplicate Criterion IDs

Root cause: Criterion ID from one profile reused in another, or accidental duplication within a file.

Criterion IDs must be globally unique across all files. Add a profile-specific prefix to resolve collisions:

    # Before: id: SCP-01 (conflicts with core criterion SCP-01)
    # After:
    id: SA-SCP-01

Naming conventions:
- Reference Architecture: RA-[AREA]-NN
- Solution Architecture: SA-[AREA]-NN
- ADR: ADR-[AREA]-NN
- Capability Map: CM-[AREA]-NN
- Roadmap: RM-[AREA]-NN
- Overlays: [PREFIX]-[CONCERN]-NN (e.g., SEC-AUTH-01, DG-CLASS-01)

After renaming: search all evaluation records for the old ID and update them.

---

## Fix Pattern 7 -- Broken Cross-References

**inherits version mismatch:**

Read core/core-meta-rubric.v2.yaml to find the actual rubric_id value. Update the profile to match exactly:

    inherits:
      - EAROS-CORE-002

**Missing overlay in evaluation record:**

Either add the overlay YAML to overlays/ with the referenced ID, or remove the overlay_applied reference
if the overlay was not actually applied.

---

## Fix Pattern 8 -- Evaluation Record Status Inconsistency

Root cause: Status was set manually and not rechecked after scores changed, or gate logic was not applied.

Recompute status from rules (apply in order):
1. Any critical gate failure -> reject (ignore overall_score)
2. Any major gate that caps -> conditional_pass (maximum allowed)
3. overall_score >= 3.2 AND no dimension < 2.0 -> pass
4. overall_score 2.4-3.19 -> conditional_pass
5. overall_score < 2.4 OR any dimension < 2.0 -> rework_required
6. Evidence insufficient to score core gate criteria -> not_reviewable

Example fix:

    # Before (wrong -- score of 3.4 is pass, not conditional_pass)
    status: conditional_pass
    overall_score: 3.4
    gate_failures: []

    # After (correct)
    status: pass
    overall_score: 3.4
    gate_failures: []

---

## Fix Pattern 9 -- Documentation Accuracy

**Stale file references:** Update documentation to remove references to non-existent files,
or create the missing file if it genuinely should exist.

**Wrong criterion counts:** Count every item under criteria: within each dimension block.
Update the documentation claim to match the actual count from the YAML.

**Mismatched rubric IDs:** Read the YAML file to get the exact rubric_id value.
Update documentation to use the exact string -- even minor differences (CORE-001 vs CORE-002) matter.

---

## Fix Pattern 10 -- YAML Style Violations

**Unquoted numeric keys in scoring_guide:**

    # Before (causes parsing issues in some YAML tools)
    scoring_guide:
      0: "Absent"

    # After (EAROS convention)
    scoring_guide:
      "0": "Absent"

**4-space to 2-space indentation:**

    # Before (4-space -- violates EAROS convention)
    dimensions:
        - id: CM-D1
            name: Capability coverage

    # After (2-space -- correct)
    dimensions:
      - id: CM-D1
        name: Capability coverage

**Placeholder decision_tree (no branching logic):**

    # Before (not acceptable)
    decision_tree: "Apply the scoring guide to determine the score."

    # After (valid -- observable conditions, explicit branches)
    decision_tree: >
      IF no capability areas defined: score 0.
      IF 1-2 areas defined with partial coverage: score 1-2.
      IF all relevant areas covered with named owners: score 3.
      IF all areas, owners, maturity levels, and gap analysis present: score 4.

**Verbose gate: false (style violation only, not an error):**

    # Before
    gate:
      enabled: false

    # After
    gate: false

---

## Quick Reference -- Error Code to Fix Pattern

| Error code | Fix pattern |
|-----------|-------------|
| MISSING top-level field | Fix Pattern 1 |
| INVALID scoring.method | Fix Pattern 2 |
| MISSING inherits | Fix Pattern 3 |
| MISSING criterion field | Fix Pattern 4 |
| INVALID gate config | Fix Pattern 5 |
| DUPLICATE ID | Fix Pattern 6 |
| BROKEN cross-reference | Fix Pattern 7 |
| STATUS_INCONSISTENCY | Fix Pattern 8 |
| DOCS accuracy | Fix Pattern 9 |
| YAML-STYLE violations | Fix Pattern 10 |

---

## After Fixing

After applying any fix:
1. Re-run earos-validate on the affected files to confirm the error is resolved
2. If the fix touched scoring thresholds or gate logic, re-run earos-calibrate on any changed profile
3. If a criterion ID changed, search all evaluation records for the old ID and update them
4. Update the changed file change_log with a PATCH version bump and a brief note describing the fix
