/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GateSeverity = 'none' | 'major' | 'critical'

export interface ScoringLevel {
  score: number
  label: string
}

export interface Criterion {
  id: string
  dimensionName: string
  question: string
  gateSeverity: GateSeverity
  gateFailureEffect: string
  gateThreshold: number // score below this triggers gate failure
  levels: ScoringLevel[]
}

/* ------------------------------------------------------------------ */
/*  Criteria data (from core/core-meta-rubric.yaml)                    */
/* ------------------------------------------------------------------ */

export const CRITERIA: Criterion[] = [
  {
    id: 'STK-01',
    dimensionName: 'Stakeholder & purpose fit',
    question:
      'Does the artifact explicitly identify intended stakeholders, decision purpose, and review context?',
    gateSeverity: 'major',
    gateFailureEffect: 'Cannot pass above Conditional Pass',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'Absent or contradicted' },
      { score: 1, label: 'Implied only' },
      { score: 2, label: 'Explicit but incomplete' },
      { score: 3, label: 'Explicit and mostly complete' },
      { score: 4, label: 'Explicit, complete, and used consistently' },
    ],
  },
  {
    id: 'SCP-01',
    dimensionName: 'Scope & boundary clarity',
    question:
      'Does the artifact define scope, boundaries, assumptions, and exclusions?',
    gateSeverity: 'critical',
    gateFailureEffect: 'Not Reviewable when score < 2',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'No scope or boundary' },
      { score: 1, label: 'Scope is ambiguous' },
      { score: 2, label: 'Basic scope exists but is incomplete' },
      { score: 3, label: 'Scope and boundaries are clear' },
      {
        score: 4,
        label: 'Scope and boundaries are clear, tested, and internally consistent',
      },
    ],
  },
  {
    id: 'TRC-01',
    dimensionName: 'Traceability to drivers',
    question:
      'Are business drivers, objectives, or requirements traceably connected to the architecture content?',
    gateSeverity: 'major',
    gateFailureEffect: 'Cannot pass if score < 2',
    gateThreshold: 2,
    levels: [
      { score: 0, label: 'No traceability \u2014 no drivers referenced' },
      {
        score: 1,
        label: 'Loose narrative only \u2014 drivers mentioned but not connected',
      },
      {
        score: 2,
        label: 'Partial traceability \u2014 some decisions linked to drivers',
      },
      {
        score: 3,
        label: 'Clear traceability for most important items',
      },
      {
        score: 4,
        label: 'Consistent traceability \u2014 matrix or explicit markup throughout',
      },
    ],
  },
  {
    id: 'ACT-01',
    dimensionName: 'Actionability',
    question:
      'Can delivery and governance teams act on the artifact without major reinterpretation?',
    gateSeverity: 'none',
    gateFailureEffect: '',
    gateThreshold: 0,
    levels: [
      { score: 0, label: 'Not actionable \u2014 purely descriptive' },
      {
        score: 1,
        label: 'Heavily ambiguous \u2014 \u201cnext steps to be determined\u201d',
      },
      {
        score: 2,
        label: 'Partly actionable \u2014 some decisions made, significant gaps',
      },
      {
        score: 3,
        label: 'Mostly actionable \u2014 key decisions made, most actions owned',
      },
      {
        score: 4,
        label: 'Fully actionable \u2014 all decisions explicit, all actions owned and dated',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Sample artifact                                                    */
/* ------------------------------------------------------------------ */

export const SAMPLE_ARTIFACT = `Payment Gateway Migration \u2014 Solution Architecture

Purpose: This document supports the Architecture Board review of the
Payment Gateway migration from monolithic batch processing to event-driven
real-time settlement. Primary stakeholders: CTO (strategic oversight),
Head of Payments (domain ownership), Security Architecture (compliance
review), Platform Engineering Lead (infrastructure).
Review context: Stage gate review before Q3 2026 implementation begins.

Business Drivers:
  - Reduce settlement latency from T+1 to near real-time
  - Support ISO 20022 messaging standard adoption
  - Improve fraud detection response time

Architecture Overview:
The proposed architecture replaces the existing batch-based settlement
engine with an event-driven pipeline using Apache Kafka for message
streaming and a new Settlement Service that processes payment events in
real-time. The Fraud Detection module will consume the same event stream
to enable sub-second risk scoring.

Technology Stack: Kafka 3.7, Java 21, PostgreSQL 16, Redis 7, AWS EKS.

Compliance: The solution will comply with all applicable PCI-DSS and
PSD2 requirements.

Next Steps:
  - Finalize detailed design
  - Complete security review
  - Begin implementation`
