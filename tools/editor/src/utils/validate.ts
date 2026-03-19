import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { loadSchema, type SchemaName } from './schemaLoader'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const ajv = new Ajv({ strict: false, allErrors: true })
addFormats(ajv)

const cache = new Map<string, ReturnType<typeof ajv.compile>>()

function getValidator(schema: Record<string, unknown>) {
  const key = (schema as any).$id ?? JSON.stringify(schema).slice(0, 80)
  if (!cache.has(key)) {
    // Strip draft-2020 $schema declaration so AJV draft-07 doesn't reject it
    const { $schema: _s, ...rest } = schema as any
    try {
      cache.set(key, ajv.compile(rest))
    } catch {
      return null
    }
  }
  return cache.get(key)!
}

/** Async convenience: fetch schema by name then validate. */
export async function validateWithSchema(
  data: unknown,
  name: SchemaName,
): Promise<ValidationResult> {
  const schema = await loadSchema(name)
  if (!schema) return { valid: true, errors: [] }
  return validateData(data, schema)
}

export function validateData(
  data: unknown,
  schema: Record<string, unknown>,
): ValidationResult {
  const validate = getValidator(schema)
  if (!validate) return { valid: true, errors: [] }

  const valid = validate(data) as boolean
  if (valid) return { valid: true, errors: [] }

  return {
    valid: false,
    errors: (validate.errors ?? []).map((e) => ({
      path: e.instancePath || '(root)',
      message: e.message ?? 'unknown error',
    })),
  }
}
