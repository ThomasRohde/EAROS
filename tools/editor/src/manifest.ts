/**
 * EAROS Manifest — browser-safe types and fetch helpers.
 * CLI logic lives in ../manifest-cli.ts (outside Vite bundle scope).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManifestEntry {
  path: string
  rubric_id?: string
  title?: string
  artifact_type?: string
  status?: string
}

export interface ManifestSchema {
  path: string
  validates: string[]
}

export interface ManifestTemplate {
  path: string
  purpose: string
}

export interface ManifestScoringTool {
  path: string
  purpose?: string
}

export interface ManifestData {
  kind: 'manifest'
  version: string
  generated: string
  core?: ManifestEntry[]
  profiles?: ManifestEntry[]
  overlays?: ManifestEntry[]
  schemas?: ManifestSchema[]
  templates?: ManifestTemplate[]
  scoring_tools?: ManifestScoringTool[]
}

// ─── Browser helpers (fetch-based) ────────────────────────────────────────────

/** Fetch the manifest from the dev-server API. Returns null if unavailable. */
export async function fetchManifest(): Promise<ManifestData | null> {
  try {
    const resp = await fetch('/api/manifest')
    if (!resp.ok) return null
    return await resp.json()
  } catch {
    return null
  }
}

/** Load a repo YAML file as parsed JSON via the dev-server API. */
export async function fetchRepoFile(repoPath: string): Promise<unknown | null> {
  try {
    const resp = await fetch(`/api/file/${encodeURIComponent(repoPath)}`)
    if (!resp.ok) return null
    return await resp.json()
  } catch {
    return null
  }
}

/** List .evaluation.yaml files from examples/ and evaluations/ directories. */
export async function fetchEvaluations(): Promise<Array<{ path: string; name: string }>> {
  try {
    const resp = await fetch('/api/evaluations')
    if (!resp.ok) return []
    const data = await resp.json() as { files: Array<{ path: string; name: string }> }
    return data.files ?? []
  } catch {
    return []
  }
}

/** Save data back to a repo YAML file via the dev-server API. Returns true on success. */
export async function saveRepoFile(repoPath: string, data: unknown): Promise<boolean> {
  try {
    const resp = await fetch(`/api/file/${encodeURIComponent(repoPath)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.ok
  } catch {
    return false
  }
}
