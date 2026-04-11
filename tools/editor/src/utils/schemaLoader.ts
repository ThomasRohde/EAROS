/**
 * Schema loader — fetches JSON schemas from their canonical location in
 * standard/schemas/ via the dev-server API (/api/file/...).
 *
 * Schemas are cached after the first fetch so subsequent calls are synchronous.
 * The $schema and $id fields are stripped so AJV / JSON Forms accept them.
 *
 * Artifact schemas are split per artifact_type — each type has its own data
 * schema and UI schema pair. Callers pass an artifact_type string to
 * loadArtifactSchema / loadArtifactUiSchema and the resolver maps it to the
 * correct filename prefix.
 */

export type SchemaName = 'rubric' | 'evaluation'

export type ArtifactType =
  | 'reference_architecture'
  | 'solution_architecture'
  | 'architecture_decision_record'

/** Map artifact_type → filename prefix used in standard/schemas/. */
export const ARTIFACT_TYPE_TO_SCHEMA: Record<ArtifactType, string> = {
  reference_architecture: 'reference-architecture',
  solution_architecture: 'solution-architecture',
  architecture_decision_record: 'adr',
}

/** Ordered list of supported artifact types — used by the "New Artifact" picker. */
export const SUPPORTED_ARTIFACT_TYPES: ReadonlyArray<{
  type: ArtifactType
  label: string
  description: string
}> = [
  {
    type: 'reference_architecture',
    label: 'Reference Architecture',
    description: 'Recurring platform or pattern blueprint. 7 tabs, full views + operations.',
  },
  {
    type: 'solution_architecture',
    label: 'Solution Architecture',
    description: 'Decision-centred design for a specific solution. Optioning, NFRs, delivery readiness.',
  },
  {
    type: 'architecture_decision_record',
    label: 'Architecture Decision Record (ADR)',
    description: 'Single bounded decision with alternatives, consequences, and review triggers.',
  },
]

const schemaCache = new Map<SchemaName, Record<string, unknown>>()
const artifactSchemaCache = new Map<string, Record<string, unknown>>()
const artifactUiSchemaCache = new Map<string, Record<string, unknown>>()

function stripDraftMeta(s: Record<string, unknown>): Record<string, unknown> {
  const { $schema: _s, $id: _i, ...rest } = s as Record<string, unknown>
  return rest
}

/** Fetch a generic schema (rubric, evaluation) by name. Returns null if unavailable. */
export async function loadSchema(name: SchemaName): Promise<Record<string, unknown> | null> {
  if (schemaCache.has(name)) return schemaCache.get(name)!
  try {
    const resp = await fetch(`/api/file/standard/schemas/${name}.schema.json`)
    if (!resp.ok) return null
    const raw = (await resp.json()) as Record<string, unknown>
    const schema = stripDraftMeta(raw)
    schemaCache.set(name, schema)
    return schema
  } catch {
    return null
  }
}

function resolveArtifactPrefix(artifactType: string): string {
  return (ARTIFACT_TYPE_TO_SCHEMA as Record<string, string>)[artifactType] ?? 'reference-architecture'
}

/** Fetch the per-type artifact data schema. Returns null if unavailable. */
export async function loadArtifactSchema(
  artifactType: string,
): Promise<Record<string, unknown> | null> {
  const prefix = resolveArtifactPrefix(artifactType)
  if (artifactSchemaCache.has(prefix)) return artifactSchemaCache.get(prefix)!
  try {
    const resp = await fetch(`/api/file/standard/schemas/${prefix}.artifact.schema.json`)
    if (!resp.ok) return null
    const raw = (await resp.json()) as Record<string, unknown>
    const schema = stripDraftMeta(raw)
    artifactSchemaCache.set(prefix, schema)
    return schema
  } catch {
    return null
  }
}

/** Fetch the per-type artifact UI schema. Returns null if unavailable. */
export async function loadArtifactUiSchema(
  artifactType: string,
): Promise<Record<string, unknown> | null> {
  const prefix = resolveArtifactPrefix(artifactType)
  if (artifactUiSchemaCache.has(prefix)) return artifactUiSchemaCache.get(prefix)!
  try {
    const resp = await fetch(`/api/file/standard/schemas/${prefix}.artifact.uischema.json`)
    if (!resp.ok) return null
    const raw = (await resp.json()) as Record<string, unknown>
    artifactUiSchemaCache.set(prefix, raw)
    return raw
  } catch {
    return null
  }
}
