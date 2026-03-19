/**
 * Shared types used across AssessmentWizard, ContinueAssessment, and AssessmentForm.
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
