# Dependency Rules

This file documents what depends on what in the EAROS three-layer model, how to check for conflicts before creating a new rubric, and the profile-vs-overlay decision framework.

---

## The Three-Layer Dependency Model

```
┌──────────────────────────────────────────────────┐
│  OVERLAYS (cross-cutting)                        │
│  security · data-governance · regulatory         │
│  Applied by context, not artifact type           │
├──────────────────────────────────────────────────┤
│  PROFILES (artifact-specific)                    │
│  solution-architecture · reference-architecture  │
│  adr · capability-map · roadmap                  │
│  Each inherits: [EAROS-CORE-002]                 │
├──────────────────────────────────────────────────┤
│  CORE (universal foundation)                     │
│  core-meta-rubric.yaml (EAROS-CORE-002)       │
│  9 dimensions · 10 criteria · gate model         │
└──────────────────────────────────────────────────┘
```

**Dependency direction:**
- Profiles depend on Core: if Core changes, profiles may need updating
- Overlays depend on nothing: they append to whatever base rubric is in use
- Core has no dependencies

---

## Checks Before Creating Each Type

### Before creating a Profile

1. **Does the core exist?**
   - Read `core/core-meta-rubric.yaml`
   - If absent: ask "Do you want to create a core rubric first, or proceed with a standalone profile (without inheriting from core)?"

2. **Does a profile already exist for this artifact type?**
   - List `profiles/` directory
   - If a profile exists: "A profile for [artifact-type] already exists (`profiles/[name].yaml`). Do you want to revise it (bump version) or create a supplementary profile for a specific sub-type?"

3. **What does Core already cover?**
   - Core's 10 criteria cover: stakeholder fit, concern-view mapping, scope & boundaries, viewpoint appropriateness, traceability, internal consistency, risks/assumptions/tradeoffs, compliance, actionability, stewardship
   - **Do not add profile criteria that duplicate these.** Every criterion must add something that Core cannot measure.

4. **Is the artifact type genuinely distinct from existing profiles?**
   - "Platform handover doc" and "solution architecture" might overlap — verify they need different criteria
   - If 70%+ of the criteria you'd write already exist in an existing profile, consider whether a revision is better than a new profile

### Before creating an Overlay

1. **Does a similar overlay already exist?**
   - List `overlays/` directory
   - Check scope: could the new concern be added to an existing overlay as additional criteria?
   - If yes: "The [existing-overlay] already covers [X]. Should we add your concern there, or is it distinct enough to warrant a separate overlay?"

2. **Which profiles will this overlay apply to?**
   - List existing profiles
   - For each profile, confirm: "Does this overlay make sense for a [profile-type]?" — e.g., a "cost transparency" overlay applies to reference architectures and solution architectures but probably not to ADRs
   - Document the intended applicability scope in the overlay's purpose field

3. **Is the concern truly cross-cutting, or artifact-specific?**
   - If the concern only applies to one artifact type, it should be a profile addition, not an overlay
   - Test: "Would you apply this concern when reviewing a capability map? A roadmap? An ADR?" — if the answer is "no" for most types, it's a profile concern

4. **Does the overlay have at least one critical or major gate?**
   - Overlays exist because the concern matters enough to inject into any rubric
   - An overlay with no gates is likely just a checklist — consider whether it's needed at all

### Before creating a Core Rubric

1. **Is modifying EAROS-CORE-002 truly necessary?**
   - Core changes affect every profile and every assessment. This is a governance decision.
   - Ask: "What specific capability does the existing core lack for your use case?"
   - If the answer is artifact-specific, it's a profile, not a core change

2. **Are you replacing or creating a domain-specific core?**
   - Replacing `EAROS-CORE-002`: requires version bump and governance approval
   - Domain-specific core (e.g., `EAROS-CORE-DATAPLATFORM-001`): a parallel core for a specific domain; profiles in that domain would inherit it instead of `EAROS-CORE-002`

3. **ID assignment for a new core:**
   - Pattern: `EAROS-CORE-[DOMAIN]-[NNN]` for domain-specific cores
   - Or bump `EAROS-CORE-002` → `EAROS-CORE-003` for a full replacement

---

## Profile vs. Overlay Decision Framework {#profile-vs-overlay}

Use this when the user is unsure which to create.

### Ask these three questions:

