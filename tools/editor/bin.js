#!/usr/bin/env node
import { createServer } from 'vite'
import open from 'open'
import { readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

async function validateFile(filePath) {
  const absPath = resolve(filePath)
  let content
  try {
    content = readFileSync(absPath, 'utf8')
  } catch (e) {
    console.error(`Cannot read file: ${absPath}`)
    process.exit(1)
  }

  let data
  try {
    data = yaml.load(content)
  } catch (e) {
    console.error(`YAML parse error: ${e.message}`)
    process.exit(1)
  }

  const kind = data?.kind
  const schemaFile =
    kind === 'evaluation'
      ? resolve(__dirname, 'src/schemas/evaluation.schema.json')
      : resolve(__dirname, 'src/schemas/rubric.schema.json')

  const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))

  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid) {
    console.log(`✓ ${filePath} is valid (kind: ${kind ?? 'unknown'})`)
    process.exit(0)
  } else {
    console.error(`✗ ${filePath} — ${validate.errors.length} error(s):`)
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || '(root)'} ${err.message}`)
    }
    process.exit(1)
  }
}

async function startEditor(fileArg) {
  const port = 3000
  try {
    const server = await createServer({
      root: __dirname,
      server: { port, open: false },
    })
    await server.listen()
    console.log(`EAROS Editor → http://localhost:${port}`)

    const url = fileArg
      ? `http://localhost:${port}?file=${encodeURIComponent(fileArg)}`
      : `http://localhost:${port}`

    await open(url)
    server.bindCLIShortcuts({ print: true })
  } catch (err) {
    console.error('Failed to start editor:', err.message)
    process.exit(1)
  }
}

if (args[0] === 'validate') {
  if (!args[1]) {
    console.error('Usage: earos-editor validate <file.yaml>')
    process.exit(1)
  }
  await validateFile(args[1])
} else if (args[0] === 'manifest') {
  // Delegate to src/manifest.ts via tsx (devDependency)
  const manifestTs = resolve(__dirname, 'manifest-cli.ts')
  const tsxBin = resolve(__dirname, 'node_modules/.bin/tsx')
  const result = spawnSync(tsxBin, [manifestTs, ...args.slice(1)], { stdio: 'inherit', shell: true })
  if (result.error) {
    console.error('tsx is required for the manifest command. Run: npm install')
    console.error(result.error.message)
    process.exit(1)
  }
  process.exit(result.status ?? 0)
} else {
  await startEditor(args[0])
}
