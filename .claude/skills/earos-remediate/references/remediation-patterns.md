# Remediation Patterns — EAROS Remediation Skill

This reference contains common improvement patterns per dimension, effort estimation guidance, and before/after examples. Read this before Step 3 (triage) and when generating actions for a specific dimension.

---

## How to Use This File

For each priority criterion, find the matching dimension below. The patterns describe the most common root causes and fixes. They are templates — always tailor the action to reference the specific artifact sections and content identified in the evaluation record.

---

## Effort Estimation Guidelines

Use these when assigning effort to each action:

| Label | Meaning | Typical work |
|-------|---------|-------------|
| `quick fix` | < 1 hour | Add a missing table, label an existing diagram, add a sentence of justification, fill a missing metadata field |
| `moderate` | Half day (3–5 hours) | Add a new section, create a stakeholder/traceability matrix, document quality attribute scenarios, write a decision rationale |
| `significant rework` | 1+ days | Redesign a component boundary, produce a missing architectural view, restructure the scope definition, develop a full DR plan |

**Key rule:** If the rubric's `scoring_guide` says "score 2 requires X and Y but you're missing Y", and Y is a table or a paragraph, that is typically a `quick fix` or `moderate`. If Y is a diagram or a new section that doesn't exist yet, that is `moderate` to `significant rework`.

---

## Dimension Patterns

### D1 — Stakeholder Identification and Fit (STK-01)

**Common root causes of low scores:**
- Stakeholders listed by role title only, with no concerns or information needs documented
- Missing key stakeholder groups (operations, security, compliance) that the architecture impacts
- Stakeholder table exists but is disconnected from the architecture decisions

**Pattern — Missing stakeholder table:**
```
Add a stakeholder table with columns: Role | Primary Concerns | Key Questions |
How This Architecture Addresses Them. Include at minimum: sponsoring business unit,
delivery/engineering team, operations team, and security/compliance representatives.
```

**Pattern — Stakeholders listed without concerns:**
```
Extend the existing stakeholder list to include a "concerns" column for each
stakeholder. For each concern, add a cross-reference to the section of the document
that addresses it. This transforms a nominal list into a decision-relevant index.
```

**Before (score 1):** "Stakeholders: Architecture Board, Development Team, Operations"

**After (score 3):** Stakeholder table with role, primary concern, secondary concern, and a reference to the section that addresses each concern.

**Effort:** `quick fix` if stakeholders are identified but concerns are missing; `moderate` if stakeholders themselves are incomplete.

---

### D2 — Scope and Boundaries (SCP-01)

**Common root causes of low scores:**
- Scope described in terms of business goals only, with no explicit technical boundary
- Missing in-scope / out-of-scope list
- System context diagram absent or not linked to the scope statement

**Pattern — Absent scope boundary:**
```
Add a "Scope and Boundaries" section before Section 1 (or in the executive summary).
Structure it as:
  IN SCOPE: [list of systems, functions, data domains included]
  OUT OF SCOPE: [explicit exclusions with a one-line rationale for each]
  DEFERRED: [items acknowledged but explicitly not addressed in this version]
This prevents scope creep during review and gives the architecture a clear review target.
```

**Pattern — Scope stated but no system context diagram:**
```
Add a C4 Level 1 context diagram (or equivalent) showing the system under design as
a box, with all external actors and systems that interact with it. Label each
relationship. This makes the scope statement visual and reviewable.
```

**Before (score 1):** "This architecture covers the payments platform."

**After (score 3):** Explicit in-scope/out-of-scope list plus a context diagram showing the payments platform boundary and all integrating systems.

**Effort:** `quick fix` for in/out-of-scope list; `moderate` for adding context diagram.

---

### D3 — Traceability (TRC-01)

**Common root causes of low scores:**
- Architecture decisions not linked to the business drivers that motivated them
- Quality attribute requirements present but no mapping to how the architecture satisfies them
- Multiple layers (capability → component → deployment) without cross-references

