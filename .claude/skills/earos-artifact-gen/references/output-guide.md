# Output Guide — EAROS Artifact Generator

How to transform interview answers into a structured artifact YAML that conforms to `standard/schemas/artifact.schema.json` and satisfies EAROS rubric evidence requirements.

---

## Core Principle: Schema is the Contract

The `artifact.schema.json` is derived from the `required_evidence` fields of the EAROS rubrics. Every required field in the schema maps directly to evidence that a rubric criterion needs. Filling the schema correctly means satisfying the evidence requirements. Do not add sections not in the schema; do not omit required sections.

Before generating output:
1. Read `standard/schemas/artifact.schema.json` to confirm the required fields for the artifact type.
2. Verify your interview answers cover each required section.
3. Flag any gaps as `[TBD: <description>]` rather than omitting them.

---

## YAML Structure Overview

Every artifact YAML begins with a metadata block, then sections that map to the schema:

```yaml
kind: artifact
artifact_type: <type>          # solution_architecture | reference_architecture | adr | capability_map | roadmap
schema_version: "1.0.0"
rubric_id: <id>                # e.g., EAROS-CORE-002 + EAROS-SA-001

metadata:
  title: ""
  version: ""
  status: draft                # draft | candidate_for_review | approved | deprecated
  owner: ""
  authors: []
  reviewers: []
  created_date: ""
  last_updated: ""
  review_date: ""
  supersedes: ""               # Previous version or document, if any
  audience: []                 # List of intended reader groups

# Sections below vary by artifact_type — see per-type guidance
```

---

## Section-by-Section Transformation Rules

### business_context

**From interview:** Business drivers, goals, constraints from Block 2.

**YAML structure:**
```yaml
business_context:
  problem_statement: >
    [One paragraph. What problem this architecture solves. What would happen without it.]
  business_drivers:
    - id: BD-01
      driver: ""              # Name of the driver
      description: ""         # Why it matters
      priority: high          # high | medium | low
  goals:
    - id: G-01
      goal: ""
      measurable_outcome: "" # How success will be measured
  constraints:
    - type: regulatory        # regulatory | technical | commercial | timeline | resource
      constraint: ""
      impact: ""
```

**Quality check:** Every architectural decision in `key_decisions` should reference at least one business driver by ID. If it can't, the decision may lack justification.

---

### stakeholders

**From interview:** Stakeholder identification from Block 1 and Block 2.

**YAML structure:**
```yaml
stakeholders:
  - role: ""                  # e.g., "Architecture Review Board"
    concerns:
      - ""                    # Primary concern
    questions:
      - ""                    # Key question they want answered
    addressed_in: []          # Section IDs or names where concerns are addressed
```

**Scoring rule (STK-01):** Score 3 requires: role, at least one concern per stakeholder, and a cross-reference to where in the document their concern is addressed. A list of names with no concerns scores 1.

---

### scope

**From interview:** Scope and boundary answers from Block 1.

**YAML structure:**
```yaml
scope:
  in_scope:
    - ""                      # List items clearly — systems, functions, data domains
  out_of_scope:
    - item: ""
      rationale: ""           # Why excluded — do not omit the rationale
  deferred:
    - item: ""
      target_phase: ""        # When this will be addressed
  assumptions:
    - id: ASM-01
      assumption: ""
      owner: ""               # Who is responsible for validating this
      validation_status: open # open | validated | invalidated
```

**Scoring rule (SCP-01):** Score 3 requires an explicit out-of-scope list with rationale. Score 4 requires assumptions listed and validated. Scope stated only as goals (not as boundaries) scores 1.

---

### architecture_views

**From interview:** Views and components from Block 3.

**YAML structure:**
```yaml
architecture_views:
  context_view:
    description: >
      [Prose describing the system boundary and external actors.]
    external_actors:
      - name: ""
        type: system           # system | user | external_service
        interaction: ""        # What it sends/receives
    diagram_ref: ""            # Path or URL to diagram file, if available

  functional_view:
    description: >
      [Prose overview of the functional decomposition.]
    components:
      - id: COMP-01
        name: ""
        responsibility: ""     # One sentence
        technology: ""         # Optional — framework, language, service
        interfaces:
          - direction: inbound # inbound | outbound
            protocol: ""       # REST, gRPC, event, batch, etc.
            consumer_provider: ""
    diagram_ref: ""

  deployment_view:
    description: >
      [Prose describing where and how the system runs.]
    infrastructure:
      - name: ""
        type: ""               # cloud, on-prem, hybrid
        provider: ""           # AWS, Azure, GCP, etc.
        region: ""
    topology_notes: >
      [Network layout, segmentation, zones, redundancy.]
    diagram_ref: ""

  data_flow:
    primary_flow:
      description: >
        [Prose walkthrough of the primary success scenario.]
      steps:
        - step: 1
          from: ""
          to: ""
          action: ""
          data: ""             # What is being passed
    secondary_flows: []        # Additional flows (async, batch, error)
    sensitive_data:
      - data_type: ""
        classification: ""     # e.g., PII, PCI, internal
        enters_at: ""          # Component or interface
        exits_at: ""           # Where it leaves or is discarded
```

**Scoring rule (RA-VIEW-01):** Score 2 requires 2–3 views. Score 3 requires all four views with adequate prose. Score 4 requires cross-references between views and a security data flow.

---

### key_decisions

**From interview:** Design decisions from Block 4.

