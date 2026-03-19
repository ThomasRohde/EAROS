# Section-to-Rubric Mapping — EAROS Template Fill

This file maps common architecture document sections to the EAROS criteria they address. Use it when walking authors through their document or checking completeness.

---

## Why This Mapping Matters

Authors structure documents for readability; EAROS evaluators assess documents for criterion coverage. These don't always align. An author can have a well-structured document that misses 3 core criteria because those concerns were spread across sections without explicit treatment.

This mapping shows where criterion coverage is expected so authors can write explicitly, not just organically.

---

## Core Criteria — Section Mapping and Scoring Boundaries

### STK-01 — Stakeholder Identification
**Criterion question:** Are the decision audience and key stakeholders identified with their primary concerns?

**Expected in sections:** Introduction, Purpose, Audience, or dedicated Stakeholders section

**What assessors look for:**
- Named stakeholders (roles, not just "the business")
- Primary concern mapped to each stakeholder
- Document's decision relevance to each stakeholder

**Score 2 vs. 3 boundary:** Listed vs. listed-with-concerns-mapped

**Strong (score 3–4):**
> | Stakeholder | Role | Primary Concern | Addressed In |
> |------------|------|----------------|-------------|
> | Solution Architect | Document owner | Design completeness, soundness | All sections |
> | Platform Team | Operations | Deployment topology, runbook completeness | Section 5, Appendix B |
> | Security Review Board | Governance | Control compliance, threat model | Section 6, Appendix A |
> | Service Owner | Business | Cost model, SLA commitments | Section 7 |

**Weak (score 1):**
> "Audience: Technical teams and business stakeholders."

---

### SCP-01 — Scope and Boundaries ⚠️ GATE (major or critical depending on profile)
**Criterion question:** Are scope, out-of-scope elements, constraints, and assumptions explicitly stated?

**Expected in sections:** Scope, Boundaries, Constraints and Assumptions, or Introduction