**Pattern — Missing driver-to-component traceability:**
```
Add a traceability table in [Section X] with columns:
  Business Driver / Requirement | Architectural Decision | Realizing Component(s) | Evidence
For each row, link the driver (from Section 1) to the decision that responds to it
(either inline or in an ADR reference) and the component(s) that implement it.
```

**Pattern — Quality attributes defined but not satisfied:**
```
For each quality attribute scenario in [Section Y], add a "Satisfied by" row that
names the specific architectural mechanism (e.g., "Availability 99.9%: satisfied
by active-active deployment in regions A and B, described in Section 5.3").
```

**Before (score 1):** Quality attribute targets listed in a table with no linkage to architecture decisions.

**After (score 3):** Each quality attribute scenario has a mechanism reference, and the architecture section explicitly states how it satisfies it.

**Effort:** `moderate` (building a traceability matrix from scratch). `quick fix` if cross-references just need to be added to existing content.

---

### D4 — Internal Consistency (CON-01)

**Common root causes of low scores:**
- Component names differ between diagrams and prose sections
- Data flows in the sequence diagram contradict the component diagram interfaces
- Scope statement includes elements not shown in any diagram

**Pattern — Name inconsistency:**
```
Create a glossary or component index (can be a table) that lists every named
component exactly once with its canonical name. Replace all alternate names or
abbreviations in diagrams and prose with the canonical name. Treat this as the
document's namespace.
```

**Pattern — Diagram-prose contradiction:**
```
Audit Section [X] against Diagram [Y]: for each component in the diagram, verify
that the prose description uses the same name and describes the same interfaces.
Note and resolve every discrepancy found. Common issue: the diagram was updated
after the prose was written.
```

**Effort:** `quick fix` for renaming; `moderate` if diagrams need to be redrawn.

---

### D5 — Rationale and Decision Quality (RAT-01)

**Common root causes of low scores:**
- Architecture decisions stated without alternatives considered
- Single option presented as though no choice existed
- Tradeoffs acknowledged but not quantified or substantiated

**Pattern — Missing alternatives:**
```
For each major architectural decision in [Section X], add an "Alternatives Considered"
subsection with:
  Option A: [name] — [one-line description] — Rejected because [reason]
  Option B: [name] — [one-line description] — Rejected because [reason]
  Selected: [name] — [rationale tied to the driving constraints]
This documents that a real choice was made, not just a default selection.
```

**Pattern — Tradeoffs stated but not evidenced:**
```
Replace vague tradeoff statements ("this approach offers better scalability") with
quantified or observable claims ("this approach scales horizontally without schema
migration, which satisfies the 10× traffic growth requirement from Business Driver 3 —
validated in load test from [date/link]").
```

**Before (score 1):** "We chose Kafka for messaging."

**After (score 3):** Decision section with the driving requirement, two alternatives with rejection rationale, and the selected option linked to a specific non-functional requirement.

**Effort:** `moderate` per decision. If 3+ decisions need this treatment: `significant rework`.

---

### D6 — Compliance and Governance Fit (CMP-01)

**Common root causes of low scores:**
- No reference to mandatory standards, policies, or control frameworks
- Compliance section present but not linked to specific architecture decisions
- Security or data controls described generically without mapping to requirements

**Pattern — Missing compliance references:**
```
Add a "Standards and Compliance" section listing:
  - Applicable standards: [e.g., ISO 27001, PCI DSS, internal policy X]
  - For each standard: which sections of this architecture address it
  - Controls implemented: [list with mechanism and location in the design]
  - Controls deferred: [list with owner and target date]
```

**Pattern — Compliance section exists but not connected:**
```
For each compliance requirement in [Section X], add a "Satisfied by" reference
pointing to the specific component or mechanism in the architecture that implements
it. A compliance section that lists requirements without showing how the architecture
satisfies them scores 1, not 2.
```

**Effort:** `moderate` if compliance requirements are known but not documented; `significant rework` if the architecture has unaddressed control gaps.

---

### D7 — Maintainability and Evolution (MNT-01)

**Common root causes of low scores:**
- No version history or changelog
- Owner not named
- No documented process for updating the artifact