**1. Does it apply to only one artifact type, or many?**
- Only one → profile addition
- Many → overlay candidate

**2. Is it driven by the artifact's purpose, or by external context?**
- Purpose-driven ("capability maps need heat-map coverage") → profile
- Context-driven ("this artifact involves PII data") → overlay

**3. Would a reviewer need it for every artifact of type X, or only sometimes?**
- Always for type X → profile
- Sometimes (when the context warrants it) → overlay

### Decision Matrix

| Criterion applies to... | Driven by... | When needed... | Use |
|------------------------|-------------|----------------|-----|
| One artifact type | Artifact's purpose | Always | Profile |
| Multiple artifact types | External context | Sometimes | Overlay |
| One artifact type | External context | Sometimes | Profile addition OR overlay |
| Multiple types | Artifact purpose | Always | Consider merging into Core |

### Edge Cases

**"Security concerns for solution architectures only":**
- If your security criteria are specific to how solution architectures describe security (e.g., threat model views, security zone diagrams) → add to the solution-architecture profile
- If the concern applies regardless of artifact type (e.g., "any artifact describing authentication must show the control mapping") → overlay

**"Data governance for capability maps specifically":**
- If it's about how capability maps represent data ownership → profile addition
- If it's triggered by "this capability map describes a data platform (context)" → overlay

---

## ID Uniqueness Rules

All criterion IDs must be unique across the entire EAROS repository — not just within the file.

### ID Namespace Check

Before assigning any criterion ID, scan:
1. `core/core-meta-rubric.yaml` — existing IDs: `STK-01`, `STK-02`, `SCP-01`, `CVP-01`, `TRC-01`, `CON-01`, `RAT-01`, `CMP-01`, `ACT-01`, `MNT-01`
2. All files in `profiles/` — check criterion IDs in each
3. All files in `overlays/` — check criterion IDs in each

### ID Patterns by Type

| File type | Rubric ID pattern | Criterion ID pattern |
|-----------|------------------|---------------------|
| Core rubric | `EAROS-CORE-[DOMAIN?]-[NNN]` | `[ABBREV]-[NN]` e.g. `STK-01` |
| Profile | `EAROS-[ARTIFACT]-[NNN]` | `[ARTIFACT-ABBREV]-[TOPIC]-[NN]` |
| Overlay | `EAROS-OVR-[CONCERN]-[NNN]` | `[OVR-ABBREV]-[TOPIC]-[NN]` |

### Examples of Good vs. Conflicting IDs

| Proposed ID | Problem | Fix |
|-------------|---------|-----|
| `STK-01` | Conflicts with core | Use `PM-STK-01` or `PM-OWNER-01` |
| `RA-VIEW-01` | Conflicts with reference-architecture profile | Use `SA-VIEW-01` for solution architecture |
| `REG-ID-01` | Conflicts with regulatory overlay | Use `AI-TRANS-01` for AI transparency overlay |

---

## How Core Changes Ripple to Profiles

If `EAROS-CORE-002` changes (new criteria, revised gates, changed scoring thresholds):

1. **All profiles that `inherits: [EAROS-CORE-002]` are affected** — they will now include the new/changed core criteria automatically
2. **Overlays are unaffected** — they append to the base rubric at runtime
3. **Calibration packs are potentially invalidated** — if scoring thresholds or gate models change, previous calibration results may no longer apply
4. **Worked examples need review** — existing evaluation records in `examples/` may score differently under the new core

This is why core changes require a governance decision. A profile addition is always safer than a core change.

---

## Versioning Rules

### When to bump versions

| Change | Version bump |
|--------|-------------|
| New criterion added | MINOR (e.g. 1.0.0 → 1.1.0) |
| Existing criterion scoring guide revised | MINOR |
| Gate severity changed | MAJOR (e.g. 1.1.0 → 2.0.0) |
| Status threshold changed | MAJOR |
| Criterion removed | MAJOR |
| Typo fix, documentation improvement | PATCH (e.g. 1.1.0 → 1.1.1) |

### Status transitions

```
draft → candidate → approved → deprecated
```

- `draft`: Not calibrated. Must not be used in live governance.
- `candidate`: Calibrated against at least 3 artifacts with 2+ reviewers. Safe for pilot use.
- `approved`: Fully validated and ratified by governance owner.
- `deprecated`: Superseded by a newer version. Existing evaluation records retain the version reference.
