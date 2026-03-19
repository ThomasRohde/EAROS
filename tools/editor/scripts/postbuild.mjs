/**
 * Post-build: copy JSON schemas from standard/schemas/ into the package's
 * schemas/ directory so they're bundled and available when installed globally.
 */
import { cpSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../standard/schemas')
const dest = resolve(__dirname, '../schemas')

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('✓ Schemas copied to schemas/')
