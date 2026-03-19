---
name: earos-profile-author
description: Technical YAML authoring guide for EAROS profiles and overlays. Use this skill when someone has already completed rubric design (criteria defined, design method chosen) and needs help with the YAML structure, v2 field requirements, or schema compliance. Also triggers when someone asks "what are the 5 design methods", "how do I write a criterion", "what fields does a v2 criterion need", or "how do I structure overlay YAML". NOTE: For creating new rubrics from scratch — where the criteria are not yet defined — use earos-create instead. This skill focuses on the technical details of profile YAML authoring after rubric design is complete.
---

# EAROS Profile Author Skill

You are guiding the creation of a new EAROS profile or overlay. This is a governed authoring process — the result must be valid YAML that passes schema validation and can be calibrated against real artifacts before production use.

**Why this matters:** A profile that is ambiguous, over-gated, or missing level descriptors will produce unreliable assessments — different reviewers will score the same artifact differently, governance decisions will be arbitrary, and the framework loses credibility. The process below exists to prevent this. Every field, every example, every decision tree entry is there to increase scoring reproducibility.

**Before drafting criteria:** Read `references/design-methods.md` to understand which method fits this artifact type. Read `references/criterion-writing-guide.md` before writing any criteria.

---

## Step 0 — Load Reference Files

