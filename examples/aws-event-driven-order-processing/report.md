# EaROS Architecture Assessment Report

**Artifact:** Event-Driven Order Processing Platform on AWS
**Artifact ID:** RA-AWS-ORDER-001 · Version 1.0.0
**Artifact Type:** Reference Architecture
**Rubrics Applied:** EAROS-CORE-002 v2.0.0 + EAROS-REFARCH-001 v2.0.0
**Evaluation Date:** 2026-03-20
**Evaluators:** EaROS Evaluator Agent + EaROS Challenger Agent (claude-sonnet-4-6)
**Evaluation Mode:** Agent (DAG, all 8 steps completed)

---

## Executive Summary

| | |
|---|---|
| **Overall Status** | **PASS** |
| **Overall Score** | **3.73 / 4.0** |
| **Pass Threshold** | 3.2 / 4.0 |
| **Gate Failures** | None |
| **Criteria Scored** | 19 of 19 (10 core + 9 profile) |
| **N/A Criteria** | 0 |
| **Confidence** | High |

This reference architecture is a **gold-standard implementation** that passes EaROS assessment with a score of 3.73/4.0 — well above the 3.2 pass threshold. It is recommended as the **calibration benchmark** for all future EaROS reference architecture assessments. No gate criteria failed. No dimension scored below 2.0.

---

## Traffic-Light Dashboard

| Criterion | Name | Score | Status |
|-----------|------|-------|--------|
| STK-01 | Stakeholder and purpose fit | 4 / 4 | 🟢 |
| STK-02 | Concern-to-view mapping | 4 / 4 | 🟢 |
| SCP-01 | Scope and boundary clarity ⚠️ CRITICAL GATE | 4 / 4 | 🟢 |
| CVP-01 | Viewpoint appropriateness | 4 / 4 | 🟢 |
| TRC-01 | Traceability to drivers ⚠️ MAJOR GATE | 4 / 4 | 🟢 |
| CON-01 | Internal consistency | 4 / 4 | 🟢 |
| RAT-01 | Risks, assumptions, constraints, trade-offs | 4 / 4 | 🟢 |
| CMP-01 | Standards and policy compliance ⚠️ CRITICAL GATE | 4 / 4 | 🟢 |
| ACT-01 | Actionability | 4 / 4 | 🟢 |
| MNT-01 | Maintainability and stewardship | 4 / 4 | 🟢 |
| RA-VIEW-01 | Architecture views completeness ⚠️ MAJOR GATE | 4 / 4 | 🟢 |
| RA-VIEW-02 | Machine-readable diagrams | 3 / 4 | 🟡 |
| RA-DEC-01 | Key decisions documented ⚠️ MAJOR GATE | 4 / 4 | 🟢 |
| RA-DEC-02 | Prescriptiveness classification | 4 / 4 | 🟢 |
| RA-OPS-01 | Operational readiness ⚠️ MAJOR GATE | 4 / 4 | 🟢 |
| RA-IMP-01 | Implementation artifacts | 4 / 4 | 🟢 |
| RA-IMP-02 | Getting-started guide | 3 / 4 | 🟡 |
| RA-QA-01 | Quality attributes ⚠️ MAJOR GATE | 4 / 4 | 🟢 |
| RA-REU-01 | Reusability and evolution | 4 / 4 | 🟢 |

**Legend:** 🟢 Score ≥ 3 · 🟡 Score 2–2.9 · 🟠 Score 1–1.9 · 🔴 Score 0 or gate failure

---

## Dimension Summary

| Dimension | Name | Weight | Score | Weighted |
|-----------|------|--------|-------|---------|
| D1 | Stakeholder and purpose fit | 1.0 | 4.0 | 4.0 |
| D2 | Scope and boundary clarity | 1.0 | 4.0 | 4.0 |
| D3 | Concern coverage and viewpoint appropriateness | 1.0 | 4.0 | 4.0 |
| D4 | Traceability to drivers, requirements, and principles | 1.0 | 4.0 | 4.0 |
| D5 | Internal consistency and integrity | 1.0 | 4.0 | 4.0 |
| D6 | Risks, assumptions, constraints, and trade-offs | 1.0 | 4.0 | 4.0 |
| D7 | Standards and policy compliance | 1.0 | 4.0 | 4.0 |
| D8 | Actionability and implementation relevance | 1.0 | 4.0 | 4.0 |
| D9 | Artifact maintainability and stewardship | 1.0 | 4.0 | 4.0 |
| RA-D1 | Architecture views and completeness | 1.2 | 3.5 | 4.2 |
| RA-D2 | Prescriptiveness and decision guidance | 1.0 | 4.0 | 4.0 |
| RA-D3 | Operational readiness | 1.0 | 4.0 | 4.0 |
| RA-D4 | Implementation actionability | 1.2 | 3.5 | 4.2 |
| RA-D5 | Quality attribute specification | 1.0 | 4.0 | 4.0 |
| RA-D6 | Reusability and evolution | 0.8 | 4.0 | 3.2 |

**Overall weighted score: 3.73 / 4.0**
Pass threshold: 3.2 — **exceeded by 0.53 points**

---

