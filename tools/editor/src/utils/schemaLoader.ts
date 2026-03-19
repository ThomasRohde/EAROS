/**
 * Schema loader — fetches JSON schemas from their canonical location in
 * standard/schemas/ via the dev-server API (/api/file/...).
 *
 * Schemas are cached after the first fetch so subsequent calls are synchronous.
 * The $schema and $id fields are stripped so AJV / JSON Forms accept them.
 */

export type SchemaName = 'rubric' | 'evaluation' | 'artifact'

const cache = new Map<SchemaName, Record<string, unknown>>()

function stripDraftMeta(s: Record<string, unknown>): Record<string, unknown> {
  const { $schema: _s, $id: _i, ...rest } = s as Record<string, unknown>
  return rest
}

/** Fetch a schema by name. Returns null if the server is unavailable. */
export async function loadSchema(name: SchemaName): Promise<Record<string, unknown> | null> {
  if (cache.has(name)) return cache.get(name)!
  try {
    const resp = await fetch(`/api/file/standard/schemas/${name}.schema.json`)
    if (!resp.ok) return null
    const raw = (await resp.json()) as Record<string, unknown>
    const schema = stripDraftMeta(raw)
    cache.set(name, schema)
    return schema
  } catch {
    return null
  }
}
