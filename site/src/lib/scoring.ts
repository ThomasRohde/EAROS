import type { Criterion, GateSeverity } from '../content/demoData'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Status =
  | 'pass'
  | 'conditional_pass'
  | 'rework_required'
  | 'reject'
  | 'not_reviewable'

export interface GateResult {
  criterionId: string
  severity: GateSeverity
  passed: boolean
  failureEffect: string
}

export interface ScoringResult {
  weightedAverage: number | null
  gateResults: GateResult[]
  hasCriticalFailure: boolean
  status: Status | null
  allScored: boolean
  scoredCount: number
}

/* ------------------------------------------------------------------ */
/*  Scoring logic                                                      */
/* ------------------------------------------------------------------ */

export function computeResults(
  scores: Record<string, number | null>,
  criteria: Criterion[],
): ScoringResult {
  const scored = Object.entries(scores).filter(
    (e): e is [string, number] => e[1] !== null,
  )
  const scoredCount = scored.length
  const allScored = scoredCount === criteria.length

  // Gate evaluation (always first)
  const gateResults: GateResult[] = criteria
    .filter((c) => c.gateSeverity !== 'none')
    .map((c) => {
      const s = scores[c.id]
      const passed = s === null || s >= c.gateThreshold
      return {
        criterionId: c.id,
        severity: c.gateSeverity,
        passed,
        failureEffect: c.gateFailureEffect,
      }
    })

  const hasCriticalFailure = gateResults.some(
    (g) => g.severity === 'critical' && !g.passed,
  )
  const hasMajorFailure = gateResults.some(
    (g) => g.severity === 'major' && !g.passed,
  )

  // Weighted average (all weights are 1.0)
  const weightedAverage =
    scoredCount > 0
      ? scored.reduce((sum, [, v]) => sum + v, 0) / scoredCount
      : null

  // Status determination
  let status: Status | null = null
  if (scoredCount > 0) {
    if (hasCriticalFailure) {
      status = 'not_reviewable'
    } else if (weightedAverage !== null) {
      const noScoreBelow2 = scored.every(([, v]) => v >= 2)
      if (
        weightedAverage >= 3.2 &&
        !hasMajorFailure &&
        noScoreBelow2
      ) {
        status = 'pass'
      } else if (weightedAverage >= 2.4 && !hasMajorFailure) {
        status = 'conditional_pass'
      } else {
        status = 'rework_required'
      }
    }
  }

  return {
    weightedAverage,
    gateResults,
    hasCriticalFailure,
    status,
    allScored,
    scoredCount,
  }
}