**Pattern — Missing metadata:**
```
Add a document control table at the top of the artifact:
  Title | Version | Status | Owner | Last Updated | Review Date
  Change Log:
    [version] | [date] | [author] | [change summary]
This is a quick fix that immediately improves MNT-01.
```

**Effort:** `quick fix` — this is almost always a metadata gap, not a content gap.

---

### D8 — Actionability (ACT-01)

**Common root causes of low scores:**
- No next steps or implementation guidance
- Recommendations listed without owners or timelines
- Decision-ready content buried in appendices without a clear summary

**Pattern — Missing next steps:**
```
Add a "Next Steps and Implementation Guidance" section at the end of the document:
  - Immediate actions (within sprint / next 2 weeks)
  - Decisions outstanding (with owner and deadline)
  - Assumptions that need validation before implementation begins
  - Dependencies on external teams or systems
```

**Effort:** `quick fix` to `moderate` depending on whether implementation guidance already exists in fragments.

---

### D9 — Clarity and Communication (CLR-01)

**Common root causes of low scores:**
- Dense jargon without a glossary
- Diagrams present but not explained in prose
- No executive summary for non-technical stakeholders

**Pattern — Missing executive summary:**
```
Add a 1-page executive summary at the beginning that covers:
  - What problem this architecture solves (1–2 sentences)
  - The key design decisions and their rationale (3–5 bullets)
  - What this means for delivery (timeline, risks, dependencies)
This makes the document accessible to stakeholders who will not read the full detail.
```

**Pattern — Diagrams without prose explanation:**
```
For each diagram in the document, add a numbered walkthrough immediately below it
(e.g., "① The API gateway receives the request → ② Routes to the appropriate
microservice → ③ ..."). This forces the author to validate the diagram and
dramatically improves reviewer comprehension.
```

**Effort:** `quick fix` for glossary and diagram walkthroughs; `moderate` for executive summary.

---

## Cross-Cutting Patterns

### Adding a traceability matrix (general)

A traceability matrix is the single highest-value addition to most architecture artifacts. The minimum viable version:

| Source | Criterion Addressed | Document Section | Evidence Type |
|--------|-------------------|-----------------|---------------|
| Business Driver 1 | TRC-01, RAT-01 | Section 2.1 | Observed |
| NFR: 99.9% availability | ACT-01, RA-QA-01 | Section 4.3 | Observed |
| Compliance: PCI DSS Req 6 | CMP-01 | Section 6.2 | Observed |

### Adding quality attribute scenarios (QAS)

Quality attribute scenarios should follow this format (from ISO 25010 / ATAM):

```
Scenario ID: QAS-001
Quality Attribute: Availability
Stimulus: Hardware failure in primary region
Response: Automatic failover to secondary region
Measure: Recovery time < 5 minutes, zero data loss
Architectural Mechanism: Active-active multi-region deployment (Section 5.2)
Validation: Load test results from [date]
```

### Adding an ADR reference

When the evaluator flags missing decision rationale, the fastest fix is to reference or attach an ADR. If ADRs don't exist, create a simplified inline version:

```
Decision: [Name]
Date: [YYYY-MM-DD]
Status: Accepted
Context: [Why a decision was needed]
Options: [Option A] vs [Option B] vs [Selected]
Decision: [Selected option]
Rationale: [Why — linked to a specific driver or constraint]
Consequences: [Trade-offs accepted]
```

---

## Effort by Status Transition

Use this to set expectations with the author before they start:

| Current Status | Target Status | Typical Work |
|---------------|--------------|-------------|
| Rework Required | Conditional Pass | Fix gate failures + lift 2–3 criteria from 1→2. Usually 1–2 days. |
| Rework Required | Pass | Fix all gates + significant improvements across multiple criteria. Usually 3–5 days. |
| Conditional Pass | Pass | Targeted improvements on 2–3 criteria at score 2. Usually half day to 1 day. |
| Reject (critical gate) | Conditional Pass | Must fix the critical gate failure. Can be quick fix or significant rework depending on the criterion. |

The single most impactful action is almost always fixing a gate failure or lifting a score-0 criterion to score-2. Do not invest effort improving a score-3 criterion to score-4 when score-0 criteria remain unaddressed.
