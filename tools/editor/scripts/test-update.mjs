#!/usr/bin/env node
// Integration scratch test for `earos update`.
// Usage: node tools/editor/scripts/test-update.mjs
//
// Scaffolds a temp workspace with `earos init`, mutates a governed file,
// deletes a shipped example, and exercises the three non-interactive
// modes: --dry-run, --yes-keep-mine, --yes-overwrite. Asserts the
// expected post-state after each step and cleans up on success.
//
// This is NOT a framework test — there is no test runner in tools/editor/
// today. Run manually after changes to init.ts / bin.js.

import { execFileSync, spawnSync } from 'child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const binJs = resolve(__dirname, '..', 'bin.js')

function run(args, opts = {}) {
  const r = spawnSync(process.execPath, [binJs, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })
  if (r.status !== 0 && !opts.allowFailure) {
    console.error(`FAIL: earos ${args.join(' ')} exited ${r.status}`)
    console.error(r.stdout)
    console.error(r.stderr)
    process.exit(1)
  }
  return r
}

function assert(cond, msg) {
  if (!cond) {
    console.error(`ASSERT FAILED: ${msg}`)
    process.exit(1)
  }
  console.log(`  ✓ ${msg}`)
}

const ws = mkdtempSync(join(tmpdir(), 'earos-update-test-'))
console.log(`workspace: ${ws}\n`)

try {
  console.log('1. earos init')
  run(['init', ws])
  assert(existsSync(join(ws, '.earos-version')), '.earos-version marker written by init')
  assert(existsSync(join(ws, 'profiles', 'adr.yaml')), 'adr.yaml present')
  assert(existsSync(join(ws, 'examples', 'example-adr', 'artifact.yaml')), 'shipped example present')

  console.log('\n2. mutate adr.yaml + delete shipped example')
  const adrPath = join(ws, 'profiles', 'adr.yaml')
  const originalAdr = readFileSync(adrPath, 'utf8')
  writeFileSync(adrPath, originalAdr + '\n# LOCAL EDIT\n')
  rmSync(join(ws, 'examples', 'example-adr'), { recursive: true, force: true })

  console.log('\n3. earos update --dry-run (should report 1 conflict + 1 restore, no writes)')
  const dry = run(['update', ws, '--dry-run'])
  assert(dry.stdout.includes('profiles/adr.yaml'), 'dry-run lists adr.yaml conflict')
  assert(dry.stdout.includes('examples/example-adr/artifact.yaml'), 'dry-run lists missing example')
  assert(dry.stdout.includes('Dry run — no files were changed'), 'dry-run footer present')
  assert(readFileSync(adrPath, 'utf8').includes('LOCAL EDIT'), 'dry-run did not touch adr.yaml')
  assert(!existsSync(join(ws, 'examples', 'example-adr')), 'dry-run did not restore example')

  console.log('\n4. earos update --yes-keep-mine (preserves mutation, skips restore)')
  run(['update', ws, '--yes-keep-mine'])
  assert(readFileSync(adrPath, 'utf8').includes('LOCAL EDIT'), '--yes-keep-mine preserved the local edit')
  assert(!existsSync(join(ws, 'examples', 'example-adr')), '--yes-keep-mine did not restore example')

  console.log('\n5. earos update --yes-overwrite (reverts mutation, restores example)')
  run(['update', ws, '--yes-overwrite'])
  assert(!readFileSync(adrPath, 'utf8').includes('LOCAL EDIT'), '--yes-overwrite reverted the local edit')
  assert(existsSync(join(ws, 'examples', 'example-adr', 'artifact.yaml')), '--yes-overwrite restored example')

  console.log('\n6. non-TTY refusal (no batch flag, stdin not a TTY)')
  const refused = run(['update', ws], { allowFailure: true })
  assert(refused.status === 1, 'non-TTY interactive mode exits 1')
  assert(refused.stderr.includes('not a TTY') || refused.stderr.includes('interactive'), 'error message mentions TTY / interactive')

  console.log('\n7. flag exclusivity')
  const dup = run(['update', ws, '--dry-run', '--yes-overwrite'], { allowFailure: true })
  assert(dup.status === 1, 'conflicting flags exit 1')

  console.log('\n8. manifest still consistent')
  const mcheck = run(['manifest', 'check'], { cwd: ws, env: { ...process.env, EAROS_REPO_ROOT: ws } })
  assert(mcheck.stdout.includes('consistent') || mcheck.status === 0, 'manifest check passes')

  console.log('\n✅ all assertions passed')
} finally {
  rmSync(ws, { recursive: true, force: true })
}
