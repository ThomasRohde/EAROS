# Validation Checklist

This checklist covers all pre-publication quality checks for a new EAROS rubric file. Run through it before presenting the final YAML to the user and before placing the file in the repository.

---

## Quick Reference — What "Valid" Means

A valid EAROS v2 rubric file:
1. Passes schema validation against `standard/schemas/rubric.schema.v2.json`
2. Has a unique rubric ID and unique criterion IDs (no conflicts across the entire repo)
3. Has the correct YAML structure for its kind (profile, overlay, or core rubric)
4. Has all 13 v2 required fields on every criterion
5. Has a calibrated gate model (not over- or under-gated)
6. Does not duplicate what `EAROS-CORE-002` already covers

---

## Section 1 — Schema and Structure

### Top-level required fields

| Field | Profiles | Overlays | Core rubrics |
|-------|----------|----------|-------------|
| `rubric_id` | ✓ | ✓ | ✓ |
| `version` | ✓ | ✓ | ✓ |
| `kind` | `profile` | `overlay` | `core_rubric` |
| `title` | ✓ | ✓ | ✓ |
| `status` | ✓ | ✓ | ✓ |
| `effective_date` | ✓ | ✓ | ✓ |
| `artifact_type` | specific type | `any` | ✓ |
| `inherits` | `[EAROS-CORE-002]` | **absent** | **absent** |
| `design_method` | ✓ | optional | optional |
| `dimensions` | ✓ | ✓ | ✓ |
| `scoring` | ✓ | ✓ | ✓ |
| `outputs` | ✓ | ✓ | ✓ |

### Scoring section required fields

```yaml
scoring:
  scale: 0-4 ordinal plus N/A
  method: gates_first_then_weighted_average   # profiles and core
  # OR
  method: append_to_base_rubric               # overlays only
  thresholds:
    pass: ...
    conditional_pass: ...
    rework_required: ...
    reject: ...
    not_reviewable: ...
  na_policy: ...
  confidence_policy: ...
```

### Outputs section required fields

```yaml
outputs:
  require_evidence_refs: true
  require_confidence: true
  require_actions: true
  require_evidence_class: true
  require_evidence_anchors: true
```

---

## Section 2 — Criterion Completeness

For **every** criterion in the file, check:

| Field | Present? | Notes |
|-------|----------|-------|
| `id` | | Unique across entire repo |
| `question` | | Observable yes/no or does-the-artifact question |
| `description` | | Why it matters + failure consequence |
| `metric_type: ordinal` | | Must be exactly `ordinal` |
| `scale: [0, 1, 2, 3, 4, "N/A"]` | | Must be exactly this |
| `gate` | | Either `gate: false` or full gate block |
| `required_evidence` | | Concrete observable items, minimum 2 |
| `scoring_guide["0"]` | | Distinct from level 1 |
| `scoring_guide["1"]` | | Distinct from levels 0 and 2 |
| `scoring_guide["2"]` | | Distinct from levels 1 and 3 |
| `scoring_guide["3"]` | | Distinct from levels 2 and 4 |
| `scoring_guide["4"]` | | Distinct from level 3 |
| `anti_patterns` | | Minimum 2 specific patterns |
| `examples.good` | | At least 1 concrete example |
| `examples.bad` | | At least 1 concrete example |
| `decision_tree` | | Covers all five score levels |
| `remediation_hints` | | At least 2 specific actions |

**Scoring guide quality check:**
- No level uses "somewhat", "mostly", "adequate", "sufficient" without defining what sufficient means observably
- Level 2 and level 3 are distinguishable by observable features, not degree words
- Level 4 has a discriminating feature that level 3 lacks (the "excellent but not perfect" problem)

**Decision tree quality check:**
- Every IF condition is observable from the artifact
- Conditions are countable or presence/absence based where possible
- All five score levels are covered

---

## Section 3 — ID Uniqueness

Check before committing. These IDs must be globally unique:

### Rubric-level IDs

- [ ] `rubric_id` does not exist in any other file in `core/`, `profiles/`, or `overlays/`
- [ ] ID follows naming convention:
  - Profile: `EAROS-[ARTIFACT]-[NNN]`
  - Overlay: `EAROS-OVR-[CONCERN]-[NNN]`
  - Core: `EAROS-CORE-[DOMAIN?]-[NNN]`

### Criterion-level IDs

- [ ] Scan all criterion IDs in `core/core-meta-rubric.v2.yaml` — no conflicts
- [ ] Scan all criterion IDs in every file in `profiles/` — no conflicts
- [ ] Scan all criterion IDs in every file in `overlays/` — no conflicts

Known existing criterion IDs (as of v2 baseline):
- Core: `STK-01`, `STK-02`, `SCP-01`, `CVP-01`, `TRC-01`, `CON-01`, `RAT-01`, `CMP-01`, `ACT-01`, `MNT-01`
- Regulatory overlay: `REG-ID-01`, `REG-EV-01`
- Reference architecture profile: `RA-VIEW-01`, `RA-PATT-01`, `RA-REUSE-01`, `RA-IMPL-01`, `RA-OPS-01`, `RA-SLO-01`, `RA-DATA-01`, `RA-SEC-01`, `RA-EVOL-01`