**YAML structure:**
```yaml
key_decisions:
  - id: DEC-01
    title: ""                  # Short name for the decision
    driver: BD-01              # Reference to a business_driver ID
    status: accepted           # accepted | proposed | superseded
    context: >
      [Why this decision was needed — what requirement or constraint forced a choice.]
    options_considered:
      - option: ""
        description: ""
        rejection_reason: ""
    selected_option: ""
    rationale: >
      [Why the selected option was chosen. Reference the driver and constraints.]
    tradeoffs_accepted: >
      [What was given up — be honest.]
    adr_ref: ""                # Path to full ADR if one exists
```

**Scoring rule (RAT-01):** Score 1 if decisions are stated without alternatives. Score 3 if each decision has at least two alternatives with rejection rationale. Score 4 if tradeoffs are quantified and linked to business drivers.

**Common mistake:** "We chose X" with no context. Always ask: what drove the choice? what was rejected? what was the cost?

---

### quality_attributes

**From interview:** NFRs and measurability from Block 5.

**YAML structure:**
```yaml
quality_attributes:
  - id: QA-01
    attribute: availability    # availability | performance | scalability | security | maintainability | etc.
    target: ""                 # MUST be measurable: "99.9% monthly uptime"
    measurement: ""            # How it is measured: "Datadog uptime monitoring"
    architectural_response: "" # What in the design delivers this target
    realised_by: []            # Component IDs that deliver this QA
    validation:
      method: ""               # load_test | dr_drill | security_assessment | none
      status: ""               # validated | planned | not_yet_tested
      evidence_ref: ""         # Link or reference to validation results
```

**Scoring rule (RA-QA-01):** "High availability" scores 0–1. "99.9% monthly uptime (< 8.7h/year)" scores 2–3. "99.9% uptime, measured by Datadog, delivered by active-active across 2 AZs, validated in DR drill 2025-11-15" scores 4.

---

### risks

**From interview:** Risk identification from Block 2 and operational concerns from Block 6.

**YAML structure:**
```yaml
risks:
  - id: RSK-01
    risk: ""                   # Clear risk statement: what could go wrong
    likelihood: medium         # high | medium | low
    impact: high               # high | medium | low
    mitigation: ""             # Specific control or mechanism in place
    owner: ""
    status: open               # open | mitigated | accepted | transferred
  assumptions_at_risk:
    - assumption_id: ASM-01
      risk_if_false: ""
```

---

### compliance

**From interview:** Compliance and governance from Block 7.

**YAML structure:**
```yaml
compliance:
  applicable_standards:
    - standard: ""             # e.g., PCI DSS v4.0, GDPR, ISO 27001
      scope: ""                # How/why this standard applies
      applicable_requirements:
        - requirement: ""      # Specific clause or requirement
          satisfied_by: ""     # Component or mechanism that satisfies it
          evidence_ref: ""     # Link to evidence (DPIA, pen test, etc.)
  compliance_gaps:
    - requirement: ""
      gap: ""
      remediation_plan: ""
      owner: ""
      target_date: ""
  reviews_conducted:
    - type: ""                 # DPIA | security_assessment | legal_review | etc.
      date: ""
      outcome: ""
      ref: ""
```

**Gate behaviour:** If the security or regulatory overlay is applied, compliance criteria often have critical gates. A compliance section that lists standards without evidenced controls will fail the gate.

---

### implementation_guidance

**From interview:** Next steps and phasing from Block 8.

**YAML structure:**
```yaml
implementation_guidance:
  phases:
    - id: PHASE-1
      name: ""
      deliverable: ""
      dependencies: []         # IDs of other phases or external items
      target_date: ""
  interface_contracts:
    - id: IFC-01
      interface: ""            # e.g., "POST /payments"
      consumer: ""
      provider: ""
      protocol: ""
      spec_ref: ""             # Link to OpenAPI spec, event schema, etc.
      sla: ""
  open_decisions:
    - id: OD-01
      decision: ""
      owner: ""
      target_date: ""
      options: []
  next_steps:
    - action: ""
      owner: ""
      due: ""
```

---

## Transformation Quality Checklist

Before finalising the YAML, verify:

- [ ] Every `key_decision` references a `business_driver` ID
- [ ] Every `quality_attribute` has a measurable `target` (not just an aspiration)
- [ ] Every `stakeholder` has at least one `concern` and an `addressed_in` reference
- [ ] `scope.out_of_scope` has at least one entry with `rationale`
- [ ] `compliance` section exists if the system handles personal data, financial data, or operates in a regulated domain
- [ ] `deployment_view` includes topology notes with network segmentation information
- [ ] `data_flow.sensitive_data` is populated if the system processes classified data
- [ ] All `[TBD: ...]` placeholders are visible (not silently omitted)
- [ ] No field contains only aspirational text ("high performance", "highly available", "secure by design") without a measurable qualifier

---

## TBD Conventions

Use `[TBD: <context>]` consistently. Include enough context for a reviewer to understand what is needed:

```yaml
# Good TBD
target: "[TBD: SLA target not yet agreed — owner: Product, target date: 2026-04-01]"

# Poor TBD
target: "[TBD]"
```

Never use `null` or omit a required field silently. TBD is preferable to omission because it signals a known gap rather than a missing answer.

---

## Post-Generation Validation

After generating the YAML:

1. **Schema check** — confirm all required fields from `artifact.schema.json` are present.
2. **Evidence check** — for each rubric criterion's `required_evidence` list, confirm the YAML contains the evidence item.
3. **Gate check** — identify any gate criteria whose required evidence is absent or TBD; these are likely to fail in review.
4. **Offer earos-assess** — "Would you like me to run a preliminary `earos-assess` on this artifact before you finalize it?"

A complete artifact YAML that passes the schema check and covers all `required_evidence` items should score at minimum 2 on every criterion — no surprises in review.