## Gate Check

| Gate | Criterion | Severity | Score | Result |
|------|-----------|----------|-------|--------|
| Scope reviewability | SCP-01 | CRITICAL | 4 | ✅ PASS |
| Mandatory compliance | CMP-01 | CRITICAL | 4 | ✅ PASS |
| Stakeholder fit | STK-01 | MAJOR | 4 | ✅ PASS |
| Traceability | TRC-01 | MAJOR | 4 | ✅ PASS |
| Architecture views | RA-VIEW-01 | MAJOR | 4 | ✅ PASS |
| Decision documentation | RA-DEC-01 | MAJOR | 4 | ✅ PASS |
| Operational readiness | RA-OPS-01 | MAJOR | 4 | ✅ PASS |
| Quality attributes | RA-QA-01 | MAJOR | 4 | ✅ PASS |

**All gates: PASS. No gate failures.**

---

## Three Evaluation Types

### 1. Artifact Quality — 4.0 / 4.0 (Exceptional)

The artifact is complete, coherent, internally consistent, and fit for its stated purpose as both an Architecture Board submission and a golden-path reference for development teams.

**Strengths:**
- Seven named stakeholders with individual concern statements and a 15-entry reading guide — navigable by any audience
- 12 explicit in-scope items and 8 explicit out-of-scope items with rationale — no ambiguity about scope
- 10-entry element catalog establishes canonical component names; 24-term glossary normalises terminology; all five views use consistent names
- All core rubric criteria score 4/4 — this is the highest artifact quality achievable

**Notable evidence:** The reading guide section_map explicitly maps every section to an audience and concern, satisfying STK-02 at score 4. The scope assumptions each carry a consequence_if_violated field — a level of rigour rarely seen in reference architecture documents.

---

### 2. Architectural Fitness — 3.73 / 4.0 (Very Strong)

The event-driven architecture on AWS Lambda, EventBridge, DynamoDB, and SQS is well-suited to the stated requirements. The architecture is production-proven on AWS and the technology choices are well-calibrated to the team size, load profile, and compliance requirements.

**Strengths:**
- Five full ADRs with 2–3 alternatives, explicit trade-off statements (what was sacrificed, what was gained), consequences for adopting teams, and specific revisit conditions
- Bidirectional traceability: all 5 drivers link to architecture responses and ADR IDs; all ADRs carry driver_refs arrays
- Eight quality attributes with measurable numeric targets, validation strategies, CI/CD fitness functions (Gatling fails the build), and TOGAF-format quality scenarios
- Complete operational model: 5 SLOs with error budgets, 11 key metrics, CDK-provisioned P1/P2/P3 alerting, 4 scaling policies, 8-step DR runbook

**Two minor gaps (both on the roadmap for v1.1.0):**
- **RA-VIEW-02 (score 3):** Five Mermaid diagrams in separate source files rather than a unified Structurizr DSL model. A Structurizr workspace would make all views model-generated from a single source of truth.
- **RA-IMP-02 (score 3):** Getting-started time of 4–8 hours for engineers new to CDK. Score 4 requires < 1-hour automated onboarding. A Backstage Software Template is planned for v1.1.0.

---

### 3. Governance Fit — 4.0 / 4.0 (Excellent)

PCI-DSS Level 1 compliance is mapped through 14 compliance entries covering all 9 material requirement areas. GDPR and enterprise security standards are addressed. Zero exceptions — full compliance for all stated applicable standards.

**Strengths:**
- 14 compliance mapping entries: each names a specific control, the specific design element satisfying it, evidence location, and owner — compliance by evidence, not by assertion
- Governance outcome explicit (approved), decision statement includes effective date (Q2 2026), 5 next actions are owned and dated
- No exceptions register — architecture achieves full compliance for PCI-DSS, GDPR, and enterprise standards without requiring exception approvals

**One improvement opportunity:**
- ISO-27001 is listed as an applicable standard but only the most material controls are mapped. An ISO-27001 Annex A mapping appendix in v1.1 would strengthen completeness.

---

## Key Findings

### What this artifact does exceptionally well

**1. Decision documentation** — The 5 ADRs in this artifact represent the highest standard of architectural decision documentation. Each documents context, 2–3 alternatives with explicit pros/cons, chosen option, rationale referencing specific drivers and principles, trade-offs accepted (not just acknowledged), consequences for adopting teams, and specific revisit conditions. This is the pattern all EaROS reference architectures should follow.

**2. Operational completeness** — Most reference architectures address build-time concerns and leave operational readiness as future work. This artifact provides: 5 SLOs with error budgets, 11 named key metrics, CDK-provisioned dashboards and alerting (P1/P2/P3 tiers), 4 scaling policies with numeric thresholds, and an 8-step DR runbook with tested RTO/RPO targets. The operational model is provisioned by CDK alongside the service — not added after.

**3. Compliance by evidence** — The 14 compliance mapping entries demonstrate how to satisfy CMP-01 at score 4. Rather than asserting compliance, each entry names the specific design element (e.g. "Each Lambda function has a least-privilege IAM role") and the evidence location. Auditors can verify each control without interpretation.