**What assessors look for:**
- Explicit in-scope list (named components/systems)
- Explicit out-of-scope list (what isn't covered and why)
- Stated assumptions (especially ones that affect the design)
- Constraints (regulatory, technical, organizational)

**Score 2 vs. 3 boundary:** Scope defined vs. scope + exclusions + assumptions all stated

**Strong (score 3–4):**
> IN SCOPE: Payments service, Notification service, upstream Banking Core API
> OUT OF SCOPE: Authentication (handled by IAM platform — see IAM-2024-001), analytics pipeline
> ASSUMPTIONS: Banking Core API versioned contract stable for 12 months
> CONSTRAINTS: Must operate within existing AWS EU-West-1 account; GDPR data residency applies

**Weak (score 0–1):**
> "This document covers the payments service architecture."

---

### CVP-01 — Content and Viewpoints
**Criterion question:** Are the chosen views appropriate for the stated stakeholders and decision purpose?

**Expected in sections:** Architecture Views, Solution Overview, or any section with diagrams

**What assessors look for:**
- Multiple views (context, component, deployment, data flow — not just one diagram)
- Connection between views and stakeholder concerns
- Annotated diagrams with legends

**Score 2 vs. 3 boundary:** Multiple views present vs. views explicitly mapped to stakeholder concerns

---

### TRC-01 — Traceability
**Criterion question:** Are architecture decisions traceable to business drivers or requirements?

**Expected in sections:** Architecture Decisions, Design Rationale, Decision Log

**What assessors look for:**
- Explicit links from decisions to the business drivers that motivated them
- Decision record format: context → options → decision → rationale
- References back to requirement IDs or named principles

**Score 2 vs. 3 boundary:** Decisions exist vs. decisions with explicit driver references

**Strong (score 3):**
> "Decision: Adopt event-driven Kafka. Context: scalability driver (Driver-3). Options: REST synchronous (rejected: cascade failure risk), Kafka (selected). Rationale: proven at 2× current volume, approved platform service."

**Weak (score 1):**
> "We chose event-driven architecture for scalability."

---

### CON-01 — Internal Consistency
**Criterion question:** Is terminology and component naming consistent across all sections and diagrams?

**Expected everywhere:** Checked across all sections and diagrams (not a specific section)

**What assessors look for:**
- Same name for the same component in all diagrams and text
- Scope boundary consistent between all views
- API contracts consistent between description and sequence diagrams

**Score 2 vs. 3 boundary:** Minor inconsistencies vs. fully consistent with a glossary

---

### RAT-01 — Risk and Assumptions ⚠️ GATE (major in most profiles)
**Criterion question:** Are risks, assumptions, and constraints identified with mitigations and owners?

**Expected in sections:** Risks, RAID Log, Assumptions, or Risk Register

**What assessors look for:**
- Risk register with all columns: Risk, Likelihood, Impact, Mitigation, Owner, Residual Risk
- Architectural trade-offs explicitly named
- Open questions flagged with planned resolution

**Score 2 vs. 3 boundary:** Risks listed vs. risks with mitigations AND owners

**Strong (score 3–4):**
> | Risk | Likelihood | Impact | Mitigation | Owner | Residual |
> |------|-----------|--------|------------|-------|---------|
> | Banking Core API SLA breach | Medium | High | Circuit breaker + fallback to cached data | Platform Eng | Low |

**Weak (score 0–1):**
> "Risks: Performance, security, integration issues."

---

### CMP-01 — Compliance and Standards ⚠️ GATE (critical in many profiles)
**Criterion question:** Does the design address applicable compliance frameworks and enterprise standards?

**Expected in sections:** Compliance, Security, Standards References, or Architecture Decisions

**What assessors look for:**
- Named standards (not "industry standards" — specific names like GDPR, ISO 27001, PCI-DSS)
- Specific controls mapped to specific design elements
- Named exceptions with approval path

**Score 2 vs. 3 boundary:** Standards mentioned vs. specific controls mapped to design

**The critical anti-pattern** (scores 0):
> "The solution will comply with all applicable security and regulatory standards."

---

### ACT-01 — Actions and Decisions
**Criterion question:** Are the key decisions and required actions clearly stated with owners?

**Expected in sections:** Decision, Recommendations, Next Steps, or Action Log

**What assessors look for:**
- Clear decision statement (what was decided, not just what was considered)
- Named actions with owners and target dates
- Decision authority identified

---

### MNT-01 — Maintainability and Ownership
**Criterion question:** Is the document owned, versioned, and maintainable?

**Expected in sections:** Document Control, cover page, header/footer

**What assessors look for:**
- Named owner (team or role)
- Version number and date
- Change history or changelog
- Review trigger or next review date

---

## Gate Summary by Profile

| Profile | Critical Gates | Major Gates |
|---------|---------------|-------------|
| Solution architecture | CMP-01 | SCP-01, RAT-01 |
| Reference architecture | None | RA-VIEW-01, RA-IMPL-01 (see profile) |
| ADR | SCP-01 | CON-01, RAT-01 |
| Capability map | None | SCP-01, TRC-01 |
| Roadmap | None | ACT-01, TRC-01 |

> Always verify from the loaded profile YAML — this table is indicative only. Gate assignments are defined in the `gate` field of each criterion.

---

## Common Completeness Failures

1. **Scope without assumptions** — Section exists but assumptions unstated → SCP-01 capped at 2
2. **Risks without owners** — Risk table has "Owner: TBD" → RAT-01 capped at 2
3. **Compliance by assertion** — "The solution will comply with all standards" → CMP-01 = 0
4. **Single diagram** — One architecture diagram presented as complete → CVP-01 = 1
5. **Traceability implied** — Decisions made with no reference to drivers → TRC-01 = 1–2
6. **Generic stakeholders** — "Audience: technical teams" → STK-01 = 1
7. **Out-of-scope omitted** — Scope section exists but no explicit exclusions → SCP-01 = 2