---

## Section 4 — Gate Model Validation

| Check | Target | Max |
|-------|--------|-----|
| `critical` gates | 0–1 | 1 |
| `major` gates | 1–2 | 3 |
| Criteria with `gate: false` | majority | — |

**Red flags:**
- Every criterion has a gate → over-gating; dilutes the signal
- No criteria have any gate → weak governance model; nothing prevents weak artifacts from passing on average
- critical gate without a specific `failure_effect` → will confuse evaluators
- Major gate with `failure_effect` that says "reject" → use critical severity instead

**Gate balance test:**
Imagine an otherwise excellent artifact (scoring 3.5 average) that scores 1 on a gated criterion. Is the gate outcome appropriate?
- If the criterion has `critical` → entire artifact is rejected. Is that right?
- If the criterion has `major` → artifact is capped at `conditional_pass`. Is that right?

---

## Section 5 — Core Overlap Check

The core meta-rubric (`EAROS-CORE-002`) already covers these concerns. **Do not add profile criteria that duplicate them:**

| Core criterion | What it covers |
|----------------|---------------|
| `STK-01` | Stakeholder identification, purpose, decision context |
| `STK-02` | Concern-to-view mapping |
| `SCP-01` | Scope, boundary, assumptions, exclusions |
| `CVP-01` | View fitness for purpose / stakeholder concerns |
| `TRC-01` | Traceability to drivers, requirements, principles |
| `CON-01` | Internal consistency (terminology, interfaces, diagrams) |
| `RAT-01` | Risks, assumptions, constraints, trade-offs |
| `CMP-01` | Standards and policy compliance |
| `ACT-01` | Actionability and implementation readiness |
| `MNT-01` | Ownership, version control, change history |

**Test for each proposed criterion:** "Does the core meta-rubric already ask this question or a very similar one?" If yes, the new criterion is likely redundant.

Acceptable extensions of core criteria (not duplicates):
- A profile criterion that asks about a specific type of view that core doesn't name (e.g., "does the reference architecture include an operational runbook?")
- A criterion that asks about a concern specific to this artifact type that the generic core criterion wouldn't catch

---

## Section 6 — Criteria Count and Dimension Structure

| Type | Min criteria | Max criteria | Min dimensions | Max dimensions |
|------|-------------|-------------|----------------|----------------|
| Profile | 5 | 12 | 2 | 6 |
| Overlay | 2 | 6 | 1 | 3 |
| Core rubric | 8 | 12 | 6 | 10 |

**If criteria count exceeds the max:**
- "Can any criteria be merged? If two criteria are often scored identically, they may be measuring the same thing."
- "Are any criteria measuring something the core already covers?"
- "If the scope is genuinely too large for 12 criteria, should this be two profiles for two distinct artifact sub-types?"

**Dimension weight check:**
- Default weight: `1.0`
- Higher weight (`1.2`–`1.5`): use for dimensions that are the primary quality signal for this artifact type
- Lower weight (`0.7`–`0.9`): use for supplementary dimensions
- At most 2 dimensions should be weighted above `1.0`

---

## Section 7 — Calibration Readiness

Before the file can move from `status: draft` to `status: candidate`:

| Check | Requirement |
|-------|-------------|
| Real artifacts available | Minimum 3: 1 strong, 1 weak, 1 ambiguous |
| Reviewers assigned | Minimum 2 (at least 1 domain expert) |
| Independent scoring planned | Each reviewer scores without seeing others' scores |
| Kappa target set | > 0.70 for well-defined criteria, > 0.50 for subjective |

**Common calibration blockers:**
- Level descriptors too abstract → reviewers can't agree on what level 2 vs. 3 means
- Decision tree missing → agents and reviewers use different logic to reach the same score
- Required evidence too vague → reviewers look for different things in the artifact

---

## Section 8 — File Placement and Naming

| Type | Location | Filename pattern |
|------|----------|-----------------|
| Profile | `profiles/` | `<artifact-type>.v<major>.yaml` |
| Overlay | `overlays/` | `<concern>.v<major>.yaml` |
| Core rubric | `core/` | `<name>.v<major>.yaml` |

Rules:
- Kebab-case filenames (no spaces, no uppercase)
- Version in filename is the major version only: `solution-architecture.v2.yaml`, not `solution-architecture.v2.1.0.yaml`
- Do not use `v1` in the filename for a v2 rubric — if this is the first version of a new profile, it should be `v1.yaml`

---

## Post-Creation Checklist

After the file is placed:

- [ ] Run `earos-validate` to confirm schema conformance and catch any remaining errors
- [ ] Add the new rubric ID to the skills table in `CLAUDE.md` if it changes the "when to use which skill" guidance
- [ ] Create a calibration pack (3+ artifacts) before promoting to `candidate`
- [ ] Add worked evaluation example to `examples/` after first calibration run
- [ ] Update `CHANGELOG.md` with the new rubric entry