**4. Bidirectional traceability** — All 5 business drivers have architecture_response fields linking to named components and ADR IDs. All 5 ADRs carry driver_refs arrays linking back to the motivating drivers. This bidirectional traceability is rare and highly valued by governance reviewers.

**5. Prescriptiveness clarity** — The component_classification section gives development teams clear guidance: 9 mandatory components (no substitution without exception), 2 recommended, 1 optional. Three formal extension points define permitted variations with explicit constraints. Teams know exactly what they must, should, and may do.

---

## Recommended Actions

The following actions are recommended to close the two score-3 gaps. Both are already in the v1.1.0 evolution roadmap.

### Priority 1 — Migrate to Structurizr DSL (RA-VIEW-02: 3 → 4)

Consolidate the five independent Mermaid diagram files into a Structurizr DSL workspace where all views are generated from a single architecture model. This eliminates the risk of diagram drift (a common cause of CON-01 regression) and achieves the highest standard for diagram-as-code architecture documentation.

**Impact:** RA-VIEW-02 increases from 3 to 4. RA-D1 weighted score increases from 4.2 to 4.8. Overall score increases from 3.73 to approximately 3.80.
**Effort:** Medium (3–5 days for a Structurizr workspace covering all five views).
**Owner:** Enterprise Architecture.
**Target:** v1.1.0 (2026-09-20).

### Priority 2 — Implement Backstage Software Template (RA-IMP-02: 3 → 4)

Create a Backstage Software Template that provisions a complete new order service project in the platform developer portal. Target: < 1 hour from template instantiation to first successful deployment in sandbox.

**Impact:** RA-IMP-02 increases from 3 to 4. RA-D4 weighted score increases from 4.2 to 4.8. Overall score increases to approximately 3.87.
**Effort:** Medium (2–3 days for template creation + Backstage integration).
**Owner:** Order Platform Engineering.
**Target:** v1.1.0 (2026-09-20).

### Priority 3 — ISO-27001 Annex A mapping appendix (CMP-01 enhancement)

Add an ISO-27001 Annex A control mapping appendix in v1.1. This does not change the CMP-01 score (already 4) but strengthens the compliance documentation for audit purposes and reduces QSA preparation effort.

**Impact:** No score change; audit readiness improvement.
**Effort:** Low (1–2 days with Security Architecture input).
**Owner:** Information Security.
**Target:** v1.1.0 (2026-09-20).

### Priority 4 — Mermaid node ID mapping (CON-01 cosmetic)

Add a comment block at the top of each Mermaid diagram_source clarifying the abbreviated node ID to full component name mapping (e.g. `# OrderSvc = Order Service Lambda`). Eliminates the minor discrepancy noted in the challenger review.

**Impact:** No score change; clarity improvement.
**Effort:** Trivial (< 1 hour).
**Owner:** Enterprise Architecture.
**Target:** v1.0.1 patch.

---

## Projected Score After Recommended Actions

| Action | RA-VIEW-02 | RA-IMP-02 | Overall Score |
|--------|-----------|-----------|---------------|
| Current (v1.0.0) | 3 | 3 | **3.73** |
| After Priority 1 (Structurizr) | 4 | 3 | ~3.80 |
| After Priority 2 (Backstage) | 4 | 4 | ~3.87 |
| After Priority 3 (ISO-27001) | 4 | 4 | ~3.87 (no score Δ) |

At v1.1.0 with all priority actions complete, the projected overall score is **3.87 / 4.0** — one of the highest scores achievable for a real-world reference architecture.

---

## Calibration Note

This artifact and its evaluation record are designated as the **gold-standard calibration benchmark** for EaROS reference architecture assessments. Future evaluators should:

1. Score this artifact independently against EAROS-CORE-002 + EAROS-REFARCH-001 before conducting production evaluations
2. Target agreement with the scores in `evaluation.yaml` within ±1 point on each criterion
3. Compute Cohen's κ against these reference scores; target κ > 0.70
4. Resolve disagreements against the level descriptors in the rubric, not against this report

The two score-3 criteria (RA-VIEW-02, RA-IMP-02) are calibration-relevant: they demonstrate that a strong artifact can have principled gaps that are recognised and scored correctly, rather than being inflated to 4 across the board. Evaluators who score all 19 criteria as 4 on this artifact should review their calibration — two criteria are intentionally evidence-constrained at score 3.

---

## Evaluation Metadata

| Field | Value |
|-------|-------|
| Evaluation ID | EVAL-RA-AWS-001 |
| DAG steps completed | All 8 (including challenge_pass and calibration) |
| Rubric lock version | EAROS-CORE-002 v2.0.0 + EAROS-REFARCH-001 v2.0.0 |
| Calibration applied | Yes |
| Challenger verdict | No score changes; 4 challenges reviewed, all upheld |
| Evidence class breakdown | 19/19 criteria: observed (direct quotes) |
| Evidence sufficiency | 17/19 sufficient; 2/19 sufficient with noted gaps |

---

*Generated by EaROS evaluator agent (claude-sonnet-4-6) · 2026-03-20*
*Conforms to evaluation.schema.json · Rubric version EAROS-CORE-002 v2.0.0*
