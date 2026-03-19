# Evidence Writing Guide — EAROS Template Fill

This file shows how to write architecture content that produces strong EAROS evidence. Read this when helping authors draft specific sections or reviewing content they've provided.

---

## The Core Principle: Explicit Over Implicit

EAROS evaluators score what is stated, not what they can infer. An author who understands this writes explicitly: stating their reasoning, naming their stakeholders, listing their assumptions, and mapping their decisions to drivers.

The single most common improvement that raises EAROS scores is replacing implied content with stated content.

**Implied (scores 1–2):** "The event-driven architecture enables scalability."

**Stated (scores 3–4):** "The event-driven architecture was chosen to address the scalability driver (Driver-3: handle 10x traffic peaks). Alternatives considered: synchronous REST (rejected: cascade failure risk under load), message queue fan-out (rejected: requires managed MQ service not approved in current cloud account)."

The content is the same architectural idea — but the explicit version provides evidence anchors an assessor can score against each level descriptor.

---

## Writing Patterns by Section Type

### Pattern 1 — The Stakeholder Table

**Weak (scores 1):**
> "Audience: Technical stakeholders and business owners."

**Adequate (scores 2):**
> "Stakeholders: Solution Architect, Platform Team, Security Review Board, Service Owner."

**Strong (scores 3–4):**

| Stakeholder | Role | Primary Concern | Addressed In |
|------------|------|----------------|-------------|
| Solution Architect | Document owner | Completeness, architectural soundness | All sections |
| Platform Team | Operations | Deployment topology, runbook requirements | Section 5, Appendix B |
| Security Review Board | Governance | Control compliance, threat model | Section 6, Appendix A |
| Service Owner | Business | Cost model, SLA commitments | Section 7 |

**Why the table works:** It provides direct evidence for STK-01 (named stakeholders with concerns) AND for CVP-01 (views addressing stakeholder concerns). One table serves multiple criteria.

---

### Pattern 2 — The Scope Block

**Weak (scores 0–1):**
> "This document covers the payments architecture."

**Adequate (scores 2):**
> "In scope: Payments service, API gateway, upstream banking core.
> Out of scope: authentication, reporting."

**Strong (scores 3–4):**
```
IN SCOPE:
- Payments Service (new) — core payment processing logic
- Notification Service (existing, modified) — payment confirmation events
- Banking Core API (existing, upstream) — account validation and settlement

OUT OF SCOPE:
- Authentication/Authorization — handled by IAM Platform (see IAM-ARCH-2024-001)
- Analytics Pipeline — separate initiative (ANALYTICS-2025 roadmap item)
- Mobile App — consumer of this service, not modified in this initiative

ASSUMPTIONS:
- Banking Core API contract is stable for 12 months (contact: payments-arch@company.com)
- Mobile app team provides test harness for integration testing by Q2 2026
- Existing AWS EU-West-1 account remains the deployment target

CONSTRAINTS:
- No new PII data stores — any personal data must flow through the approved Data Platform
- GDPR data residency requirements apply — all processing within EU
```

**Why this works:** Each section maps directly to what SCP-01 requires. An assessor can find evidence for each level descriptor immediately. Score 3 requires all four blocks present; score 4 adds consistency verification (e.g., scope boundary tested across all views).

---

### Pattern 3 — The Decision Record

**Weak (scores 1):**
> "We chose event-driven architecture for scalability."

**Adequate (scores 2):**
> "Event-driven architecture was chosen because it enables decoupling between producers and consumers, supporting the scalability requirements."

**Strong (scores 3–4):**
```
Decision: Adopt event-driven architecture using Apache Kafka for inter-service communication

Context: Payment volume is expected to scale 10x during peak periods (Driver-3). The current
         synchronous REST integration pattern creates cascade failures when Banking Core API
         latency increases (observed in P95 incident Aug 2025, Incident-2025-0143).

Options considered:
  A. Synchronous REST (rejected): cascade failure risk, confirmed by incident analysis
  B. Message queue fan-out (rejected): requires managed MQ service not in approved catalog
  C. Event-driven Kafka (selected): approved platform service, proven at 2x current volume

Rationale: Option C addresses the scalability driver without introducing unapproved
           dependencies. Operational overhead (Kafka expertise) accepted — Platform Team
           confirmed capability.

Revisit trigger: If Kafka proves operationally burdensome by Q3 2026 review, re-evaluate B.
```

