import Ajv from 'ajv'
import addFormats from 'ajv-formats'

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
    } catch (e) {
      console.warn('[validate] Schema compilation failed:', e)
      const failValidator = Object.assign(
        () => false,
        { errors: [{ instancePath: '', message: 'Schema compilation failed', keyword: 'schema', schemaPath: '', params: {} }] }
      ) as unknown as ReturnType<typeof ajv.compile>
      cache.set(key, failValidator)
      return failValidator
    }
  }
  return cache.get(key)!
}

export function validateData(
  data: unknown,
  schema: Record<string, unknown>,
): ValidationResult {
  const validate = getValidator(schema)
  if (!validate) return { valid: false, errors: [{ path: '(root)', message: 'Schema unavailable' }] }

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
