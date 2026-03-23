/**
 * Shared types used across AssessmentWizard, ContinueAssessment, AssessmentForm,
 * and AssessmentViewer.
 */

import type { RubricDimension } from './components/AssessmentSummary'
import type { CriterionResult } from './components/CriterionScorer'

export type { CriterionResult }

export interface ArtifactMeta {
  title: string
  version: string
  author: string
  date: string
  artifactType: string
}

export interface DimWithSource extends RubricDimension {
  source: 'core' | 'profile' | 'overlay'
}

export interface PreloadedAssessment {
  dimensions: DimWithSource[]
  primaryRubricId: string
  primaryTitle: string
  meta: ArtifactMeta
  existingResults?: Record<string, CriterionResult>
}

// ─── Loaded evaluation record (read-only viewer) ────────────────────────────

export interface EvaluationEvidenceRef {
  section?: string
  page?: number
  paragraph?: string
  quotation?: string
  diagram_id?: string
  location?: string
  excerpt?: string
}

export interface EvaluationCriterionResult {
  criterion_id: string
  criterion_question?: string
  score: number | 'N/A'
  confidence?: string
  confidence_reason?: string
  evidence_sufficiency?: string
  evidence_class?: string
  judgment_type?: string          // older format alias for evidence_class
  evidence_refs?: Array<EvaluationEvidenceRef | string>
  rationale?: string
  evidence_gaps?: string[]
  missing_information?: string[]  // older format alias for evidence_gaps
  recommended_actions?: string[]
}

export interface EvaluationDimensionResult {
  dimension_id: string
  weighted_score: number
  criteria_scores?: Record<string, number>
  summary?: string
}

export interface EvaluationGateFailure {
  criterion_id?: string
  criterion_question?: string
  gate_severity?: string
  failure_effect?: string
  actual_score?: number
  status?: string
}

export interface LoadedEvaluation {
  kind?: 'evaluation'
  evaluation_id?: string
  artifact_id?: string
  artifact_type?: string
  artifact_version?: string
  artifact_ref?: {
    id?: string
    title?: string
    artifact_type?: string
    owner?: string
    uri?: string
  }
  rubric_id?: string
  rubric_version?: string
  profiles_applied?: string[]
  overlays_applied?: string[]
  evaluated_by?: Array<{
    role: string
    actor: string
    identity?: string
    model_version?: string
  }>
  evaluation_mode?: string
  evaluation_date?: string
  dag_execution?: {
    steps_completed?: string[]
    rubric_lock_version?: string
    calibration_applied?: boolean
  }
  criterion_results: EvaluationCriterionResult[]
  dimension_results?: EvaluationDimensionResult[]
  gate_failures?: EvaluationGateFailure[]
  overall_status?: string
  overall_score?: number
  confidence?: string
  evidence_gaps?: string[]
  recommended_actions?: string[]
  decision_summary?: string
  challenger_notes?: string
}

export interface EvaluationSummaryEntry {
  path: string
  name: string
  overall_status?: string
  overall_score?: number
  evaluation_date?: string
  title?: string
}
