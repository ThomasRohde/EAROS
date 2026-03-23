/**
 * Static lookup maps for criterion questions and dimension names.
 *
 * Used as a fallback when evaluation records do not embed `criterion_question`.
 * Built from the rubric YAML files (core + all profiles + all overlays).
 */
// ── Criterion ID → question text ─────────────────────────────────────────────
export const CRITERION_QUESTIONS = {
    // Core meta-rubric (EAROS-CORE-002) — 10 criteria
    'STK-01': 'Does the artifact explicitly identify intended stakeholders, decision purpose, and review context?',
    'STK-02': 'Are concerns mapped to the views or sections used in the artifact?',
    'SCP-01': 'Does the artifact define scope, boundaries, assumptions, and exclusions?',
    'CVP-01': 'Do the selected views and representations fit the stakeholder concerns and review purpose?',
    'TRC-01': 'Are business drivers, objectives, principles, or requirements traceably connected to the architecture content?',
    'CON-01': 'Are terms, structures, interfaces, and facts consistent across sections and views?',
    'RAT-01': 'Does the artifact identify key risks, assumptions, constraints, and tradeoffs relevant to the decision?',
    'CMP-01': 'Does the artifact show alignment to applicable architecture standards, policies, and mandatory controls?',
    'ACT-01': 'Can delivery and governance teams act on the artifact without major reinterpretation?',
    'MNT-01': 'Does the artifact identify ownership, update expectations, and change history or provenance?',
    // Reference architecture (EAROS-REFARCH-001) — 9 criteria
    'RA-VIEW-01': 'Does the reference architecture include context, functional, deployment, and data flow views?',
    'RA-VIEW-02': 'Are architecture diagrams machine-readable or accompanied by structured element catalogs?',
    'RA-DEC-01': 'Are key architecture decisions documented with context, options considered, and rationale?',
    'RA-DEC-02': 'Does the reference architecture clearly define what is fixed, what is configurable, and where teams have discretion?',
    'RA-OPS-01': 'Does the reference architecture include monitoring, alerting, scaling, and disaster recovery guidance?',
    'RA-IMP-01': 'Does the reference architecture include infrastructure-as-code templates, API specifications, or starter kits?',
    'RA-IMP-02': 'Does the reference architecture include a clear getting-started guide or golden path for new adopters?',
    'RA-QA-01': 'Are quality attributes defined with measurable acceptance criteria and validation approaches?',
    'RA-REU-01': 'Is the reference architecture version-controlled with a clear evolution roadmap?',
    // Solution architecture (EAROS-SOL-001) — 3 criteria
    'SOL-01': 'Does the artifact explain the chosen option and the rejected alternatives at a decision-useful level?',
    'SOL-02': 'Are key quality attributes and non-functional requirements translated into architectural mechanisms or constraints?',
    'SOL-03': 'Does the solution architecture describe implementation dependencies, operational ownership, and migration implications?',
    // ADR (EAROS-ADR-001) — 3 criteria
    'ADR-01': 'Is the decision stated as a clear, testable, singular decision rather than a vague discussion topic?',
    'ADR-02': 'Does the ADR capture meaningful alternatives and the consequences of the chosen decision?',
    'ADR-03': 'Can a future reader understand why the decision was made and when it should be revisited?',
    // Capability map (EAROS-CAP-001) — 3 criteria
    'CAP-01': 'Is the capability decomposition stable, non-overlapping, and expressed at a coherent level of abstraction?',
    'CAP-02': 'Does the map connect capabilities to business outcomes, ownership, and investment or maturity decisions?',
    'CAP-03': 'Can the capability map be reused over time for comparative analysis without frequent structural rework?',
    // Roadmap (EAROS-ROAD-001) — 3 criteria
    'RD-DEP-01': 'Are dependencies between roadmap items identified and realistic?',
    'RD-TRN-01': 'Are intermediate states between current and target architecture defined?',
    'RD-OWN-01': 'Do roadmap items have owners, funding linkage, and measurable milestones?',
    // Security overlay (EAROS-OVR-SEC-001) — 1 criterion
    'SEC-01': 'Does the artifact show material threats, required controls, and control ownership at a level suitable for the review?',
    // Data governance overlay (EAROS-OVR-DATA-001) — 1 criterion
    'DAT-01': 'Does the artifact define key information objects, accountability, lifecycle concerns, and material data quality or privacy implications?',
    // Regulatory overlay (EAROS-OVR-REG-001) — 2 criteria
    'REG-ID-01': 'Are applicable regulations and compliance requirements explicitly identified?',
    'REG-EV-01': 'Is compliance with identified regulations demonstrated with evidence?',
};
// ── Dimension prefix → human-readable name ───────────────────────────────────
// Keys match the groupByDimension heuristic in AssessmentViewer:
//   3-char prefix → parts[0]  (e.g., STK-01 → STK)
//   longer prefix → parts[0]-parts[1]  (e.g., RA-VIEW-01 → RA-VIEW)
export const DIMENSION_NAMES = {
    // Core
    STK: 'Stakeholder and purpose fit',
    SCP: 'Scope and boundary clarity',
    CVP: 'Concern coverage and viewpoint appropriateness',
    TRC: 'Traceability to drivers, requirements, and principles',
    CON: 'Internal consistency and integrity',
    RAT: 'Risks, assumptions, constraints, and tradeoffs',
    CMP: 'Standards and policy compliance',
    ACT: 'Actionability and implementation relevance',
    MNT: 'Artifact maintainability and stewardship',
    // Reference architecture
    'RA-VIEW': 'Architecture views and completeness',
    'RA-DEC': 'Prescriptiveness and decision guidance',
    'RA-OPS': 'Operational readiness',
    'RA-IMP': 'Implementation actionability',
    'RA-QA': 'Quality attribute specification',
    'RA-REU': 'Reusability and evolution',
    // Solution architecture
    SOL: 'Solution optioning and rationale',
    // ADR
    ADR: 'Decision clarity',
    // Capability map
    CAP: 'Decomposition quality',
    // Roadmap
    'RD-DEP': 'Dependency realism',
    'RD-TRN': 'Transition-state clarity',
    'RD-OWN': 'Ownership and measurability',
    // Overlays
    SEC: 'Threat, control, and ownership treatment',
    DAT: 'Information treatment and accountability',
    'REG-ID': 'Regulatory identification',
    'REG-EV': 'Compliance evidence',
};
// ── Helper ───────────────────────────────────────────────────────────────────
/**
 * Returns the human-readable question for a criterion ID.
 * Prefers the embedded `criterion_question` from the evaluation record;
 * falls back to the static lookup.
 */
export function getCriterionQuestion(criterionId, embedded) {
    return embedded || CRITERION_QUESTIONS[criterionId] || '';
}