**Why this works:** Provides TRC-01 evidence (link to driver), RAT-01 evidence (trade-offs considered), and ACT-01 evidence (revisit condition named). One decision record serves three criteria.

---

### Pattern 4 — The Risk Table

**Absent (scores 0):**
> "Risks: TBD"

**Weak (scores 1):**
> "Risks: Performance, security, integration."

**Adequate (scores 2):**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API latency degradation | Medium | High | Circuit breaker pattern |
| Data loss on Kafka failure | Low | Critical | Persistent disk, replication factor 3 |

**Strong (scores 3–4):**

| Risk | Likelihood | Impact | Mitigation | Owner | Residual Risk |
|------|-----------|--------|------------|-------|--------------|
| Banking Core API SLA breach | Medium | High | Circuit breaker + fallback to cached data; see RUNBOOK-PAY-003 | Platform Eng | Low — fallback tested to 15min outage |
| Kafka consumer lag during peak | Medium | Medium | Auto-scaling consumer group; alert at 5min lag | Payments Eng | Medium — depends on Auto-scaling SLA |
| PII data in event payload | Low | Critical | Event schema validation gate; DLP scanning on all topics | Security | Low — schema registry prevents unknown fields |

**The most commonly missing columns:** Residual Risk and Owner. "Mitigation: TBD" or "Owner: TBD" caps RAT-01 at score 2.

---

### Pattern 5 — The Compliance Section

**The most common failure mode (scores 0):**
> "The solution will comply with all applicable security and regulatory standards."

**Marginal (scores 1):**
> "The solution addresses GDPR and ISO 27001 requirements."

**Adequate (scores 2):**
> "GDPR controls applied: data minimization (only payment reference stored, not card number), right to erasure implemented via Payments Data API. ISO 27001: encryption at rest and in transit implemented."

**Strong (scores 3–4):**

| Control | Standard | How Addressed | Evidence |
|---------|----------|--------------|---------|
| Data minimization | GDPR Art. 5(1)(c) | Card numbers never stored — only payment tokens via PCI-DSS vault | Section 4.2, Data Flow Diagram |
| Encryption at rest | ISO 27001 A.10.1 | AES-256 on all storage; key rotation quarterly | Section 5.3 |
| Access control | Enterprise Security Baseline v3 | RBAC via IAM Platform; no direct DB access | Section 5.4 |
| PCI DSS SAQ-A | PCI DSS 3.2.1 | Delegated to payment gateway (Stripe); scope reduction confirmed by Security Review 2025-Q3 | Appendix A |

---

## The "Explicit Over Implicit" Checklist

Use this to review any section before submission:

- [ ] Are stakeholders **named** (not "technical teams") with **specific concerns**?
- [ ] Is scope **listed** (not described) with explicit in-scope AND out-of-scope?
- [ ] Are assumptions **stated** (not implied from the design choices)?
- [ ] Are drivers **referenced by name** in decision rationale (not just alluded to)?
- [ ] Are risks **in a table** with mitigations AND owners AND residual risk?
- [ ] Is compliance **mapped to specific named controls** (not stated as assertion)?
- [ ] Are component names **consistent** between text and all diagrams?
- [ ] Does each diagram have a **legend** or annotation explaining its notation?

---

## Common Writing Anti-Patterns

| Anti-Pattern | EAROS Problem | Fix |
|-------------|--------------|-----|
| "The architecture follows best practices" | Assertion without evidence; CMP-01 = 0 | Name the specific practices and how they're applied |
| "Risks will be managed" | Not a risk statement; RAT-01 = 0–1 | Add: what risk, likelihood, impact, mitigation, owner |
| "See attached diagram" | Diagram without narrative; CVP-01 = 1 | Add: what the diagram shows, what to look for, what boundaries mean |
| "Compliant with enterprise standards" | No named standard; CMP-01 = 0 | Name each: GDPR, ISO 27001, PCI-DSS, etc. |
| "To be determined" in gate criterion section | Immediate gate risk | These must be resolved before submission |
| Generic stakeholders | STK-01 = 1 | Name roles with specific concerns |
| Scope as a paragraph | Hard to extract in/out/assumptions; SCP-01 = 2 | Use structured lists or tables |
| One diagram only | CVP-01 = 1 | Add context, deployment, and data flow views |