Before writing any YAML, read:
1. `templates/new-profile.template.yaml` — scaffold to start from
2. `core/core-meta-rubric.yaml` — understand what core covers (don't duplicate it)
3. `profiles/reference-architecture.yaml` — the model profile; use as reference implementation
4. `standard/schemas/rubric.schema.json` — schema all YAML files must conform to

Ask: **Are you creating a profile (artifact-specific) or an overlay (cross-cutting concern)?**

- **Profile**: inherits from `EAROS-CORE-002`; for a distinct, recurring artifact type
- **Overlay**: does not inherit; applies to any artifact type; uses `scoring.method: append_to_base_rubric`

---

## Step 1 — Qualify the Need

Before writing any YAML, ask these qualification questions. A profile that skips qualification produces criteria that duplicate the core or don't fit the artifact type.

1. What artifact type is this for?
2. Why is the core meta-rubric alone insufficient — what concerns does it miss that genuinely matter for this type?
3. Do 3–5 real examples exist? (Required for calibration. If not, proceed with `status: draft` and a caveat.)
4. Who are the primary reviewers?
5. What is the key quality failure mode — what does a bad version of this artifact typically lack?

Document the answers — they drive `purpose`, `stakeholders`, and criterion content.

---

## Step 2 — Choose a Design Method

> **Read `references/design-methods.md`** for detailed guidance on each method, including when to use it, what the resulting profile structure looks like, and examples from existing profiles.

| Method | Label | Best For |
|--------|-------|----------|
| A | Decision-Centred | ADRs, investment reviews, exception requests |
| B | Viewpoint-Centred | Capability maps, reference architectures, solution architectures |
| C | Lifecycle-Centred | Transition designs, roadmaps, handover docs |
| D | Risk-Centred | Security, regulatory, resilience architecture |
| E | Pattern-Library | Recurring reference patterns, platform services |

---

## Step 3 — Assign a Rubric ID

Check existing IDs in `core/`, `profiles/`, and `overlays/` to avoid conflicts:
- Profiles: `EAROS-<ARTIFACT>-<NNN>` (e.g., `EAROS-POSTMORTEM-001`)
- Overlays: `EAROS-OVR-<CONCERN>-<NNN>` (e.g., `EAROS-OVR-RESILIENCE-001`)

---

## Step 4 — Define Dimensions and Criteria

**Hard constraints:**
- Core already covers 10 criteria across 9 dimensions — do NOT duplicate these
- Add **5–12 new criteria only** — fewer criteria = more reliable calibration
- Group into **2–6 new dimensions** specific to this artifact type

> **Read `references/criterion-writing-guide.md`** before interviewing the user on criteria. It contains the criterion definition interview, gate guidance with examples, and complete/incomplete criterion examples.

For each criterion, run the criterion definition interview:
1. What is the specific quality question? (→ `question`)
2. Why does this matter — what goes wrong when it's absent? (→ `description`)
3. What observable evidence at each level 0–4? (→ `scoring_guide`)
4. What direct evidence would you look for in the artifact? (→ `required_evidence`)
5. Good example? (→ `examples.good`)
6. Bad example / common failure? (→ `examples.bad`, `anti_patterns`)
7. Decision tree for scoring? (→ `decision_tree`)
8. Is this a gate? If yes, severity and effect? (→ `gate`)

Gate guidance (full detail in `references/criterion-writing-guide.md#gate-guidance`):
- Not every criterion needs a gate — over-gating creates false rejects
- Reserve `critical` for compliance-level failures only
- Use `major` for the most important quality dimension
- Target: at most 1–2 `major` gates; 0–1 `critical` gates per profile

---

## Step 5 — Generate the YAML

Generate the full profile YAML. Start from `templates/new-profile.template.yaml`:

```yaml
rubric_id: EAROS-[ARTIFACT]-001
version: 1.0.0
kind: profile
title: "[Artifact Type] Profile"
status: draft
effective_date: "[today's date]"
next_review_date: "[6 months from today]"
owner: enterprise-architecture
artifact_type: [artifact_type_snake_case]
inherits:
  - EAROS-CORE-002
design_method: [method_id]

purpose:
  - [purpose statement]

stakeholders:
  - [stakeholder]

dimensions:
  - id: [ARTIFACT-D1]
    name: [Dimension Name]
    description: "[description]"
    weight: 1.0
    criteria:
      - id: [ARTIFACT-CRT-01]
        question: "[scoring question]"
        description: >
          [detailed description and why it matters]
        metric_type: ordinal
        scale: [0, 1, 2, 3, 4, "N/A"]
        gate:
          enabled: true
          severity: major
          failure_effect: "[effect]"
        required_evidence:
          - [evidence item]
        scoring_guide:
          "0": "[Absent]"
          "1": "[Weak]"
          "2": "[Partial]"
          "3": "[Good]"
          "4": "[Strong]"
        anti_patterns:
          - [bad pattern]
        examples:
          good:
            - "[Strong evidence example]"
          bad:
            - "[Absent/weak evidence example]"
        decision_tree: >
          IF [condition] THEN score [N].
        remediation_hints:
          - [specific improvement action]

scoring:
  scale: 0-4 ordinal plus N/A
  method: gates_first_then_weighted_average
  thresholds:
    pass: No critical gate failure, overall >= 3.2, no dimension < 2.0
    conditional_pass: No critical gate failure, overall 2.4-3.19
    rework_required: Overall < 2.4 or repeated weak dimensions
    reject: Critical gate failure or mandatory control breach
    not_reviewable: Evidence insufficient for core gate criteria
  na_policy: Exclude N/A criteria from denominator; evaluator must justify N/A
  confidence_policy: Confidence reported separately, must not modify score

outputs:
  require_evidence_refs: true
  require_confidence: true
  require_actions: true
  require_evidence_class: true
  require_evidence_anchors: true

calibration:
  required_before_production: true
  minimum_examples: 3

change_log:
  - version: "1.0.0"
    date: "[today]"
    author: "[author]"
    changes:
      - Initial profile for EAROS v2.0
```

---

## Step 6 — Pre-Publication Checks

> **Read `references/profile-checklist.md`** for the complete validation checklist before saving the file.

Quick summary:
- Every criterion has all 13 v2 required fields
- No criterion IDs duplicate existing IDs across `core/`, `profiles/`, `overlays/`
- Gate assignments are deliberate (1–2 major, 0–1 critical maximum)
- Profile YAML validates against `standard/schemas/rubric.schema.json`

---

## Step 7 — Calibration Checklist

Give the user this checklist:

```
Pre-Calibration
[ ] 3+ real artifacts collected (1 strong >= 3.2, 1 weak < 2.4, 1 ambiguous borderline)
[ ] 2+ reviewers identified
[ ] YAML complete and schema-valid

Calibration
[ ] Each reviewer scores each artifact independently
[ ] Cohen's kappa computed per criterion (target > 0.70 well-defined, > 0.50 subjective)
[ ] Disagreements of >= 2 points identified and resolved against level descriptors
[ ] If kappa < 0.50 for any criterion: revise or split the criterion

Post-Calibration
[ ] Profile status changed: draft -> candidate
[ ] Worked evaluation example added to examples/
[ ] CHANGELOG.md updated
```

---

## Step 8 — File Placement

- Profiles: `profiles/<artifact-type>.yaml` (kebab-case, lowercase)
- Overlays: `overlays/<concern>.yaml`
- Examples: `examples/example-<artifact-type>.evaluation.yaml`

Remind the user: "Validate the YAML against `standard/schemas/rubric.schema.json` before committing. Use `earos-validate` to run the full repo health check after adding the profile."

---

## Non-Negotiable Rules

1. **Never add more than 12 criteria.** If you think you need more, split into two profiles.
2. **Every criterion must have all 13 v2 fields.** Incomplete criteria are harder to calibrate.
3. **Calibrate before production.** `status: draft` must not be used in a live governance process.
4. **Overlays do not inherit.** They use `scoring.method: append_to_base_rubric` and have no `inherits` field.
5. **Be opinionated on gates.** Under-gating lets bad designs pass; over-gating rejects good ones on technicalities.

---

## When to Read Which Reference File

| When | Read |
|------|------|
| Choosing a design method | `references/design-methods.md` |
| Drafting criteria (any stage) | `references/criterion-writing-guide.md` |
| Setting gate types and weights | `references/criterion-writing-guide.md#gate-guidance` |
| Before publishing | `references/profile-checklist.md` |
| Unsure if criteria overlap with core | Check `core/core-meta-rubric.yaml` |
